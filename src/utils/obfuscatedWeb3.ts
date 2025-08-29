// Obfuscated Web3 utilities to prevent easy reverse engineering
import { obfuscateString, deobfuscateString, OBFUSCATED_CONSTANTS, protectedExecution } from './protection';

// Obfuscated contract ABI - split and encoded
const _abi_part1 = 'W3siaW5wdXRzIjpbeyJpbnRlcm5hbFR5cGUiOiJhZGRyZXNzIiwibmFtZSI6Il9mZWVXYWxsZXQiLCJ0eXBlIjoiYWRkcmVzcyJ9XSwic3RhdGVNdXRhYmlsaXR5Ijoibm9ucGF5YWJsZSIsInR5cGUiOiJjb25zdHJ1Y3RvciJ9';
const _abi_part2 = 'LHsiYW5vbnltb3VzIjpmYWxzZSwiaW5wdXRzIjpbeyJpbmRleGVkIjp0cnVlLCJpbnRlcm5hbFR5cGUiOiJ1aW50MjU2IiwibmFtZSI6ImdhbWVJZCIsInR5cGUiOiJ1aW50MjU2In0seyJpbmRleGVkIjp0cnVlLCJpbnRlcm5hbFR5cGUiOiJhZGRyZXNzIiwibmFtZSI6ImNyZWF0b3IiLCJ0eXBlIjoiYWRkcmVzcyJ9XSwibmFtZSI6IkdhbWVDYW5jZWxlZCIsInR5cGUiOiJldmVudCJ9';

// Dynamic ABI reconstruction
const reconstructABI = (): any[] => {
  return protectedExecution(() => {
    try {
      const fullABI = _abi_part1 + _abi_part2;
      return JSON.parse(atob(fullABI));
    } catch {
      // Fallback to minimal ABI if reconstruction fails
      return [
        {
          "inputs": [{"internalType": "uint256", "name": "_gameId", "type": "uint256"}],
          "name": "getGame",
          "outputs": [{"components": [
            {"internalType": "address", "name": "creator", "type": "address"},
            {"internalType": "bytes32", "name": "creatorMoveHash", "type": "bytes32"},
            {"internalType": "enum RockPaperScissors.Move", "name": "creatorMove", "type": "uint8"},
            {"internalType": "address", "name": "opponent", "type": "address"},
            {"internalType": "enum RockPaperScissors.Move", "name": "opponentMove", "type": "uint8"},
            {"internalType": "uint256", "name": "betAmount", "type": "uint256"},
            {"internalType": "enum RockPaperScissors.GameStatus", "name": "status", "type": "uint8"},
            {"internalType": "address", "name": "winner", "type": "address"},
            {"internalType": "uint256", "name": "createdAt", "type": "uint256"},
            {"internalType": "uint256", "name": "revealDeadline", "type": "uint256"},
            {"internalType": "address", "name": "referrer", "type": "address"}
          ], "internalType": "struct RockPaperScissors.Game", "name": "", "type": "tuple"}],
          "stateMutability": "view",
          "type": "function"
        }
      ];
    }
  });
};

// Obfuscated network configuration
const getNetworkConfig = () => {
  return protectedExecution(() => ({
    chainId: deobfuscateString(OBFUSCATED_CONSTANTS.CORE_CHAIN_ID),
    chainName: obfuscateString('Core Blockchain Mainnet'),
    nativeCurrency: {
      name: 'CORE',
      symbol: 'CORE',
      decimals: 18,
    },
    rpcUrls: [deobfuscateString(OBFUSCATED_CONSTANTS.RPC_URL)],
    blockExplorerUrls: ['https://scan.coredao.org'],
  }));
};

// Obfuscated contract address getter
const getContractAddress = (): string => {
  return protectedExecution(() => {
    return deobfuscateString(OBFUSCATED_CONSTANTS.CONTRACT_ADDRESS);
  });
};

// Dynamic method name obfuscation for contract calls
const obfuscatedMethods = {
  [btoa('getGame')]: 'getGame',
  [btoa('createGame')]: 'createGame',
  [btoa('joinGame')]: 'joinGame',
  [btoa('revealMove')]: 'revealMove',
  [btoa('getPlayerStats')]: 'getPlayerStats',
  [btoa('getTopMonthlyPlayers')]: 'getTopMonthlyPlayers'
};

// Protected contract method caller
const callContractMethod = async (web3: any, contract: any, methodName: string, params: any[] = [], options: any = {}) => {
  return protectedExecution(async () => {
    const obfuscatedKey = btoa(methodName);
    const realMethodName = obfuscatedMethods[obfuscatedKey];
    
    if (!realMethodName) {
      throw new Error('Method not found');
    }
    
    if (options.send) {
      return await contract.methods[realMethodName](...params).send(options);
    } else {
      return await contract.methods[realMethodName](...params).call();
    }
  });
};

export {
  reconstructABI,
  getNetworkConfig,
  getContractAddress,
  callContractMethod,
  obfuscatedMethods
};