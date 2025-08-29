/**
 * Hardhat Configuration for BSC Deployment
 * Alternative to Truffle for BSC deployment
 * 
 * SETUP INSTRUCTIONS:
 * 1. npm install --save-dev hardhat @nomiclabs/hardhat-ethers @nomiclabs/hardhat-etherscan
 * 2. Create .env file with PRIVATE_KEY and BSC_API_KEY
 * 3. Run: npx hardhat compile
 * 4. Run: npx hardhat run scripts/deploy.js --network bscTestnet
 * 5. Run: npx hardhat verify --network bscTestnet <contract_address> <constructor_args>
 */

require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const BSC_API_KEY = process.env.BSC_API_KEY || "";

module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200 // BSC optimized
      }
    }
  },
  
  networks: {
    // BSC Testnet
    bscTestnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      chainId: 97,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      gas: 8000000,
      gasPrice: 10000000000, // 10 gwei
      timeout: 60000
    },
    
    // BSC Mainnet
    bscMainnet: {
      url: "https://bsc-dataseed1.binance.org",
      chainId: 56,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      gas: 8000000,
      gasPrice: 5000000000, // 5 gwei
      timeout: 60000
    }
  },
  
  // BSCScan verification
  etherscan: {
    apiKey: {
      bsc: BSC_API_KEY,
      bscTestnet: BSC_API_KEY
    }
  },
  
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};