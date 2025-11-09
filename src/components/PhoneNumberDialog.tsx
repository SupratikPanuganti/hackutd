import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { validateChatId, checkTelegramStatus } from "@/lib/telegramService";

interface TelegramDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (chatId: string) => void;
  currentChatId?: string | null;
}

// Export with both names for backwards compatibility
export const TelegramDialog = ({
  open,
  onClose,
  onSave,
  currentChatId,
}: TelegramDialogProps) => {
  const [chatId, setChatId] = useState(currentChatId || "");
  const [error, setError] = useState<string | null>(null);
  const [botUsername, setBotUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      // Fetch bot info when dialog opens
      checkTelegramStatus().then(status => {
        if (status.botInfo?.username) {
          setBotUsername(status.botInfo.username);
        }
      });
    }
  }, [open]);

  const handleSave = () => {
    const trimmed = chatId.trim();
    
    if (!trimmed) {
      setError("Chat ID is required");
      return;
    }

    if (!validateChatId(trimmed)) {
      setError("Please enter a valid Telegram Chat ID (number) or username (@username)");
      return;
    }

    setError(null);
    onSave(trimmed);
    onClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setChatId(value);
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-black/90 border border-white/20 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-white text-xl font-bold">
            Enable Telegram Notifications
          </DialogTitle>
          <DialogDescription className="text-white/70 pt-2">
            Get notified via Telegram when a tower near you goes down or comes back online.
            {botUsername && (
              <span className="block mt-2">
                Bot: <span className="font-mono text-white">@{botUsername}</span>
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="chatId" className="text-white">
              Telegram Chat ID
            </Label>
            <Input
              id="chatId"
              type="text"
              placeholder="123456789 or @username"
              value={chatId}
              onChange={handleInputChange}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSave();
                }
              }}
            />
            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}
            <div className="text-xs text-white/60 space-y-1">
              <p>Enter your Telegram Chat ID (numeric) or username:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Start a conversation with the bot on Telegram</li>
                <li>Send <code className="bg-white/10 px-1 rounded">/start</code> to the bot</li>
                <li>Get your Chat ID from <code className="bg-white/10 px-1 rounded">@userinfobot</code> or use your username</li>
                <li>Enter the Chat ID or username here</li>
              </ol>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 bg-white text-black hover:bg-white/90"
            >
              {loading ? "Saving..." : "Save"}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-white/30 bg-white/5 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

