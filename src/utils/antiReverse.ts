// Advanced anti-reverse engineering techniques
// This file implements multiple layers of protection against code analysis

// Dynamic code generation to prevent static analysis
const generateDynamicCode = (template: string, variables: Record<string, any>): Function => {
  let code = template;
  
  // Replace variables with obfuscated values
  Object.entries(variables).forEach(([key, value]) => {
    const obfuscatedKey = btoa(key).replace(/[^a-zA-Z0-9]/g, '');
    code = code.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), JSON.stringify(value));
  });
  
  // Add random noise to confuse decompilers
  const noise = Array.from({length: 10}, () => 
    `var _${Math.random().toString(36).substring(2)} = ${Math.random()};`
  ).join('\n');
  
  return new Function(noise + '\n' + code);
};

// Polymorphic code - same functionality, different implementations
const polymorphicExecutor = (() => {
  const implementations = [
    // Implementation 1
    (func: Function, ...args: any[]) => {
      const result = func.apply(null, args);
      return result;
    },
    
    // Implementation 2
    (func: Function, ...args: any[]) => {
      return func(...args);
    },
    
    // Implementation 3
    (func: Function, ...args: any[]) => {
      const wrapper = (...params: any[]) => func(...params);
      return wrapper(...args);
    }
  ];
  
  return (func: Function, ...args: any[]) => {
    const impl = implementations[Math.floor(Math.random() * implementations.length)];
    return impl(func, ...args);
  };
})();

// Control flow flattening
const flattenControlFlow = (operations: Array<() => any>): any => {
  const shuffled = operations.sort(() => Math.random() - 0.5);
  const results: any[] = [];
  
  for (let i = 0; i < shuffled.length; i++) {
    const operation = shuffled[i];
    results.push(operation());
  }
  
  return results;
};

// String encryption with multiple layers
const encryptString = (str: string): string => {
  // Layer 1: Base64
  let encrypted = btoa(str);
  
  // Layer 2: Character shifting
  encrypted = encrypted.split('').map(char => 
    String.fromCharCode(char.charCodeAt(0) + 3)
  ).join('');
  
  // Layer 3: Reverse
  encrypted = encrypted.split('').reverse().join('');
  
  // Layer 4: Base64 again
  encrypted = btoa(encrypted);
  
  return encrypted;
};

const decryptString = (encrypted: string): string => {
  // Reverse Layer 4
  let decrypted = atob(encrypted);
  
  // Reverse Layer 3
  decrypted = decrypted.split('').reverse().join('');
  
  // Reverse Layer 2
  decrypted = decrypted.split('').map(char => 
    String.fromCharCode(char.charCodeAt(0) - 3)
  ).join('');
  
  // Reverse Layer 1
  decrypted = atob(decrypted);
  
  return decrypted;
};

// Virtual machine for critical operations
class SimpleVM {
  private stack: any[] = [];
  private memory: Map<string, any> = new Map();
  
  execute(bytecode: number[]): any {
    for (let i = 0; i < bytecode.length; i++) {
      const opcode = bytecode[i];
      
      switch (opcode) {
        case 0x01: // PUSH
          this.stack.push(bytecode[++i]);
          break;
        case 0x02: // POP
          this.stack.pop();
          break;
        case 0x03: // ADD
          const b = this.stack.pop();
          const a = this.stack.pop();
          this.stack.push(a + b);
          break;
        case 0x04: // STORE
          const value = this.stack.pop();
          const key = this.stack.pop();
          this.memory.set(key, value);
          break;
        case 0x05: // LOAD
          const loadKey = this.stack.pop();
          this.stack.push(this.memory.get(loadKey));
          break;
        case 0x06: // RETURN
          return this.stack.pop();
      }
    }
    
    return null;
  }
}

// Code mutation - change implementation while keeping functionality
const mutateCode = (originalFunction: Function): Function => {
  const mutations = [
    // Mutation 1: Add random variables
    (func: Function) => {
      return function(...args: any[]) {
        const _rand1 = Math.random();
        const _rand2 = Date.now();
        const _rand3 = Math.floor(Math.random() * 1000);
        return func.apply(this, args);
      };
    },
    
    // Mutation 2: Change execution order
    (func: Function) => {
      return function(...args: any[]) {
        const operations = [
          () => { const _temp = args.length; },
          () => { const _check = typeof args[0]; },
          () => func.apply(this, args)
        ];
        return flattenControlFlow(operations)[2];
      };
    },
    
    // Mutation 3: Add conditional branches
    (func: Function) => {
      return function(...args: any[]) {
        if (Math.random() > 0.5) {
          const _dummy = 'dummy';
        } else {
          const _other = 'other';
        }
        return func.apply(this, args);
      };
    }
  ];
  
  const mutation = mutations[Math.floor(Math.random() * mutations.length)];
  return mutation(originalFunction);
};

// Anti-debugging timing checks
const timingCheck = (): boolean => {
  const start = performance.now();
  
  // Dummy operations
  for (let i = 0; i < 1000; i++) {
    Math.random();
  }
  
  const end = performance.now();
  const duration = end - start;
  
  // If execution is too slow, debugger might be attached
  return duration < 100;
};

// Stack trace analysis
const analyzeStackTrace = (): boolean => {
  try {
    throw new Error('Stack trace check');
  } catch (e) {
    const stack = e.stack || '';
    
    // Check for debugging tools in stack trace
    const debuggerSignatures = [
      'chrome-extension',
      'devtools',
      'inspector',
      'debugger',
      'console',
      'eval'
    ];
    
    return !debuggerSignatures.some(sig => stack.includes(sig));
  }
};

// Memory usage monitoring
const monitorMemory = (): boolean => {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    const ratio = memory.usedJSHeapSize / memory.totalJSHeapSize;
    
    // Unusual memory patterns might indicate debugging
    return ratio < 0.8;
  }
  
  return true;
};

// Comprehensive protection check
const runProtectionChecks = (): boolean => {
  const checks = [
    timingCheck,
    analyzeStackTrace,
    monitorMemory
  ];
  
  return checks.every(check => {
    try {
      return check();
    } catch {
      return false;
    }
  });
};

export {
  generateDynamicCode,
  polymorphicExecutor,
  flattenControlFlow,
  encryptString,
  decryptString,
  SimpleVM,
  mutateCode,
  runProtectionChecks
};

// Initialize protection on module load
if (typeof window !== 'undefined') {
  // Run protection checks periodically
  setInterval(() => {
    if (!runProtectionChecks()) {
      // Detected debugging attempt
      window.location.href = 'about:blank';
    }
  }, 5000);
}