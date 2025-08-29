# OMDB Arena - BSC Smart Contracts

Rock Paper Scissors Arena smart contracts migrated and optimized for Binance Smart Chain.

## 🚀 Migration Summary

This contract has been **completely migrated** from CORE network to Binance Smart Chain with the following changes:

### ✅ Network Migration Changes
- **Chain ID**: Updated from 1116 (CORE) to 56 (BSC Mainnet) / 97 (BSC Testnet)
- **Native Currency**: Changed from CORE tokens to BNB
- **RPC Endpoints**: Updated to BSC RPC providers
- **Block Explorer**: Changed from Core scan to BSCScan
- **Gas Optimization**: Optimized for BSC gas costs and block times

### ✅ Contract Optimizations
- **Gas Efficiency**: Optimized for BSC's lower gas costs
- **Block Time**: Adjusted timeouts for BSC's 3-second block time
- **BEP-20 Support**: Added recovery functions for BEP-20 tokens
- **Emergency Functions**: BSC-specific emergency controls

### ✅ Removed CORE Dependencies
- ❌ All CORE network references removed
- ❌ CORE-specific gas settings removed
- ❌ CORE RPC endpoints removed
- ❌ CORE explorer links removed
- ✅ Replaced with BSC equivalents

## 📋 Contract Features

### Core Gameplay
- **Commit-Reveal Scheme**: Cryptographically secure move hiding
- **Fair Play**: Impossible to cheat or manipulate outcomes
- **Instant Payouts**: Automatic BNB distribution to winners
- **Timeout Protection**: Claim victory if opponent doesn't reveal

### Economic Model
- **Platform Fee**: 10% of total pot
- **Reward Pool**: 5% goes to monthly leaderboard rewards
- **Referral System**: 2% commission for referrers
- **Winner Takes**: 80% of opponent's bet + their own bet back

### Player Progression
- **8 Level System**: From Rookie to Mythic
- **Monthly Leaderboards**: Top 5 players share reward pool
- **Score System**: Points for playing (+2) and winning (+10)
- **Streak Bonuses**: Multipliers for consecutive wins

## 🛠 Deployment Instructions

### Prerequisites
```bash
# Install dependencies
npm install

# Install Hardhat (recommended for BSC)
npm install --save-dev hardhat @nomiclabs/hardhat-ethers @nomiclabs/hardhat-etherscan

# Or install Truffle
npm install -g truffle
npm install @truffle/hdwallet-provider
```

### Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your values:
# - PRIVATE_KEY: Your wallet private key
# - BSC_API_KEY: Get from https://bscscan.com/apis
# - FEE_WALLET_MAINNET: Your fee collection wallet
```

### Compilation
```bash
# Hardhat
npx hardhat compile

# Truffle
truffle compile
```

### Testing (BSC Testnet)
```bash
# Deploy to BSC Testnet first
npx hardhat run scripts/deploy.js --network bscTestnet

# Verify on BSCScan Testnet
npx hardhat verify --network bscTestnet <CONTRACT_ADDRESS> "<FEE_WALLET_ADDRESS>"
```

### Mainnet Deployment
```bash
# Deploy to BSC Mainnet
npx hardhat run scripts/deploy.js --network bscMainnet

# Verify on BSCScan Mainnet
npx hardhat verify --network bscMainnet <CONTRACT_ADDRESS> "<FEE_WALLET_ADDRESS>"
```

## 🔧 BSC-Specific Configuration

### Gas Settings
- **Testnet**: 10 gwei gas price
- **Mainnet**: 5 gwei gas price
- **Gas Limit**: 8,000,000 (BSC optimized)

### Network Details
```javascript
// BSC Mainnet
{
  chainId: 56,
  rpc: "https://bsc-dataseed1.binance.org",
  explorer: "https://bscscan.com",
  currency: "BNB"
}

// BSC Testnet
{
  chainId: 97,
  rpc: "https://data-seed-prebsc-1-s1.binance.org:8545",
  explorer: "https://testnet.bscscan.com",
  currency: "tBNB"
}
```

### Contract Addresses
- **Testnet**: Will be generated during deployment
- **Mainnet**: Will be generated during deployment

## 🔒 Security Features

### BSC-Optimized Security
- **ReentrancyGuard**: Prevents reentrancy attacks
- **Pausable**: Emergency pause functionality
- **Ownable**: Secure admin controls
- **Input Validation**: Comprehensive parameter checking
- **Gas Optimization**: Efficient for BSC network

### Emergency Functions
- **Emergency Withdraw**: Owner can withdraw in emergencies (when paused)
- **BEP-20 Recovery**: Recover accidentally sent BEP-20 tokens
- **Pause/Unpause**: Stop contract in case of issues

## 📊 Economics

### Fee Structure (BSC Optimized)
- **Total Fee**: 15% of total pot
  - Platform Fee: 10%
  - Reward Pool: 5%
- **Referral Commission**: 2% (if referrer provided)
- **Winner Receives**: 80% of opponent's bet + own bet back

### Monthly Rewards Distribution
- **1st Place**: 40% of reward pool
- **2nd Place**: 30% of reward pool
- **3rd Place**: 15% of reward pool
- **4th Place**: 10% of reward pool
- **5th Place**: 5% of reward pool

### Betting Limits (BSC)
- **Minimum Bet**: 0.001 BNB
- **Maximum Bet**: 1,000 BNB
- **Reveal Timeout**: 24 hours

## 🧪 Testing

### Local Testing
```bash
# Start local BSC fork
npx hardhat node --fork https://bsc-dataseed1.binance.org

# Run tests
npx hardhat test

# Gas reporting
REPORT_GAS=true npx hardhat test
```

### Testnet Testing Checklist
- [ ] Deploy to BSC Testnet
- [ ] Verify contract on testnet BSCScan
- [ ] Test game creation with tBNB
- [ ] Test game joining and completion
- [ ] Test reveal mechanism
- [ ] Test timeout claims
- [ ] Test admin functions
- [ ] Test emergency functions
- [ ] Monitor gas usage

## 📈 Post-Deployment

### Frontend Updates Required
1. Update `CONTRACT_ADDRESS` in `src/contexts/Web3Context.tsx`
2. Update chain ID references from 1116 to 56
3. Update currency references from CORE to BNB
4. Update explorer links to BSCScan
5. Test wallet connection to BSC

### API Updates Required
1. Update `CONTRACT_ADDRESS` in `src/api/server.ts`
2. Update RPC URL to BSC endpoint
3. Update chain ID in responses
4. Test API endpoints with new contract

### Monitoring Setup
1. Set up BSCScan API monitoring
2. Monitor contract balance and reward pool
3. Track gas usage optimization
4. Monitor player activity and game creation

## 🆘 Troubleshooting

### Common BSC Issues
- **Gas Price Too Low**: Increase gas price for faster confirmation
- **Nonce Issues**: Reset MetaMask account if transactions stuck
- **RPC Limits**: Use multiple RPC endpoints for reliability
- **Contract Size**: Use optimizer if contract too large

### Emergency Procedures
1. **Pause Contract**: Call `pause()` if issues detected
2. **Emergency Withdraw**: Use `emergencyWithdraw()` when paused
3. **Update Fee Wallet**: Change fee destination if needed
4. **Transfer Ownership**: Move control to new address if required

## 📞 Support

- **Contract Issues**: Check BSCScan for transaction details
- **Gas Problems**: Use BSC gas tracker for optimal pricing
- **Network Issues**: Try different BSC RPC endpoints
- **Security Concerns**: Contact OMDB security team

---

**✅ Contract is now fully migrated to Binance Smart Chain and ready for deployment!**
</btml:action>