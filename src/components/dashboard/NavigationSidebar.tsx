
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  MessageSquare, 
  Search,
  Settings,
  MoreHorizontal,
  Plus,
  LogOut,
  Zap,
  Brain,
  ChevronRight,
  Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface NavigationSidebarProps {
  onHomeClick: () => void;
  onDMClick: () => void;
  onSearchClick: () => void;
  onSettingsClick: () => void;
  onLogout?: () => void;
  onEnhancedAIClick?: () => void;
}

const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  onHomeClick,
  onDMClick,
  onSearchClick,
  onSettingsClick,
  onLogout,
  onEnhancedAIClick
}) => {
  const [activeItem, setActiveItem] = useState('home');
  const [animating, setAnimating] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const { workspace } = useAuth();
  
  // Get available workspaces from localStorage
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  
  const { user } = useAuth();
  
  useEffect(() => {
    try {
      const savedWorkspaces = localStorage.getItem('user_workspaces');
      if (savedWorkspaces) {
        const parsedWorkspaces = JSON.parse(savedWorkspaces);
        
        // Apply filtering based on user email
        let filteredWorkspaces;
        if (user?.email === 'nanibroly@gmail.com') {
          // Show all workspaces for nanibroly@gmail.com
          filteredWorkspaces = parsedWorkspaces;
        } else {
          // Hide Test01 workspace for other users
          filteredWorkspaces = parsedWorkspaces.filter((ws: any) => ws.id !== '3' && ws.name !== 'Test01');
        }
        
        setWorkspaces(filteredWorkspaces);
      }
    } catch (error) {
      console.error('Error loading workspaces:', error);
    }
  }, [user]);
  
  const handleItemClick = (item: string, callback: () => void) => {
    setAnimating(item);
    setActiveItem(item);
    
    // Add a small delay for the animation to complete
    setTimeout(() => {
      setAnimating(null);
      callback();
    }, 300);
  };
  
  // Handle workspace click - redirect to workspaces page
  const handleWorkspaceClick = () => {
    navigate('/workspaces');
  };

  const sidebarWidth = isCollapsed ? 'w-16' : 'w-64';
  
  return (
    <div className={`${sidebarWidth} bg-slack-aubergine flex flex-col transition-all duration-300 ease-in-out relative`}>
      {/* Collapse/Expand Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow z-10"
      >
        <ChevronRight className={`w-4 h-4 text-gray-600 transition-transform ${isCollapsed ? 'rotate-0' : 'rotate-180'}`} />
      </button>

      {/* Header */}
      <div className="p-4 border-b border-white/10">
        {/* Current Workspace Icon - Clickable */}
        <button 
          onClick={handleWorkspaceClick}
          className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mb-4 hover:ring-2 hover:ring-white/30 transition-all cursor-pointer"
          title="Switch workspace"
        >
          <span className="text-slack-aubergine font-bold text-lg">
            {workspace?.name?.charAt(0) || 'M'}
          </span>
        </button>

        {!isCollapsed && (
          <div className="text-white">
            <h2 className="font-bold text-lg">{workspace?.name || 'Workspace'}</h2>
            <p className="text-xs text-white/70">{user?.displayName}</p>
          </div>
        )}
      </div>
      
      {/* Navigation Items */}
      <div className="flex-1 py-4 space-y-2">
        <div className={`px-2 ${isCollapsed ? 'flex flex-col items-center space-y-2' : ''}`}>
          <Button
            variant="ghost"
            size={isCollapsed ? "sm" : "default"}
            className={`${isCollapsed ? 'w-12 h-12 p-0' : 'w-full justify-start'} text-white hover:bg-white/20 rounded-lg transition-all duration-300 ${activeItem === 'home' ? 'bg-white/20 scale-105' : ''} ${animating === 'home' ? 'animate-pulse' : ''}`}
            onClick={() => handleItemClick('home', onHomeClick)}
          >
            <Home className={`${isCollapsed ? 'w-5 h-5' : 'w-5 h-5 mr-3'} transition-all duration-300 ${activeItem === 'home' ? 'text-white scale-110' : 'text-gray-300'}`} />
            {!isCollapsed && <span>Home</span>}
          </Button>
        </div>
        
        <div className={`px-2 ${isCollapsed ? 'flex flex-col items-center space-y-2' : ''}`}>
          <Button
            variant="ghost"
            size={isCollapsed ? "sm" : "default"}
            className={`${isCollapsed ? 'w-12 h-12 p-0' : 'w-full justify-start'} text-white hover:bg-white/20 rounded-lg transition-all duration-300 ${activeItem === 'messages' ? 'bg-white/20 scale-105' : ''} ${animating === 'messages' ? 'animate-pulse' : ''}`}
            onClick={() => handleItemClick('messages', onDMClick)}
          >
            <MessageSquare className={`${isCollapsed ? 'w-5 h-5' : 'w-5 h-5 mr-3'} transition-all duration-300 ${activeItem === 'messages' ? 'text-white scale-110' : 'text-gray-300'}`} />
            {!isCollapsed && <span>Direct Messages</span>}
          </Button>
        </div>
        
        <div className={`px-2 ${isCollapsed ? 'flex flex-col items-center space-y-2' : ''}`}>
          <Button
            variant="ghost"
            size={isCollapsed ? "sm" : "default"}
            className={`${isCollapsed ? 'w-12 h-12 p-0' : 'w-full justify-start'} text-white hover:bg-white/20 rounded-lg transition-all duration-300 ${activeItem === 'search' ? 'bg-white/20 scale-105' : ''} ${animating === 'search' ? 'animate-pulse' : ''}`}
            onClick={() => handleItemClick('search', onSearchClick)}
          >
            <Search className={`${isCollapsed ? 'w-5 h-5' : 'w-5 h-5 mr-3'} transition-all duration-300 ${activeItem === 'search' ? 'text-white scale-110' : 'text-gray-300'}`} />
            {!isCollapsed && <span>Search</span>}
          </Button>
        </div>
        
        <div className={`px-2 ${isCollapsed ? 'flex flex-col items-center space-y-2' : ''}`}>
          <Button
            variant="ghost"
            size={isCollapsed ? "sm" : "default"}
            className={`${isCollapsed ? 'w-12 h-12 p-0' : 'w-full justify-start'} text-white hover:bg-white/20 rounded-lg transition-all duration-300 ${activeItem === 'enhanced-ai' ? 'bg-white/20 scale-105' : ''} ${animating === 'enhanced-ai' ? 'animate-pulse' : ''}`}
            onClick={() => handleItemClick('enhanced-ai', onEnhancedAIClick || (() => {}))}
          >
            <Brain className={`${isCollapsed ? 'w-5 h-5' : 'w-5 h-5 mr-3'} transition-all duration-300 ai-icon-glow ai-icon-shine ${activeItem === 'enhanced-ai' ? 'text-blue-400 scale-110' : 'text-blue-300'}`} />
            {!isCollapsed && <span>AI Assistant</span>}
          </Button>
        </div>
        
        <div className={`px-2 ${isCollapsed ? 'flex flex-col items-center space-y-2' : ''}`}>
          <Button
            variant="ghost"
            size={isCollapsed ? "sm" : "default"}
            className={`${isCollapsed ? 'w-12 h-12 p-0' : 'w-full justify-start'} text-white hover:bg-white/20 rounded-lg transition-all duration-300 ${activeItem === 'settings' ? 'bg-white/20 scale-105' : ''} ${animating === 'settings' ? 'animate-pulse' : ''}`}
            onClick={() => handleItemClick('settings', onSettingsClick)}
          >
            <Settings className={`${isCollapsed ? 'w-5 h-5' : 'w-5 h-5 mr-3'} transition-all duration-300 ${activeItem === 'settings' ? 'text-white scale-110 rotate-45' : 'text-gray-300'}`} />
            {!isCollapsed && <span>Settings</span>}
          </Button>
        </div>
      </div>
      
      {/* Footer Actions */}
      <div className="p-4 space-y-2 border-t border-white/10">
        <div className={`${isCollapsed ? 'flex flex-col items-center space-y-2' : ''}`}>
          <Button
            variant="ghost"
            size={isCollapsed ? "sm" : "default"}
            className={`${isCollapsed ? 'w-12 h-12 p-0' : 'w-full justify-start'} text-white hover:bg-white/20 rounded-lg transition-all duration-300 ${activeItem === 'add' ? 'bg-white/20 scale-105' : ''} ${animating === 'add' ? 'animate-pulse' : ''}`}
            onClick={() => {
              setAnimating('add');
              setActiveItem('add');
              setTimeout(() => setAnimating(null), 300);
            }}
          >
            <Plus className={`${isCollapsed ? 'w-5 h-5' : 'w-5 h-5 mr-3'} text-gray-300 transition-all duration-300 hover:text-white hover:scale-110 hover:rotate-90`} />
            {!isCollapsed && <span>Add Channel</span>}
          </Button>
        </div>
        
        <div className={`${isCollapsed ? 'flex flex-col items-center space-y-2' : ''}`}>
          <Button
            variant="ghost"
            size={isCollapsed ? "sm" : "default"}
            className={`${isCollapsed ? 'w-12 h-12 p-0' : 'w-full justify-start'} text-white hover:bg-white/20 rounded-lg transition-all duration-300 ${activeItem === 'workspaces' ? 'bg-white/20 scale-105' : ''} ${animating === 'workspaces' ? 'animate-pulse' : ''}`}
            onClick={() => {
              setAnimating('workspaces');
              setTimeout(() => {
                window.location.href = '/workspaces';
              }, 300);
            }}
          >
            <Users className={`${isCollapsed ? 'w-5 h-5' : 'w-5 h-5 mr-3'} text-red-400 transition-all duration-300 hover:text-red-300 hover:scale-110`} />
            {!isCollapsed && <span className="text-red-400">Switch Workspace</span>}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NavigationSidebar;
