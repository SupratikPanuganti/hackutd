/**
 * Simple hardcoded navigation agent
 * Matches keywords in user speech and navigates to the appropriate route
 */

export interface NavigationMatch {
  route: string;
  confidence: number;
  keywords: string[];
  response: string;
}

const ROUTE_PATTERNS: Record<string, { keywords: string[], response: string }> = {
  '/plans': {
    keywords: ['plan', 'plans', 'pricing', 'price', 'cost', 'magenta', 'subscription', 'unlimited', 'package', 'packages', 'deal', 'deals', 'offer', 'offers'],
    response: "Taking you to our plans page."
  },
  '/devices': {
    keywords: ['device', 'devices', 'phone', 'phones', 'iphone', 'samsung', 'pixel', 'upgrade', 'buy', 'purchase', 'shop', 'shopping', 'mobile', 'smartphone', 'handset'],
    response: "Here are our available devices."
  },
  '/status': {
    keywords: ['network', 'status', 'coverage', 'outage', 'signal', 'connection', 'tower', 'connectivity', 'working', 'down', 'service', 'area'],
    response: "Checking network status for you."
  },
  '/help': {
    keywords: ['help', 'support', 'assist', 'question', 'problem', 'issue', 'faq', 'customer service', 'contact', 'talk to', 'speak to', 'agent'],
    response: "Let me help you with that."
  },
  '/': {
    keywords: ['home', 'main', 'start', 'beginning', 'back', 'homepage'],
    response: "Taking you to the home page."
  }
};

/**
 * Match user input to a route based on keywords
 */
export function matchRoute(userInput: string): NavigationMatch | null {
  const input = userInput.toLowerCase();
  console.log('[SimpleAgent] 🔍 Matching input:', input);

  let bestMatch: NavigationMatch | null = null;
  let highestScore = 0;

  for (const [route, pattern] of Object.entries(ROUTE_PATTERNS)) {
    let score = 0;
    const matchedKeywords: string[] = [];

    for (const keyword of pattern.keywords) {
      if (input.includes(keyword)) {
        score += 1;
        matchedKeywords.push(keyword);
        console.log('[SimpleAgent] ✓ Matched keyword:', keyword, 'for route:', route);
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = {
        route,
        confidence: Math.min(score / 3, 1), // Normalize to 0-1
        keywords: matchedKeywords,
        response: pattern.response
      };
    }
  }

  console.log('[SimpleAgent] Best match:', bestMatch ? `${bestMatch.route} (score: ${highestScore})` : 'none');

  // Only return if we have at least one keyword match
  return highestScore > 0 ? bestMatch : null;
}

/**
 * Execute navigation based on user input
 */
export async function navigateFromSpeech(
  userInput: string,
  navigate: (path: string) => void,
  speak?: (message: string) => void
): Promise<boolean> {
  const match = matchRoute(userInput);

  if (!match) {
    console.log('[SimpleAgent] No route match for:', userInput);
    return false;
  }

  console.log('[SimpleAgent] 🎯 Matched route:', match.route, 'Keywords:', match.keywords);

  // Navigate IMMEDIATELY (don't wait)
  navigate(match.route);
  console.log('[SimpleAgent] ✅ Navigated to:', match.route);

  // Speak AFTER navigation (in parallel with page load)
  if (speak) {
    // Small delay to let navigation start
    await new Promise(resolve => setTimeout(resolve, 100));
    speak(match.response);
  }

  return true;
}
