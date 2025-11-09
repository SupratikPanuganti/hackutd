import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { logVapiDebug, logVapiWarn, startVoiceCall, stopVoiceCall } from '@/lib/vapiClient';

interface AgenticPermissions {
  camera: boolean;
  microphone: boolean;
}

interface AgenticContextType {
  isEnabled: boolean;
  hasPermissions: AgenticPermissions;
  isAssistantOpen: boolean;
  sessionId: string;
  currentContext: string;
  hasSeenOnboarding: boolean;
  isVoiceActive: boolean;
  enableAgenticMode: () => Promise<boolean>;
  disableAgenticMode: () => void;
  toggleAssistant: () => void;
  openAssistant: () => void;
  closeAssistant: () => void;
  requestPermissions: () => Promise<AgenticPermissions>;
  markOnboardingComplete: () => void;
  startVoiceAssistant: () => Promise<void>;
  stopVoiceAssistant: () => Promise<void>;
}

const AgenticContext = createContext<AgenticContextType | undefined>(undefined);

const STORAGE_KEY = 'tcare_agentic_mode';
const ONBOARDING_KEY = 'tcare_agentic_onboarding';

export const AgenticProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const location = useLocation();
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

  useEffect(() => {
    setCurrentContext(location.pathname);
    logVapiDebug("Agentic context route change", { pathname: location.pathname });
  }, [location.pathname]);

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
    setIsEnabled(false);
    setIsAssistantOpen(false);
    if (isVoiceActive) {
      stopVoiceCall().catch((error) => {
        logVapiWarn("Error stopping voice on disable", error);
      });
      setIsVoiceActive(false);
    }
    logVapiDebug("Agentic mode disabled");
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
      logVapiDebug("Starting voice assistant");
      const introMessage = "Hello! I'm Tee, your T-Care AI assistant. How can I help you today?";
      await startVoiceCall(introMessage);
      setIsVoiceActive(true);
      logVapiDebug("Voice assistant started successfully");
    } catch (error) {
      logVapiWarn("Failed to start voice assistant", error);
      setIsVoiceActive(false);
      throw error;
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
        enableAgenticMode,
        disableAgenticMode,
        toggleAssistant,
        openAssistant,
        closeAssistant,
        requestPermissions,
        markOnboardingComplete,
        startVoiceAssistant,
        stopVoiceAssistant,
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
