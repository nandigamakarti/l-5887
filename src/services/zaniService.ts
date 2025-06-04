
import { Message } from '@/contexts/MessageContext';

export const ZANI_TRIGGER = '@zani';

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
 * Process a query with web search capabilities (like @meta in WhatsApp)
 */
export const processZaniQuery = async (
  query: string, 
  currentChannelMessages: Message[], 
  channelId: string
): Promise<string> => {
  try {
    // Build context from current channel only (last 10 messages for relevance)
    const recentMessages = currentChannelMessages
      .slice(-10)
      .map(msg => `${msg.username}: ${msg.content}`)
      .join('\n');

    // Simulate web search (in real implementation, this would use actual web search API)
    const webSearchResults = await performWebSearch(query);
    
    const prompt = `You are Zani, an AI assistant similar to @meta in WhatsApp. Answer the user's question directly and concisely.

CURRENT CHANNEL CONTEXT (for reference only):
${recentMessages}

WEB SEARCH RESULTS:
${webSearchResults}

USER QUESTION: "${query}"

INSTRUCTIONS:
- Answer the question directly and concisely
- Use web search results as primary source
- Only reference channel context if directly relevant to the question
- Keep response under 150 words
- Be conversational and helpful
- Don't mention that you're referencing web search or channel context`;

    // For now, return a simulated response since we don't have actual OpenAI integration
    // In production, this would call the OpenAI API
    return await simulateZaniResponse(query, webSearchResults);
    
  } catch (error) {
    console.error('Error processing Zani query:', error);
    return 'Sorry, I encountered an error. Please try again.';
  }
};

/**
 * Simulate web search (replace with actual web search API in production)
 */
async function performWebSearch(query: string): Promise<string> {
  // This simulates web search results
  // In production, integrate with Google Search API, Bing API, or Perplexity API
  
  const simulatedResults = {
    "summarize whats happening in the UK": "Recent UK news includes economic updates, political developments, and weather patterns. The UK continues to navigate post-Brexit policies while addressing inflation concerns.",
    "weather in London": "London currently experiencing mild temperatures with occasional rain. Temperature ranges from 12-18°C with partly cloudy skies.",
    "latest technology news": "Recent tech developments include AI advancements, new smartphone releases, and cybersecurity updates across major tech companies.",
  };
  
  const lowerQuery = query.toLowerCase();
  for (const [key, result] of Object.entries(simulatedResults)) {
    if (lowerQuery.includes(key)) {
      return result;
    }
  }
  
  return `Search results for "${query}": Recent information and updates related to your query are available from various online sources.`;
}

/**
 * Simulate Zani's response (replace with actual AI API call)
 */
async function simulateZaniResponse(query: string, webResults: string): Promise<string> {
  // This simulates how Zani would respond
  // In production, this would be replaced with actual OpenAI API call
  
  const responses = {
    "summarize whats happening in the UK": "The UK is currently dealing with several key developments: economic adjustments post-Brexit, ongoing political discussions about trade policies, and seasonal weather changes. The government is focusing on inflation control and international trade relationships.",
    "weather": "Current weather conditions show mild temperatures with variable cloud cover. Expect typical seasonal patterns for this time of year.",
    "technology": "Latest tech news includes significant AI developments, new product launches from major companies, and ongoing discussions about digital privacy and security.",
  };
  
  const lowerQuery = query.toLowerCase();
  for (const [key, response] of Object.entries(responses)) {
    if (lowerQuery.includes(key)) {
      return response;
    }
  }
  
  // Default response based on web results
  return `Based on current information: ${webResults}`;
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
