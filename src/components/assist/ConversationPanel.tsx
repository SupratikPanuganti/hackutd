import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, Mic, Video, Loader2 } from "lucide-react";
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
}

const quickPrompts = [
  "My internet isn't working",
  "Check network status",
  "I can't make calls",
  "Slow data speeds",
];

export const ConversationPanel = ({ sessionId, onStateChange, initialQuestion, isFloating }: ConversationPanelProps) => {
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
                  "p-3",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border-t-2 border-t-primary"
                )}
              >
                <p className="text-sm" role={message.role === "assistant" ? "status" : undefined} aria-live={message.role === "assistant" ? "polite" : undefined}>
                  {message.content}
                </p>
              </Card>
              {message.evidence && <EvidenceChips items={message.evidence} />}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <Card className="p-3 bg-card border-t-2 border-t-primary">
              <Loader2 className="h-4 w-4 animate-spin" />
            </Card>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="p-4 border-t border-border">
        <div className="flex flex-wrap gap-2 mb-3">
          {quickPrompts.map((prompt, idx) => (
            <Badge
              key={idx}
              variant="outline"
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
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
          />
          <Button
            size="icon"
            variant={voiceEnabled ? "default" : "outline"}
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            data-testid="voice-toggle"
          >
            <Mic className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant={cameraEnabled ? "default" : "outline"}
            onClick={() => setCameraEnabled(!cameraEnabled)}
            data-testid="cam-toggle"
          >
            <Video className="h-4 w-4" />
          </Button>
          <Button size="icon" onClick={() => handleSend()} data-testid="send-btn">
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {cameraEnabled && (
          <p className="text-xs text-muted-foreground mt-2">
            Camera access requested. We'll analyze your device display to help diagnose issues.
          </p>
        )}
      </div>
    </div>
  );
};
