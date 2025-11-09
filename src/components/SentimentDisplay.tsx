import { useAgentic } from "@/contexts/AgenticContext";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Smile, Meh, Frown } from "lucide-react";

export const SentimentDisplay = () => {
  const { currentSentiment, isSentimentServiceRunning, isEnabled } = useAgentic();

  // Only show when Agent Mode is enabled
  if (!isEnabled) {
    return null;
  }

  const getSentimentIcon = () => {
    if (!isSentimentServiceRunning) return <Meh className="w-4 h-4" />;
    if (!currentSentiment) return <Meh className="w-4 h-4" />;

    if (currentSentiment.value > 0) {
      return <Smile className="w-4 h-4" />;
    } else if (currentSentiment.value < 0) {
      return <Frown className="w-4 h-4" />;
    }
    return <Meh className="w-4 h-4" />;
  };

  const getSentimentColor = () => {
    if (!isSentimentServiceRunning) return "bg-gray-500/20 text-gray-200 border-gray-400/30";
    if (!currentSentiment) return "bg-gray-500/20 text-gray-200 border-gray-400/30";

    if (currentSentiment.value > 0) {
      return "bg-green-500/20 text-green-200 border-green-400/30";
    } else if (currentSentiment.value < 0) {
      return "bg-red-500/20 text-red-200 border-red-400/30";
    }
    return "bg-blue-500/20 text-blue-200 border-blue-400/30";
  };

  const getSentimentLabel = () => {
    if (!isSentimentServiceRunning) return "Starting...";
    if (!currentSentiment) return "Detecting...";
    return currentSentiment.label || "Neutral";
  };

  return (
    <div className="inline-flex items-center gap-2 rounded-xl px-3 py-2 relative z-20 border-white/20 bg-white/10 text-white backdrop-blur-sm border">
      <span className="text-xs font-medium">Sentiment:</span>
      <Badge
        variant="outline"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg px-2 py-1 backdrop-blur-sm border transition-all duration-300",
          getSentimentColor(),
          "animate-pulse-subtle"
        )}
      >
        {getSentimentIcon()}
        <span className="text-xs font-medium">
          {getSentimentLabel()}
        </span>
      </Badge>
    </div>
  );
};
