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

    if (!hasSeenOnboarding) {
      // Show dialog after a short delay for better UX
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, []);

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
      <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-purple-900/95 via-pink-900/95 to-purple-900/95 backdrop-blur-xl border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">
            Welcome to T-Care AI Assistant! 🤖
          </DialogTitle>
          <DialogDescription className="text-white/90 text-base leading-relaxed pt-2">
            Experience a smarter way to get support with our AI-powered voice assistant.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <h4 className="font-semibold text-white text-lg">What the AI Agent can do:</h4>
            <ul className="space-y-2 text-white/90">
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span>Voice-powered assistance for all your questions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span>Real-time network diagnostics and troubleshooting</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span>Instant help with plans, devices, and coverage</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span>Available 24/7 whenever you need support</span>
              </li>
            </ul>
          </div>

          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <p className="text-sm text-white/80">
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
            className="bg-white/10 hover:bg-white/20 text-white border-white/30 hover:border-white/40"
          >
            Maybe Later
          </Button>
          <Button
            onClick={handleAccept}
            disabled={isEnabling}
            className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
          >
            {isEnabling ? "Enabling..." : "Enable AI Assistant"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
