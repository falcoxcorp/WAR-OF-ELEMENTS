import React from 'react';
import { PlayerLevel } from '../utils/levelSystem';

interface LevelBadgeProps {
  level: PlayerLevel;
  score: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showProgress?: boolean;
  animated?: boolean;
}

const LevelBadge: React.FC<LevelBadgeProps> = ({ 
  level, 
  score, 
  size = 'md', 
  showProgress = false,
  animated = false 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-16 h-16 text-lg'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  const progress = showProgress && level.maxScore !== 9999 
    ? Math.min(100, ((score - level.minScore) / (level.maxScore - level.minScore)) * 100)
    : 0;

  return (
    <div className="relative">
      <div 
        className={`
          ${sizeClasses[size]} 
          bg-gradient-to-br ${level.gradient} 
          rounded-lg sm:rounded-xl flex items-center justify-center 
          border-2 border-white/20 shadow-lg
          ${animated ? 'animate-pulse' : ''}
          relative overflow-hidden
        `}
      >
        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shimmer"></div>
        
        {/* Level icon */}
        <span className={`${textSizes[size]} font-bold text-white z-10`}>
          {level.icon}
        </span>
        
        {/* Level number overlay */}
        <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-slate-900 rounded-full flex items-center justify-center border border-white/30">
          <span className="text-xxs sm:text-xs font-bold text-white">{level.level}</span>
        </div>
      </div>
      
      {/* Progress bar */}
      {showProgress && level.maxScore !== 9999 && (
        <div className="mt-1 sm:mt-2 w-full bg-slate-700 rounded-full h-1.5 sm:h-2 overflow-hidden">
          <div 
            className={`h-full bg-gradient-to-r ${level.gradient} transition-all duration-1000 ease-out`}
            style={{ width: `${progress}%` }}
          >
            <div className="h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
          </div>
        </div>
      )}
      
      {/* Level title */}
      <div className="text-center mt-1">
        <span className={`${level.color} font-bold ${textSizes[size]} truncate block`}>
          {level.title}
        </span>
      </div>
    </div>
  );
};

export default LevelBadge;