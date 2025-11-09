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

export const AgentPermissionsDialog = ({
  isOpen,
  onAccept,
  onDecline,
  isEnabling,
}: AgentPermissionsDialogProps) => {
  console.log('[AgentPermissionsDialog] Rendered. isOpen:', isOpen, 'isEnabling:', isEnabling);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      console.log('[AgentPermissionsDialog] Dialog open state changed to:', open);
      if (!open) {
        onDecline();
      }
    }}>
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
              onClick={() => {
                console.log('[AgentPermissionsDialog] Cancel button clicked');
                onDecline();
              }}
              disabled={isEnabling}
              className="bg-white/10 hover:bg-white/20 text-white border-white/30 hover:border-white/40 rounded-xl transition-all duration-300 backdrop-blur-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                console.log('[AgentPermissionsDialog] Enable button clicked');
                onAccept();
              }}
              disabled={isEnabling}
              className="bg-gradient-to-r from-[#5A0040] to-[#E20074] text-white border-0 shadow-lg hover:shadow-xl hover:brightness-110 rounded-xl transition-all duration-300"
            >
              {isEnabling ? "Enabling..." : "Enable Agent Mode"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
