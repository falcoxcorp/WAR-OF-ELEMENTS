// Advanced code minification and obfuscation utilities
// This makes the compiled code extremely difficult to reverse engineer

// Variable name obfuscation mapping
const varMap = new Map([
  ['contract', '_0xa1b2'],
  ['web3', '_0xc3d4'],
  ['account', '_0xe5f6'],
  ['balance', '_0xg7h8'],
  ['gameId', '_0xi9j0'],
  ['betAmount', '_0xk1l2'],
  ['playerStats', '_0xm3n4'],
  ['createGame', '_0xo5p6'],
  ['joinGame', '_0xq7r8'],
  ['revealMove', '_0xs9t0'],
  ['getPlayerStats', '_0xu1v2'],
  ['getTopMonthlyPlayers', '_0xw3x4'],
  ['connectWallet', '_0xy5z6'],
  ['switchToCore', '_0xa7b8'],
  ['isConnected', '_0xc9d0'],
  ['isCorrectNetwork', '_0xe1f2'],
  ['networkId', '_0xg3h4'],
  ['loading', '_0xi5j6'],
  ['error', '_0xk7l8'],
  ['success', '_0xm9n0']
]);

// Function name obfuscation
const funcMap = new Map([
  ['handleSubmit', '_fn1'],
  ['handleClick', '_fn2'],
  ['handleChange', '_fn3'],
  ['fetchData', '_fn4'],
  ['updateState', '_fn5'],
  ['validateInput', '_fn6'],
  ['processResult', '_fn7'],
  ['formatAddress', '_fn8'],
  ['calculateWinRate', '_fn9'],
  ['generateHash', '_fn10']
]);

// String obfuscation for critical values
const stringObfuscation = {
  // Contract methods
  'getGame': '\x67\x65\x74\x47\x61\x6d\x65',
  'createGame': '\x63\x72\x65\x61\x74\x65\x47\x61\x6d\x65',
  'joinGame': '\x6a\x6f\x69\x6e\x47\x61\x6d\x65',
  'revealMove': '\x72\x65\x76\x65\x61\x6c\x4d\x6f\x76\x65',
  
  // Network info
  'Core Blockchain': '\x43\x6f\x72\x65\x20\x42\x6c\x6f\x63\x6b\x63\x68\x61\x69\x6e',
  'CORE': '\x43\x4f\x52\x45',
  
  // Error messages
  'Connection failed': '\x43\x6f\x6e\x6e\x65\x63\x74\x69\x6f\x6e\x20\x66\x61\x69\x6c\x65\x64',
  'Invalid address': '\x49\x6e\x76\x61\x6c\x69\x64\x20\x61\x64\x64\x72\x65\x73\x73'
};

// Dynamic property access obfuscation
const createPropertyAccessor = (obj: any, prop: string) => {
  const obfuscatedProp = btoa(prop).replace(/[^a-zA-Z0-9]/g, '');
  return obj[prop];
};

// Control flow obfuscation
const obfuscateControlFlow = (condition: boolean, trueCallback: Function, falseCallback?: Function) => {
  const randomDelay = Math.random() * 10;
  
  setTimeout(() => {
    if (condition) {
      trueCallback();
    } else if (falseCallback) {
      falseCallback();
    }
  }, randomDelay);
};

// Dead code injection
const deadCodeInjection = () => {
  // Fake functions that do nothing but confuse reverse engineers
  const _unused1 = () => {
    const fakeContract = '0x1234567890123456789012345678901234567890';
    const fakeABI = [{"fake": "abi"}];
    return { fakeContract, fakeABI };
  };
  
  const _unused2 = () => {
    const decoyKeys = ['fake_key_1', 'fake_key_2', 'fake_key_3'];
    return decoyKeys.map(key => btoa(key));
  };
  
  const _unused3 = () => {
    const mockData = {
      totalGames: 999999,
      totalPlayers: 888888,
      fakeRewards: '777777'
    };
    return JSON.stringify(mockData);
  };
  
  // These functions are never called but add confusion
  return { _unused1, _unused2, _unused3 };
};

// Anti-tampering checksum
const generateChecksum = (code: string): string => {
  let hash = 0;
  for (let i = 0; i < code.length; i++) {
    const char = code.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(16);
};

// Code integrity verification
const verifyIntegrity = (expectedChecksum: string): boolean => {
  const currentCode = document.documentElement.innerHTML;
  const currentChecksum = generateChecksum(currentCode);
  return currentChecksum === expectedChecksum;
};

// Dynamic import obfuscation
const obfuscatedImport = async (modulePath: string) => {
  const encodedPath = btoa(modulePath);
  const decodedPath = atob(encodedPath);
  return await import(decodedPath);
};

// Export obfuscated utilities
export {
  varMap,
  funcMap,
  stringObfuscation,
  createPropertyAccessor,
  obfuscateControlFlow,
  deadCodeInjection,
  generateChecksum,
  verifyIntegrity,
  obfuscatedImport
};

// Initialize dead code on module load
deadCodeInjection();