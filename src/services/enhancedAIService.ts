
import axios from 'axios';
import { Message } from '@/contexts/MessageContext';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isDeepSearch?: boolean;
}

export interface WorkspaceData {
  channels: { [channelId: string]: Message[] };
  channelNames: { [channelId: string]: string };
  pinnedDocs?: { title: string; content: string; isPinned?: boolean }[];
  currentWorkspaceId: string;
}

/**
 * Enhanced AI service that handles both regular and deep search queries
 */
export class EnhancedAIService {
  /**
   * Process a regular AI query with access to workspace data only
   */
  static async processRegularQuery(
    query: string,
    workspaceData: WorkspaceData
  ): Promise<string> {
    try {
      const { channels, channelNames, pinnedDocs, currentWorkspaceId } = workspaceData;
      
      // Filter out private channels for regular queries
      const publicChannelsContext = this.buildPublicChannelsContext(channels, channelNames);
      const pinnedDocsContext = this.buildPinnedDocsContext(pinnedDocs);
      
      const prompt = `
You are an AI assistant for workspace "${currentWorkspaceId}". You have access to all public channels and pinned documents within this specific workspace only.

WORKSPACE CONTEXT:
${publicChannelsContext}

${pinnedDocsContext}

USER QUERY: "${query}"

INSTRUCTIONS:
- Provide helpful, accurate responses based ONLY on the workspace data above
- If asked about specific channels, reference the actual content from those channels
- If you don't have enough information from the workspace, acknowledge this limitation
- Be conversational and friendly
- Focus only on information from the current workspace
- Do not make up information that isn't in the provided context
`;

      const response = await axios.post(
        OPENAI_API_URL,
        {
          model: 'gpt-4o',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1000,
          temperature: 0.7,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
          },
        }
      );

      return response.data.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error processing regular AI query:', error);
      return this.handleError(error);
    }
  }

  /**
   * Process a deep search query with web search capabilities
   */
  static async processDeepSearchQuery(
    query: string,
    workspaceData: WorkspaceData
  ): Promise<string> {
    try {
      const { channels, channelNames, pinnedDocs, currentWorkspaceId } = workspaceData;
      
      // Get workspace context
      const publicChannelsContext = this.buildPublicChannelsContext(channels, channelNames);
      const pinnedDocsContext = this.buildPinnedDocsContext(pinnedDocs);
      
      // Simulate web search (in a real implementation, you'd use a web search API)
      const webSearchResults = await this.performWebSearch(query);
      
      const prompt = `
You are an AI assistant with Deep Search capabilities for workspace "${currentWorkspaceId}". You have access to:
1. All public channels and pinned documents from the current workspace
2. Web search results for additional context

WORKSPACE CONTEXT:
${publicChannelsContext}

${pinnedDocsContext}

WEB SEARCH RESULTS:
${webSearchResults}

USER QUERY: "${query}"

INSTRUCTIONS:
- First check if the workspace data can answer the question
- If workspace data is insufficient, use web search results to provide additional context
- Clearly indicate when information comes from external sources vs workspace
- Provide comprehensive, accurate answers combining both sources when relevant
- Be conversational and helpful
- Focus on the current workspace context when possible
`;

      const response = await axios.post(
        OPENAI_API_URL,
        {
          model: 'gpt-4o',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1200,
          temperature: 0.7,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
          },
        }
      );

      return response.data.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error processing deep search query:', error);
      return this.handleError(error);
    }
  }

  /**
   * Build context from public channels only
   */
  private static buildPublicChannelsContext(
    channels: { [channelId: string]: Message[] },
    channelNames: { [channelId: string]: string }
  ): string {
    let context = '';
    
    Object.entries(channels).forEach(([channelId, messages]) => {
      // Skip private channels (you can add logic to detect private channels)
      const channelName = channelNames[channelId] || channelId;
      if (channelName.includes('private') || channelId.includes('private')) {
        return;
      }
      
      if (!messages || !Array.isArray(messages) || messages.length === 0) return;
      
      const validMessages = messages.filter(msg => 
        msg && typeof msg === 'object' && msg.username && msg.content
      );
      
      if (validMessages.length === 0) return;
      
      const recentMessages = validMessages
        .slice(-10) // Get last 10 messages for context
        .map(msg => `${msg.username}: ${msg.content}`)
        .join('\n');
      
      context += `\n--- Channel: #${channelName} ---\n${recentMessages}\n`;
    });
    
    return context || 'No public channel data available.';
  }

  /**
   * Build context from pinned documents only
   */
  private static buildPinnedDocsContext(
    pinnedDocs?: { title: string; content: string; isPinned?: boolean }[]
  ): string {
    if (!pinnedDocs || pinnedDocs.length === 0) {
      return 'No pinned documents available.';
    }
    
    const onlyPinnedDocs = pinnedDocs.filter(doc => doc.isPinned === true);
    
    if (onlyPinnedDocs.length === 0) {
      return 'No pinned documents available.';
    }
    
    let context = '\n--- Pinned Documents ---\n';
    onlyPinnedDocs.forEach(doc => {
      context += `Title: ${doc.title}\nContent: ${doc.content}\n\n`;
    });
    
    return context;
  }

  /**
   * Simulate web search (replace with actual web search API)
   */
  private static async performWebSearch(query: string): Promise<string> {
    // This is a simulation. In a real implementation, you'd use:
    // - Google Search API
    // - Bing Search API
    // - DuckDuckGo API
    // - Perplexity API
    // - Serper API
    
    const webResults = `
Based on web search for "${query}":

Example web search results would appear here. This could include:
- Recent news articles
- Wikipedia entries
- Documentation
- Company information
- Technical specifications

Note: This is a simulated web search. To implement real web search, integrate with:
- Google Custom Search API
- Bing Web Search API
- Perplexity API for real-time web data
`;
    
    return webResults;
  }

  /**
   * Handle API errors gracefully
   */
  private static handleError(error: any): string {
    if (!OPENAI_API_KEY) {
      return "I'm sorry, the AI service is not configured properly. Please check the API key configuration.";
    }
    
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        return "I'm sorry, there's an authentication issue with the AI service. Please check your API key.";
      } else if (error.response?.status === 429) {
        return "I'm sorry, we've hit the rate limit for AI requests. Please try again later.";
      }
    }
    
    return "I'm sorry, I encountered an error processing your request. Please try again later.";
  }
}
