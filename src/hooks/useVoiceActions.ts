import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAgentic } from '@/contexts/AgenticContext';
import { ActionExecutor, Action, ActionResult } from '@/services/actionExecutor';
import { getVapiClient } from '@/lib/vapiClient';

/**
 * Hook to handle voice-triggered actions
 * Listens to VAPI messages and executes corresponding actions
 */
export const useVoiceActions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isVoiceActive, addMessage, getMultimodalContext } = useAgentic();
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastAction, setLastAction] = useState<Action | null>(null);
  const [lastResult, setLastResult] = useState<ActionResult | null>(null);
  const executorRef = useRef<ActionExecutor | null>(null);

  // Initialize action executor
  useEffect(() => {
    executorRef.current = new ActionExecutor({
      navigate,
      currentRoute: location.pathname,
    });
  }, [navigate, location.pathname]);

  // Update executor context when route changes
  useEffect(() => {
    executorRef.current?.updateContext({
      currentRoute: location.pathname,
    });
  }, [location.pathname]);

  // Listen to VAPI messages for action commands
  useEffect(() => {
    if (!isVoiceActive) return;

    const vapi = getVapiClient();
    if (!vapi) return;

    const handleMessage = (message: any) => {
      try {
        console.log('[useVoiceActions] Received VAPI message:', message);

        // Check if message contains an action command
        // VAPI messages have different formats, we need to handle:
        // 1. Function calls from the assistant
        // 2. Transcript messages with action keywords

        // Handle function calls (if VAPI assistant is configured with function calling)
        if (message.type === 'function-call' && message.functionCall) {
          const { name, parameters } = message.functionCall;
          executeAction({
            type: name,
            params: parameters,
            description: `Function call: ${name}`,
          });
          return;
        }

        // Handle transcript messages
        if (message.type === 'transcript' && message.transcript) {
          const text = message.transcript.text || message.transcript;
          if (typeof text === 'string') {
            // Try to parse command from transcript
            const action = executorRef.current?.parseCommand(text);
            if (action) {
              console.log('[useVoiceActions] Parsed action from transcript:', action);
              addMessage('user', text);
              executeAction(action);
            }
          }
        }

        // Handle speech-final (user finished speaking)
        if (message.type === 'speech-final' && message.transcript) {
          const text = message.transcript;
          if (typeof text === 'string') {
            const action = executorRef.current?.parseCommand(text);
            if (action) {
              console.log('[useVoiceActions] Parsed action from speech-final:', action);
              addMessage('user', text);
              executeAction(action);
            }
          }
        }
      } catch (error) {
        console.error('[useVoiceActions] Error handling message:', error);
      }
    };

    vapi.on('message', handleMessage);

    return () => {
      vapi.off('message', handleMessage);
    };
  }, [isVoiceActive, addMessage]);

  const executeAction = async (action: Action) => {
    if (!executorRef.current) return;

    setIsProcessing(true);
    setLastAction(action);

    try {
      const result = await executorRef.current.execute(action);
      setLastResult(result);

      // Add result to conversation
      if (result.success) {
        addMessage('assistant', result.message);
      } else {
        addMessage('assistant', `Sorry, I couldn't complete that action: ${result.message}`);
      }

      console.log('[useVoiceActions] Action executed:', { action, result });
    } catch (error) {
      console.error('[useVoiceActions] Error executing action:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addMessage('assistant', `Sorry, an error occurred: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const manualExecute = async (command: string) => {
    if (!executorRef.current) return;

    const action = executorRef.current.parseCommand(command);
    if (action) {
      addMessage('user', command);
      await executeAction(action);
    } else {
      console.warn('[useVoiceActions] Could not parse command:', command);
    }
  };

  return {
    isProcessing,
    lastAction,
    lastResult,
    executeAction,
    manualExecute,
    executor: executorRef.current,
  };
};
