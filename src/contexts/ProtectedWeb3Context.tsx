import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import Web3 from 'web3';
import toast from 'react-hot-toast';
import { reconstructABI, getNetworkConfig, getContractAddress, callContractMethod } from '../utils/obfuscatedWeb3';
import { protectedExecution, detectEnvironment } from '../utils/protection';

// Obfuscated context interface
interface ProtectedWeb3ContextType {
  web3: Web3 | null;
  account: string | null;
  contract: any;
  isConnected: boolean;
  connectWallet: () => Promise<void>;
  networkId: number | null;
  balance: string;
  isCorrectNetwork: boolean;
  switchToCore: () => Promise<void>;
  reconnectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  connectionState: 'idle' | 'connecting' | 'connected' | 'error';
  isLoading: boolean;
  error: string | null;
  retryConnection: () => Promise<void>;
  isMetaMaskInstalled: boolean;
  isMetaMaskLocked: boolean;
  isOwner: boolean;
  // Obfuscated method caller
  callMethod: (methodName: string, params?: any[], options?: any) => Promise<any>;
}

const ProtectedWeb3Context = createContext<ProtectedWeb3ContextType | undefined>(undefined);

// Obfuscated constants
const _CONTRACT_ADDRESS = getContractAddress();
const _CORE_CHAIN_ID = parseInt(getNetworkConfig().chainId);
const _NETWORK_CONFIG = getNetworkConfig();

// Dynamic ABI loading
const _CONTRACT_ABI = reconstructABI();

export const ProtectedWeb3Provider: React.FC<{ children: ReactNode }> = ({ children }) => {
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
  const [isOwner, setIsOwner] = useState(false);

  // Protected method caller
  const callMethod = async (methodName: string, params: any[] = [], options: any = {}) => {
    if (!contract || !web3) {
      throw new Error('Contract not initialized');
    }
    
    return protectedExecution(async () => {
      return await callContractMethod(web3, contract, methodName, params, options);
    });
  };

  // Environment check on initialization
  useEffect(() => {
    if (!detectEnvironment()) {
      console.warn('Unauthorized environment detected');
      // Could redirect or disable functionality
    }
  }, []);

  // Protected wallet connection
  const connectWallet = async () => {
    return protectedExecution(async () => {
      if (!window.ethereum) {
        toast.error('MetaMask is not installed!');
        return;
      }

      try {
        setIsLoading(true);
        setConnectionState('connecting');
        setError(null);

        const web3Instance = new Web3(window.ethereum);
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });

        if (!accounts || accounts.length === 0) {
          throw new Error('No accounts found');
        }

        await setupWeb3Connection(web3Instance, accounts);
      } catch (err: any) {
        console.error('Connection error:', err);
        setConnectionState('error');
        setError(err.message);
        toast.error('Failed to connect wallet');
      } finally {
        setIsLoading(false);
      }
    });
  };

  // Protected Web3 setup
  const setupWeb3Connection = async (web3Instance: Web3, accounts: string[]) => {
    return protectedExecution(async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const networkId = await web3Instance.eth.net.getId();
        
        setWeb3(web3Instance);
        setAccount(accounts[0]);
        setNetworkId(Number(networkId));
        
        const isCore = Number(networkId) === _CORE_CHAIN_ID;
        setIsCorrectNetwork(isCore);
        
        if (isCore) {
          const contractInstance = new web3Instance.eth.Contract(_CONTRACT_ABI, _CONTRACT_ADDRESS);
          setContract(contractInstance);
          setIsConnected(true);
          setConnectionState('connected');
          setIsMetaMaskLocked(false);
          
          // Check owner status
          try {
            const ownerAddress = await contractInstance.methods.owner().call();
            const isContractOwner = accounts[0].toLowerCase() === ownerAddress.toLowerCase();
            setIsOwner(isContractOwner);
          } catch (ownerError) {
            console.error('Error checking contract owner:', ownerError);
            setIsOwner(false);
          }
          
          // Update balance
          const balance = await web3Instance.eth.getBalance(accounts[0]);
          setBalance(web3Instance.utils.fromWei(balance, 'ether'));
          
          toast.success('Connected to Core Blockchain successfully!');
        } else {
          setContract(null);
          setIsConnected(false);
          setConnectionState('error');
          setBalance('0');
          setIsOwner(false);
          setError('Wrong network');
          toast.error('Please switch to Core Blockchain');
        }
      } catch (error: any) {
        console.error('Setup error:', error);
        setConnectionState('error');
        setError(error.message);
        setIsOwner(false);
        throw error;
      } finally {
        setIsLoading(false);
      }
    });
  };

  // Protected network switching
  const switchToCore = async () => {
    return protectedExecution(async () => {
      if (!window.ethereum) {
        toast.error('MetaMask is not installed!');
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: _NETWORK_CONFIG.chainId }],
        });
        
        toast.success('Switched to Core Blockchain successfully!');
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [_NETWORK_CONFIG],
            });
            
            toast.success('Core Blockchain network added successfully!');
          } catch (addError: any) {
            console.error('Error adding Core network:', addError);
            toast.error('Failed to add Core Blockchain network');
            setError('Failed to add Core network');
          }
        } else {
          console.error('Error switching to Core network:', switchError);
          toast.error('Failed to switch to Core Blockchain network');
          setError('Network switch failed');
        }
      } finally {
        setIsLoading(false);
      }
    });
  };

  // Other methods remain similar but wrapped in protectedExecution...
  const reconnectWallet = async () => {
    return protectedExecution(async () => {
      if (!window.ethereum) return;
      
      try {
        setIsLoading(true);
        setConnectionState('connecting');
        setError(null);
        
        const web3Instance = new Web3(window.ethereum);
        const accounts = await web3Instance.eth.getAccounts();
        
        if (accounts.length > 0) {
          await setupWeb3Connection(web3Instance, accounts);
        } else {
          setConnectionState('idle');
          setIsMetaMaskLocked(true);
          setIsOwner(false);
        }
      } catch (error: any) {
        console.error('Reconnection error:', error);
        setConnectionState('error');
        setError(error.message);
        setIsOwner(false);
      } finally {
        setIsLoading(false);
      }
    });
  };

  const disconnectWallet = () => {
    protectedExecution(() => {
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
      setIsOwner(false);
      
      toast.success('Wallet disconnected');
    });
  };

  const retryConnection = async () => {
    if (connectionState === 'error' || error) {
      await connectWallet();
    }
  };

  // Check MetaMask installation
  useEffect(() => {
    const checkMetaMask = () => {
      setIsMetaMaskInstalled(!!window.ethereum);
    };

    checkMetaMask();
    const interval = setInterval(checkMetaMask, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ProtectedWeb3Context.Provider value={{ 
      web3, 
      account, 
      contract, 
      isConnected, 
      connectWallet, 
      networkId,
      balance,
      isCorrectNetwork,
      switchToCore,
      reconnectWallet,
      disconnectWallet,
      connectionState,
      isLoading,
      error,
      retryConnection,
      isMetaMaskInstalled,
      isMetaMaskLocked,
      isOwner,
      callMethod
    }}>
      {children}
    </ProtectedWeb3Context.Provider>
  );
};

export const useProtectedWeb3 = (): ProtectedWeb3ContextType => {
  const context = useContext(ProtectedWeb3Context);
  if (context === undefined) {
    throw new Error('useProtectedWeb3 must be used within a ProtectedWeb3Provider');
  }
  return context;
};