import React, { useState, useEffect, useRef } from 'react';
import UserProfileModal from './UserProfileModal';
import { Button } from '@/components/ui/button';
import { 
  MoreHorizontal, 
  MessageSquare, 
  Smile,
  Reply,
  Download,
  Share2,
  Bookmark,
  Pin,
  PinOff,
  Paperclip,
  MoreVertical,
  File as FileIcon
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Message, useMessages } from '@/contexts/MessageContext';
import { useAuth } from '@/contexts/AuthContext';
import FilePreview from './FilePreview';
import { 
  containsZaniMention, 
  extractZaniQuery, 
  processZaniQuery, 
  highlightZaniMentions,
  isMessageProcessed,
  getStoredZaniResponse,
  storeZaniResponse
} from '@/services/zaniService';
import { UserAvatar } from '@/components/ui/user-avatar';

interface MessageBubbleProps {
  message: Message;
  showAvatar?: boolean;
  isGrouped?: boolean;
  isInThread?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  showAvatar = true,
  isGrouped = false,
  isInThread = false
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showImageActions, setShowImageActions] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [documentToShare, setDocumentToShare] = useState<File | null>(null);
  const [showReactions, setShowReactions] = useState(false);
  const [showThreads, setShowThreads] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isProcessingZani, setIsProcessingZani] = useState(false);
  const [zaniResponse, setZaniResponse] = useState<string | null>(null);
  const [documentName, setDocumentName] = useState('');
  const [showUserProfile, setShowUserProfile] = useState(false);
  const { user } = useAuth();
  const { setSelectedThread, pinMessage, unpinMessage, getPinnedMessages, addDocument, getMessages } = useMessages();
  const messageRef = useRef<HTMLDivElement>(null);
  
  // Check if message is pinned
  const isPinned = message.isPinned || false;
  
  // Process @zani - only once per message, but check for stored response first
  useEffect(() => {
    const processZani = async () => {
      if (message.content && containsZaniMention(message.content)) {
        // First check if we have a stored response
        const storedResponse = getStoredZaniResponse(message.id);
        if (storedResponse) {
          setZaniResponse(storedResponse);
          return;
        }
        
        // Only process if not already processed and not currently processing
        if (!isMessageProcessed(message.id) && !isProcessingZani) {
          const query = extractZaniQuery(message.content);
          if (query) {
            setIsProcessingZani(true);
            try {
              // Only get messages from current channel
              const currentChannelMessages = getMessages(message.channelId) || [];
              const response = await processZaniQuery(
                query, 
                currentChannelMessages, 
                message.channelId, 
                message.id,
                message.content // Pass the full message content for file analysis
              );
              if (response) {
                setZaniResponse(response);
              }
            } catch (error) {
              console.error('Error processing Zani query:', error);
              const errorResponse = 'Sorry, I encountered an error processing your request.';
              storeZaniResponse(message.id, errorResponse);
              setZaniResponse(errorResponse);
            } finally {
              setIsProcessingZani(false);
            }
          }
        }
      }
    };
    
    processZani();
  }, [message.content, message.channelId, message.id, getMessages, isProcessingZani]);

  // Extended emoji collection organized by categories
  const emojiCategories = {
    "Frequently Used": ['👍', '❤️', '😂', '😮', '😢', '😡', '🎉', '👏'],
    "Smileys": ['😀', '😃', '😄', '😁', '😆', '😅', '😊', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘'],
    "Gestures": ['👋', '👌', '✌️', '🤞', '👈', '👉', '👆', '👇', '👍', '👎', '👊', '🤝', '🙏', '💪'],
    "Symbols": ['❤️', '💔', '💯', '✨', '🔥', '💫', '💥', '💢', '💦', '💤', '🎵', '🎶', '⭐', '✅']
  };

  const ensureDate = (timestamp: any): Date => {
    if (timestamp instanceof Date) {
      return timestamp;
    }
    if (typeof timestamp === 'string' || typeof timestamp === 'number') {
      return new Date(timestamp);
    }
    return new Date();
  };

  const formatTimestamp = (timestamp: any) => {
    const date = ensureDate(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    
    return date.toLocaleDateString();
  };

  const formatMessageContent = (content: string) => {
    // Handle actual file attachments from localStorage or uploaded files
    const filePattern = /📎 (.+?)(?:\n|$)/g;
    const files = [];
    let match;
    let textContent = content;

    while ((match = filePattern.exec(content)) !== null) {
      const fileName = match[1].trim();
      files.push({
        name: fileName,
        type: getFileType(fileName),
        url: getActualFileUrl(fileName),
        size: getFileSize(fileName)
      });
      textContent = textContent.replace(match[0], '').trim();
    }

    // Format text content with better URL and mention handling
    const mentionRegex = /@(\w+)(?!zani)/g;
    const channelRegex = /#(\w+)/g;
    
    // Handle markdown image syntax with actual display
    const imageRegex = /!\[(.*?)\]\((.*?)\)/g;
    let formattedContent = textContent.replace(imageRegex, (match, alt, url) => {
      return `<img src="${url}" alt="${alt}" class="max-w-full rounded-md my-2 cursor-pointer hover:opacity-90 transition-opacity" style="max-height: 300px;" onclick="window.open('${url}', '_blank')" />`;
    });
    
    // Handle URLs - make them blue and clickable
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    formattedContent = formattedContent.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:underline">$1</a>');
    
    // Handle @zani mentions with special styling
    formattedContent = highlightZaniMentions(formattedContent);
    
    // Handle regular mentions and channels
    formattedContent = formattedContent
      .replace(mentionRegex, '<span class="text-blue-400 hover:underline cursor-pointer">@$1</span>')
      .replace(channelRegex, '<span class="text-blue-400 hover:underline cursor-pointer">#$1</span>');
    
    // Handle text formatting
    formattedContent = formattedContent
      .replace(/\*([^*]+)\*/g, '<strong>$1</strong>')
      .replace(/\_([^_]+)\_/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code class="bg-gray-700 px-1 rounded text-white">$1</code>');
    
    return { formattedContent, files };
  };

  const getFileType = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension || '')) {
      return 'image/' + (extension === 'jpg' ? 'jpeg' : extension);
    }
    if (extension === 'pdf') return 'application/pdf';
    if (['doc', 'docx'].includes(extension || '')) return 'application/msword';
    if (['xls', 'xlsx'].includes(extension || '')) return 'application/excel';
    return 'application/octet-stream';
  };

  const getActualFileUrl = (fileName: string) => {
    // Try to get from localStorage first (actual uploaded files)
    const storedFiles = localStorage.getItem('slackAI_files');
    if (storedFiles) {
      try {
        const files = JSON.parse(storedFiles);
        const fileEntry = Object.values(files).find((file: any) => file.name === fileName);
        if (fileEntry && (fileEntry as any).url) {
          return (fileEntry as any).url;
        }
      } catch (error) {
        console.error('Error retrieving stored file:', error);
      }
    }

    // Fallback for demonstration purposes only
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return `/lovable-uploads/525e7c65-c028-4da7-a1e6-35cba7375353.png`;
    }
    
    return `data:application/octet-stream;base64,${btoa(fileName)}`;
  };

  const getFileSize = (fileName: string) => {
    // Try to get actual size from localStorage
    const storedFiles = localStorage.getItem('slackAI_files');
    if (storedFiles) {
      try {
        const files = JSON.parse(storedFiles);
        const fileEntry = Object.values(files).find((file: any) => file.name === fileName);
        if (fileEntry && (fileEntry as any).size) {
          return (fileEntry as any).size;
        }
      } catch (error) {
        console.error('Error retrieving file size:', error);
      }
    }
    
    // Default fallback
    return Math.floor(Math.random() * 5000000) + 100000;
  };

  const handleFileDownload = (file: any) => {
    // In a real app, this would trigger the actual download
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReaction = (emoji: string) => {
    // In a real app, this would add or remove reactions
    console.log(`Reacting with ${emoji} to message ${message.id}`);
    setShowEmojiPicker(false);
  };

  const handleReplyClick = () => {
    setSelectedThread({ channelId: message.channelId, messageId: message.id });
  };
  
  const handleZaniAction = (actionUrl: string) => {
    console.log('Action URL clicked:', actionUrl);
  };

  const handlePinMessage = () => {
    if (isPinned) {
      unpinMessage(message.channelId, message.id);
    } else {
      pinMessage(message.channelId, message.id);
    }
  };
  
  const handleDocumentShare = () => {
    if (!documentToShare) return;
    
    // Create a document object
    const documentObj = {
      id: `doc-${Date.now()}`,
      title: documentName || documentToShare.name,
      content: URL.createObjectURL(documentToShare),
      type: documentToShare.type,
      size: documentToShare.size,
      uploadedBy: user?.displayName || 'Unknown user',
      uploadedAt: new Date(),
      isPinned: false
    };
    
    // Add document to the channel
    addDocument(message.channelId, documentObj);
    
    // Reset state
    setDocumentToShare(null);
    setDocumentName('');
    setShowShareDialog(false);
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setDocumentToShare(e.target.files[0]);
      setDocumentName(e.target.files[0].name);
    }
  };

  const { formattedContent, files } = formatMessageContent(message.content);

  return (
    <div 
      className={`px-4 py-2 transition-all duration-200 ${isGrouped ? 'pt-0.5' : 'pt-3'} ${isHovered ? 'bg-gray-700/40' : 'hover:bg-gray-700/20'} ${isInThread ? 'w-full' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      ref={messageRef}
    >
      <div className={`flex ${isInThread ? 'w-full' : ''}`}>
        <div className={`flex items-start ${isInThread ? 'w-full' : 'flex-grow'}`}>
          {/* Avatar */}
          <div className="flex-shrink-0 mr-2">
            {showAvatar && !isGrouped && (
              <UserAvatar 
                name={message.username} 
                size="md" 
                className="rounded-md"
                imageUrl={message.avatar}
              />
            )}
          </div>
          <div className={`flex-grow px-2 py-1 rounded-md ${isInThread ? 'w-full' : ''}`}>
            {/* Message header with user info and timestamp */}
            {!isGrouped && (
              <div className="flex items-center mb-1">
                <span 
                  className="font-bold text-white cursor-pointer hover:underline"
                  onClick={() => setShowUserProfile(true)}
                >
                  {message.username}
                </span>
                <span className="text-xs text-gray-400 ml-2">{formatTimestamp(message.timestamp)}</span>
                {message.edited && (
                  <span className="text-xs text-gray-400 ml-1">(edited)</span>
                )}
              </div>
            )}
            
            {/* Message Content */}
            <div className="text-white whitespace-pre-wrap break-words"
                 dangerouslySetInnerHTML={{ __html: formattedContent }} />
            
            {/* File Attachments */}
            {files.length > 0 && (
              <div className="mt-2 space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="relative">
                    {file.type.startsWith('image/') ? (
                      <div className="relative">
                        <img 
                          src={file.url} 
                          alt={file.name}
                          className="max-w-full rounded-md cursor-pointer hover:opacity-90 transition-opacity" 
                          style={{ maxHeight: '300px' }}
                          onClick={() => window.open(file.url, '_blank')}
                        />
                      </div>
                    ) : (
                      <FilePreview 
                        file={file}
                        onDownload={() => handleFileDownload(file)}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Reactions */}
            {message.reactions && message.reactions.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {message.reactions.map((reaction, index) => (
                  <button
                    key={index}
                    onClick={() => handleReaction(reaction.emoji)}
                    className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs border bg-gray-700/80 border-gray-600 hover:border-blue-400 hover:scale-105 transition-all duration-200"
                  >
                    <span className="text-base">{reaction.emoji}</span>
                    <span className="font-medium text-white ml-1">{reaction.count}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Thread Preview */}
            {message.replyCount > 0 && (
              <button
                onClick={handleReplyClick}
                className="flex items-center gap-2 mt-2 text-blue-400 hover:text-blue-300 text-sm bg-gray-800/40 px-2 py-1 rounded-md hover:bg-gray-700/60 hover:scale-105 transition-all duration-200"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="font-medium">{message.replyCount} {message.replyCount === 1 ? 'reply' : 'replies'}</span>
                <span className="text-gray-400">
                  Last reply {formatTimestamp(new Date())}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Message Actions - Only visible on hover */}
        <div className="flex-shrink-0 relative ml-2">
          <div 
            className="flex items-center space-x-1 transition-opacity duration-200"
            style={{ opacity: isHovered ? 1 : 0 }}
          >
            <div className="hover:scale-110 transition-transform duration-200">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="h-7 w-7 p-0 text-gray-400 hover:text-white hover:bg-gray-600 rounded-full"
              >
                <Smile className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="hover:scale-110 transition-transform duration-200">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReplyClick}
                className="h-7 w-7 p-0 text-gray-400 hover:text-white hover:bg-gray-600 rounded-full"
              >
                <Reply className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="hover:scale-110 transition-transform duration-200">
              <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-gray-400 hover:text-white hover:bg-gray-600 rounded-full"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-800 border-gray-700 text-white">
                  <DialogHeader>
                    <DialogTitle>Share Document</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="flex items-center space-x-2">
                      <label className="flex h-10 w-full items-center justify-center rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-sm hover:bg-gray-600 cursor-pointer">
                        <Paperclip className="mr-2 h-4 w-4" />
                        <span>Upload File</span>
                        <input
                          type="file"
                          className="hidden"
                          onChange={handleFileSelect}
                        />
                      </label>
                    </div>
                    {documentToShare && (
                      <div className="rounded-md border border-gray-600 bg-gray-700 p-3">
                        <div className="flex items-center">
                          <FileIcon className="h-5 w-5 mr-2" />
                          <span className="text-sm font-medium">{documentToShare.name}</span>
                        </div>
                        <div className="mt-2">
                          <Input
                            placeholder="Document title (optional)"
                            value={documentName}
                            onChange={(e) => setDocumentName(e.target.value)}
                            className="bg-gray-600 border-gray-500"
                          />
                        </div>
                        <Button 
                          onClick={handleDocumentShare} 
                          className="mt-3 w-full bg-blue-600 hover:bg-blue-700"
                        >
                          Share Document
                        </Button>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="hover:scale-110 transition-transform duration-200">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePinMessage}
                className={`h-7 w-7 p-0 hover:bg-gray-600 rounded-full ${isPinned ? 'text-yellow-400 hover:text-yellow-300' : 'text-gray-400 hover:text-white'}`}
              >
                {isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
              </Button>
            </div>
            
            <div className="hover:scale-110 transition-transform duration-200">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-gray-400 hover:text-white hover:bg-gray-600 rounded-full"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>
          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="absolute top-full right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-3 w-72 z-50">
              <h3 className="text-sm font-medium text-white mb-2">Add a reaction</h3>
              <div className="max-h-60 overflow-y-auto">
                {Object.entries(emojiCategories).map(([category, emojis]) => (
                  <div key={category} className="mb-3">
                    <h4 className="text-xs font-medium text-gray-400 mb-1">{category}</h4>
                    <div className="grid grid-cols-6 gap-1">
                      {emojis.map((emoji, index) => (
                        <button
                          key={`${category}-${index}`}
                          onClick={() => handleReaction(emoji)}
                          className="w-9 h-9 flex items-center justify-center hover:bg-gray-700 rounded text-lg"
                          title={`Add ${emoji} reaction`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Zani AI Response - Loading indicator */}
      {isProcessingZani && (
        <div className="mt-3 flex items-center text-gray-400 bg-gray-800/50 p-3 rounded-lg">
          <div className="animate-pulse flex space-x-1">
            <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce"></div>
            <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <span className="ml-3 text-sm">Zani is analyzing...</span>
        </div>
      )}
      
      {/* Zani AI Response - Actual response (now persistent) */}
      {!isProcessingZani && zaniResponse && (
        <div className="mt-4 flex items-start bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-l-4 border-blue-400 rounded-lg p-4">
          <div className="flex-shrink-0 mr-3">
            <UserAvatar name="Zani" size="md" />
          </div>
          <div className="flex-grow">
            <div className="flex items-center mb-2">
              <span className="font-medium text-blue-300">Zani</span>
              <span className="ml-2 text-xs text-gray-400">Just now</span>
              <span className="ml-2 text-xs text-blue-400 bg-blue-400/10 px-2 py-1 rounded-full">AI Assistant</span>
            </div>
            <div className="text-gray-200 whitespace-pre-wrap leading-relaxed">
              {zaniResponse}
            </div>
          </div>
        </div>
      )}
      
      {/* User Profile Modal */}
      <UserProfileModal 
        isOpen={showUserProfile} 
        onClose={() => setShowUserProfile(false)} 
        userId={message.userId || 'user1'} 
      />
    </div>
  );
};

export default MessageBubble;
