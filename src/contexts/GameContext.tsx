import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useWeb3 } from './Web3Context';
import { saveGameSecret, getGameSecret, removeGameSecret, clearExpiredSecrets } from '../utils/gameStorage';
import toast from 'react-hot-toast';

interface Game {
  id: number;
  creator: string;
  creatorMoveHash: string;
  creatorMove: number;
  opponent: string;
  opponentMove: number;
  betAmount: string;
  status: number;
  winner: string;
  createdAt: number;
  revealDeadline: number;
  referrer: string;
}

interface PlayerStats {
  wins: number;
  losses: number;
  ties: number;
  gamesPlayed: number;
  totalWagered: string;
  totalWon: string;
  referralEarnings: string;
  lastPlayed: number;
  monthlyScore: number;
  winRate?: number;
  profit?: string;
}

interface GameContextType {
  games: Game[];
  playerStats: PlayerStats | null;
  loading: boolean;
  error: string | null;
  createGame: (moveHash: string, betAmount: string, referrer?: string, move?: number, secret?: string) => Promise<void>;
  joinGame: (gameId: number, move: number, betAmount: string) => Promise<void>;
  revealMove: (gameId: number, move?: number, secret?: string) => Promise<void>;
  autoRevealMove: (gameId: number) => Promise<boolean>;
  cancelGame: (gameId: number) => Promise<void>;
  claimTimeout: (gameId: number) => Promise<void>;
  fetchGames: () => Promise<void>;
  fetchPlayerStats: (address: string) => Promise<void>;
  generateMoveHash: (move: number, secret: string) => string;
  refreshData: () => Promise<void>;
  hasStoredSecret: (gameId: number) => boolean;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { web3, contract, account, isConnected, isCorrectNetwork } = useWeb3();
  const [games, setGames] = useState<Game[]>([]);
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clean up expired secrets on initialization
  useEffect(() => {
    clearExpiredSecrets();
  }, []);

  const generateMoveHash = (move: number, secret: string): string => {
    if (!web3) return '';
    return web3.utils.soliditySha3(
      { type: 'uint8', value: move },
      { type: 'string', value: secret }
    ) as string;
  };

  const hasStoredSecret = (gameId: number): boolean => {
    return getGameSecret(gameId) !== null;
  };

  const fetchGames = async () => {
    if (!contract || !isCorrectNetwork) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Get total number of games
      const gameCount = await contract.methods.gameCounter().call();
      const gameList: Game[] = [];
      
      // Fetch games in batches for better performance
      const batchSize = 10;
      const totalGames = Number(gameCount);
      
      for (let i = Math.max(1, totalGames - 50); i <= totalGames; i += batchSize) {
        const promises = [];
        const endIndex = Math.min(i + batchSize - 1, totalGames);
        
        for (let j = i; j <= endIndex; j++) {
          promises.push(
            contract.methods.getGame(j).call().catch((err: any) => {
              console.error(`Error fetching game ${j}:`, err);
              return null;
            })
          );
        }
        
        const batchResults = await Promise.all(promises);
        
        batchResults.forEach((game, index) => {
          if (game && game.creator !== '0x0000000000000000000000000000000000000000') {
            gameList.push({
              id: i + index,
              creator: game.creator,
              creatorMoveHash: game.creatorMoveHash,
              creatorMove: Number(game.creatorMove),
              opponent: game.opponent,
              opponentMove: Number(game.opponentMove),
              betAmount: game.betAmount,
              status: Number(game.status),
              winner: game.winner,
              createdAt: Number(game.createdAt),
              revealDeadline: Number(game.revealDeadline),
              referrer: game.referrer
            });
          }
        });
      }
      
      // Sort by ID descending (newest first)
      setGames(gameList.sort((a, b) => b.id - a.id));
    } catch (err: any) {
      console.error('Error fetching games:', err);
      setError(err.message);
      toast.error('Error fetching games from BSC');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlayerStats = async (playerAddress: string) => {
    if (!contract || !playerAddress || !isCorrectNetwork) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const stats = await contract.methods.getPlayerStats(playerAddress).call();
      
      const totalGames = Number(stats.gamesPlayed);
      const winRate = totalGames > 0 ? Math.round((Number(stats.wins) / totalGames) * 100) : 0;
      
      setPlayerStats({
        wins: Number(stats.wins),
        losses: Number(stats.losses),
        ties: Number(stats.ties),
        gamesPlayed: totalGames,
        totalWagered: stats.totalWagered,
        totalWon: stats.totalWon,
        referralEarnings: stats.referralEarnings,
        lastPlayed: Number(stats.lastPlayed),
        monthlyScore: Number(stats.monthlyScore),
        winRate,
        profit: (BigInt(stats.totalWon) - BigInt(stats.totalWagered)).toString()
      });
    } catch (err: any) {
      console.error('Error fetching player stats:', err);
      setError(err.message);
      toast.error('Error fetching player stats from BSC');
    } finally {
      setLoading(false);
    }
  };

  const createGame = async (moveHash: string, betAmount: string, referrer?: string, move?: number, secret?: string) => {
    if (!contract || !account || !web3 || !isCorrectNetwork) {
      toast.error('Por favor conecta a Binance Smart Chain primero');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('🎮 Creating game with params:', {
        moveHash,
        betAmount,
        referrer: referrer || 'none',
        account
      });
      
      const weiAmount = web3.utils.toWei(betAmount, 'ether');
      const referrerAddress = referrer || '0x0000000000000000000000000000000000000000';
      
      console.log('💰 Wei amount:', weiAmount);
      console.log('👥 Referrer address:', referrerAddress);
      
      // Enhanced gas estimation with multiple fallbacks
      let gasEstimate;
      let gasPrice;
      
      try {
        console.log('⛽ Estimating gas...');
        
        // Try multiple RPC endpoints for gas estimation
        const rpcEndpoints = [
          'https://bsc-dataseed1.binance.org',
          'https://bsc-dataseed2.binance.org',
          'https://bsc-dataseed3.binance.org',
          'https://rpc.ankr.com/bsc'
        ];
        
        let estimationSuccess = false;
        
        for (const rpcUrl of rpcEndpoints) {
          try {
            console.log(`🔄 Trying RPC: ${rpcUrl}`);
            const tempWeb3 = new (window as any).Web3(rpcUrl);
            const tempContract = new tempWeb3.eth.Contract(contract.options.jsonInterface, contract.options.address);
            
            gasEstimate = await tempContract.methods.createGame(moveHash, referrerAddress)
              .estimateGas({ from: account, value: weiAmount });
            
            gasPrice = await tempWeb3.eth.getGasPrice();
            estimationSuccess = true;
            console.log('✅ Gas estimation successful with RPC:', rpcUrl);
            break;
          } catch (rpcError) {
            console.warn(`⚠️ RPC ${rpcUrl} failed:`, rpcError.message);
            continue;
          }
        }
        
        if (!estimationSuccess) {
          throw new Error('All RPC endpoints failed for gas estimation');
        }
        
      } catch (gasError) {
        console.warn('⚠️ Gas estimation failed, using fallback values:', gasError.message);
        
        // Fallback gas values for BSC
        gasEstimate = 300000; // Safe default for createGame
        gasPrice = web3.utils.toWei('5', 'gwei'); // Standard BSC gas price
        
        toast('⚠️ Usando valores de gas por defecto debido a problemas de RPC', {
          icon: '⛽',
          duration: 3000
        });
      }
      
      console.log('⛽ Gas estimate:', gasEstimate);
      console.log('💸 Gas price:', gasPrice);
      
      // Enhanced transaction with retry mechanism
      const maxRetries = 3;
      let lastError;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`🚀 Transaction attempt ${attempt}/${maxRetries}`);
          
          const txParams = {
            from: account,
            value: weiAmount,
            gas: Math.floor(Number(gasEstimate) * 1.3), // 30% buffer
            gasPrice: gasPrice
          };
          
          console.log('📝 Transaction params:', txParams);
          
          const tx = await contract.methods.createGame(moveHash, referrerAddress).send(txParams);
          
          console.log('✅ Transaction successful:', tx.transactionHash);
          
          // Get the game ID from the transaction receipt
          const receipt = await web3.eth.getTransactionReceipt(tx.transactionHash);
          let gameId = null;
          
          // Parse the GameCreated event to get the actual game ID
          if (receipt.logs && receipt.logs.length > 0) {
            for (const log of receipt.logs) {
              try {
                const decodedLog = web3.eth.abi.decodeLog(
                  [
                    { type: 'uint256', name: 'gameId', indexed: true },
                    { type: 'address', name: 'creator', indexed: true },
                    { type: 'uint256', name: 'betAmount' },
                    { type: 'bytes32', name: 'moveHash' },
                    { type: 'address', name: 'referrer' }
                  ],
                  log.data,
                  log.topics
                );
                
                if (decodedLog.gameId) {
                  gameId = Number(decodedLog.gameId);
                  break;
                }
              } catch (e) {
                // Continue to next log if this one can't be decoded
              }
            }
          }
          
          // If we couldn't get the game ID from events, try to find it by fetching recent games
          if (!gameId) {
            try {
              const gameCount = await contract.methods.gameCounter().call();
              gameId = Number(gameCount);
            } catch (counterError) {
              console.warn('Could not get game counter:', counterError);
            }
          }
          
          // Save the secret with the actual game ID if we have move and secret
          if (gameId && move && secret) {
            saveGameSecret(gameId, move, secret, moveHash);
            toast.success(`🎮 ¡Juego #${gameId} creado exitosamente! Secreto guardado para auto-reveal.`);
          } else {
            toast.success(`🎮 ¡Juego creado exitosamente! Tx: ${tx.transactionHash}`);
          }
          
          await refreshData();
          return; // Success, exit retry loop
          
        } catch (attemptError: any) {
          lastError = attemptError;
          console.error(`❌ Transaction attempt ${attempt} failed:`, attemptError.message);
          
          // Don't retry if user rejected
          if (attemptError.code === 4001 || attemptError.message?.includes('User rejected')) {
            throw attemptError;
          }
          
          // Don't retry if insufficient funds
          if (attemptError.message?.includes('insufficient funds') || 
              attemptError.message?.includes('exceeds balance')) {
            throw attemptError;
          }
          
          // Wait before retry (except on last attempt)
          if (attempt < maxRetries) {
            const delay = 2000 * attempt; // Progressive delay
            console.log(`⏳ Waiting ${delay}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
      
      // If all retries failed, throw the last error
      throw lastError;
      
    } catch (err: any) {
      console.error('Error creating game:', err);
      setError(err.message);
      
      // Enhanced error messages
      const errorMessage = err.message || err.toString() || '';
      
      if (errorMessage.includes('insufficient funds')) {
        toast.error('❌ Fondos insuficientes. Necesitas más BNB para la apuesta + gas fees.');
      } else if (errorMessage.includes('User rejected') || err.code === 4001) {
        toast.error('❌ Transacción rechazada por el usuario.');
      } else if (errorMessage.includes('gas')) {
        toast.error('❌ Error de gas. Intenta con un gas price más alto.');
      } else if (errorMessage.includes('nonce')) {
        toast.error('❌ Error de nonce. Resetea tu cuenta en MetaMask.');
      } else if (errorMessage.includes('Internal JSON-RPC error')) {
        toast.error('❌ Error de RPC de BSC. Los servidores están sobrecargados. Intenta en unos minutos.');
      } else {
        toast.error(`❌ Error creando juego: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const joinGame = async (gameId: number, move: number, betAmount: string) => {
    if (!contract || !account || !web3 || !isCorrectNetwork) {
      toast.error('Please connect to Binance Smart Chain first');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const weiAmount = web3.utils.toWei(betAmount, 'ether');
      
      // Verificar saldo antes de unirse al juego
      const userBalance = await web3.eth.getBalance(account);
      const userBalanceWei = BigInt(userBalance);
      const betAmountWei = BigInt(weiAmount);
      
      // Agregar un margen para gas (0.001 CORE = 1000000000000000 wei)
      const gasMarginWei = BigInt(2000000000000000); // 0.002 BNB margin for gas
      const requiredBalanceWei = betAmountWei + gasMarginWei;
      
      if (userBalanceWei < requiredBalanceWei) {
        const userBalanceEther = web3.utils.fromWei(userBalance, 'ether');
        const requiredBalanceEther = web3.utils.fromWei(requiredBalanceWei.toString(), 'ether');
        
        throw new Error(`Insufficient balance. You have ${parseFloat(userBalanceEther).toFixed(6)} BNB but need at least ${parseFloat(requiredBalanceEther).toFixed(6)} BNB (including gas fees)`);
      }
      
      // Estimate gas first
      const gasEstimate = await contract.methods.joinGame(gameId, move)
        .estimateGas({ from: account, value: weiAmount });
      
      const tx = await contract.methods.joinGame(gameId, move)
        .send({ 
          from: account, 
          value: weiAmount,
          gas: Math.floor(Number(gasEstimate) * 1.2) // Add 20% buffer
        });
      
      toast.success(`Joined game successfully! Tx: ${tx.transactionHash}`);
      await refreshData();
    } catch (err: any) {
      console.error('Error joining game:', err);
      setError(err.message);
      toast.error('Error joining game on BSC: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const autoRevealMove = async (gameId: number): Promise<boolean> => {
    const storedSecret = getGameSecret(gameId);
    
    if (!storedSecret) {
      return false;
    }
    
    try {
      await revealMove(gameId, storedSecret.move, storedSecret.secret);
      // Remove the secret after successful reveal
      removeGameSecret(gameId);
      return true;
    } catch (error) {
      console.error('Error in auto reveal:', error);
      return false;
    }
  };

  const revealMove = async (gameId: number, move?: number, secret?: string) => {
    if (!contract || !account || !isCorrectNetwork) {
      toast.error('Please connect to Binance Smart Chain first');
      return;
    }
    
    let finalMove = move;
    let finalSecret = secret;
    
    // If move and secret are not provided, try to get them from storage
    if (!finalMove || !finalSecret) {
      const storedSecret = getGameSecret(gameId);
      if (storedSecret) {
        finalMove = storedSecret.move;
        finalSecret = storedSecret.secret;
        toast.info('Using stored secret for automatic reveal');
      } else {
        toast.error('Move and secret are required for reveal');
        return;
      }
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Estimate gas first
      const gasEstimate = await contract.methods.revealMove(gameId, finalMove, finalSecret)
        .estimateGas({ from: account });
      
      const tx = await contract.methods.revealMove(gameId, finalMove, finalSecret)
        .send({ 
          from: account,
          gas: Math.floor(Number(gasEstimate) * 1.2) // Add 20% buffer
        });
      
      toast.success(`Move revealed successfully! Tx: ${tx.transactionHash}`);
      
      // Remove the secret from storage after successful reveal
      removeGameSecret(gameId);
      
      await refreshData();
    } catch (err: any) {
      console.error('Error revealing move:', err);
      setError(err.message);
      toast.error('Error revealing move on BSC');
    } finally {
      setLoading(false);
    }
  };

  const cancelGame = async (gameId: number) => {
    if (!contract || !account || !isCorrectNetwork) {
      toast.error('Please connect to Binance Smart Chain first');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Estimate gas first
      const gasEstimate = await contract.methods.cancelGame(gameId)
        .estimateGas({ from: account });
      
      const tx = await contract.methods.cancelGame(gameId)
        .send({ 
          from: account,
          gas: Math.floor(Number(gasEstimate) * 1.2) // Add 20% buffer
        });
      
      toast.success(`Game cancelled successfully! Tx: ${tx.transactionHash}`);
      
      // Remove the secret from storage since game is cancelled
      removeGameSecret(gameId);
      
      await refreshData();
    } catch (err: any) {
      console.error('Error cancelling game:', err);
      setError(err.message);
      toast.error('Error cancelling game on BSC');
    } finally {
      setLoading(false);
    }
  };

  const claimTimeout = async (gameId: number) => {
    if (!contract || !account || !isCorrectNetwork) {
      toast.error('Please connect to Binance Smart Chain first');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Estimate gas first
      const gasEstimate = await contract.methods.claimTimeout(gameId)
        .estimateGas({ from: account });
      
      const tx = await contract.methods.claimTimeout(gameId)
        .send({ 
          from: account,
          gas: Math.floor(Number(gasEstimate) * 1.2) // Add 20% buffer
        });
      
      toast.success(`Timeout claimed successfully! Tx: ${tx.transactionHash}`);
      await refreshData();
    } catch (err: any) {
      console.error('Error claiming timeout:', err);
      setError(err.message);
      toast.error('Error claiming timeout on BSC');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    if (contract && isCorrectNetwork) {
      await fetchGames();
      if (account) {
        await fetchPlayerStats(account);
      }
    }
  };

  // Auto-refresh data every 30 seconds when connected to correct network
  useEffect(() => {
    if (contract && isCorrectNetwork) {
      fetchGames();
      if (account) {
        fetchPlayerStats(account);
      }

      const interval = setInterval(() => {
        refreshData();
      }, 300000); // 5 minutes = 300,000 milliseconds

      return () => clearInterval(interval);
    }
  }, [contract, account, isCorrectNetwork]);

  // Listen for blockchain events
  useEffect(() => {
    if (contract && isCorrectNetwork) {
      const gameCreatedEvent = contract.events.GameCreated();
      const gameJoinedEvent = contract.events.GameJoined();
      const gameCompletedEvent = contract.events.GameCompleted();
      const gameCanceledEvent = contract.events.GameCanceled();

      gameCreatedEvent.on('data', () => {
        console.log('Game created event detected');
        refreshData();
      });

      gameJoinedEvent.on('data', () => {
        console.log('Game joined event detected');
        refreshData();
      });

      gameCompletedEvent.on('data', () => {
        console.log('Game completed event detected');
        refreshData();
      });

      gameCanceledEvent.on('data', () => {
        console.log('Game canceled event detected');
        refreshData();
      });

      return () => {
        gameCreatedEvent.removeAllListeners();
        gameJoinedEvent.removeAllListeners();
        gameCompletedEvent.removeAllListeners();
        gameCanceledEvent.removeAllListeners();
      };
    }
  }, [contract, isCorrectNetwork]);

  return (
    <GameContext.Provider value={{
      games,
      playerStats,
      loading,
      error,
      createGame,
      joinGame,
      revealMove,
      autoRevealMove,
      cancelGame,
      claimTimeout,
      fetchGames,
      fetchPlayerStats,
      generateMoveHash,
      refreshData,
      hasStoredSecret
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};