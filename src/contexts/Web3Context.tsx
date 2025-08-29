import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import Web3 from 'web3';
import toast from 'react-hot-toast';

interface Web3ContextType {
  web3: Web3 | null;
  account: string | null;
  contract: any;
  isConnected: boolean;
  connectWallet: () => Promise<void>;
  networkId: number | null;
  balance: string;
  isCorrectNetwork: boolean;
  switchToBSC: () => Promise<void>;
  reconnectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  connectionState: 'idle' | 'connecting' | 'connected' | 'error';
  isLoading: boolean;
  error: string | null;
  retryConnection: () => Promise<void>;
  isMetaMaskInstalled: boolean;
  isMetaMaskLocked: boolean;
  isOwner: boolean; // Added for admin functionality
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

const CONTRACT_ADDRESS = '0x8d1b2dCF2059d324804e5E34fE54EDAba62dadCe'; // BSC deployed contract address
const BSC_CHAIN_ID = 56; // BSC Mainnet
const BSC_TESTNET_CHAIN_ID = 97; // BSC Testnet

// Multiple BSC RPC endpoints for redundancy
const BSC_RPC_ENDPOINTS = [
  'https://bsc-dataseed1.binance.org',
  'https://bsc-dataseed2.binance.org',
  'https://bsc-dataseed3.binance.org',
  'https://bsc-dataseed4.binance.org',
  'https://rpc.ankr.com/bsc'
];

// Updated BSC Network Configuration
const BSC_NETWORK_CONFIG = {
  chainId: '0x38', // 56 in hex (BSC Mainnet)
  chainName: 'Smart Chain',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18,
  },
  rpcUrls: BSC_RPC_ENDPOINTS,
  blockExplorerUrls: ['https://bscscan.com'],
};

const BSC_TESTNET_CONFIG = {
  chainId: '0x61', // 97 in hex (BSC Testnet)
  chainName: 'Binance Smart Chain Testnet',
  nativeCurrency: {
    name: 'tBNB',
    symbol: 'tBNB',
    decimals: 18,
  },
  rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545'],
  blockExplorerUrls: ['https://testnet.bscscan.com'],
};

// ABI COMPLETO DEL CONTRATO
const CONTRACT_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_feeWallet",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "gameId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "creator",
        "type": "address"
      }
    ],
    "name": "GameCanceled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "gameId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "creator",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "betAmount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "moveHash",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "referrer",
        "type": "address"
      }
    ],
    "name": "GameCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "gameId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "opponent",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "enum RockPaperScissors.Move",
        "name": "move",
        "type": "uint8"
      }
    ],
    "name": "GameJoined",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "gameId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "winner",
        "type": "address"
      }
    ],
    "name": "GameCompleted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "player",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "wins",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "losses",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "ties",
        "type": "uint256"
      }
    ],
    "name": "PlayerStatsUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "referrer",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "ReferralEarned",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "RewardPoolIncreased",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address[]",
        "name": "winners",
        "type": "address[]"
      },
      {
        "indexed": false,
        "internalType": "uint256[]",
        "name": "amounts",
        "type": "uint256[]"
      }
    ],
    "name": "RewardsDistributed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "gameId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "creator",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "enum RockPaperScissors.Move",
        "name": "move",
        "type": "uint8"
      }
    ],
    "name": "MoveRevealed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "oldWallet",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newWallet",
        "type": "address"
      }
    ],
    "name": "FeeWalletUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "oldFee",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newFee",
        "type": "uint256"
      }
    ],
    "name": "FeeUpdated",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_gameId",
        "type": "uint256"
      }
    ],
    "name": "cancelGame",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_gameId",
        "type": "uint256"
      }
    ],
    "name": "claimTimeout",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "_moveHash",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "_referrer",
        "type": "address"
      }
    ],
    "name": "createGame",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "distributeRewards",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "feePercentage",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "feeWallet",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "gameCounter",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "games",
    "outputs": [
      {
        "internalType": "address",
        "name": "creator",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "creatorMoveHash",
        "type": "bytes32"
      },
      {
        "internalType": "enum RockPaperScissors.Move",
        "name": "creatorMove",
        "type": "uint8"
      },
      {
        "internalType": "address",
        "name": "opponent",
        "type": "address"
      },
      {
        "internalType": "enum RockPaperScissors.Move",
        "name": "opponentMove",
        "type": "uint8"
      },
      {
        "internalType": "uint256",
        "name": "betAmount",
        "type": "uint256"
      },
      {
        "internalType": "enum RockPaperScissors.GameStatus",
        "name": "status",
        "type": "uint8"
      },
      {
        "internalType": "address",
        "name": "winner",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "createdAt",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "revealDeadline",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "referrer",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getPlayers",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_gameId",
        "type": "uint256"
      }
    ],
    "name": "getGame",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "creator",
            "type": "address"
          },
          {
            "internalType": "bytes32",
            "name": "creatorMoveHash",
            "type": "bytes32"
          },
          {
            "internalType": "enum RockPaperScissors.Move",
            "name": "creatorMove",
            "type": "uint8"
          },
          {
            "internalType": "address",
            "name": "opponent",
            "type": "address"
          },
          {
            "internalType": "enum RockPaperScissors.Move",
            "name": "opponentMove",
            "type": "uint8"
          },
          {
            "internalType": "uint256",
            "name": "betAmount",
            "type": "uint256"
          },
          {
            "internalType": "enum RockPaperScissors.GameStatus",
            "name": "status",
            "type": "uint8"
          },
          {
            "internalType": "address",
            "name": "winner",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "createdAt",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "revealDeadline",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "referrer",
            "type": "address"
          }
        ],
        "internalType": "struct RockPaperScissors.Game",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "player",
        "type": "address"
      }
    ],
    "name": "getPlayerStats",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "wins",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "losses",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "ties",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "gamesPlayed",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "totalWagered",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "totalWon",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "referralEarnings",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "lastPlayed",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "monthlyScore",
            "type": "uint256"
          }
        ],
        "internalType": "struct RockPaperScissors.PlayerStats",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "player",
        "type": "address"
      }
    ],
    "name": "getPlayerWinRate",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "player",
        "type": "address"
      }
    ],
    "name": "getPlayerProfit",
    "outputs": [
      {
        "internalType": "int256",
        "name": "",
        "type": "int256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getRewardPoolInfo",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTopMonthlyPlayers",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "",
        "type": "address[]"
      },
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_gameId",
        "type": "uint256"
      },
      {
        "internalType": "enum RockPaperScissors.Move",
        "name": "_move",
        "type": "uint8"
      }
    ],
    "name": "joinGame",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "isPlayer",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "playerStats",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "wins",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "losses",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "ties",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "gamesPlayed",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "totalWagered",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "totalWon",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "referralEarnings",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "lastPlayed",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "monthlyScore",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "players",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "referralEarnings",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_gameId",
        "type": "uint256"
      },
      {
        "internalType": "enum RockPaperScissors.Move",
        "name": "_move",
        "type": "uint8"
      },
      {
        "internalType": "string",
        "name": "_secret",
        "type": "string"
      }
    ],
    "name": "revealMove",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "rewardPool",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newFeeWallet",
        "type": "address"
      }
    ],
    "name": "setFeeWallet",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalGames",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalPlayers",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "newFee",
        "type": "uint256"
      }
    ],
    "name": "updateFee",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// Connection state management
let isConnecting = false;
let lastConnectionAttempt = 0;
const CONNECTION_COOLDOWN = 3000; // Reduced from 5000 to 3000ms
const MAX_RETRIES = 3;
const BASE_RETRY_DELAY = 1500; // Reduced from 2000 to 1500ms
const CIRCUIT_BREAKER_COOLDOWN = 20000; // Increased from 15000 to 20000ms for better recovery
let circuitBreakerCount = 0; // Track consecutive circuit breaker errors
const MAX_CIRCUIT_BREAKER_ATTEMPTS = 3; // Max attempts before longer cooldown

export const Web3Provider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [contract, setContract] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [networkId, setNetworkId] = useState<number | null>(null);
  const [balance, setBalance] = useState('0');
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [connectionState, setConnectionState] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
  const [isMetaMaskLocked, setIsMetaMaskLocked] = useState(false);
  const [isOwner, setIsOwner] = useState(false); // Added for admin functionality

  // Utility function to wait
  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Check if MetaMask is available and ready
  const checkMetaMaskAvailability = async (): Promise<boolean> => {
    if (!window.ethereum) {
      setIsMetaMaskInstalled(false);
      toast.error('MetaMask no está instalado. Por favor instala MetaMask para continuar.');
      return false;
    }

    setIsMetaMaskInstalled(true);

    // Check if MetaMask is initialized
    try {
      const provider = window.ethereum;
      if (!provider.isMetaMask) {
        toast.error('Por favor usa la billetera MetaMask.');
        return false;
      }

      // Check if MetaMask is locked
      try {
        const accounts = await provider.request({ method: 'eth_accounts' });
        setIsMetaMaskLocked(accounts.length === 0);
      } catch (error: any) {
        if (error.message?.includes('MetaMask is locked')) {
          setIsMetaMaskLocked(true);
          return false;
        }
      }

      // Wait for MetaMask to be ready
      if (provider.isConnected && provider.isConnected()) {
        return true;
      }

      // Give MetaMask time to initialize
      await wait(500);
      return true;
    } catch (error) {
      console.error('MetaMask availability check failed:', error);
      return false;
    }
  };

  // Enhanced circuit breaker detection
  const isCircuitBreakerError = (error: any): boolean => {
    const errorMessage = error.message || error.toString() || '';
    return errorMessage.includes('circuit breaker') || 
           errorMessage.includes('Execution prevented because the circuit breaker is open') ||
           errorMessage.includes('circuit breaker is open');
  };

  // Enhanced retry mechanism for MetaMask requests with better circuit breaker handling
  const retryRequest = async function<T>(
    requestFn: () => Promise<T>,
    maxRetries: number = MAX_RETRIES,
    baseDelay: number = BASE_RETRY_DELAY,
    context: string = 'request'
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Exponential backoff with jitter for subsequent attempts
        if (attempt > 1) {
          const delay = baseDelay * Math.pow(1.5, attempt - 1) + Math.random() * 500;
          console.log(`Retrying ${context} (attempt ${attempt}/${maxRetries}) after ${Math.round(delay)}ms...`);
          await wait(delay);
        }

        const result = await requestFn();
        
        // Reset circuit breaker count on successful request
        if (circuitBreakerCount > 0) {
          circuitBreakerCount = 0;
          console.log('Circuit breaker count reset after successful request');
        }
        
        return result;
      } catch (error: any) {
        lastError = error;
        console.warn(`${context} attempt ${attempt}/${maxRetries} failed:`, error.message);

        // Don't retry if user rejected the request
        if (error.code === 4001 || error.message?.includes('User rejected') || error.message?.includes('User denied')) {
          throw error;
        }

        // Don't retry if MetaMask is locked
        if (error.message?.includes('MetaMask is locked')) {
          setIsMetaMaskLocked(true);
          throw error;
        }

        // Handle circuit breaker errors with progressive backoff
        if (isCircuitBreakerError(error)) {
          circuitBreakerCount++;
          console.log(`Circuit breaker error #${circuitBreakerCount}`);
          
          if (attempt < maxRetries) {
            // Progressive delay based on circuit breaker count
            const progressiveDelay = CIRCUIT_BREAKER_COOLDOWN * Math.min(circuitBreakerCount, 3);
            const jitter = Math.random() * 5000;
            const totalDelay = progressiveDelay + jitter;
            
            console.log(`Circuit breaker detected (count: ${circuitBreakerCount}), waiting ${Math.round(totalDelay)}ms before retry...`);
            await wait(totalDelay);
          }
        }

        // Only retry for specific errors
        const shouldRetry = isCircuitBreakerError(error) || 
                           error.message?.includes('rate limit') ||
                           error.message?.includes('too many requests') ||
                           error.message?.includes('network error') ||
                           error.message?.includes('timeout') ||
                           error.message?.includes('Internal JSON-RPC error');

        if (!shouldRetry || attempt === maxRetries) {
          throw lastError;
        }
      }
    }

    throw lastError!;
  };

  // Enhanced network switching to BSC
  const switchToBSC = async () => {
    if (!window.ethereum) {
      toast.error('¡MetaMask no está instalado!');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Try to switch to BSC network with retry
      await retryRequest(async () => {
        return window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: BSC_NETWORK_CONFIG.chainId }],
        });
      }, 2, 1000, 'network switch');
      
      toast.success('¡Cambiado a Binance Smart Chain exitosamente!');
    } catch (switchError: any) {
      // If the network doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          await retryRequest(async () => {
            return window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [BSC_NETWORK_CONFIG],
            });
          }, 2, 1000, 'network addition');
          
          toast.success('¡Red Binance Smart Chain agregada y cambiada exitosamente!');
        } catch (addError: any) {
          console.error('Error adding BSC network:', addError);
          if (addError.code === 4001) {
            toast.error('Adición de red rechazada por el usuario.');
          } else {
            toast.error('Error al agregar la red BSC. Por favor agrégala manualmente.');
          }
          setError('Failed to add BSC network');
        }
      } else if (switchError.code === 4001) {
        toast.error('Cambio de red rechazado por el usuario');
        setError('Network switch rejected');
      } else {
        console.error('Error switching to BSC network:', switchError);
        toast.error('Error al cambiar a la red Binance Smart Chain');
        setError('Network switch failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced balance fetching with retry
  const updateBalance = async (web3Instance: Web3, accountAddress: string) => {
    try {
      const balance = await retryRequest(async () => {
        return web3Instance.eth.getBalance(accountAddress);
      }, 2, 500, 'balance fetch');
      
      setBalance(web3Instance.utils.fromWei(balance, 'ether'));
    } catch (error) {
      console.error('Error fetching balance:', error);
      setBalance('0');
    }
  };

  // Enhanced Web3 connection setup with owner detection
  const setupWeb3Connection = async (web3Instance: Web3, accounts: string[]) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔗 Setting up Web3 connection...');
      console.log('📍 Account:', accounts[0]);
      console.log('🏗️ Contract Address:', CONTRACT_ADDRESS);
      
      const networkId = await retryRequest(async () => {
        return web3Instance.eth.net.getId();
      }, 5, 3000, 'network ID fetch'); // Increased from 2 to 5 retries with longer delay
      
      console.log('🌐 Detected Network ID:', Number(networkId));
      console.log('✅ Expected BSC Chain ID:', BSC_CHAIN_ID);
      
      setWeb3(web3Instance);
      setAccount(accounts[0]);
      setNetworkId(Number(networkId));
      
      const isBSC = Number(networkId) === BSC_CHAIN_ID || Number(networkId) === BSC_TESTNET_CHAIN_ID;
      console.log('🔍 Is BSC Network?', isBSC);
      setIsCorrectNetwork(isBSC);
      
      if (isBSC) {
        console.log('🚀 Initializing BSC contract...');
        const contractInstance = new web3Instance.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
        setContract(contractInstance);
        setIsConnected(true);
        setConnectionState('connected');
        setIsMetaMaskLocked(false);
        
        // Check if the connected account is the contract owner
        try {
          console.log('👑 Checking contract owner...');
          const ownerAddress = await retryRequest(async () => {
            return contractInstance.methods.owner().call();
          }, 5, 2000, 'contract owner check'); // Increased retries and delay
          
          console.log('🏛️ Contract Owner:', ownerAddress);
          console.log('👤 Current Account:', accounts[0]);
          
          const isContractOwner = accounts[0].toLowerCase() === ownerAddress.toLowerCase();
          setIsOwner(isContractOwner);
          
          if (isContractOwner) {
            console.log('🔑 Admin access granted - Contract owner detected');
            toast.success('¡Acceso de administrador concedido!');
          } else {
            console.log('👤 Regular user access');
          }
        } catch (ownerError) {
          console.warn('⚠️ Could not verify contract owner (non-critical):', ownerError.message);
          setIsOwner(false);
          // Don't throw error here - owner check is not critical for basic functionality
        }
        
        // Update balance in background
        updateBalance(web3Instance, accounts[0]).catch(console.error);
        
        console.log('✅ BSC connection successful');
        toast.success('¡Conectado a BSC exitosamente!');
      } else {
        console.log('❌ Wrong network detected:', Number(networkId));
        setContract(null);
        setIsConnected(false);
        setConnectionState('error');
        setBalance('0');
        setIsOwner(false);
        setError('Wrong network');
        toast.error(`Red incorrecta detectada (${Number(networkId)}). Por favor cambia a BSC (Chain ID: 56)`);
      }
    } catch (error: any) {
      console.error('❌ Error setting up Web3 connection:', error);
      setConnectionState('error');
      setError(error.message || 'Connection setup failed');
      setIsOwner(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced wallet connection with comprehensive error handling and better circuit breaker management
  const connectWallet = async () => {
    // Prevent multiple simultaneous connection attempts
    const now = Date.now();
    if (isConnecting || (now - lastConnectionAttempt) < CONNECTION_COOLDOWN) {
      const remainingTime = Math.ceil((CONNECTION_COOLDOWN - (now - lastConnectionAttempt)) / 1000);
      toast.error(`Espera ${remainingTime} segundos antes de intentar de nuevo.`);
      return;
    }

    // Check if we're in circuit breaker cooldown
    if (circuitBreakerCount >= MAX_CIRCUIT_BREAKER_ATTEMPTS) {
      const extendedCooldown = CIRCUIT_BREAKER_COOLDOWN * 2;
      if ((now - lastConnectionAttempt) < extendedCooldown) {
        const remainingTime = Math.ceil((extendedCooldown - (now - lastConnectionAttempt)) / 1000);
        toast.error(`MetaMask está experimentando problemas. Espera ${remainingTime} segundos antes de intentar de nuevo.`, {
          duration: 5000
        });
        return;
      } else {
        // Reset circuit breaker count after extended cooldown
        circuitBreakerCount = 0;
        console.log('Circuit breaker count reset after extended cooldown');
      }
    }

    isConnecting = true;
    lastConnectionAttempt = now;
    setConnectionState('connecting');
    setIsLoading(true);
    setError(null);

    try {
      // Check MetaMask availability first
      const isAvailable = await checkMetaMaskAvailability();
      if (!isAvailable) {
        return;
      }

      console.log('🔗 Intentando conectar a la red BSC...');
      console.log('📍 Contract Address:', CONTRACT_ADDRESS);
      console.log('🌐 Chain ID esperado:', BSC_CHAIN_ID);
      
      // Check current network before attempting connection
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
      const currentNetworkId = parseInt(currentChainId, 16);
      console.log('🔍 Red actual detectada:', currentNetworkId, '(esperado:', BSC_CHAIN_ID, ')');
      
      if (currentNetworkId !== BSC_CHAIN_ID && currentNetworkId !== BSC_TESTNET_CHAIN_ID) {
        console.log('⚠️ Red incorrecta detectada. Actual:', currentNetworkId, 'Esperado:', BSC_CHAIN_ID);
        toast('Detectada red incorrecta. Cambiando a BSC automáticamente...', {
          icon: '⚠️',
          duration: 3000
        });
        await switchToBSC();
        return; // Exit here, the network change will trigger reconnection
      } else {
        console.log('✅ Red BSC detectada correctamente');
      }

      // Create Web3 instance
      const web3Instance = new Web3(window.ethereum);
      
      // Request account access with retry mechanism
      const accounts = await retryRequest(async () => {
        return window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
      }, 3, 2000, 'account request'); // Reduced delay for account requests
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please unlock MetaMask and try again.');
      }

      console.log('✅ Cuentas encontradas:', accounts.length);
      console.log('👤 Cuenta principal:', accounts[0]);
      await setupWeb3Connection(web3Instance, accounts);
      
    } catch (error: any) {
      console.error('❌ Error conectando billetera:', error);
      setConnectionState('error');
      
      const errorMessage = error.message || error.toString() || '';
      const errorCode = error.code;
      
      // Enhanced error handling with specific messages and recovery instructions
      if (isCircuitBreakerError(error)) {
        const isHighCount = circuitBreakerCount >= MAX_CIRCUIT_BREAKER_ATTEMPTS;
        const waitTime = isHighCount ? '30-60 seconds' : '15-20 seconds';
        
        const errorMsg = `🔧 MetaMask is temporarily overloaded (attempt ${circuitBreakerCount}/${MAX_CIRCUIT_BREAKER_ATTEMPTS}).\n\n` +
                        `💡 This usually resolves in ${waitTime}. Try these steps:\n` +
                        '1. Wait and try again\n' +
                        '2. Close and reopen MetaMask extension\n' +
                        '3. Refresh this page if the issue persists\n' +
                        '4. Try disabling other browser extensions temporarily';
        
        toast.error(errorMsg, { 
          duration: isHighCount ? 10000 : 8000,
          style: {
            maxWidth: '450px',
            whiteSpace: 'pre-line'
          }
        });
        setError(`Circuit breaker active (${circuitBreakerCount}/${MAX_CIRCUIT_BREAKER_ATTEMPTS})`);
        
        // Set extended cooldown for high circuit breaker counts
        if (isHighCount) {
          lastConnectionAttempt = now + CIRCUIT_BREAKER_COOLDOWN - CONNECTION_COOLDOWN;
        }
      } else if (errorCode === 4001 || errorMessage.includes('User rejected') || errorMessage.includes('User denied')) {
        const errorMsg = 'Connection rejected. Please approve the connection in MetaMask to continue.';
        toast.error(errorMsg);
        setError('User rejected connection');
        // Reset circuit breaker count on user rejection
        circuitBreakerCount = 0;
      } else if (errorMessage.includes('User denied account authorization')) {
        const errorMsg = 'Account access denied. Please approve account access in MetaMask.';
        toast.error(errorMsg);
        setError('Account access denied');
        circuitBreakerCount = 0;
      } else if (errorMessage.includes('Already processing eth_requestAccounts')) {
        const errorMsg = 'MetaMask is already processing a request. Please check MetaMask and complete any pending actions.';
        toast.error(errorMsg);
        setError('Request already processing');
      } else if (errorMessage.includes('Request of type \'wallet_requestPermissions\' already pending')) {
        const errorMsg = 'A MetaMask request is already pending. Please complete it first.';
        toast.error(errorMsg);
        setError('Request pending');
      } else if (errorMessage.includes('MetaMask is locked')) {
        const errorMsg = 'MetaMask is locked. Please unlock MetaMask and try again.';
        toast.error(errorMsg);
        setError('MetaMask locked');
        setIsMetaMaskLocked(true);
        circuitBreakerCount = 0;
      } else if (errorMessage.includes('rate limit') || errorMessage.includes('too many requests')) {
        const errorMsg = 'Too many requests. Please wait a moment and try again.';
        toast.error(errorMsg);
        setError('Rate limited');
      } else if (errorMessage.includes('No accounts found')) {
        const errorMsg = 'No accounts found. Please unlock MetaMask and try again.';
        toast.error(errorMsg);
        setError('No accounts');
        circuitBreakerCount = 0;
      } else {
        const errorMsg = 'Failed to connect wallet. Please ensure MetaMask is unlocked and try again.';
        toast.error(errorMsg);
        setError(errorMessage || 'Connection failed');
      }
    } finally {
      isConnecting = false;
      setIsLoading(false);
    }
  };

  // Enhanced reconnection with better error handling
  const reconnectWallet = async () => {
    if (!window.ethereum) return;
    
    try {
      setIsLoading(true);
      setConnectionState('connecting');
      setError(null);
      
      const web3Instance = new Web3(window.ethereum);
      const accounts = await retryRequest(async () => {
        return web3Instance.eth.getAccounts();
      }, 2, 1000, 'account fetch');
      
      if (accounts.length > 0) {
        await setupWeb3Connection(web3Instance, accounts);
      } else {
        setConnectionState('idle');
        setIsMetaMaskLocked(true);
        setIsOwner(false);
      }
    } catch (error: any) {
      console.error('Error reconnecting wallet:', error);
      setConnectionState('error');
      setError(error.message || 'Reconnection failed');
      setIsOwner(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced retry connection function with circuit breaker awareness
  const retryConnection = async () => {
    if (connectionState === 'error' || error) {
      // If it's a circuit breaker error, show a helpful message and wait
      if (error?.includes('Circuit breaker') || error?.includes('overloaded')) {
        const waitTime = circuitBreakerCount >= MAX_CIRCUIT_BREAKER_ATTEMPTS ? 3000 : 2000;
        toast.loading(`Waiting for MetaMask to recover...`, { duration: waitTime });
        await wait(waitTime);
      }
      await connectWallet();
    }
  };

  // Enhanced disconnect with complete cleanup
  const disconnectWallet = () => {
    setWeb3(null);
    setAccount(null);
    setContract(null);
    setIsConnected(false);
    setNetworkId(null);
    setBalance('0');
    setIsCorrectNetwork(false);
    setConnectionState('idle');
    setIsLoading(false);
    setError(null);
    setIsMetaMaskLocked(false);
    setIsOwner(false); // Reset admin status
    
    // Reset connection state and circuit breaker
    isConnecting = false;
    lastConnectionAttempt = 0;
    circuitBreakerCount = 0;
    
    toast.success('Wallet disconnected');
  };

  // Enhanced event listeners with better error handling
  useEffect(() => {
    if (window.ethereum && web3) {
      const handleAccountsChanged = async (newAccounts: string[]) => {
        console.log('Accounts changed:', newAccounts);
        
        if (newAccounts.length === 0) {
          disconnectWallet();
          setIsMetaMaskLocked(true);
        } else if (newAccounts[0] !== account) {
          setAccount(newAccounts[0]);
          setIsMetaMaskLocked(false);
          
          // Re-check owner status when account changes
          if (contract && isCorrectNetwork) {
            try {
              const ownerAddress = await contract.methods.owner().call();
              const isContractOwner = newAccounts[0].toLowerCase() === ownerAddress.toLowerCase();
              setIsOwner(isContractOwner);
            } catch (error) {
              console.error('Error checking new account owner status:', error);
              setIsOwner(false);
            }
          }
          
          if (isCorrectNetwork && web3) {
            await updateBalance(web3, newAccounts[0]);
          }
        }
      };

      const handleChainChanged = async (chainId: string) => {
        console.log('Chain changed:', chainId);
        
        try {
          const newNetworkId = parseInt(chainId, 16);
          setNetworkId(newNetworkId);
          const isBSC = newNetworkId === BSC_CHAIN_ID || newNetworkId === BSC_TESTNET_CHAIN_ID;
          setIsCorrectNetwork(isBSC);
          
          if (isBSC && web3 && account) {
            const contractInstance = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
            setContract(contractInstance);
            setIsConnected(true);
            setConnectionState('connected');
            setError(null);
            
            // Re-check owner status on network change
            try {
              const ownerAddress = await contractInstance.methods.owner().call();
              const isContractOwner = account.toLowerCase() === ownerAddress.toLowerCase();
              setIsOwner(isContractOwner);
            } catch (error) {
              console.error('Error checking owner status after network change:', error);
              setIsOwner(false);
            }
            
            await updateBalance(web3, account);
            toast.success('¡Cambiado a Binance Smart Chain exitosamente!');
          } else {
            setContract(null);
            setIsConnected(false);
            setConnectionState('error');
            setBalance('0');
            setIsOwner(false);
            setError('Wrong network');
            if (!isBSC) {
              toast.error('Por favor cambia a Binance Smart Chain (Chain ID: 56)');
            }
          }
        } catch (error: any) {
          console.error('Error handling chain change:', error);
          setError('Chain change error');
          setIsOwner(false);
        }
      };

      const handleConnect = (connectInfo: any) => {
        console.log('MetaMask connected:', connectInfo);
        if (connectionState === 'error') {
          setConnectionState('idle');
          setError(null);
          // Reset circuit breaker on successful connection
          circuitBreakerCount = 0;
        }
      };

      const handleDisconnect = (error: any) => {
        console.log('MetaMask disconnected:', error);
        disconnectWallet();
      };

      // Add event listeners
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('connect', handleConnect);
      window.ethereum.on('disconnect', handleDisconnect);

      return () => {
        // Remove event listeners
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
          window.ethereum.removeListener('connect', handleConnect);
          window.ethereum.removeListener('disconnect', handleDisconnect);
        }
      };
    }
  }, [web3, account, isCorrectNetwork, connectionState, contract]);

  // Enhanced initial connection check
  useEffect(() => {
    const checkExistingConnection = async () => {
      if (window.ethereum) {
        try {
          setIsLoading(true);
          setIsMetaMaskInstalled(true);
          
          // Wait for MetaMask to initialize
          await wait(1000);
          
          const web3Instance = new Web3(window.ethereum);
          const accounts = await retryRequest(async () => {
            return web3Instance.eth.getAccounts();
          }, 2, 1000, 'initial connection check');
          
          if (accounts.length > 0) {
            await setupWeb3Connection(web3Instance, accounts);
          } else {
            setConnectionState('idle');
            setIsMetaMaskLocked(true);
          }
        } catch (error: any) {
          console.log('No existing connection found:', error);
          setConnectionState('idle');
          
          // Handle circuit breaker errors with user-friendly messages
          const errorMessage = error.message || error.toString() || '';
          if (isCircuitBreakerError(error)) {
            circuitBreakerCount++;
            setError('Circuit breaker active');
            toast.error('MetaMask is temporarily busy. This usually resolves automatically in 10-20 seconds.', {
              duration: 6000
            });
          } else if (errorMessage.includes('rate limit') || errorMessage.includes('too many requests')) {
            setError('Rate limited');
            toast.error('MetaMask rate limit reached. Please wait a moment before trying again.');
          } else if (errorMessage.includes('MetaMask is locked')) {
            setIsMetaMaskLocked(true);
            setError('MetaMask locked');
          } else {
            setError(errorMessage || 'Initial connection check failed');
          }
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsMetaMaskInstalled(false);
        setConnectionState('idle');
      }
    };

    checkExistingConnection();
  }, []);

  // Enhanced auto-refresh balance with better conditions
  useEffect(() => {
    if (web3 && account && isCorrectNetwork && connectionState === 'connected' && !isLoading) {
      const interval = setInterval(() => {
        updateBalance(web3, account);
      }, 300000); // 5 minutes
      
      return () => clearInterval(interval);
    }
  }, [web3, account, isCorrectNetwork, connectionState, isLoading]);

  // Monitor MetaMask installation
  useEffect(() => {
    const checkMetaMask = () => {
      setIsMetaMaskInstalled(!!window.ethereum);
    };

    checkMetaMask();
    
    // Check periodically in case MetaMask is installed after page load
    const interval = setInterval(checkMetaMask, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <Web3Context.Provider value={{ 
      web3, 
      account, 
      contract, 
      isConnected, 
      connectWallet, 
      networkId,
      balance,
      isCorrectNetwork,
      switchToBSC: switchToBSC,
      reconnectWallet,
      disconnectWallet,
      connectionState,
      isLoading,
      error,
      retryConnection,
      isMetaMaskInstalled,
      isMetaMaskLocked,
      isOwner // Added for admin functionality
    }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = (): Web3ContextType => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};