import { useLocation } from 'react-router-dom';
import { useMemo } from 'react';

interface PageContext {
  path: string;
  name: string;
  description: string;
  quickPrompts: string[];
}

export const usePageContext = (): PageContext => {
  const location = useLocation();

  const context = useMemo(() => {
    switch (location.pathname) {
      case '/':
        return {
          path: '/',
          name: 'Home',
          description: 'Welcome to T-Care',
          quickPrompts: [
            'What services do you offer?',
            'How do I get started?',
            'Check service availability',
          ],
        };
      case '/plans':
        return {
          path: '/plans',
          name: 'Plans',
          description: 'Browse our service plans',
          quickPrompts: [
            'Compare plan features',
            'Which plan is best for me?',
            'What are the data limits?',
            'Can I change my plan later?',
          ],
        };
      case '/devices':
        return {
          path: '/devices',
          name: 'Devices',
          description: 'Explore compatible devices',
          quickPrompts: [
            'Is my device compatible?',
            'How do I set up my device?',
            'Troubleshoot device issues',
            'Which devices do you recommend?',
          ],
        };
      case '/status':
        return {
          path: '/status',
          name: 'Network',
          description: 'Check network status',
          quickPrompts: [
            'Check network status',
            'Report connectivity issue',
            'Why is my connection slow?',
            'Are there any outages?',
          ],
        };
      case '/help':
        return {
          path: '/help',
          name: 'Help',
          description: 'Get help and support',
          quickPrompts: [
            'I need help with my service',
            'How do I contact support?',
            'Troubleshoot my issue',
            'Account and billing questions',
          ],
        };
      case '/assist':
        return {
          path: '/assist',
          name: 'AI Assistant',
          description: 'AI-powered support',
          quickPrompts: [
            'Help me troubleshoot',
            'Explain my options',
            'Guide me through setup',
          ],
        };
      default:
        return {
          path: location.pathname,
          name: 'T-Care',
          description: 'How can we help?',
          quickPrompts: [
            'I need assistance',
            'Tell me more',
            'Help me get started',
          ],
        };
    }
  }, [location.pathname]);

  return context;
};
