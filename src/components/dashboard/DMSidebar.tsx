
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Users, 
  ChevronLeft,
  Settings,
  Bell,
  MessageCircle,
  Filter
} from 'lucide-react';
import { User, Workspace } from '@/contexts/AuthContext';
import test01Data from '@/data/test01-workspace';
import { UserAvatar } from '@/components/ui/user-avatar';

interface DMSidebarProps {
  user: User | null;
  workspace: Workspace | null;
  onUserSelect: (userId: string) => void;
  onBackClick: () => void;
  selectedDM: string;
}

const DMSidebar: React.FC<DMSidebarProps> = ({
  user,
  workspace,
  onUserSelect,
  onBackClick,
  selectedDM
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState(false);

  // Use Test01 workspace participants when workspace id is 3
  const [workspaceMembers, setWorkspaceMembers] = useState([
    { id: 'dm-1', name: 'Sarah Wilson', presence: 'active', avatar: 'SW' },
    { id: 'dm-2', name: 'Mike Chen', presence: 'away', avatar: 'MC' },
    { id: 'dm-3', name: 'Emma Davis', presence: 'offline', avatar: 'ED' },
    { id: 'dm-4', name: 'John Smith', presence: 'active', avatar: 'JS' },
    { id: 'dm-5', name: 'Lisa Brown', presence: 'dnd', avatar: 'LB' },
  ]);
  
  // Update members when workspace changes
  useEffect(() => {
    if (workspace?.id === '3') {
      // Use Test01 workspace participants
      setWorkspaceMembers(test01Data.participants);
    }
  }, [workspace?.id]);

  const getPresenceColor = (presence: string) => {
    switch (presence) {
      case 'active': return 'bg-green-500';
      case 'away': return 'border-2 border-green-500 bg-transparent';
      case 'dnd': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const filteredMembers = workspaceMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = !filterActive || member.presence === 'active';
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="w-80 bg-slack-dark-aubergine text-white flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBackClick}
            className="text-white hover:bg-white/10 p-2 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            <span>Back</span>
          </Button>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilterActive(!filterActive)}
              className={`text-white hover:bg-white/10 p-2 rounded-lg ${filterActive ? 'bg-white/20' : ''}`}
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center mb-4">
          <MessageCircle className="w-6 h-6 mr-3 text-purple-400" />
          <h1 className="font-bold text-xl">Direct Messages</h1>
        </div>
        
        <div className="flex items-center mt-2">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2" />
          <span className="text-sm opacity-80">{user?.displayName}</span>
          <span className="ml-2 text-xs bg-green-500 px-2 py-1 rounded-full text-white">Online</span>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-white/10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
          <Input
            type="text"
            placeholder="Search people or conversations"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 rounded-lg h-10 text-sm focus:bg-white/20 transition-colors"
          />
        </div>
        
        {filterActive && (
          <div className="mt-3 p-2 bg-green-500/20 rounded-lg">
            <span className="text-xs text-green-300">Showing active members only</span>
          </div>
        )}
      </div>

      {/* Members List */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white/70 flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Team Members
            </h3>
            <span className="text-xs bg-white/10 px-2 py-1 rounded-full">
              {filteredMembers.length}
            </span>
          </div>
          
          <div className="space-y-1">
            {filteredMembers.map((member) => (
              <Button
                key={member.id}
                variant="ghost"
                onClick={() => onUserSelect(member.id)}
                className={`w-full justify-start text-white hover:bg-white/10 h-12 text-sm font-normal p-3 rounded-lg transition-all ${
                  selectedDM === member.id ? 'bg-white/20 shadow-sm' : ''
                }`}
              >
                <div className="flex items-center w-full">
                  <div className="relative mr-3">
                    <div className="w-9 h-9 rounded-lg overflow-hidden">
                      <UserAvatar 
                        name={member.name} 
                        size="sm" 
                        className="w-full h-full"
                      />
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border border-slack-dark-aubergine ${getPresenceColor(member.presence)}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium truncate">{member.name}</div>
                    <div className="text-xs text-white/60 capitalize">
                      {member.presence === 'dnd' ? 'Do not disturb' : member.presence}
                    </div>
                  </div>
                  {selectedDM === member.id && (
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  )}
                </div>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10 p-2 rounded-lg"
          >
            <Settings className="w-4 h-4 mr-2" />
            <span className="text-sm">Preferences</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10 p-2 rounded-lg"
          >
            <Bell className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DMSidebar;
