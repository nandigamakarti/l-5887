
import React from 'react';

interface SlackLogoProps {
  className?: string;
}

const SlackLogo: React.FC<SlackLogoProps> = ({ className = 'h-8 w-auto' }) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
        <svg 
          className="w-5 h-5 text-white" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" 
            fill="currentColor"
          />
          <path 
            d="M19 15L19.68 18.37L23 19L19.68 19.63L19 23L18.32 19.63L15 19L18.32 18.37L19 15Z" 
            fill="currentColor"
          />
          <path 
            d="M5 15L5.68 18.37L9 19L5.68 19.63L5 23L4.32 19.63L1 19L4.32 18.37L5 15Z" 
            fill="currentColor"
          />
        </svg>
      </div>
      <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
        SlackAI
      </span>
    </div>
  );
};

export default SlackLogo;
