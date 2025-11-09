import { useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAgentic } from '@/contexts/AgenticContext';
import { autonomousAgentService, AgenticContext as AgentContext, AgenticDecision } from '@/services/autonomousAgentService';
import { getVapiClient } from '@/lib/vapiClient';

/**
 * Hook for autonomous agent integration
 * Enables fully hands-off AI-driven experience using Nemotron
 */
export const useAutonomousAgent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    isEnabled,
    isVoiceActive,
    currentSentiment,
    sentimentTrend,
    conversationHistory,
    screenContext,
    sessionId,
  } = useAgentic();

  const intervalRef = useRef<number | null>(null);
  const lastDecisionRef = useRef<string>('');

  // Set up navigation function on mount
  useEffect(() => {
    autonomousAgentService.setNavigate(navigate);

    // Set up speak function using Vapi
    autonomousAgentService.setSpeakFunction((message) => {
      const vapi = getVapiClient();
      if (vapi && isVoiceActive) {
        console.log('[useAutonomousAgent] 🔊 Autonomous agent speaking via Vapi:', message);

        // Try to interrupt any ongoing assistant response
        // Method 1: Send message with high priority (appears immediately)
        vapi.send({
          type: 'add-message',
          message: {
            role: 'assistant',
            content: message,
          },
        });

        // Method 2: Try to force speech using say command if available
        try {
          vapi.send({
            type: 'control',
            control: 'say',
            message: message,
          });
        } catch (e) {
          console.log('[useAutonomousAgent] Say control not available, using add-message only');
        }
      }
    });
  }, [navigate, isVoiceActive]);

  /**
   * Get current agent context
   */
  const getAgentContext = useCallback((): AgentContext => {
    return {
      currentPage: location.pathname,
      pageLabel: screenContext.routeLabel,
      availablePages: ['/', '/plans', '/devices', '/status', '/help', '/assist'],
      visibleContent: screenContext.visibleContent,
      currentSentiment: currentSentiment?.value || 0,
      sentimentLabel: currentSentiment?.label || 'Neutral',
      sentimentTrend: sentimentTrend,
      recentMessages: conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      userLastInput: conversationHistory.length > 0
        ? conversationHistory[conversationHistory.length - 1]?.content
        : undefined,
      sessionId: sessionId,
    };
  }, [location.pathname, screenContext, currentSentiment, sentimentTrend, conversationHistory, sessionId]);

  /**
   * Request autonomous decision from Nemotron
   */
  const requestDecision = useCallback(async (): Promise<AgenticDecision | null> => {
    if (!isEnabled || !isVoiceActive) {
      return null;
    }

    try {
      const context = getAgentContext();

      // Don't make duplicate decisions - ONLY check the actual user message
      // This allows different messages on the same page to be processed
      const messageHash = context.userLastInput || '';

      if (messageHash === lastDecisionRef.current && messageHash.length > 0) {
        console.log('[⏭️ SKIPPING] Already processed:', messageHash);
        return null;
      }

      lastDecisionRef.current = messageHash;

      console.log('[🧠 REQUESTING DECISION] for:', messageHash);
      const decision = await autonomousAgentService.getDecision(context);

      console.log('[useAutonomousAgent] Decision received:', {
        shouldTakeControl: decision.shouldTakeControl,
        action: decision.primaryAction.type,
        target: decision.primaryAction.target,
        steps: decision.estimatedSteps,
      });

      return decision;
    } catch (error) {
      console.error('[useAutonomousAgent] Error requesting decision:', error);
      return null;
    }
  }, [isEnabled, isVoiceActive, getAgentContext]);

  /**
   * Execute autonomous action
   */
  const executeAutonomous = useCallback(async (decision: AgenticDecision) => {
    // ALWAYS execute if we have a decision - this is AGENTIC AI
    // Don't check shouldTakeControl - if Nemotron gave us actions, DO them

    console.log('[useAutonomousAgent] EXECUTING AUTONOMOUS ACTIONS');
    console.log('[useAutonomousAgent] Strategy:', decision.conversationStrategy);
    console.log('[useAutonomousAgent] Primary action:', decision.primaryAction.type, decision.primaryAction.target);

    try {
      // Execute the autonomous action chain
      await autonomousAgentService.executeChain(decision);

      console.log('[useAutonomousAgent] ✓ Autonomous execution completed successfully');
    } catch (error) {
      console.error('[useAutonomousAgent] ✗ Autonomous execution failed:', error);
    }
  }, []);

  /**
   * Start autonomous agent loop
   */
  const startAutonomousLoop = useCallback(() => {
    if (intervalRef.current) {
      console.log('[useAutonomousAgent] Loop already running');
      return;
    }

    console.log('[useAutonomousAgent] Starting autonomous loop');

    // Check for autonomous actions every 2 seconds (very responsive)
    intervalRef.current = window.setInterval(async () => {
      if (!isEnabled || !isVoiceActive) {
        return;
      }

      // ALWAYS check for decision if there's conversation history
      // This is AGENTIC AI - it should act on user input immediately
      const context = getAgentContext();
      const hasUserInput = context.userLastInput && context.userLastInput.length > 0; // ANY input triggers agent

      if (!hasUserInput && conversationHistory.length === 0) {
        return; // No user input yet
      }

      try {
        const decision = await requestDecision();
        if (decision) {
          // Agent should ALWAYS take control when user provides input
          console.log('[useAutonomousAgent] Executing autonomous action');
          await executeAutonomous(decision);
        }
      } catch (error) {
        console.error('[useAutonomousAgent] Loop iteration error:', error);
      }
    }, 2000); // Every 2 seconds - very responsive
  }, [isEnabled, isVoiceActive, getAgentContext, conversationHistory.length, requestDecision, executeAutonomous]);

  /**
   * Stop autonomous agent loop
   */
  const stopAutonomousLoop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      console.log('[useAutonomousAgent] Loop stopped');
    }
  }, []);

  /**
   * Manually trigger autonomous decision
   */
  const triggerDecision = useCallback(async () => {
    console.log('[useAutonomousAgent] Manual decision trigger');

    const decision = await requestDecision();
    if (decision) {
      await executeAutonomous(decision);
    }
  }, [requestDecision, executeAutonomous]);

  // Auto-start loop when Agent Mode + Voice active
  useEffect(() => {
    if (isEnabled && isVoiceActive) {
      startAutonomousLoop();
    } else {
      stopAutonomousLoop();
    }

    return () => {
      stopAutonomousLoop();
    };
  }, [isEnabled, isVoiceActive, startAutonomousLoop, stopAutonomousLoop]);

  // CRITICAL: Trigger agent IMMEDIATELY when user speaks (don't wait for interval)
  useEffect(() => {
    console.log('[🔍 AGENT CHECK]', {
      isEnabled,
      isVoiceActive,
      conversationHistoryLength: conversationHistory.length,
      lastMessage: conversationHistory[conversationHistory.length - 1]
    });

    if (!isEnabled || !isVoiceActive || conversationHistory.length === 0) {
      console.log('[⛔ AGENT BLOCKED]', { isEnabled, isVoiceActive, historyLength: conversationHistory.length });
      return;
    }

    const lastMessage = conversationHistory[conversationHistory.length - 1];

    // If last message is from user, trigger agent IMMEDIATELY
    if (lastMessage && lastMessage.role === 'user' && lastMessage.content.length > 0) {
      console.log('[🤖 AGENT TRIGGERED]', lastMessage.content);

      // Trigger decision immediately (don't wait for interval)
      requestDecision().then((decision) => {
        if (decision) {
          console.log('[🎯 EXECUTING]', decision.primaryAction.type, '→', decision.primaryAction.target);
          executeAutonomous(decision);
        } else {
          console.log('[⚠️ NO DECISION] Agent returned null');
        }
      }).catch((error) => {
        console.error('[❌ AGENT ERROR]', error);
      });
    }
  }, [conversationHistory, isEnabled, isVoiceActive, requestDecision, executeAutonomous]);

  return {
    requestDecision,
    executeAutonomous,
    triggerDecision,
    isActive: isEnabled && isVoiceActive, // Agent is "active" when enabled and voice is on
  };
};
