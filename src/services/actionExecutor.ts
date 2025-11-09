import { NavigateFunction } from 'react-router-dom';

export interface ActionContext {
  navigate: NavigateFunction;
  currentRoute: string;
  userId?: string;
}

export interface Action {
  type: string;
  params?: Record<string, unknown>;
  description?: string;
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

        default:
          result = {
            success: false,
            message: `Unknown action type: ${action.type}`,
            error: 'UNKNOWN_ACTION',
          };
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
}
