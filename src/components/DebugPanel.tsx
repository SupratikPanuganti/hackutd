import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAgentic } from '@/contexts/AgenticContext';
import { cn } from '@/lib/utils';

interface DebugPanelProps {
  voiceActionsStatus: {
    isProcessing: boolean;
    lastAction: string | null;
  };
  autonomousAgentStatus: {
    isActive: boolean;
    lastMessage: string | null;
    lastDecision: string | null;
  };
}

export const DebugPanel = ({ voiceActionsStatus, autonomousAgentStatus }: DebugPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { isEnabled, isVoiceActive, currentSentiment, conversationHistory } = useAgentic();

  if (!isEnabled) return null;

  const lastUserMessage = conversationHistory
    .filter(m => m.role === 'user')
    .slice(-1)[0]?.content || 'None';

  const lastAssistantMessage = conversationHistory
    .filter(m => m.role === 'assistant')
    .slice(-1)[0]?.content || 'None';

  return (
    <div className="fixed top-20 right-4 z-50 w-80">
      <Card className={cn(
        "shadow-lg border-2 transition-all",
        isExpanded ? "border-primary" : "border-muted"
      )}>
        {/* Header */}
        <div
          className="flex items-center justify-between p-3 cursor-pointer bg-primary/5 hover:bg-primary/10"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-2 h-2 rounded-full",
              isVoiceActive ? "bg-green-500 animate-pulse" : "bg-gray-400"
            )} />
            <span className="font-semibold text-sm">🤖 Agent Debug</span>
          </div>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            {isExpanded ? '−' : '+'}
          </Button>
        </div>

        {/* Content */}
        {isExpanded && (
          <div className="p-3 space-y-3 text-xs">
            {/* Status */}
            <div className="space-y-1">
              <div className="font-semibold text-primary">Status</div>
              <div className="grid grid-cols-2 gap-2">
                <StatusBadge label="Agent Mode" active={isEnabled} />
                <StatusBadge label="Voice" active={isVoiceActive} />
                <StatusBadge label="Processing" active={voiceActionsStatus.isProcessing} />
                <StatusBadge label="AI Active" active={autonomousAgentStatus.isActive} />
              </div>
            </div>

            {/* Sentiment */}
            {currentSentiment && (
              <div className="space-y-1">
                <div className="font-semibold text-primary">Sentiment</div>
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "px-2 py-1 rounded text-xs font-medium",
                    currentSentiment.value > 0.3 ? "bg-green-100 text-green-700" :
                    currentSentiment.value < -0.3 ? "bg-red-100 text-red-700" :
                    "bg-gray-100 text-gray-700"
                  )}>
                    {currentSentiment.label}
                  </div>
                  <span className="text-muted-foreground">{currentSentiment.value.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Last User Message */}
            <div className="space-y-1">
              <div className="font-semibold text-primary">Last User Said</div>
              <div className="bg-blue-50 p-2 rounded text-xs break-words max-h-16 overflow-y-auto">
                {lastUserMessage.substring(0, 100)}
                {lastUserMessage.length > 100 && '...'}
              </div>
            </div>

            {/* Last AI Action */}
            {autonomousAgentStatus.lastDecision && (
              <div className="space-y-1">
                <div className="font-semibold text-primary">Last AI Action</div>
                <div className="bg-purple-50 p-2 rounded text-xs break-words">
                  {autonomousAgentStatus.lastDecision}
                </div>
              </div>
            )}

            {/* Last Voice Action */}
            {voiceActionsStatus.lastAction && (
              <div className="space-y-1">
                <div className="font-semibold text-primary">Last Voice Action</div>
                <div className="bg-green-50 p-2 rounded text-xs">
                  {voiceActionsStatus.lastAction}
                </div>
              </div>
            )}

            {/* Conversation Count */}
            <div className="text-xs text-muted-foreground border-t pt-2">
              Messages: {conversationHistory.length}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

const StatusBadge = ({ label, active }: { label: string; active: boolean }) => (
  <div className={cn(
    "px-2 py-1 rounded text-xs font-medium text-center",
    active
      ? "bg-green-100 text-green-700"
      : "bg-gray-100 text-gray-500"
  )}>
    {label}: {active ? '✓' : '✗'}
  </div>
);
