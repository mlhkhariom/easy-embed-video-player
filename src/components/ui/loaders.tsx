
import React from 'react';
import { cn } from '@/lib/utils';

// Circular spinner with customizable color
export const Spinner: React.FC<{
  size?: 'xs' | 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'accent' | 'white';
  className?: string;
}> = ({ size = 'md', color = 'primary', className }) => {
  const sizeClasses = {
    xs: 'w-4 h-4 border-2',
    sm: 'w-6 h-6 border-2',
    md: 'w-8 h-8 border-[3px]',
    lg: 'w-12 h-12 border-4',
  };

  const colorClasses = {
    primary: 'border-primary/20 border-t-primary',
    secondary: 'border-secondary/20 border-t-secondary',
    accent: 'border-accent/20 border-t-accent',
    white: 'border-white/20 border-t-white',
  };

  return (
    <div
      className={cn(
        'rounded-full animate-spin',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
    />
  );
};

// Pulsing dots loader
export const DotsLoader: React.FC<{
  color?: 'primary' | 'secondary' | 'accent' | 'white';
  className?: string;
}> = ({ color = 'primary', className }) => {
  const colorClasses = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    accent: 'bg-accent',
    white: 'bg-white',
  };

  return (
    <div className={cn('flex space-x-2 justify-center items-center', className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'w-2 h-2 rounded-full',
            colorClasses[color],
            'animate-pulse'
          )}
          style={{
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </div>
  );
};

// Gradient progress bar
export const GradientProgressBar: React.FC<{
  progress: number;
  className?: string;
}> = ({ progress, className }) => {
  return (
    <div className={cn('h-2 w-full bg-gray-800 rounded overflow-hidden', className)}>
      <div
        className="h-full bg-gradient-to-r from-primary to-accent"
        style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
      />
    </div>
  );
};

// Content card skeleton
export const CardSkeleton: React.FC<{
  className?: string;
}> = ({ className }) => {
  return (
    <div className={cn('rounded-lg overflow-hidden bg-card animate-pulse', className)}>
      <div className="aspect-[2/3] bg-gray-800" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-gray-800 rounded w-2/3" />
        <div className="h-3 bg-gray-800 rounded w-1/2" />
      </div>
    </div>
  );
};

// Grid of card skeletons
export const CardsGridSkeleton: React.FC<{
  count?: number;
  className?: string;
}> = ({ count = 6, className }) => {
  return (
    <div className={cn('grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4', className)}>
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <CardSkeleton key={i} />
        ))}
    </div>
  );
};

// Text content skeleton with multiple lines
export const TextSkeleton: React.FC<{
  lines?: number;
  className?: string;
}> = ({ lines = 3, className }) => {
  return (
    <div className={cn('space-y-2', className)}>
      {Array(lines)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className={`h-4 bg-gray-800 rounded animate-pulse ${
              i === lines - 1 ? 'w-2/3' : 'w-full'
            }`}
          />
        ))}
    </div>
  );
};
