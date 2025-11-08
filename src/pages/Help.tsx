import { useState } from "react";
import { TopNav } from "@/components/TopNav";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send, LifeBuoy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TicketDialog } from "@/components/assist/TicketDialog";

const quickQuestions = [
  "I'm having trouble connecting to the network",
  "My data isn't working",
  "How do I enable Wi-Fi calling?",
  "Why is my phone not sending texts?",
  "I need help with international roaming",
  "My 5G isn't working",
];

const Help = () => {
  const navigate = useNavigate();
  const [customQuestion, setCustomQuestion] = useState("");
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
  const [ticketInitialIssue, setTicketInitialIssue] = useState("");

  const handleQuestionSelect = (question: string) => {
    navigate("/assist", { state: { initialQuestion: question } });
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customQuestion.trim()) {
      navigate("/assist", { state: { initialQuestion: customQuestion } });
    }
  };

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

        {/* Quick Questions */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-6 text-center">Quick Questions</h2>
              <p className="text-center text-muted-foreground mb-8">
                Select a common issue to start troubleshooting with our AI assistant
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {quickQuestions.map((question, idx) => (
                  <Card 
                    key={idx} 
                    className="cursor-pointer hover:shadow-lg transition-all hover:border-primary"
                    onClick={() => handleQuestionSelect(question)}
                  >
                    <CardContent className="p-6">
                      <p className="text-foreground">{question}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Custom Question */}
        <section className="py-12 bg-muted">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Have a Different Question?</CardTitle>
                  <CardDescription>
                    Describe your issue and our AI assistant will help you troubleshoot
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCustomSubmit} className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type your question here..."
                        value={customQuestion}
                        onChange={(e) => setCustomQuestion(e.target.value)}
                        className="flex-1"
                      />
                      <Button type="submit" disabled={!customQuestion.trim()}>
                        <Send className="h-4 w-4 mr-2" />
                        Ask AI
                      </Button>
                    </div>
                  </form>
                </CardContent>
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

      <Footer />
      <TicketDialog 
        open={ticketDialogOpen} 
        onOpenChange={setTicketDialogOpen}
        initialIssue={ticketInitialIssue}
      />
    </div>
  );
};

export default Help;
