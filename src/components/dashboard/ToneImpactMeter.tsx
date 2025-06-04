
import React from 'react';
import { ToneAnalysis } from '@/services/toneAnalyzer';
import { AlertTriangle, AlertCircle, CheckCircle, HelpCircle, Zap, Loader2, ThumbsUp, Info, Sparkles, Target, MessageCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';

interface ToneImpactMeterProps {
  analysis: ToneAnalysis | null;
  isLoading?: boolean;
  message?: string;
}

const ToneImpactMeter: React.FC<ToneImpactMeterProps> = ({ analysis, isLoading = false, message = '' }) => {
  // Simple loading indicator that appears above the input field
  if (isLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
        className="relative overflow-hidden bg-gradient-to-br from-indigo-900/20 via-purple-900/20 to-pink-900/20 backdrop-blur-lg border border-indigo-500/20 rounded-xl shadow-lg mx-1 p-3"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5 animate-pulse" />
        <div className="relative flex items-center justify-center space-x-2">
          <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
          <div className="flex flex-col">
            <span className="text-xs font-medium text-white/90">AI Analyzing</span>
            <span className="text-xs text-purple-300/70">Detecting tone...</span>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!analysis) {
    return null;
  }
  
  // Calculate the effectiveness score as a percentage
  const effectivenessPercentage = Math.min(Math.max((analysis.score / 10) * 100, 0), 100);

  // Get tone color based on analysis
  const getToneGradient = () => {
    switch (analysis.tone) {
      case 'aggressive': return 'from-red-500 via-red-400 to-orange-500';
      case 'weak': return 'from-yellow-500 via-amber-400 to-orange-500';
      case 'confusing': return 'from-orange-500 via-yellow-400 to-amber-500';
      case 'clear': return 'from-emerald-500 via-green-400 to-teal-500';
      case 'neutral': default: return 'from-blue-500 via-indigo-400 to-purple-500';
    }
  };

  // Get impact gradient based on analysis
  const getImpactGradient = () => {
    switch (analysis.impact) {
      case 'high': return 'from-purple-500 via-pink-400 to-fuchsia-500';
      case 'medium': return 'from-blue-500 via-cyan-400 to-teal-500';
      case 'low': default: return 'from-gray-500 via-slate-400 to-gray-600';
    }
  };

  // Get tone emoji and description
  const getToneData = () => {
    switch (analysis.tone) {
      case 'aggressive': return { emoji: '🔥', label: 'Aggressive', description: 'Your message may come across as forceful or confrontational' };
      case 'weak': return { emoji: '😟', label: 'Weak', description: 'Your message lacks confidence and assertiveness' };
      case 'confusing': return { emoji: '🤔', label: 'Confusing', description: 'Your message may be unclear or hard to understand' };
      case 'clear': return { emoji: '✨', label: 'Clear', description: 'Your message is well-structured and easy to understand' };
      case 'neutral': default: return { emoji: '😐', label: 'Neutral', description: 'Your message has a balanced, professional tone' };
    }
  };

  // Get impact emoji and description
  const getImpactData = () => {
    switch (analysis.impact) {
      case 'high': return { emoji: '💥', label: 'High', description: 'Your message will likely grab attention and drive action' };
      case 'medium': return { emoji: '⚡', label: 'Medium', description: 'Your message has moderate influence and engagement potential' };
      case 'low': default: return { emoji: '💤', label: 'Low', description: 'Your message may not create much engagement or response' };
    }
  };

  const toneData = getToneData();
  const impactData = getImpactData();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, type: 'spring', stiffness: 280, damping: 20 }}
      className="relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-gray-900/90 to-slate-800/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl mx-1 mb-2"
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 opacity-10">
        <div className={`absolute inset-0 bg-gradient-to-r ${getToneGradient()} animate-pulse`} />
      </div>
      
      {/* Sparkle effects */}
      <div className="absolute top-1 right-1">
        <Sparkles className="w-3 h-3 text-white/30 animate-pulse" />
      </div>

      {/* Header */}
      <div className="relative flex items-center justify-between px-3 py-2 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <MessageCircle className="w-4 h-4 text-indigo-400" />
          <div>
            <h3 className="text-xs font-bold text-white">Message Analysis</h3>
          </div>
        </div>
        <div className="flex items-center space-x-1 bg-white/10 backdrop-blur-sm rounded-full px-2 py-0.5">
          <Target className="w-2 h-2 text-emerald-400" />
          <span className="text-xs font-bold text-white">{Math.round(effectivenessPercentage)}%</span>
        </div>
      </div>

      {/* Main content */}
      <div className="relative p-3 space-y-2">
        {/* Tone and Impact in a single row */}
        <div className="flex items-center space-x-3">
          {/* Tone Analysis */}
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`relative flex items-center justify-center w-6 h-6 rounded-lg bg-gradient-to-br ${getToneGradient()} shadow-sm`}>
                  <span className="text-xs">{toneData.emoji}</span>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">{toneData.label}</h4>
                </div>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="p-0.5 rounded-full hover:bg-white/10 transition-colors">
                      <Info className="w-3 h-3 text-gray-400" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs p-2 bg-gray-800 border-gray-700 text-white rounded-lg shadow-xl">
                    <p className="text-xs">{toneData.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="relative">
              <Progress 
                value={effectivenessPercentage} 
                className="h-1 bg-white/10 rounded-full overflow-hidden" 
                indicatorClassName={`bg-gradient-to-r ${getToneGradient()} rounded-full shadow-sm transition-all duration-1000 ease-out`} 
              />
            </div>
          </div>

          {/* Impact Analysis */}
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`relative flex items-center justify-center w-6 h-6 rounded-lg bg-gradient-to-br ${getImpactGradient()} shadow-sm`}>
                  <span className="text-xs">{impactData.emoji}</span>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">{impactData.label}</h4>
                </div>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="p-0.5 rounded-full hover:bg-white/10 transition-colors">
                      <Info className="w-3 h-3 text-gray-400" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs p-2 bg-gray-800 border-gray-700 text-white rounded-lg shadow-xl">
                    <p className="text-xs">{impactData.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="relative">
              <Progress 
                value={analysis.impact === 'high' ? 90 : analysis.impact === 'medium' ? 60 : 30} 
                className="h-1 bg-white/10 rounded-full overflow-hidden" 
                indicatorClassName={`bg-gradient-to-r ${getImpactGradient()} rounded-full shadow-sm transition-all duration-1000 ease-out`} 
              />
            </div>
          </div>
        </div>

        {/* AI Suggestions */}
        {analysis.suggestions && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="relative mt-2 p-2 rounded-lg bg-gradient-to-r from-purple-900/15 to-pink-900/15 border border-purple-500/15"
          >
            <div className="flex items-start space-x-2">
              <div className="flex-shrink-0 mt-0.5">
                <ThumbsUp className="w-3 h-3 text-purple-400" />
              </div>
              <div>
                <h5 className="text-xs font-medium text-purple-300 mb-0.5">AI Suggestion</h5>
                <p className="text-xs text-gray-300 leading-relaxed">{analysis.suggestions}</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Bottom glow effect */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </motion.div>
  );
};

export default ToneImpactMeter;
