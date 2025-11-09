import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bot, Minimize2 } from "lucide-react";
import { useAgentic } from "@/contexts/AgenticContext";
import { ConversationPanel } from "@/components/assist/ConversationPanel";
import { cn } from "@/lib/utils";

const getContextualGreeting = (path: string): string => {
  switch (path) {
    case "/plans":
      return "Need help choosing the perfect plan?";
    case "/devices":
      return "Questions about device compatibility?";
    case "/status":
      return "Experiencing connectivity issues?";
    case "/help":
      return "How can I assist you today?";
    default:
      return "Hi! How can I help you today?";
  }
};

export const FloatingAssistant = () => {
  const { isEnabled, isAssistantOpen, toggleAssistant, closeAssistant, currentContext, sessionId } = useAgentic();
  const [shouldPulse, setShouldPulse] = useState(false);
  const [initialQuestion, setInitialQuestion] = useState<string>("");

  useEffect(() => {
    if (!isEnabled || isAssistantOpen) {
      setShouldPulse(false);
      return;
    }

    const timer = setTimeout(() => {
      setShouldPulse(true);
    }, 30000); // Pulse after 30 seconds of inactivity

    return () => clearTimeout(timer);
  }, [isEnabled, isAssistantOpen, currentContext]);

  useEffect(() => {
    if (isAssistantOpen) {
      setInitialQuestion(getContextualGreeting(currentContext));
    }
  }, [currentContext, isAssistantOpen]);

  if (!isEnabled) {
    return null;
  }

  return (
    <>
      {/* Floating Button */}
      {!isAssistantOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={toggleAssistant}
            size="lg"
            className={cn(
              "rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-all",
              shouldPulse && "animate-pulse"
            )}
          >
            <Bot className="h-6 w-6" />
          </Button>
        </div>
      )}

      {/* Expanded Assistant Panel */}
      {isAssistantOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[400px] h-[600px] max-h-[80vh]">
          <Card className="h-full flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Transcript</h3>
                  <p className="text-xs text-muted-foreground">Conversation history</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeAssistant}
                  className="h-8 w-8"
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Conversation Panel */}
            <div className="flex-1 overflow-hidden">
              <ConversationPanel
                sessionId={sessionId}
                initialQuestion={initialQuestion}
                isFloating={true}
                readOnly={true}
              />
            </div>
          </Card>
        </div>
      )}
    </>
  );
};
