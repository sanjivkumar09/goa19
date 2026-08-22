import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gem, Bomb } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface GameBoardProps {
  boardRows?: number;
  boardColumns?: number;
  selectedTiles: number[];
  minePositions?: number[];
  isPlaying: boolean;
  isRevealing: boolean;
  onTileClick: (index: number) => void;
  status: string;
  nextMultiplier?: number;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  boardRows = 5,
  boardColumns = 5,
  selectedTiles,
  minePositions = [],
  isPlaying,
  isRevealing,
  onTileClick,
  status,
  nextMultiplier
}) => {
  const totalTiles = boardRows * boardColumns;
  const tiles = Array.from({ length: totalTiles }, (_, i) => i);

  const isGameOver = status === 'WON' || status === 'LOST' || status === 'CASHED_OUT';

  const handleTileClick = (index: number) => {
    if (!isPlaying || isRevealing || selectedTiles.includes(index) || isGameOver) return;
    soundEngine.playTileClick();
    onTileClick(index);
  };

  return (
    <div className="relative w-full max-w-[540px] aspect-square mx-auto p-4 sm:p-6 bg-[#111827]/90 backdrop-blur-xl rounded-3xl border border-slate-800 shadow-2xl flex flex-col justify-between">
      
      {/* Top Banner Ticker Bar (1xBet style step multipliers) */}
      <div className="w-full mb-3 bg-[#0F172A] border border-slate-800 rounded-xl p-2 flex items-center justify-between overflow-x-auto gap-2">
        <div className="flex items-center gap-1 text-xs font-bold text-slate-400 shrink-0">
          <span>Next Pick:</span>
          <span className="text-cyan-400 text-sm font-extrabold">
            {nextMultiplier ? `${nextMultiplier.toFixed(2)}×` : '—'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {selectedTiles.length > 0 && (
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-md border border-emerald-800/50">
              {selectedTiles.length} Safe Pick{selectedTiles.length > 1 ? 's' : ''}
            </span>
          )}
          {status === 'PLAYING' && (
            <span className="animate-pulse text-[10px] font-extrabold uppercase text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
              Active Round
            </span>
          )}
        </div>
      </div>

      {/* Grid Container */}
      <div 
        className={`grid gap-2.5 sm:gap-3.5 flex-1 ${
          status === 'LOST' ? 'animate-shake' : ''
        }`}
        style={{
          gridTemplateColumns: `repeat(${boardColumns}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${boardRows}, minmax(0, 1fr))`
        }}
      >
        {tiles.map((tileIndex) => {
          const isSelected = selectedTiles.includes(tileIndex);
          const isMine = minePositions.includes(tileIndex);
          const isRevealedMine = isGameOver && isMine;

          let tileState: 'HIDDEN' | 'SAFE' | 'MINE' = 'HIDDEN';
          if (isSelected) {
            tileState = isMine ? 'MINE' : 'SAFE';
          } else if (isRevealedMine) {
            tileState = 'MINE';
          }

          return (
            <motion.button
              key={tileIndex}
              disabled={!isPlaying || isSelected || isGameOver || isRevealing}
              onClick={() => handleTileClick(tileIndex)}
              whileHover={isPlaying && !isSelected && !isGameOver ? { scale: 1.04 } : {}}
              whileTap={isPlaying && !isSelected && !isGameOver ? { scale: 0.94 } : {}}
              className={`relative w-full h-full rounded-2xl flex items-center justify-center font-bold text-xl cursor-pointer overflow-hidden transition-all duration-200 select-none ${
                tileState === 'HIDDEN'
                  ? 'tile-block border border-slate-600/40 hover:border-cyan-400/50'
                  : tileState === 'SAFE'
                  ? 'tile-safe'
                  : isSelected && isMine
                  ? 'tile-mine animate-bounce'
                  : 'bg-rose-950/60 border border-rose-800/40 opacity-70'
              }`}
            >
              <AnimatePresence mode="wait">
                {tileState === 'SAFE' && (
                  <motion.div
                    key="safe-gem"
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    className="flex items-center justify-center"
                  >
                    <div className="relative">
                      <Gem className="w-7 h-7 sm:w-9 sm:h-9 text-emerald-100 drop-shadow-[0_0_12px_rgba(255,255,255,0.9)]" />
                      {/* Glow particles */}
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping" />
                    </div>
                  </motion.div>
                )}

                {tileState === 'MINE' && (
                  <motion.div
                    key="mine-bomb"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                    className="flex items-center justify-center"
                  >
                    <div className="relative">
                      <Bomb className={`w-7 h-7 sm:w-9 sm:h-9 ${isSelected ? 'text-white' : 'text-rose-400'} drop-shadow-[0_0_15px_rgba(239,68,68,0.9)]`} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Stone block default texture highlight */}
              {tileState === 'HIDDEN' && (
                <div className="absolute top-1 left-2 w-3/4 h-[2px] bg-white/20 rounded-full pointer-events-none" />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Overlay Banner when IDLE */}
      {status === 'IDLE' && (
        <div className="absolute inset-0 bg-[#0F172A]/70 backdrop-blur-[3px] rounded-3xl flex flex-col items-center justify-center p-6 text-center z-10 border border-slate-700/50">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-3 shadow-glow-cyan">
            <Gem className="w-8 h-8 text-cyan-400" />
          </div>
          <h3 className="text-xl font-extrabold text-white mb-1">Ready to Play?</h3>
          <p className="text-xs text-slate-400 max-w-xs mb-4">
            Select your bet amount and mine count in the panel, then click <span className="text-cyan-300 font-bold">Bet & Start Game</span>.
          </p>
        </div>
      )}

    </div>
  );
};
