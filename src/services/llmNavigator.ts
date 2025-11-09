/**
 * LLM-based navigation decision maker
 * Uses OpenAI to decide which route to navigate to based on user input
 */

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_KEY || '';

export interface NavigationDecision {
  shouldNavigate: boolean;
  route: string | null;
  reasoning: string;
}

const AVAILABLE_ROUTES = {
  '/': 'Home page - main landing page',
  '/plans': 'Plans page - T-Mobile plans and pricing',
  '/devices': 'Devices page - phones and devices for sale',
  '/status': 'Network Status page - check network coverage and outages',
  '/help': 'Help page - customer support and FAQs',
};

export async function decideNavigation(userInput: string): Promise<NavigationDecision> {
  try {
    console.log('[LLM Navigator] Deciding navigation for:', userInput);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a navigation decision maker for a T-Mobile customer service app.

Available pages:
${Object.entries(AVAILABLE_ROUTES).map(([route, desc]) => `- ${route}: ${desc}`).join('\n')}

Based on the user's input, decide if we should navigate to a different page.

RULES:
- Only navigate if user CLEARLY wants to see a different page
- If they're just asking a question about current page content, do NOT navigate
- Return JSON: { "shouldNavigate": boolean, "route": string | null, "reasoning": string }

Examples:
- "show me plans" -> { "shouldNavigate": true, "route": "/plans", "reasoning": "User wants to see plans page" }
- "how much does it cost?" -> { "shouldNavigate": false, "route": null, "reasoning": "User asking about current page" }
- "I want to buy a phone" -> { "shouldNavigate": true, "route": "/devices", "reasoning": "User wants to see devices" }
- "is the network down?" -> { "shouldNavigate": true, "route": "/status", "reasoning": "User asking about network status" }`
          },
          {
            role: 'user',
            content: userInput
          }
        ],
        temperature: 0,
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse JSON response
    const decision: NavigationDecision = JSON.parse(content);

    console.log('[LLM Navigator] Decision:', decision);
    return decision;

  } catch (error) {
    console.error('[LLM Navigator] Error:', error);
    return {
      shouldNavigate: false,
      route: null,
      reasoning: 'Error making navigation decision'
    };
  }
}
