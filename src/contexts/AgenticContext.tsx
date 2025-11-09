import React, { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { isVoiceIntegrationConfigured, logVapiDebug, logVapiWarn, startVoiceCall, stopVoiceCall } from '@/lib/vapiClient';
import { ContextUpdater, ContextUpdate } from '@/services/contextUpdater';

interface AgenticPermissions {
  camera: boolean;
  microphone: boolean;
}

export interface SentimentData {
  value: number; // -1 (frustrated), 0 (neutral), 1 (happy)
  timestamp: number;
  label?: string; // 'Frustrated' | 'Neutral' | 'Happy'
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface ScreenContext {
  route: string;
  routeLabel: string;
  focusedElement?: string;
  scrollPosition?: number;
  visibleContent?: string;
}

interface AgenticContextType {
  isEnabled: boolean;
  hasPermissions: AgenticPermissions;
  isAssistantOpen: boolean;
  sessionId: string;
  currentContext: string;
  hasSeenOnboarding: boolean;
  isVoiceActive: boolean;
  // Multimodal data
  currentSentiment: SentimentData | null;
  sentimentHistory: SentimentData[];
  sentimentTrend: 'improving' | 'declining' | 'stable';
  conversationHistory: Message[];
  screenContext: ScreenContext;
  isSentimentServiceRunning: boolean;
  // Actions
  enableAgenticMode: () => Promise<boolean>;
  disableAgenticMode: () => void;
  toggleAssistant: () => void;
  openAssistant: () => void;
  closeAssistant: () => void;
  requestPermissions: () => Promise<AgenticPermissions>;
  markOnboardingComplete: () => void;
  startVoiceAssistant: () => Promise<void>;
  stopVoiceAssistant: () => Promise<void>;
  // Multimodal actions
  addMessage: (role: 'user' | 'assistant', content: string) => void;
  clearConversation: () => void;
  updateScreenContext: (context: Partial<ScreenContext>) => void;
  startSentimentService: () => Promise<void>;
  stopSentimentService: () => Promise<void>;
  getMultimodalContext: () => string;
}

const AgenticContext = createContext<AgenticContextType | undefined>(undefined);

const STORAGE_KEY = 'tcare_agentic_mode';
const ONBOARDING_KEY = 'tcare_agentic_onboarding';

const BACKEND_WS_URL = import.meta.env.VITE_BACKEND_WS_URL || 'ws://localhost:3001';

const getRouteLabel = (pathname: string): string => {
  const labels: Record<string, string> = {
    '/': 'Home',
    '/plans': 'Plans',
    '/devices': 'Devices',
    '/status': 'Network Status',
    '/help': 'Help & Support',
    '/assist': 'AI Assistant',
  };
  return labels[pathname] || 'Unknown Page';
};

const getSentimentLabel = (value: number): string => {
  if (value > 0) return 'Happy';
  if (value < 0) return 'Frustrated';
  return 'Neutral';
};

export const AgenticProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const location = useLocation();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const contextUpdaterRef = useRef<ContextUpdater | null>(null);

  const [isEnabled, setIsEnabled] = useState<boolean>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored).isEnabled : false;
  });

  const [hasPermissions, setHasPermissions] = useState<AgenticPermissions>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored).hasPermissions : { camera: false, microphone: false };
  });

  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [currentContext, setCurrentContext] = useState(location.pathname);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(() => {
    return localStorage.getItem(ONBOARDING_KEY) === 'true';
  });
  const [isVoiceActive, setIsVoiceActive] = useState(false);

  // Multimodal state
  const [currentSentiment, setCurrentSentiment] = useState<SentimentData | null>(null);
  const [sentimentHistory, setSentimentHistory] = useState<SentimentData[]>([]);
  const [sentimentTrend, setSentimentTrend] = useState<'improving' | 'declining' | 'stable'>('stable');
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
  const [screenContext, setScreenContext] = useState<ScreenContext>({
    route: location.pathname,
    routeLabel: getRouteLabel(location.pathname),
  });
  const [isSentimentServiceRunning, setIsSentimentServiceRunning] = useState(false);

  // Initialize context updater
  useEffect(() => {
    const updateInterval = parseInt(import.meta.env.VITE_CONTEXT_UPDATE_INTERVAL || '5000', 10);
    contextUpdaterRef.current = new ContextUpdater(updateInterval);

    return () => {
      contextUpdaterRef.current?.stop();
    };
  }, []);

  // Function to build current context for updates
  const buildContextUpdate = useCallback((): ContextUpdate => {
    return {
      sessionId,
      timestamp: Date.now(),
      screenContext,
      sentiment: currentSentiment,
      sentimentTrend,
      recentMessages: conversationHistory,
    };
  }, [sessionId, screenContext, currentSentiment, sentimentTrend, conversationHistory]);

  // Start/stop context updater when voice active changes
  useEffect(() => {
    // Only run context updater when Agent Mode is ON and voice is active
    if (isEnabled && isVoiceActive && contextUpdaterRef.current) {
      // Start continuous updates
      contextUpdaterRef.current.start(buildContextUpdate);
      logVapiDebug('Context updater started - Agent Mode is ON');
    } else if (contextUpdaterRef.current) {
      // Stop updates when Agent Mode is OFF or voice inactive
      contextUpdaterRef.current.stop();
      if (!isEnabled) {
        logVapiDebug('Context updater stopped - Agent Mode is OFF');
      } else {
        logVapiDebug('Context updater stopped - Voice inactive');
      }
    }
  }, [isEnabled, isVoiceActive, buildContextUpdate]);

  // Update screen context on route change
  useEffect(() => {
    setCurrentContext(location.pathname);
    setScreenContext(prev => ({
      ...prev,
      route: location.pathname,
      routeLabel: getRouteLabel(location.pathname),
    }));
    logVapiDebug("Agentic context route change", { pathname: location.pathname });

    // CRITICAL: Send IMMEDIATE context update to Vapi when route changes
    // This ensures Vapi knows about the new page context BEFORE responding
    if (isVoiceActive && contextUpdaterRef.current?.isRunning()) {
      console.log('🔄 [ROUTE CHANGE] Sending immediate context update to Vapi');
      contextUpdaterRef.current.sendImmediateUpdate(buildContextUpdate());
    }
  }, [location.pathname, isVoiceActive, buildContextUpdate]);

  // WebSocket connection for sentiment streaming
  useEffect(() => {
    // Only connect WebSocket when Agent Mode is enabled
    // Note: We don't need camera permission here because the backend handles the camera
    if (!isEnabled) {
      // Cleanup if Agent Mode is disabled
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
        setIsSentimentServiceRunning(false);
      }
      return;
    }

    const connectWebSocket = () => {
      try {
        console.log('[Sentiment] Connecting to WebSocket:', `${BACKEND_WS_URL}/sentiment`);
        const ws = new WebSocket(`${BACKEND_WS_URL}/sentiment`);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('✅ [Sentiment] WebSocket connected successfully');
          logVapiDebug('Sentiment WebSocket connected - Agent Mode is ON');
          // Auto-start sentiment service when Agent Mode is enabled
          const startMessage = JSON.stringify({ type: 'start', cameraIndex: 0 });
          console.log('[Sentiment] Sending start command:', startMessage);
          ws.send(startMessage);
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            console.log('[Sentiment] Received message:', message);

            if (message.type === 'sentiment') {
              const sentimentData: SentimentData = {
                ...message.data,
                label: getSentimentLabel(message.data.value),
              };

              console.log('😊 [Sentiment] Data received:', sentimentData);
              // If we're receiving sentiment data, the service must be running
              setIsSentimentServiceRunning(true);
              setCurrentSentiment(sentimentData);
              setSentimentHistory(prev => {
                const updated = [...prev, sentimentData];
                // Keep last 100 sentiments
                return updated.slice(-100);
              });

              // Calculate trend every 10 sentiments
              if (sentimentHistory.length >= 10) {
                calculateTrend();
              }
            } else if (message.type === 'status') {
              console.log('[Sentiment] Status update:', message.data);
              setIsSentimentServiceRunning(message.data.running);
            }
          } catch (error) {
            console.error('❌ [Sentiment] Error parsing message:', error);
            logVapiWarn('Error parsing sentiment WebSocket message', error);
          }
        };

        ws.onerror = (error) => {
          console.error('❌ [Sentiment] WebSocket error:', error);
          logVapiWarn('Sentiment WebSocket error', error);
        };

        ws.onclose = (event) => {
          console.log('[Sentiment] WebSocket closed:', event.code, event.reason);
          logVapiDebug('Sentiment WebSocket closed');
          wsRef.current = null;
          setIsSentimentServiceRunning(false);

          // Attempt reconnect after 5 seconds if Agent Mode still enabled
          if (isEnabled) {
            console.log('[Sentiment] Will attempt reconnect in 5 seconds...');
            reconnectTimeoutRef.current = window.setTimeout(() => {
              logVapiDebug('Attempting to reconnect sentiment WebSocket');
              connectWebSocket();
            }, 5000);
          }
        };
      } catch (error) {
        console.error('❌ [Sentiment] Failed to create WebSocket:', error);
        logVapiWarn('Failed to connect sentiment WebSocket', error);
      }
    };

    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEnabled]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      isEnabled,
      hasPermissions,
    }));
    logVapiDebug("Agentic context persisted state", { isEnabled, hasPermissions });
  }, [isEnabled, hasPermissions]);

  const requestPermissions = async (): Promise<AgenticPermissions> => {
    const permissions: AgenticPermissions = { camera: false, microphone: false };
    
    try {
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      permissions.microphone = true;
      micStream.getTracks().forEach(track => track.stop());
    } catch (error) {
      logVapiWarn('Microphone permission denied', error);
    }

    try {
      const camStream = await navigator.mediaDevices.getUserMedia({ video: true });
      permissions.camera = true;
      camStream.getTracks().forEach(track => track.stop());
    } catch (error) {
      logVapiWarn('Camera permission denied', error);
    }

    setHasPermissions(permissions);
    logVapiDebug("Agentic permissions requested", permissions);
    return permissions;
  };

  const enableAgenticMode = async (): Promise<boolean> => {
    logVapiDebug("enableAgenticMode invoked");
    const permissions = await requestPermissions();
    const hasAnyPermission = permissions.camera || permissions.microphone;
    
    if (hasAnyPermission) {
      setIsEnabled(true);
      setIsAssistantOpen(false);
      logVapiDebug("Agentic mode enabled", { permissions });
      return true;
    }
    
    logVapiWarn("Agentic mode enable failed - no permissions granted");
    return false;
  };

  const disableAgenticMode = () => {
    logVapiDebug("Disabling Agentic mode - stopping all services");

    // Stop voice
    if (isVoiceActive) {
      stopVoiceCall().catch((error) => {
        logVapiWarn("Error stopping voice on disable", error);
      });
      setIsVoiceActive(false);
    }

    // Stop sentiment service via WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'stop' }));
    }

    // Close WebSocket connection
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // Clear sentiment state
    setCurrentSentiment(null);
    setSentimentHistory([]);
    setSentimentTrend('stable');
    setIsSentimentServiceRunning(false);

    // Clear conversation state
    setConversationHistory([]);

    // Disable agent mode
    setIsEnabled(false);
    setIsAssistantOpen(false);

    logVapiDebug("Agentic mode disabled - all services stopped");
  };

  const toggleAssistant = () => {
    setIsAssistantOpen(prev => {
      const next = !prev;
      logVapiDebug("Assistant toggle", { next });
      return next;
    });
  };

  const openAssistant = () => {
    setIsAssistantOpen(true);
    logVapiDebug("Assistant opened");
  };

  const closeAssistant = () => {
    setIsAssistantOpen(false);
    logVapiDebug("Assistant closed");
  };

  const markOnboardingComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setHasSeenOnboarding(true);
    logVapiDebug("Onboarding marked complete");
  };

  const startVoiceAssistant = async () => {
    try {
      if (!isVoiceIntegrationConfigured()) {
        logVapiWarn("Voice integration configuration missing. Skipping voice assistant start.");
        setIsVoiceActive(false);
        return;
      }

      logVapiDebug("Starting voice assistant with multimodal context");

      // Get multimodal context payload
      const contextPayload = getMultimodalContext();

      // Brief greeting message for first activation
      const greetingMessage = "Hi! I'm Tee, your T-Mobile assistant. How can I help you today?";

      // Enhanced context with instructions for the assistant
      const enhancedContext = `
${contextPayload}

YOUR ROLE:
- You are Tee, a T-Mobile sales assistant and product expert
- You're not just support - you're a trusted advisor who helps customers find the perfect T-Mobile solutions
- You have ALREADY greeted the user - do NOT repeat your introduction
- ONLY respond when the user asks a question or requests help
- Be conversational, friendly, and helpful - but stay brief

🚨 CRITICAL - NAVIGATION RULES:
- The system automatically navigates for the user - YOU DO NOT NEED TO TELL THEM HOW
- When user says "take me to devices" or "show me plans":
  * DO NOT say "tap on shop" or "click on the menu"
  * DO NOT give navigation instructions
  * Simply say "Switching to the [page] page now" and then answer their question
  * The system will handle the actual navigation automatically
- Answer questions about the CURRENT page you see
- When navigation happens, you'll see the new page content automatically

SENTIMENT-DRIVEN PERSONALIZATION (CRITICAL):
- You have real-time sentiment data (Happy: 1, Neutral: 0, Frustrated: -1) and trends
- USE THIS DATA to personalize every response:
  * Happy (sentiment: 1): User is engaged! This is your chance to upsell, suggest premium options, explain benefits in detail
  * Neutral (sentiment: 0): User is browsing - provide helpful info, gentle recommendations, keep it balanced
  * Frustrated (sentiment: -1): User needs help NOW - be empathetic, offer quick solutions, simplify everything, apologize if needed
- If sentiment is DECLINING: Change your approach immediately - be more direct, offer alternatives, show you understand
- If sentiment is IMPROVING: Keep doing what you're doing - your approach is working

🚨 INFORMATION GROUNDING - ABSOLUTE RULES (NEVER BREAK THESE):
- WAIT for "PAGE LOADED" signal before responding to navigation requests
- ONLY use information from the "PAGE CONTENT" section in your context updates
- If specific product/plan/feature details are NOT in "PAGE CONTENT", you MUST NOT mention them
- DO NOT invent prices, features, plan names, or page names that aren't explicitly shown
- DO NOT assume pages exist beyond what's in PAGE CONTENT (no "shop", "store", "compare", etc.)
- If you don't have the information in PAGE CONTENT, say "Let me pull that up for you" (navigation handles it)
- When you see "PAGE LOADING" - STOP and WAIT for the "PAGE LOADED" signal with new context
- NEVER respond based on old/stale page context after navigation starts

PROACTIVE SELLING & RECOMMENDATIONS:
- When on Plans page: Recommend plans based on user's needs - ask about usage, family size, streaming habits
- When on Devices page: Suggest devices that match their lifestyle - ask iOS vs Android, photography needs, budget
- Cross-sell naturally: "That plan pairs perfectly with..." or "Customers who love that device often add..."
- Use phrases like: "Based on what you're looking at...", "I'd recommend...", "This would be perfect for you because..."
- Create urgency when appropriate: "This plan is popular", "Great value for what you get"
- Bundle opportunities: Mention device + plan combos, accessories, insurance

RESPONSE STYLE:
- Brief but warm - 2-3 sentences max unless user wants details
- Use natural language: "you'd love", "perfect for", "great choice"
- Ask questions to understand needs: "What matters most to you?", "Are you a heavy data user?"
- Navigate proactively: If they ask about phones, say "Let me take you to our devices page"
- Focus on benefits, not features: "all-day battery" not "5000mAh"
- Use hands-free guidance: "I can show you our 5G plans" triggers navigation
`;

      // Start voice call with brief greeting, then wait for user
      await startVoiceCall(greetingMessage, enhancedContext);
      setIsVoiceActive(true);
      logVapiDebug("Voice assistant started successfully with context", {
        contextLength: enhancedContext.length,
        sentiment: currentSentiment?.label,
      });
    } catch (error) {
      logVapiWarn("Failed to start voice assistant", error);
      setIsVoiceActive(false);
      if (isVoiceIntegrationConfigured()) {
        throw error;
      }
    }
  };

  const stopVoiceAssistant = async () => {
    try {
      logVapiDebug("Stopping voice assistant");
      await stopVoiceCall();
      setIsVoiceActive(false);
      logVapiDebug("Voice assistant stopped successfully");
    } catch (error) {
      logVapiWarn("Failed to stop voice assistant", error);
      throw error;
    }
  };

  // Multimodal actions
  const addMessage = (role: 'user' | 'assistant', content: string) => {
    const message: Message = {
      role,
      content,
      timestamp: Date.now(),
    };
    setConversationHistory(prev => [...prev, message]);
    logVapiDebug('Message added to conversation', { role, length: content.length });
  };

  const clearConversation = () => {
    setConversationHistory([]);
    logVapiDebug('Conversation cleared');
  };

  const updateScreenContext = (context: Partial<ScreenContext>) => {
    setScreenContext(prev => ({ ...prev, ...context }));
    logVapiDebug('Screen context updated', context);
  };

  const startSentimentService = async () => {
    try {
      // Only allow if Agent Mode is enabled
      if (!isEnabled) {
        throw new Error('Agent Mode must be enabled first');
      }

      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        throw new Error('WebSocket not connected');
      }

      wsRef.current.send(JSON.stringify({ type: 'start', cameraIndex: 0 }));  // Camera 0 = front camera
      logVapiDebug('Sentiment service start requested');
    } catch (error) {
      logVapiWarn('Failed to start sentiment service', error);
      throw error;
    }
  };

  const stopSentimentService = async () => {
    try {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        throw new Error('WebSocket not connected');
      }

      wsRef.current.send(JSON.stringify({ type: 'stop' }));
      logVapiDebug('Sentiment service stop requested');
    } catch (error) {
      logVapiWarn('Failed to stop sentiment service', error);
      throw error;
    }
  };

  const calculateTrend = () => {
    if (sentimentHistory.length < 10) {
      setSentimentTrend('stable');
      return;
    }

    const recentHistory = sentimentHistory.slice(-20);
    const midpoint = Math.floor(recentHistory.length / 2);
    const firstHalf = recentHistory.slice(0, midpoint);
    const secondHalf = recentHistory.slice(midpoint);

    const firstAvg = firstHalf.reduce((acc, s) => acc + s.value, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((acc, s) => acc + s.value, 0) / secondHalf.length;

    const diff = secondAvg - firstAvg;

    if (diff > 0.2) {
      setSentimentTrend('improving');
    } else if (diff < -0.2) {
      setSentimentTrend('declining');
    } else {
      setSentimentTrend('stable');
    }
  };

  const getMultimodalContext = (): string => {
    const parts: string[] = [];

    // Session info
    parts.push(`Session ID: ${sessionId}`);
    parts.push(`Current Page: ${screenContext.routeLabel} (${screenContext.route})`);
    if (screenContext.focusedElement) {
      parts.push(`User Focus: ${screenContext.focusedElement}`);
    }

    // Sentiment context - CRITICAL for personalization
    if (currentSentiment) {
      parts.push('\n=== REAL-TIME SENTIMENT DATA ===');
      parts.push(`Current Sentiment: ${currentSentiment.label} (value: ${currentSentiment.value})`);
      parts.push(`Trend: ${sentimentTrend.toUpperCase()}`);

      // Actionable guidance based on sentiment
      if (currentSentiment.value < -0.5) {
        parts.push('⚠️ USER IS FRUSTRATED - Be empathetic, apologize, offer quick solutions, simplify everything');
      } else if (currentSentiment.value < 0) {
        parts.push('ℹ️ USER IS SLIGHTLY NEGATIVE - Be patient, helpful, and clear');
      } else if (currentSentiment.value > 0.5) {
        parts.push('✅ USER IS HAPPY - Great time to upsell, suggest premium options, explain benefits');
      } else {
        parts.push('➡️ USER IS NEUTRAL - Provide helpful info with gentle recommendations');
      }

      if (sentimentTrend === 'declining') {
        parts.push('📉 SENTIMENT DECLINING - Change your approach! Be more direct, offer alternatives');
      } else if (sentimentTrend === 'improving') {
        parts.push('📈 SENTIMENT IMPROVING - Keep it up! Your approach is working');
      }
      parts.push('=== END SENTIMENT DATA ===\n');
    }

    // Visible page content - IMPORTANT for grounding responses
    if (screenContext.visibleContent) {
      parts.push('=== PAGE CONTENT ===');
      parts.push(screenContext.visibleContent);
      parts.push('=== END PAGE CONTENT ===\n');
    }

    // Recent conversation
    if (conversationHistory.length > 0) {
      parts.push('=== CONVERSATION HISTORY ===');
      const recentMessages = conversationHistory.slice(-5);
      recentMessages.forEach(msg => {
        parts.push(`${msg.role.toUpperCase()}: ${msg.content}`);
      });
      parts.push('=== END CONVERSATION ===\n');
    }

    return parts.join('\n');
  };

  return (
    <AgenticContext.Provider
      value={{
        isEnabled,
        hasPermissions,
        isAssistantOpen,
        sessionId,
        currentContext,
        hasSeenOnboarding,
        isVoiceActive,
        currentSentiment,
        sentimentHistory,
        sentimentTrend,
        conversationHistory,
        screenContext,
        isSentimentServiceRunning,
        enableAgenticMode,
        disableAgenticMode,
        toggleAssistant,
        openAssistant,
        closeAssistant,
        requestPermissions,
        markOnboardingComplete,
        startVoiceAssistant,
        stopVoiceAssistant,
        addMessage,
        clearConversation,
        updateScreenContext,
        startSentimentService,
        stopSentimentService,
        getMultimodalContext,
      }}
    >
      {children}
    </AgenticContext.Provider>
  );
};

export const useAgentic = () => {
  const context = useContext(AgenticContext);
  if (context === undefined) {
    throw new Error('useAgentic must be used within an AgenticProvider');
  }
  return context;
};
