import { useState, useEffect } from 'react';

interface CorePriceData {
  price: number;
  priceChange24h: number;
  volume24h: number;
  marketCap: number;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

const DEXSCREENER_API = 'https://api.dexscreener.com/latest/dex/tokens/0x40375C92d9FAf44d2f9db9Bd9ba41a3317a2404f';
const FALLBACK_PRICE = 0.6415;
const FALLBACK_CHANGE = -2.67;
const UPDATE_INTERVAL = 30000; // 30 seconds
const RETRY_DELAY = 5000; // 5 seconds on error
const FETCH_TIMEOUT = 10000; // 10 seconds timeout

export const useCorePrice = (): CorePriceData => {
  const [priceData, setPriceData] = useState<CorePriceData>({
    price: FALLBACK_PRICE,
    priceChange24h: FALLBACK_CHANGE,
    volume24h: 0,
    marketCap: 0,
    isLoading: true,
    error: null,
    lastUpdated: null
  });

  const fetchCorePrice = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    try {
      setPriceData(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch(DEXSCREENER_API, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; CorePriceTracker/1.0)',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // DexScreener returns an array of pairs, we want the first one (most liquid)
      if (data.pairs && data.pairs.length > 0) {
        const pair = data.pairs[0];
        
        const price = parseFloat(pair.priceUsd) || FALLBACK_PRICE;
        const priceChange24h = parseFloat(pair.priceChange?.h24) || FALLBACK_CHANGE;
        const volume24h = parseFloat(pair.volume?.h24) || 0;
        const marketCap = parseFloat(pair.marketCap) || 0;

        setPriceData({
          price,
          priceChange24h,
          volume24h,
          marketCap,
          isLoading: false,
          error: null,
          lastUpdated: new Date()
        });

        console.log('✅ CORE price updated:', {
          price: `$${price.toFixed(4)}`,
          change: `${priceChange24h > 0 ? '+' : ''}${priceChange24h.toFixed(2)}%`,
          volume: `$${(volume24h / 1000000).toFixed(2)}M`,
          marketCap: `$${(marketCap / 1000000).toFixed(2)}M`
        });
      } else {
        throw new Error('No trading pairs found for CORE token');
      }
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      let errorMessage = 'Failed to fetch price data';
      
      if (error.name === 'AbortError') {
        errorMessage = 'Request timed out - API is taking too long to respond';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      console.error('❌ Error fetching CORE price:', errorMessage);
      
      // Only update error state, keep previous price data
      setPriceData(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      
      // If this is the first fetch and we have an error, use fallback data
      if (priceData.lastUpdated === null) {
        setPriceData(prev => ({
          ...prev,
          price: FALLBACK_PRICE,
          priceChange24h: FALLBACK_CHANGE,
          lastUpdated: new Date(),
          error: 'Using fallback data - ' + errorMessage
        }));
      }
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchCorePrice();

    // Set up interval for regular updates
    const interval = setInterval(() => {
      fetchCorePrice();
    }, UPDATE_INTERVAL);

    // Set up retry mechanism for failed requests
    const retryInterval = setInterval(() => {
      if (priceData.error && !priceData.isLoading) {
        console.log('🔄 Retrying CORE price fetch due to previous error...');
        fetchCorePrice();
      }
    }, RETRY_DELAY);

    return () => {
      clearInterval(interval);
      clearInterval(retryInterval);
    };
  }, []);

  // Manual refresh function
  const refresh = () => {
    fetchCorePrice();
  };

  return {
    ...priceData,
    refresh
  } as CorePriceData & { refresh: () => void };
};