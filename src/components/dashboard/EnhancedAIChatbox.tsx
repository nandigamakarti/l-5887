
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, X, Loader2, Brain, Search, Globe, Database, FileText, Image, Minimize2, Maximize2 } from 'lucide-react';
import { useMessages } from '@/contexts/MessageContext';
import { useAuth } from '@/contexts/AuthContext';
import { EnhancedAIService, AIMessage, WorkspaceData } from '@/services/enhancedAIService';
import { motion, AnimatePresence } from 'framer-motion';

interface EnhancedAIChatboxProps {
  isOpen: boolean;
  onClose: () => void;
  channelNames: { [channelId: string]: string };
  currentChannelId?: string;
}

const EnhancedAIChatbox: React.FC<EnhancedAIChatboxProps> = ({ 
  isOpen, 
  onClose, 
  channelNames,
  currentChannelId = 'general'
}) => {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDeepSearchEnabled, setIsDeepSearchEnabled] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { getAllPublicChannelMessages, getPinnedDocuments } = useMessages();
  const { workspace } = useAuth();

  // Add welcome message when component mounts
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: `🤖 **AI Assistant Ready!**\n\nHello! I'm your enhanced AI assistant for **${workspace?.name || 'your workspace'}**.\n\n**What I can do:**\n• 📊 Analyze your workspace conversations\n• 📌 Review pinned documents and images\n• 🔍 Search through channel history\n• 🌐 Access web information (when Deep Search is enabled)\n\n**Getting Started:**\nJust ask me anything about your workspace or enable Deep Search for broader knowledge!`,
          timestamp: new Date()
        }
      ]);
    }
  }, [workspace?.name]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getPinnedDocumentsForCurrentChannel = () => {
    if (!currentChannelId) return [];
    return getPinnedDocuments(currentChannelId);
  };

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
      const pinnedDocs = getPinnedDocumentsForCurrentChannel();
      
      const workspaceData: WorkspaceData = {
        channels: allChannelMessages,
        channelNames,
        pinnedDocs: pinnedDocs,
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
          content: "⚠️ I encountered an error processing your request. Please try again in a moment.",
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

  const pinnedDocs = getPinnedDocumentsForCurrentChannel();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ 
          scale: 1, 
          opacity: 1, 
          y: 0,
          height: isMinimized ? 'auto' : '85vh'
        }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-2xl w-full max-w-5xl flex flex-col overflow-hidden border border-gray-700"
      >
        {/* Enhanced Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Brain className="w-8 h-8 text-blue-400 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                AI Assistant
                <span className="text-xs bg-blue-500 px-2 py-1 rounded-full">ENHANCED</span>
              </h2>
              <div className="flex items-center space-x-3 text-sm text-gray-300">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>{workspace?.name || 'Unknown'}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  {isDeepSearchEnabled ? (
                    <>
                      <Globe className="w-3 h-3 text-green-400" />
                      <span className="text-green-400">Deep Search</span>
                    </>
                  ) : (
                    <>
                      <Database className="w-3 h-3 text-blue-400" />
                      <span>Workspace Mode</span>
                    </>
                  )}
                </div>
                {pinnedDocs.length > 0 && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <FileText className="w-3 h-3 text-amber-400" />
                      <span className="text-amber-400">{pinnedDocs.length} docs</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-8 w-8 p-0 rounded-full text-gray-400 hover:text-white hover:bg-gray-700"
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 rounded-full text-gray-400 hover:text-white hover:bg-gray-700"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Pinned Documents Preview */}
            {pinnedDocs.length > 0 && (
              <div className="px-6 py-3 bg-gradient-to-r from-amber-900/20 to-amber-800/20 border-b border-amber-700/30">
                <div className="flex items-center space-x-2 mb-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-semibold text-amber-300">Available Resources</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {pinnedDocs.map((doc, index) => (
                    <div key={index} className="flex items-center space-x-2 bg-amber-900/30 px-3 py-1 rounded-full text-xs border border-amber-700/50">
                      {doc.type?.startsWith('image/') ? (
                        <Image className="w-3 h-3 text-blue-400" />
                      ) : (
                        <FileText className="w-3 h-3 text-amber-400" />
                      )}
                      <span className="text-amber-200">{doc.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 p-6 overflow-y-auto bg-gradient-to-b from-gray-800 to-gray-900 max-h-96">
              <div className="space-y-6">
                <AnimatePresence>
                  {messages.map(message => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl p-4 shadow-lg ${
                          message.role === 'user'
                            ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white'
                            : 'bg-gradient-to-br from-gray-700 to-gray-800 text-white border border-gray-600'
                        }`}
                      >
                        {message.role === 'assistant' && (
                          <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-gray-600">
                            <Brain className="w-4 h-4 text-blue-400" />
                            {message.isDeepSearch ? (
                              <div className="flex items-center gap-1">
                                <Globe className="w-3 h-3 text-green-400" />
                                <span className="text-xs text-green-400 font-medium">Deep Search Response</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <Database className="w-3 h-3 text-blue-400" />
                                <span className="text-xs text-blue-400 font-medium">Workspace Analysis</span>
                              </div>
                            )}
                          </div>
                        )}
                        <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
                        <div className="text-xs text-gray-300 mt-3 flex items-center justify-between border-t border-gray-600 pt-2">
                          <span>
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {message.role === 'user' && message.isDeepSearch && (
                            <span className="flex items-center gap-1 text-green-400">
                              <Globe className="w-3 h-3" />
                              <span className="text-xs">Web Enhanced</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {isLoading && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl p-4 flex items-center space-x-3 border border-gray-600 shadow-lg">
                      <div className="relative">
                        <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                        <div className="absolute inset-0 w-5 h-5 border-2 border-blue-400/20 rounded-full animate-ping"></div>
                      </div>
                      <span className="text-white font-medium">
                        {isDeepSearchEnabled ? 'Analyzing workspace & web sources...' : 'Processing workspace data...'}
                      </span>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Enhanced Input Area */}
            <div className="p-6 border-t border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900">
              {/* Deep Search Toggle */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button
                    onClick={toggleDeepSearch}
                    variant={isDeepSearchEnabled ? "default" : "outline"}
                    size="sm"
                    className={`transition-all duration-300 shadow-lg ${
                      isDeepSearchEnabled 
                        ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-green-500/25' 
                        : 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500'
                    }`}
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Deep Search Mode
                    {isDeepSearchEnabled && <Globe className="w-4 h-4 ml-2 animate-pulse" />}
                  </Button>
                  <div className="text-sm text-gray-400 bg-gray-800/50 px-3 py-1 rounded-full border border-gray-700">
                    {isDeepSearchEnabled 
                      ? '🌐 Web + Workspace access enabled'
                      : '🏢 Workspace-only mode active'
                    }
                  </div>
                </div>
              </div>

              {/* Message Input */}
              <div className="flex space-x-3">
                <div className="flex-1 relative">
                  <Textarea
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Ask me about ${workspace?.name || 'your workspace'}${pinnedDocs.length > 0 ? ', pinned docs' : ''}${isDeepSearchEnabled ? ', or anything else...' : '...'}`}
                    className="min-h-[50px] max-h-[120px] resize-none bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-inner"
                    rows={1}
                  />
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="h-[50px] px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white disabled:opacity-50 rounded-xl shadow-lg transition-all duration-200"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default EnhancedAIChatbox;
