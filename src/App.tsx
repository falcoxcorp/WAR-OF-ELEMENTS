import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { Web3Provider } from './contexts/Web3Context';
import { GameProvider } from './contexts/GameContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AIAgent from './components/AIAgent';
import LanguageSelector from './components/LanguageSelector';
import Home from './pages/Home';
import Games from './pages/Games';
import CreateGame from './pages/CreateGame';
import PlayerStats from './pages/PlayerStats';
import Leaderboard from './pages/Leaderboard';
import Statistics from './pages/Statistics';
import GameDetail from './pages/GameDetail';
import AdminPanel from './components/AdminPanel';
import Audit from './pages/Audit';
import ApiDocumentation from './components/ApiDocumentation';
import GameDocumentation from './pages/GameDocumentation';
import TechnicalDocumentation from './pages/TechnicalDocumentation';

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <Web3Provider>
        <GameProvider>
          <Router>
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col overflow-x-hidden w-full">
              <Navbar />
              
              <main className="w-full px-2 sm:px-3 lg:px-4 py-3 sm:py-4 lg:py-6 flex-1 overflow-x-hidden">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/games" element={<Games />} />
                  <Route path="/create" element={<CreateGame />} />
                  <Route path="/stats" element={<PlayerStats />} />
                  <Route path="/ranking" element={<Leaderboard />} />
                  <Route path="/statistics" element={<Statistics />} />
                  <Route path="/game/:id" element={<GameDetail />} />
                  <Route path="/admin" element={<AdminPanel />} />
                  <Route path="/audit" element={<Audit />} />
                  <Route path="/api-docs" element={<ApiDocumentation />} />
                  <Route path="/game-docs" element={<GameDocumentation />} />
                  <Route path="/tech-docs" element={<TechnicalDocumentation />} />
                </Routes>
              </main>
              <Footer />
              <AIAgent />
              <Toaster 
                position="top-right"
                toastOptions={{
                  className: 'bg-slate-800 text-white border border-slate-600 text-xs sm:text-sm',
                  duration: 4000,
                  style: {
                    maxWidth: '85vw',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }
                }}
              />
            </div>
          </Router>
        </GameProvider>
      </Web3Provider>
    </I18nextProvider>
  );
}

export default App;