import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { useGame } from '../contexts/GameContext';
import { 
  Shield, 
  Settings, 
  Users, 
  Coins, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  Crown, 
  Wallet, 
  TrendingUp,
  Award,
  Target,
  Zap,
  Eye,
  Lock,
  Unlock,
  DollarSign,
  UserCheck,
  Activity
} from 'lucide-react';

const AdminPanel = () => {
  const { contract, account, isOwner, web3, isConnected, isCorrectNetwork } = useWeb3();
  const { refreshData } = useGame();
  
  // Form states
  const [newFeeWallet, setNewFeeWallet] = useState('');
  const [newFeePercentage, setNewFeePercentage] = useState('');
  const [newOwner, setNewOwner] = useState('');
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Contract data states
  const [contractData, setContractData] = useState({
    rewardPool: '0',
    feeWallet: '',
    feePercentage: 0,
    totalGames: 0,
    totalPlayers: 0,
    contractBalance: '0',
    owner: ''
  });

  // Fetch contract data
  const fetchContractData = async () => {
    if (!contract || !isCorrectNetwork) return;
    
    try {
      setLoading(true);
      
      const [
        rewardPool,
        feeWallet,
        feePercentage,
        totalGames,
        totalPlayers,
        contractBalance,
        owner
      ] = await Promise.all([
        contract.methods.getRewardPoolInfo().call(),
        contract.methods.feeWallet().call(),
        contract.methods.feePercentage().call(),
        contract.methods.totalGames().call(),
        contract.methods.totalPlayers().call(),
        web3?.eth.getBalance(contract.options.address),
        contract.methods.owner().call()
      ]);
      
      setContractData({
        rewardPool,
        feeWallet,
        feePercentage: Number(feePercentage),
        totalGames: Number(totalGames),
        totalPlayers: Number(totalPlayers),
        contractBalance: contractBalance || '0',
        owner
      });
    } catch (err: any) {
      console.error('Error fetching contract data:', err);
      setError('Error fetching contract data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOwner && contract && isCorrectNetwork) {
      fetchContractData();
    }
  }, [isOwner, contract, isCorrectNetwork]);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const handleDistributeRewards = async () => {
    if (!contract || !account) return;
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const gasEstimate = await contract.methods.distributeRewards()
        .estimateGas({ from: account });
      
      const tx = await contract.methods.distributeRewards()
        .send({ 
          from: account,
          gas: Math.floor(Number(gasEstimate) * 1.2)
        });
      
      setSuccess(`Rewards distributed successfully! Tx: ${tx.transactionHash}`);
      await fetchContractData();
      await refreshData();
    } catch (err: any) {
      console.error('Error distributing rewards:', err);
      setError('Error distributing rewards: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFeeWallet = async () => {
    if (!contract || !account || !newFeeWallet) return;
    
    // Validate address format
    if (!web3?.utils.isAddress(newFeeWallet)) {
      setError('Invalid wallet address format');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const gasEstimate = await contract.methods.setFeeWallet(newFeeWallet)
        .estimateGas({ from: account });
      
      const tx = await contract.methods.setFeeWallet(newFeeWallet)
        .send({ 
          from: account,
          gas: Math.floor(Number(gasEstimate) * 1.2)
        });
      
      setSuccess(`Fee wallet updated successfully! Tx: ${tx.transactionHash}`);
      setNewFeeWallet('');
      await fetchContractData();
    } catch (err: any) {
      console.error('Error updating fee wallet:', err);
      setError('Error updating fee wallet: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFee = async () => {
    if (!contract || !account || !newFeePercentage) return;
    
    const feeValue = parseInt(newFeePercentage);
    if (feeValue < 0 || feeValue > 10) {
      setError('Fee percentage must be between 0 and 10');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const gasEstimate = await contract.methods.updateFee(feeValue)
        .estimateGas({ from: account });
      
      const tx = await contract.methods.updateFee(feeValue)
        .send({ 
          from: account,
          gas: Math.floor(Number(gasEstimate) * 1.2)
        });
      
      setSuccess(`Fee percentage updated successfully! Tx: ${tx.transactionHash}`);
      setNewFeePercentage('');
      await fetchContractData();
    } catch (err: any) {
      console.error('Error updating fee:', err);
      setError('Error updating fee: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTransferOwnership = async () => {
    if (!contract || !account || !newOwner) return;
    
    // Validate address format
    if (!web3?.utils.isAddress(newOwner)) {
      setError('Invalid owner address format');
      return;
    }
    
    // Confirm action
    if (!window.confirm('Are you sure you want to transfer ownership? This action cannot be undone!')) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const gasEstimate = await contract.methods.transferOwnership(newOwner)
        .estimateGas({ from: account });
      
      const tx = await contract.methods.transferOwnership(newOwner)
        .send({ 
          from: account,
          gas: Math.floor(Number(gasEstimate) * 1.2)
        });
      
      setSuccess(`Ownership transferred successfully! Tx: ${tx.transactionHash}`);
      setNewOwner('');
      await fetchContractData();
    } catch (err: any) {
      console.error('Error transferring ownership:', err);
      setError('Error transferring ownership: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRenounceOwnership = async () => {
    if (!contract || !account) return;
    
    // Double confirmation for this critical action
    if (!window.confirm('⚠️ WARNING: This will permanently renounce ownership of the contract. No one will be able to manage it anymore. Are you absolutely sure?')) {
      return;
    }
    
    if (!window.confirm('This action is IRREVERSIBLE. Type "RENOUNCE" in the next dialog to confirm.')) {
      return;
    }
    
    const confirmation = window.prompt('Type "RENOUNCE" to confirm ownership renunciation:');
    if (confirmation !== 'RENOUNCE') {
      setError('Ownership renunciation cancelled - incorrect confirmation');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const gasEstimate = await contract.methods.renounceOwnership()
        .estimateGas({ from: account });
      
      const tx = await contract.methods.renounceOwnership()
        .send({ 
          from: account,
          gas: Math.floor(Number(gasEstimate) * 1.2)
        });
      
      setSuccess(`Ownership renounced successfully! Tx: ${tx.transactionHash}`);
      await fetchContractData();
    } catch (err: any) {
      console.error('Error renouncing ownership:', err);
      setError('Error renouncing ownership: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Access control
  if (!isConnected) {
    return (
      <div className="text-center py-20">
        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-12 max-w-md mx-auto">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-gray-300">Please connect your wallet to access the admin panel.</p>
        </div>
      </div>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <div className="text-center py-20">
        <div className="bg-red-500/20 border border-red-500/50 rounded-2xl p-12 max-w-md mx-auto">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">Wrong Network</h2>
          <p className="text-red-300">Please switch to Core Blockchain to access the admin panel.</p>
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="text-center py-20">
        <div className="bg-orange-500/20 border border-orange-500/50 rounded-2xl p-12 max-w-md mx-auto">
          <Lock className="w-16 h-16 text-orange-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
          <p className="text-orange-300">Admin panel is only available for the contract owner.</p>
          <div className="mt-6 p-4 bg-slate-800/50 rounded-xl">
            <p className="text-gray-400 text-sm">
              Current Owner: <span className="text-white font-mono">{contractData.owner}</span>
            </p>
            <p className="text-gray-400 text-sm">
              Your Address: <span className="text-white font-mono">{account}</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'rewards', label: 'Rewards', icon: Award },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'ownership', label: 'Ownership', icon: Crown }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center items-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-2xl">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div className="flex items-center space-x-2">
            <Crown className="w-6 h-6 text-yellow-400" />
            <span className="text-yellow-400 font-bold">ADMIN ACCESS</span>
          </div>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 via-orange-500 to-yellow-500 bg-clip-text text-transparent mb-4">
          Contract Administration
        </h1>
        <p className="text-gray-300 text-lg">Manage the Rock Paper Scissors Arena smart contract</p>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl flex items-center space-x-3">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-xl flex items-center space-x-3">
          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
          <p className="text-green-300">{success}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === id
                ? 'bg-red-600 text-white shadow-lg'
                : 'bg-slate-800/50 text-gray-300 hover:bg-slate-700/50'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Contract Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-lg border border-blue-500/30 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-blue-500/30 rounded-xl flex items-center justify-center">
                  <Coins className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-blue-400 text-sm font-medium">Reward Pool</p>
                  <p className="text-2xl font-bold text-white">
                    {parseFloat(web3?.utils.fromWei(contractData.rewardPool, 'ether') || '0').toFixed(4)}
                  </p>
                  <p className="text-blue-300 text-xs">CORE</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Total Games</p>
                  <p className="text-2xl font-bold text-white">{contractData.totalGames}</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Total Players</p>
                  <p className="text-2xl font-bold text-white">{contractData.totalPlayers}</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Contract Balance</p>
                  <p className="text-2xl font-bold text-white">
                    {parseFloat(web3?.utils.fromWei(contractData.contractBalance, 'ether') || '0').toFixed(4)}
                  </p>
                  <p className="text-gray-400 text-xs">CORE</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contract Info */}
          <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
              <Eye className="w-6 h-6 text-blue-400" />
              <span>Contract Information</span>
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-xl">
                  <span className="text-gray-400">Contract Address:</span>
                  <span className="text-white font-mono text-sm break-all">
                    {contract?.options.address}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-xl">
                  <span className="text-gray-400">Owner:</span>
                  <span className="text-white font-mono text-sm break-all">
                    {contractData.owner}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-xl">
                  <span className="text-gray-400">Fee Wallet:</span>
                  <span className="text-white font-mono text-sm break-all">
                    {contractData.feeWallet}
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-xl">
                  <span className="text-gray-400">Fee Percentage:</span>
                  <span className="text-white font-bold">{contractData.feePercentage}%</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-xl">
                  <span className="text-gray-400">Network:</span>
                  <span className="text-white">Core Blockchain (1116)</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-xl">
                  <span className="text-gray-400">Status:</span>
                  <span className="text-green-400 font-bold flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4" />
                    <span>Active</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'rewards' && (
        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
            <Award className="w-6 h-6 text-yellow-400" />
            <span>Reward Pool Management</span>
          </h2>
          
          <div className="mb-6 p-6 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Current Reward Pool</h3>
                <p className="text-3xl font-bold text-yellow-400">
                  {parseFloat(web3?.utils.fromWei(contractData.rewardPool, 'ether') || '0').toFixed(4)} CORE
                </p>
                <p className="text-gray-300 text-sm mt-2">
                  Available for monthly distribution to top players
                </p>
              </div>
              <div className="text-center">
                <button
                  onClick={handleDistributeRewards}
                  disabled={loading || parseFloat(contractData.rewardPool) <= 0}
                  className="group relative overflow-hidden px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-xl font-medium transition-all disabled:cursor-not-allowed hover:scale-105 shadow-lg"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
                  <div className="relative flex items-center space-x-2">
                    {loading ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <Zap className="w-5 h-5" />
                    )}
                    <span>{loading ? 'Distributing...' : 'Distribute Rewards'}</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
            <h4 className="text-lg font-bold text-white mb-4">Distribution Rules</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="text-blue-400 font-medium mb-2">Monthly Rewards</h5>
                <ul className="space-y-1 text-gray-300">
                  <li>• 1st Place: 40% of pool</li>
                  <li>• 2nd Place: 30% of pool</li>
                  <li>• 3rd Place: 15% of pool</li>
                  <li>• 4th Place: 10% of pool</li>
                  <li>• 5th Place: 5% of pool</li>
                </ul>
              </div>
              <div>
                <h5 className="text-blue-400 font-medium mb-2">Requirements</h5>
                <ul className="space-y-1 text-gray-300">
                  <li>• Minimum 5 eligible players</li>
                  <li>• Based on monthly score</li>
                  <li>• Automatic distribution</li>
                  <li>• Resets monthly rankings</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-8">
          {/* Fee Wallet Management */}
          <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
              <Wallet className="w-6 h-6 text-green-400" />
              <span>Fee Wallet Management</span>
            </h2>
            
            <div className="mb-6 p-4 bg-slate-700/30 rounded-xl">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Current Fee Wallet:</span>
                <span className="text-white font-mono text-sm break-all">
                  {contractData.feeWallet}
                </span>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <input
                type="text"
                value={newFeeWallet}
                onChange={(e) => setNewFeeWallet(e.target.value)}
                placeholder="New fee wallet address (0x...)"
                className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button
                onClick={handleUpdateFeeWallet}
                disabled={loading || !newFeeWallet}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-lg font-medium transition-all disabled:cursor-not-allowed"
              >
                {loading ? 'Updating...' : 'Update Wallet'}
              </button>
            </div>
          </div>

          {/* Fee Percentage Management */}
          <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
              <DollarSign className="w-6 h-6 text-blue-400" />
              <span>Fee Percentage Management</span>
            </h2>
            
            <div className="mb-6 p-4 bg-slate-700/30 rounded-xl">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Current Fee Percentage:</span>
                <span className="text-white font-bold text-xl">{contractData.feePercentage}%</span>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <input
                type="number"
                value={newFeePercentage}
                onChange={(e) => setNewFeePercentage(e.target.value)}
                placeholder="New fee percentage (0-10)"
                min="0"
                max="10"
                className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleUpdateFee}
                disabled={loading || !newFeePercentage}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-lg font-medium transition-all disabled:cursor-not-allowed"
              >
                {loading ? 'Updating...' : 'Update Fee'}
              </button>
            </div>
            
            <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
              <p className="text-yellow-300 text-sm">
                ⚠️ Fee percentage must be between 0% and 10%. Changes affect all future games.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ownership' && (
        <div className="space-y-8">
          {/* Transfer Ownership */}
          <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
              <UserCheck className="w-6 h-6 text-purple-400" />
              <span>Transfer Ownership</span>
            </h2>
            
            <div className="mb-6 p-4 bg-slate-700/30 rounded-xl">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Current Owner:</span>
                <span className="text-white font-mono text-sm break-all">
                  {contractData.owner}
                </span>
              </div>
            </div>
            
            <div className="flex space-x-4 mb-4">
              <input
                type="text"
                value={newOwner}
                onChange={(e) => setNewOwner(e.target.value)}
                placeholder="New owner address (0x...)"
                className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                onClick={handleTransferOwnership}
                disabled={loading || !newOwner}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-lg font-medium transition-all disabled:cursor-not-allowed"
              >
                {loading ? 'Transferring...' : 'Transfer Ownership'}
              </button>
            </div>
            
            <div className="p-3 bg-orange-500/20 border border-orange-500/50 rounded-lg">
              <p className="text-orange-300 text-sm">
                ⚠️ Transferring ownership will give full control to the new address. This action cannot be undone!
              </p>
            </div>
          </div>

          {/* Renounce Ownership */}
          <div className="bg-red-500/20 border border-red-500/50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <span>Renounce Ownership</span>
            </h2>
            
            <div className="mb-6">
              <p className="text-red-300 mb-4">
                Renouncing ownership will permanently remove all administrative control over the contract. 
                No one will be able to manage fees, distribute rewards, or perform any admin functions.
              </p>
              <p className="text-red-400 font-bold">
                This action is IRREVERSIBLE and will make the contract completely autonomous.
              </p>
            </div>
            
            <button
              onClick={handleRenounceOwnership}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-lg font-medium transition-all disabled:cursor-not-allowed"
            >
              {loading ? 'Renouncing...' : 'Renounce Ownership'}
            </button>
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <div className="text-center mt-8">
        <button
          onClick={fetchContractData}
          disabled={loading}
          className="flex items-center space-x-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 disabled:bg-gray-600 text-white rounded-xl font-medium transition-all mx-auto"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Refreshing...' : 'Refresh Data'}</span>
        </button>
      </div>
    </div>
  );
};

export default AdminPanel;