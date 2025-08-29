/**
 * Hardhat Deployment Script for BSC
 * 
 * Usage:
 * npx hardhat run scripts/deploy.js --network bscTestnet
 * npx hardhat run scripts/deploy.js --network bscMainnet
 */

const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting BSC deployment...");
  
  // Get network info
  const network = hre.network.name;
  const chainId = hre.network.config.chainId;
  
  console.log(`📋 Network: ${network} (Chain ID: ${chainId})`);
  
  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  const deployerBalance = await deployer.getBalance();
  
  console.log(`👤 Deployer: ${deployerAddress}`);
  console.log(`💰 Balance: ${hre.ethers.utils.formatEther(deployerBalance)} BNB`);
  
  // Check minimum balance for deployment
  const minBalance = hre.ethers.utils.parseEther("0.1"); // 0.1 BNB minimum
  if (deployerBalance.lt(minBalance)) {
    throw new Error(`❌ Insufficient BNB balance. Need at least 0.1 BNB for deployment.`);
  }
  
  // Set fee wallet (use deployer for testnet, specific address for mainnet)
  let feeWallet;
  if (network === 'bscTestnet') {
    feeWallet = deployerAddress; // Use deployer for testnet
  } else {
    feeWallet = "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"; // Update with your mainnet fee wallet
  }
  
  console.log(`💼 Fee Wallet: ${feeWallet}`);
  
  // Deploy contract
  console.log("📦 Deploying RockPaperScissors contract...");
  
  const RockPaperScissors = await hre.ethers.getContractFactory("RockPaperScissors");
  const contract = await RockPaperScissors.deploy(feeWallet, {
    gasLimit: 8000000,
    gasPrice: network === 'bscTestnet' ? 
      hre.ethers.utils.parseUnits('10', 'gwei') : 
      hre.ethers.utils.parseUnits('5', 'gwei')
  });
  
  await contract.deployed();
  
  console.log(`✅ Contract deployed to: ${contract.address}`);
  console.log(`🔗 BSCScan: https://${network === 'bscTestnet' ? 'testnet.' : ''}bscscan.com/address/${contract.address}`);
  
  // Verify deployment
  console.log("🔍 Verifying deployment...");
  
  const owner = await contract.owner();
  const feeWalletFromContract = await contract.feeWallet();
  const feePercentage = await contract.feePercentage();
  
  console.log(`👑 Owner: ${owner}`);
  console.log(`💼 Fee Wallet: ${feeWalletFromContract}`);
  console.log(`💸 Fee Percentage: ${feePercentage}%`);
  
  // Save deployment info
  const deploymentInfo = {
    network: network,
    chainId: chainId,
    contractAddress: contract.address,
    owner: owner,
    feeWallet: feeWalletFromContract,
    feePercentage: feePercentage.toString(),
    deployedAt: new Date().toISOString(),
    deployer: deployerAddress,
    txHash: contract.deployTransaction.hash,
    gasUsed: contract.deployTransaction.gasLimit?.toString(),
    gasPrice: contract.deployTransaction.gasPrice?.toString()
  };
  
  // Write deployment info to file
  const fs = require('fs');
  const path = require('path');
  
  const deploymentDir = path.join(__dirname, '../deployments');
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }
  
  const deploymentFile = path.join(deploymentDir, `${network}-deployment.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  
  console.log(`📄 Deployment info saved to: ${deploymentFile}`);
  
  // Post-deployment instructions
  console.log(`\n🔧 Next Steps:`);
  console.log(`1. Update frontend CONTRACT_ADDRESS to: ${contract.address}`);
  console.log(`2. Update API server CONTRACT_ADDRESS to: ${contract.address}`);
  console.log(`3. Verify contract on BSCScan:`);
  console.log(`   npx hardhat verify --network ${network} ${contract.address} "${feeWallet}"`);
  console.log(`4. Test with small BNB amounts first`);
  console.log(`5. Monitor gas usage and optimize if needed`);
  
  if (network === 'bscMainnet') {
    console.log(`\n⚠️  MAINNET DEPLOYMENT CHECKLIST:`);
    console.log(`✓ Contract verified on BSCScan`);
    console.log(`✓ Fee wallet is secure and accessible`);
    console.log(`✓ Tested thoroughly on testnet`);
    console.log(`✓ Frontend updated with new contract address`);
    console.log(`✓ API server updated with new contract address`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });