import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Hash, Reply, MoreHorizontal, Brain, FileDown, Clock, Users } from 'lucide-react';
import { useMessages } from '@/contexts/MessageContext';
import MessageBubble from './MessageBubble';
import ThreadMessageInput from './ThreadMessageInput';
import { showMeetingNotesPopup } from '@/utils/meetingNotesGenerator';
import AINotesModal from './AINotesModal';

const ThreadSidebar: React.FC = () => {
  const { messages, selectedThread, setSelectedThread } = useMessages();
  const [inputText, setInputText] = useState('');
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [notesContent, setNotesContent] = useState('');
  const [notesTitle, setNotesTitle] = useState('');
  const [notesMessages, setNotesMessages] = useState<any[]>([]);
  
  // Auto-close thread when input is empty and user clicks away
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // If there's no input text and the click is outside the thread sidebar
      if (inputText === '' && selectedThread) {
        // Check if the click is outside the thread sidebar
        const threadSidebar = document.querySelector('.thread-sidebar');
        if (threadSidebar && !threadSidebar.contains(e.target as Node)) {
          // Close the thread
          setSelectedThread(null);
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [inputText, selectedThread, setSelectedThread]);

  if (!selectedThread) return null;

  const channelMessages = messages[selectedThread.channelId] || [];
  const parentMessage = channelMessages.find(msg => msg.id === selectedThread.messageId);

  if (!parentMessage) return null;

  const replyCount = parentMessage.replies?.length || 0;

  const handleShowAINotes = () => {
    const threadMessages = [parentMessage, ...(parentMessage.replies || [])];
    showMeetingNotesPopup(
      threadMessages,
      `Thread in ${selectedThread.channelId}`,
      (notes, title) => {
        setNotesContent(notes);
        setNotesTitle(title);
        setNotesMessages(threadMessages);
        setShowNotesModal(true);
      }
    );
  };

  return (
    <>
      <div className="w-full h-full bg-gradient-to-b from-gray-800 to-gray-900 border-l border-gray-700/50 flex flex-col thread-sidebar shadow-2xl">
        {/* Enhanced Thread Header */}
        <div className="p-6 border-b border-gray-700/50 flex items-center justify-between bg-gradient-to-r from-gray-800 to-gray-900 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-white font-semibold">
              <Hash className="w-4 h-4 text-blue-400" />
              <span>{selectedThread.channelId}</span>
            </div>
            <div className="text-gray-400">&gt;</div>
            <div className="flex items-center space-x-2 text-white font-medium">
              <Reply className="w-4 h-4 text-green-400" />
              <span>Thread with {parentMessage.username}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* Enhanced AI Notes Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShowAINotes}
              className="h-9 px-4 text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 flex items-center gap-2 border border-blue-500/30 rounded-lg transition-all duration-200"
              title="Generate AI Meeting Notes"
            >
              <Brain className="w-4 h-4" />
              <span className="text-sm font-medium">AI Notes</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedThread(null)}
              className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Thread Stats */}
        <div className="px-6 py-3 bg-gray-800/30 border-b border-gray-700/30 flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <div className="flex items-center space-x-1">
              <Reply className="w-4 h-4" />
              <span>{replyCount} {replyCount === 1 ? 'reply' : 'replies'}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>Started {new Date(parentMessage.timestamp).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Thread Messages */}
        <div className="flex-1 overflow-hidden w-full">
          <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent w-full">
            {/* Parent Message */}
            <div className="border-b border-gray-700/50 p-6 bg-gradient-to-r from-gray-800/30 to-gray-900/30 w-full">
              <div className="mb-2 text-xs text-gray-400 flex items-center gap-1">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                Original Message
              </div>
              <MessageBubble message={parentMessage} showAvatar={true} isInThread={true} />
            </div>
            
            {/* Replies */}
            <div className="p-6 bg-gradient-to-b from-gray-800 to-gray-900 w-full">
              {replyCount > 0 ? (
                <div className="space-y-4 w-full">
                  <div className="text-sm text-gray-400 flex items-center gap-2 mb-4">
                    <div className="h-px bg-gray-600 flex-1"></div>
                    <span>{replyCount} {replyCount === 1 ? 'Reply' : 'Replies'}</span>
                    <div className="h-px bg-gray-600 flex-1"></div>
                  </div>
                  {parentMessage.replies && parentMessage.replies.map((reply) => (
                    <div key={reply.id} className="w-full">
                      <MessageBubble
                        message={reply}
                        showAvatar={true}
                        isGrouped={false}
                        isInThread={true}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Reply className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No replies yet</p>
                  <p className="text-sm text-gray-500 mt-1">Be the first to respond!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Thread Input */}
        <div className="p-4 border-t border-gray-700/50 bg-gradient-to-r from-gray-800 to-gray-900 shadow-inner">
          <div className="border border-gray-600/50 rounded-xl bg-gray-700/50 shadow-inner backdrop-blur-sm">
            <ThreadMessageInput
              channelId={selectedThread.channelId}
              placeholder={`Reply to ${parentMessage.username}...`}
              parentMessageId={selectedThread.messageId}
              channelName={selectedThread.channelId}
              onInputChange={setInputText}
            />
          </div>
        </div>
      </div>

      {/* AI Notes Modal */}
      <AINotesModal
        isOpen={showNotesModal}
        onClose={() => setShowNotesModal(false)}
        notes={notesContent}
        title={notesTitle}
        messages={notesMessages}
        channelName={selectedThread?.channelId}
      />
    </>
  );
};

export default ThreadSidebar;
