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
        triggerResponseEnabled: false,
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

    parts.push('=== CONTEXT UPDATE ===');
    parts.push(`Time: ${new Date(context.timestamp).toLocaleTimeString()}`);
    parts.push(`Page: ${context.screenContext.routeLabel}`);
    parts.push('');

    // PAGE CONTENT - CRITICAL for preventing hallucinations
    if (context.screenContext.visibleContent) {
      parts.push('=== PAGE CONTENT (USE ONLY THIS INFO) ===');
      parts.push(context.screenContext.visibleContent);
      parts.push('=== END PAGE CONTENT ===');
      parts.push('');
    }

    // Sentiment context - MOST IMPORTANT
    if (context.sentiment) {
      parts.push('SENTIMENT UPDATE:');
      parts.push(`Current: ${context.sentiment.label} (${context.sentiment.value}) | Trend: ${context.sentimentTrend.toUpperCase()}`);

      // Personalization guidance
      if (context.sentiment.value > 0.5) {
        parts.push('✅ USER IS HAPPY - Perfect time to suggest upgrades, explain benefits, upsell premium options');
      } else if (context.sentiment.value > 0) {
        parts.push('😊 USER IS POSITIVE - Engaged and receptive, good time for recommendations');
      } else if (context.sentiment.value < -0.5) {
        parts.push('⚠️ USER IS FRUSTRATED - Empathy required! Simplify, apologize, offer quick fixes immediately');
      } else if (context.sentiment.value < 0) {
        parts.push('😐 USER IS NEGATIVE - Be extra helpful, patient, and clear');
      } else {
        parts.push('➡️ USER IS NEUTRAL - Balance info with gentle recommendations');
      }

      if (context.sentimentTrend === 'declining') {
        parts.push('📉 ALERT: Sentiment declining - Change approach NOW! Be more direct, offer alternatives');
      } else if (context.sentimentTrend === 'improving') {
        parts.push('📈 Great! Sentiment improving - Your approach is working, keep it up');
      }
      parts.push('');
    }

    // Page-specific selling context
    if (context.screenContext.route === '/plans') {
      parts.push('PAGE STRATEGY: Ask about data usage, family size, streaming habits to recommend best plan');
    } else if (context.screenContext.route === '/devices') {
      parts.push('PAGE STRATEGY: Ask iOS vs Android preference, camera importance, budget to suggest perfect device');
    }

    // Recent conversation
    if (context.recentMessages.length > 0) {
      parts.push('');
      parts.push('RECENT MESSAGES:');
      context.recentMessages.slice(-2).forEach((msg) => {
        parts.push(`${msg.role}: ${msg.content.substring(0, 100)}`);
      });
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

    parts.push('AI RECOMMENDATION:');
    parts.push(`Action: ${decision.decision.action} (${(decision.decision.confidence * 100).toFixed(0)}% confidence)`);
    parts.push(`Why: ${decision.decision.reasoning}`);
    parts.push(`Style: ${decision.responseStyle.tone}, ${decision.responseStyle.verbosity}, ${decision.decision.responseDepth} depth`);
    parts.push('');

    if (decision.shouldChangeApproach) {
      parts.push('⚠️ CHANGE APPROACH - Current strategy not working based on sentiment');
      parts.push('');
    }

    if (decision.decision.suggestedResponse) {
      parts.push('SUGGESTED MESSAGE:');
      parts.push(decision.decision.suggestedResponse);
      parts.push('');
    }

    if (decision.decision.alternativeOptions && decision.decision.alternativeOptions.length > 0) {
      parts.push('OPTIONS TO OFFER:');
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
