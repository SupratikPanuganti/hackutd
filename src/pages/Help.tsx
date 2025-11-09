import { useState } from "react";
import { TopNav } from "@/components/TopNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, LifeBuoy } from "lucide-react";
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
    <div className="min-h-screen flex flex-col">
      <TopNav />
      
      <main className="flex-1">
        <section className="py-12 bg-muted">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <MessageSquare className="h-16 w-16 mx-auto mb-6 text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold mb-4">AI Support Assistant</h1>
              <p className="text-xl text-muted-foreground mb-8">
                Get instant help with network issues, device setup, and troubleshooting
              </p>
            </div>
          </div>
        </section>

        {/* AI Chatbot */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-6 text-center">Chat with AI Assistant</h2>
              <p className="text-center text-muted-foreground mb-8">
                Get instant help with network issues, device setup, and troubleshooting
              </p>
              <Card className="h-[600px]">
                <ConversationPanel sessionId={sessionId} />
              </Card>
            </div>
          </div>
        </section>

        {/* Fallback Support */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <Card>
                <CardHeader>
                  <LifeBuoy className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <CardTitle>Still Need Help?</CardTitle>
                  <CardDescription>
                    If our AI assistant can't resolve your issue, open a support ticket and our team will help you directly
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    size="lg"
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
