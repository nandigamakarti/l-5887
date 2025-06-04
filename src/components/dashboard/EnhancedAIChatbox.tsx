
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, X, Loader2, Sparkles, Search, Globe, Database } from 'lucide-react';
import { useMessages } from '@/contexts/MessageContext';
import { useAuth } from '@/contexts/AuthContext';
import { EnhancedAIService, AIMessage, WorkspaceData } from '@/services/enhancedAIService';
import { motion, AnimatePresence } from 'framer-motion';

interface EnhancedAIChatboxProps {
  isOpen: boolean;
  onClose: () => void;
  channelNames: { [channelId: string]: string };
}

const EnhancedAIChatbox: React.FC<EnhancedAIChatboxProps> = ({ 
  isOpen, 
  onClose, 
  channelNames 
}) => {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDeepSearchEnabled, setIsDeepSearchEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { getAllPublicChannelMessages } = useMessages();
  const { workspace } = useAuth();

  // Add welcome message when component mounts
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: `👋 Welcome to your enhanced AI assistant for **${workspace?.name || 'your workspace'}**!\n\n🔍 **Regular Mode**: I can help you with information from all public channels and pinned documents in your current workspace.\n\n🌐 **Deep Search Mode**: Click the Deep Search button to enable web search capabilities for broader knowledge beyond your workspace.\n\nWhat would you like to know?`,
          timestamp: new Date()
        }
      ]);
    }
  }, [workspace?.name]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || !workspace) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
      isDeepSearch: isDeepSearchEnabled
    };

    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Prepare workspace data
      const allChannelMessages = getAllPublicChannelMessages();
      const workspaceData: WorkspaceData = {
        channels: allChannelMessages,
        channelNames,
        pinnedDocs: [], // You can add pinned docs here if available
        currentWorkspaceId: workspace.id
      };

      let aiResponseText: string;
      
      if (isDeepSearchEnabled) {
        aiResponseText = await EnhancedAIService.processDeepSearchQuery(
          userMessage.content,
          workspaceData
        );
      } else {
        aiResponseText = await EnhancedAIService.processRegularQuery(
          userMessage.content,
          workspaceData
        );
      }

      // Add AI response to chat
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: aiResponseText,
          timestamp: new Date(),
          isDeepSearch: isDeepSearchEnabled
        }
      ]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Add error message
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "I'm sorry, I encountered an error processing your request. Please try again later.",
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleDeepSearch = () => {
    setIsDeepSearchEnabled(!isDeepSearchEnabled);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 rounded-lg shadow-lg w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <Sparkles className="w-6 h-6 text-blue-400 ai-icon-glow ai-icon-shine" />
            <div>
              <h2 className="text-xl font-semibold text-white">Enhanced AI Assistant</h2>
              <p className="text-sm text-gray-400">
                Workspace: {workspace?.name || 'Unknown'} • 
                Mode: {isDeepSearchEnabled ? 'Deep Search' : 'Regular'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 rounded-full text-gray-400 hover:text-white hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-800">
          <div className="space-y-4">
            <AnimatePresence>
              {messages.map(message => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.role === 'user'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700 text-white border-l-4 border-blue-400'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex items-center space-x-2 mb-2">
                        {message.isDeepSearch ? (
                          <Globe className="w-4 h-4 text-green-400" />
                        ) : (
                          <Database className="w-4 h-4 text-blue-400" />
                        )}
                        <span className="text-xs text-gray-300">
                          {message.isDeepSearch ? 'Deep Search Response' : 'Workspace Response'}
                        </span>
                      </div>
                    )}
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    <div className="text-xs text-gray-300 mt-2 flex items-center justify-between">
                      <span>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {message.role === 'user' && message.isDeepSearch && (
                        <span className="text-green-400 text-xs">Deep Search</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isLoading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-gray-700 rounded-lg p-4 flex items-center space-x-3">
                  <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                  <span className="text-white">
                    {isDeepSearchEnabled ? 'Searching workspace and web...' : 'Searching workspace...'}
                  </span>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-700">
          {/* Deep Search Toggle */}
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                onClick={toggleDeepSearch}
                variant={isDeepSearchEnabled ? "default" : "outline"}
                size="sm"
                className={`transition-all duration-200 ${
                  isDeepSearchEnabled 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'border-gray-600 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Search className="w-4 h-4 mr-2" />
                Deep Search
                {isDeepSearchEnabled && <Globe className="w-4 h-4 ml-2" />}
              </Button>
              <span className="text-sm text-gray-400">
                {isDeepSearchEnabled 
                  ? 'Web search enabled - I can access broader knowledge'
                  : 'Workspace only - I can access your channels and documents'
                }
              </span>
            </div>
          </div>

          {/* Message Input */}
          <div className="flex space-x-2">
            <Textarea
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Ask me anything about ${workspace?.name || 'your workspace'}${isDeepSearchEnabled ? ' or beyond...' : '...'}`}
              className="flex-1 min-h-[44px] max-h-[120px] resize-none bg-gray-700 border border-gray-600 rounded-md text-white placeholder:text-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              rows={1}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="h-[44px] bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EnhancedAIChatbox;
