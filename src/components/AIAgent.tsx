import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Sparkles, Zap, Shield, Trophy, Target, Coins, Crown, Star, Loader2, ChevronDown, Volume2, VolumeX, Minimize2, Maximize2 } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

const AIAgent: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "🎮 Welcome to Guerra de Elementos Arena! I'm your AI gaming assistant. I can help you understand the game mechanics, reveal strategies, leaderboard systems, and everything about our Core Blockchain gaming platform. What would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const playNotificationSound = () => {
    if (soundEnabled) {
      // Create a simple notification sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    }
  };

  const getAIResponse = async (userMessage: string): Promise<string> => {
    const API_KEY = 'sk-91d6c1d647f8422f8c54f14dc22d499f';
    
    const gameKnowledge = `
    You are an AI assistant for OMDB Arena, a Guerra de Elementos gaming platform built on Core Blockchain by OMDB. Here's comprehensive knowledge about the game:

    GAME MECHANICS:
    - Classic Guerra de Elementos rules: Fuego beats Plantas, Agua beats Fuego, Plantas beats Agua
    - Commit-Reveal scheme for fair play: players commit their move with a cryptographic hash, then reveal after both players have committed
    - Players can create games with custom bet amounts in CORE tokens
    - Games have a 24-hour reveal deadline after an opponent joins
    - If creator doesn't reveal in time, opponent can claim victory

    GAME FLOW:
    1. Create Game: Choose move + secret phrase → Generate hash → Set bet amount → Create game
    2. Join Game: Opponent sees open game → Chooses move → Matches bet → Game enters reveal phase
    3. Reveal Phase: Creator must reveal original move + secret within 24 hours
    4. Resolution: Smart contract determines winner automatically, distributes rewards

    REVEAL STRATEGY:
    - CRITICAL: Save your move and secret phrase when creating a game
    - The platform auto-saves secrets for convenience
    - Use the "Auto-Reveal" feature for games where you have saved secrets
    - Manual reveal requires entering exact move and secret phrase used during creation

    LEVEL SYSTEM:
    - 8 levels: Rookie → Apprentice → Warrior → Champion → Master → Grandmaster → Legend → Mythic
    - Levels based on monthly score (wins = +10 points, games played = +2 points)
    - Higher levels get bonus rewards and exclusive perks

    REWARDS & ECONOMICS:
    - Winner takes 80% of total pot (their bet + 80% of opponent's bet)
    - 5% goes to monthly reward pool for top players
    - 15% platform fee for development and maintenance
    - Monthly leaderboard rewards: 1st=40%, 2nd=30%, 3rd=15%, 4th=10%, 5th=5% of pool

    BLOCKCHAIN FEATURES:
    - Built on Core Blockchain (Chain ID: 1116)
    - Smart contract address: 0x3007582C0E80Fc9e381d7A1Eb198c72B0d1C3697
    - Fully decentralized and transparent
    - All transactions verifiable on Core blockchain explorer

    FALCO-X COMPANY:
    OMDB COMPANY:
    - Innovative blockchain gaming and entertainment company
    - Focus on fair, transparent, and engaging gaming experiences
    - Community-driven development
    - Professional security audits and best practices
    - Website: https://omdb.com
    - Support: https://omdb.com/support

    SECURITY:
    - Professional security audit scheduled for Q1 2025
    - Commit-reveal scheme prevents cheating
    - Smart contract is immutable and verified
    - No central authority can manipulate outcomes

    Always be helpful, enthusiastic about gaming, and provide clear explanations. Use gaming emojis and maintain an exciting tone while being informative.
    `;

    try {
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: gameKnowledge
            },
            {
              role: 'user',
              content: userMessage
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('AI API Error:', error);
      return "🤖 I'm experiencing some technical difficulties right now. Please try asking your question again in a moment. In the meantime, you can explore the game documentation or check out our community channels for help!";
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Add typing indicator
    const typingMessage: Message = {
      id: 'typing',
      type: 'ai',
      content: '',
      timestamp: new Date(),
      isTyping: true
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      const aiResponse = await getAIResponse(userMessage.content);
      
      // Remove typing indicator and add real response
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== 'typing');
        return [...filtered, {
          id: Date.now().toString(),
          type: 'ai',
          content: aiResponse,
          timestamp: new Date()
        }];
      });

      playNotificationSound();
    } catch (error) {
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== 'typing');
        return [...filtered, {
          id: Date.now().toString(),
          type: 'ai',
          content: "🤖 Sorry, I encountered an error. Please try again!",
          timestamp: new Date()
        }];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    { icon: <Target className="w-4 h-4" />, text: "How to reveal my element?", query: "How do I reveal my element in a game?" },
    { icon: <Trophy className="w-4 h-4" />, text: "Reward system", query: "How does the reward and level system work?" },
    { icon: <Shield className="w-4 h-4" />, text: "Game security", query: "How secure is the game and how does the commit-reveal work?" },
    { icon: <Coins className="w-4 h-4" />, text: "Earning CORE", query: "How can I earn CORE tokens playing?" }
  ];

  const handleQuickQuestion = (query: string) => {
    setInputMessage(query);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="group relative overflow-hidden w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white rounded-full shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-110 animate-pulse"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
          <div className="relative flex items-center justify-center">
            <Bot className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          
          {/* Floating notification */}
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center animate-bounce">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-slate-900/95 backdrop-blur-sm text-white text-sm rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span>Ask me anything about RPS Arena!</span>
            </div>
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900/95"></div>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl transition-all duration-300 ${
        isMinimized ? 'w-80 h-16' : 'w-80 sm:w-96 h-96 sm:h-[32rem]'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse"></div>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-white font-bold text-sm sm:text-base truncate">OMDB Arena Assistant</h3>
              <p className="text-green-400 text-xs flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Online & Ready</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="w-8 h-8 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg flex items-center justify-center transition-colors"
              title={soundEnabled ? 'Disable sound' : 'Enable sound'}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-gray-300" />
              ) : (
                <VolumeX className="w-4 h-4 text-gray-400" />
              )}
            </button>
            
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="w-8 h-8 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg flex items-center justify-center transition-colors"
              title={isMinimized ? 'Expand' : 'Minimize'}
            >
              {isMinimized ? (
                <Maximize2 className="w-4 h-4 text-gray-300" />
              ) : (
                <Minimize2 className="w-4 h-4 text-gray-300" />
              )}
            </button>
            
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 bg-red-500/20 hover:bg-red-500/30 rounded-lg flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-red-400" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 h-48 sm:h-64">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-2 max-w-[85%] ${
                    message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      message.type === 'user' 
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                        : 'bg-gradient-to-br from-blue-600 to-purple-600'
                    }`}>
                      {message.type === 'user' ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>
                    
                    {/* Message bubble */}
                    <div className={`relative px-3 py-2 rounded-2xl shadow-lg ${
                      message.type === 'user'
                        ? 'bg-gradient-to-br from-green-600 to-emerald-600 text-white'
                        : 'bg-gradient-to-br from-slate-700 to-slate-800 text-gray-100 border border-slate-600/50'
                    }`}>
                      {message.isTyping ? (
                        <div className="flex items-center space-x-1">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          <span className="text-blue-400 text-sm ml-2">Thinking...</span>
                        </div>
                      ) : (
                        <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                          {message.content}
                        </p>
                      )}
                      
                      {/* Timestamp */}
                      <div className={`text-xs mt-1 opacity-70 ${
                        message.type === 'user' ? 'text-green-100' : 'text-gray-400'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2">
                <p className="text-gray-400 text-xs mb-2">Quick questions:</p>
                <div className="grid grid-cols-2 gap-2">
                  {quickQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickQuestion(question.query)}
                      className="flex items-center space-x-2 p-2 bg-slate-700/30 hover:bg-slate-600/30 rounded-lg transition-colors text-left"
                    >
                      <div className="text-blue-400 flex-shrink-0">
                        {question.icon}
                      </div>
                      <span className="text-gray-300 text-xs truncate">{question.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-slate-700/50">
              <div className="flex items-center space-x-2">
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about OMDB Arena..."
                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                    disabled={isLoading}
                  />
                  {inputMessage && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="group relative overflow-hidden w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-xl transition-all disabled:cursor-not-allowed hover:scale-105 shadow-lg"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
                  <div className="relative flex items-center justify-center">
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </div>
                </button>
              </div>
              
              {/* Character count */}
              <div className="flex justify-end items-center mt-2">
                <span className="text-xs text-gray-500">
                  {inputMessage.length}/500
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AIAgent;