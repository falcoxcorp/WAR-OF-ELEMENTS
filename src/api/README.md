# Guerra de Elementos Arena API

Una API REST robusta y completa para el juego Guerra de Elementos Arena en Core Blockchain.

## 🚀 Características

- **Segura**: Rate limiting, CORS, validación de entrada
- **Rápida**: Sistema de caché inteligente, optimización de consultas
- **Escalable**: Arquitectura modular, fácil de extender
- **Documentada**: Documentación automática y ejemplos
- **Monitorizada**: Métricas de rendimiento y logs detallados

## 📊 Endpoints Disponibles

### Información General
- `GET /api/health` - Estado de la API
- `GET /api/docs` - Documentación completa

### Juegos
- `GET /api/games` - Lista de juegos con filtros
- `GET /api/games/:id` - Detalles de un juego específico
- `GET /api/games/recent` - Juegos recientes (últimas 24h)
- `GET /api/games/active` - Juegos activos/abiertos

### Jugadores
- `GET /api/players/:address/stats` - Estadísticas de jugador
- `GET /api/players/leaderboard` - Ranking de jugadores

### Contrato
- `GET /api/contract/stats` - Estadísticas del contrato
- `GET /api/contract/info` - Información del contrato

### Webhooks
- `POST /api/webhooks/game-events` - Eventos del juego (requiere API key)

## 🔧 Instalación y Uso

### Desarrollo
```bash
# Instalar dependencias
npm install

# Ejecutar API en desarrollo
npm run api:dev

# Ejecutar frontend + API juntos
npm run start:full
```

### Producción
```bash
# Construir API
npm run api:build

# Ejecutar API
npm run api:start
```

## 📝 Ejemplos de Uso

### JavaScript/Node.js
```javascript
// Obtener juegos abiertos
const response = await fetch('http://localhost:3001/api/games?status=0&limit=10');
const data = await response.json();

if (data.success) {
  console.log('Juegos abiertos:', data.data.games);
}

// Obtener estadísticas de jugador
const playerStats = await fetch('http://localhost:3001/api/players/0x1234.../stats');
const stats = await playerStats.json();

if (stats.success) {
  console.log('Win rate:', stats.data.winRate + '%');
}
```

### Python
```python
import requests

# Obtener leaderboard
response = requests.get('http://localhost:3001/api/players/leaderboard?limit=10')
data = response.json()

if data['success']:
    for player in data['data']['leaderboard']:
        print(f"#{player['rank']}: {player['address']} - {player['monthlyScore']} puntos")
```

### cURL
```bash
# Obtener juegos con apuestas altas
curl "http://localhost:3001/api/games?minBet=10&limit=5"

# Obtener estadísticas del contrato
curl "http://localhost:3001/api/contract/stats"
```

## 🔒 Autenticación

Para endpoints que requieren autenticación (webhooks), incluye el header:
```
X-API-Key: tu_api_key_aqui
```

## 📊 Rate Limiting

- **Límite**: 100 requests por minuto por IP
- **Headers de respuesta**:
  - `X-RateLimit-Limit`: Límite máximo
  - `X-RateLimit-Remaining`: Requests restantes
  - `X-RateLimit-Reset`: Tiempo de reset

## 🎯 Casos de Uso

### 1. Bot de Trading
```javascript
// Monitorear juegos con apuestas altas
setInterval(async () => {
  const response = await fetch('/api/games?status=0&minBet=10');
  const data = await response.json();
  
  data.data.games.forEach(game => {
    if (shouldJoinGame(game)) {
      joinGame(game.id);
    }
  });
}, 30000);
```

### 2. Dashboard de Analytics
```javascript
// Obtener métricas para dashboard
const [games, stats, leaderboard] = await Promise.all([
  fetch('/api/games/recent').then(r => r.json()),
  fetch('/api/contract/stats').then(r => r.json()),
  fetch('/api/players/leaderboard').then(r => r.json())
]);

updateDashboard({ games, stats, leaderboard });
```

### 3. Bot de Discord
```javascript
// Comando para mostrar estadísticas
bot.command('stats', async (ctx) => {
  const address = getUserWallet(ctx.user.id);
  const response = await fetch(`/api/players/${address}/stats`);
  const data = await response.json();
  
  if (data.success) {
    ctx.reply(`🎮 Tus estadísticas:
    🏆 Victorias: ${data.data.wins}
    💰 Ganado: ${data.data.totalWonFormatted} CORE
    📊 Win Rate: ${data.data.winRate}%`);
  }
});
```

### 4. Aplicación Móvil
```javascript
// React Native / Flutter
const fetchPlayerData = async (address) => {
  try {
    const [stats, recentGames] = await Promise.all([
      fetch(`/api/players/${address}/stats`),
      fetch(`/api/games?creator=${address}&limit=5`)
    ]);
    
    return {
      stats: await stats.json(),
      recentGames: await recentGames.json()
    };
  } catch (error) {
    console.error('Error fetching player data:', error);
  }
};
```

## 🔧 Configuración

Variables de entorno disponibles:

```env
# Puerto de la API
API_PORT=3001

# Clave para webhooks
WEBHOOK_API_KEY=tu_clave_secreta

# Orígenes permitidos para CORS
ALLOWED_ORIGINS=http://localhost:3000,https://tu-dominio.com

# Configuración de rate limiting
MAX_REQUESTS_PER_MINUTE=100

# TTL del caché (milisegundos)
CACHE_TTL=30000
```

## 📈 Monitoreo y Métricas

La API incluye métricas de rendimiento automáticas:

```javascript
// Obtener métricas de rendimiento
const response = await fetch('/api/health');
const health = await response.json();

console.log('Uptime:', health.data.uptime);
console.log('Response time:', health.data.responseTime);
```

## 🚀 Despliegue

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist/
EXPOSE 3001
CMD ["npm", "run", "api:start"]
```

### Railway/Render
```json
{
  "build": "npm run api:build",
  "start": "npm run api:start"
}
```

## 🤝 Contribuir

1. Fork el repositorio
2. Crea una rama para tu feature
3. Añade tests para nuevos endpoints
4. Actualiza la documentación
5. Envía un Pull Request

## 📄 Licencia

MIT License - ver archivo LICENSE para detalles.

## 🆘 Soporte

- **Issues**: GitHub Issues
- **Discord**: [Enlace al Discord]
- **Email**: support@rpsarena.com

---

**¡La API está lista para que otros proyectos interactúen con tu juego Guerra de Elementos de forma segura y eficiente!** 🎮⚡