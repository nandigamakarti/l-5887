
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
  Plus,
  MoreHorizontal
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

  // Enhanced direct messages data to match Slack's style
  const directMessages = [
    { 
      id: 'dm-1', 
      name: 'Sarah Wilson', 
      presence: 'active', 
      avatar: 'SW', 
      unread: 2,
      lastMessage: 'Thanks for the update!',
      timestamp: '2m ago'
    },
    { 
      id: 'dm-2', 
      name: 'Mike Chen', 
      presence: 'away', 
      avatar: 'MC', 
      unread: 0,
      lastMessage: 'Let me check on that...',
      timestamp: '1h ago'
    },
    { 
      id: 'dm-3', 
      name: 'Emma Davis', 
      presence: 'offline', 
      avatar: 'ED', 
      unread: 1,
      lastMessage: 'Great work on the project!',
      timestamp: '3h ago'
    },
    { 
      id: 'dm-4', 
      name: 'John Smith', 
      presence: 'active', 
      avatar: 'JS', 
      unread: 0,
      lastMessage: 'See you in the meeting',
      timestamp: '5h ago'
    },
    { 
      id: 'dm-5', 
      name: 'Lisa Brown', 
      presence: 'dnd', 
      avatar: 'LB', 
      unread: 3,
      lastMessage: 'Working on the proposal',
      timestamp: '1d ago'
    },
  ];

  const getPresenceColor = (presence: string) => {
    switch (presence) {
      case 'active': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'dnd': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getPresenceText = (presence: string) => {
    switch (presence) {
      case 'active': return 'Active';
      case 'away': return 'Away';
      case 'dnd': return 'Do not disturb';
      default: return 'Offline';
    }
  };

  const renderDirectMessages = () => (
    <div className="flex-1 overflow-y-auto">
      {/* Workspace Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBackClick}
            className="text-white hover:bg-white/10 p-2 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            <span>Back</span>
          </Button>
        </div>
        
        <div className="flex items-center mb-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center shadow-lg mr-3">
            <span className="text-white font-bold text-sm">
              {workspace?.name?.[0]?.toUpperCase() || 'W'}
            </span>
          </div>
          <div>
            <h1 className="font-bold text-white text-lg">{workspace?.name}</h1>
            <p className="text-sm text-white/60">Direct Messages</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-white/10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
          <Input
            type="text"
            placeholder="Search direct messages"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 rounded-lg h-10 text-sm focus:bg-white/20 transition-colors"
          />
        </div>
      </div>

      {/* Direct Messages List */}
      <div className="px-4 py-2">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white/70 flex items-center">
              <MessageSquare className="w-4 h-4 mr-2" />
              Direct Messages
            </h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-white/60 hover:text-white hover:bg-white/10 rounded"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="space-y-1">
            {directMessages
              .filter(dm => dm.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((dm) => (
              <Button
                key={dm.id}
                variant="ghost"
                onClick={() => onUserSelect?.(dm.id)}
                className={`w-full justify-start text-white hover:bg-white/10 h-auto text-sm font-normal p-3 rounded-lg transition-all ${
                  selectedDM === dm.id ? 'bg-white/20 shadow-sm' : ''
                }`}
              >
                <div className="flex items-center w-full">
                  <div className="relative mr-3 flex-shrink-0">
                    <UserAvatar 
                      name={dm.name} 
                      size="sm" 
                      className="w-8 h-8"
                    />
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slack-dark-aubergine ${getPresenceColor(dm.presence)}`} />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="font-medium truncate text-white">{dm.name}</div>
                      <div className="text-xs text-white/50 ml-2">{dm.timestamp}</div>
                    </div>
                    <div className="text-xs text-white/60 truncate mt-0.5">
                      {dm.lastMessage}
                    </div>
                  </div>
                  {dm.unread > 0 && (
                    <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center ml-2">
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
    </div>
  );

  const renderActivity = () => (
    <div className="flex-1 overflow-y-auto">
      {/* Activity Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBackClick}
            className="text-white hover:bg-white/10 p-2 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            <span>Back</span>
          </Button>
        </div>
        
        <div className="flex items-center mb-3">
          <MessageCircle className="w-6 h-6 mr-3 text-purple-400" />
          <h1 className="font-bold text-white text-xl">Activity</h1>
        </div>
        
        {/* Activity Filter Menu */}
        <div className="bg-white/5 rounded-lg p-3 mt-4">
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
      </div>
      
      {/* Activity Content */}
      <div className="px-4 py-2">
        <div className="text-center py-8">
          <MessageCircle className="w-8 h-8 mx-auto text-white/40 mb-2" />
          <p className="text-white/60 text-sm">No recent activity</p>
          <p className="text-white/40 text-xs mt-1">
            When you have notifications, they'll show up here
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-80 bg-slack-dark-aubergine text-white flex flex-col h-full">
      {currentView === 'dms' && renderDirectMessages()}
      {currentView === 'activity' && renderActivity()}
    </div>
  );
};

export default MainNavigationSidebar;
