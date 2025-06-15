
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Download, Copy, FileText } from 'lucide-react';
import { downloadMeetingNotes } from '@/utils/meetingNotesGenerator';
import { Message } from '@/contexts/MessageContext';

interface AINotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  notes: string;
  title: string;
  messages?: Message[];
  channelName?: string;
}

const AINotesModal: React.FC<AINotesModalProps> = ({
  isOpen,
  onClose,
  notes,
  title,
  messages = [],
  channelName = ''
}) => {
  const handleCopyNotes = async () => {
    try {
      await navigator.clipboard.writeText(notes);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy notes:', err);
    }
  };

  const handleDownloadNotes = () => {
    if (messages.length > 0 && channelName) {
      downloadMeetingNotes(messages, channelName);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 text-white">
        <DialogHeader className="border-b border-slate-700 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600/20 rounded-lg">
                <FileText className="w-6 h-6 text-blue-400" />
              </div>
              <DialogTitle className="text-xl font-semibold text-white">
                {title}
              </DialogTitle>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyNotes}
                className="text-gray-400 hover:text-white hover:bg-slate-700"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
              {messages.length > 0 && channelName && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDownloadNotes}
                  className="text-gray-400 hover:text-white hover:bg-slate-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              )}
              <DialogClose asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white hover:bg-slate-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </DialogClose>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto p-6">
          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
            <pre className="whitespace-pre-wrap text-sm text-gray-300 font-mono leading-relaxed">
              {notes}
            </pre>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-700">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-slate-600 text-gray-300 hover:bg-slate-700 hover:text-white"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AINotesModal;
