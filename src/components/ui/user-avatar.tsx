
import React, { useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials, getAvatarStyle } from '@/utils/avatarUtils';

interface UserAvatarProps {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  imageUrl?: string;
}

/**
 * UserAvatar component that displays either an image or initials with a colored background
 * Now renders as a square with rounded corners
 */
export function UserAvatar({ name, size = 'md', className = '', imageUrl }: UserAvatarProps) {
  // Calculate size class
  const sizeClass = useMemo(() => {
    switch (size) {
      case 'xs': return 'h-4 w-4';
      case 'sm': return 'h-8 w-8';
      case 'lg': return 'h-12 w-12';
      case 'md':
      default: return 'h-10 w-10';
    }
  }, [size]);
  
  // Get initials from name
  const initials = useMemo(() => getInitials(name), [name]);
  
  // Get avatar style based on name
  const avatarStyle = useMemo(() => getAvatarStyle(name), [name]);
  
  // Adjust font size based on avatar size
  const textSizeClass = useMemo(() => {
    switch (size) {
      case 'xs': return 'text-[6px]';
      case 'sm': return 'text-xs';
      case 'lg': return 'text-base';
      case 'md':
      default: return 'text-sm';
    }
  }, [size]);

  return (
    <Avatar className={`${sizeClass} ${className} rounded-lg`}>
      {imageUrl && (
        <AvatarImage src={imageUrl} alt={name} className="rounded-lg" />
      )}
      <AvatarFallback style={avatarStyle} className={`${textSizeClass} rounded-lg`}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
