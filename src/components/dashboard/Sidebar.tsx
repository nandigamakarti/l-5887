
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Hash, 
  Lock, 
  Plus, 
  Search, 
  Settings, 
  Users, 
  Bell,
  LogOut,
  UserPlus,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { User, Workspace } from '@/contexts/AuthContext';

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
  onCreateChannel,
  onInviteTeammates,
  onLogout
}) => {
  const [isChannelsExpanded, setIsChannelsExpanded] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter channels based on search term
  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Split channels into public and private
  const publicChannels = filteredChannels.filter(channel => !channel.isPrivate);
  const privateChannels = filteredChannels.filter(channel => channel.isPrivate);

  return (
    <div className="w-64 h-full bg-gradient-to-b from-slate-800 to-slate-900 flex flex-col border-r border-slate-700/60 shadow-xl">
      {/* Enhanced Workspace Header */}
      <div className="p-4 border-b border-slate-700/60 bg-gradient-to-r from-slate-800 to-slate-900">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">
                {workspace?.name?.[0]?.toUpperCase() || 'W'}
              </span>
            </div>
            <div>
              <h2 className="font-bold text-white text-lg truncate">
                {workspace?.name}
              </h2>
            </div>
          </div>
        </div>
        
        {/* Action Buttons Row */}
        <div className="flex items-center justify-between space-x-2">
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"  
              onClick={() => {/* notifications */}}
              className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-slate-700/60 rounded-lg transition-all duration-200"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onInviteTeammates}
              className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-slate-700/60 rounded-lg transition-all duration-200"
              title="Invite teammates"
            >
              <UserPlus className="w-4 h-4" />
            </Button>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="h-8 w-8 p-0 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all duration-200"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Enhanced Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search channels..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-700/60 border border-slate-600/60 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-200"
          />
        </div>
      </div>

      {/* Enhanced Channels Section */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {/* Public Channels */}
        <div className="mb-4">
          <button
            onClick={() => setIsChannelsExpanded(!isChannelsExpanded)}
            className="flex items-center justify-between w-full py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200"
          >
            <span className="flex items-center">
              {isChannelsExpanded ? <ChevronDown className="w-4 h-4 mr-1" /> : <ChevronRight className="w-4 h-4 mr-1" />}
              Channels ({publicChannels.length})
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onCreateChannel();
              }}
              className="h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-slate-700/60 rounded transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </button>
          
          {isChannelsExpanded && (
            <div className="space-y-1 mt-2">
              {publicChannels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => onChannelSelect(channel.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all duration-200 group ${
                    currentChannel === channel.id
                      ? 'bg-blue-600/80 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-slate-700/50 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <Hash className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate font-medium">{channel.name}</span>
                  </div>
                  {channel.unreadCount && channel.unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                      {channel.unreadCount > 99 ? '99+' : channel.unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Private Channels */}
        {privateChannels.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between py-2">
              <h3 className="text-sm font-medium text-gray-300">Private Channels</h3>
            </div>
            <div className="space-y-1">
              {privateChannels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => onChannelSelect(channel.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                    currentChannel === channel.id
                      ? 'bg-blue-600/80 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-slate-700/50 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <Lock className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate font-medium">{channel.name}</span>
                  </div>
                  {channel.unreadCount && channel.unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {channel.unreadCount > 99 ? '99+' : channel.unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* No channels found */}
        {filteredChannels.length === 0 && searchTerm && (
          <div className="text-center py-8">
            <p className="text-gray-400">No channels found</p>
            <p className="text-sm text-gray-500 mt-1">Try a different search term</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
