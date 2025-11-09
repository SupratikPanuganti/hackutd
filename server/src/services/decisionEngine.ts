import OpenAI from 'openai';
import axios from 'axios';

export interface MultimodalContext {
  // Screen context
  currentPage: string;
  pageLabel: string;
  userInput?: string; // Typing or voice input
  scrollPosition?: number;
  focusedElement?: string;

  // Sentiment context
  currentSentiment?: number; // -1 to 1
  sentimentLabel?: string;
  sentimentTrend?: 'improving' | 'declining' | 'stable';
  sentimentHistory?: Array<{ value: number; timestamp: number }>;

  // Conversation context
  recentMessages?: Array<{ role: string; content: string }>;
  conversationTopic?: string;

  // User intent
  detectedIntent?: string;
  confidence?: number;
}

export interface DecisionResult {
  action: string;
  confidence: number;
  reasoning: string;
  responseDepth: 'brief' | 'detailed' | 'empathetic';
  suggestedResponse?: string;
  alternativeOptions?: string[];
  nextSteps?: string[];
}

export class DecisionEngine {
  private openai: OpenAI | null = null;
  private nvidiaApiKey: string;
  private engine: 'openai' | 'nvidia';

  constructor(engine: 'openai' | 'nvidia' = 'openai') {
    this.engine = engine;
    this.nvidiaApiKey = process.env.NVIDIA_API_KEY || '';

    if (engine === 'openai') {
      const openaiKey = process.env.OPENAI_API_KEY;
      if (openaiKey && openaiKey !== 'your-openai-api-key-here') {
        this.openai = new OpenAI({ apiKey: openaiKey });
      } else {
        console.warn('OpenAI API key not configured, falling back to NVIDIA');
        this.engine = 'nvidia';
      }
    }
  }

  /**
   * Analyze multimodal context and decide the best action
   */
  async decide(context: MultimodalContext): Promise<DecisionResult> {
    if (this.engine === 'openai' && this.openai) {
      return this.decideWithOpenAI(context);
    } else {
      return this.decideWithNVIDIA(context);
    }
  }

  /**
   * Use OpenAI to analyze context and make decisions
   */
  private async decideWithOpenAI(context: MultimodalContext): Promise<DecisionResult> {
    if (!this.openai) {
      throw new Error('OpenAI not configured');
    }

    const prompt = this.buildDecisionPrompt(context);

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are an intelligent T-Mobile customer support AI assistant decision engine.
Your job is to analyze multimodal context (screen position, user sentiment, conversation history, voice/text input)
and decide the best action to take and how to respond.

IMPORTANT RULES:
1. If user sentiment is NEGATIVE (frustrated), prioritize quick solutions and show empathy
2. If user sentiment is POSITIVE (happy), be friendly and can provide more detailed info
3. If user sentiment is NEUTRAL, be helpful and concise
4. Consider what page the user is on - if they're on Plans, help with plans
5. If sentiment is declining, offer alternative solutions or escalate to more detailed help
6. If sentiment is improving, continue with current approach
7. Use conversation history to avoid repeating information

Return JSON with:
{
  "action": "navigate_to_X" | "show_details" | "offer_alternatives" | "escalate_support" | "continue_current",
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation",
  "responseDepth": "brief" | "detailed" | "empathetic",
  "suggestedResponse": "what to say to the user",
  "alternativeOptions": ["option1", "option2"],
  "nextSteps": ["step1", "step2"]
}`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      });

      const result = completion.choices[0].message.content;
      if (!result) {
        throw new Error('No response from OpenAI');
      }

      const decision = JSON.parse(result) as DecisionResult;
      console.log('[DecisionEngine] OpenAI decision:', decision);
      return decision;
    } catch (error) {
      console.error('[DecisionEngine] OpenAI error:', error);
      return this.getDefaultDecision(context);
    }
  }

  /**
   * Use NVIDIA API as fallback
   */
  private async decideWithNVIDIA(context: MultimodalContext): Promise<DecisionResult> {
    // Simplified rule-based decision using NVIDIA sentiment analysis
    const sentiment = context.currentSentiment || 0;
    const trend = context.sentimentTrend || 'stable';

    let action = 'continue_current';
    let responseDepth: 'brief' | 'detailed' | 'empathetic' = 'brief';
    let reasoning = '';

    // Sentiment-based decision logic
    if (sentiment < -0.5 && trend === 'declining') {
      action = 'offer_alternatives';
      responseDepth = 'empathetic';
      reasoning = 'User is frustrated and sentiment declining - need alternative approach';
    } else if (sentiment < 0) {
      action = 'show_details';
      responseDepth = 'empathetic';
      reasoning = 'User is frustrated - show more details with empathy';
    } else if (sentiment > 0 && trend === 'improving') {
      action = 'continue_current';
      responseDepth = 'brief';
      reasoning = 'User is happy and improving - continue current approach';
    } else {
      action = 'continue_current';
      responseDepth = 'brief';
      reasoning = 'Neutral sentiment - standard helpful response';
    }

    // Context-based adjustments
    if (context.userInput?.toLowerCase().includes('help')) {
      action = 'show_details';
      responseDepth = 'detailed';
    }

    return {
      action,
      confidence: 0.7,
      reasoning,
      responseDepth,
      suggestedResponse: this.generateSuggestedResponse(context, responseDepth),
      alternativeOptions: this.generateAlternatives(context),
      nextSteps: this.generateNextSteps(context),
    };
  }

  /**
   * Build prompt for OpenAI
   */
  private buildDecisionPrompt(context: MultimodalContext): string {
    const parts: string[] = [];

    parts.push('CURRENT CONTEXT:');
    parts.push(`Page: ${context.pageLabel} (${context.currentPage})`);

    if (context.userInput) {
      parts.push(`User Input: "${context.userInput}"`);
    }

    if (context.currentSentiment !== undefined) {
      parts.push(`User Sentiment: ${context.sentimentLabel} (${context.currentSentiment})`);
      parts.push(`Sentiment Trend: ${context.sentimentTrend}`);
    }

    if (context.focusedElement) {
      parts.push(`User Focus: ${context.focusedElement}`);
    }

    if (context.recentMessages && context.recentMessages.length > 0) {
      parts.push('\nRECENT CONVERSATION:');
      context.recentMessages.forEach((msg) => {
        parts.push(`${msg.role.toUpperCase()}: ${msg.content}`);
      });
    }

    if (context.detectedIntent) {
      parts.push(`\nDetected Intent: ${context.detectedIntent} (confidence: ${context.confidence})`);
    }

    parts.push('\nQUESTION: Based on this multimodal context, what action should I take and how should I respond?');

    return parts.join('\n');
  }

  /**
   * Generate suggested response based on context
   */
  private generateSuggestedResponse(
    context: MultimodalContext,
    depth: 'brief' | 'detailed' | 'empathetic'
  ): string {
    const sentiment = context.currentSentiment || 0;

    if (depth === 'empathetic') {
      if (sentiment < 0) {
        return "I understand this is frustrating. Let me help you find a solution quickly.";
      }
      return "I'm here to help! Let's get this resolved for you.";
    }

    if (depth === 'detailed') {
      return `I can help you with ${context.pageLabel}. Let me walk you through the options in detail.`;
    }

    return `I can help with that. What would you like to know about ${context.pageLabel}?`;
  }

  /**
   * Generate alternative options based on context
   */
  private generateAlternatives(context: MultimodalContext): string[] {
    const alternatives: string[] = [];

    if (context.currentPage === '/plans') {
      alternatives.push('Compare plan features');
      alternatives.push('Check device compatibility');
      alternatives.push('See pricing details');
    } else if (context.currentPage === '/status') {
      alternatives.push('Run network diagnostics');
      alternatives.push('Check outage map');
      alternatives.push('Restart connection');
    } else if (context.currentPage === '/devices') {
      alternatives.push('Filter by price');
      alternatives.push('Compare devices');
      alternatives.push('Check compatibility');
    }

    return alternatives;
  }

  /**
   * Generate next steps based on context
   */
  private generateNextSteps(context: MultimodalContext): string[] {
    const steps: string[] = [];
    const sentiment = context.currentSentiment || 0;

    if (sentiment < -0.5) {
      steps.push('Offer quick solution');
      steps.push('Provide direct contact option');
      steps.push('Escalate if needed');
    } else if (sentiment > 0.5) {
      steps.push('Provide detailed information');
      steps.push('Suggest related features');
      steps.push('Offer personalized recommendations');
    } else {
      steps.push('Answer question directly');
      steps.push('Offer additional help');
    }

    return steps;
  }

  /**
   * Default decision when AI fails
   */
  private getDefaultDecision(context: MultimodalContext): DecisionResult {
    return {
      action: 'continue_current',
      confidence: 0.5,
      reasoning: 'Using default rule-based decision',
      responseDepth: 'brief',
      suggestedResponse: 'How can I help you today?',
      alternativeOptions: [],
      nextSteps: ['Listen to user request', 'Provide relevant information'],
    };
  }

  /**
   * Analyze if sentiment warrants a change in approach
   */
  shouldChangeApproach(context: MultimodalContext): boolean {
    const sentiment = context.currentSentiment || 0;
    const trend = context.sentimentTrend || 'stable';

    // Change approach if:
    // 1. User is frustrated and getting worse
    if (sentiment < -0.3 && trend === 'declining') return true;

    // 2. Sentiment has dropped significantly
    if (context.sentimentHistory && context.sentimentHistory.length >= 5) {
      const recent5 = context.sentimentHistory.slice(-5);
      const avg = recent5.reduce((sum, s) => sum + s.value, 0) / recent5.length;
      if (avg < -0.5) return true;
    }

    return false;
  }

  /**
   * Determine response style based on sentiment
   */
  getResponseStyle(context: MultimodalContext): {
    tone: 'empathetic' | 'professional' | 'friendly';
    verbosity: 'concise' | 'moderate' | 'detailed';
    urgency: 'high' | 'medium' | 'low';
  } {
    const sentiment = context.currentSentiment || 0;
    const trend = context.sentimentTrend || 'stable';

    if (sentiment < -0.5) {
      return { tone: 'empathetic', verbosity: 'concise', urgency: 'high' };
    } else if (sentiment < 0) {
      return { tone: 'empathetic', verbosity: 'moderate', urgency: 'medium' };
    } else if (sentiment > 0.5) {
      return { tone: 'friendly', verbosity: 'detailed', urgency: 'low' };
    } else {
      return { tone: 'professional', verbosity: 'moderate', urgency: 'medium' };
    }
  }
}
