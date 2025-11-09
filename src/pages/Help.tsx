import { useRef, useState } from "react";
import { TopNav } from "@/components/TopNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TicketDialog } from "@/components/assist/TicketDialog";
import { ConversationPanel } from "@/components/assist/ConversationPanel";
import { useAgentic } from "@/contexts/AgenticContext";
import { Badge } from "@/components/ui/badge";

const Help = () => {
  const { sessionId } = useAgentic();
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
  const [ticketInitialIssue, setTicketInitialIssue] = useState("");
  const [initialPrompt, setInitialPrompt] = useState<string | undefined>();
  const [promptSignal, setPromptSignal] = useState(0);
  const conversationRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    "My internet isn't working",
    "Check network status near me",
    "I can't make calls",
    "Slow data speeds",
    "Help me enable Wi-Fi calling",
    "International roaming setup",
  ];

  const handleOpenTicket = (issue = "") => {
    setTicketInitialIssue(issue);
    setTicketDialogOpen(true);
  };

  const handleAssistantPrompt = (prompt: string) => {
    setInitialPrompt(prompt);
    setPromptSignal((value) => value + 1);
    queueMicrotask(() => {
      conversationRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const supportCards = [
    {
      title: "Network Diagnostics",
      description: "Run automated tests and check nearby tower health in seconds.",
      cta: "Run network check",
      action: () => handleAssistantPrompt("Can you run a network diagnostic for my line?"),
    },
    {
      title: "Device & SIM Setup",
      description: "Get step-by-step guidance for new devices, eSIM, or SIM swaps.",
      cta: "Start device setup",
      action: () => handleAssistantPrompt("Help me set up my device and SIM card."),
    },
    {
      title: "Talk to a Specialist",
      description: "Open a support ticket with full context for our care team.",
      cta: "Open support ticket",
      action: () => handleOpenTicket("Need to speak with a support specialist"),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#5A0040]">
      <TopNav />

      <main className="flex-1 relative pb-16">
        <section className="py-8 pt-24">
          <div className="container mx-auto px-4 space-y-8">
            <Card className="rounded-2xl border-white/20 shadow-2xl backdrop-blur-xl bg-white/10">
              <CardHeader className="pb-2 md:pb-4">
                <CardTitle className="text-2xl font-semibold text-white drop-shadow-md">Popular Questions</CardTitle>
                <CardDescription className="text-white/85">
                  Tap a prompt to let Tee run diagnostics and guide you through the right fix.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {quickPrompts.map((prompt) => (
                    <Badge
                      key={prompt}
                      variant="outline"
                      className="cursor-pointer bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30 backdrop-blur-sm rounded-xl px-3 py-1.5 transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"
                      onClick={() => handleAssistantPrompt(prompt)}
                    >
                      {prompt}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-3">
              {supportCards.map((card) => (
                <Card
                  key={card.title}
                  className="rounded-2xl border-white/20 shadow-2xl backdrop-blur-xl bg-white/10 hover:bg-white/15 transition-all duration-300 hover:shadow-3xl"
                >
                  <CardHeader>
                    <CardTitle className="text-2xl text-white drop-shadow-md">{card.title}</CardTitle>
                    <CardDescription className="text-white/85">
                      {card.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30 backdrop-blur-sm"
                      onClick={card.action}
                    >
                      {card.cta}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* AI Chatbot */}
        <section className="py-12" ref={conversationRef}>
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-6 text-center text-white drop-shadow-md">Chat with AI Assistant</h2>
              <p className="text-center text-white/90 mb-8 drop-shadow-md">
                Get instant help with network issues, device setup, and troubleshooting
              </p>
              <Card className="h-[600px] rounded-2xl border-white/20 shadow-2xl backdrop-blur-xl bg-white/10">
                <ConversationPanel
                  sessionId={sessionId}
                  initialQuestion={initialPrompt}
                  questionSignal={promptSignal}
                />
              </Card>
            </div>
          </div>
        </section>

        {/* Fallback Support */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <Card className="rounded-2xl border-white/20 shadow-2xl backdrop-blur-xl bg-white/10">
                <CardHeader>
                  <div className="text-5xl mx-auto mb-4 text-center">🆘</div>
                  <CardTitle className="text-center text-white drop-shadow-md">Still Need Help?</CardTitle>
                  <CardDescription className="text-center text-white/90">
                    If our AI assistant can't resolve your issue, open a support ticket and our team will help you directly
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="w-full rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30 backdrop-blur-sm"
                    onClick={() => handleOpenTicket()}
                  >
                    Open Support Ticket
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <TicketDialog 
        open={ticketDialogOpen} 
        onOpenChange={setTicketDialogOpen}
        initialIssue={ticketInitialIssue}
      />
    </div>
  );
};

export default Help;
