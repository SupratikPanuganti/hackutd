import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface LocationPermissionDialogProps {
  open: boolean;
  onClose: () => void;
  onAllow: () => void;
}

export const LocationPermissionDialog = ({
  open,
  onClose,
  onAllow,
}: LocationPermissionDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-black/90 border border-white/20 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-white text-xl font-bold">
            Share Your Location
          </DialogTitle>
          <DialogDescription className="text-white/70 pt-2">
            We'd like to show your location on the map to help you see nearby network towers.
            Your location will only be used to display on the map and will not be stored.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-white/30 bg-white/5 text-white hover:bg-white/10 hover:text-white"
          >
            Not Now
          </Button>
          <Button
            onClick={onAllow}
            className="flex-1 bg-white text-black hover:bg-white/90"
          >
            Allow
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

