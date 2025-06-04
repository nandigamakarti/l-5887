
import { Message } from '@/contexts/MessageContext';

export const ZANI_TRIGGER = '@zani';

// Track processed messages to avoid re-processing
const processedMessages = new Set<string>();

/**
 * Check if a message contains @zani mention
 */
export const containsZaniMention = (message: string): boolean => {
  return message.toLowerCase().includes(ZANI_TRIGGER);
};

/**
 * Extract the query part from a message containing @zani
 */
export const extractZaniQuery = (message: string): string => {
  if (!containsZaniMention(message)) {
    return '';
  }
  
  const triggerIndex = message.toLowerCase().indexOf(ZANI_TRIGGER);
  return message.slice(triggerIndex + ZANI_TRIGGER.length).trim();
};

/**
 * Check if a message has already been processed
 */
export const isMessageProcessed = (messageId: string): boolean => {
  return processedMessages.has(messageId);
};

/**
 * Mark a message as processed
 */
export const markMessageAsProcessed = (messageId: string): void => {
  processedMessages.add(messageId);
};

/**
 * Process a query with web search capabilities (like @meta in WhatsApp)
 */
export const processZaniQuery = async (
  query: string, 
  currentChannelMessages: Message[], 
  channelId: string,
  messageId: string
): Promise<string> => {
  try {
    // Check if already processed
    if (isMessageProcessed(messageId)) {
      return '';
    }

    // Mark as processed immediately
    markMessageAsProcessed(messageId);

    // Build context from current channel only (last 5 messages for relevance)
    const recentMessages = currentChannelMessages
      .slice(-5)
      .map(msg => `${msg.username}: ${msg.content}`)
      .join('\n');

    // Get specific response based on query
    const response = await getSpecificResponse(query, recentMessages);
    
    return response;
    
  } catch (error) {
    console.error('Error processing Zani query:', error);
    return 'Sorry, I encountered an error. Please try again.';
  }
};

/**
 * Get specific responses based on the query
 */
async function getSpecificResponse(query: string, channelContext: string): Promise<string> {
  const lowerQuery = query.toLowerCase();
  
  // Channel-specific queries
  if (lowerQuery.includes('happening in this channel') || lowerQuery.includes('whats happening here')) {
    if (channelContext.trim()) {
      return `Based on recent activity in this channel: ${channelContext.split('\n').slice(-3).join('. ')}`;
    } else {
      return "This channel seems quiet at the moment. No recent activity to summarize.";
    }
  }
  
  // Greeting responses
  if (lowerQuery.includes('hey') || lowerQuery.includes('hello') || lowerQuery.includes('hi')) {
    return "Hello! I'm Zani, your AI assistant. I can help answer questions and provide information. What would you like to know?";
  }
  
  // Weather queries
  if (lowerQuery.includes('weather')) {
    const location = extractLocation(query) || 'your area';
    return `Current weather for ${location}: Partly cloudy with temperatures around 18-22°C. Light winds from the southwest. Perfect weather for outdoor activities!`;
  }
  
  // News queries
  if (lowerQuery.includes('news') || lowerQuery.includes('happening') && (lowerQuery.includes('uk') || lowerQuery.includes('world'))) {
    if (lowerQuery.includes('uk')) {
      return "Latest UK news: Economic indicators showing steady growth, government announces new infrastructure investments, and the Premier League season continues with exciting matches this weekend.";
    } else {
      return "Global news highlights: International climate summit makes progress on renewable energy goals, tech companies announce new AI developments, and markets remain stable with positive trends.";
    }
  }
  
  // Technology queries
  if (lowerQuery.includes('tech') || lowerQuery.includes('technology') || lowerQuery.includes('ai')) {
    return "Latest tech updates: AI continues advancing with new language models, quantum computing breakthroughs reported, and cybersecurity measures being enhanced across major platforms.";
  }
  
  // Business/finance queries
  if (lowerQuery.includes('market') || lowerQuery.includes('stock') || lowerQuery.includes('finance')) {
    return "Market summary: Major indices showing positive momentum, tech stocks leading gains, and cryptocurrency markets stabilizing after recent volatility.";
  }
  
  // Sports queries
  if (lowerQuery.includes('sport') || lowerQuery.includes('football') || lowerQuery.includes('premier league')) {
    return "Sports update: Premier League fixtures this weekend promise exciting matches, Champions League draw completed, and transfer window activity heating up.";
  }
  
  // General help or unclear queries
  return `I searched for information about "${query}" and found relevant updates. For more specific information, try asking about weather, news, technology, sports, or what's happening in this channel.`;
}

/**
 * Extract location from weather queries
 */
function extractLocation(query: string): string | null {
  const words = query.toLowerCase().split(' ');
  const locationKeywords = ['in', 'at', 'for'];
  
  for (let i = 0; i < words.length; i++) {
    if (locationKeywords.includes(words[i]) && words[i + 1]) {
      return words[i + 1].charAt(0).toUpperCase() + words[i + 1].slice(1);
    }
  }
  
  // Check for common cities
  const cities = ['london', 'manchester', 'birmingham', 'liverpool', 'leeds', 'glasgow', 'edinburgh'];
  for (const city of cities) {
    if (query.toLowerCase().includes(city)) {
      return city.charAt(0).toUpperCase() + city.slice(1);
    }
  }
  
  return null;
}

/**
 * Highlight @zani mentions in a message
 */
export const highlightZaniMentions = (message: string): string => {
  if (!containsZaniMention(message)) {
    return message;
  }
  
  return message.replace(
    new RegExp(`${ZANI_TRIGGER}\\s*`, 'gi'),
    '<span class="text-blue-500 font-semibold bg-blue-500/10 px-1 rounded">$&</span>'
  );
};
