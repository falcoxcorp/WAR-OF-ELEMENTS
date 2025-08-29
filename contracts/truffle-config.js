/**
 * Truffle Configuration for BSC Deployment
 * 
 * SETUP INSTRUCTIONS:
 * 1. npm install @truffle/hdwallet-provider
 * 2. Create .env file with MNEMONIC and BSC_API_KEY
 * 3. Get BNB for gas fees on target network
 * 4. Run: truffle migrate --network bsc-testnet (for testing)
 * 5. Run: truffle migrate --network bsc (for mainnet)
 */

const HDWalletProvider = require('@truffle/hdwallet-provider');
require('dotenv').config();

module.exports = {
  networks: {
    // Local development
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
      gas: 8000000,
      gasPrice: 20000000000 // 20 gwei
    },
    
    // BSC Testnet
    'bsc-testnet': {
      provider: () => new HDWalletProvider(
        process.env.MNEMONIC,
        'https://data-seed-prebsc-1-s1.binance.org:8545'
      ),
      network_id: 97,
      gas: 8000000,
      gasPrice: 10000000000, // 10 gwei
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
      chainId: 97
    },
    
    // BSC Mainnet
    bsc: {
      provider: () => new HDWalletProvider(
        process.env.MNEMONIC,
        'https://bsc-dataseed1.binance.org'
      ),
      network_id: 56,
      gas: 8000000,
      gasPrice: 5000000000, // 5 gwei
      confirmations: 3,
      timeoutBlocks: 200,
      skipDryRun: false, // Enable dry run for mainnet
      chainId: 56
    }
  },
  
  // Compiler configuration optimized for BSC
  compilers: {
    solc: {
      version: "0.8.19",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200 // Optimized for BSC gas costs
        },
        evmVersion: "london" // BSC compatible EVM version
      }
    }
  },
  
  // BSC contract verification
  plugins: [
    'truffle-plugin-verify'
  ],
  
  api_keys: {
    bscscan: process.env.BSC_API_KEY
  },
  
  // Mocha testing configuration
  mocha: {
    timeout: 100000
  }
};