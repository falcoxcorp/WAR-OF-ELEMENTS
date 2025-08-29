import React from 'react';
import { Shield, FileCheck, ExternalLink, CheckCircle, AlertTriangle, Info, Download, Eye, Lock, Zap, Users, Trophy } from 'lucide-react';

const Audit = () => {
  // Real contract data - ready for actual audit information
  const auditData = {
    contractAddress: '0x3007582C0E80Fc9e381d7A1Eb198c72B0d1C3697',
    auditFirm: 'Pending Professional Audit',
    auditDate: 'Q1 2025 (Scheduled)',
    auditScore: 'Pending Completion',
    reportUrl: '#',
    findings: {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      informational: 0
    },
    status: 'pending' // 'completed', 'in-progress', 'pending'
  };

  const securityFeatures = [
    {
      icon: Shield,
      title: 'Commit-Reveal Scheme',
      description: 'Cryptographic commitment ensures fair play by hiding moves until reveal phase. Uses keccak256 hashing for secure move commitments.',
      status: 'implemented',
      technical: 'SHA3 (keccak256) hashing with salt'
    },
    {
      icon: Lock,
      title: 'Secure Random Generation',
      description: 'Uses blockchain-based randomness and block timestamps for unpredictable game outcomes',
      status: 'implemented',
      technical: 'Block hash + timestamp entropy'
    },
    {
      icon: Zap,
      title: 'Gas Optimization',
      description: 'Optimized smart contract functions to minimize transaction costs with efficient storage patterns',
      status: 'implemented',
      technical: 'Packed structs, minimal storage writes'
    },
    {
      icon: Users,
      title: 'Access Control',
      description: 'Role-based permissions with owner-only administrative functions using OpenZeppelin patterns',
      status: 'implemented',
      technical: 'Ownable pattern with modifiers'
    },
    {
      icon: Trophy,
      title: 'Automated Reward Distribution',
      description: 'Transparent and automated reward distribution system with monthly leaderboard resets',
      status: 'implemented',
      technical: 'Event-driven distribution logic'
    },
    {
      icon: FileCheck,
      title: 'Code Verification',
      description: 'Contract source code verified on Core blockchain explorer with full transparency',
      status: 'implemented',
      technical: 'Verified on scan.coredao.org'
    }
  ];

  const contractSpecs = {
    compiler: 'Solidity ^0.8.19',
    optimization: 'Enabled (200 runs)',
    license: 'MIT',
    network: 'Core Blockchain Mainnet',
    chainId: '1116',
    deploymentDate: 'December 2024',
    totalFunctions: '15+ public functions',
    gasOptimized: 'Yes',
    upgradeability: 'Non-upgradeable (Immutable)',
    pausable: 'Owner-controlled emergency functions'
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'in-progress': return 'text-yellow-400';
      case 'pending': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5" />;
      case 'in-progress': return <AlertTriangle className="w-5 h-5" />;
      case 'pending': return <Info className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Enhanced Header */}
      <div className="text-center mb-12 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 via-blue-600/20 to-green-600/20 rounded-3xl blur-3xl"></div>
        <div className="relative">
          <div className="flex justify-center items-center space-x-4 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl animate-pulse-ring">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <div className="flex items-center space-x-2">
              {[...Array(5)].map((_, i) => (
                <CheckCircle key={i} className="w-6 h-6 text-green-400 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
          </div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-green-400 via-blue-500 to-green-400 bg-clip-text text-transparent mb-4">
            Security Audit & Verification
          </h1>
          <p className="text-xl text-gray-300 mb-4">Smart Contract Security Analysis & Code Verification</p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <span>Contract:</span>
              <code className="bg-slate-800 px-2 py-1 rounded text-green-400 font-mono">
                {auditData.contractAddress}
              </code>
            </div>
            <span className="hidden sm:inline">•</span>
            <span>Binance Smart Chain Mainnet (Chain ID: 56)</span>
          </div>
        </div>
      </div>

      {/* Enhanced Audit Status Card */}
      <div className="mb-8 p-8 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 animate-shimmer"></div>
        <div className="relative">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6">
            <div className="flex items-center space-x-4 mb-4 lg:mb-0">
              <div className={`w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg`}>
                {getStatusIcon(auditData.status)}
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">Professional Security Audit</h2>
                <p className={`${getStatusColor(auditData.status)} font-medium text-lg capitalize flex items-center space-x-2`}>
                  {getStatusIcon(auditData.status)}
                  <span>{auditData.status === 'pending' ? 'Comprehensive Audit Scheduled' : auditData.status}</span>
                </p>
              </div>
            </div>
            
            {auditData.status === 'completed' && (
              <div className="flex space-x-3">
                <button className="group relative overflow-hidden flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-medium transition-all hover:scale-105 shadow-lg">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
                  <div className="relative flex items-center space-x-2">
                    <Eye className="w-4 h-4" />
                    <span>View Full Report</span>
                  </div>
                </button>
                <button className="group relative overflow-hidden flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-medium transition-all hover:scale-105 shadow-lg">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
                  <div className="relative flex items-center space-x-2">
                    <Download className="w-4 h-4" />
                    <span>Download PDF</span>
                  </div>
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl">
              <p className="text-blue-400 text-sm font-medium">Audit Firm</p>
              <p className="text-white font-bold text-lg mt-2">{auditData.auditFirm}</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl">
              <p className="text-purple-400 text-sm font-medium">Target Date</p>
              <p className="text-white font-bold text-lg mt-2">{auditData.auditDate}</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl">
              <p className="text-green-400 text-sm font-medium">Security Score</p>
              <p className="text-white font-bold text-lg mt-2">{auditData.auditScore}</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-xl">
              <p className="text-orange-400 text-sm font-medium">Status</p>
              <p className={`${getStatusColor(auditData.status)} font-bold text-lg capitalize mt-2`}>
                {auditData.status}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Security Features */}
      <div className="mb-12">
        <h2 className="text-4xl font-bold text-white mb-8 text-center">Implemented Security Features</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {securityFeatures.map((feature, index) => (
            <div key={index} className="group relative overflow-hidden bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6 hover-lift transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
              <div className="relative">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-green-400" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-bold text-white">{feature.title}</h3>
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  </div>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-3">{feature.description}</p>
                <div className="flex items-center space-x-2 text-xs">
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full">
                    {feature.technical}
                  </span>
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full">
                    ✓ Active
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contract Specifications */}
      <div className="mb-12 bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-white mb-8 flex items-center space-x-2">
          <FileCheck className="w-8 h-8 text-blue-400" />
          <span>Contract Specifications</span>
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(contractSpecs).map(([key, value], index) => (
            <div key={index} className="p-4 bg-slate-700/30 rounded-xl hover:bg-slate-600/30 transition-all">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                <span className="text-white font-medium text-right">{value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Contract Verification */}
      <div className="mb-12 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-lg border border-blue-500/30 rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-white mb-8 flex items-center space-x-2">
          <CheckCircle className="w-8 h-8 text-green-400" />
          <span>Contract Verification & Transparency</span>
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-6">Verification Status</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-slate-700/30 rounded-xl">
                <span className="text-gray-400">Contract Address:</span>
                <code className="text-green-400 font-mono text-sm break-all bg-slate-800 px-2 py-1 rounded">
                  {auditData.contractAddress}
                </code>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-700/30 rounded-xl">
                <span className="text-gray-400">Compiler Version:</span>
                <span className="text-white font-medium">{contractSpecs.compiler}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-700/30 rounded-xl">
                <span className="text-gray-400">Optimization:</span>
                <span className="text-green-400 flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4" />
                  <span>{contractSpecs.optimization}</span>
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-700/30 rounded-xl">
                <span className="text-gray-400">Source Code:</span>
                <span className="text-green-400 flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4" />
                  <span>Verified & Public</span>
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-700/30 rounded-xl">
                <span className="text-gray-400">License:</span>
                <span className="text-blue-400">{contractSpecs.license}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-white mb-6">External Resources</h3>
            <div className="space-y-4">
              <a
                href={`https://scan.coredao.org/address/${auditData.contractAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between p-4 bg-slate-700/30 hover:bg-slate-600/30 rounded-xl transition-all"
              >
                <div className="flex items-center space-x-3">
                  <img 
                    src="https://photos.pinksale.finance/file/pinksale-logo-upload/1756454447056-1fba9df7cd0639fc2d1b4bfcbc37a6bb.png" 
                    alt="Core" 
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-gray-300 group-hover:text-white">Core Blockchain Explorer</span>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-white" />
              </a>
              <a
                href="#"
                className="group flex items-center justify-between p-4 bg-slate-700/30 hover:bg-slate-600/30 rounded-xl transition-all"
              >
                <div className="flex items-center space-x-3">
                  <FileCheck className="w-6 h-6 text-blue-400" />
                  <span className="text-gray-300 group-hover:text-white">Source Code Repository</span>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-white" />
              </a>
              <a
                href="#"
                className="group flex items-center justify-between p-4 bg-slate-700/30 hover:bg-slate-600/30 rounded-xl transition-all"
              >
                <div className="flex items-center space-x-3">
                  <Shield className="w-6 h-6 text-purple-400" />
                  <span className="text-gray-300 group-hover:text-white">Technical Documentation</span>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-white" />
              </a>
              <a
                href="#"
                className="group flex items-center justify-between p-4 bg-slate-700/30 hover:bg-slate-600/30 rounded-xl transition-all"
              >
                <div className="flex items-center space-x-3">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                  <span className="text-gray-300 group-hover:text-white">Whitepaper & Tokenomics</span>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-white" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Findings (when available) */}
      {auditData.status === 'completed' && (
        <div className="mb-12 bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center space-x-2">
            <FileCheck className="w-8 h-8 text-blue-400" />
            <span>Detailed Audit Findings</span>
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="text-center p-6 bg-red-500/20 border border-red-500/50 rounded-xl">
              <p className="text-red-400 text-3xl font-bold">{auditData.findings.critical}</p>
              <p className="text-red-300 text-sm font-medium">Critical</p>
              <p className="text-red-200 text-xs mt-1">Immediate fix required</p>
            </div>
            <div className="text-center p-6 bg-orange-500/20 border border-orange-500/50 rounded-xl">
              <p className="text-orange-400 text-3xl font-bold">{auditData.findings.high}</p>
              <p className="text-orange-300 text-sm font-medium">High</p>
              <p className="text-orange-200 text-xs mt-1">Priority fix needed</p>
            </div>
            <div className="text-center p-6 bg-yellow-500/20 border border-yellow-500/50 rounded-xl">
              <p className="text-yellow-400 text-3xl font-bold">{auditData.findings.medium}</p>
              <p className="text-yellow-300 text-sm font-medium">Medium</p>
              <p className="text-yellow-200 text-xs mt-1">Should be addressed</p>
            </div>
            <div className="text-center p-6 bg-blue-500/20 border border-blue-500/50 rounded-xl">
              <p className="text-blue-400 text-3xl font-bold">{auditData.findings.low}</p>
              <p className="text-blue-300 text-sm font-medium">Low</p>
              <p className="text-blue-200 text-xs mt-1">Minor improvements</p>
            </div>
            <div className="text-center p-6 bg-gray-500/20 border border-gray-500/50 rounded-xl">
              <p className="text-gray-400 text-3xl font-bold">{auditData.findings.informational}</p>
              <p className="text-gray-300 text-sm font-medium">Informational</p>
              <p className="text-gray-200 text-xs mt-1">Best practices</p>
            </div>
          </div>
          
          <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <h3 className="text-xl font-bold text-white">Overall Security Assessment</h3>
            </div>
            <p className="text-green-300 text-lg">
              All critical and high-priority issues have been resolved. The smart contract demonstrates 
              strong security practices and is ready for production deployment.
            </p>
          </div>
        </div>
      )}

      {/* Enhanced Pending Audit Notice */}
      {auditData.status === 'pending' && (
        <div className="text-center bg-gradient-to-br from-orange-500/20 to-yellow-500/20 border border-orange-500/50 rounded-2xl p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 animate-shimmer"></div>
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse-ring">
              <AlertTriangle className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-6">Professional Security Audit Scheduled</h2>
            <p className="text-orange-300 mb-8 max-w-3xl mx-auto text-lg leading-relaxed">
              Our smart contract is scheduled for a comprehensive security audit by leading blockchain security experts. 
              The audit will cover all aspects of the contract including security vulnerabilities, gas optimization, 
              and best practices compliance. The complete audit report will be published here upon completion.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="p-6 bg-slate-800/50 rounded-xl">
                <Shield className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white mb-2">Security Analysis</h3>
                <p className="text-gray-300 text-sm">BSC-optimized security assessment and testing</p>
              </div>
              <div className="p-6 bg-slate-800/50 rounded-xl">
                <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white mb-2">Gas Optimization</h3>
                <p className="text-gray-300 text-sm">BSC gas optimization and efficiency analysis</p>
              </div>
              <div className="p-6 bg-slate-800/50 rounded-xl">
                <FileCheck className="w-8 h-8 text-green-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white mb-2">Best Practices</h3>
                <p className="text-gray-300 text-sm">Compliance with industry standards and security guidelines</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="group relative overflow-hidden px-8 py-4 bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
                <div className="relative">Get Notified When Complete</div>
              </button>
              <a
                href={`https://scan.coredao.org/address/${auditData.contractAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden px-8 py-4 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-xl font-bold text-lg transition-all hover:scale-105 border border-slate-600/50 hover:border-slate-500/50 flex items-center space-x-2"
              >
                <span>View Contract on Explorer</span>
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Security Best Practices */}
      <div className="mt-16 bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">Security Best Practices & Guidelines</h2>
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
              <Users className="w-6 h-6 text-blue-400" />
              <span>For Players & Users</span>
            </h3>
            <ul className="space-y-4 text-gray-300">
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-white">Verify Website Authenticity</span>
                  <p className="text-sm text-gray-400 mt-1">Always check the URL and SSL certificate before connecting your wallet</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-white">Protect Private Keys</span>
                  <p className="text-sm text-gray-400 mt-1">Never share your private keys, seed phrases, or wallet passwords with anyone</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-white">Use Hardware Wallets</span>
                  <p className="text-sm text-gray-400 mt-1">For large amounts, consider using hardware wallets for enhanced security</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-white">Review Transactions</span>
                  <p className="text-sm text-gray-400 mt-1">Always double-check transaction details before signing</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-white">Keep Software Updated</span>
                  <p className="text-sm text-gray-400 mt-1">Regularly update your wallet software and browser</p>
                </div>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
              <Shield className="w-6 h-6 text-green-400" />
              <span>Smart Contract Security</span>
            </h3>
            <ul className="space-y-4 text-gray-300">
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-white">Reentrancy Protection</span>
                  <p className="text-sm text-gray-400 mt-1">Implemented checks-effects-interactions pattern and reentrancy guards</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-white">Integer Overflow Protection</span>
                  <p className="text-sm text-gray-400 mt-1">Using Solidity 0.8+ built-in overflow/underflow protection</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-white">Access Control</span>
                  <p className="text-sm text-gray-400 mt-1">Proper permission management with role-based access control</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-white">Input Validation</span>
                  <p className="text-sm text-gray-400 mt-1">Comprehensive validation of all user inputs and parameters</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-white">Emergency Controls</span>
                  <p className="text-sm text-gray-400 mt-1">Owner-controlled emergency functions for critical situations</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 p-6 bg-blue-500/20 border border-blue-500/50 rounded-xl">
          <div className="flex items-center space-x-3 mb-4">
            <Info className="w-6 h-6 text-blue-400" />
            <h4 className="text-lg font-bold text-white">Security Reporting</h4>
          </div>
          <p className="text-blue-300">
            If you discover any security vulnerabilities or have concerns about the smart contract, 
            please report them responsibly through our official channels. We take security seriously 
            and appreciate the community's help in maintaining a safe gaming environment.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Audit;