// Enhanced RPC Manager for BSC Network Stability
// Manages multiple RPC endpoints with automatic failover and health monitoring

interface RPCEndpoint {
  url: string;
  name: string;
  priority: number;
  isHealthy: boolean;
  lastError?: string;
  lastErrorTime?: number;
  responseTime?: number;
  successCount: number;
  errorCount: number;
}

interface RPCResponse<T> {
  data: T;
  endpoint: string;
  responseTime: number;
}

class BSCRPCManager {
  private endpoints: RPCEndpoint[] = [
    { url: 'https://bsc-dataseed1.binance.org', name: 'Binance 1', priority: 1, isHealthy: true, successCount: 0, errorCount: 0 },
    { url: 'https://bsc-dataseed2.binance.org', name: 'Binance 2', priority: 2, isHealthy: true, successCount: 0, errorCount: 0 },
    { url: 'https://bsc-dataseed3.binance.org', name: 'Binance 3', priority: 3, isHealthy: true, successCount: 0, errorCount: 0 },
    { url: 'https://rpc.ankr.com/bsc', name: 'Ankr', priority: 4, isHealthy: true, successCount: 0, errorCount: 0 },
    { url: 'https://bsc.nodereal.io', name: 'NodeReal', priority: 5, isHealthy: true, successCount: 0, errorCount: 0 },
    { url: 'https://bsc-mainnet.nodereal.io/v1/64a9df0874fb4a93b9d0a3849de012d3', name: 'NodeReal Pro', priority: 6, isHealthy: true, successCount: 0, errorCount: 0 }
  ];

  private currentEndpointIndex = 0;
  private healthCheckInterval?: NodeJS.Timeout;
  private readonly HEALTH_CHECK_INTERVAL = 60000; // 1 minute
  private readonly ERROR_THRESHOLD = 3;
  private readonly RECOVERY_TIME = 300000; // 5 minutes

  constructor() {
    this.startHealthMonitoring();
  }

  // Get the best available endpoint
  private getBestEndpoint(): RPCEndpoint {
    // Filter healthy endpoints
    const healthyEndpoints = this.endpoints.filter(ep => ep.isHealthy);
    
    if (healthyEndpoints.length === 0) {
      // If no healthy endpoints, try the one with least recent errors
      console.warn('⚠️ No healthy RPC endpoints, using least problematic one');
      return this.endpoints.reduce((best, current) => 
        (current.errorCount < best.errorCount) ? current : best
      );
    }

    // Sort by priority and success rate
    return healthyEndpoints.sort((a, b) => {
      const aSuccessRate = a.successCount / Math.max(1, a.successCount + a.errorCount);
      const bSuccessRate = b.successCount / Math.max(1, b.successCount + b.errorCount);
      
      if (Math.abs(aSuccessRate - bSuccessRate) < 0.1) {
        return a.priority - b.priority; // Use priority if success rates are similar
      }
      
      return bSuccessRate - aSuccessRate; // Higher success rate first
    })[0];
  }

  // Enhanced request with automatic failover
  async makeRequest<T>(
    operation: (web3: any) => Promise<T>,
    operationName: string = 'RPC Request',
    maxRetries: number = 3
  ): Promise<RPCResponse<T>> {
    let lastError: Error;
    const attemptedEndpoints = new Set<string>();

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const endpoint = this.getBestEndpoint();
      
      // Skip if we've already tried this endpoint in this request
      if (attemptedEndpoints.has(endpoint.url) && attemptedEndpoints.size < this.endpoints.length) {
        // Mark as unhealthy temporarily and try next
        endpoint.isHealthy = false;
        continue;
      }
      
      attemptedEndpoints.add(endpoint.url);

      try {
        console.log(`🔄 ${operationName} - Attempt ${attempt} using ${endpoint.name}`);
        
        const startTime = Date.now();
        
        // Create Web3 instance for this endpoint
        const Web3 = (await import('web3')).default;
        const web3 = new Web3(endpoint.url);
        
        // Execute operation with timeout
        const result = await Promise.race([
          operation(web3),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('RPC timeout after 12 seconds')), 12000)
          )
        ]);

        const responseTime = Date.now() - startTime;
        
        // Update endpoint health metrics
        endpoint.successCount++;
        endpoint.responseTime = responseTime;
        endpoint.isHealthy = true;
        endpoint.lastError = undefined;
        endpoint.lastErrorTime = undefined;

        console.log(`✅ ${operationName} successful with ${endpoint.name} (${responseTime}ms)`);
        
        return {
          data: result,
          endpoint: endpoint.name,
          responseTime
        };

      } catch (error: any) {
        lastError = error;
        const errorMsg = error.message || error.toString() || '';
        
        console.warn(`⚠️ ${operationName} failed with ${endpoint.name}:`, errorMsg);
        
        // Update endpoint error metrics
        endpoint.errorCount++;
        endpoint.lastError = errorMsg;
        endpoint.lastErrorTime = Date.now();
        
        // Mark as unhealthy if too many errors
        if (endpoint.errorCount >= this.ERROR_THRESHOLD) {
          endpoint.isHealthy = false;
          console.log(`❌ Marking ${endpoint.name} as unhealthy (${endpoint.errorCount} errors)`);
        }

        // Don't retry certain errors
        if (errorMsg.includes('User rejected') || 
            errorMsg.includes('User denied') ||
            error.code === 4001) {
          throw error;
        }

        // If this was our last attempt or we've tried all endpoints
        if (attempt === maxRetries || attemptedEndpoints.size >= this.endpoints.length) {
          console.error(`❌ ${operationName} failed on all available endpoints`);
          throw lastError;
        }

        // Wait before trying next endpoint
        const delay = 1000 + (attempt * 500) + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  // Health monitoring
  private startHealthMonitoring() {
    this.healthCheckInterval = setInterval(() => {
      this.checkEndpointHealth();
    }, this.HEALTH_CHECK_INTERVAL);
  }

  private async checkEndpointHealth() {
    console.log('🏥 Running RPC health check...');
    
    for (const endpoint of this.endpoints) {
      // Auto-recover endpoints after recovery time
      if (!endpoint.isHealthy && 
          endpoint.lastErrorTime && 
          Date.now() - endpoint.lastErrorTime > this.RECOVERY_TIME) {
        
        console.log(`🔄 Attempting to recover ${endpoint.name}...`);
        
        try {
          const Web3 = (await import('web3')).default;
          const web3 = new Web3(endpoint.url);
          
          // Simple health check
          await Promise.race([
            web3.eth.getBlockNumber(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Health check timeout')), 5000)
            )
          ]);
          
          endpoint.isHealthy = true;
          endpoint.errorCount = Math.max(0, endpoint.errorCount - 1); // Reduce error count
          console.log(`✅ ${endpoint.name} recovered and marked as healthy`);
          
        } catch (error) {
          console.log(`❌ ${endpoint.name} still unhealthy:`, error.message);
        }
      }
    }
  }

  // Get current status
  getStatus() {
    const healthyCount = this.endpoints.filter(ep => ep.isHealthy).length;
    const totalCount = this.endpoints.length;
    
    return {
      healthyEndpoints: healthyCount,
      totalEndpoints: totalCount,
      healthPercentage: Math.round((healthyCount / totalCount) * 100),
      endpoints: this.endpoints.map(ep => ({
        name: ep.name,
        isHealthy: ep.isHealthy,
        responseTime: ep.responseTime,
        successRate: ep.successCount / Math.max(1, ep.successCount + ep.errorCount)
      }))
    };
  }

  // Cleanup
  destroy() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
  }
}

// Singleton instance
export const bscRPCManager = new BSCRPCManager();

// Utility functions for easy use
export const makeRPCRequest = async <T>(
  operation: (web3: any) => Promise<T>,
  operationName?: string
): Promise<T> => {
  const response = await bscRPCManager.makeRequest(operation, operationName);
  return response.data;
};

export const getRPCStatus = () => {
  return bscRPCManager.getStatus();
};

// Enhanced Web3 factory with automatic endpoint selection
export const createOptimizedWeb3 = async (): Promise<any> => {
  const Web3 = (await import('web3')).default;
  
  // Try to get the best endpoint
  try {
    const response = await bscRPCManager.makeRequest(
      async (web3) => {
        // Test the connection
        await web3.eth.getBlockNumber();
        return web3;
      },
      'Web3 Instance Creation'
    );
    
    console.log(`✅ Created Web3 instance using ${response.endpoint}`);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to create optimized Web3 instance:', error);
    
    // Fallback to window.ethereum if available
    if (window.ethereum) {
      console.log('🔄 Falling back to MetaMask provider...');
      return new Web3(window.ethereum);
    }
    
    throw new Error('No available RPC endpoints and no MetaMask provider');
  }
};