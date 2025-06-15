
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  MessageSquare, 
  Search, 
  Settings, 
  Brain,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Bell,
  FileText,
  User
} from 'lucide-react';
import { User as UserType } from '@/contexts/AuthContext';
import { UserAvatar } from '@/components/ui/user-avatar';

interface NavigationSidebarProps {
  user: UserType | null;
  onHomeClick: () => void;
  onDMClick: () => void;
  onSearchClick: () => void;
  onSettingsClick: () => void;
  onEnhancedAIClick: () => void;
  onProfileClick: () => void;
  onNotificationsClick?: () => void;
  onAINotesClick?: () => void;
}

const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  user,
  onHomeClick,
  onDMClick,
  onSearchClick,
  onSettingsClick,
  onEnhancedAIClick,
  onProfileClick,
  onNotificationsClick,
  onAINotesClick,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigationItems = [
    {
      icon: Home,
      label: 'Home',
      onClick: onHomeClick,
      tooltip: 'Go to Home'
    },
    {
      icon: MessageSquare,
      label: 'DMs',
      onClick: onDMClick,
      tooltip: 'Direct Messages'
    },
    {
      icon: Bell,
      label: 'Activity',
      onClick: onNotificationsClick,
      tooltip: 'Activity & Notifications'
    },
    {
      icon: Search,
      label: 'Search',
      onClick: onSearchClick,
      tooltip: 'Search Messages'
    },
    {
      icon: FileText,
      label: 'AI Notes',
      onClick: onAINotesClick,
      tooltip: 'AI Meeting Notes',
      special: true
    },
    {
      icon: Brain,
      label: 'AI Assistant',
      onClick: onEnhancedAIClick,
      tooltip: 'AI Assistant',
      special: true
    },
    {
      icon: Settings,
      label: 'Settings',
      onClick: onSettingsClick,
      tooltip: 'Workspace Settings'
    }
  ];

  const getPresenceColor = (presence: string) => {
    switch (presence) {
      case 'active': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'dnd': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className={`h-full bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700/50 shadow-2xl transition-all duration-300 flex flex-col ${
      isCollapsed ? 'w-16' : 'w-20'
    }`}>
      {/* Logo Section */}
      <div className="p-4 border-b border-slate-700/50 flex items-center justify-center">
        <div className={`flex items-center space-x-2 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <span className="text-sm font-bold text-white hidden lg:block">AI</span>
          )}
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 flex flex-col space-y-2 p-3">
        {navigationItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="relative group">
              <Button
                variant="ghost"
                size={isCollapsed ? "icon" : "sm"}
                onClick={item.onClick}
                className={`w-full h-12 relative transition-all duration-200 hover:bg-slate-700/50 hover:scale-105 ${
                  item.special 
                    ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 hover:from-purple-600/30 hover:to-blue-600/30' 
                    : 'hover:bg-slate-700/30'
                } ${
                  isCollapsed ? 'justify-center px-0' : 'justify-center lg:justify-start'
                }`}
                title={isCollapsed ? item.tooltip : undefined}
              >
                <Icon className={`w-5 h-5 ${
                  item.special ? 'text-purple-400' : 'text-slate-300'
                }`} />
                {!isCollapsed && (
                  <span className={`ml-2 text-sm hidden lg:block ${
                    item.special ? 'text-purple-300' : 'text-slate-300'
                  }`}>
                    {item.label}
                  </span>
                )}
                {item.special && (
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                )}
              </Button>
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50 border border-slate-600">
                  {item.tooltip}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Profile Section */}
      <div className="p-3 border-t border-slate-700/50">
        <div className="relative group">
          <Button
            variant="ghost"
            size={isCollapsed ? "icon" : "sm"}
            onClick={onProfileClick}
            className={`w-full h-12 transition-all duration-200 hover:bg-slate-700/50 hover:scale-105 ${
              isCollapsed ? 'justify-center px-0' : 'justify-center lg:justify-start'
            }`}
            title={isCollapsed ? 'Profile' : undefined}
          >
            <div className="relative">
              <UserAvatar 
                name={user?.displayName || 'User'} 
                size="sm"
                className="ring-2 ring-slate-600 group-hover:ring-slate-500 transition-all duration-200"
              />
              <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getPresenceColor(user?.presence || 'offline')} rounded-full border-2 border-slate-800`}></div>
            </div>
            {!isCollapsed && (
              <span className="ml-2 text-sm text-slate-300 hidden lg:block truncate">
                {user?.displayName || 'Profile'}
              </span>
            )}
          </Button>
          
          {/* Tooltip for collapsed state */}
          {isCollapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50 border border-slate-600">
              Profile
            </div>
          )}
        </div>
      </div>

      {/* Collapse Toggle Button */}
      <div className="p-3 border-t border-slate-700/50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full h-10 hover:bg-slate-700/30 transition-all duration-200"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-slate-400" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default NavigationSidebar;
