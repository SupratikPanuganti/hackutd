import { NavigateFunction } from 'react-router-dom';

export interface ActionContext {
  navigate: NavigateFunction;
  currentRoute: string;
  userId?: string;
  // Enhanced: Allow custom action handlers from pages
  customHandlers?: Record<string, (params?: Record<string, unknown>) => Promise<void>>;
}

export interface Action {
  type: string;
  params?: Record<string, unknown>;
  description?: string;
  // Enhanced: Element targeting
  elementId?: string;
  elementSelector?: string;
  // Enhanced: Sentiment-triggered
  triggeredBySentiment?: boolean;
}

export interface ActionResult {
  success: boolean;
  message: string;
  data?: unknown;
  error?: string;
}

/**
 * Central action executor for voice commands and AI agent actions
 */
export class ActionExecutor {
  private context: ActionContext;
  private actionHistory: Array<{ action: Action; result: ActionResult; timestamp: number }> = [];

  constructor(context: ActionContext) {
    this.context = context;
  }

  /**
   * Update the navigation context
   */
  updateContext(context: Partial<ActionContext>) {
    this.context = { ...this.context, ...context };
  }

  /**
   * Execute an action based on type
   */
  async execute(action: Action): Promise<ActionResult> {
    console.log('[ActionExecutor] Executing action:', action);

    try {
      let result: ActionResult;

      switch (action.type) {
        case 'navigate':
          result = await this.handleNavigation(action.params);
          break;

        case 'show_plans':
          result = await this.showPlans(action.params);
          break;

        case 'show_devices':
          result = await this.showDevices(action.params);
          break;

        case 'check_network_status':
          result = await this.checkNetworkStatus(action.params);
          break;

        case 'open_help':
          result = await this.openHelp(action.params);
          break;

        case 'get_account_info':
          result = await this.getAccountInfo(action.params);
          break;

        case 'check_usage':
          result = await this.checkUsage(action.params);
          break;

        case 'troubleshoot':
          result = await this.startTroubleshooting(action.params);
          break;

        case 'search':
          result = await this.performSearch(action.params);
          break;

        // ===== ENHANCED ACTIONS =====

        case 'click_element':
          result = await this.clickElement(action);
          break;

        case 'expand_device':
          result = await this.expandDevice(action.params);
          break;

        case 'focus_tower':
          result = await this.focusTower(action.params);
          break;

        case 'show_device_details':
          result = await this.showDeviceDetails(action.params);
          break;

        case 'filter_devices':
          result = await this.filterDevices(action.params);
          break;

        case 'suggest_alternative':
          result = await this.suggestAlternative(action.params);
          break;

        case 'proactive_help':
          result = await this.proactiveHelp(action.params);
          break;

        default:
          // Check for custom handlers from page context
          if (this.context.customHandlers && this.context.customHandlers[action.type]) {
            try {
              await this.context.customHandlers[action.type](action.params);
              result = {
                success: true,
                message: `Custom action '${action.type}' executed`,
              };
            } catch (error) {
              result = {
                success: false,
                message: `Custom action '${action.type}' failed: ${error}`,
                error: 'CUSTOM_ACTION_ERROR',
              };
            }
          } else {
            result = {
              success: false,
              message: `Unknown action type: ${action.type}`,
              error: 'UNKNOWN_ACTION',
            };
          }
      }

      // Store in history
      this.actionHistory.push({
        action,
        result,
        timestamp: Date.now(),
      });

      // Keep last 50 actions
      if (this.actionHistory.length > 50) {
        this.actionHistory.shift();
      }

      return result;
    } catch (error) {
      const errorResult: ActionResult = {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        error: 'EXECUTION_ERROR',
      };

      this.actionHistory.push({
        action,
        result: errorResult,
        timestamp: Date.now(),
      });

      return errorResult;
    }
  }

  /**
   * Parse natural language command into action
   */
  parseCommand(command: string): Action | null {
    const lowerCommand = command.toLowerCase().trim();

    // Navigation commands
    if (lowerCommand.match(/show (me )?(the )?plans?/i)) {
      return { type: 'show_plans', description: 'Show available plans' };
    }
    if (lowerCommand.match(/show (me )?(the )?devices?/i)) {
      return { type: 'show_devices', description: 'Show compatible devices' };
    }
    if (lowerCommand.match(/check (the )?network|network status|connection/i)) {
      return { type: 'check_network_status', description: 'Check network status' };
    }
    if (lowerCommand.match(/help|support|assist(ance)?/i)) {
      return { type: 'open_help', description: 'Open help page' };
    }
    if (lowerCommand.match(/go (to )?home|take me home/i)) {
      return { type: 'navigate', params: { route: '/' }, description: 'Navigate to home' };
    }

    // Account commands
    if (lowerCommand.match(/account|my (account )?info/i)) {
      return { type: 'get_account_info', description: 'Get account information' };
    }
    if (lowerCommand.match(/usage|data usage|how much data/i)) {
      return { type: 'check_usage', description: 'Check data usage' };
    }

    // Troubleshooting
    if (lowerCommand.match(/troubleshoot|fix|not working|problem|issue/i)) {
      const issue = lowerCommand.match(/with (.+)$/)?.[1] || 'general';
      return {
        type: 'troubleshoot',
        params: { issue },
        description: `Troubleshoot ${issue}`,
      };
    }

    // Search
    if (lowerCommand.match(/search (for )?(.+)/i)) {
      const query = lowerCommand.match(/search (for )?(.+)/i)?.[2];
      if (query) {
        return { type: 'search', params: { query }, description: `Search for ${query}` };
      }
    }

    return null;
  }

  /**
   * Get action history
   */
  getHistory(limit: number = 10) {
    return this.actionHistory.slice(-limit);
  }

  // Action handlers

  private async handleNavigation(params?: Record<string, unknown>): Promise<ActionResult> {
    const route = params?.route as string;
    if (!route) {
      return {
        success: false,
        message: 'No route specified',
        error: 'MISSING_PARAM',
      };
    }

    this.context.navigate(route);
    return {
      success: true,
      message: `Navigated to ${route}`,
      data: { route },
    };
  }

  private async showPlans(params?: Record<string, unknown>): Promise<ActionResult> {
    this.context.navigate('/plans');
    return {
      success: true,
      message: 'Showing available plans',
      data: { route: '/plans' },
    };
  }

  private async showDevices(params?: Record<string, unknown>): Promise<ActionResult> {
    this.context.navigate('/devices');
    return {
      success: true,
      message: 'Showing compatible devices',
      data: { route: '/devices' },
    };
  }

  private async checkNetworkStatus(params?: Record<string, unknown>): Promise<ActionResult> {
    this.context.navigate('/status');
    return {
      success: true,
      message: 'Checking network status',
      data: { route: '/status' },
    };
  }

  private async openHelp(params?: Record<string, unknown>): Promise<ActionResult> {
    this.context.navigate('/help');
    return {
      success: true,
      message: 'Opening help and support',
      data: { route: '/help' },
    };
  }

  private async getAccountInfo(params?: Record<string, unknown>): Promise<ActionResult> {
    // In a real app, this would fetch from an API
    // For now, return mock data
    const mockAccountInfo = {
      name: 'T-Mobile Customer',
      planName: 'Magenta MAX',
      phoneNumber: '(555) 123-4567',
      accountBalance: '$0.00',
    };

    return {
      success: true,
      message: 'Retrieved account information',
      data: mockAccountInfo,
    };
  }

  private async checkUsage(params?: Record<string, unknown>): Promise<ActionResult> {
    // Mock usage data
    const mockUsage = {
      dataUsed: '15.2 GB',
      dataLimit: 'Unlimited',
      billingCycle: 'Dec 1 - Dec 31',
      percentUsed: 0,
    };

    return {
      success: true,
      message: "You've used 15.2 GB this billing cycle with unlimited data remaining",
      data: mockUsage,
    };
  }

  private async startTroubleshooting(params?: Record<string, unknown>): Promise<ActionResult> {
    const issue = (params?.issue as string) || 'general';

    // Navigate to assist page for troubleshooting
    this.context.navigate('/assist', {
      state: {
        issue,
        autoStartVoice: true,
      },
    });

    return {
      success: true,
      message: `Starting troubleshooting session for: ${issue}`,
      data: { issue, route: '/assist' },
    };
  }

  private async performSearch(params?: Record<string, unknown>): Promise<ActionResult> {
    const query = params?.query as string;
    if (!query) {
      return {
        success: false,
        message: 'No search query provided',
        error: 'MISSING_PARAM',
      };
    }

    // For now, just acknowledge the search
    // In a real app, this would trigger a search interface
    return {
      success: true,
      message: `Searching for: ${query}`,
      data: { query },
    };
  }

  // ===== ENHANCED ACTION HANDLERS =====

  /**
   * Click a specific element on the page
   */
  private async clickElement(action: Action): Promise<ActionResult> {
    const { elementId, elementSelector } = action;

    if (!elementId && !elementSelector) {
      return {
        success: false,
        message: 'No element identifier provided',
        error: 'MISSING_PARAM',
      };
    }

    try {
      const element = elementId
        ? document.getElementById(elementId)
        : elementSelector
        ? document.querySelector(elementSelector)
        : null;

      if (!element) {
        return {
          success: false,
          message: `Element not found: ${elementId || elementSelector}`,
          error: 'ELEMENT_NOT_FOUND',
        };
      }

      // Scroll element into view smoothly
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Wait for scroll
      await new Promise(resolve => setTimeout(resolve, 500));

      // Click the element
      if (element instanceof HTMLElement) {
        element.click();
      }

      return {
        success: true,
        message: `Clicked element: ${elementId || elementSelector}`,
        data: { elementId, elementSelector },
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to click element: ${error}`,
        error: 'CLICK_FAILED',
      };
    }
  }

  /**
   * Expand a specific device card to show details
   */
  private async expandDevice(params?: Record<string, unknown>): Promise<ActionResult> {
    const deviceName = params?.deviceName as string;
    const deviceId = params?.deviceId as string;

    if (!deviceName && !deviceId) {
      return {
        success: false,
        message: 'No device specified',
        error: 'MISSING_PARAM',
      };
    }

    // Navigate to devices page if not already there
    if (this.context.currentRoute !== '/devices') {
      this.context.navigate('/devices');
      await new Promise(resolve => setTimeout(resolve, 800)); // Wait for navigation
    }

    // Dispatch custom event that the Devices page can listen for
    window.dispatchEvent(new CustomEvent('agent-expand-device', {
      detail: { deviceName, deviceId }
    }));

    return {
      success: true,
      message: `Expanding details for: ${deviceName || deviceId}`,
      data: { deviceName, deviceId },
    };
  }

  /**
   * Focus on a specific tower in the network status map
   */
  private async focusTower(params?: Record<string, unknown>): Promise<ActionResult> {
    const towerId = params?.towerId as string;
    const towerRegion = params?.region as string;
    const status = params?.status as string;

    if (!towerId && !towerRegion && !status) {
      return {
        success: false,
        message: 'No tower identifier provided',
        error: 'MISSING_PARAM',
      };
    }

    // Navigate to network status if not already there
    if (this.context.currentRoute !== '/status') {
      this.context.navigate('/status');
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    // Dispatch custom event for the NetworkStatus page
    window.dispatchEvent(new CustomEvent('agent-focus-tower', {
      detail: { towerId, towerRegion, status }
    }));

    return {
      success: true,
      message: `Focusing on tower: ${towerId || towerRegion || `with status: ${status}`}`,
      data: { towerId, towerRegion, status },
    };
  }

  /**
   * Show details for a specific device
   */
  private async showDeviceDetails(params?: Record<string, unknown>): Promise<ActionResult> {
    return await this.expandDevice(params);
  }

  /**
   * Filter devices by criteria
   */
  private async filterDevices(params?: Record<string, unknown>): Promise<ActionResult> {
    const filterType = params?.filterType as string;

    if (!filterType) {
      return {
        success: false,
        message: 'No filter type specified',
        error: 'MISSING_PARAM',
      };
    }

    // Navigate to devices if not there
    if (this.context.currentRoute !== '/devices') {
      this.context.navigate('/devices');
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    // Dispatch filter event
    window.dispatchEvent(new CustomEvent('agent-filter-devices', {
      detail: { filterType }
    }));

    return {
      success: true,
      message: `Filtering devices by: ${filterType}`,
      data: { filterType },
    };
  }

  /**
   * Suggest an alternative based on user frustration
   */
  private async suggestAlternative(params?: Record<string, unknown>): Promise<ActionResult> {
    const currentItem = params?.currentItem as string;
    const reason = params?.reason as string || 'frustration detected';

    // Dispatch event that voice agent can respond to
    window.dispatchEvent(new CustomEvent('agent-suggest-alternative', {
      detail: { currentItem, reason }
    }));

    return {
      success: true,
      message: `Suggesting alternative for: ${currentItem} (reason: ${reason})`,
      data: { currentItem, reason, triggeredBySentiment: true },
    };
  }

  /**
   * Proactively offer help based on frustration
   */
  private async proactiveHelp(params?: Record<string, unknown>): Promise<ActionResult> {
    const context = params?.context as string;
    const sentimentValue = params?.sentimentValue as number;

    // Dispatch event for voice agent to respond
    window.dispatchEvent(new CustomEvent('agent-proactive-help', {
      detail: { context, sentimentValue }
    }));

    return {
      success: true,
      message: `Offering proactive help (context: ${context})`,
      data: { context, sentimentValue, triggeredBySentiment: true },
    };
  }
}
