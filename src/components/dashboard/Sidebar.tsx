
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Hash, 
  Lock, 
  Plus, 
  ChevronDown, 
  Settings, 
  UserPlus, 
  LogOut,
  Bell,
  BellOff,
  User
} from 'lucide-react';

interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  status?: 'online' | 'away' | 'busy' | 'offline';
}

interface Workspace {
  id: string;
  name: string;
  domain: string;
  avatar?: string;
}

interface Channel {
  id: string;
  name: string;
  isPrivate: boolean;
  description?: string;
  unreadCount?: number;
  createdAt: string;
  createdBy?: string;
}

interface SidebarProps {
  user: User | null;
  workspace: Workspace | null;
  currentChannel: string;
  channels: Channel[];
  onChannelSelect: (channelId: string) => void;
  onProfileClick: () => void;
  onCreateChannel: () => void;
  onInviteTeammates: () => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  user,
  workspace,
  currentChannel,
  channels,
  onChannelSelect,
  onProfileClick,
  onCreateChannel,
  onInviteTeammates,
  onLogout,
}) => {
  const [showChannels, setShowChannels] = useState(true);
  const [notifications, setNotifications] = useState(true);

  const toggleNotifications = () => {
    setNotifications(!notifications);
  };

  return (
    <div className="w-64 h-full bg-gradient-to-b from-slate-800 to-slate-900 border-r border-slate-700/50 shadow-xl flex flex-col">
      {/* Workspace Header */}
      <div className="p-4 border-b border-slate-700/50 bg-gradient-to-r from-slate-800 to-slate-900">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-white truncate">
            {workspace?.name || 'Workspace'}
          </h2>
          <div className="flex items-center space-x-1">
            {/* Notifications Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleNotifications}
              className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-slate-700/50"
              title={notifications ? "Disable notifications" : "Enable notifications"}
            >
              {notifications ? (
                <Bell className="w-4 h-4" />
              ) : (
                <BellOff className="w-4 h-4" />
              )}
            </Button>
            
            {/* Invite Teammates */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onInviteTeammates}
              className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-slate-700/50"
              title="Invite teammates"
            >
              <UserPlus className="w-4 h-4" />
            </Button>
            
            {/* Logout */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="h-8 w-8 p-0 text-gray-400 hover:text-red-400 hover:bg-red-900/20"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* User Profile */}
        <Button
          variant="ghost"
          onClick={onProfileClick}
          className="w-full h-auto p-3 justify-start bg-slate-700/30 hover:bg-slate-700/50 rounded-lg border border-slate-600/30"
        >
          <div className="flex items-center space-x-3 w-full">
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-slate-800 rounded-full"></div>
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm font-medium text-white">
                {user?.username || 'User'}
              </div>
              <div className="text-xs text-gray-400">
                {user?.status || 'online'}
              </div>
            </div>
          </div>
        </Button>
      </div>

      {/* Channels Section */}
      <div className="flex-1 overflow-hidden">
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowChannels(!showChannels)}
              className="flex items-center space-x-2 text-gray-300 hover:text-white h-auto p-1"
            >
              <ChevronDown className={`w-4 h-4 transition-transform ${showChannels ? '' : '-rotate-90'}`} />
              <span className="text-sm font-medium">Channels</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCreateChannel}
              className="h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-slate-700/50"
              title="Create channel"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {showChannels && (
            <div className="space-y-1 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
              {channels.map((channel) => (
                <Button
                  key={channel.id}
                  variant="ghost"
                  onClick={() => onChannelSelect(channel.id)}
                  className={`w-full justify-start h-auto p-2 text-left transition-all duration-200 ${
                    currentChannel === channel.id
                      ? 'bg-blue-600/20 text-blue-300 border-l-2 border-blue-400'
                      : 'text-gray-300 hover:text-white hover:bg-slate-700/30'
                  }`}
                >
                  <div className="flex items-center space-x-2 w-full">
                    {channel.isPrivate ? (
                      <Lock className="w-4 h-4 flex-shrink-0" />
                    ) : (
                      <Hash className="w-4 h-4 flex-shrink-0" />
                    )}
                    <span className="flex-1 truncate text-sm">
                      {channel.name}
                    </span>
                    {channel.unreadCount && channel.unreadCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="h-5 min-w-5 text-xs px-1.5 bg-red-500 hover:bg-red-500"
                      >
                        {channel.unreadCount > 99 ? '99+' : channel.unreadCount}
                      </Badge>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
