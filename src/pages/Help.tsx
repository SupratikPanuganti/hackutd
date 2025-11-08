import { TopNav } from "@/components/TopNav";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { faqs } from "@/lib/mockData";
import { MessageSquare, Book, Phone, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Help = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />
      
      <main className="flex-1">
        <section className="py-12 bg-muted">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">How Can We Help?</h1>
              <p className="text-xl text-muted-foreground mb-8">
                Get instant support from our AI assistant or browse our help resources
              </p>
              <Link to="/assist">
                <Button size="lg" data-testid="start-help">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Start Troubleshooting
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Quick Help Options */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>AI Assistant</CardTitle>
                  <CardDescription>
                    Get instant help with network issues, device setup, and more
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to="/assist">
                    <Button variant="ghost" className="group">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                    <Book className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Knowledge Base</CardTitle>
                  <CardDescription>
                    Browse articles and guides for device setup and troubleshooting
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="group">
                    Browse Articles
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Contact Support</CardTitle>
                  <CardDescription>
                    Speak with a support representative for complex issues
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="group">
                    Call Us
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 bg-muted">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, idx) => (
                  <AccordionItem key={idx} value={`item-${idx}`}>
                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                    <AccordionContent>{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Help;
