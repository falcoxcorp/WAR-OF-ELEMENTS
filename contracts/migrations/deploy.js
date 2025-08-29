/**
 * BSC Deployment Script for Rock Paper Scissors Arena
 * 
 * DEPLOYMENT INSTRUCTIONS:
 * 1. Install dependencies: npm install @openzeppelin/contracts
 * 2. Configure BSC network in truffle-config.js or hardhat.config.js
 * 3. Set up BSC wallet with BNB for gas fees
 * 4. Deploy to BSC testnet first, then mainnet
 */

const RockPaperScissors = artifacts.require("RockPaperScissors");

module.exports = async function(deployer, network, accounts) {
  console.log(`🚀 Deploying to ${network} network...`);
  
  // BSC-specific configuration
  const networkConfig = {
    'bsc': {
      chainId: 56,
      name: 'BSC Mainnet',
      feeWallet: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', // Update with your fee wallet
      gasPrice: '5000000000', // 5 gwei (BSC standard)
      gasLimit: '8000000'
    },
    'bsc-testnet': {
      chainId: 97,
      name: 'BSC Testnet',
      feeWallet: accounts[0], // Use deployer as fee wallet for testing
      gasPrice: '10000000000', // 10 gwei for testnet
      gasLimit: '8000000'
    },
    'development': {
      chainId: 1337,
      name: 'Local Development',
      feeWallet: accounts[0],
      gasPrice: '20000000000',
      gasLimit: '8000000'
    }
  };
  
  const config = networkConfig[network] || networkConfig['development'];
  
  console.log(`📋 Network: ${config.name} (Chain ID: ${config.chainId})`);
  console.log(`💰 Fee Wallet: ${config.feeWallet}`);
  console.log(`⛽ Gas Price: ${config.gasPrice} wei`);
  
  try {
    // Deploy the contract
    await deployer.deploy(
      RockPaperScissors, 
      config.feeWallet,
      {
        gas: config.gasLimit,
        gasPrice: config.gasPrice
      }
    );
    
    const instance = await RockPaperScissors.deployed();
    
    console.log(`✅ Contract deployed successfully!`);
    console.log(`📝 Contract Address: ${instance.address}`);
    console.log(`🔗 BSC Explorer: https://${network.includes('testnet') ? 'testnet.' : ''}bscscan.com/address/${instance.address}`);
    
    // Verify deployment
    const owner = await instance.owner();
    const feeWallet = await instance.feeWallet();
    const feePercentage = await instance.feePercentage();
    
    console.log(`👑 Owner: ${owner}`);
    console.log(`💼 Fee Wallet: ${feeWallet}`);
    console.log(`💸 Fee Percentage: ${feePercentage}%`);
    
    // BSC-specific post-deployment setup
    if (network === 'bsc' || network === 'bsc-testnet') {
      console.log(`\n🔧 Post-deployment setup for BSC:`);
      console.log(`1. Verify contract on BSCScan: https://${network.includes('testnet') ? 'testnet.' : ''}bscscan.com/verifyContract`);
      console.log(`2. Update frontend CONTRACT_ADDRESS to: ${instance.address}`);
      console.log(`3. Update API server CONTRACT_ADDRESS to: ${instance.address}`);
      console.log(`4. Test with small BNB amounts first`);
      console.log(`5. Monitor gas usage and optimize if needed`);
    }
    
  } catch (error) {
    console.error(`❌ Deployment failed:`, error);
    throw error;
  }
};