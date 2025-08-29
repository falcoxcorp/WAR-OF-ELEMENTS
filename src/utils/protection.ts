// Advanced code protection and obfuscation utilities
// This file implements multiple layers of protection against code theft

// Dynamic import obfuscation
const _0x1a2b = ['web3', 'contract', 'methods', 'call', 'send'];
const _0x3c4d = (index: number) => _0x1a2b[index];

// Anti-debugging protection
const antiDebug = () => {
  let devtools = {open: false, orientation: null};
  const threshold = 160;
  
  setInterval(() => {
    if (window.outerHeight - window.innerHeight > threshold || 
        window.outerWidth - window.innerWidth > threshold) {
      if (!devtools.open) {
        devtools.open = true;
        // Redirect or break functionality when devtools detected
        window.location.href = 'about:blank';
      }
    } else {
      devtools.open = false;
    }
  }, 500);
};

// Code integrity check
const integrityCheck = () => {
  const scripts = document.getElementsByTagName('script');
  let expectedHashes = ['sha256-abc123', 'sha256-def456']; // Add real hashes
  
  for (let script of scripts) {
    if (script.src && !script.integrity) {
      console.error('Unauthorized script detected');
      return false;
    }
  }
  return true;
};

// Environment detection
const detectEnvironment = () => {
  const isDev = process.env.NODE_ENV === 'development';
  const isLocalhost = window.location.hostname === 'localhost';
  const hasDevTools = window.devtools?.open;
  
  if (!isDev && (isLocalhost || hasDevTools)) {
    // Obfuscate critical functionality in production
    return false;
  }
  return true;
};

// Dynamic function name obfuscation
const createObfuscatedFunction = (originalFunction: Function, name: string) => {
  const obfuscatedName = btoa(name).replace(/[^a-zA-Z]/g, '');
  return {
    [obfuscatedName]: originalFunction
  }[obfuscatedName];
};

// String obfuscation
const obfuscateString = (str: string): string => {
  return btoa(encodeURIComponent(str));
};

const deobfuscateString = (str: string): string => {
  return decodeURIComponent(atob(str));
};

// Critical constants obfuscation
const OBFUSCATED_CONSTANTS = {
  CONTRACT_ADDRESS: obfuscateString('0x3007582C0E80Fc9e381d7A1Eb198c72B0d1C3697'),
  CORE_CHAIN_ID: obfuscateString('1116'),
  RPC_URL: obfuscateString('https://rpc-core.icecreamswap.com'),
  API_BASE: obfuscateString('/api')
};

// Dynamic method name generation
const generateMethodName = (base: string): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2);
  return `${base}_${timestamp}_${random}`;
};

// Code execution protection
const protectedExecution = (callback: Function, context?: any) => {
  if (!detectEnvironment() || !integrityCheck()) {
    throw new Error('Execution environment not authorized');
  }
  
  try {
    return callback.call(context);
  } catch (error) {
    console.error('Protected execution failed:', error);
    throw error;
  }
};

// Export obfuscated utilities
export {
  antiDebug,
  integrityCheck,
  detectEnvironment,
  createObfuscatedFunction,
  obfuscateString,
  deobfuscateString,
  OBFUSCATED_CONSTANTS,
  generateMethodName,
  protectedExecution
};

// Initialize protection on module load
if (typeof window !== 'undefined') {
  antiDebug();
  
  // Disable common debugging methods
  window.console.log = () => {};
  window.console.warn = () => {};
  window.console.error = () => {};
  
  // Prevent source viewing
  document.addEventListener('keydown', (e) => {
    if (e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.shiftKey && e.key === 'C') ||
        (e.ctrlKey && e.key === 'U')) {
      e.preventDefault();
      return false;
    }
  });
  
  // Disable right-click context menu
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
  });
  
  // Disable text selection
  document.addEventListener('selectstart', (e) => {
    e.preventDefault();
    return false;
  });
}