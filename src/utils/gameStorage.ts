// Utility functions for managing game data in localStorage

interface GameSecret {
  gameId: number;
  move: number;
  secret: string;
  moveHash: string;
  createdAt: number;
}

const STORAGE_KEY = 'rps_game_secrets';
const EXPIRY_DAYS = 30; // Secrets expire after 30 days

export const saveGameSecret = (gameId: number, move: number, secret: string, moveHash: string): void => {
  try {
    const existingSecrets = getStoredSecrets();
    
    const newSecret: GameSecret = {
      gameId,
      move,
      secret,
      moveHash,
      createdAt: Date.now()
    };
    
    // Remove any existing secret for this game
    const filteredSecrets = existingSecrets.filter(s => s.gameId !== gameId);
    
    // Add new secret
    filteredSecrets.push(newSecret);
    
    // Clean up expired secrets
    const validSecrets = filteredSecrets.filter(s => {
      const daysSinceCreated = (Date.now() - s.createdAt) / (1000 * 60 * 60 * 24);
      return daysSinceCreated < EXPIRY_DAYS;
    });
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(validSecrets));
  } catch (error) {
    console.error('Error saving game secret:', error);
  }
};

export const getGameSecret = (gameId: number): GameSecret | null => {
  try {
    const secrets = getStoredSecrets();
    return secrets.find(s => s.gameId === gameId) || null;
  } catch (error) {
    console.error('Error retrieving game secret:', error);
    return null;
  }
};

export const removeGameSecret = (gameId: number): void => {
  try {
    const existingSecrets = getStoredSecrets();
    const filteredSecrets = existingSecrets.filter(s => s.gameId !== gameId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredSecrets));
  } catch (error) {
    console.error('Error removing game secret:', error);
  }
};

export const getAllStoredSecrets = (): GameSecret[] => {
  return getStoredSecrets();
};

export const clearExpiredSecrets = (): void => {
  try {
    const secrets = getStoredSecrets();
    const validSecrets = secrets.filter(s => {
      const daysSinceCreated = (Date.now() - s.createdAt) / (1000 * 60 * 60 * 24);
      return daysSinceCreated < EXPIRY_DAYS;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(validSecrets));
  } catch (error) {
    console.error('Error clearing expired secrets:', error);
  }
};

const getStoredSecrets = (): GameSecret[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error parsing stored secrets:', error);
    return [];
  }
};

// Utility to check if we have a secret for a specific game
export const hasStoredSecret = (gameId: number): boolean => {
  const secret = getGameSecret(gameId);
  return secret !== null;
};

// Utility to get move name from number
export const getMoveText = (move: number): string => {
  switch (move) {
    case 1: return '🔥 Fuego';
    case 2: return '💧 Agua';
    case 3: return '🌿 Plantas';
    default: return 'Unknown';
  }
};