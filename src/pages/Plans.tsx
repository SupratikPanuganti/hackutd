import { TopNav } from "@/components/TopNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { plans } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import LiquidEther from "@/components/LiquidEther";

const Plans = () => {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Full Page Three.js Background */}
      <div className="fixed inset-0 z-0 bg-black">
        <LiquidEther
          colors={['#000000', '#5A0040', '#E20074']}
          mouseForce={20}
          cursorSize={100}
          isViscous={false}
          viscous={30}
          iterationsViscous={32}
          iterationsPoisson={32}
          resolution={0.5}
          isBounce={false}
          autoDemo={true}
          autoSpeed={0.5}
          autoIntensity={2.2}
          takeoverDuration={0.25}
          autoResumeDelay={3000}
          autoRampDuration={0.6}
        />
      </div>

      {/* Gradient Overlay for Depth */}
      <div className="fixed inset-0 z-[1] bg-gradient-to-b from-[#5A0040]/20 via-transparent to-[#E20074]/30 pointer-events-none" />

      <div className="relative z-10 flex flex-col">
        <TopNav />

        <main className="flex-1 relative">
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white drop-shadow-lg">Choose Your Perfect Plan</h1>
              <p className="text-xl text-white/90 drop-shadow-md">
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
                  className={cn(
                    "rounded-2xl border-white/20 shadow-2xl backdrop-blur-xl bg-white/10 transition-all duration-300",
                    plan.popular ? "border-white/30 shadow-[0_8px_32px_0_rgba(255,255,255,0.2)] hover:bg-white/15" : "hover:shadow-xl hover:bg-white/15 hover:scale-105"
                  )}
                >
                  {plan.popular && (
                    <div className="bg-white/20 text-white text-center py-2 rounded-t-2xl font-semibold backdrop-blur-sm border-b border-white/20">
                      Most Popular
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-2xl text-white drop-shadow-md">{plan.name}</CardTitle>
                    <CardDescription className="text-3xl font-bold text-white mt-2 drop-shadow-md">
                      ${plan.price}<span className="text-base text-white/80">/mo</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-white shrink-0 mt-0.5">✓</span>
                          <span className="text-sm text-white/90">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className={cn(
                        "w-full rounded-xl backdrop-blur-md transition-all duration-300",
                        plan.popular 
                          ? "bg-white/20 hover:bg-white/30 text-white border border-white/30 shadow-lg hover:shadow-xl" 
                          : "bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30"
                      )}
                    >
                      {plan.popular ? "Get Started" : "Add Line"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <Card className="rounded-2xl border-white/20 shadow-2xl backdrop-blur-xl bg-white/10 p-8">
                <h2 className="text-3xl font-bold mb-8 text-center text-white drop-shadow-lg">Frequently Asked Questions</h2>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1" className="border-white/20">
                    <AccordionTrigger className="text-white hover:text-white/90">Can I switch plans anytime?</AccordionTrigger>
                    <AccordionContent className="text-white/90">
                      Yes! You can change your plan at any time. The new plan will take effect at the start of your next billing cycle.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2" className="border-white/20">
                    <AccordionTrigger className="text-white hover:text-white/90">What's included with unlimited data?</AccordionTrigger>
                    <AccordionContent className="text-white/90">
                      All our plans include unlimited talk, text, and data. Premium data amounts vary by plan, after which speeds may be reduced during congestion.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3" className="border-white/20">
                    <AccordionTrigger className="text-white hover:text-white/90">Do you offer family discounts?</AccordionTrigger>
                    <AccordionContent className="text-white/90">
                      Yes! Add additional lines and save. Each additional line gets progressively discounted. Contact us for family plan pricing.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-4" className="border-white/20">
                    <AccordionTrigger className="text-white hover:text-white/90">Is 5G included in all plans?</AccordionTrigger>
                    <AccordionContent className="text-white/90">
                      Absolutely! All our plans include access to our nationwide 5G network at no extra cost. Just make sure your device supports 5G.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </Card>
            </div>
          </div>
        </section>
        </main>
      </div>
    </div>
  );
};

export default Plans;
