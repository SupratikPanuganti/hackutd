import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

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
  enableAgenticMode: () => Promise<boolean>;
  disableAgenticMode: () => void;
  toggleAssistant: () => void;
  openAssistant: () => void;
  closeAssistant: () => void;
  requestPermissions: () => Promise<AgenticPermissions>;
  markOnboardingComplete: () => void;
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

  useEffect(() => {
    setCurrentContext(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      isEnabled,
      hasPermissions,
    }));
  }, [isEnabled, hasPermissions]);

  const requestPermissions = async (): Promise<AgenticPermissions> => {
    const permissions: AgenticPermissions = { camera: false, microphone: false };
    
    try {
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      permissions.microphone = true;
      micStream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.log('Microphone permission denied:', error);
    }

    try {
      const camStream = await navigator.mediaDevices.getUserMedia({ video: true });
      permissions.camera = true;
      camStream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.log('Camera permission denied:', error);
    }

    setHasPermissions(permissions);
    return permissions;
  };

  const enableAgenticMode = async (): Promise<boolean> => {
    const permissions = await requestPermissions();
    const hasAnyPermission = permissions.camera || permissions.microphone;
    
    if (hasAnyPermission) {
      setIsEnabled(true);
      setIsAssistantOpen(true);
      return true;
    }
    
    return false;
  };

  const disableAgenticMode = () => {
    setIsEnabled(false);
    setIsAssistantOpen(false);
  };

  const toggleAssistant = () => {
    setIsAssistantOpen(prev => !prev);
  };

  const openAssistant = () => {
    setIsAssistantOpen(true);
  };

  const closeAssistant = () => {
    setIsAssistantOpen(false);
  };

  const markOnboardingComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setHasSeenOnboarding(true);
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
        enableAgenticMode,
        disableAgenticMode,
        toggleAssistant,
        openAssistant,
        closeAssistant,
        requestPermissions,
        markOnboardingComplete,
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
