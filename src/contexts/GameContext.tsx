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
      toast.error('Error fetching games from Core Blockchain');
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
      toast.error('Error fetching player stats from Core Blockchain');
    } finally {
      setLoading(false);
    }
  };

  const createGame = async (moveHash: string, betAmount: string, referrer?: string, move?: number, secret?: string) => {
    if (!contract || !account || !web3 || !isCorrectNetwork) {
      toast.error('Please connect to Core Blockchain first');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const weiAmount = web3.utils.toWei(betAmount, 'ether');
      const referrerAddress = referrer || '0x0000000000000000000000000000000000000000';
      
      // Estimate gas first
      const gasEstimate = await contract.methods.createGame(moveHash, referrerAddress)
        .estimateGas({ from: account, value: weiAmount });
      
      const tx = await contract.methods.createGame(moveHash, referrerAddress)
        .send({ 
          from: account, 
          value: weiAmount,
          gas: Math.floor(Number(gasEstimate) * 1.2) // Add 20% buffer
        });
      
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
        const gameCount = await contract.methods.gameCounter().call();
        gameId = Number(gameCount);
      }
      
      // Save the secret with the actual game ID if we have move and secret
      if (gameId && move && secret) {
        saveGameSecret(gameId, move, secret, moveHash);
        toast.success(`Game #${gameId} created successfully! Secret saved for auto-reveal.`);
      } else {
        toast.success(`Game created successfully! Tx: ${tx.transactionHash}`);
      }
      
      await refreshData();
    } catch (err: any) {
      console.error('Error creating game:', err);
      setError(err.message);
      toast.error('Error creating game on Core Blockchain');
    } finally {
      setLoading(false);
    }
  };

  const joinGame = async (gameId: number, move: number, betAmount: string) => {
    if (!contract || !account || !web3 || !isCorrectNetwork) {
      toast.error('Please connect to Core Blockchain first');
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
      const gasMarginWei = BigInt(1000000000000000);
      const requiredBalanceWei = betAmountWei + gasMarginWei;
      
      if (userBalanceWei < requiredBalanceWei) {
        const userBalanceEther = web3.utils.fromWei(userBalance, 'ether');
        const requiredBalanceEther = web3.utils.fromWei(requiredBalanceWei.toString(), 'ether');
        
        throw new Error(`Insufficient balance. You have ${parseFloat(userBalanceEther).toFixed(4)} CORE but need at least ${parseFloat(requiredBalanceEther).toFixed(4)} CORE (including gas fees)`);
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
      toast.error('Error joining game on Core Blockchain: ' + err.message);
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
      toast.error('Please connect to Core Blockchain first');
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
      toast.error('Error revealing move on Core Blockchain');
    } finally {
      setLoading(false);
    }
  };

  const cancelGame = async (gameId: number) => {
    if (!contract || !account || !isCorrectNetwork) {
      toast.error('Please connect to Core Blockchain first');
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
      toast.error('Error cancelling game on Core Blockchain');
    } finally {
      setLoading(false);
    }
  };

  const claimTimeout = async (gameId: number) => {
    if (!contract || !account || !isCorrectNetwork) {
      toast.error('Please connect to Core Blockchain first');
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
      toast.error('Error claiming timeout on Core Blockchain');
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