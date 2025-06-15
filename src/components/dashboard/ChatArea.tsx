
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Hash, 
  Users, 
  Star, 
  Phone, 
  Video, 
  Info, 
  Search,
  X,
  Brain,
  FileDown,
  Settings,
  MoreVertical
} from 'lucide-react';
import { downloadMeetingNotes } from '@/utils/meetingNotesGenerator';
import { User } from '@/contexts/AuthContext';
import { useMessages } from '@/contexts/MessageContext';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';

// Define the Channel interface if not already defined elsewhere
interface Channel {
  id: string;
  name: string;
  isPrivate: boolean;
  description?: string;
  unreadCount?: number;
  createdAt: string;
  createdBy?: string;
}

interface ChatAreaProps {
  channel: string;
  user: User | null;
  channels?: Channel[];
}

const ChatArea: React.FC<ChatAreaProps> = ({ channel, user, channels = [] }) => {
  const { messages } = useMessages();
  const [isFavorite, setIsFavorite] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelMessages = messages[channel] || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [channelMessages]);

  const getChannelIcon = () => {
    if (channel.startsWith('dm-')) {
      return <Users className="w-5 h-5" />;
    }
    return <Hash className="w-5 h-5" />;
  };

  const getChannelName = () => {
    // For direct messages
    if (channel.startsWith('dm-')) {
      const dmNames = {
        'dm-1': 'Sarah Wilson',
        'dm-2': 'Mike Chen',
        'dm-3': 'Emma Davis',
        'dm-4': 'John Smith',
        'dm-5': 'Lisa Brown'
      };
      return dmNames[channel as keyof typeof dmNames] || 'Direct Message';
    }
    
    // For channels, look up the name in the channels array
    const foundChannel = channels.find(c => c.id === channel);
    return foundChannel ? foundChannel.name : channel;
  };

  const ensureDate = (timestamp: any): Date => {
    if (timestamp instanceof Date) {
      return timestamp;
    }
    if (typeof timestamp === 'string' || typeof timestamp === 'number') {
      return new Date(timestamp);
    }
    return new Date();
  };

  const shouldShowAvatar = (messageIndex: number) => {
    if (messageIndex === 0) return true;
    const currentMessage = channelMessages[messageIndex];
    const previousMessage = channelMessages[messageIndex - 1];
    
    // Ensure timestamps are Date objects
    const currentTimestamp = ensureDate(currentMessage.timestamp);
    const previousTimestamp = ensureDate(previousMessage.timestamp);
    
    // Show avatar if different user or time gap > 5 minutes
    const timeDiff = currentTimestamp.getTime() - previousTimestamp.getTime();
    return currentMessage.userId !== previousMessage.userId || timeDiff > 5 * 60 * 1000;
  };

  const isGroupedMessage = (messageIndex: number) => {
    if (messageIndex === 0) return false;
    const currentMessage = channelMessages[messageIndex];
    const previousMessage = channelMessages[messageIndex - 1];
    
    // Ensure timestamps are Date objects
    const currentTimestamp = ensureDate(currentMessage.timestamp);
    const previousTimestamp = ensureDate(previousMessage.timestamp);
    
    // Group if same user and within 5 minutes
    const timeDiff = currentTimestamp.getTime() - previousTimestamp.getTime();
    return currentMessage.userId === previousMessage.userId && timeDiff <= 5 * 60 * 1000;
  };

  const handleStarClick = () => {
    setIsFavorite(!isFavorite);
    // Here you would typically save this to a favorites list
  };

  const handleSearchClick = () => {
    setShowSearch(!showSearch);
    if (!showSearch) {
      setSearchQuery('');
    }
  };

  const filteredMessages = searchQuery.trim() 
    ? channelMessages.filter(message => 
        message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        message.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : channelMessages;

  return (
    <div className="flex flex-col h-full w-full bg-gradient-to-b from-gray-900 to-gray-800 min-w-0">
      {/* Enhanced Chat Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-700/50 bg-gradient-to-r from-gray-800 to-gray-900 flex-shrink-0 shadow-lg">
        <div className="flex items-center space-x-4 min-w-0">
          <div className="text-gray-300 flex-shrink-0 p-2 bg-gray-700/50 rounded-lg">
            {getChannelIcon()}
          </div>
          <div className="min-w-0">
            <h2 className="font-bold text-xl text-white truncate flex items-center gap-2">
              {getChannelName()}
              {isFavorite && <Star className="w-4 h-4 text-yellow-400 fill-current" />}
            </h2>
            {!channel.startsWith('dm-') && (
              <div>
                {/* Show channel description if available */}
                {channels.find(c => c.id === channel)?.description && (
                  <p className="text-sm text-gray-300 truncate mt-1">
                    {channels.find(c => c.id === channel)?.description}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Reorganized Header Buttons */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          {/* AI Notes Button - Moved to prominent position */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => downloadMeetingNotes(channelMessages, getChannelName())}
            className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 flex items-center gap-2 px-4 py-2 rounded-lg border border-blue-500/30 transition-all duration-200"
            title="Generate AI Meeting Notes"
          >
            <Brain className="w-4 h-4" />
            <span className="text-sm font-medium">AI Notes</span>
          </Button>
          
          {/* Star Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleStarClick}
            className={`hover:bg-gray-700/50 p-2 rounded-lg transition-all duration-200 ${
              isFavorite ? 'text-yellow-400 bg-yellow-900/20' : 'text-gray-400 hover:text-yellow-400'
            }`}
          >
            <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </Button>
          
          {/* Search Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleSearchClick}
            className={`hover:bg-gray-700/50 p-2 rounded-lg transition-all duration-200 ${
              showSearch ? 'text-white bg-gray-700' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Search className="w-4 h-4" />
          </Button>
          
          {/* Info Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 p-2 rounded-lg"
          >
            <Info className="w-4 h-4" />
          </Button>
          
          {/* More Options */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 p-2 rounded-lg"
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Enhanced Search Bar */}
      {showSearch && (
        <div className="p-4 border-b border-gray-700/50 bg-gradient-to-r from-gray-800/50 to-gray-900/50">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder={`Search in ${getChannelName()}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-12"
              autoFocus
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-gray-400 hover:text-white rounded-full"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
          {searchQuery && (
            <p className="text-xs text-gray-400 mt-3 ml-1">
              {filteredMessages.length} result{filteredMessages.length !== 1 ? 's' : ''} found
            </p>
          )}
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {filteredMessages.length === 0 ? (
          <div className="text-center py-12 px-6">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <div className="text-gray-400">
                {searchQuery ? <Search className="w-8 h-8" /> : getChannelIcon()}
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">
              {searchQuery 
                ? 'No messages found' 
                : `Welcome to ${getChannelName()}`
              }
            </h3>
            <p className="text-gray-400 text-lg">
              {searchQuery 
                ? `No messages match "${searchQuery}" in this channel.`
                : channel.startsWith('dm-') 
                  ? 'This is the start of your conversation.'
                  : 'This is the beginning of your channel conversation.'
              }
            </p>
          </div>
        ) : (
          <div className="pb-6">
            {filteredMessages.map((message, index) => (
              <MessageBubble
                key={message.id}
                message={message}
                showAvatar={shouldShowAvatar(index)}
                isGrouped={isGroupedMessage(index)}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Enhanced Message Input */}
      <div className="p-6 border-t border-gray-700/50 bg-gradient-to-r from-gray-800 to-gray-900 flex-shrink-0 shadow-inner">
        <div className="border border-gray-600/50 rounded-xl bg-gray-700/50 shadow-inner backdrop-blur-sm">
          <MessageInput
            channelId={channel}
            placeholder={`Message ${channel.startsWith('dm-') ? getChannelName() : `#${getChannelName()}`}`}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
