import { TopNav } from "@/components/TopNav";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { plans } from "@/lib/mockData";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Plans = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />
      
      <main className="flex-1">
        <section className="py-12 bg-muted">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Choose Your Perfect Plan</h1>
              <p className="text-xl text-muted-foreground">
                All plans include unlimited talk, text, and 5G data
              </p>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {plans.map((plan) => (
                <Card
                  key={plan.id}
                  className={plan.popular ? "border-primary shadow-lg" : ""}
                >
                  {plan.popular && (
                    <div className="bg-primary text-primary-foreground text-center py-2 rounded-t-2xl font-semibold">
                      Most Popular
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription className="text-3xl font-bold text-foreground mt-2">
                      ${plan.price}<span className="text-base text-muted-foreground">/mo</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-success shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className="w-full" 
                      variant={plan.popular ? "default" : "outline"}
                    >
                      {plan.popular ? "Get Started" : "Add Line"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Can I switch plans anytime?</AccordionTrigger>
                  <AccordionContent>
                    Yes! You can change your plan at any time. The new plan will take effect at the start of your next billing cycle.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>What's included with unlimited data?</AccordionTrigger>
                  <AccordionContent>
                    All our plans include unlimited talk, text, and data. Premium data amounts vary by plan, after which speeds may be reduced during congestion.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>Do you offer family discounts?</AccordionTrigger>
                  <AccordionContent>
                    Yes! Add additional lines and save. Each additional line gets progressively discounted. Contact us for family plan pricing.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger>Is 5G included in all plans?</AccordionTrigger>
                  <AccordionContent>
                    Absolutely! All our plans include access to our nationwide 5G network at no extra cost. Just make sure your device supports 5G.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Plans;
