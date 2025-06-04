import { Message } from '@/contexts/MessageContext';

export interface WorkspaceData {
  channels: { [channelId: string]: Message[] };
  channelNames: { [channelId: string]: string };
  pinnedDocs: any[];
  currentWorkspaceId: string;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isDeepSearch?: boolean;
}

export class EnhancedAIService {
  static async processRegularQuery(
    query: string,
    workspaceData: WorkspaceData
  ): Promise<string> {
    try {
      let context = `Workspace: ${workspaceData.currentWorkspaceId}\n\n`;

      if (workspaceData.channels && Object.keys(workspaceData.channels).length > 0) {
        context += "Channel Messages:\n";
        Object.entries(workspaceData.channels).forEach(([channelId, messages]) => {
          const channelName = workspaceData.channelNames[channelId] || channelId;
          context += `#${channelName}:\n`;
          messages.slice(-5).forEach(msg => {
            context += `- ${msg.username}: ${msg.content}\n`;
          });
        });
        context += "\n";
      }

      if (workspaceData.pinnedDocs && workspaceData.pinnedDocs.length > 0) {
        context += "Pinned Documents:\n";
        workspaceData.pinnedDocs.forEach(doc => {
          context += `- ${doc.title}\n`;
        });
        context += "\n";
      }

      const response = await fetch('/api/openai-enhanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: query,
          context: context,
          mode: 'regular'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.response || 'I am unable to process your request at this time.';
    } catch (error) {
      console.error('Enhanced AI Regular Error:', error);
      return 'I am unable to process your request at this time.';
    }
  }

  static async processDeepSearchQuery(
    query: string,
    workspaceData: WorkspaceData
  ): Promise<string> {
    try {
      // Build comprehensive context including pinned documents
      let context = `Workspace: ${workspaceData.currentWorkspaceId}\n\n`;
      
      // Add channel information
      if (workspaceData.channels && Object.keys(workspaceData.channels).length > 0) {
        context += "Channel Messages:\n";
        Object.entries(workspaceData.channels).forEach(([channelId, messages]) => {
          const channelName = workspaceData.channelNames[channelId] || channelId;
          context += `#${channelName}:\n`;
          messages.slice(-5).forEach(msg => {
            context += `- ${msg.username}: ${msg.content}\n`;
          });
        });
        context += "\n";
      }

      // Add pinned documents with enhanced analysis
      if (workspaceData.pinnedDocs && workspaceData.pinnedDocs.length > 0) {
        context += "Available Pinned Documents and Images:\n";
        workspaceData.pinnedDocs.forEach(doc => {
          context += `- ${doc.title} (${doc.type || 'document'})`;
          if (doc.type?.startsWith('image/')) {
            context += ` - Image file that can be analyzed for visual content, text, charts, diagrams, etc.`;
          } else {
            context += ` - Document file containing text and information that can be analyzed`;
          }
          context += `\n`;
        });
        context += "\n";
      }

      // Enhanced query processing for files
      const hasFileQuery = query.toLowerCase().includes('image') || 
                          query.toLowerCase().includes('document') || 
                          query.toLowerCase().includes('file') ||
                          query.toLowerCase().includes('analyze') ||
                          query.toLowerCase().includes('what does') ||
                          query.toLowerCase().includes('show me');

      if (hasFileQuery && workspaceData.pinnedDocs && workspaceData.pinnedDocs.length > 0) {
        context += `User is asking about files/images. Available pinned content: ${workspaceData.pinnedDocs.map(doc => doc.title).join(', ')}\n\n`;
      }

      const response = await fetch('/api/openai-enhanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: query,
          context: context,
          mode: 'deep_search'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.response || 'I apologize, but I encountered an issue processing your request with deep search.';
    } catch (error) {
      console.error('Enhanced AI Deep Search Error:', error);
      
      // Fallback response with file awareness
      if (workspaceData.pinnedDocs && workspaceData.pinnedDocs.length > 0) {
        return `I can help you with information from your workspace and the ${workspaceData.pinnedDocs.length} pinned document(s): ${workspaceData.pinnedDocs.map(doc => doc.title).join(', ')}. However, I'm currently experiencing connection issues with deep search. Could you rephrase your question or ask about specific content from your pinned documents?`;
      }
      
      return 'I apologize, but I encountered an issue with deep search. Please try again or use regular mode for workspace-only queries.';
    }
  }
}
