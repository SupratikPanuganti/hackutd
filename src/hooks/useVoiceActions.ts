import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAgentic } from '@/contexts/AgenticContext';
import { ActionExecutor, Action, ActionResult } from '@/services/actionExecutor';
import { getVapiClient } from '@/lib/vapiClient';
import { decideNavigation } from '@/services/llmNavigator';

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

  // Execute action function
  const executeAction = useCallback(async (action: Action) => {
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
  }, [addMessage]);

  // Listen to VAPI messages for action commands
  useEffect(() => {
    if (!isVoiceActive) return;

    const vapi = getVapiClient();
    if (!vapi) return;

    const handleMessage = (message: unknown) => {
      try {
        // Log ALL Vapi messages for debugging
        console.log('📨 [VAPI MESSAGE]', {
          type: (message as any)?.type,
          hasTranscript: !!(message as any)?.transcript,
          hasMessage: !!(message as any)?.message,
          fullMessage: message
        });

        // CRITICAL: Add assistant responses to conversation history
        if (message.type === 'conversation-update' && message.conversation) {
          const conversation = message.conversation;
          if (Array.isArray(conversation)) {
            conversation.forEach((msg: any) => {
              if (msg.role === 'assistant' && msg.content && typeof msg.content === 'string') {
                console.log('[useVoiceActions] Assistant response:', msg.content);
                addMessage('assistant', msg.content);
              }
            });
          }
        }

        // Also handle assistant messages directly
        if ((message.type === 'message' || message.type === 'assistant-message') && message.message) {
          const content = message.message.content || message.message;
          if (typeof content === 'string' && content.trim().length > 0) {
            console.log('[useVoiceActions] Assistant message:', content);
            addMessage('assistant', content);
          }
        }

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

        // Handle speech-final (user finished speaking) - PREFERRED
        if ((message as any).type === 'speech-final') {
          const transcript = (message as any).transcript;
          let text = '';

          // Handle different transcript formats
          if (typeof transcript === 'string') {
            text = transcript;
          } else if (transcript && typeof transcript === 'object') {
            text = transcript.text || transcript.content || '';
          }

          console.log('🎤 [SPEECH-FINAL RECEIVED]', { transcriptType: typeof transcript, text });

          if (text && typeof text === 'string' && text.trim().length > 0) {
            console.log('🎤🎤🎤 [USER SPOKE]', text);

            // Add message to conversation
            addMessage('user', text);

            // Ask LLM if we should navigate
            console.log('🤔 [ASKING LLM] Should we navigate?');
            decideNavigation(text).then((decision) => {
              if (decision.shouldNavigate && decision.route) {
                console.log('🎯 [LLM DECISION] Navigate to:', decision.route);
                console.log('📝 [REASONING]', decision.reasoning);

                // Delay navigation by 2 seconds to let Vapi finish speaking
                console.log('⏳ [WAITING] Letting Vapi finish speaking...');
                setTimeout(() => {
                  console.log('🚀 [NAVIGATING NOW]', decision.route);

                  // Send a message to VAPI to indicate page is loading
                  const vapi = getVapiClient();
                  if (vapi) {
                    vapi.send({
                      type: 'add-message',
                      triggerResponseEnabled: false,
                      message: {
                        role: 'system',
                        content: '🔄 PAGE LOADING - Please wait for the new page context before responding. Do NOT respond yet.',
                      },
                    });
                    console.log('📤 [SENT TO VAPI] Page loading message');
                  }

                  navigate(decision.route);
                  console.log('✅ [NAVIGATION COMPLETE]', decision.route);

                  // After navigation, wait for page content to load (1.5 seconds)
                  // The new page will send its context, then we allow VAPI to respond
                  setTimeout(() => {
                    if (vapi) {
                      vapi.send({
                        type: 'add-message',
                        triggerResponseEnabled: true,
                        message: {
                          role: 'system',
                          content: '✅ PAGE LOADED - You now have the updated page context above. You may respond to the user based on the NEW page content.',
                        },
                      });
                      console.log('📤 [SENT TO VAPI] Page loaded, ready to respond');
                    }
                  }, 1500);
                }, 2000);
              } else {
                console.log('ℹ️ [NO NAVIGATION]', decision.reasoning);
              }
            }).catch((err) => {
              console.error('❌ [NAVIGATION ERROR]', err);
            });
          } else {
            console.log('⚠️ [EMPTY TRANSCRIPT]', { transcript });
          }
        }

        // Handle final transcript messages (user finished speaking)
        if (message.type === 'transcript' && message.role === 'user') {
          // Check if it's a final transcript
          const isFinal = message.transcriptType === 'final' || (message as any).isFinal === true;

          if (!isFinal) {
            // Skip non-final transcripts to avoid duplicates
            return;
          }

          const text = message.transcript;
          if (typeof text === 'string' && text.trim().length > 0) {
            console.log('🎤🎤🎤 [USER SPOKE (transcript)]', text);

            // Add message to conversation
            addMessage('user', text);

            // Ask LLM if we should navigate
            console.log('🤔 [ASKING LLM] Should we navigate?');
            decideNavigation(text).then((decision) => {
              if (decision.shouldNavigate && decision.route) {
                console.log('🎯 [LLM DECISION] Navigate to:', decision.route);
                console.log('📝 [REASONING]', decision.reasoning);

                // Delay navigation by 2 seconds to let Vapi finish speaking
                console.log('⏳ [WAITING] Letting Vapi finish speaking...');
                setTimeout(() => {
                  console.log('🚀 [NAVIGATING NOW]', decision.route);

                  // Send a message to VAPI to indicate page is loading
                  const vapi = getVapiClient();
                  if (vapi) {
                    vapi.send({
                      type: 'add-message',
                      triggerResponseEnabled: false,
                      message: {
                        role: 'system',
                        content: '🔄 PAGE LOADING - Please wait for the new page context before responding. Do NOT respond yet.',
                      },
                    });
                    console.log('📤 [SENT TO VAPI] Page loading message');
                  }

                  navigate(decision.route);
                  console.log('✅ [NAVIGATION COMPLETE]', decision.route);

                  // After navigation, wait for page content to load (1.5 seconds)
                  // The new page will send its context, then we allow VAPI to respond
                  setTimeout(() => {
                    if (vapi) {
                      vapi.send({
                        type: 'add-message',
                        triggerResponseEnabled: true,
                        message: {
                          role: 'system',
                          content: '✅ PAGE LOADED - You now have the updated page context above. You may respond to the user based on the NEW page content.',
                        },
                      });
                      console.log('📤 [SENT TO VAPI] Page loaded, ready to respond');
                    }
                  }, 1500);
                }, 2000);
              } else {
                console.log('ℹ️ [NO NAVIGATION]', decision.reasoning);
              }
            }).catch((err) => {
              console.error('❌ [NAVIGATION ERROR]', err);
            });
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
  }, [isVoiceActive, addMessage, executeAction]);

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
