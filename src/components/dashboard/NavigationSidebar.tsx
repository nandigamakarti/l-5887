
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  MessageCircle, 
  Users, 
  Hash,
  Plus,
  ChevronDown,
  ChevronRight
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
  onThreadsClick?: () => void;
  onSavedItemsClick?: () => void;
  onLaterClick?: () => void;
  onNotificationsClick?: () => void;
}

const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  user,
  onHomeClick,
  onDMClick,
  onSearchClick,
  onSettingsClick,
  onEnhancedAIClick,
  onProfileClick,
  onThreadsClick,
  onSavedItemsClick,
  onLaterClick,
  onNotificationsClick,
}) => {
  return (
    <div className="w-64 h-full bg-slate-900 border-r border-slate-700/50 shadow-xl flex flex-col">
      {/* Workspace Header */}
      <div className="p-4 border-b border-slate-700/50">
        <h2 className="text-white font-bold text-lg">Your Workspace</h2>
      </div>

      {/* Navigation Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Threads Section */}
        <div className="p-3">
          <Button
            variant="ghost"
            onClick={onThreadsClick}
            className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800 p-2 h-8"
          >
            <MessageCircle className="w-4 h-4 mr-3" />
            Threads
          </Button>
        </div>

        {/* Huddles Section */}
        <div className="p-3">
          <Button
            variant="ghost"
            className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800 p-2 h-8"
          >
            <Users className="w-4 h-4 mr-3" />
            Huddles
          </Button>
        </div>

        {/* Channels Section */}
        <div className="px-3 py-2">
          <div className="flex items-center justify-between mb-2">
            <button className="flex items-center text-slate-300 hover:text-white">
              <ChevronDown className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">Channels</span>
            </button>
          </div>
          <div className="space-y-1 ml-2">
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800 p-2 h-7 text-sm"
            >
              <Hash className="w-3 h-3 mr-2" />
              announcements
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800 p-2 h-7 text-sm"
            >
              <Hash className="w-3 h-3 mr-2" />
              cohort-2
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-white bg-purple-600 hover:bg-purple-700 p-2 h-7 text-sm"
            >
              <Hash className="w-3 h-3 mr-2" />
              introduce-yourself
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800 p-2 h-7 text-sm"
            >
              <Hash className="w-3 h-3 mr-2" />
              learn-ask-build
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800 p-2 h-7 text-sm"
            >
              <Plus className="w-3 h-3 mr-2" />
              Add channels
            </Button>
          </div>
        </div>

        {/* Direct Messages Section */}
        <div className="px-3 py-2">
          <div className="flex items-center justify-between mb-2">
            <button className="flex items-center text-slate-300 hover:text-white">
              <ChevronDown className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">Direct messages</span>
            </button>
          </div>
          <div className="space-y-1 ml-2">
            {/* Direct Message Users */}
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800 p-2 h-7 text-sm"
            >
              <div className="w-4 h-4 mr-2 rounded-full bg-orange-500 flex items-center justify-center text-xs text-white font-bold">
                N
              </div>
              Nandini Manchala
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800 p-2 h-7 text-sm"
            >
              <div className="w-4 h-4 mr-2 rounded-full bg-green-500 flex items-center justify-center text-xs text-white font-bold">
                A
              </div>
              Abhishek Rajput
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800 p-2 h-7 text-sm"
            >
              <div className="w-4 h-4 mr-2 rounded-full bg-yellow-500 flex items-center justify-center text-xs text-white font-bold">
                A
              </div>
              Aman Vats
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800 p-2 h-7 text-sm"
            >
              <div className="w-4 h-4 mr-2 rounded-full bg-pink-500 flex items-center justify-center text-xs text-white font-bold">
                H
              </div>
              Hema Harshini Vankayala
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800 p-2 h-7 text-sm"
            >
              <div className="w-4 h-4 mr-2 rounded-full bg-purple-500 flex items-center justify-center text-xs text-white font-bold">
                P
              </div>
              Priya
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800 p-2 h-7 text-sm"
            >
              <div className="w-4 h-4 mr-2 rounded-full bg-blue-500 flex items-center justify-center text-xs text-white font-bold">
                R
              </div>
              Ravin Kumar Jangir
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800 p-2 h-7 text-sm"
            >
              <div className="w-4 h-4 mr-2 rounded-full bg-red-500 flex items-center justify-center text-xs text-white font-bold">
                S
              </div>
              Shambhavi Gupta
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800 p-2 h-7 text-sm"
            >
              <div className="w-4 h-4 mr-2 rounded-full bg-teal-500 flex items-center justify-center text-xs text-white font-bold">
                V
              </div>
              Venkata Lokesh
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800 p-2 h-7 text-sm"
            >
              <div className="w-4 h-4 mr-2 rounded-full bg-indigo-500 flex items-center justify-center text-xs text-white font-bold">
                K
              </div>
              Kartikeya <span className="text-slate-500 ml-1">you</span>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800 p-2 h-7 text-sm"
            >
              <Users className="w-3 h-3 mr-2" />
              Browse all people
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavigationSidebar;
