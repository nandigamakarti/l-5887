import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Bold, 
  Italic, 
  Code, 
  Link, 
  Smile, 
  Paperclip, 
  AtSign,
  Hash,
  Send,
  Image,
  X,
  File as FileIcon,
  Sparkles,
  Loader2,
  AlertCircle,
  Phone,
  Video,
  Calendar,
  Clock,
  BarChart4,
  Globe,
  Cloud,
  Newspaper,
  TrendingUp,
  HelpCircle
} from 'lucide-react';
import { enhanceMessageWithAI } from '@/services/openai';
import { analyzeTone, ToneAnalysis } from '@/services/toneAnalyzer';
import ToneImpactMeter from './ToneImpactMeter';
import { useMessages } from '@/contexts/MessageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ZANI_TRIGGER } from '@/services/zaniService';
import { storeFile } from '@/utils/fileStorage';

interface MessageInputProps {
  channelId: string;
  placeholder?: string;
  isThread?: boolean;
  parentMessageId?: string;
  channelName?: string;
}

const MessageInput: React.FC<MessageInputProps> = ({ 
  channelId, 
  placeholder = "Type a message...",
  isThread = false,
  parentMessageId,
  channelName = "general"
}) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isEnhancingWithAI, setIsEnhancingWithAI] = useState(false);
  const [toneAnalysis, setToneAnalysis] = useState<ToneAnalysis | null>(null);
  const [isAnalyzingTone, setIsAnalyzingTone] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const { addMessage, addReply, getMessages } = useMessages();
  const { user } = useAuth();

  // Extended emoji collection organized by categories
  const emojiCategories = {
    'Smileys': ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '🫠', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '☺️', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🫢', '🫣', '🤫', '🤔'],
    'Gestures': ['👍', '👎', '👌', '🤌', '🤏', '✌️', '🤞', '🫰', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '🫵', '👋', '🤚', '🖐️', '✋', '🖖', '🫱', '🫲', '🫳', '🫴', '👏', '🙌', '🤝', '👐', '🤲', '🙏'],
    'Hearts': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟'],
    'Objects': ['📱', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽️', '🎬', '📺', '📻', '🎵', '🎶', '🎤', '🎧', '📢', '📣', '📯', '🔔', '🔕'],
    'Animals': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗'],
    'Food': ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯']
  };
  
  const workspaceMembers = [
    { id: '1', name: 'Sarah Wilson', username: 'sarah' },
    { id: '2', name: 'Mike Chen', username: 'mike' },
    { id: '3', name: 'Emma Davis', username: 'emma' },
    { id: '4', name: 'John Doe', username: 'john' },
  ];

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '44px'; // Doubled the initial height
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 400) + 'px'; // Doubled max height
    }
  }, [message]);

  const handleSend = async () => {
    if ((!message.trim() && selectedFiles.length === 0) || !user) return;

    let content = message.trim();
    
    // Store files and update content with file references
    if (selectedFiles.length > 0) {
      const filePromises = selectedFiles.map(file => storeFile(file));
      try {
        const storedFiles = await Promise.all(filePromises);
        const fileList = storedFiles.map(file => `📎 ${file.name}`).join('\n');
        content = content ? `${content}\n\n${fileList}` : fileList;
      } catch (error) {
        console.error('Error storing files:', error);
        // Continue with just the file names
        const fileList = selectedFiles.map(file => `📎 ${file.name}`).join('\n');
        content = content ? `${content}\n\n${fileList}` : fileList;
      }
    }

    const messageData = {
      channelId,
      userId: user.id,
      username: user.displayName,
      content,
      threadParticipants: []
    };

    if (isThread && parentMessageId) {
      addReply(channelId, parentMessageId, messageData);
    } else {
      addMessage(channelId, messageData);
    }

    // Clear message, files, and tone analysis
    setMessage('');
    setSelectedFiles([]);
    setToneAnalysis(null);
    setIsAnalyzingTone(false);
  };

  const enhanceWithAI = async () => {
    if (!message.trim() || !user) return;
    setIsEnhancingWithAI(true);
    try {
      const channelMessages = getMessages(channelId) || [];
      const enhancedMessage = await enhanceMessageWithAI(message, channelMessages, channelId);
      setMessage(enhancedMessage);
      
      analyzeToneAndImpact(enhancedMessage);
    } catch (error) {
      console.error('Error enhancing message with AI:', error);
    } finally {
      setIsEnhancingWithAI(false);
    }
  };

  const analyzeToneAndImpact = async (textToAnalyze: string = message) => {
    if (!textToAnalyze.trim()) {
      setIsAnalyzingTone(false);
      setToneAnalysis(null);
      return;
    }
    
    // Don't set isAnalyzingTone here as it's already set in handleInputChange
    // This prevents flickering of the loading state
    try {
      const channelMessages = getMessages(channelId) || [];
      const analysis = await analyzeTone(textToAnalyze, channelMessages, channelName);
      setToneAnalysis(analysis);
    } catch (error) {
      console.error('Error analyzing tone:', error);
      setToneAnalysis(null);
    } finally {
      setIsAnalyzingTone(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newMessage = e.target.value;
    setMessage(newMessage);

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = '44px';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 400) + 'px';
    }

    // Handle mentions
    const lastAtIndex = newMessage.lastIndexOf('@');
    if (lastAtIndex !== -1 && (lastAtIndex === 0 || newMessage[lastAtIndex - 1] === ' ')) {
      const searchText = newMessage.substring(lastAtIndex + 1);
      if (!searchText.includes(' ')) {
        setMentionSearch(searchText);
        setShowMentions(true);
      } else {
        setMentionSearch('');
        setShowMentions(false);
      }
    } else {
      setMentionSearch('');
      setShowMentions(false);
    }

    // Set up debounced tone analysis
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Analyze from the first word typed
    if (newMessage.trim().length > 0) {
      // Start analyzing immediately but show loading state
      if (!isAnalyzingTone) {
        setIsAnalyzingTone(true);
      }
      
      setTypingTimeout(setTimeout(() => {
        analyzeToneAndImpact(newMessage);
      }, 800)); // Slightly faster response time
    } else {
      // Clear analysis if message is empty
      setToneAnalysis(null);
      setIsAnalyzingTone(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const insertMention = (username: string) => {
    const text = message;
    const lastAtIndex = text.lastIndexOf('@');
    const newText = text.substring(0, lastAtIndex) + `@${username} `;
    setMessage(newText);
    setShowMentions(false);
  };
  

  const handleEmojiSelect = (emoji: any) => {
    setMessage(message + emoji.native);
    setShowEmojiPicker(false);
    
    if (textareaRef.current) {
      textareaRef.current.focus();
      const length = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(length, length);
    }
  };

  const formatText = (type: 'bold' | 'italic' | 'code') => {
    if (!textareaRef.current) return;
    
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const selectedText = message.substring(start, end);
    
    let formattedText = '';
    let cursorPosition = 0;
    
    switch (type) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        cursorPosition = start + 2;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        cursorPosition = start + 1;
        break;
      case 'code':
        formattedText = `\`${selectedText}\``;
        cursorPosition = start + 1;
        break;
      default:
        return;
    }
    
    const newText = message.substring(0, start) + formattedText + message.substring(end);
    setMessage(newText);
    
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        if (!selectedText) {
          textareaRef.current.selectionStart = cursorPosition;
          textareaRef.current.selectionEnd = cursorPosition;
        } else {
          textareaRef.current.selectionStart = start;
          textareaRef.current.selectionEnd = start + formattedText.length;
        }
      }
    }, 0);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
      
      // Store files immediately when selected
      try {
        const filePromises = newFiles.map(file => storeFile(file));
        await Promise.all(filePromises);
        console.log('Files stored successfully');
      } catch (error) {
        console.error('Error storing files:', error);
      }
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const filteredMembers = workspaceMembers.filter(member =>
    member.username.toLowerCase().includes(mentionSearch.toLowerCase()) ||
    member.name.toLowerCase().includes(mentionSearch.toLowerCase())
  );

  return (
    <div className="relative">
      {/* Mentions dropdown */}
      {showMentions && (
        <div className="absolute bottom-full left-0 mb-2 w-64 max-h-48 overflow-y-auto bg-gray-800 border border-gray-700 rounded-md shadow-lg z-10">
          {workspaceMembers
            .filter(member => member.username.toLowerCase().includes(mentionSearch.toLowerCase()))
            .map(member => (
              <div 
                key={member.id}
                className="px-3 py-2 hover:bg-gray-700 cursor-pointer flex items-center"
                onClick={() => insertMention(member.username)}
              >
                <div className="w-6 h-6 rounded-md overflow-hidden mr-2">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${member.name}&background=random`} 
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="text-white text-sm">{member.name}</div>
                  <div className="text-gray-400 text-xs">@{member.username}</div>
                </div>
              </div>
            ))
          }
        </div>
      )}
      


      {/* Enhanced Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-full right-0 mb-2 bg-gray-800 border border-gray-600 rounded-lg shadow-lg p-3 z-50 w-80 max-h-64 overflow-hidden">
          <div className="max-h-64 overflow-y-auto scrollbar-hide">
            {Object.entries(emojiCategories).map(([category, emojis]) => (
              <div key={category} className="mb-3">
                <div className="text-gray-400 text-xs uppercase mb-1">{category}</div>
                <div className="grid grid-cols-8 gap-1">
                  {emojis.map((emoji, index) => (
                    <button
                      key={`${category}-${index}`}
                      onClick={() => handleEmojiSelect({ native: emoji })}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-700 rounded text-lg"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* File Previews */}
      {selectedFiles.length > 0 && (
        <div className="mb-2 p-3 bg-gray-800 rounded-md border border-gray-700">
          <div className="flex flex-wrap gap-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center bg-gray-700 rounded-md px-2 py-1 text-sm text-white">
                <div className="flex items-center">
                  {file.type.startsWith('image/') ? (
                    <Image className="w-4 h-4 mr-1 text-blue-400" />
                  ) : (
                    <FileIcon className="w-4 h-4 mr-1 text-purple-400" />
                  )}
                  <span className="truncate max-w-[150px]">{file.name}</span>
                </div>
                <Button
                  onClick={() => handleRemoveFile(index)}
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 ml-1 text-gray-400 hover:text-white hover:bg-gray-600 rounded-full"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Input Container */}
      <div className="p-4 border-t border-gray-700 bg-chat-dark shadow-md">
        {/* Formatting Toolbar */}
        <div className="flex items-center space-x-1 p-2 border-b border-gray-700">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => formatText('bold')}
            className="h-8 w-8 p-0 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md"
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => formatText('italic')}
            className="h-8 w-8 p-0 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md"
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => formatText('code')}
            className="h-8 w-8 p-0 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md"
            title="Code"
          >
            <Code className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {}}
            className="h-8 w-8 p-0 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md"
            title="Link"
          >
            <Link className="w-4 h-4" />
          </Button>
          <div className="h-5 w-px bg-gray-600 mx-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {}}
            className="h-8 w-8 p-0 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md"
            title="Mention user"
          >
            <AtSign className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {}}
            className="h-8 w-8 p-0 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md"
            title="Mention channel"
          >
            <Hash className="w-4 h-4" />
          </Button>
        </div>

        {/* Tone & Impact Meter - Only show when there's text */}
        {(toneAnalysis || isAnalyzingTone) && message.trim().length > 0 && (
          <div className="mb-2 mx-2">
            <ToneImpactMeter 
              analysis={toneAnalysis} 
              isLoading={isAnalyzingTone} 
              message={message} 
            />
          </div>
        )}
        
        {/* Text Input */}
        <div className="flex items-end p-3 space-x-2">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="flex-1 min-h-[44px] max-h-[400px] resize-none bg-gray-700 border border-gray-600 rounded-md text-white placeholder:text-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 px-3 py-2"
            rows={2}
          />
          <div className="flex items-center space-x-1">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="h-8 w-8 p-0 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md"
              title="Attach file"
            >
              <Paperclip className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => imageInputRef.current?.click()}
              className="h-8 w-8 p-0 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md"
              title="Upload image"
            >
              <Image className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="h-8 w-8 p-0 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md"
              title="Add emoji"
            >
              <Smile className="w-4 h-4" />
            </Button>
            {/* AI Enhancement Button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={enhanceWithAI}
                    disabled={!message.trim() || isEnhancingWithAI || isThread}
                    className="h-8 w-8 p-0 text-blue-400 hover:text-blue-300 hover:bg-gray-700 rounded-md"
                  >
                    {isEnhancingWithAI ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4 ai-icon-glow ai-icon-shine" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Enhance message with AI</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => analyzeToneAndImpact()}
                    disabled={!message.trim() || isAnalyzingTone}
                    className="h-8 w-8 p-0 text-purple-400 hover:text-purple-300 hover:bg-gray-700 rounded-md"
                  >
                    {isAnalyzingTone ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <AlertCircle className="w-4 h-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Analyze tone and impact</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button
              onClick={handleSend}
              disabled={!message.trim() && selectedFiles.length === 0}
              size="sm"
              className="h-8 w-8 p-0 bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 rounded-md"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;
