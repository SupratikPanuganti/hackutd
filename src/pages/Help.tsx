import { useState } from "react";
import { TopNav } from "@/components/TopNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TicketDialog } from "@/components/assist/TicketDialog";
import { ConversationPanel } from "@/components/assist/ConversationPanel";
import { useAgentic } from "@/contexts/AgenticContext";

const Help = () => {
  const { sessionId } = useAgentic();
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
  const [ticketInitialIssue, setTicketInitialIssue] = useState("");

  const handleOpenTicket = (issue = "") => {
    setTicketInitialIssue(issue);
    setTicketDialogOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#5A0040]">
      <TopNav />
      
      <main className="flex-1 relative">
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <div className="text-6xl mb-6">💬</div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white drop-shadow-lg">AI Support Assistant</h1>
              <p className="text-xl text-white/90 mb-8 drop-shadow-md">
                Get instant help with network issues, device setup, and troubleshooting
              </p>
            </div>
          </div>
        </section>

        {/* AI Chatbot */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-6 text-center text-white drop-shadow-md">Chat with AI Assistant</h2>
              <p className="text-center text-white/90 mb-8 drop-shadow-md">
                Get instant help with network issues, device setup, and troubleshooting
              </p>
              <Card className="h-[600px] rounded-2xl border-white/20 shadow-2xl backdrop-blur-xl bg-white/10">
                <ConversationPanel sessionId={sessionId} />
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
