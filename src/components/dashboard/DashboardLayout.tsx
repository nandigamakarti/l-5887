
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMessages } from '@/contexts/MessageContext';
import NavigationSidebar from './NavigationSidebar';
import ChatArea from './ChatArea';
import ThreadSidebar from './ThreadSidebar';
import EnhancedAIChatbox from './EnhancedAIChatbox';
import CreateChannelModal from './CreateChannelModal';
import InviteTeammatesModal from './InviteTeammatesModal';
import UserProfile from './UserProfile';
import SearchModal from './SearchModal';
import WorkspaceSettings from './WorkspaceSettings';
import DirectMessageModal from './DirectMessageModal';
import DMSidebar from './DMSidebar';
import { initializeMockData } from '@/utils/initializeMockData';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const DashboardLayout = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const { user, workspace, logout } = useAuth();
  const { 
    channels, 
    currentChannel, 
    setCurrentChannel, 
    addChannel,
    messages,
    addMessage,
    updateMessage,
    deleteMessage,
    clearMessages,
    setMessages
  } = useMessages();

  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [showAIChat, setShowAIChat] = useState(false);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDMModal, setShowDMModal] = useState(false);
  const [currentView, setCurrentView] = useState<'channels' | 'dms'>('channels');
  const [directMessages, setDirectMessages] = useState<any[]>([]);
  const [selectedDM, setSelectedDM] = useState<string | null>(null);

  useEffect(() => {
    initializeMockData();
  }, []);

  const handleChannelSelect = (channelId: string) => {
    setCurrentChannel(channelId);
    setSelectedThread(null);
  };

  const handleCreateChannel = (channel: { name: string; description: string; isPrivate: boolean }) => {
    const newChannel = {
      id: `channel-${Date.now()}`,
      name: channel.name,
      description: channel.description,
      isPrivate: channel.isPrivate,
      createdAt: new Date().toISOString(),
      createdBy: user?.id
    };
    addChannel(newChannel);
    setCurrentChannel(newChannel.id);
    setShowCreateChannel(false);
  };

  const handleSendMessage = (content: string, files?: File[]) => {
    if (!user || !currentChannel) return;

    const targetId = currentView === 'dms' ? selectedDM : currentChannel;
    if (!targetId) return;

    const newMessage = {
      channelId: targetId,
      userId: user.id,
      username: user.displayName,
      avatar: user.avatar,
      content,
      type: currentView === 'dms' ? 'dm' : 'channel',
      threadParticipants: [],
      files: files ? files.map(file => ({
        id: `file-${Date.now()}`,
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file)
      })) : undefined
    };

    addMessage(targetId, newMessage);
  };

  const handleThreadSelect = (messageId: string) => {
    setSelectedThread(messageId);
  };

  const handleHomeClick = () => {
    setCurrentView('channels');
    setSelectedDM(null);
    if (channels.length > 0) {
      setCurrentChannel(channels[0].id);
    }
  };

  const handleDMClick = () => {
    setCurrentView('dms');
    setCurrentChannel('');
  };

  const handleUpdateMessage = (messageId: string, newContent: string) => {
    updateMessage(messageId, newContent);
  };

  const handleDeleteMessage = (messageId: string) => {
    deleteMessage(messageId);
  };
  
  const handleLogout = () => {
    logout();
  };
  
  const handleThreadsClick = () => {
    // Handle threads navigation
    console.log('Threads clicked');
  };

  const handleSavedItemsClick = () => {
    // Handle saved items navigation
    console.log('Saved items clicked');
  };

  const handleLaterClick = () => {
    // Handle later items navigation
    console.log('Later clicked');
  };

  const handleNotificationsClick = () => {
    // Handle notifications/activity
    console.log('Notifications clicked');
  };

  const currentMessages = currentView === 'dms' && selectedDM 
    ? (messages[selectedDM] || []).filter(msg => msg.channelId === selectedDM)
    : (messages[currentChannel] || []).filter(msg => msg.channelId === currentChannel);

  const selectedChannel = channels.find(ch => ch.id === currentChannel);

  // Create channel names map for AI
  const channelNames = channels.reduce((acc, channel) => {
    acc[channel.id] = channel.name;
    return acc;
  }, {} as { [channelId: string]: string });

  return (
    <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Main Navigation Sidebar - Single sidebar for everything */}
      <NavigationSidebar 
        user={user}
        onHomeClick={handleHomeClick}
        onDMClick={handleDMClick}
        onSearchClick={() => setShowSearch(true)}
        onSettingsClick={() => setShowSettings(true)}
        onEnhancedAIClick={() => setShowAIChat(true)}
        onProfileClick={() => setShowProfile(true)}
        onThreadsClick={handleThreadsClick}
        onSavedItemsClick={handleSavedItemsClick}
        onLaterClick={handleLaterClick}
        onNotificationsClick={handleNotificationsClick}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 flex">
          <ChatArea 
            user={user}
            channel={currentView === 'dms' && selectedDM ? selectedDM : currentChannel}
            channels={channels}
            onSendMessage={handleSendMessage}
            onThreadSelect={handleThreadSelect}
            onUpdateMessage={handleUpdateMessage}
            onDeleteMessage={handleDeleteMessage}
            currentView={currentView}
            selectedDM={selectedDM}
          />
          
          {/* Thread Sidebar */}
          {selectedThread && (
            <div className="w-96 border-l border-gray-700">
              <div className="p-4">
                <h3>Thread</h3>
                <button onClick={() => setSelectedThread(null)}>Close</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Chatbox Overlay */}
      {showAIChat && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-700">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowAIChat(false)}
              className="absolute top-4 right-4 z-10 text-gray-400 hover:text-white hover:bg-slate-700 rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
            <EnhancedAIChatbox 
              isOpen={showAIChat}
              onClose={() => setShowAIChat(false)}
              channelNames={channelNames}
            />
          </div>
        </div>
      )}

      {/* Modals */}
      {showCreateChannel && (
        <CreateChannelModal
          isOpen={showCreateChannel}
          onClose={() => setShowCreateChannel(false)}
          onCreateChannel={handleCreateChannel}
        />
      )}

      {showInviteModal && (
        <InviteTeammatesModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
        />
      )}

      {showProfile && (
        <UserProfile
          user={user}
          onClose={() => setShowProfile(false)}
        />
      )}

      {showSearch && (
        <SearchModal
          isOpen={showSearch}
          onClose={() => setShowSearch(false)}
        />
      )}

      {showSettings && (
        <WorkspaceSettings
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showDMModal && (
        <DirectMessageModal
          isOpen={showDMModal}
          onClose={() => setShowDMModal(false)}
          onUserSelect={(userId: string) => {
            setSelectedDM(userId);
            setCurrentView('dms');
            setShowDMModal(false);
          }}
        />
      )}
    </div>
  );
};

export default DashboardLayout;
