import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Users, LogOut, X, Briefcase, Star, Clock, Shield } from 'lucide-react';
import { initializeTest01Workspace } from '@/data/test01-workspace';
import { motion } from 'framer-motion';

interface MockWorkspace {
  id: string;
  name: string;
  memberCount: number;
  avatar: string;
  isOwner: boolean;
  slug: string;
  url: string;
}

const WorkspacesPage: React.FC = () => {
  const { user, logout, setWorkspace } = useAuth();
  const navigate = useNavigate();
  const [joinWorkspaceUrl, setJoinWorkspaceUrl] = useState('');
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string | null>(null);
  const [createWorkspaceData, setCreateWorkspaceData] = useState({
    name: '',
    description: '',
    slug: ''
  });

  // Initialize Test01 workspace data when component mounts
  useEffect(() => {
    // Initialize Test01 workspace data with channels and participants
    // Make Test01 workspace available to all users
    initializeTest01Workspace();
  }, []);

  const [userWorkspaces, setUserWorkspaces] = useState<MockWorkspace[]>(() => {
    try {
      const savedWorkspaces = localStorage.getItem('user_workspaces');
      if (savedWorkspaces) {
        const parsedWorkspaces = JSON.parse(savedWorkspaces);
        // Filter workspaces based on user email
        if (user?.email === 'nanibroly@gmail.com') {
          // Show all workspaces including Test01 for nanibroly@gmail.com
          return parsedWorkspaces;
        } else {
          // Hide Test01 workspace for other users
          return parsedWorkspaces.filter((ws: MockWorkspace) => ws.id !== '3');
        }
      }
    } catch (error) {
      console.error('Error loading workspaces from localStorage:', error);
    }
    
    // Default mock workspaces if none found in localStorage
    const defaultWorkspaces = [
      {
        id: '1',
        name: 'Company HQ',
        memberCount: 150,
        avatar: '🏢',
        isOwner: false,
        slug: 'company-hq',
        url: 'company-hq.slack.com'
      },
      {
        id: '2',
        name: 'Design Team',
        memberCount: 24,
        avatar: '🎨',
        isOwner: true,
        slug: 'design-team',
        url: 'design-team.slack.com'
      }
    ];
    
    // Add Test01 workspace only for nanibroly@gmail.com
    if (user?.email === 'nanibroly@gmail.com') {
      defaultWorkspaces.push({
        id: '3', 
        name: 'Test01',
        memberCount: 7,
        avatar: '🧪',
        isOwner: true,
        slug: 'test01',
        url: 'test01.slack.com'
      });
    }
    
    return defaultWorkspaces;
  });

  const handleLaunchWorkspace = (workspaceId: string) => {
    console.log('Launching workspace:', workspaceId);
    const selectedWorkspace = userWorkspaces.find(ws => ws.id === workspaceId);
    if (selectedWorkspace) {
      // First check if user is already authenticated
      const savedUser = localStorage.getItem('slack_user');
      
      if (!user && savedUser) {
        // If we have a saved user but not authenticated in context,
        // restore the user from localStorage to avoid re-authentication
        const parsedUser = JSON.parse(savedUser);
        // This would normally be handled by a proper auth system
        // For this mock, we're just ensuring the user stays logged in
      }
      
      // First, store the workspace data in localStorage
      const workspaceData = {
        id: selectedWorkspace.id,
        name: selectedWorkspace.name,
        url: selectedWorkspace.url,
        slug: selectedWorkspace.slug,
        isAdmin: selectedWorkspace.isOwner
      };
      
      localStorage.setItem('slack_workspace', JSON.stringify(workspaceData));
      
      // Store a flag in localStorage to indicate workspace is selected
      localStorage.setItem('workspace_selected', 'true');
      
      // Set the workspace in auth context
      setWorkspace(workspaceData);
      
      // Use a small timeout to ensure state updates before navigation
      setTimeout(() => {
        // Navigate to dashboard - use replace to avoid going back to workspaces
        navigate('/', { replace: true });
      }, 100);
    }
  };

  const handleCreateWorkspace = () => {
    // Validate form
    if (!createWorkspaceData.name || !createWorkspaceData.slug) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Create a new workspace
    const newWorkspace: MockWorkspace = {
      id: `ws_${Date.now()}`, // Generate a unique ID
      name: createWorkspaceData.name,
      memberCount: 1, // Start with just the creator
      avatar: '🚀', // Default avatar
      isOwner: true,
      slug: createWorkspaceData.slug,
      url: `${createWorkspaceData.slug}.slack.com`
    };
    
    // Add to user workspaces
    const updatedWorkspaces = [...userWorkspaces, newWorkspace];
    setUserWorkspaces(updatedWorkspaces);
    
    // Save to localStorage
    localStorage.setItem('user_workspaces', JSON.stringify(updatedWorkspaces));
    
    // Reset form
    setShowCreateWorkspace(false);
    setCreateWorkspaceData({ name: '', description: '', slug: '' });
    
    // Show success message
    alert(`Workspace ${newWorkspace.name} created successfully!`);
  };

  const handleJoinWorkspace = () => {
    // Validate URL
    if (!joinWorkspaceUrl) {
      alert('Please enter a valid workspace URL');
      return;
    }
    
    // In a real app, this would make an API call to join the workspace
    // For this mock, we'll create a fake workspace based on the URL
    
    // Extract workspace name from URL
    let workspaceName = joinWorkspaceUrl;
    try {
      // Try to extract domain from URL
      const url = new URL(joinWorkspaceUrl);
      workspaceName = url.hostname.split('.')[0];
    } catch (e) {
      // If not a valid URL, use as is
      workspaceName = joinWorkspaceUrl.replace(/[^a-zA-Z0-9-]/g, '-');
    }
    
    // Create a new workspace
    const newWorkspace: MockWorkspace = {
      id: `ws_${Date.now()}`, // Generate a unique ID
      name: workspaceName.charAt(0).toUpperCase() + workspaceName.slice(1),
      memberCount: Math.floor(Math.random() * 50) + 5, // Random member count
      avatar: '🔗', // Default avatar for joined workspaces
      isOwner: false,
      slug: workspaceName.toLowerCase(),
      url: `${workspaceName.toLowerCase()}.slack.com`
    };
    
    // Add to user workspaces
    const updatedWorkspaces = [...userWorkspaces, newWorkspace];
    setUserWorkspaces(updatedWorkspaces);
    
    // Save to localStorage
    localStorage.setItem('user_workspaces', JSON.stringify(updatedWorkspaces));
    
    // Reset form
    setJoinWorkspaceUrl('');
    setShowJoinForm(false);
    
    // Show success message
    alert(`You've joined the ${newWorkspace.name} workspace!`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800">
      {/* Enhanced Header */}
      <header className="bg-black/30 backdrop-blur-md border-b border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-3"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <div>
                <span className="text-white font-bold text-2xl">SlackAI</span>
                <p className="text-white/60 text-sm">from Salesforce</p>
              </div>
            </motion.div>

            <Button
              variant="ghost"
              onClick={logout}
              className="text-white/80 hover:text-white hover:bg-white/10 px-6 py-3 rounded-xl transition-all duration-200"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center mb-8">
            <span className="text-7xl mr-6">👋</span>
            <div>
              <h1 className="text-6xl font-bold text-white mb-2">Welcome back</h1>
              <p className="text-xl text-white/70">Choose your workspace to continue</p>
            </div>
          </div>
        </motion.div>

        {/* User Workspaces Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white/20">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Your Workspaces
                </h2>
                <p className="text-slate-600">for {user?.email}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Briefcase className="w-5 h-5 text-slate-500" />
                <span className="text-sm text-slate-500">{userWorkspaces.length} workspace{userWorkspaces.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userWorkspaces.map((workspace, index) => (
                <motion.div
                  key={workspace.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  onClick={() => setSelectedWorkspace(workspace.id)}
                  className={`group relative p-6 border-2 rounded-xl transition-all duration-300 cursor-pointer ${
                    selectedWorkspace === workspace.id
                      ? 'border-purple-500 bg-purple-50 shadow-lg shadow-purple-200'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-2xl shadow-lg">
                        {workspace.avatar}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                          {workspace.name}
                        </h3>
                        <div className="flex items-center space-x-3 text-sm text-slate-600 mt-1">
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {workspace.memberCount} members
                          </div>
                          {workspace.isOwner && (
                            <div className="flex items-center">
                              <Shield className="w-4 h-4 mr-1 text-amber-500" />
                              <span className="text-amber-600 font-medium">Owner</span>
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 mt-2 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {workspace.url}
                        </div>
                      </div>
                    </div>
                    {selectedWorkspace === workspace.id && (
                      <div className="absolute top-4 right-4">
                        <Star className="w-5 h-5 text-purple-500 fill-current" />
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLaunchWorkspace(workspace.id);
                    }}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-lg"
                  >
                    LAUNCH WORKSPACE
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Create New Workspace Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <Card className="bg-gradient-to-r from-orange-50 to-pink-50 border-orange-200 shadow-xl">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-3xl">👩‍💻</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">
                      Ready to start fresh?
                    </h3>
                    <p className="text-slate-700">Create a new workspace for your team or project</p>
                  </div>
                </div>
                <Button
                  onClick={() => setShowCreateWorkspace(true)}
                  variant="outline"
                  className="border-2 border-purple-500 text-purple-600 hover:bg-purple-500 hover:text-white px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-200"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  CREATE WORKSPACE
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Join Workspace Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          {!showJoinForm ? (
            <div className="space-y-6">
              <p className="text-white/80 text-lg">
                Looking for a different workspace?{' '}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => setShowJoinForm(true)}
                  variant="ghost"
                  className="text-white/80 hover:text-white hover:bg-white/10 px-8 py-4 rounded-xl border border-white/20 transition-all duration-200"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Join existing workspace
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto shadow-2xl">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Join a workspace</h3>
              <div className="space-y-4">
                <Input
                  placeholder="Enter workspace URL, code, or invite link"
                  value={joinWorkspaceUrl}
                  onChange={(e) => setJoinWorkspaceUrl(e.target.value)}
                  className="h-12 text-lg bg-white border-2 border-slate-300 focus:border-purple-500 rounded-xl"
                />
                <div className="flex space-x-3">
                  <Button
                    onClick={handleJoinWorkspace}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white flex-1 h-12 text-lg font-semibold rounded-xl"
                    disabled={!joinWorkspaceUrl.trim()}
                  >
                    Join Workspace
                  </Button>
                  <Button
                    onClick={() => {
                      setShowJoinForm(false);
                      setJoinWorkspaceUrl('');
                    }}
                    variant="outline"
                    className="border-2 border-slate-300 text-slate-600 hover:bg-slate-100 h-12 px-6 rounded-xl"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </main>

      {/* Create Workspace Modal */}
      <Dialog open={showCreateWorkspace} onOpenChange={setShowCreateWorkspace}>
        <DialogContent className="sm:max-w-lg bg-white rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-900">Create a new workspace</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 p-2">
            <div>
              <label className="block text-sm font-semibold mb-3 text-slate-700">Workspace name</label>
              <Input
                placeholder="e.g. My Company"
                value={createWorkspaceData.name}
                onChange={(e) => setCreateWorkspaceData(prev => ({ ...prev, name: e.target.value }))}
                className="h-12 text-lg bg-white border-2 border-slate-300 focus:border-purple-500 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-3 text-slate-700">Description (optional)</label>
              <Input
                placeholder="What's this workspace for?"
                value={createWorkspaceData.description}
                onChange={(e) => setCreateWorkspaceData(prev => ({ ...prev, description: e.target.value }))}
                className="h-12 text-lg bg-white border-2 border-slate-300 focus:border-purple-500 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-3 text-slate-700">Workspace URL</label>
              <div className="flex items-center">
                <Input
                  placeholder="my-company"
                  value={createWorkspaceData.slug}
                  onChange={(e) => setCreateWorkspaceData(prev => ({ ...prev, slug: e.target.value }))}
                  className="rounded-r-none h-12 text-lg bg-white border-2 border-slate-300 focus:border-purple-500"
                />
                <span className="bg-slate-100 border-2 border-l-0 border-slate-300 px-4 py-3 text-lg text-slate-600 rounded-r-xl h-12 flex items-center">
                  .slack.com
                </span>
              </div>
            </div>
            <div className="flex space-x-3 pt-4">
              <Button
                onClick={handleCreateWorkspace}
                disabled={!createWorkspaceData.name.trim()}
                className="flex-1 h-12 text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl"
              >
                Create Workspace
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCreateWorkspace(false)}
                className="h-12 px-6 border-2 border-slate-300 text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkspacesPage;
