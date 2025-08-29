import React from 'react';
import { useCorePrice } from '../hooks/useCorePrice';
import { TrendingUp, TrendingDown, RefreshCw, AlertCircle, Activity } from 'lucide-react';

interface CorePriceDisplayProps {
  showVolume?: boolean;
  showLastUpdated?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const CorePriceDisplay: React.FC<CorePriceDisplayProps> = ({ 
  showVolume = false, 
  showLastUpdated = false,
  size = 'md',
  className = ''
}) => {
  const { price, priceChange24h, volume24h, isLoading, error, lastUpdated, refresh } = useCorePrice();

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const formatPrice = (price: number) => {
    return price.toFixed(4);
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `$${(volume / 1000000).toFixed(1)}M`;
    } else if (volume >= 1000) {
      return `$${(volume / 1000).toFixed(1)}K`;
    }
    return `$${volume.toFixed(0)}`;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-400';
    if (change < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-3 h-3 flex-shrink-0" />;
    if (change < 0) return <TrendingDown className="w-3 h-3 flex-shrink-0" />;
    return null;
  };

  return (
    <div className={`flex items-center space-x-1 sm:space-x-2 ${sizeClasses[size]} ${className} flex-wrap`}>
      {/* CORE Logo */}
      <img 
        src="https://photos.pinksale.finance/file/pinksale-logo-upload/1754331659815-8a6a69a354540d190c6907808067d1f2.png" 
        alt="CORE" 
        className="w-4 h-4 md:w-5 md:h-5 rounded-full flex-shrink-0"
      />
      
      {/* Price */}
      <div className="flex items-center space-x-1">
        <span className="text-white font-medium whitespace-nowrap">
          ${formatPrice(price)}
        </span>
        
        {/* Loading indicator */}
        {isLoading && (
          <RefreshCw className="w-3 h-3 text-blue-400 animate-spin flex-shrink-0" />
        )}
        
        {/* Error indicator */}
        {error && !isLoading && (
          <button
            onClick={refresh}
            className="text-orange-400 hover:text-orange-300 transition-colors"
            title={`Error: ${error}. Click to retry.`}
          >
            <AlertCircle className="w-3 h-3 flex-shrink-0" />
          </button>
        )}
      </div>
      
      {/* Price Change */}
      <div className={`flex items-center space-x-1 ${getChangeColor(priceChange24h)}`}>
        {getChangeIcon(priceChange24h)}
        <span className="font-medium whitespace-nowrap">
          {formatChange(priceChange24h)}
        </span>
      </div>
      
      {/* Volume (optional) */}
      {showVolume && volume24h > 0 && (
        <>
          <span className="text-gray-400 hidden sm:inline">•</span>
          <div className="flex items-center space-x-1 text-gray-400">
            <Activity className="w-3 h-3 flex-shrink-0" />
            <span className="whitespace-nowrap">{formatVolume(volume24h)}</span>
          </div>
        </>
      )}
      
      {/* Last Updated (optional) */}
      {showLastUpdated && lastUpdated && (
        <>
          <span className="text-gray-400 hidden sm:inline">•</span>
          <span className="text-gray-500 text-xs whitespace-nowrap">
            {lastUpdated.toLocaleTimeString()}
          </span>
        </>
      )}
    </div>
  );
};

export default CorePriceDisplay;