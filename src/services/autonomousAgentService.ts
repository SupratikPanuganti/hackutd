import { useNavigate } from 'react-router-dom';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export interface AgenticAction {
  type:
    | 'navigate'
    | 'click'
    | 'expand_faq'
    | 'view_device_details'
    | 'select_tower'
    | 'query_chatbot'
    | 'input_text'
    | 'scroll'
    | 'speak'
    | 'wait'
    | 'complete';
  target?: string;
  elementId?: string;
  value?: string;
  reasoning: string;
  confidence: number;
  nextAction?: AgenticAction;
}

export interface AgenticDecision {
  primaryAction: AgenticAction;
  fallbackActions: AgenticAction[];
  conversationStrategy: string;
  estimatedSteps: number;
  shouldTakeControl: boolean;
}

export interface AgenticContext {
  currentPage: string;
  pageLabel: string;
  availablePages: string[];
  visibleContent?: string;
  currentSentiment: number;
  sentimentLabel: string;
  sentimentTrend: 'improving' | 'declining' | 'stable';
  recentMessages: Array<{ role: string; content: string }>;
  userLastInput?: string;
  sessionId: string;
  conversationGoal?: string;
}

/**
 * Autonomous Agent Service - Frontend executor
 * Calls Nemotron backend and executes autonomous actions
 */
export class AutonomousAgentService {
  private navigate: ((path: string) => void) | null = null;
  private onSpeak: ((message: string) => void) | null = null;

  /**
   * Set navigation function (from React Router)
   */
  setNavigate(navigate: (path: string) => void) {
    this.navigate = navigate;
  }

  /**
   * Set speech output function (Vapi or other TTS)
   */
  setSpeakFunction(fn: (message: string) => void) {
    this.onSpeak = fn;
  }

  /**
   * Get autonomous decision from Nemotron
   */
  async getDecision(context: AgenticContext): Promise<AgenticDecision> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/agent/decide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(context),
      });

      if (!response.ok) {
        throw new Error(`Agent decision failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('[AutonomousAgent] Decision received:', result.decision);

      return result.decision;
    } catch (error) {
      console.error('[AutonomousAgent] Error getting decision:', error);
      throw error;
    }
  }

  /**
   * Execute an autonomous action
   */
  async executeAction(action: AgenticAction): Promise<string> {
    // Allow concurrent execution - user might speak while previous action is running
    // The duplicate detection in the hook will prevent processing the same message twice

    try {
      console.log('[✨ EXECUTING]', action.type, '→', action.target || action.value || '');

      switch (action.type) {
        case 'navigate':
          return await this.executeNavigation(action.target!);

        case 'click':
          return await this.clickElement(action.target!);

        case 'expand_faq':
          return await this.expandFAQ(action.target!);

        case 'view_device_details':
          return await this.viewDeviceDetails(action.target!);

        case 'select_tower':
          return await this.selectTower(action.target!);

        case 'query_chatbot':
          return await this.queryKnowledgeBase(action.value || action.target!);

        case 'input_text':
          return await this.inputText(action.value!);

        case 'scroll':
          return await this.scrollToElement(action.target!);

        case 'speak':
          return await this.speak(action.target || action.value!);

        case 'wait':
          console.log('[AutonomousAgent] Waiting for user input');
          return 'Waiting for user';

        case 'complete':
          console.log('[AutonomousAgent] Task completed');
          return 'Task completed';

        default:
          return `Unknown action type: ${action.type}`;
      }
    } catch (error) {
      console.error('[❌ ACTION ERROR]', action.type, error);
      return `Error executing ${action.type}`;
    }
  }

  /**
   * Execute a chain of actions autonomously
   */
  async executeChain(decision: AgenticDecision): Promise<void> {
    console.log('[AutonomousAgent] Executing autonomous chain:', {
      steps: decision.estimatedSteps,
      strategy: decision.conversationStrategy,
    });

    let currentAction: AgenticAction | undefined = decision.primaryAction;
    let step = 1;

    while (currentAction && step <= decision.estimatedSteps) {
      console.log(`[AutonomousAgent] Step ${step}/${decision.estimatedSteps}`);

      try {
        const result = await this.executeAction(currentAction);
        console.log(`[AutonomousAgent] Step ${step} result:`, result);

        // Move to next action in chain
        currentAction = currentAction.nextAction;
        step++;

        // Small delay between actions for natural flow (reduced for faster response)
        if (currentAction) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.error(`[AutonomousAgent] Step ${step} failed:`, error);

        // Try fallback action if available
        if (decision.fallbackActions.length > 0) {
          console.log('[AutonomousAgent] Trying fallback action');
          currentAction = decision.fallbackActions.shift();
        } else {
          throw error;
        }
      }
    }

    console.log('[AutonomousAgent] Chain execution completed');
  }

  /**
   * Navigate to a page
   */
  private async executeNavigation(path: string): Promise<string> {
    if (!this.navigate) {
      throw new Error('Navigate function not set');
    }

    console.log('[🧭 NAVIGATING]', path);

    // Navigate FIRST (immediate response)
    this.navigate(path);

    // THEN announce via speech (so user sees page change immediately)
    const pageLabel = this.getPageLabel(path);
    if (this.onSpeak) {
      // Minimal delay to let page start rendering
      await new Promise((resolve) => setTimeout(resolve, 200));
      await this.speak(`Here's ${pageLabel}`);
    }

    return `Navigated to ${path}`;
  }

  /**
   * Query the knowledge base / chatbot for context
   */
  private async queryKnowledgeBase(question: string): Promise<string> {
    console.log(`[AutonomousAgent] Querying knowledge base: "${question}"`);

    // In a real implementation, this would query your RAG/knowledge base
    // For now, we'll use simple heuristics

    // You could integrate with:
    // - Gemini API for general questions
    // - Supabase stored procedures for product info
    // - Your existing decision engine

    // Placeholder: Return mock answer based on question keywords
    let answer = '';

    if (question.toLowerCase().includes('plan')) {
      answer = 'We have three main plans: Magenta Basic ($60/mo), Magenta Plus ($80/mo), and Magenta Max ($100/mo). All include unlimited talk, text, and 5G data.';
    } else if (question.toLowerCase().includes('device') || question.toLowerCase().includes('phone')) {
      answer = 'We have a range of devices from $449 to $999, including iPhone 15, iPhone 16 Pro, Samsung Galaxy S25, Google Pixel 9, and more. All support 5G.';
    } else if (question.toLowerCase().includes('network') || question.toLowerCase().includes('coverage')) {
      answer = 'Our network has extensive 5G coverage nationwide with 99% reliability. You can check specific tower status on the Network Status page.';
    } else {
      answer = 'I can help you with plans, devices, or network questions. What specifically would you like to know?';
    }

    console.log(`[AutonomousAgent] Knowledge base answer: ${answer.substring(0, 100)}...`);

    return answer;
  }

  /**
   * Speak a message via Vapi or TTS
   * This OVERRIDES any ongoing Vapi response
   */
  private async speak(message: string): Promise<string> {
    console.log(`[AutonomousAgent] 🔊 Speaking: "${message}"`);

    if (this.onSpeak) {
      // Send message to Vapi - this should interrupt any ongoing response
      this.onSpeak(message);

      // Wait a bit for the speech to be processed
      await new Promise((resolve) => setTimeout(resolve, 500));
    } else {
      console.warn('[AutonomousAgent] ⚠️ No speak function set');
    }

    return 'Message spoken';
  }

  /**
   * Click a generic element by text content or description
   */
  private async clickElement(description: string): Promise<string> {
    console.log(`[AutonomousAgent] Clicking element: "${description}"`);

    try {
      // Find element by text content, aria-label, or button text
      const element = this.findElementByDescription(description);

      if (element) {
        element.click();
        await new Promise((resolve) => setTimeout(resolve, 500)); // Wait for animation
        return `Clicked "${description}"`;
      }

      return `Element "${description}" not found`;
    } catch (error) {
      console.error('[AutonomousAgent] Click error:', error);
      return `Failed to click "${description}"`;
    }
  }

  /**
   * Expand FAQ accordion item
   */
  private async expandFAQ(question: string): Promise<string> {
    console.log(`[AutonomousAgent] Expanding FAQ: "${question}"`);

    try {
      // Find accordion trigger with matching text
      const triggers = document.querySelectorAll('[data-state]');

      for (const trigger of Array.from(triggers)) {
        const text = trigger.textContent || '';
        if (text.toLowerCase().includes(question.toLowerCase()) ||
            question.toLowerCase().includes(text.toLowerCase().substring(0, 20))) {
          (trigger as HTMLElement).click();
          await new Promise((resolve) => setTimeout(resolve, 300)); // Wait for animation
          return `Expanded FAQ: "${question}"`;
        }
      }

      return `FAQ "${question}" not found`;
    } catch (error) {
      console.error('[AutonomousAgent] FAQ expand error:', error);
      return `Failed to expand FAQ "${question}"`;
    }
  }

  /**
   * Click View Details on a device card
   */
  private async viewDeviceDetails(deviceName: string): Promise<string> {
    console.log(`[AutonomousAgent] Viewing device details: "${deviceName}"`);

    try {
      // Find device card by name
      const cards = document.querySelectorAll('[class*="Card"]');

      for (const card of Array.from(cards)) {
        const cardText = card.textContent || '';
        if (cardText.includes(deviceName)) {
          // Find "View Details" button in this card
          const detailsButton = card.querySelector('button');
          if (detailsButton && detailsButton.textContent?.includes('Details')) {
            detailsButton.click();
            await new Promise((resolve) => setTimeout(resolve, 500));
            return `Viewing details for "${deviceName}"`;
          }
        }
      }

      return `Device "${deviceName}" or View Details button not found`;
    } catch (error) {
      console.error('[AutonomousAgent] View device error:', error);
      return `Failed to view device "${deviceName}"`;
    }
  }

  /**
   * Select a tower on the network status map
   */
  private async selectTower(towerId: string): Promise<string> {
    console.log(`[AutonomousAgent] Selecting tower: "${towerId}"`);

    try {
      // Find tower by ID in the list or map
      const towerElements = document.querySelectorAll('[class*="tower"], [data-tower-id]');

      for (const element of Array.from(towerElements)) {
        const text = element.textContent || '';
        const dataId = element.getAttribute('data-tower-id');

        if (text.includes(towerId) || dataId === towerId) {
          (element as HTMLElement).click();
          await new Promise((resolve) => setTimeout(resolve, 500));
          return `Selected tower "${towerId}"`;
        }
      }

      return `Tower "${towerId}" not found`;
    } catch (error) {
      console.error('[AutonomousAgent] Select tower error:', error);
      return `Failed to select tower "${towerId}"`;
    }
  }

  /**
   * Input text into chatbot or form
   */
  private async inputText(text: string): Promise<string> {
    console.log(`[AutonomousAgent] Inputting text: "${text.substring(0, 50)}..."`);

    try {
      // Find textarea or input field
      const textarea = document.querySelector('textarea, input[type="text"]') as HTMLInputElement;

      if (textarea) {
        // Set value
        textarea.value = text;

        // Trigger input event
        const event = new Event('input', { bubbles: true });
        textarea.dispatchEvent(event);

        // Find and click send button
        const sendButton = document.querySelector('button[type="submit"], button:has(svg)') as HTMLButtonElement;
        if (sendButton) {
          await new Promise((resolve) => setTimeout(resolve, 300));
          sendButton.click();
          return `Sent message: "${text.substring(0, 50)}..."`;
        }

        return `Text entered but send button not found`;
      }

      return 'Input field not found';
    } catch (error) {
      console.error('[AutonomousAgent] Input text error:', error);
      return `Failed to input text`;
    }
  }

  /**
   * Scroll to an element
   */
  private async scrollToElement(description: string): Promise<string> {
    console.log(`[AutonomousAgent] Scrolling to: "${description}"`);

    try {
      const element = this.findElementByDescription(description);

      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        await new Promise((resolve) => setTimeout(resolve, 500));
        return `Scrolled to "${description}"`;
      }

      return `Element "${description}" not found`;
    } catch (error) {
      console.error('[AutonomousAgent] Scroll error:', error);
      return `Failed to scroll to "${description}"`;
    }
  }

  /**
   * Find element by text content or description
   */
  private findElementByDescription(description: string): HTMLElement | null {
    // Try exact text match first
    const allElements = document.querySelectorAll('*');

    for (const element of Array.from(allElements)) {
      const text = element.textContent?.trim() || '';
      const ariaLabel = element.getAttribute('aria-label') || '';

      if (
        text === description ||
        text.includes(description) ||
        ariaLabel.includes(description)
      ) {
        return element as HTMLElement;
      }
    }

    // Try button with matching text
    const buttons = document.querySelectorAll('button');
    for (const button of Array.from(buttons)) {
      if (button.textContent?.includes(description)) {
        return button;
      }
    }

    return null;
  }

  /**
   * Get user-friendly page label
   */
  private getPageLabel(path: string): string {
    const labels: Record<string, string> = {
      '/': 'Home',
      '/plans': 'Plans',
      '/devices': 'Devices',
      '/status': 'Network Status',
      '/help': 'Help',
      '/assist': 'AI Assistant',
    };

    return labels[path] || path;
  }
}

// Singleton instance
export const autonomousAgentService = new AutonomousAgentService();
