import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AgentPermissionsDialogProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
  isEnabling: boolean;
}

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
export const AgentPermissionsDialog = ({
  isOpen,
  onAccept,
  onDecline,
  isEnabling,
}: AgentPermissionsDialogProps) => {

  return (
    <Dialog open={isOpen} onOpenChange={onDecline}>
      <DialogContent className="sm:max-w-[450px] backdrop-blur-xl bg-white/10 border-white/20 text-white shadow-2xl rounded-2xl relative overflow-hidden group">
        {/* Liquid glass effect overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#5A0040]/30 via-[#E20074]/20 to-[#5A0040]/30 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-tl from-white/10 via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Content with relative positioning */}
        <div className="relative z-10">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white drop-shadow-lg">
              Enable AI Agent Mode
            </DialogTitle>
            <DialogDescription className="text-white/90 text-base leading-relaxed pt-2">
              Get faster help with our AI-powered voice assistant
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
          <div className="space-y-3 py-4">
            <div className="bg-white/10 rounded-xl p-4 border border-white/20 backdrop-blur-sm space-y-3">
              <p className="text-sm text-white/90">
                <strong className="text-white">Microphone:</strong> Used for voice commands and conversations
              </p>
              <p className="text-sm text-white/90">
                <strong className="text-white">Camera:</strong> Used for sentiment analysis to provide better assistance
              </p>
              <p className="text-sm text-white/90">
                <strong className="text-white">Privacy:</strong> Your data is processed in real-time and not stored
              </p>
            </div>

            <p className="text-xs text-white/70 text-center">
              You can disable Agent Mode anytime using the toggle in the navigation
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={onDecline}
              disabled={isEnabling}
              className="bg-black/40 hover:bg-black/60 text-white border-white/50 hover:border-white/70 rounded-xl transition-all duration-300"
            >
              Cancel
            </Button>
            <Button
              onClick={onAccept}
              disabled={isEnabling}
              className="bg-[#E20074] hover:bg-[#E20074]/80 text-white border-0 shadow-lg hover:shadow-xl rounded-xl transition-all duration-300"
            >
              {isEnabling ? "Enabling..." : "Enable Agent Mode"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
