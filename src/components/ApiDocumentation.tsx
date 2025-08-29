import React, { useState } from 'react';
import { Code, Copy, CheckCircle, ExternalLink, Zap, Shield, Globe, Database, Webhook, BarChart3 } from 'lucide-react';

const ApiDocumentation: React.FC = () => {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const copyToClipboard = (text: string, endpoint: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(endpoint);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  // Detectar si estamos en desarrollo o producción
  const isDevelopment = window.location.hostname === 'localhost';
  const baseUrl = isDevelopment 
    ? 'http://localhost:3001/api' 
    : `${window.location.protocol}//${window.location.hostname}:3001/api`;

  const endpoints = [
    {
      method: 'GET',
      path: '/health',
      description: 'API health status and metrics',
      example: `${baseUrl}/health`,
      response: {
        success: true,
        data: {
          status: 'healthy',
          uptime: 3600,
          version: '1.0.0',
          network: 'Core Blockchain',
          baseUrl: baseUrl
        }
      }
    },
    {
      method: 'GET',
      path: '/games',
      description: 'Get all games with optional filters',
      example: `${baseUrl}/games?status=0&limit=10`,
      params: ['limit', 'offset', 'status', 'creator', 'minBet', 'maxBet', 'sortBy'],
      response: {
        success: true,
        data: {
          games: [
            {
              id: 123,
              creator: '0x1234...',
              betAmount: '1000000000000000000',
              status: 0,
              statusText: 'Open'
            }
          ],
          pagination: {
            total: 500,
            limit: 10,
            offset: 0,
            hasMore: true
          }
        }
      }
    },
    {
      method: 'GET',
      path: '/games/:id',
      description: 'Get specific game details',
      example: `${baseUrl}/games/123`,
      response: {
        success: true,
        data: {
          id: 123,
          creator: '0x1234...',
          opponent: '0x5678...',
          betAmountFormatted: '1.0',
          statusText: 'Completed',
          winner: '0x1234...'
        }
      }
    },
    {
      method: 'GET',
      path: '/players/:address/stats',
      description: 'Get player statistics',
      example: `${baseUrl}/players/0x1234.../stats`,
      response: {
        success: true,
        data: {
          address: '0x1234...',
          wins: 15,
          losses: 8,
          winRate: 65,
          totalWonFormatted: '25.5',
          roi: '12.5'
        }
      }
    },
    {
      method: 'GET',
      path: '/players/leaderboard',
      description: 'Get top players ranking',
      example: `${baseUrl}/players/leaderboard?limit=10`,
      response: {
        success: true,
        data: {
          leaderboard: [
            {
              rank: 1,
              address: '0x1234...',
              monthlyScore: 1250,
              winRate: 78
            }
          ]
        }
      }
    }
  ];

  const codeExamples = {
    javascript: `// Obtener juegos abiertos
const response = await fetch('${baseUrl}/games?status=0&limit=10');
const data = await response.json();

if (data.success) {
  console.log('Juegos abiertos:', data.data.games);
  
  // Procesar cada juego
  data.data.games.forEach(game => {
    console.log(\`Juego #\${game.id}: \${game.betAmountFormatted} CORE\`);
  });
}

// Obtener estadísticas de jugador
const playerStats = await fetch('${baseUrl}/players/0x1234.../stats');
const stats = await playerStats.json();

if (stats.success) {
  console.log(\`Win Rate: \${stats.data.winRate}%\`);
  console.log(\`Profit: \${stats.data.profitFormatted} CORE\`);
}`,

    python: `import requests
import json

# Obtener leaderboard
response = requests.get('${baseUrl}/players/leaderboard?limit=10')
data = response.json()

if data['success']:
    print("🏆 Top Players:")
    for player in data['data']['leaderboard']:
        print(f"#{player['rank']}: {player['address']} - {player['monthlyScore']} puntos")

# Monitorear juegos con apuestas altas
def monitor_high_stakes_games():
    response = requests.get('${baseUrl}/games?minBet=10&status=0')
    data = response.json()
    
    if data['success']:
        for game in data['data']['games']:
            print(f"🎯 High stakes game #{game['id']}: {game['betAmountFormatted']} CORE")
            
monitor_high_stakes_games()`,

    curl: `# Obtener juegos recientes
curl "${baseUrl}/games/recent?limit=5"

# Obtener estadísticas del contrato
curl "${baseUrl}/contract/stats"

# Obtener juegos con filtros específicos
curl "${baseUrl}/games?status=0&minBet=5&sortBy=highest-bet"

# Obtener información de un jugador específico
curl "${baseUrl}/players/0x1234567890123456789012345678901234567890/stats"`
  };

  const useCases = [
    {
      title: 'Bot de Trading Automatizado',
      description: 'Monitorea juegos con apuestas altas y se une automáticamente',
      icon: <Zap className="w-6 h-6 text-yellow-400" />,
      code: `// Bot que monitorea juegos cada 30 segundos
setInterval(async () => {
  const response = await fetch('${baseUrl}/games?status=0&minBet=10');
  const data = await response.json();
  
  data.data.games.forEach(game => {
    if (shouldJoinGame(game)) {
      console.log(\`Joining game #\${game.id}\`);
      joinGame(game.id);
    }
  });
}, 30000);`
    },
    {
      title: 'Dashboard de Analytics',
      description: 'Crea dashboards en tiempo real con métricas del juego',
      icon: <BarChart3 className="w-6 h-6 text-blue-400" />,
      code: `// Obtener datos para dashboard
const [games, stats, leaderboard] = await Promise.all([
  fetch('${baseUrl}/games/recent').then(r => r.json()),
  fetch('${baseUrl}/contract/stats').then(r => r.json()),
  fetch('${baseUrl}/players/leaderboard').then(r => r.json())
]);

updateDashboard({ games, stats, leaderboard });`
    },
    {
      title: 'Bot de Discord/Telegram',
      description: 'Integra comandos para mostrar estadísticas en chat',
      icon: <Webhook className="w-6 h-6 text-purple-400" />,
      code: `// Comando de Discord para estadísticas
bot.command('stats', async (ctx) => {
  const address = getUserWallet(ctx.user.id);
  const response = await fetch(\`${baseUrl}/players/\${address}/stats\`);
  const data = await response.json();
  
  ctx.reply(\`🎮 Tus estadísticas:
  🏆 Victorias: \${data.data.wins}
  💰 Ganado: \${data.data.totalWonFormatted} CORE
  📊 Win Rate: \${data.data.winRate}%\`);
});`
    },
    {
      title: 'Aplicación Móvil',
      description: 'Consume la API desde React Native o Flutter',
      icon: <Globe className="w-6 h-6 text-green-400" />,
      code: `// React Native
const fetchPlayerData = async (address) => {
  try {
    const [stats, recentGames] = await Promise.all([
      fetch(\`${baseUrl}/players/\${address}/stats\`),
      fetch(\`${baseUrl}/games?creator=\${address}&limit=5\`)
    ]);
    
    return {
      stats: await stats.json(),
      recentGames: await recentGames.json()
    };
  } catch (error) {
    console.error('Error:', error);
  }
};`
    }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Globe },
    { id: 'endpoints', label: 'Endpoints', icon: Database },
    { id: 'examples', label: 'Code Examples', icon: Code },
    { id: 'use-cases', label: 'Use Cases', icon: Zap }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex justify-center items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
            <Code className="w-8 h-8 text-white" />
          </div>
          <div className="flex items-center space-x-2">
            {[...Array(3)].map((_, i) => (
              <Zap key={i} className="w-6 h-6 text-yellow-400 animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
            ))}
          </div>
        </div>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4">
          Guerra de Elementos Arena API
        </h1>
        <p className="text-xl text-gray-300 mb-6">API REST robusta para integrar con Guerra de Elementos Arena</p>
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-gray-400">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-green-400" />
            <span>Segura & Rápida</span>
          </div>
          <span className="hidden sm:inline">•</span>
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-blue-400" />
            <span>Datos en Tiempo Real</span>
          </div>
          <span className="hidden sm:inline">•</span>
          <div className="flex items-center space-x-2">
            <Globe className="w-4 h-4 text-purple-400" />
            <span>Fácil Integración</span>
          </div>
        </div>
      </div>

      {/* API Status */}
      <div className="mb-8 p-4 bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 font-medium">API Status: Online</span>
          </div>
          <div className="text-right">
            <p className="text-white font-mono text-sm">{baseUrl}</p>
            <p className="text-gray-400 text-xs">Base URL</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === id
                ? 'bg-blue-600 text-white shadow-lg'
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
          {/* Quick Start */}
          <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center space-x-2">
              <Zap className="w-8 h-8 text-yellow-400" />
              <span>Quick Start</span>
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-white mb-4">🚀 Empezar en 2 minutos</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                    <div>
                      <p className="text-white font-medium">Hacer tu primera llamada</p>
                      <code className="text-gray-400 text-sm">{baseUrl}/health</code>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
                    <div>
                      <p className="text-white font-medium">Obtener datos del juego</p>
                      <code className="text-gray-400 text-sm">{baseUrl}/games</code>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
                    <div>
                      <p className="text-white font-medium">¡Empezar a construir!</p>
                      <code className="text-gray-400 text-sm">Ver ejemplos →</code>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-white mb-4">📊 Características</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-green-400" />
                    <span className="text-gray-300">Rate limiting y seguridad</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <span className="text-gray-300">Caché inteligente (30s TTL)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Database className="w-5 h-5 text-blue-400" />
                    <span className="text-gray-300">Datos en tiempo real</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Code className="w-5 h-5 text-purple-400" />
                    <span className="text-gray-300">Documentación automática</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Base URL */}
          <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-lg border border-blue-500/30 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Base URL</h2>
            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
              <code className="text-blue-400 font-mono text-lg">{baseUrl}</code>
              <button
                onClick={() => copyToClipboard(baseUrl, 'base-url')}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
              >
                {copiedEndpoint === 'base-url' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedEndpoint === 'base-url' ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
              <p className="text-yellow-300 text-sm">
                💡 <strong>Tip:</strong> Si estás desarrollando localmente, la API estará en localhost:3001. 
                En producción, usa tu dominio con el puerto 3001.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'endpoints' && (
        <div className="space-y-6">
          {endpoints.map((endpoint, index) => (
            <div key={index} className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-lg font-bold text-sm ${
                    endpoint.method === 'GET' ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'
                  }`}>
                    {endpoint.method}
                  </span>
                  <code className="text-blue-400 font-mono text-lg">{endpoint.path}</code>
                </div>
                <button
                  onClick={() => copyToClipboard(endpoint.example, `endpoint-${index}`)}
                  className="flex items-center space-x-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all"
                >
                  {copiedEndpoint === `endpoint-${index}` ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedEndpoint === `endpoint-${index}` ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              
              <p className="text-gray-300 mb-4">{endpoint.description}</p>
              
              {endpoint.params && (
                <div className="mb-4">
                  <h4 className="text-white font-medium mb-2">Parameters:</h4>
                  <div className="flex flex-wrap gap-2">
                    {endpoint.params.map((param, i) => (
                      <span key={i} className="px-2 py-1 bg-slate-700 text-gray-300 rounded text-sm">
                        {param}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="bg-slate-900/50 rounded-xl p-4">
                <h4 className="text-white font-medium mb-2">Example Response:</h4>
                <pre className="text-green-400 text-sm overflow-x-auto">
                  {JSON.stringify(endpoint.response, null, 2)}
                </pre>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'examples' && (
        <div className="space-y-8">
          {Object.entries(codeExamples).map(([language, code]) => (
            <div key={language} className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white capitalize">{language}</h3>
                <button
                  onClick={() => copyToClipboard(code, language)}
                  className="flex items-center space-x-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all"
                >
                  {copiedEndpoint === language ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedEndpoint === language ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>
              <div className="bg-slate-900/50 rounded-xl p-4 overflow-x-auto">
                <pre className="text-green-400 text-sm">
                  <code>{code}</code>
                </pre>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'use-cases' && (
        <div className="grid md:grid-cols-2 gap-6">
          {useCases.map((useCase, index) => (
            <div key={index} className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                {useCase.icon}
                <h3 className="text-xl font-bold text-white">{useCase.title}</h3>
              </div>
              <p className="text-gray-300 mb-4">{useCase.description}</p>
              <div className="bg-slate-900/50 rounded-xl p-4">
                <pre className="text-green-400 text-sm overflow-x-auto">
                  <code>{useCase.code}</code>
                </pre>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-16 text-center bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-lg border border-blue-500/30 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-white mb-4">¿Listo para empezar?</h2>
        <p className="text-gray-300 mb-6">
          La API está disponible en <strong>{baseUrl}</strong>. ¡Empieza a construir aplicaciones increíbles!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={`${baseUrl}/docs`}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative overflow-hidden flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-medium transition-all hover:scale-105 shadow-lg"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
            <div className="relative flex items-center space-x-2">
              <ExternalLink className="w-4 h-4" />
              <span>Ver Documentación Completa</span>
            </div>
          </a>
          <a
            href={`${baseUrl}/health`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-6 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-xl font-medium transition-all border border-slate-600/50 hover:border-slate-500/50"
          >
            <Shield className="w-4 h-4" />
            <span>Test API Health</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default ApiDocumentation;