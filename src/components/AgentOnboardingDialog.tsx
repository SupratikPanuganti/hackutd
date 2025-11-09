import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAgentic } from "@/contexts/AgenticContext";
import { useToast } from "@/hooks/use-toast";

const AGENT_ONBOARDING_KEY = "tcare_agent_onboarding_seen";

export const AgentOnboardingDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { enableAgenticMode, startVoiceAssistant } = useAgentic();
  const { toast } = useToast();
  const [isEnabling, setIsEnabling] = useState(false);

  useEffect(() => {
    // Check if user has seen the onboarding before
    const hasSeenOnboarding = localStorage.getItem(AGENT_ONBOARDING_KEY);

    // Only show ONCE on initial mount if not seen
    if (!hasSeenOnboarding) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, []); // Empty dependency array - only runs once on mount

  const handleAccept = async () => {
    setIsEnabling(true);

    try {
      const success = await enableAgenticMode();

      if (success) {
        await startVoiceAssistant();
        toast({
          title: "AI Agent Activated! 🎉",
          description: "Your AI assistant is now speaking. How can I help you?",
        });
      } else {
        toast({
          title: "Permissions Required",
          description: "Please grant microphone access to enable the AI agent.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "We couldn't enable the AI agent. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEnabling(false);
      setIsOpen(false);
      localStorage.setItem(AGENT_ONBOARDING_KEY, "true");
    }
  };

  const handleDecline = () => {
    setIsOpen(false);
    localStorage.setItem(AGENT_ONBOARDING_KEY, "true");
    toast({
      title: "No Problem!",
      description: "You can enable the AI agent anytime using the toggle in the top navigation.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px] bg-[#5A0040] border-[#E20074] border-2 text-white shadow-2xl rounded-2xl">
        {/* Content */}
        <div>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white drop-shadow-lg">
              Welcome to T-Care AI Assistant! 🤖
            </DialogTitle>
            <DialogDescription className="text-white/90 text-base leading-relaxed pt-2">
              Experience a smarter way to get support with our AI-powered voice assistant.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-white text-lg drop-shadow">What the AI Agent can do:</h4>
              <ul className="space-y-2 text-white/90">
                <li className="flex items-start gap-2">
                  <span className="text-[#E20074] mt-1 font-bold">✓</span>
                  <span>Voice-powered assistance for all your questions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#E20074] mt-1 font-bold">✓</span>
                  <span>Real-time network diagnostics and troubleshooting</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#E20074] mt-1 font-bold">✓</span>
                  <span>Instant help with plans, devices, and coverage</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#E20074] mt-1 font-bold">✓</span>
                  <span>Available 24/7 whenever you need support</span>
                </li>
              </ul>
            </div>

            <div className="bg-black/30 rounded-xl p-4 border border-[#E20074]/40">
              <p className="text-sm text-white">
                <strong className="text-white">Note:</strong> The AI assistant requires microphone access to provide voice support.
                You can enable or disable it anytime using the toggle in the navigation bar.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={handleDecline}
              disabled={isEnabling}
              className="bg-black/40 hover:bg-black/60 text-white border-white/50 hover:border-white/70 rounded-xl transition-all duration-300"
            >
              Maybe Later
            </Button>
            <Button
              onClick={handleAccept}
              disabled={isEnabling}
              className="bg-[#E20074] hover:bg-[#E20074]/80 text-white border-0 shadow-lg hover:shadow-xl rounded-xl transition-all duration-300"
            >
              {isEnabling ? "Enabling..." : "Enable AI Assistant"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
