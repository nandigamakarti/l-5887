
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { 
  Search, 
  Users, 
  ChevronLeft,
  MessageCircle,
  Filter,
  MessageSquare,
  Hash,
  Plus
} from 'lucide-react';
import { User, Workspace } from '@/contexts/AuthContext';
import { UserAvatar } from '@/components/ui/user-avatar';

interface MainNavigationSidebarProps {
  user: User | null;
  workspace: Workspace | null;
  currentView: 'channels' | 'dms' | 'activity' | 'threads';
  onViewChange: (view: 'channels' | 'dms' | 'activity' | 'threads') => void;
  onUserSelect?: (userId: string) => void;
  onBackClick?: () => void;
  selectedDM?: string;
  onCreateChannel?: () => void;
  onBrowseAllPeople?: () => void;
}

const MainNavigationSidebar: React.FC<MainNavigationSidebarProps> = ({
  user,
  workspace,
  currentView,
  onViewChange,
  onUserSelect,
  onBackClick,
  selectedDM,
  onCreateChannel,
  onBrowseAllPeople
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activityFilter, setActivityFilter] = useState('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  // Mock direct messages data
  const directMessages = [
    { id: 'dm-1', name: 'Sarah Wilson', presence: 'active', avatar: 'SW', unread: 2 },
    { id: 'dm-2', name: 'Mike Chen', presence: 'away', avatar: 'MC', unread: 0 },
    { id: 'dm-3', name: 'Emma Davis', presence: 'offline', avatar: 'ED', unread: 1 },
    { id: 'dm-4', name: 'John Smith', presence: 'active', avatar: 'JS', unread: 0 },
    { id: 'dm-5', name: 'Lisa Brown', presence: 'dnd', avatar: 'LB', unread: 3 },
  ];

  const getPresenceColor = (presence: string) => {
    switch (presence) {
      case 'active': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'dnd': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const renderDirectMessages = () => (
    <div className="flex-1 overflow-y-auto px-4 py-2">
      {/* Direct Messages Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white/70 flex items-center">
            <MessageSquare className="w-4 h-4 mr-2" />
            Direct Messages
          </h3>
        </div>
        
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
          <Input
            type="text"
            placeholder="Search conversations"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 rounded-lg h-10 text-sm focus:bg-white/20 transition-colors"
          />
        </div>
        
        {/* Direct Messages List */}
        <div className="space-y-1">
          {directMessages
            .filter(dm => dm.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((dm) => (
            <Button
              key={dm.id}
              variant="ghost"
              onClick={() => onUserSelect?.(dm.id)}
              className={`w-full justify-start text-white hover:bg-white/10 h-12 text-sm font-normal p-3 rounded-lg transition-all ${
                selectedDM === dm.id ? 'bg-white/20 shadow-sm' : ''
              }`}
            >
              <div className="flex items-center w-full">
                <div className="relative mr-3">
                  <UserAvatar 
                    name={dm.name} 
                    size="sm" 
                    className="w-9 h-9"
                  />
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-800 ${getPresenceColor(dm.presence)}`} />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium truncate">{dm.name}</div>
                  <div className="text-xs text-white/60 capitalize">
                    {dm.presence === 'dnd' ? 'Do not disturb' : dm.presence}
                  </div>
                </div>
                {dm.unread > 0 && (
                  <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                    {dm.unread}
                  </div>
                )}
              </div>
            </Button>
          ))}
        </div>
        
        {/* Browse All People */}
        <Button
          variant="ghost"
          onClick={onBrowseAllPeople}
          className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10 h-10 text-sm mt-4 rounded-lg"
        >
          <Users className="w-4 h-4 mr-3" />
          Browse all people
        </Button>
      </div>
    </div>
  );

  const renderActivity = () => (
    <div className="flex-1 overflow-y-auto px-4 py-2">
      {/* Activity Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white/70 flex items-center">
            <MessageCircle className="w-4 h-4 mr-2" />
            Activity
          </h3>
        </div>
        
        {/* Activity Filter Menu */}
        <div className="bg-white/5 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-white/70">Show unread messages only</span>
            <Switch
              checked={showUnreadOnly}
              onCheckedChange={setShowUnreadOnly}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'all', label: 'All' },
              { id: 'threads', label: 'Threads' },
              { id: 'reactions', label: 'Reactions' },
              { id: 'invitations', label: 'Invitations' }
            ].map((filter) => (
              <Button
                key={filter.id}
                variant="ghost"
                size="sm"
                onClick={() => setActivityFilter(filter.id)}
                className={`text-xs h-8 ${
                  activityFilter === filter.id 
                    ? 'bg-white/20 text-white' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Activity List */}
        <div className="space-y-2">
          <div className="text-center py-8">
            <MessageCircle className="w-8 h-8 mx-auto text-white/40 mb-2" />
            <p className="text-white/60 text-sm">No recent activity</p>
            <p className="text-white/40 text-xs mt-1">
              When you have notifications, they'll show up here
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderThreads = () => (
    <div className="flex-1 overflow-y-auto px-4 py-2">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white/70 flex items-center">
            <MessageCircle className="w-4 h-4 mr-2" />
            Threads
          </h3>
        </div>
        
        <div className="text-center py-8">
          <MessageCircle className="w-8 h-8 mx-auto text-white/40 mb-2" />
          <p className="text-white/60 text-sm">No threads yet</p>
          <p className="text-white/40 text-xs mt-1">
            Your threads will appear here when you reply to messages
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-80 bg-slack-dark-aubergine text-white flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          {currentView !== 'channels' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackClick}
              className="text-white hover:bg-white/10 p-2 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              <span>Back</span>
            </Button>
          )}
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-white/5 rounded-lg p-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewChange('dms')}
            className={`flex-1 h-8 text-xs ${
              currentView === 'dms' 
                ? 'bg-white/20 text-white' 
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <MessageSquare className="w-3 h-3 mr-1" />
            DMs
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewChange('activity')}
            className={`flex-1 h-8 text-xs ${
              currentView === 'activity' 
                ? 'bg-white/20 text-white' 
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <MessageCircle className="w-3 h-3 mr-1" />
            Activity
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewChange('threads')}
            className={`flex-1 h-8 text-xs ${
              currentView === 'threads' 
                ? 'bg-white/20 text-white' 
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <Hash className="w-3 h-3 mr-1" />
            Threads
          </Button>
        </div>
      </div>

      {/* Content based on current view */}
      {currentView === 'dms' && renderDirectMessages()}
      {currentView === 'activity' && renderActivity()}
      {currentView === 'threads' && renderThreads()}
    </div>
  );
};

export default MainNavigationSidebar;
