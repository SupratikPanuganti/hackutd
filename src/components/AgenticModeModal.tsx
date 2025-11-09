import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, Mic, Sparkles, Shield, Zap } from "lucide-react";
import { useAgentic } from "@/contexts/AgenticContext";
import { useToast } from "@/hooks/use-toast";

interface AgenticModeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AgenticModeModal = ({ open, onOpenChange }: AgenticModeModalProps) => {
  const { enableAgenticMode, markOnboardingComplete } = useAgentic();
  const { toast } = useToast();
  const [isEnabling, setIsEnabling] = useState(false);

  const handleEnable = async () => {
    setIsEnabling(true);
    try {
      const success = await enableAgenticMode();
      
      if (success) {
        markOnboardingComplete();
        toast({
          title: "AI Agent Activated! 🎉",
          description: "Your AI assistant is now available throughout your journey.",
        });
        onOpenChange(false);
      } else {
        toast({
          title: "Permissions Required",
          description: "Please grant camera or microphone access to enable agentic mode.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to enable agentic mode. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEnabling(false);
    }
  };

  const handleMaybeLater = () => {
    markOnboardingComplete();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse" />
              <div className="relative bg-primary/10 p-4 rounded-full">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
            </div>
          </div>
          <DialogTitle className="text-2xl text-center">
            Enable AI Agent Mode
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Let our AI assistant guide you through every step with voice and visual support
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="mt-1">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-sm">Instant Help Everywhere</h4>
                <p className="text-sm text-muted-foreground">
                  Get contextual assistance on every page, automatically adapting to what you're doing
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="mt-1">
                <Mic className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-sm">Voice Interaction</h4>
                <p className="text-sm text-muted-foreground">
                  Talk naturally to get help - no typing required
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="mt-1">
                <Camera className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-sm">Visual Diagnostics</h4>
                <p className="text-sm text-muted-foreground">
                  Show your device or screen for advanced troubleshooting
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              Your privacy matters. Camera and microphone are only active when you're interacting with the assistant. 
              You can disable them anytime in settings.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button 
            onClick={handleEnable} 
            size="lg" 
            className="w-full"
            disabled={isEnabling}
          >
            {isEnabling ? "Enabling..." : "Enable AI Agent Mode"}
          </Button>
          <Button 
            onClick={handleMaybeLater} 
            variant="ghost" 
            size="lg" 
            className="w-full"
            disabled={isEnabling}
          >
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
