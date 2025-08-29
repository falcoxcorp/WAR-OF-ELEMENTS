import React, { useState, useEffect, useRef } from 'react';
import { Shield, Zap, Crown, Star, Hexagon } from 'lucide-react';

interface AnimatedAppIconProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'pulse' | 'glow' | 'rotate' | 'particles' | 'gaming' | 'premium';
  trigger?: 'hover' | 'click' | 'auto' | 'focus';
  intensity?: 'low' | 'medium' | 'high';
  className?: string;
  onClick?: () => void;
}

const AnimatedAppIcon: React.FC<AnimatedAppIconProps> = ({
  size = 'md',
  variant = 'gaming',
  trigger = 'auto',
  intensity = 'medium',
  className = '',
  onClick
}) => {
  const [isActive, setIsActive] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const iconRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  // Size configurations
  const sizeConfig = {
    sm: { container: 'w-12 h-12', icon: 'w-6 h-6', text: 'text-xs' },
    md: { container: 'w-16 h-16', icon: 'w-8 h-8', text: 'text-sm' },
    lg: { container: 'w-20 h-20', icon: 'w-10 h-10', text: 'text-base' },
    xl: { container: 'w-24 h-24', icon: 'w-12 h-12', text: 'text-lg' }
  };

  // Animation intensity configurations
  const intensityConfig = {
    low: { duration: '4s', scale: '1.05', blur: '2px', opacity: '0.6' },
    medium: { duration: '3s', scale: '1.1', blur: '4px', opacity: '0.8' },
    high: { duration: '2s', scale: '1.15', blur: '6px', opacity: '1.0' }
  };

  const config = sizeConfig[size];
  const animConfig = intensityConfig[intensity];

  // Auto-trigger animation
  useEffect(() => {
    if (trigger === 'auto') {
      const interval = setInterval(() => {
        setIsActive(true);
        setTimeout(() => setIsActive(false), 3000);
      }, 6000);
      
      return () => clearInterval(interval);
    }
  }, [trigger]);

  // Performance-optimized particle animation
  useEffect(() => {
    if (variant === 'particles' && isActive && iconRef.current) {
      const container = iconRef.current;
      const particles: HTMLElement[] = [];
      
      // Create lightweight particles
      for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.className = 'absolute w-1 h-1 bg-blue-400 rounded-full pointer-events-none';
        particle.style.cssText = `
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          animation: particle-float-${i} 2s ease-out forwards;
        `;
        
        container.appendChild(particle);
        particles.push(particle);
        
        // Remove particle after animation
        setTimeout(() => {
          if (container.contains(particle)) {
            container.removeChild(particle);
          }
        }, 2000);
      }
      
      return () => {
        particles.forEach(particle => {
          if (container.contains(particle)) {
            container.removeChild(particle);
          }
        });
      };
    }
  }, [variant, isActive]);

  const handleInteraction = () => {
    if (trigger === 'click' || trigger === 'hover') {
      setIsActive(true);
      setTimeout(() => setIsActive(false), 3000);
    }
    onClick?.();
  };

  const getVariantClasses = () => {
    const baseClasses = `
      relative overflow-hidden rounded-2xl transition-all duration-300 cursor-pointer
      bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50
      hover:border-slate-600/50 active:scale-95
    `;

    switch (variant) {
      case 'pulse':
        return `${baseClasses} ${isActive ? 'animate-pulse scale-110' : ''}`;
      
      case 'glow':
        return `${baseClasses} ${isActive ? 'shadow-2xl shadow-blue-500/50 scale-105' : ''}`;
      
      case 'rotate':
        return `${baseClasses} ${isActive ? 'animate-spin' : ''}`;
      
      case 'particles':
        return `${baseClasses} ${isActive ? 'scale-110' : ''}`;
      
      case 'gaming':
        return `${baseClasses} ${isActive ? 'animate-bounce scale-110 shadow-xl shadow-purple-500/30' : ''}`;
      
      case 'premium':
        return `${baseClasses} ${isActive ? 'scale-105 shadow-2xl shadow-emerald-500/40' : ''}`;
      
      default:
        return baseClasses;
    }
  };

  return (
    <>
      {/* CSS Animations for particles */}
      <style>{`
        @keyframes particle-float-0 { to { transform: translate(-50%, -150%) scale(0); opacity: 0; } }
        @keyframes particle-float-1 { to { transform: translate(-25%, -125%) scale(0); opacity: 0; } }
        @keyframes particle-float-2 { to { transform: translate(25%, -125%) scale(0); opacity: 0; } }
        @keyframes particle-float-3 { to { transform: translate(50%, -150%) scale(0); opacity: 0; } }
        @keyframes particle-float-4 { to { transform: translate(75%, -100%) scale(0); opacity: 0; } }
        @keyframes particle-float-5 { to { transform: translate(-75%, -100%) scale(0); opacity: 0; } }
        @keyframes particle-float-6 { to { transform: translate(0%, -175%) scale(0); opacity: 0; } }
        @keyframes particle-float-7 { to { transform: translate(-100%, -125%) scale(0); opacity: 0; } }
      `}</style>

      <div
        ref={iconRef}
        className={`${config.container} ${getVariantClasses()} ${className}`}
        onClick={handleInteraction}
        onMouseEnter={() => {
          setIsHovered(true);
          if (trigger === 'hover') handleInteraction();
        }}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => trigger === 'focus' && handleInteraction()}
        style={{
          transform: isActive ? `scale(${animConfig.scale})` : 'scale(1)',
          transition: `all ${animConfig.duration} cubic-bezier(0.4, 0, 0.2, 1)`,
          willChange: 'transform, box-shadow'
        }}
      >
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-cyan-600/20 rounded-2xl"></div>
        
        {/* Animated Background Layers */}
        {isActive && variant === 'glow' && (
          <div 
            className="absolute inset-0 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-cyan-500/30 rounded-2xl animate-pulse"
            style={{ animationDuration: animConfig.duration }}
          ></div>
        )}

        {/* Shimmer Effect */}
        {(isActive || isHovered) && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shimmer"></div>
        )}

        {/* Main Icon */}
        <div className="relative z-10 flex items-center justify-center h-full">
          <img 
            src="https://photos.pinksale.finance/file/pinksale-logo-upload/1756454447056-1fba9df7cd0639fc2d1b4bfcbc37a6bb.png"
            alt="OMDB Arena"
            className={`${config.icon} rounded-xl shadow-lg transition-all duration-300 ${
              isActive ? 'brightness-110 contrast-110' : ''
            }`}
            style={{
              filter: isActive ? `blur(0px) brightness(1.1)` : 'blur(0px)',
              transform: variant === 'rotate' && isActive ? 'rotate(360deg)' : 'rotate(0deg)',
              transition: `all ${animConfig.duration} ease-out`
            }}
          />
          
          {/* Gaming Elements Overlay */}
          {variant === 'gaming' && isActive && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="absolute animate-ping">
                <Hexagon className={`${config.icon} text-blue-400 opacity-75`} />
              </div>
              <div className="absolute animate-pulse" style={{ animationDelay: '0.5s' }}>
                <Star className="w-4 h-4 text-yellow-400" />
              </div>
            </div>
          )}

          {/* Premium Elements */}
          {variant === 'premium' && isActive && (
            <div className="absolute -top-1 -right-1">
              <Crown className="w-4 h-4 text-yellow-400 animate-bounce" />
            </div>
          )}
        </div>

        {/* Status Indicator */}
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900 animate-pulse"></div>
        
        {/* Performance Optimized Glow Ring */}
        {isActive && variant === 'glow' && (
          <div 
            className="absolute inset-0 rounded-2xl"
            style={{
              boxShadow: `0 0 20px rgba(59, 130, 246, ${animConfig.opacity}), 0 0 40px rgba(139, 92, 246, ${parseFloat(animConfig.opacity) * 0.7})`,
              animation: `glow-pulse ${animConfig.duration} ease-in-out infinite`
            }}
          ></div>
        )}
      </div>
    </>
  );
};

export default AnimatedAppIcon;