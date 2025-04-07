
import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

// Parallax effect component
export const Parallax: React.FC<{
  children: React.ReactNode;
  speed?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
}> = ({ children, speed = 0.1, direction = 'up', className }) => {
  const [offset, setOffset] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const elementTop = rect.top + scrollTop;
      const relativeScroll = scrollTop - elementTop;
      setOffset(relativeScroll * speed);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initialize position
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  const getTransform = () => {
    switch (direction) {
      case 'up':
        return `translateY(${-offset}px)`;
      case 'down':
        return `translateY(${offset}px)`;
      case 'left':
        return `translateX(${-offset}px)`;
      case 'right':
        return `translateX(${offset}px)`;
      default:
        return `translateY(${-offset}px)`;
    }
  };

  return (
    <div ref={ref} className={cn('will-change-transform', className)} style={{ transform: getTransform() }}>
      {children}
    </div>
  );
};

// Gradient text component
export const GradientText: React.FC<{
  children: React.ReactNode;
  colors?: string;
  className?: string;
}> = ({ children, colors = 'from-primary via-accent to-secondary', className }) => {
  return (
    <span
      className={cn(
        'bg-gradient-to-r bg-clip-text text-transparent',
        colors,
        className
      )}
    >
      {children}
    </span>
  );
};

// Animated background gradient
export const AnimatedGradient: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 animate-gradient-x z-0" />
      <div className="relative z-10">{children}</div>
    </div>
  );
};

// Glass card component
export const GlassCard: React.FC<{
  children: React.ReactNode;
  intensity?: 'low' | 'medium' | 'high';
  className?: string;
}> = ({ children, intensity = 'medium', className }) => {
  const intensityClasses = {
    low: 'bg-white/5 backdrop-blur-sm border-white/5',
    medium: 'bg-white/10 backdrop-blur-md border-white/10',
    high: 'bg-white/15 backdrop-blur-lg border-white/15',
  };

  return (
    <div
      className={cn(
        'rounded-xl border shadow-lg',
        intensityClasses[intensity],
        className
      )}
    >
      {children}
    </div>
  );
};

// Glow highlight
export const Glow: React.FC<{
  children: React.ReactNode;
  color?: string;
  intensity?: 'low' | 'medium' | 'high';
  className?: string;
}> = ({ children, color = 'primary', intensity = 'medium', className }) => {
  const colorClasses = {
    primary: 'shadow-primary',
    secondary: 'shadow-secondary',
    accent: 'shadow-accent',
    white: 'shadow-white',
  };

  const intensityClasses = {
    low: '/30',
    medium: '/50',
    high: '/70',
  };

  const colorClass = (colorClasses[color as keyof typeof colorClasses] || colorClasses.primary) + intensityClasses[intensity];

  return (
    <div className={cn('transition-all duration-300', className)}>
      <div className={cn('shadow-lg', colorClass)}>{children}</div>
    </div>
  );
};
