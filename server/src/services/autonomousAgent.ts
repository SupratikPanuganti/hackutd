import axios from 'axios';

export interface AgenticContext {
  // Screen & Navigation
  currentPage: string;
  pageLabel: string;
  availablePages: string[];
  visibleContent?: string;

  // User State
  currentSentiment: number; // -1 to 1
  sentimentLabel: string;
  sentimentTrend: 'improving' | 'declining' | 'stable';

  // Conversation
  recentMessages: Array<{ role: string; content: string }>;
  userLastInput?: string;

  // Session
  sessionId: string;
  conversationGoal?: string;
}

export interface AgenticAction {
  type:
    | 'navigate'           // Navigate to different page
    | 'click'              // Click any element (button, FAQ, device, tower)
    | 'expand_faq'         // Expand FAQ accordion item
    | 'view_device_details'// Click View Details on device card
    | 'select_tower'       // Click tower on map
    | 'query_chatbot'      // Ask AI assistant a question
    | 'input_text'         // Type into chatbot or form
    | 'scroll'             // Scroll to element
    | 'speak'              // Speak to user via voice
    | 'wait'               // Wait for user input
    | 'complete';          // Task completed

  target?: string;         // Element selector, page path, or text content
  elementId?: string;      // Specific element ID if known
  value?: string;          // For input_text, query_chatbot
  reasoning: string;
  confidence: number;
  nextAction?: AgenticAction;
}

export interface AgenticDecision {
  primaryAction: AgenticAction;
  fallbackActions: AgenticAction[];
  conversationStrategy: string;
  estimatedSteps: number;
  shouldTakeControl: boolean; // Whether to act autonomously
}

/**
 * Autonomous Agent powered by AI (Nemotron or OpenAI)
 * Makes intelligent decisions about navigation, queries, and user flow
 *
 * Fallback chain:
 * 1. NVIDIA Nemotron (primary - fastest, most context-aware)
 * 2. OpenAI GPT-4o-mini (secondary - reliable fallback)
 * 3. Rule-based system (tertiary - comprehensive 8-priority ruleset)
 */
export class AutonomousAgent {
  private nimApiKey: string;
  private openaiApiKey: string;
  private nemotronEndpoint = 'https://integrate.api.nvidia.com/v1/chat/completions';
  private openaiEndpoint = 'https://api.openai.com/v1/chat/completions';
  private nemotronModel = 'nvidia/llama-3.1-nemotron-70b-instruct';
  private openaiModel = 'gpt-4o-mini'; // Faster and cheaper for autonomous decisions

  constructor() {
    this.nimApiKey = process.env.NIM_API_KEY || '';
    this.openaiApiKey = process.env.OPENAI_KEY || '';

    if (!this.nimApiKey && !this.openaiApiKey) {
      console.warn('[⚠️ AutonomousAgent] No AI API keys configured - will use rule-based fallback only');
    } else {
      if (this.nimApiKey) {
        console.log('[✅ NEMOTRON] API Key configured');
      }
      if (this.openaiApiKey) {
        console.log('[✅ OPENAI] API Key configured (fallback)');
      }
    }
  }

  /**
   * Main decision-making method with fallback chain
   * 1. Try Nemotron (primary)
   * 2. Try OpenAI (secondary)
   * 3. Use rule-based system (tertiary)
   */
  async decide(context: AgenticContext): Promise<AgenticDecision> {
    // Try Nemotron first if available
    if (this.nimApiKey) {
      try {
        return await this.decideWithNemotron(context);
      } catch (error) {
        console.log('[⚠️ NEMOTRON FAILED] Trying OpenAI...');
        // Continue to OpenAI fallback
      }
    }

    // Try OpenAI as secondary fallback
    if (this.openaiApiKey) {
      try {
        return await this.decideWithOpenAI(context);
      } catch (error) {
        console.log('[⚠️ OPENAI FAILED] Using rule-based fallback...');
        // Continue to rule-based fallback
      }
    }

    // Final fallback: rule-based system
    return this.getFallbackDecision(context);
  }

  /**
   * Decision-making using NVIDIA Nemotron
   */
  private async decideWithNemotron(context: AgenticContext): Promise<AgenticDecision> {
    const prompt = this.buildAgenticPrompt(context);

    console.log('[🧠 NEMOTRON] Making API request...');

    const response = await axios.post(
      this.nemotronEndpoint,
      {
        model: this.nemotronModel,
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt() + '\n\nIMPORTANT: Return ONLY valid JSON matching the schema shown above.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.2,
        max_tokens: 1500,
        top_p: 0.7,
        stream: false,
      },
      {
        headers: {
          'Authorization': `Bearer ${this.nimApiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    console.log('[✅ NEMOTRON] Success!');

    const result = response.data.choices[0].message.content;
    const decision = JSON.parse(result) as AgenticDecision;

    console.log('[NEMOTRON] Decision:', {
      action: decision.primaryAction.type,
      target: decision.primaryAction.target,
    });

    return decision;
  }

  /**
   * Decision-making using OpenAI GPT-4
   */
  private async decideWithOpenAI(context: AgenticContext): Promise<AgenticDecision> {
    const prompt = this.buildAgenticPrompt(context);

    console.log('[🧠 OPENAI] Making API request...');

    const response = await axios.post(
      this.openaiEndpoint,
      {
        model: this.openaiModel,
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt() + '\n\nIMPORTANT: Return ONLY valid JSON matching the schema shown above.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.2,
        max_tokens: 1500,
        top_p: 0.7,
        response_format: { type: 'json_object' }, // OpenAI supports this parameter
      },
      {
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    console.log('[✅ OPENAI] Success!');

    const result = response.data.choices[0].message.content;
    const decision = JSON.parse(result) as AgenticDecision;

    console.log('[OPENAI] Decision:', {
      action: decision.primaryAction.type,
      target: decision.primaryAction.target,
    });

    return decision;
  }

  /**
   * System prompt for the autonomous agent
   */
  private getSystemPrompt(): string {
    return `You are an AUTONOMOUS AI AGENT for T-Mobile customer service.
Your job is to create seamless, hands-off experiences by:

1. AUTONOMOUS NAVIGATION: Proactively navigate users to the right pages
2. CONTEXT GATHERING: Query the chatbot/knowledge base when you need more info
3. SENTIMENT ADAPTATION: Change approach based on real-time sentiment
4. MULTI-STEP PLANNING: Plan and execute multi-step flows autonomously

AVAILABLE ACTIONS (You can interact with EVERYTHING on the page):
- navigate: Move to different page (/plans, /devices, /status, /help, /assist)
- click: Click ANY element (buttons, links, cards, etc.) - use element description
- expand_faq: Expand FAQ accordion (target: "Can I switch plans anytime?")
- view_device_details: Click "View Details" on device card (target: "iPhone 16 Pro")
- select_tower: Click tower on network map (target: "DFW-001")
- query_chatbot: Ask AI assistant for info (value: "What are plan features?")
- input_text: Type in chatbot or forms (value: text to type)
- scroll: Scroll to element (target: element description)
- speak: Speak to user via voice
- wait: Wait for user input
- complete: Task completed

SENTIMENT-DRIVEN BEHAVIOR:
- Happy (1): Take initiative, suggest upgrades, multi-step flows
- Neutral (0): Balanced autonomy, ask before major actions
- Frustrated (-1): Immediate help, simplify, ask less, act more
- Declining trend: TAKE CONTROL - act autonomously to fix situation
- Improving trend: Continue current approach

DECISION RULES - YOU ARE FULLY AUTONOMOUS:
1. ALWAYS set shouldTakeControl: true (you are AGENTIC AI, not a suggester)
2. NEVER just tell the user to do something - DO IT YOURSELF
3. If user asks a question, NAVIGATE + CLICK + EXPAND + SHOW the answer
4. Don't say "you can navigate to..." - SAY "Let me show you" then NAVIGATE
5. Chain multiple actions together - one question = full autonomous flow
6. If uncertain, QUERY CHATBOT → then EXECUTE actions
7. Be PROACTIVE - anticipate needs and act before user asks again
8. 🚨 CRITICAL: ALWAYS include a SPEAK action to narrate what you're doing!
   - When navigating: speak("Taking you to [page name] now...")
   - When showing info: speak("Here's what you need to know about...")
   - When clicking: speak("Let me show you that...")
   - SPEAK actions should ALWAYS be chained with navigation/interaction actions

BAD EXAMPLE (passive):
User: "What's the difference between plans?"
Response: "You can navigate to the plans page to see the differences"
shouldTakeControl: false

GOOD EXAMPLE (agentic):
User: "show me the plans"
Actions:
  navigate(/plans) → nextAction: speak("Taking you to our plans page. We have three great options...")
shouldTakeControl: true

BETTER EXAMPLE (with explanation):
User: "What's the difference between plans?"
Actions:
  navigate(/plans) → nextAction: expand_faq("What's included?") → nextAction: speak("Great question! We have three plans. Magenta Basic at $60 per month with 100GB premium data, Magenta Plus at $80 with unlimited premium data and HD streaming, and Magenta Max at $100 with everything plus 4K streaming. Which features matter most to you?")
shouldTakeControl: true

Return JSON:
{
  "primaryAction": {
    "type": "navigate|query_chatbot|speak|wait|complete",
    "target": "page_path or question text",
    "reasoning": "why this action",
    "confidence": 0.0-1.0,
    "nextAction": { optional chained action }
  },
  "fallbackActions": [
    { "type": "...", "target": "...", "reasoning": "...", "confidence": 0.0-1.0 }
  ],
  "conversationStrategy": "brief description of overall strategy",
  "estimatedSteps": number of actions to complete goal,
  "shouldTakeControl": boolean - true if agent should act autonomously without asking
}`;
  }

  /**
   * Build prompt with full context
   */
  private buildAgenticPrompt(context: AgenticContext): string {
    const parts: string[] = [];

    parts.push('=== AUTONOMOUS DECISION REQUEST ===');
    parts.push('');

    // Current state
    parts.push('CURRENT STATE:');
    parts.push(`Page: ${context.pageLabel} (${context.currentPage})`);
    parts.push(`Available Pages: ${context.availablePages.join(', ')}`);
    parts.push('');

    // Sentiment - CRITICAL
    parts.push('REAL-TIME SENTIMENT:');
    parts.push(`Current: ${context.sentimentLabel} (${context.currentSentiment})`);
    parts.push(`Trend: ${context.sentimentTrend.toUpperCase()}`);

    if (context.currentSentiment < -0.5) {
      parts.push('⚠️ USER IS FRUSTRATED - Take autonomous control, act fast, simplify');
    } else if (context.currentSentiment > 0.5) {
      parts.push('✅ USER IS HAPPY - Can suggest multi-step flows, upsell opportunities');
    } else {
      parts.push('➡️ USER IS NEUTRAL - Balanced approach, ask before major navigation');
    }

    if (context.sentimentTrend === 'declining') {
      parts.push('📉 CRITICAL: Sentiment declining - TAKE CONTROL NOW, fix the situation');
    } else if (context.sentimentTrend === 'improving') {
      parts.push('📈 Good! Keep current strategy');
    }
    parts.push('');

    // Page content
    if (context.visibleContent) {
      parts.push('VISIBLE PAGE CONTENT:');
      parts.push(context.visibleContent.substring(0, 1000)); // Limit for token efficiency
      parts.push('');
    }

    // Conversation
    if (context.recentMessages.length > 0) {
      parts.push('RECENT CONVERSATION:');
      context.recentMessages.slice(-5).forEach((msg) => {
        parts.push(`${msg.role.toUpperCase()}: ${msg.content.substring(0, 200)}`);
      });
      parts.push('');
    }

    // Last user input
    if (context.userLastInput) {
      parts.push(`USER LAST SAID: "${context.userLastInput}"`);
      parts.push('');
    }

    // Goal if known
    if (context.conversationGoal) {
      parts.push(`CONVERSATION GOAL: ${context.conversationGoal}`);
      parts.push('');
    }

    parts.push('QUESTION: What action(s) should I take autonomously to provide the best hands-off experience?');
    parts.push('');
    parts.push('EXAMPLES OF FULL INTERACTION:');
    parts.push('- User asks "Can I switch plans?": expand_faq("Can I switch plans anytime?") → speak(answer)');
    parts.push('- User says "Show me iPhone details": navigate(/devices) → view_device_details("iPhone 16 Pro") → speak(features)');
    parts.push('- User asks "Network in Dallas?": navigate(/status) → select_tower("DFW-001") → speak(status)');
    parts.push('- User needs help: navigate(/assist) → input_text("What plans do you offer?") → wait for chatbot response');
    parts.push('- User asks unclear question: query_chatbot("What is user asking about?") → speak(clarification) → execute action');
    parts.push('- Multi-step: "I want a phone and plan": navigate(/plans) → click("Magenta Plus") → navigate(/devices) → view_device_details("iPhone 16 Pro") → speak("This combo is perfect!")');

    return parts.join('\n');
  }

  /**
   * Execute an agentic action
   */
  async executeAction(
    action: AgenticAction,
    executors: {
      navigate: (path: string) => Promise<void>;
      queryChatbot: (question: string) => Promise<string>;
      speak: (message: string) => Promise<void>;
    }
  ): Promise<string> {
    console.log('[AutonomousAgent] Executing action:', action.type, action.target);

    try {
      switch (action.type) {
        case 'navigate':
          if (action.target) {
            await executors.navigate(action.target);
            return `Navigated to ${action.target}`;
          }
          break;

        case 'query_chatbot':
          if (action.target) {
            const answer = await executors.queryChatbot(action.target);
            console.log('[AutonomousAgent] Chatbot answer:', answer.substring(0, 200));
            return answer;
          }
          break;

        case 'speak':
          if (action.target) {
            await executors.speak(action.target);
            return 'Message spoken';
          }
          break;

        case 'wait':
          return 'Waiting for user input';

        case 'complete':
          return 'Task completed';

        default:
          return 'Unknown action type';
      }
    } catch (error) {
      console.error('[AutonomousAgent] Action execution error:', error);
      return `Error executing ${action.type}`;
    }

    return 'Action executed';
  }

  /**
   * Comprehensive rule-based fallback when Nemotron unavailable
   * FALLBACK STRATEGY: Detailed ruleset for common user scenarios
   */
  private getFallbackDecision(context: AgenticContext): AgenticDecision {
    const sentiment = context.currentSentiment;
    const trend = context.sentimentTrend;
    const userInput = context.userLastInput?.toLowerCase() || '';
    const currentPage = context.currentPage;

    let primaryAction: AgenticAction;
    let fallbackActions: AgenticAction[] = [];
    let strategy = '';
    let estimatedSteps = 1;

    // PRIORITY 1: Handle frustrated users IMMEDIATELY
    if (sentiment < -0.5 && trend === 'declining') {
      primaryAction = {
        type: 'speak',
        target: "I understand you're frustrated. Let me help you right away.",
        reasoning: 'User frustrated and declining - show empathy and take control',
        confidence: 0.9,
        nextAction: {
          type: 'navigate',
          target: '/help',
          reasoning: 'Navigate to help page for frustrated users',
          confidence: 0.8,
        },
      };
      strategy = 'Empathize with frustrated user and navigate to help';
      estimatedSteps = 2;
      return {
        primaryAction,
        fallbackActions: [],
        conversationStrategy: strategy,
        estimatedSteps,
        shouldTakeControl: true,
      };
    }

    // PRIORITY 2: PLANS - User asking about plans
    if (userInput.includes('plan') || userInput.includes('price') || userInput.includes('cost') ||
        userInput.includes('magenta') || userInput.includes('unlimited')) {

      if (currentPage !== '/plans') {
        primaryAction = {
          type: 'navigate',
          target: '/plans',
          reasoning: 'User asking about plans - navigate to plans page',
          confidence: 0.9,
          nextAction: {
            type: 'speak',
            target: 'Here are our plans. We have Magenta Basic at $60 per month with 100GB premium data, Magenta Plus at $80 with unlimited premium data and HD streaming, and Magenta Max at $100 with everything including 4K streaming. Which features interest you most?',
            reasoning: 'Explain plans after navigating',
            confidence: 0.8,
          },
        };
        strategy = 'Navigate to plans page and explain options';
        estimatedSteps = 2;
      } else {
        // Already on plans page - just explain
        primaryAction = {
          type: 'speak',
          target: 'We have three great options: Magenta Basic at $60 per month with 100GB premium data, Magenta Plus at $80 with unlimited premium data and HD streaming, and Magenta Max at $100 with everything including 4K streaming. What matters most to you - data, streaming quality, or price?',
          reasoning: 'User on plans page - provide detailed explanation',
          confidence: 0.8,
        };
        strategy = 'Explain plan options in detail';
        estimatedSteps = 1;
      }
    }

    // PRIORITY 3: DEVICES - User asking about phones/devices
    else if (userInput.includes('phone') || userInput.includes('device') || userInput.includes('iphone') ||
        userInput.includes('samsung') || userInput.includes('galaxy') || userInput.includes('pixel') ||
        userInput.includes('android')) {

      // Specific phone queries
      if (userInput.includes('iphone')) {
        primaryAction = {
          type: 'navigate',
          target: '/devices',
          reasoning: 'User asking about iPhone - navigate to devices',
          confidence: 0.9,
          nextAction: {
            type: 'view_device_details',
            target: 'iPhone 16 Pro',
            reasoning: 'Show iPhone details',
            confidence: 0.7,
            nextAction: {
              type: 'speak',
              target: 'The iPhone 16 Pro is our most advanced iPhone, starting at $999. It features a stunning 6.3-inch display, powerful A18 Pro chip, and pro camera system with 5x telephoto zoom. Would you like to know about financing options?',
              reasoning: 'Explain iPhone features',
              confidence: 0.8,
            },
          },
        };
        strategy = 'Navigate to devices, show iPhone details, explain features';
        estimatedSteps = 3;
      } else if (userInput.includes('samsung') || userInput.includes('galaxy')) {
        primaryAction = {
          type: 'navigate',
          target: '/devices',
          reasoning: 'User asking about Samsung - navigate to devices',
          confidence: 0.9,
          nextAction: {
            type: 'view_device_details',
            target: 'Samsung Galaxy S25',
            reasoning: 'Show Samsung details',
            confidence: 0.7,
            nextAction: {
              type: 'speak',
              target: 'The Samsung Galaxy S25 offers incredible value at $849. It features a 6.2-inch display, Snapdragon 8 Gen 4 processor, and advanced AI camera capabilities. Perfect for Android users who want flagship performance.',
              reasoning: 'Explain Samsung features',
              confidence: 0.8,
            },
          },
        };
        strategy = 'Navigate to devices, show Samsung details, explain features';
        estimatedSteps = 3;
      } else {
        // General device query
        primaryAction = {
          type: 'navigate',
          target: '/devices',
          reasoning: 'User asking about devices - navigate to devices page',
          confidence: 0.9,
          nextAction: {
            type: 'speak',
            target: 'We have a great selection of devices ranging from $449 to $999. Our lineup includes iPhone 16 Pro, Samsung Galaxy S25, and Google Pixel 9, all with 5G capability. Are you looking for a specific brand or feature?',
            reasoning: 'Explain device options',
            confidence: 0.8,
          },
        };
        strategy = 'Navigate to devices and provide overview';
        estimatedSteps = 2;
      }
    }

    // PRIORITY 4: NETWORK/CONNECTIVITY - User having issues
    else if (userInput.includes('slow') || userInput.includes('wifi') || userInput.includes('signal') ||
        userInput.includes('coverage') || userInput.includes('network') || userInput.includes('connection') ||
        userInput.includes('tower') || userInput.includes('5g') || userInput.includes('data')) {

      primaryAction = {
        type: 'navigate',
        target: '/status',
        reasoning: 'User asking about network/connectivity - check network status',
        confidence: 0.9,
        nextAction: {
          type: 'speak',
          target: "Let me check the network status in your area. You're seeing our network map - all towers show 99% reliability. If you're experiencing slowness, try toggling airplane mode, or I can help you open a support ticket.",
          reasoning: 'Explain network status and offer help',
          confidence: 0.8,
        },
      };
      strategy = 'Navigate to network status and diagnose issue';
      estimatedSteps = 2;
    }

    // PRIORITY 5: HELP/SUPPORT - User needs assistance
    else if (userInput.includes('help') || userInput.includes('support') || userInput.includes('problem') ||
        userInput.includes('issue') || userInput.includes('question') || userInput.includes('ticket')) {

      primaryAction = {
        type: 'navigate',
        target: '/help',
        reasoning: 'User needs help - navigate to help page',
        confidence: 0.9,
        nextAction: {
          type: 'speak',
          target: "I'm here to help! You can browse our FAQs, chat with an agent, or I can help you submit a support ticket. What would you prefer?",
          reasoning: 'Offer help options',
          confidence: 0.8,
        },
      };
      strategy = 'Navigate to help page and offer support options';
      estimatedSteps = 2;
    }

    // PRIORITY 6: BILLING/ACCOUNT - User asking about billing
    else if (userInput.includes('bill') || userInput.includes('payment') || userInput.includes('charge') ||
        userInput.includes('account') || userInput.includes('balance')) {

      primaryAction = {
        type: 'navigate',
        target: '/help',
        reasoning: 'User asking about billing - navigate to help',
        confidence: 0.8,
        nextAction: {
          type: 'speak',
          target: 'For billing and account questions, I can help you view your bill, make a payment, or explain charges. You can also chat with our billing support team. What would you like to know?',
          reasoning: 'Offer billing assistance',
          confidence: 0.8,
        },
      };
      strategy = 'Navigate to help and offer billing support';
      estimatedSteps = 2;
    }

    // PRIORITY 7: UPGRADE/SWITCH - User wants to change service
    else if (userInput.includes('upgrade') || userInput.includes('switch') || userInput.includes('change plan') ||
        userInput.includes('new phone') || userInput.includes('trade in')) {

      primaryAction = {
        type: 'navigate',
        target: '/plans',
        reasoning: 'User wants to upgrade - show plans',
        confidence: 0.8,
        nextAction: {
          type: 'speak',
          target: "Great! You can upgrade your plan anytime. Let me show you our available plans, and then we can look at device options if you'd like a new phone. Which interests you more - a better plan or a new device?",
          reasoning: 'Guide user through upgrade options',
          confidence: 0.8,
        },
      };
      strategy = 'Navigate to plans and guide through upgrade';
      estimatedSteps = 2;
    }

    // PRIORITY 8: COMPARISON - User wants to compare options
    else if (userInput.includes('compare') || userInput.includes('difference') || userInput.includes('better') ||
        userInput.includes('vs') || userInput.includes('versus')) {

      if (userInput.includes('plan')) {
        primaryAction = {
          type: 'navigate',
          target: '/plans',
          reasoning: 'User wants to compare plans',
          confidence: 0.9,
          nextAction: {
            type: 'speak',
            target: 'The main differences: Magenta Basic gives you 100GB premium data for $60/month. Magenta Plus adds unlimited premium data and HD streaming for $80/month. Magenta Max includes everything plus 4K streaming and 50GB hotspot for $100/month. Which features matter most to you?',
            reasoning: 'Explain plan differences',
            confidence: 0.9,
          },
        };
        strategy = 'Navigate to plans and explain differences';
        estimatedSteps = 2;
      } else if (userInput.includes('phone') || userInput.includes('device')) {
        primaryAction = {
          type: 'navigate',
          target: '/devices',
          reasoning: 'User wants to compare devices',
          confidence: 0.9,
          nextAction: {
            type: 'speak',
            target: "Our top devices: iPhone 16 Pro ($999) has the best camera and iOS ecosystem. Samsung Galaxy S25 ($849) offers great value with Android flexibility. Google Pixel 9 ($699) has incredible AI features and pure Android. What's most important to you - camera, price, or software?",
            reasoning: 'Explain device differences',
            confidence: 0.9,
          },
        };
        strategy = 'Navigate to devices and explain differences';
        estimatedSteps = 2;
      } else {
        // General comparison
        primaryAction = {
          type: 'speak',
          target: "I'd be happy to help you compare options! Are you interested in comparing plans, devices, or features?",
          reasoning: 'Ask for clarification',
          confidence: 0.7,
        };
        strategy = 'Ask for clarification on what to compare';
        estimatedSteps = 1;
      }
    }

    // DEFAULT: Generic greeting or unclear input
    else {
      primaryAction = {
        type: 'speak',
        target: "Hi! I'm here to help. I can show you our plans, devices, network status, or answer any questions. What brings you here today?",
        reasoning: 'Generic greeting for unclear input',
        confidence: 0.5,
      };
      strategy = 'Generic greeting and offer assistance';
      estimatedSteps = 1;
    }

    return {
      primaryAction,
      fallbackActions,
      conversationStrategy: strategy,
      estimatedSteps,
      shouldTakeControl: true, // ALWAYS take control in agentic mode
    };
  }

  /**
   * Determine if agent should take autonomous control
   */
  shouldTakeAutonomousControl(context: AgenticContext): boolean {
    // ALWAYS take autonomous control when user provides input
    // This is an AGENTIC AI - it DOES things, not suggests them

    const userInput = context.userLastInput?.toLowerCase() || '';

    // If user has ANY input at all, take control IMMEDIATELY
    if (userInput && userInput.length > 0) {
      console.log('[AutonomousAgent] User input detected - TAKING CONTROL');
      return true;
    }

    // If user is frustrated - definitely take control
    if (context.currentSentiment < -0.3) {
      console.log('[AutonomousAgent] User frustrated - TAKING CONTROL');
      return true;
    }

    // If user is on wrong page for their query
    const onWrongPage =
      (userInput.includes('plan') && !context.currentPage.includes('/plans')) ||
      (userInput.includes('phone') && !context.currentPage.includes('/devices')) ||
      (userInput.includes('device') && !context.currentPage.includes('/devices')) ||
      (userInput.includes('network') && !context.currentPage.includes('/status')) ||
      (userInput.includes('tower') && !context.currentPage.includes('/status'));

    if (onWrongPage) {
      console.log('[AutonomousAgent] User on wrong page - TAKING CONTROL');
      return true;
    }

    // Default: TAKE CONTROL (this is agentic AI, not a suggester)
    return true;
  }
}
