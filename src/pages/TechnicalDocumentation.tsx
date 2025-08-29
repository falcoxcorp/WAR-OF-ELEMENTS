import React, { useState } from 'react';
import { Book, Shield, Zap, Trophy, Target, Users, Crown, Star, Coins, Clock, Eye, Play, ArrowRight, CheckCircle, AlertTriangle, Info, Code, Database, Globe, ExternalLink, Hash, Lock, Unlock, Timer, Gamepad2, Wallet, Settings, FileText, ChevronDown, ChevronRight } from 'lucide-react';

const TechnicalDocumentation: React.FC = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const sections = [
    { id: 'overview', label: 'Resumen Técnico', icon: Book },
    { id: 'game-flow', label: 'Flujo del Juego', icon: Play },
    { id: 'commit-reveal', label: 'Commit-Reveal', icon: Lock },
    { id: 'smart-contract', label: 'Smart Contract', icon: Code },
    { id: 'security', label: 'Seguridad', icon: Shield },
    { id: 'economics', label: 'Economía', icon: Coins }
  ];

  const gameSteps = [
    {
      id: 1,
      title: "Creación del Juego",
      subtitle: "El jugador A inicia una partida",
      duration: "~30 segundos",
      gasUsed: "~150,000 gas",
      technical: "Función: createGame(bytes32 _moveHash, address _referrer)",
      details: {
        userActions: [
          "1. Conectar wallet a BSC (Chain ID: 56)",
          "2. Elegir elemento: 🔥 Fuego, 💧 Agua, o 🌿 Plantas",
          "3. Crear frase secreta (ej: 'mi_secreto_123')",
          "4. Establecer cantidad de apuesta (mín: 0.001 BNB)",
          "5. Opcional: Agregar dirección de referido"
        ],
        technicalProcess: [
          "• Sistema genera hash: keccak256(move + secret)",
          "• Validación: betAmount >= 0.001 BNB && <= 1000 BNB",
          "• Creación de struct Game en blockchain",
          "• Emisión de evento GameCreated",
          "• Guardado local del secreto para auto-reveal"
        ],
        smartContractCode: `// Generación del hash (frontend)
const moveHash = web3.utils.soliditySha3(
  { type: 'uint8', value: move },    // 1=Fuego, 2=Agua, 3=Plantas
  { type: 'string', value: secret }  // Frase secreta
);

// Llamada al contrato
await contract.methods.createGame(moveHash, referrer)
  .send({ 
    from: account, 
    value: web3.utils.toWei(betAmount, 'ether') 
  });`,
        blockchainState: "Game creado con estado 'Open', esperando oponente"
      }
    },
    {
      id: 2,
      title: "Búsqueda de Oponente",
      subtitle: "El juego aparece en la lista pública",
      duration: "Variable (hasta que alguien se una)",
      gasUsed: "0 gas (solo lectura)",
      technical: "Estado: GameStatus.Open",
      details: {
        userActions: [
          "1. El juego aparece en /games con estado 'Open'",
          "2. Otros jugadores pueden ver la apuesta pero NO el movimiento",
          "3. El creador puede cancelar si nadie se ha unido",
          "4. La información del hash está oculta para mantener privacidad"
        ],
        technicalProcess: [
          "• Game visible en array público de juegos",
          "• moveHash almacenado pero no revelado",
          "• opponent = address(0) indica que está abierto",
          "• Frontend filtra juegos por status === 0"
        ],
        smartContractCode: `// Estructura del juego en blockchain
struct Game {
    address creator;           // 0x123... (público)
    bytes32 creatorMoveHash;   // 0xabc... (hash oculto)
    Move creatorMove;          // 0 (no revelado aún)
    address opponent;          // 0x000... (vacío)
    Move opponentMove;         // 0 (no hay oponente)
    uint256 betAmount;         // 1000000000000000000 (1 BNB)
    GameStatus status;         // 0 (Open)
    address winner;            // 0x000... (no determinado)
    uint256 createdAt;         // timestamp
    uint256 revealDeadline;    // 0 (no establecido aún)
    address referrer;          // 0x456... (opcional)
}`,
        blockchainState: "Juego visible públicamente, esperando que alguien iguale la apuesta"
      }
    },
    {
      id: 3,
      title: "Unirse al Juego",
      subtitle: "El jugador B acepta el desafío",
      duration: "~20 segundos",
      gasUsed: "~120,000 gas",
      technical: "Función: joinGame(uint256 _gameId, Move _move)",
      details: {
        userActions: [
          "1. Jugador B ve el juego en la lista",
          "2. Hace clic en 'Join Battle'",
          "3. Elige su elemento (🔥 Fuego, 💧 Agua, o 🌿 Plantas)",
          "4. Confirma transacción con la misma cantidad de BNB",
          "5. Su movimiento se guarda inmediatamente (no necesita hash)"
        ],
        technicalProcess: [
          "• Validación: msg.value == game.betAmount",
          "• Validación: msg.sender != game.creator",
          "• Actualización: game.opponent = msg.sender",
          "• Actualización: game.opponentMove = _move",
          "• Cambio de estado: GameStatus.RevealPhase",
          "• Establecer deadline: block.timestamp + 24 hours"
        ],
        smartContractCode: `// Validaciones en joinGame
require(game.status == GameStatus.Open, "Game is not open");
require(game.creator != msg.sender, "Cannot join your own game");
require(msg.value == game.betAmount, "Bet amount must match");

// Actualización del estado
game.opponent = msg.sender;
game.opponentMove = _move;  // Movimiento visible inmediatamente
game.status = GameStatus.RevealPhase;
game.revealDeadline = block.timestamp + 24 hours;

// Estadísticas del jugador
playerStats[msg.sender].gamesPlayed++;
playerStats[msg.sender].totalWagered += msg.value;
playerStats[msg.sender].monthlyScore += 2; // Puntos por jugar`,
        blockchainState: "Juego en fase de revelación, esperando que el creador revele su movimiento"
      }
    },
    {
      id: 4,
      title: "Fase de Revelación",
      subtitle: "El creador debe revelar su movimiento",
      duration: "Hasta 24 horas",
      gasUsed: "~100,000 gas",
      technical: "Función: revealMove(uint256 _gameId, Move _move, string _secret)",
      details: {
        userActions: [
          "1. El creador recibe notificación de que alguien se unió",
          "2. Tiene 24 horas para revelar su movimiento original",
          "3. Puede usar 'Auto-Reveal' si guardó el secreto",
          "4. O revelar manualmente ingresando movimiento + secreto",
          "5. El sistema verifica que el hash coincida"
        ],
        technicalProcess: [
          "• Validación temporal: block.timestamp <= revealDeadline",
          "• Verificación de hash: keccak256(move + secret) == storedHash",
          "• Determinación del ganador según reglas clásicas",
          "• Distribución automática de recompensas",
          "• Actualización de estadísticas de ambos jugadores"
        ],
        smartContractCode: `// Verificación del hash
bytes32 computedHash = keccak256(abi.encodePacked(uint8(_move), _secret));
require(computedHash == game.creatorMoveHash, "Invalid move or secret");

// Determinación del ganador
function determineWinner(Move _creatorMove, Move _opponentMove) internal pure returns (address) {
    if (_creatorMove == _opponentMove) return address(0); // Empate
    
    bool creatorWins = (_creatorMove == Move.Rock && _opponentMove == Move.Scissors) ||
                      (_creatorMove == Move.Paper && _opponentMove == Move.Rock) ||
                      (_creatorMove == Move.Scissors && _opponentMove == Move.Paper);
    
    return creatorWins ? address(0x1) : address(0x2);
}`,
        blockchainState: "Movimientos revelados, ganador determinado, recompensas distribuidas"
      }
    },
    {
      id: 5,
      title: "Distribución de Recompensas",
      subtitle: "Pago automático al ganador",
      duration: "Instantáneo",
      gasUsed: "Incluido en reveal",
      technical: "Función interna: _distributeGameRewards()",
      details: {
        userActions: [
          "1. El ganador recibe automáticamente sus BNB",
          "2. Las estadísticas se actualizan en tiempo real",
          "3. Los puntos del ranking mensual se suman",
          "4. El juego se marca como 'Completed'",
          "5. Ambos jugadores pueden ver el resultado final"
        ],
        technicalProcess: [
          "• Cálculo de fees: 10% plataforma + 5% pool de recompensas",
          "• Comisión de referido: 2% si existe referrer",
          "• Pago al ganador: 80% de la apuesta del oponente + su apuesta",
          "• Actualización de playerStats para ambos jugadores",
          "• Emisión de eventos para tracking"
        ],
        smartContractCode: `// Distribución de recompensas
uint256 totalPot = game.betAmount * 2;  // 2 BNB total
uint256 platformFee = (totalPot * 10) / 100;  // 0.2 BNB
uint256 rewardPoolFee = (totalPot * 5) / 100;  // 0.1 BNB
uint256 winnerAmount = totalPot - platformFee - rewardPoolFee;  // 1.7 BNB

// Si hay referido
if (game.referrer != address(0)) {
    uint256 referralFee = (totalPot * 2) / 100;  // 0.04 BNB
    winnerAmount -= referralFee;  // 1.66 BNB al ganador
}

// Pagos automáticos
payable(winner).transfer(winnerAmount);
payable(feeWallet).transfer(platformFee);
rewardPool += rewardPoolFee;`,
        blockchainState: "Juego completado, recompensas distribuidas, estadísticas actualizadas"
      }
    },
    {
      id: 6,
      title: "Timeout y Reclamación",
      subtitle: "Qué pasa si no se revela a tiempo",
      duration: "Después de 24 horas",
      gasUsed: "~80,000 gas",
      technical: "Función: claimTimeout(uint256 _gameId)",
      details: {
        userActions: [
          "1. Si el creador no revela en 24 horas",
          "2. El oponente puede reclamar victoria automática",
          "3. Hace clic en 'Claim Victory' en la tarjeta del juego",
          "4. Recibe toda la recompensa sin necesidad de revelar",
          "5. El juego se marca como completado"
        ],
        technicalProcess: [
          "• Validación: block.timestamp > game.revealDeadline",
          "• Validación: msg.sender == game.opponent",
          "• Asignación automática: game.winner = opponent",
          "• Distribución de recompensas al oponente",
          "• Penalización al creador por no revelar"
        ],
        smartContractCode: `// Reclamación por timeout
function claimTimeout(uint256 _gameId) external {
    Game storage game = games[_gameId];
    
    require(game.status == GameStatus.RevealPhase, "Game not in reveal phase");
    require(block.timestamp > game.revealDeadline, "Reveal deadline not passed");
    require(msg.sender == game.opponent, "Only opponent can claim");
    
    game.status = GameStatus.Completed;
    game.winner = msg.sender;  // Oponente gana automáticamente
    
    _distributeGameRewards(_gameId, msg.sender);
    _updatePlayerStats(_gameId, msg.sender);
}`,
        blockchainState: "Victoria por timeout, oponente recibe recompensas completas"
      }
    }
  ];

  const commitRevealSteps = [
    {
      phase: "Commit Phase",
      description: "El jugador A oculta su movimiento",
      steps: [
        "Jugador elige movimiento: move = 1 (Fuego)",
        "Jugador crea secreto: secret = 'mi_secreto_super_seguro_123'",
        "Sistema calcula hash: keccak256(1 + 'mi_secreto_super_seguro_123')",
        "Hash resultante: 0x7d865e959b2466918c9863afca942d0fb89d7c9ac0c99bafc3749504ded97730",
        "Solo el hash se envía al blockchain, el movimiento permanece secreto"
      ],
      code: `// Frontend - Generación del hash
const move = 1; // Fuego
const secret = "mi_secreto_super_seguro_123";

const moveHash = web3.utils.soliditySha3(
  { type: 'uint8', value: move },
  { type: 'string', value: secret }
);

// Resultado: 0x7d865e959b2466918c9863afca942d0fb89d7c9ac0c99bafc3749504ded97730`
    },
    {
      phase: "Waiting Phase",
      description: "El juego espera un oponente",
      steps: [
        "El juego aparece en la lista pública con estado 'Open'",
        "Otros jugadores ven: ID, creador, cantidad de apuesta",
        "NO pueden ver: el movimiento real ni el secreto",
        "El hash está almacenado pero es incomprensible sin el secreto",
        "El creador puede cancelar si nadie se une"
      ],
      code: `// Estado público visible
{
  "id": 123,
  "creator": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  "creatorMoveHash": "0x7d865e959b2466918c9863afca942d0fb89d7c9ac0c99bafc3749504ded97730",
  "creatorMove": 0,        // No revelado (0 = None)
  "opponent": "0x0000...", // Sin oponente aún
  "betAmount": "1000000000000000000", // 1 BNB
  "status": 0              // Open
}`
    },
    {
      phase: "Join Phase",
      description: "El jugador B se une al juego",
      steps: [
        "Jugador B ve el juego abierto",
        "Elige su movimiento: move = 2 (Agua)",
        "Envía transacción con la misma cantidad de BNB",
        "Su movimiento se guarda directamente (no necesita hash)",
        "El juego cambia a estado 'RevealPhase'"
      ],
      code: `// Jugador B se une
await contract.methods.joinGame(gameId, 2) // 2 = Agua
  .send({ 
    from: opponentAccount, 
    value: "1000000000000000000" // Debe igualar la apuesta
  });

// Estado después de unirse
{
  "opponent": "0x8f3Cf7ad23Cd3CaDbD9735aff958023239c6A063",
  "opponentMove": 2,        // Agua (visible inmediatamente)
  "status": 3,              // RevealPhase
  "revealDeadline": 1735689600 // 24 horas desde ahora
}`
    },
    {
      phase: "Reveal Phase",
      description: "El jugador A debe revelar su movimiento",
      steps: [
        "Jugador A tiene 24 horas para revelar",
        "Debe proporcionar el movimiento original Y el secreto exacto",
        "Sistema verifica: keccak256(movimiento + secreto) == hash_almacenado",
        "Si coincide, se determina el ganador automáticamente",
        "Si no revela a tiempo, el oponente puede reclamar victoria"
      ],
      code: `// Revelación del movimiento
await contract.methods.revealMove(
  gameId, 
  1,                              // Movimiento original (Fuego)
  "mi_secreto_super_seguro_123"   // Secreto exacto
).send({ from: creatorAccount });

// Verificación en el contrato
bytes32 computedHash = keccak256(abi.encodePacked(uint8(1), "mi_secreto_super_seguro_123"));
require(computedHash == storedHash, "Invalid move or secret");

// Determinación del ganador: Fuego vs Agua = Agua gana
// Jugador B (Agua) es el ganador`
    }
  ];

  const securityFeatures = [
    {
      title: "Commit-Reveal Cryptográfico",
      description: "Imposible hacer trampa o ver el movimiento del oponente",
      implementation: "Hash SHA3 (keccak256) con salt personalizado",
      benefits: ["Privacidad total", "Imposible predecir", "Verificable públicamente"]
    },
    {
      title: "Validación de Tiempo",
      description: "Límites estrictos para evitar manipulación temporal",
      implementation: "block.timestamp con ventanas de 24 horas",
      benefits: ["Previene ataques de timing", "Garantiza fairness", "Protege a ambos jugadores"]
    },
    {
      title: "Reentrancy Protection",
      description: "Previene ataques de reentrada durante pagos",
      implementation: "OpenZeppelin ReentrancyGuard",
      benefits: ["Pagos seguros", "Estado consistente", "Protección contra exploits"]
    },
    {
      title: "Access Control",
      description: "Solo los jugadores autorizados pueden realizar acciones",
      implementation: "Modifiers personalizados con validación de address",
      benefits: ["Previene manipulación", "Control granular", "Auditabilidad completa"]
    }
  ];

  const economicsBreakdown = {
    totalPot: "2.0 BNB",
    distribution: [
      { recipient: "Ganador", amount: "1.6 BNB", percentage: "80%", description: "Su apuesta + 80% de la del oponente" },
      { recipient: "Plataforma", amount: "0.2 BNB", percentage: "10%", description: "Mantenimiento y desarrollo" },
      { recipient: "Pool de Recompensas", amount: "0.1 BNB", percentage: "5%", description: "Ranking mensual" },
      { recipient: "Referido (opcional)", amount: "0.04 BNB", percentage: "2%", description: "Comisión por referir jugadores" },
      { recipient: "Ganador Final", amount: "1.56 BNB", percentage: "78%", description: "Si hay referido" }
    ]
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 rounded-3xl blur-3xl"></div>
        <div className="relative">
          <div className="flex justify-center items-center space-x-4 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <div className="flex items-center space-x-2">
              {[...Array(5)].map((_, i) => (
                <Code key={i} className="w-6 h-6 text-green-400 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
          </div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4">
            Documentación Técnica
          </h1>
          <p className="text-xl text-gray-300 mb-6">Guía completa del flujo de juego y arquitectura técnica</p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-green-400" />
              <span>Commit-Reveal Scheme</span>
            </div>
            <span className="hidden sm:inline">•</span>
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-blue-400" />
              <span>BSC Optimized</span>
            </div>
            <span className="hidden sm:inline">•</span>
            <div className="flex items-center space-x-2">
              <Trophy className="w-4 h-4 text-purple-400" />
              <span>Provably Fair</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex flex-wrap gap-2 mb-8">
        {sections.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeSection === id
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-slate-800/50 text-gray-300 hover:bg-slate-700/50'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {activeSection === 'overview' && (
        <div className="space-y-8">
          <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-white mb-6">Arquitectura del Sistema</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-white mb-4">🏗️ Stack Tecnológico</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <Globe className="w-4 h-4 text-yellow-400" />
                      <span className="text-white font-medium">Blockchain</span>
                    </div>
                    <p className="text-gray-400 text-sm">Binance Smart Chain (BSC) - Chain ID: 56</p>
                  </div>
                  
                  <div className="p-3 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <Code className="w-4 h-4 text-blue-400" />
                      <span className="text-white font-medium">Smart Contract</span>
                    </div>
                    <p className="text-gray-400 text-sm">Solidity 0.8.19 con OpenZeppelin</p>
                  </div>
                  
                  <div className="p-3 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <Database className="w-4 h-4 text-green-400" />
                      <span className="text-white font-medium">Frontend</span>
                    </div>
                    <p className="text-gray-400 text-sm">React + TypeScript + Web3.js</p>
                  </div>
                  
                  <div className="p-3 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <Zap className="w-4 h-4 text-purple-400" />
                      <span className="text-white font-medium">API</span>
                    </div>
                    <p className="text-gray-400 text-sm">Node.js + Express con caché inteligente</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-white mb-4">🔐 Características de Seguridad</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-white font-medium">Commit-Reveal Scheme</span>
                      <p className="text-gray-400 text-sm">Imposible hacer trampa o predecir movimientos</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-white font-medium">Timeouts Automáticos</span>
                      <p className="text-gray-400 text-sm">Protección contra jugadores que no revelan</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-white font-medium">Distribución Automática</span>
                      <p className="text-gray-400 text-sm">Pagos instantáneos sin intervención humana</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-white font-medium">Auditabilidad Total</span>
                      <p className="text-gray-400 text-sm">Todas las transacciones son públicamente verificables</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'game-flow' && (
        <div className="space-y-6">
          <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-white mb-6">Flujo Completo del Juego</h2>
            <p className="text-gray-300 text-lg mb-8">
              Proceso paso a paso desde la creación hasta la distribución de recompensas
            </p>
            
            {gameSteps.map((step, index) => (
              <div key={step.id} className="mb-6">
                <div 
                  className="p-6 bg-slate-700/30 rounded-xl border border-slate-600/50 cursor-pointer hover:bg-slate-600/30 transition-all"
                  onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                        {step.id}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{step.title}</h3>
                        <p className="text-gray-400">{step.subtitle}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-white text-sm font-medium">{step.duration}</p>
                        <p className="text-gray-400 text-xs">{step.gasUsed}</p>
                      </div>
                      {expandedStep === step.id ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                  
                  {expandedStep === step.id && (
                    <div className="mt-6 pt-6 border-t border-slate-600/50">
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Acciones del Usuario */}
                        <div>
                          <h4 className="text-lg font-bold text-white mb-3 flex items-center space-x-2">
                            <Users className="w-5 h-5 text-blue-400" />
                            <span>Acciones del Usuario</span>
                          </h4>
                          <div className="space-y-2">
                            {step.details.userActions.map((action, i) => (
                              <div key={i} className="flex items-start space-x-2">
                                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0 mt-2"></div>
                                <p className="text-gray-300 text-sm">{action}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Proceso Técnico */}
                        <div>
                          <h4 className="text-lg font-bold text-white mb-3 flex items-center space-x-2">
                            <Settings className="w-5 h-5 text-green-400" />
                            <span>Proceso Técnico</span>
                          </h4>
                          <div className="space-y-2">
                            {step.details.technicalProcess.map((process, i) => (
                              <div key={i} className="flex items-start space-x-2">
                                <div className="w-1.5 h-1.5 bg-green-400 rounded-full flex-shrink-0 mt-2"></div>
                                <p className="text-gray-300 text-sm">{process}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      {/* Código del Smart Contract */}
                      <div className="mt-6">
                        <h4 className="text-lg font-bold text-white mb-3 flex items-center space-x-2">
                          <Code className="w-5 h-5 text-purple-400" />
                          <span>Código del Smart Contract</span>
                        </h4>
                        <div className="bg-slate-900/50 rounded-xl p-4 overflow-x-auto">
                          <pre className="text-green-400 text-sm">
                            <code>{step.details.smartContractCode}</code>
                          </pre>
                        </div>
                      </div>
                      
                      {/* Estado del Blockchain */}
                      <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500/50 rounded-xl">
                        <h4 className="text-blue-400 font-bold mb-2 flex items-center space-x-2">
                          <Database className="w-4 h-4" />
                          <span>Estado del Blockchain</span>
                        </h4>
                        <p className="text-blue-300 text-sm">{step.details.blockchainState}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSection === 'commit-reveal' && (
        <div className="space-y-8">
          <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-white mb-6">Esquema Commit-Reveal</h2>
            <p className="text-gray-300 text-lg mb-8">
              El corazón de la seguridad del juego: cómo garantizamos que nadie puede hacer trampa
            </p>
            
            {commitRevealSteps.map((phase, index) => (
              <div key={index} className="mb-8">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{phase.phase}</h3>
                    <p className="text-gray-400">{phase.description}</p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-bold text-white mb-3">Proceso Detallado</h4>
                    <div className="space-y-2">
                      {phase.steps.map((step, i) => (
                        <div key={i} className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 bg-purple-400 rounded-full flex-shrink-0 mt-2"></div>
                          <p className="text-gray-300 text-sm">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-bold text-white mb-3">Implementación</h4>
                    <div className="bg-slate-900/50 rounded-xl p-4 overflow-x-auto">
                      <pre className="text-green-400 text-sm">
                        <code>{phase.code}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSection === 'security' && (
        <div className="space-y-8">
          <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-white mb-6">Características de Seguridad</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {securityFeatures.map((feature, index) => (
                <div key={index} className="p-6 bg-slate-700/30 rounded-xl">
                  <h3 className="text-lg font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-300 mb-4">{feature.description}</p>
                  
                  <div className="mb-4">
                    <h4 className="text-white font-medium mb-2">Implementación:</h4>
                    <code className="text-blue-400 text-sm bg-slate-800/50 px-2 py-1 rounded">
                      {feature.implementation}
                    </code>
                  </div>
                  
                  <div>
                    <h4 className="text-white font-medium mb-2">Beneficios:</h4>
                    <div className="space-y-1">
                      {feature.benefits.map((benefit, i) => (
                        <div key={i} className="flex items-center space-x-2">
                          <CheckCircle className="w-3 h-3 text-green-400" />
                          <span className="text-gray-300 text-sm">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSection === 'economics' && (
        <div className="space-y-8">
          <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-white mb-6">Modelo Económico</h2>
            
            <div className="mb-8 p-6 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl">
              <h3 className="text-xl font-bold text-white mb-4">Ejemplo: Juego de 1 BNB vs 1 BNB</h3>
              <div className="text-center mb-4">
                <p className="text-yellow-400 text-sm">Total del Pot</p>
                <p className="text-3xl font-bold text-white">{economicsBreakdown.totalPot}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {economicsBreakdown.distribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl">
                  <div>
                    <span className="text-white font-medium">{item.recipient}</span>
                    <p className="text-gray-400 text-sm">{item.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-white font-bold text-lg">{item.amount}</span>
                    <p className="text-gray-400 text-sm">{item.percentage}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 p-6 bg-blue-500/20 border border-blue-500/50 rounded-xl">
              <h4 className="text-blue-400 font-bold mb-3">💡 Puntos Clave del Sistema Económico</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-white font-medium mb-2">Para Jugadores</h5>
                  <ul className="space-y-1 text-gray-300 text-sm">
                    <li>• Ganas 80% de la apuesta del oponente + tu apuesta de vuelta</li>
                    <li>• En empates, ambos recuperan su apuesta completa</li>
                    <li>• Sistema de referidos: 2% de comisión</li>
                    <li>• Ranking mensual con recompensas adicionales</li>
                  </ul>
                </div>
                <div>
                  <h5 className="text-white font-medium mb-2">Para la Plataforma</h5>
                  <ul className="space-y-1 text-gray-300 text-sm">
                    <li>• 10% para mantenimiento y desarrollo</li>
                    <li>• 5% va al pool de recompensas mensuales</li>
                    <li>• Sostenibilidad a largo plazo garantizada</li>
                    <li>• Incentivos para jugadores activos</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'smart-contract' && (
        <div className="space-y-8">
          <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-white mb-6">Arquitectura del Smart Contract</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Funciones Principales</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-slate-700/30 rounded-lg">
                    <code className="text-green-400 font-mono">createGame(bytes32, address)</code>
                    <p className="text-gray-400 text-sm mt-1">Crea nuevo juego con hash del movimiento</p>
                  </div>
                  
                  <div className="p-3 bg-slate-700/30 rounded-lg">
                    <code className="text-blue-400 font-mono">joinGame(uint256, Move)</code>
                    <p className="text-gray-400 text-sm mt-1">Se une a juego existente con movimiento visible</p>
                  </div>
                  
                  <div className="p-3 bg-slate-700/30 rounded-lg">
                    <code className="text-purple-400 font-mono">revealMove(uint256, Move, string)</code>
                    <p className="text-gray-400 text-sm mt-1">Revela movimiento original con secreto</p>
                  </div>
                  
                  <div className="p-3 bg-slate-700/30 rounded-lg">
                    <code className="text-orange-400 font-mono">claimTimeout(uint256)</code>
                    <p className="text-gray-400 text-sm mt-1">Reclama victoria si oponente no revela</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Estructuras de Datos</h3>
                <div className="bg-slate-900/50 rounded-xl p-4 overflow-x-auto">
                  <pre className="text-green-400 text-sm">
{`struct Game {
    address creator;        // Creador del juego
    bytes32 creatorMoveHash; // Hash del movimiento
    Move creatorMove;       // Movimiento revelado
    address opponent;       // Oponente que se unió
    Move opponentMove;      // Movimiento del oponente
    uint256 betAmount;      // Cantidad apostada
    GameStatus status;      // Estado actual
    address winner;         // Ganador determinado
    uint256 createdAt;      // Timestamp de creación
    uint256 revealDeadline; // Límite para revelar
    address referrer;       // Referido opcional
}

struct PlayerStats {
    uint256 wins;           // Victorias
    uint256 losses;         // Derrotas
    uint256 ties;           // Empates
    uint256 gamesPlayed;    // Juegos totales
    uint256 totalWagered;   // Total apostado
    uint256 totalWon;       // Total ganado
    uint256 referralEarnings; // Ganancias por referidos
    uint256 lastPlayed;     // Última vez que jugó
    uint256 monthlyScore;   // Puntuación mensual
}`}
                  </pre>
                </div>
              </div>
            </div>
            
            <div className="mt-8 p-6 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-xl">
              <h4 className="text-red-400 font-bold mb-3">⚠️ Consideraciones Importantes</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-white font-medium mb-2">Límites de Tiempo</h5>
                  <ul className="space-y-1 text-gray-300 text-sm">
                    <li>• 24 horas para revelar movimiento</li>
                    <li>• Después del deadline, oponente puede reclamar</li>
                    <li>• No hay extensiones de tiempo</li>
                  </ul>
                </div>
                <div>
                  <h5 className="text-white font-medium mb-2">Límites de Apuesta</h5>
                  <ul className="space-y-1 text-gray-300 text-sm">
                    <li>• Mínimo: 0.001 BNB</li>
                    <li>• Máximo: 1000 BNB</li>
                    <li>• Debe coincidir exactamente para unirse</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Call to Action */}
      <div className="mt-16 text-center bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-lg border border-blue-500/30 rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-white mb-4">¿Listo para Jugar?</h2>
        <p className="text-gray-300 mb-6 text-lg">
          Ahora que entiendes la tecnología, ¡es hora de poner a prueba tus habilidades!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/create"
            className="group relative overflow-hidden px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-lg"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
            <div className="relative flex items-center space-x-2">
              <Play className="w-5 h-5" />
              <span>Crear Primer Juego</span>
            </div>
          </a>
          <a
            href="/games"
            className="px-8 py-4 bg-slate-700/50 hover:bg-slate-600/50 text-gray-300 hover:text-white rounded-xl font-bold text-lg transition-all border border-slate-600/50 hover:border-slate-500/50 flex items-center space-x-2"
          >
            <Target className="w-5 h-5" />
            <span>Ver Juegos Activos</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default TechnicalDocumentation;