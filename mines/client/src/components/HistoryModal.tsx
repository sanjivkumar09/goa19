import React from 'react';
import { X, Gem, Bomb, Calendar, Hash, CheckCircle2, XCircle } from 'lucide-react';
import { GameRound } from '../types';
import { formatCurrency, formatMultiplier } from '../utils/math';

interface HistoryModalProps {
  round: GameRound | null;
  onClose: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ round, onClose }) => {
  if (!round) return null;

  const isWin = round.status === 'WON' || round.status === 'CASHED_OUT';
  const totalTiles = (round.boardRows || 5) * (round.boardColumns || 5);
  const tiles = Array.from({ length: totalTiles }, (_, i) => i);
  const minePositions = round.minePositions || [];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#1E293B] border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700 pb-3">
          <div className="flex items-center gap-2">
            {isWin ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-400" />
            )}
            <h3 className="text-lg font-black text-white uppercase tracking-wider">
              Round Details #{round.id.slice(0, 8)}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Game Specs Breakdown */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-[#0F172A] p-3 rounded-xl border border-slate-800 space-y-1">
            <div className="text-slate-400 font-bold uppercase flex items-center gap-1">
              <Hash className="w-3.5 h-3.5 text-cyan-400" /> Game ID
            </div>
            <div className="font-mono text-white font-semibold truncate">{round.id}</div>
          </div>

          <div className="bg-[#0F172A] p-3 rounded-xl border border-slate-800 space-y-1">
            <div className="text-slate-400 font-bold uppercase flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Date & Time
            </div>
            <div className="text-white font-semibold">{new Date(round.createdAt).toLocaleString()}</div>
          </div>

          <div className="bg-[#0F172A] p-3 rounded-xl border border-slate-800 space-y-1">
            <div className="text-slate-400 font-bold uppercase">Bet Amount</div>
            <div className="text-sm font-extrabold text-white">{formatCurrency(round.betAmount)}</div>
          </div>

          <div className="bg-[#0F172A] p-3 rounded-xl border border-slate-800 space-y-1">
            <div className="text-slate-400 font-bold uppercase">Result</div>
            <div className={`text-sm font-extrabold ${isWin ? 'text-emerald-400' : 'text-rose-400'}`}>
              {round.status}
            </div>
          </div>

          <div className="bg-[#0F172A] p-3 rounded-xl border border-slate-800 space-y-1">
            <div className="text-slate-400 font-bold uppercase">Final Multiplier</div>
            <div className="text-sm font-extrabold text-cyan-400">{formatMultiplier(round.multiplier)}</div>
          </div>

          <div className="bg-[#0F172A] p-3 rounded-xl border border-slate-800 space-y-1">
            <div className="text-slate-400 font-bold uppercase">Payout Received</div>
            <div className="text-sm font-extrabold text-emerald-400">{formatCurrency(round.payout)}</div>
          </div>
        </div>

        {/* Board Reconstruction View */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider">
            <span>Reconstructed Grid</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-emerald-400"><Gem className="w-3.5 h-3.5" /> Safe ({round.selectedTiles.length})</span>
              <span className="flex items-center gap-1 text-rose-400"><Bomb className="w-3.5 h-3.5" /> Mines ({round.mineCount})</span>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2 p-3 bg-[#0F172A] rounded-2xl border border-slate-800">
            {tiles.map((tileIndex) => {
              const isSelected = round.selectedTiles.includes(tileIndex);
              const isMine = minePositions.includes(tileIndex);

              return (
                <div
                  key={tileIndex}
                  className={`aspect-square rounded-xl flex items-center justify-center font-bold text-xs border ${
                    isSelected && !isMine
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-glow-green'
                      : isMine
                      ? 'bg-rose-950/80 border-rose-500 text-rose-300 shadow-glow-red'
                      : 'bg-slate-800/40 border-slate-800 text-slate-600'
                  }`}
                >
                  {isSelected && !isMine && <Gem className="w-4 h-4 text-emerald-300" />}
                  {isMine && <Bomb className="w-4 h-4 text-rose-400" />}
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-xl transition-colors uppercase tracking-wider"
        >
          Close Details
        </button>

      </div>
    </div>
  );
};
