
import React, { useState, useRef, useEffect } from 'react';
import { useMessages } from '@/contexts/MessageContext';
import { User, Channel } from '@/contexts/AuthContext';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import { Button } from '@/components/ui/button';
import { Hash, Users, Settings, Star, Bell, Search, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ChatAreaProps {
  user: User | null;
  channel: string;
  channels: Channel[];
  onSendMessage: (content: string, files?: File[]) => void;
  onThreadSelect: (messageId: string) => void;
  onUpdateMessage: (messageId: string, newContent: string) => void;
  onDeleteMessage: (messageId: string) => void;
  currentView: 'channels' | 'dms';
  selectedDM: string | null;
}

const ChatArea: React.FC<ChatAreaProps> = ({
  user,
  channel,
  channels,
  onSendMessage,
  onThreadSelect,
  onUpdateMessage,
  onDeleteMessage,
  currentView,
  selectedDM
}) => {
  const { messages } = useMessages();
  const { workspace } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showChannelInfo, setShowChannelInfo] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleWorkspaceClick = () => {
    // Clear workspace selection and navigate to workspaces page
    localStorage.removeItem('workspace_selected');
    navigate('/workspaces');
  };

  // Get current messages based on view
  const currentMessages = currentView === 'dms' && selectedDM 
    ? (messages[selectedDM] || []).filter(msg => msg.channelId === selectedDM)
    : (messages[channel] || []).filter(msg => msg.channelId === channel);

  // Get channel info
  const selectedChannel = channels.find(ch => ch.id === channel);
  const isDM = currentView === 'dms';
  
  // Mock DM user data for display
  const dmUser = isDM && selectedDM ? {
    name: selectedDM === 'dm-1' ? 'Sarah Wilson' : 
          selectedDM === 'dm-2' ? 'Mike Chen' :
          selectedDM === 'dm-3' ? 'Emma Davis' :
          selectedDM === 'dm-4' ? 'John Smith' :
          selectedDM === 'dm-5' ? 'Lisa Brown' : 'Unknown User',
    presence: 'active'
  } : null;

  const channelTitle = isDM ? dmUser?.name : selectedChannel?.name;
  const channelDescription = isDM ? 
    `Direct message with ${dmUser?.name}` : 
    selectedChannel?.description || 'Channel description';

  const memberCount = isDM ? 2 : Math.floor(Math.random() * 50) + 5;

  if (!channel && !selectedDM) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Welcome to {workspace?.name || 'Slack'}</h2>
          <p className="text-gray-400">Select a channel or direct message to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleWorkspaceClick}
              className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer"
            >
              {workspace?.name || 'Slack'}
            </button>
            <span className="text-gray-400">/</span>
            <div className="flex items-center space-x-2">
              {isDM ? (
                <span className="text-lg font-semibold text-gray-900">
                  {channelTitle}
                </span>
              ) : (
                <>
                  <Hash className="w-5 h-5 text-gray-600" />
                  <span className="text-lg font-semibold text-gray-900">
                    {channelTitle}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <Star className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <Bell className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <Search className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowChannelInfo(!showChannelInfo)}
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <Info className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Channel Info Bar */}
      {showChannelInfo && (
        <div className="bg-gray-50 border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 flex items-center">
                {isDM ? (
                  channelTitle
                ) : (
                  <>
                    <Hash className="w-4 h-4 mr-1" />
                    {channelTitle}
                  </>
                )}
              </h3>
              <p className="text-sm text-gray-600 mt-1">{channelDescription}</p>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                {memberCount} members
              </div>
              {!isDM && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-gray-600 border-gray-300 hover:bg-gray-100"
                >
                  <Settings className="w-4 h-4 mr-1" />
                  Settings
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {currentMessages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          currentMessages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              currentUser={user}
              onThreadSelect={onThreadSelect}
              onUpdateMessage={onUpdateMessage}
              onDeleteMessage={onDeleteMessage}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 p-4">
        <MessageInput
          onSendMessage={onSendMessage}
          placeholder={isDM ? `Message ${channelTitle}` : `Message #${channelTitle}`}
        />
      </div>
    </div>
  );
};

export default ChatArea;
