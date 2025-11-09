/**
 * Sentiment Monitor - Watches sentiment and triggers proactive agent actions
 */

import { SentimentData } from '@/contexts/AgenticContext';
import { ActionExecutor } from './actionExecutor';

export interface SentimentTrigger {
  condition: (sentiment: SentimentData, trend: string) => boolean;
  action: string;
  params?: Record<string, unknown>;
  cooldownMs?: number; // Prevent spam
  description: string;
}

export class SentimentMonitor {
  private executor: ActionExecutor | null = null;
  private triggers: SentimentTrigger[] = [];
  private lastTriggerTimes: Map<string, number> = new Map();
  private sentimentHistory: SentimentData[] = [];
  private readonly HISTORY_SIZE = 10;

  constructor() {
    this.initializeDefaultTriggers();
  }

  /**
   * Set the action executor
   */
  setExecutor(executor: ActionExecutor) {
    this.executor = executor;
  }

  /**
   * Initialize default sentiment-triggered actions
   */
  private initializeDefaultTriggers() {
    // Trigger 1: Persistent frustration (3+ frustrated readings in a row)
    this.triggers.push({
      condition: (sentiment, trend) => {
        const recentFrustrated = this.sentimentHistory
          .slice(-3)
          .every(s => s.value < -0.3);
        return recentFrustrated;
      },
      action: 'proactive_help',
      params: { context: 'persistent_frustration' },
      cooldownMs: 30000, // 30 seconds cooldown
      description: 'Offer help when user is persistently frustrated'
    });

    // Trigger 2: Declining sentiment while viewing devices
    this.triggers.push({
      condition: (sentiment, trend) => {
        return trend === 'declining' &&
               sentiment.value < 0 &&
               window.location.pathname === '/devices';
      },
      action: 'suggest_alternative',
      params: {
        currentItem: 'device',
        reason: 'declining_sentiment'
      },
      cooldownMs: 45000, // 45 seconds
      description: 'Suggest alternative device when sentiment declines'
    });

    // Trigger 3: Frustrated while viewing network status
    this.triggers.push({
      condition: (sentiment, trend) => {
        return sentiment.value < -0.5 &&
               window.location.pathname === '/status';
      },
      action: 'proactive_help',
      params: {
        context: 'network_status_frustration'
      },
      cooldownMs: 40000,
      description: 'Offer help with network issues when frustrated'
    });

    // Trigger 4: Rapid sentiment drop (happy → frustrated quickly)
    this.triggers.push({
      condition: (sentiment, trend) => {
        if (this.sentimentHistory.length < 5) return false;

        const recent5 = this.sentimentHistory.slice(-5);
        const wasHappy = recent5[0].value > 0.5;
        const nowFrustrated = sentiment.value < -0.3;

        return wasHappy && nowFrustrated;
      },
      action: 'proactive_help',
      params: {
        context: 'rapid_sentiment_drop'
      },
      cooldownMs: 35000,
      description: 'Immediate help when sentiment drops rapidly'
    });

    // Trigger 5: Frustrated while viewing plans
    this.triggers.push({
      condition: (sentiment, trend) => {
        return sentiment.value < -0.3 &&
               window.location.pathname === '/plans';
      },
      action: 'suggest_alternative',
      params: {
        currentItem: 'plan',
        reason: 'frustration_with_plans'
      },
      cooldownMs: 45000,
      description: 'Suggest alternative plan when frustrated'
    });
  }

  /**
   * Process new sentiment data and check triggers
   */
  async processSentiment(
    sentiment: SentimentData,
    trend: 'improving' | 'declining' | 'stable'
  ): Promise<void> {
    // Add to history
    this.sentimentHistory.push(sentiment);
    if (this.sentimentHistory.length > this.HISTORY_SIZE) {
      this.sentimentHistory.shift();
    }

    console.log('[SentimentMonitor] Processing sentiment:', {
      value: sentiment.value,
      label: sentiment.label,
      trend,
      historySize: this.sentimentHistory.length
    });

    // Check all triggers
    for (const trigger of this.triggers) {
      if (this.shouldTrigger(trigger, sentiment, trend)) {
        await this.executeTrigger(trigger);
      }
    }
  }

  /**
   * Check if a trigger should fire
   */
  private shouldTrigger(
    trigger: SentimentTrigger,
    sentiment: SentimentData,
    trend: string
  ): boolean {
    // Check cooldown
    const lastTriggerTime = this.lastTriggerTimes.get(trigger.action) || 0;
    const cooldown = trigger.cooldownMs || 30000;
    const now = Date.now();

    if (now - lastTriggerTime < cooldown) {
      return false; // Still in cooldown
    }

    // Check condition
    try {
      return trigger.condition(sentiment, trend);
    } catch (error) {
      console.error('[SentimentMonitor] Error checking trigger condition:', error);
      return false;
    }
  }

  /**
   * Execute a sentiment-triggered action
   */
  private async executeTrigger(trigger: SentimentTrigger): Promise<void> {
    if (!this.executor) {
      console.warn('[SentimentMonitor] No executor set, cannot execute trigger');
      return;
    }

    console.log('🎯 [SentimentMonitor] TRIGGERING ACTION:', {
      action: trigger.action,
      description: trigger.description,
      params: trigger.params
    });

    // Mark trigger time
    this.lastTriggerTimes.set(trigger.action, Date.now());

    // Execute action
    try {
      await this.executor.execute({
        type: trigger.action,
        params: trigger.params,
        description: trigger.description,
        triggeredBySentiment: true
      });
    } catch (error) {
      console.error('[SentimentMonitor] Error executing trigger:', error);
    }
  }

  /**
   * Add a custom trigger
   */
  addTrigger(trigger: SentimentTrigger) {
    this.triggers.push(trigger);
  }

  /**
   * Clear all triggers
   */
  clearTriggers() {
    this.triggers = [];
  }

  /**
   * Reset history and cooldowns
   */
  reset() {
    this.sentimentHistory = [];
    this.lastTriggerTimes.clear();
  }

  /**
   * Get current sentiment history
   */
  getHistory(): SentimentData[] {
    return [...this.sentimentHistory];
  }
}

// Global singleton instance
export const sentimentMonitor = new SentimentMonitor();
