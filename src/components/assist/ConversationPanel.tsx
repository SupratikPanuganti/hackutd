import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EvidenceChips } from "./EvidenceChips";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  evidence?: Array<{ label: string; href: string; kind: "status" | "logs" | "ticket" | "kb" }>;
}

interface ConversationPanelProps {
  sessionId: string;
  onStateChange?: (state: string) => void;
  initialQuestion?: string;
  isFloating?: boolean;
  readOnly?: boolean;
}

const quickPrompts = [
  "My internet isn't working",
  "Check network status",
  "I can't make calls",
  "Slow data speeds",
];

export const ConversationPanel = ({ sessionId, onStateChange, initialQuestion, isFloating, readOnly = false }: ConversationPanelProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm here to help troubleshoot your connectivity issues. What seems to be the problem?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Handle initial question from Help page
  useEffect(() => {
    if (initialQuestion) {
      handleSend(initialQuestion);
    }
  }, [initialQuestion]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response with evidence
    setTimeout(() => {
      const assistantMessage: Message = {
        role: "assistant",
        content: "I've checked your network status. It looks like there's an issue with tower eNB-123 in your area. Let me guide you through some troubleshooting steps.",
        evidence: [
          { label: "View tower status", href: "/status?zip=30332&tower=eNB-123", kind: "status" },
          { label: "See test log", href: "/logs?session=" + sessionId, kind: "logs" },
        ],
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
      onStateChange?.("CHECK_STATUS");
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, idx) => (
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
                <p className="text-sm drop-shadow-sm" role={message.role === "assistant" ? "status" : undefined} aria-live={message.role === "assistant" ? "polite" : undefined}>
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
        <div ref={messagesEndRef} />
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
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              data-testid="voice-toggle"
              className={cn(
                "rounded-xl px-3 backdrop-blur-sm transition-all duration-300",
                voiceEnabled
                  ? "bg-white/20 hover:bg-white/30 text-white border border-white/30 shadow-lg"
                  : "bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30"
              )}
            >
              🎤
            </Button>
            <Button
              size="sm"
              variant={cameraEnabled ? "default" : "outline"}
              onClick={() => setCameraEnabled(!cameraEnabled)}
              data-testid="cam-toggle"
              className={cn(
                "rounded-xl px-3 backdrop-blur-sm transition-all duration-300",
                cameraEnabled
                  ? "bg-white/20 hover:bg-white/30 text-white border border-white/30 shadow-lg"
                  : "bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30"
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
