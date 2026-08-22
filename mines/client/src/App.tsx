import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { BettingPanel } from './components/BettingPanel';
import { GameBoard } from './components/GameBoard';
import { GameStats } from './components/GameStats';
import { CashOutButton } from './components/CashOutButton';
import { RecentHistory } from './components/RecentHistory';
import { HistoryModal } from './components/HistoryModal';
import { LossModal } from './components/LossModal';
import { WinModal } from './components/WinModal';

import { GameRound, GameConfig, GameStatus } from './types';
import { api } from './services/api';
import { soundEngine } from './utils/audio';
import { triggerWinConfetti } from './utils/canvasConfetti';

export function App() {
  // Config & Wallet
  const [config, setConfig] = useState<GameConfig | null>(null);
  const [balance, setBalance] = useState<number>(0);
  
  // Game Round State
  const [activeRound, setActiveRound] = useState<GameRound | null>(null);
  const [betAmount, setBetAmount] = useState<number>(100);
  const [mineCount, setMineCount] = useState<number>(5);
  const [status, setStatus] = useState<GameStatus>('IDLE');
  
  // History
  const [history, setHistory] = useState<GameRound[]>([]);
  const [selectedHistoryRound, setSelectedHistoryRound] = useState<GameRound | null>(null);

  // Sound
  const [isMuted, setIsMuted] = useState<boolean>(soundEngine.getMuted());

  // Modals
  const [isLossModalOpen, setIsLossModalOpen] = useState<boolean>(false);
  const [isWinModalOpen, setIsWinModalOpen] = useState<boolean>(false);
  
  // UI Loading / Error
  const [error, setError] = useState<string | null>(null);
  const [isRevealing, setIsRevealing] = useState<boolean>(false);

  // Initialize data and check for active game on mount (Page Refresh Recovery)
  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    try {
      const [configRes, walletRes, activeRes, historyRes] = await Promise.all([
        api.getConfig(),
        api.getWallet(),
        api.getActiveRound(),
        api.getHistory(20)
      ]);

      if (configRes?.config) {
        setConfig(configRes.config);
        setMineCount(configRes.config.defaultMineCount || 5);
      }
      if (walletRes?.wallet) {
        setBalance(walletRes.wallet.balance);
      }
      if (historyRes?.history) {
        setHistory(historyRes.history);
      }

      // Restore active game if refreshing mid-game!
      if (activeRes?.round) {
        setActiveRound(activeRes.round);
        setBetAmount(activeRes.round.betAmount);
        setMineCount(activeRes.round.mineCount);
        setStatus('PLAYING');
      }
    } catch (err: any) {
      console.error('App initialization error:', err);
      if (err.message && err.message.includes('UNAUTHORIZED')) {
        window.location.href = '/login';
      }
    }
  };

  const reloadHistory = async () => {
    try {
      const res = await api.getHistory(20);
      setHistory(res.history);
    } catch (err) {
      console.error('Failed to reload history:', err);
    }
  };

  const reloadWallet = async () => {
    try {
      const res = await api.getWallet();
      if (res?.wallet) {
        setBalance(res.wallet.balance);
      }
    } catch (err) {
      console.error('Failed to reload wallet:', err);
    }
  };

  // 1. Start Game
  const handleStartGame = async () => {
    setError(null);
    try {
      const res = await api.startGame(betAmount, mineCount);
      setActiveRound(res.round);
      setStatus('PLAYING');
      if (typeof (res as any).walletBalance === 'number') {
        setBalance((res as any).walletBalance);
      } else {
        setBalance(prev => Math.max(0, prev - betAmount));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to start game');
      soundEngine.playMineExplosion();
      reloadWallet();
    }
  };

  // 2. Select Tile
  const handleTileClick = async (tileIndex: number) => {
    if (!activeRound || status !== 'PLAYING' || isRevealing) return;
    setIsRevealing(true);
    setError(null);

    try {
      const res = await api.selectTile(activeRound.id, tileIndex);
      
      if (typeof (res as any).walletBalance === 'number') {
        setBalance((res as any).walletBalance);
      }

      if (res.hitMine) {
        // Mine hit!
        soundEngine.playMineExplosion();
        setActiveRound(res.round);
        setStatus('LOST');
        
        // Show loss modal after short delay for animation
        setTimeout(() => {
          setIsLossModalOpen(true);
          reloadHistory();
          reloadWallet();
        }, 1200);
      } else {
        // Safe tile gem!
        const safePicksCount = res.round.selectedTiles.length;
        soundEngine.playGemReveal(safePicksCount);
        setActiveRound(res.round);

        if (res.round.status === 'WON') {
          // All safe tiles found!
          setStatus('WON');
          soundEngine.playCashOut();
          triggerWinConfetti();
          setTimeout(() => {
            setIsWinModalOpen(true);
            reloadHistory();
            reloadWallet();
          }, 800);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error revealing tile');
    } finally {
      setIsRevealing(false);
    }
  };

  // 3. Cash Out
  const handleCashOut = async () => {
    if (!activeRound || status !== 'PLAYING') return;

    try {
      const res = await api.cashout(activeRound.id);
      setActiveRound(res.round);
      setStatus('CASHED_OUT');
      if (typeof (res as any).walletBalance === 'number') {
        setBalance((res as any).walletBalance);
      }
      triggerWinConfetti();
      soundEngine.playCashOut();

      setTimeout(() => {
        setIsWinModalOpen(true);
        reloadHistory();
        reloadWallet();
      }, 600);
    } catch (err: any) {
      setError(err.message || 'Cash out failed');
      reloadWallet();
    }
  };

  const handlePlayAgain = () => {
    setIsLossModalOpen(false);
    setIsWinModalOpen(false);
    setActiveRound(null);
    setStatus('IDLE');
    reloadWallet();
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      
      {/* Navbar */}
      <Navbar
        balance={balance}
        isMuted={isMuted}
        onToggleSound={() => setIsMuted(soundEngine.toggleMute())}
        onRefreshWallet={reloadWallet}
      />

      {/* Main Game Interface */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-center space-y-6">
        
        {/* Maintenance Banner */}
        {config?.maintenanceMode && (
          <div className="w-full bg-amber-950/80 border border-amber-500 p-4 rounded-2xl text-center text-amber-200 text-sm font-bold animate-pulse">
            ⚠️ Game is currently in maintenance mode. Please try again later.
          </div>
        )}

        {/* Emergency Stop Banner */}
        {config?.emergencyStop && (
          <div className="w-full bg-rose-950/80 border border-rose-500 p-4 rounded-2xl text-center text-rose-200 text-sm font-bold animate-pulse">
            🚨 Emergency Stop is enabled by Admin. New games are suspended.
          </div>
        )}

        {/* Top Grid & Betting Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Betting Panel */}
          <div className="lg:col-span-4 order-2 lg:order-1">
            <BettingPanel
              betAmount={betAmount}
              setBetAmount={setBetAmount}
              mineCount={mineCount}
              setMineCount={setMineCount}
              minBet={config?.minBet || 10}
              maxBet={config?.maxBet || 50000}
              minMines={config?.minMineCount || 1}
              maxMines={config?.maxMineCount || 24}
              balance={balance}
              isPlaying={status === 'PLAYING'}
              onStartGame={handleStartGame}
              error={error}
            />
          </div>

          {/* Right Column: Game Board & Live Stats */}
          <div className="lg:col-span-8 order-1 lg:order-2 flex flex-col space-y-5">
            
            {/* Live Stats */}
            <GameStats
              cellsOpened={activeRound?.selectedTiles.length || 0}
              mineCount={activeRound?.mineCount || mineCount}
              currentMultiplier={activeRound?.multiplier || 1.0}
              betAmount={activeRound?.betAmount || betAmount}
            />

            {/* Cash Out Button */}
            <CashOutButton
              isPlaying={status === 'PLAYING'}
              canCashOut={(activeRound?.selectedTiles.length || 0) > 0}
              betAmount={activeRound?.betAmount || betAmount}
              multiplier={activeRound?.multiplier || 1.0}
              onCashOut={handleCashOut}
            />

            {/* Game Board Grid */}
            <GameBoard
              selectedTiles={activeRound?.selectedTiles || []}
              minePositions={activeRound?.minePositions || []}
              isPlaying={status === 'PLAYING'}
              isRevealing={isRevealing}
              onTileClick={handleTileClick}
              status={status}
              nextMultiplier={activeRound?.nextMultiplier}
            />

          </div>

        </div>

        {/* Bottom Recent History Bar */}
        <RecentHistory
          history={history}
          onSelectRound={setSelectedHistoryRound}
        />

      </main>

      {/* Footer */}
      <footer className="w-full bg-[#0F172A] border-t border-slate-800/80 py-4 text-center text-xs text-slate-500 font-semibold">
        MINES — Real-time Provably Fair Gaming &copy; 2026. Synchronized with DIU-win Platform.
      </footer>

      {/* Modals */}
      <HistoryModal
        round={selectedHistoryRound}
        onClose={() => setSelectedHistoryRound(null)}
      />

      <LossModal
        isOpen={isLossModalOpen}
        betAmount={activeRound?.betAmount || betAmount}
        multiplierReached={activeRound?.multiplier || 1.0}
        onPlayAgain={handlePlayAgain}
        onClose={() => setIsLossModalOpen(false)}
      />

      <WinModal
        isOpen={isWinModalOpen}
        betAmount={activeRound?.betAmount || betAmount}
        multiplier={activeRound?.multiplier || 1.0}
        payout={activeRound?.payout || 0}
        onPlayAgain={handlePlayAgain}
        onClose={() => setIsWinModalOpen(false)}
      />

    </div>
  );
}
