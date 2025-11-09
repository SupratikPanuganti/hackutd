import { useState, useRef, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EvidenceChips } from "./EvidenceChips";
import { cn } from "@/lib/utils";
import { useAgentic } from "@/contexts/AgenticContext";
import { useMediaPermissions } from "@/hooks/useMediaPermissions";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Mic, ArrowDown } from "lucide-react";
import type Vapi from "@vapi-ai/web";
import {
  getVapiClient,
  startVoiceCall,
  stopVoiceCall,
  logVapiDebug,
  logVapiWarn,
  logVapiError,
} from "@/lib/vapiClient";

interface Message {
  role: "user" | "assistant";
  content: string;
  evidence?: Array<{ label: string; href: string; kind: "status" | "logs" | "ticket" | "kb" }>;
}

interface ConversationPanelProps {
  sessionId: string;
  onStateChange?: (state: string) => void;
  initialQuestion?: string;
  questionSignal?: number;
  isFloating?: boolean;
  readOnly?: boolean;
  autoStartVoice?: boolean;
}

const quickPrompts = ["My internet isn't working", "Check network status", "I can't make calls", "Slow data speeds"];

// --- Local persistence helpers ---
const STORAGE_KEY_V = "tee.chat.v1";
const storageKey = (sessionId: string) => `${STORAGE_KEY_V}:${sessionId}`;
const MAX_MSG = 300; // prevent unbounded growth

type StoredPayload = {
  version: number;
  messages: Message[];
  savedAt: number;
};

function clampMessages(list: Message[]) {
  return list.length > MAX_MSG ? list.slice(list.length - MAX_MSG) : list;
}

function loadMessages(sessionId: string): Message[] | null {
  try {
    const raw = localStorage.getItem(storageKey(sessionId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredPayload;
    if (parsed?.version !== 1 || !Array.isArray(parsed?.messages)) return null;
    return parsed.messages;
  } catch {
    return null;
  }
}

function saveMessages(sessionId: string, messages: Message[]) {
  try {
    const payload: StoredPayload = { version: 1, messages: clampMessages(messages), savedAt: Date.now() };
    localStorage.setItem(storageKey(sessionId), JSON.stringify(payload));
  } catch {
    // storage might be full or blocked; fail silently
  }
}

export const ConversationPanel = ({
  sessionId,
  onStateChange,
  initialQuestion,
  questionSignal = 0,
  isFloating,
  readOnly = false,
  autoStartVoice = false,
}: ConversationPanelProps) => {
  // Messages are null until hydration completes
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Voice state
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isVoiceTransitioning, setIsVoiceTransitioning] = useState(false);

  // Camera toggle (UI only here)
  const [cameraEnabled, setCameraEnabled] = useState(false);

  // ---- Opt-in autoscroll state ----
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showNew, setShowNew] = useState(false);

  // Track whether the *last* append came from the user (we’ll always scroll when user sends)
  const lastAppendFromUserRef = useRef(false);

  const vapiClientRef = useRef<Vapi | null>(null);
  const detachVoiceListenersRef = useRef<(() => void) | null>(null);
  const autoStartTriggeredRef = useRef(false);
  const hydratedRef = useRef(false);

  const { currentContext } = useAgentic();
  const { requestMicrophone } = useMediaPermissions();

  // Hydrate on mount / session change
  useEffect(() => {
    const restored = loadMessages(sessionId);
    if (restored && restored.length) {
      setMessages(restored);
    } else {
      setMessages([
        { role: "assistant", content: "Welcome! I'm Tee, your AI support assistant. How can I help you today?" },
      ]);
    }
    hydratedRef.current = true;
  }, [sessionId]);

  // Persist with light debounce whenever messages change
  useEffect(() => {
    if (!hydratedRef.current || messages === null) return;
    const id = setTimeout(() => saveMessages(sessionId, messages), 250);
    return () => clearTimeout(id);
  }, [messages, sessionId]);

  // Initial question (waits for hydration)
  useEffect(() => {
    logVapiDebug("ConversationPanel initial question effect", {
      sessionId,
      initialQuestion,
      questionSignal,
      isFloating,
      readOnly,
    });
    if (!hydratedRef.current || messages === null) return;
    if (initialQuestion) {
      handleSend(initialQuestion);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuestion, questionSignal, messages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      logVapiDebug("ConversationPanel unmount cleanup");
      detachVoiceListenersRef.current?.();
      detachVoiceListenersRef.current = null;
      vapiClientRef.current = null;
      stopVoiceCall().catch(() => { });
    };
  }, []);

  const buildVoiceContextPayload = () => {
    const transcript = (messages ?? []).map((m) => `${m.role.toUpperCase()}: ${m.content}`);
    return [
      `Session ID: ${sessionId}`,
      `Current Route: ${currentContext}`,
      `Transcript History:\n${transcript.join("\n") || "No prior messages."}`,
    ].join("\n\n");
  };

  const detachVoiceListeners = () => {
    logVapiDebug("Detaching voice listeners");
    detachVoiceListenersRef.current?.();
    detachVoiceListenersRef.current = null;
    vapiClientRef.current = null;
  };

  const handleVoiceCallEnd = () => {
    logVapiDebug("Voice call end observed");
    detachVoiceListeners();
    setVoiceEnabled(false);
    setIsVoiceTransitioning(false);
  };

  const handleVoiceToggle = async () => {
    logVapiDebug("Voice toggle invoked", { voiceEnabled, isVoiceTransitioning });
    if (isVoiceTransitioning) return;

    if (voiceEnabled) {
      setIsVoiceTransitioning(true);
      try {
        detachVoiceListeners();
        await stopVoiceCall();
      } catch (error) {
        logVapiError("Unable to stop voice call", error);
        toast({
          title: "Voice call",
          description: "We couldn't properly disconnect the voice assistant. Please refresh if the issue persists.",
        });
      } finally {
        setVoiceEnabled(false);
        setIsVoiceTransitioning(false);
      }
      return;
    }

    setIsVoiceTransitioning(true);
    try {
      const micGranted = await requestMicrophone();
      logVapiDebug("Microphone permission result", { micGranted });

      if (!micGranted) {
        logVapiWarn("Microphone permission denied");
        toast({
          title: "Microphone access needed",
          description: "Please allow microphone permissions to enable Voice AI.",
        });
        return;
      }

      const contextPayload = buildVoiceContextPayload();
      await startVoiceCall(undefined, contextPayload);

      const client = getVapiClient();
      vapiClientRef.current = client;

      const handleError = (error: unknown) => {
        logVapiError("Voice assistant error", error);
        toast({
          title: "Voice assistant issue",
          description: "The voice assistant encountered a problem and has been stopped.",
        });
        handleVoiceCallEnd();
      };

      client.on("call-end", handleVoiceCallEnd);
      client.on("error", handleError);
      client.on("call-start-failed", handleError);

      detachVoiceListenersRef.current = () => {
        client.removeListener("call-end", handleVoiceCallEnd);
        client.removeListener("error", handleError);
        client.removeListener("call-start-failed", handleError);
      };

      setVoiceEnabled(true);
    } catch (error) {
      logVapiError("Unable to start voice call", error);
      const description = error instanceof Error ? error.message : "An unexpected error occurred while enabling voice.";
      toast({ title: "Voice assistant", description });
      await stopVoiceCall().catch(() => logVapiWarn("stopVoiceCall rejected after start failure"));
      setVoiceEnabled(false);
    } finally {
      setIsVoiceTransitioning(false);
    }
  };

  // ---- Scroll helpers ----
  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: "end" });
  };

  // Update isAtBottom on scroll (with small threshold)
  const handleScroll: React.UIEventHandler<HTMLDivElement> = (e) => {
    const el = e.currentTarget;
    const threshold = 24; // px
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;
    setIsAtBottom(atBottom);
    if (atBottom) setShowNew(false);
  };

  // When messages change:
  // - If user just sent (lastAppendFromUserRef), always jump to bottom.
  // - Else only autoscroll if currently at bottom.
  useEffect(() => {
    if (messages === null) return;
    if (lastAppendFromUserRef.current || isAtBottom) {
      const behavior = lastAppendFromUserRef.current ? "instant" : "smooth";
      scrollToBottom(behavior as ScrollBehavior);
      lastAppendFromUserRef.current = false;
      setShowNew(false);
    } else {
      setShowNew(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  // Auto-start voice if requested
  useEffect(() => {
    if (readOnly || !autoStartVoice || autoStartTriggeredRef.current || voiceEnabled || isVoiceTransitioning) return;
    autoStartTriggeredRef.current = true;
    void handleVoiceToggle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStartVoice, isVoiceTransitioning, readOnly, voiceEnabled]);

  const handleSend = async (text?: string) => {
    if (messages === null) return; // not hydrated yet
    const messageText = text ?? input;
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: messageText };
    setMessages((prev) => (prev ? [...prev, userMessage] : [userMessage]));
    setInput("");

    // Mark that the latest append was user-initiated so we force-scroll
    lastAppendFromUserRef.current = true;

    setIsLoading(true);

    // Simulated assistant response
    setTimeout(() => {
      const assistantMessage: Message = {
        role: "assistant",
        content:
          "I've checked your network status. It looks like there's an issue with tower eNB-123 in your area. Let me guide you through some troubleshooting steps.",
        evidence: [
          { label: "View tower status", href: "/status?zip=30332&tower=eNB-123", kind: "status" },
          { label: "See test log", href: "/logs?session=" + sessionId, kind: "logs" },
        ],
      };
      setMessages((prev) => (prev ? [...prev, assistantMessage] : [assistantMessage]));
      setIsLoading(false);
      onStateChange?.("CHECK_STATUS");
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="relative flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages === null && (
          <div className="flex justify-start p-4 text-white/80 text-sm">Loading chat…</div>
        )}

        {messages?.map((message, idx) => (
          <div key={idx} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
            <div className={cn("max-w-[80%]", message.role === "user" ? "ml-auto" : "mr-auto")}>
              <Card
                className={cn(
                  "p-3 rounded-xl backdrop-blur-xl shadow-lg transition-all duration-300",
                  message.role === "user"
                    ? "bg-white/20 text-white border border-white/30 hover:bg-white/25"
                    : "bg-white/10 text-white border border-white/20 hover:bg-white/15"
                )}
              >
                <p
                  className="text-sm drop-shadow-sm"
                  role={message.role === "assistant" ? "status" : undefined}
                  aria-live={message.role === "assistant" ? "polite" : undefined}
                >
                  {message.content}
                </p>
              </Card>
              {message.evidence && <EvidenceChips items={message.evidence} />}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <Card className="p-3 bg-white/10 border border-white/20 rounded-xl backdrop-blur-xl shadow-lg">
              <span className="animate-pulse text-white">...</span>
            </Card>
          </div>
        )}

        {/* Sentinel for smooth bottom scrolls */}
        <div ref={messagesEndRef} />

        {/* Floating "New messages" button */}
        {showNew && (
          <div className="sticky bottom-4 flex justify-center pointer-events-none">
            <Button
              size="sm"
              variant="outline"
              className="pointer-events-auto rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-sm shadow-lg"
              onClick={() => scrollToBottom("smooth")}
            >
              <ArrowDown className="h-4 w-4 mr-1" />
              New messages
            </Button>
          </div>
        )}
      </div>

      {/* Quick Prompts and Composer - Hidden in read-only mode */}
      {!readOnly && (
        <div className="p-4 border-t border-white/20">
          <div className="flex flex-wrap gap-2 mb-3">
            {quickPrompts.map((prompt, idx) => (
              <Badge
                key={idx}
                variant="outline"
                className="cursor-pointer bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30 backdrop-blur-sm rounded-xl px-3 py-1.5 transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"
                onClick={() => handleSend(prompt)}
              >
                {prompt}
              </Badge>
            ))}
          </div>

          {/* Composer */}
          <div className="flex gap-2">
            <Input
              placeholder="Describe your issue..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              data-testid="composer-input"
              className="flex-1 rounded-xl border-white/30 bg-white/20 backdrop-blur-sm text-white placeholder:text-white/60 focus:border-white/50 focus:ring-white/30 focus:bg-white/25"
            />
            <Button
              size="sm"
              variant={voiceEnabled ? "default" : "outline"}
              onClick={() => void handleVoiceToggle()}
              disabled={isVoiceTransitioning}
              data-testid="voice-toggle"
              className={cn(
                "rounded-xl px-3 backdrop-blur-sm transition-all duration-300",
                voiceEnabled
                  ? "bg-white/20 hover:bg-white/30 text-white border border-white/30 shadow-lg"
                  : "bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30"
              )}
            >
              {isVoiceTransitioning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mic className="h-4 w-4" />}
              🎤
            </Button>
            <Button
              size="sm"
              variant={cameraEnabled ? "default" : "outline"}
              onClick={() => setCameraEnabled((v) => !v)}
              data-testid="cam-toggle"
              className={cn(
                "rounded-xl px-3 backdrop-blur-sm transition-all duration-300",
                cameraEnabled
                  ? "bg-white/20 hover:bg-white/30 text-white border border-white/30 shadow-lg"
                  : "bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30"
              )}
            >
              📹
            </Button>
            <Button
              size="sm"
              onClick={() => handleSend()}
              data-testid="send-btn"
              className="rounded-xl px-3 bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300"
            >
              →
            </Button>
          </div>

          {cameraEnabled && (
            <p className="text-xs text-white/80 mt-2 drop-shadow-sm">
              Camera access requested. We'll analyze your device display to help diagnose issues.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
