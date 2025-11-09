import { getVapiClient } from '@/lib/vapiClient';
import { SentimentData, Message, ScreenContext } from '@/contexts/AgenticContext';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export interface ContextUpdate {
  sessionId: string;
  timestamp: number;
  screenContext: ScreenContext;
  sentiment: SentimentData | null;
  sentimentTrend: 'improving' | 'declining' | 'stable';
  recentMessages: Message[];
  userInput?: string;
}

export interface DecisionResponse {
  decision: {
    action: string;
    confidence: number;
    reasoning: string;
    responseDepth: 'brief' | 'detailed' | 'empathetic';
    suggestedResponse?: string;
    alternativeOptions?: string[];
    nextSteps?: string[];
  };
  responseStyle: {
    tone: 'empathetic' | 'professional' | 'friendly';
    verbosity: 'concise' | 'moderate' | 'detailed';
    urgency: 'high' | 'medium' | 'low';
  };
  shouldChangeApproach: boolean;
}

/**
 * Manages continuous context updates to VAPI
 */
export class ContextUpdater {
  private intervalId: number | null = null;
  private updateInterval: number;
  private lastUpdate: string = '';
  private isActive: boolean = false;

  constructor(updateInterval: number = 5000) {
    this.updateInterval = updateInterval;
  }

  /**
   * Start sending periodic context updates to VAPI
   */
  start(getContextFn: () => ContextUpdate) {
    if (this.isActive) {
      console.log('[ContextUpdater] Already active');
      return;
    }

    this.isActive = true;
    console.log(`[ContextUpdater] Starting with ${this.updateInterval}ms interval`);

    // Send initial update immediately
    this.sendUpdate(getContextFn());

    // Then send periodic updates
    this.intervalId = window.setInterval(() => {
      const context = getContextFn();
      this.sendUpdate(context);
    }, this.updateInterval);
  }

  /**
   * Stop sending updates
   */
  stop() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isActive = false;
    console.log('[ContextUpdater] Stopped');
  }

  /**
   * Send context update to VAPI
   */
  private async sendUpdate(context: ContextUpdate) {
    try {
      const vapi = getVapiClient();
      if (!vapi) {
        console.warn('[ContextUpdater] VAPI client not available');
        return;
      }

      // Build context message
      const contextMessage = this.buildContextMessage(context);

      // Only send if context has changed
      if (contextMessage === this.lastUpdate) {
        console.log('[ContextUpdater] No changes, skipping update');
        return;
      }

      this.lastUpdate = contextMessage;

      // Get decision from backend
      const decision = await this.getDecision(context);

      // Build enhanced message with decision
      const enhancedMessage = this.buildEnhancedMessage(contextMessage, decision);

      // Send to VAPI
      vapi.send({
        type: 'add-message',
        message: {
          role: 'system',
          content: enhancedMessage,
        },
      });

      console.log('[ContextUpdater] Context updated', {
        sentiment: context.sentiment?.label,
        page: context.screenContext.routeLabel,
        action: decision?.decision.action,
        responseDepth: decision?.decision.responseDepth,
      });
    } catch (error) {
      console.error('[ContextUpdater] Error sending update:', error);
    }
  }

  /**
   * Get AI decision for current context
   */
  private async getDecision(context: ContextUpdate): Promise<DecisionResponse | null> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/decision/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPage: context.screenContext.route,
          pageLabel: context.screenContext.routeLabel,
          userInput: context.userInput,
          focusedElement: context.screenContext.focusedElement,
          currentSentiment: context.sentiment?.value,
          sentimentLabel: context.sentiment?.label,
          sentimentTrend: context.sentimentTrend,
          recentMessages: context.recentMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`Decision API returned ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[ContextUpdater] Error getting decision:', error);
      return null;
    }
  }

  /**
   * Build context message for VAPI
   */
  private buildContextMessage(context: ContextUpdate): string {
    const parts: string[] = [];

    parts.push('=== MULTIMODAL CONTEXT UPDATE ===');
    parts.push(`Session: ${context.sessionId}`);
    parts.push(`Time: ${new Date(context.timestamp).toLocaleTimeString()}`);
    parts.push('');

    // Screen context
    parts.push('SCREEN CONTEXT:');
    parts.push(`- Current Page: ${context.screenContext.routeLabel} (${context.screenContext.route})`);
    if (context.screenContext.focusedElement) {
      parts.push(`- User Focus: ${context.screenContext.focusedElement}`);
    }
    if (context.userInput) {
      parts.push(`- User Input: "${context.userInput}"`);
    }
    parts.push('');

    // Sentiment context
    if (context.sentiment) {
      parts.push('SENTIMENT ANALYSIS:');
      parts.push(`- Current: ${context.sentiment.label} (${context.sentiment.value})`);
      parts.push(`- Trend: ${context.sentimentTrend}`);

      // Interpret sentiment for the assistant
      if (context.sentiment.value < -0.5) {
        parts.push('- ⚠️ USER IS FRUSTRATED - Prioritize quick solutions and show empathy');
      } else if (context.sentiment.value < 0) {
        parts.push('- ℹ️ USER IS SLIGHTLY FRUSTRATED - Be patient and helpful');
      } else if (context.sentiment.value > 0.5) {
        parts.push('- ✅ USER IS HAPPY - Can provide detailed information');
      }

      if (context.sentimentTrend === 'declining') {
        parts.push('- 📉 SENTIMENT DECLINING - Consider changing approach or offering alternatives');
      } else if (context.sentimentTrend === 'improving') {
        parts.push('- 📈 SENTIMENT IMPROVING - Current approach is working well');
      }
      parts.push('');
    }

    // Recent conversation
    if (context.recentMessages.length > 0) {
      parts.push('RECENT CONVERSATION:');
      context.recentMessages.slice(-3).forEach((msg) => {
        parts.push(`${msg.role.toUpperCase()}: ${msg.content}`);
      });
      parts.push('');
    }

    return parts.join('\n');
  }

  /**
   * Build enhanced message with AI decision
   */
  private buildEnhancedMessage(contextMessage: string, decision: DecisionResponse | null): string {
    if (!decision) {
      return contextMessage;
    }

    const parts: string[] = [contextMessage];

    parts.push('AI DECISION ANALYSIS:');
    parts.push(`- Recommended Action: ${decision.decision.action}`);
    parts.push(`- Confidence: ${(decision.decision.confidence * 100).toFixed(0)}%`);
    parts.push(`- Reasoning: ${decision.decision.reasoning}`);
    parts.push(`- Response Depth: ${decision.decision.responseDepth}`);
    parts.push('');

    parts.push('RESPONSE STYLE:');
    parts.push(`- Tone: ${decision.responseStyle.tone}`);
    parts.push(`- Verbosity: ${decision.responseStyle.verbosity}`);
    parts.push(`- Urgency: ${decision.responseStyle.urgency}`);
    parts.push('');

    if (decision.shouldChangeApproach) {
      parts.push('⚠️ ATTENTION: Consider changing approach - sentiment indicates current method not working');
      parts.push('');
    }

    if (decision.decision.suggestedResponse) {
      parts.push('SUGGESTED RESPONSE:');
      parts.push(decision.decision.suggestedResponse);
      parts.push('');
    }

    if (decision.decision.alternativeOptions && decision.decision.alternativeOptions.length > 0) {
      parts.push('ALTERNATIVE OPTIONS:');
      decision.decision.alternativeOptions.forEach((opt, i) => {
        parts.push(`${i + 1}. ${opt}`);
      });
      parts.push('');
    }

    if (decision.decision.nextSteps && decision.decision.nextSteps.length > 0) {
      parts.push('NEXT STEPS:');
      decision.decision.nextSteps.forEach((step, i) => {
        parts.push(`${i + 1}. ${step}`);
      });
    }

    return parts.join('\n');
  }

  /**
   * Send immediate update (outside of interval)
   */
  async sendImmediateUpdate(context: ContextUpdate) {
    await this.sendUpdate(context);
  }

  /**
   * Check if updater is active
   */
  isRunning(): boolean {
    return this.isActive;
  }
}
