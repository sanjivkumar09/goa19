import { useState, useEffect } from 'react';
import { 
  X, Shield, Sliders, AlertOctagon, History, Save, 
  Percent, Check, AlertTriangle, Layers 
} from 'lucide-react';
import { GameConfig, SystemStats, GameRound } from '../types';
import { api } from '../services/api';
import { formatCurrency, formatMultiplier } from '../utils/math';
import { soundEngine } from '../utils/audio';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
}

type TabType = 'overview' | 'config' | 'house_edge' | 'risk' | 'history';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  token
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [config, setConfig] = useState<GameConfig | null>(null);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [history, setHistory] = useState<GameRound[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states for config
  const [formConfig, setFormConfig] = useState<Partial<GameConfig>>({});

  useEffect(() => {
    if (isOpen && token) {
      loadData();
    }
  }, [isOpen, token]);

  const loadData = async () => {
    setError(null);
    try {
      const [configRes, statsRes, historyRes] = await Promise.all([
        api.getConfig(),
        api.getAdminStats(token),
        api.getHistory(50)
      ]);
      setConfig(configRes.config);
      setFormConfig(configRes.config);
      setStats(statsRes.stats);
      setHistory(historyRes.history);
    } catch (err: any) {
      setError(err.message || 'Failed to load admin data');
    }
  };

  if (!isOpen) return null;

  const handleSaveConfig = async () => {
    setError(null);
    setSaveSuccess(false);

    try {
      const res = await api.updateConfig(formConfig, token);
      setConfig(res.config);
      setFormConfig(res.config);
      setSaveSuccess(true);
      soundEngine.playCashOut();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save settings');
    }
  };

  const handleEmergencyToggle = async () => {
    try {
      const res = await api.toggleEmergencyStop(token);
      setFormConfig((prev: Partial<GameConfig>) => ({ ...prev, emergencyStop: res.emergencyStop }));
      if (config) setConfig({ ...config, emergencyStop: res.emergencyStop });
      soundEngine.playTileClick();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-lg flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-5xl bg-[#111827] border border-purple-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-[#1E293B] px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/30">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-wider">
                Admin Control Dashboard
              </h2>
              <p className="text-xs text-slate-400">
                System configuration, risk controls, house edge & real-time analytics
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-[#0F172A] border-b border-slate-800 px-6 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3.5 px-4 text-xs font-extrabold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'overview'
                ? 'border-purple-500 text-purple-300 bg-purple-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" /> Overview
          </button>

          <button
            onClick={() => setActiveTab('config')}
            className={`py-3.5 px-4 text-xs font-extrabold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'config'
                ? 'border-purple-500 text-purple-300 bg-purple-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" /> Game Configuration
          </button>

          <button
            onClick={() => setActiveTab('house_edge')}
            className={`py-3.5 px-4 text-xs font-extrabold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'house_edge'
                ? 'border-purple-500 text-purple-300 bg-purple-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Percent className="w-4 h-4" /> House Edge
          </button>

          <button
            onClick={() => setActiveTab('risk')}
            className={`py-3.5 px-4 text-xs font-extrabold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'risk'
                ? 'border-purple-500 text-purple-300 bg-purple-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertOctagon className="w-4 h-4" /> Risk & Safety
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`py-3.5 px-4 text-xs font-extrabold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'history'
                ? 'border-purple-500 text-purple-300 bg-purple-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-4 h-4" /> Game Logs
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {error && (
            <div className="p-4 bg-rose-950/60 border border-rose-800 rounded-2xl text-rose-300 text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {saveSuccess && (
            <div className="p-4 bg-emerald-950/60 border border-emerald-800 rounded-2xl text-emerald-300 text-xs font-bold flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>System Configuration updated successfully!</span>
            </div>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && stats && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-[#1E293B] border border-slate-800 p-4 rounded-2xl">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Total Games Played</div>
                  <div className="text-2xl font-black text-white mt-1">{stats.totalGames}</div>
                </div>

                <div className="bg-[#1E293B] border border-slate-800 p-4 rounded-2xl">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Total Demo Bets</div>
                  <div className="text-2xl font-black text-cyan-400 mt-1">{formatCurrency(stats.totalBets)}</div>
                </div>

                <div className="bg-[#1E293B] border border-slate-800 p-4 rounded-2xl">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Total Payouts</div>
                  <div className="text-2xl font-black text-emerald-400 mt-1">{formatCurrency(stats.totalPayouts)}</div>
                </div>

                <div className="bg-[#1E293B] border border-slate-800 p-4 rounded-2xl">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">House Net Profit</div>
                  <div className={`text-2xl font-black mt-1 ${stats.houseProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {formatCurrency(stats.houseProfit)}
                  </div>
                </div>

                <div className="bg-[#1E293B] border border-slate-800 p-4 rounded-2xl">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Average Bet</div>
                  <div className="text-xl font-bold text-slate-200 mt-1">{formatCurrency(stats.averageBet)}</div>
                </div>

                <div className="bg-[#1E293B] border border-slate-800 p-4 rounded-2xl">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Avg Multiplier</div>
                  <div className="text-xl font-bold text-purple-400 mt-1">{formatMultiplier(stats.averageMultiplier)}</div>
                </div>

                <div className="bg-[#1E293B] border border-slate-800 p-4 rounded-2xl">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Mine Explosions</div>
                  <div className="text-xl font-bold text-rose-400 mt-1">{stats.totalMineHits}</div>
                </div>

                <div className="bg-[#1E293B] border border-slate-800 p-4 rounded-2xl">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Successful Cash Outs</div>
                  <div className="text-xl font-bold text-emerald-400 mt-1">{stats.totalCashOuts}</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GAME CONFIGURATION */}
          {activeTab === 'config' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase">Minimum Bet Amount (₹)</label>
                  <input
                    type="number"
                    value={formConfig.minBet || 10}
                    onChange={e => setFormConfig((prev: Partial<GameConfig>) => ({ ...prev, minBet: Number(e.target.value) }))}
                    className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase">Maximum Bet Amount (₹)</label>
                  <input
                    type="number"
                    value={formConfig.maxBet || 50000}
                    onChange={e => setFormConfig((prev: Partial<GameConfig>) => ({ ...prev, maxBet: Number(e.target.value) }))}
                    className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase">Default Mine Count</label>
                  <input
                    type="number"
                    value={formConfig.defaultMineCount || 3}
                    onChange={e => setFormConfig((prev: Partial<GameConfig>) => ({ ...prev, defaultMineCount: Number(e.target.value) }))}
                    className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase">Starting Demo Balance (₹)</label>
                  <input
                    type="number"
                    value={formConfig.startingDemoBalance || 10000}
                    onChange={e => setFormConfig((prev: Partial<GameConfig>) => ({ ...prev, startingDemoBalance: Number(e.target.value) }))}
                    className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={handleSaveConfig}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all uppercase tracking-wider flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Save Configuration
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: HOUSE EDGE SETTINGS */}
          {activeTab === 'house_edge' && (
            <div className="space-y-5">
              <div className="bg-[#1E293B] border border-slate-800 p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-black text-white uppercase">House Edge Percentage</h4>
                    <p className="text-xs text-slate-400">Controls mathematical retention applied to multipliers</p>
                  </div>
                  <div className="text-2xl font-black text-purple-400">
                    {((formConfig.houseEdge || 0.05) * 100).toFixed(1)}%
                  </div>
                </div>

                <div className="grid grid-cols-6 gap-2">
                  {[0, 0.01, 0.02, 0.03, 0.05, 0.10].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => setFormConfig((prev: Partial<GameConfig>) => ({ ...prev, houseEdge: rate }))}
                      className={`py-2 text-xs font-extrabold rounded-xl border transition-all ${
                        formConfig.houseEdge === rate
                          ? 'bg-purple-600 text-white border-purple-400 shadow-glow-purple'
                          : 'bg-[#0F172A] text-slate-300 border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      {(rate * 100).toFixed(0)}%
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleSaveConfig}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all uppercase tracking-wider flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Apply House Edge
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: RISK & SAFETY */}
          {activeTab === 'risk' && (
            <div className="space-y-4">
              <div className="bg-[#1E293B] border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-white uppercase flex items-center gap-2">
                    <AlertOctagon className="w-5 h-5 text-rose-500" /> Emergency Stop
                  </h4>
                  <p className="text-xs text-slate-400">
                    Prevents creation of new game rounds immediately. Allows active games to cash out safely.
                  </p>
                </div>

                <button
                  onClick={handleEmergencyToggle}
                  className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all border ${
                    formConfig.emergencyStop
                      ? 'bg-rose-600 text-white border-rose-500 shadow-glow-red animate-pulse'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  {formConfig.emergencyStop ? 'EMERGENCY STOP ON' : 'ENABLE EMERGENCY STOP'}
                </button>
              </div>

              <div className="bg-[#1E293B] border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-white uppercase flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" /> Maintenance Mode
                  </h4>
                  <p className="text-xs text-slate-400">
                    Displays maintenance banner on frontend and blocks all gameplay requests.
                  </p>
                </div>

                <button
                  onClick={() => setFormConfig((prev: Partial<GameConfig>) => ({ ...prev, maintenanceMode: !prev.maintenanceMode }))}
                  className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all border ${
                    formConfig.maintenanceMode
                      ? 'bg-amber-600 text-white border-amber-500 shadow-glow-purple'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  {formConfig.maintenanceMode ? 'MAINTENANCE ACTIVE' : 'ENABLE MAINTENANCE'}
                </button>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleSaveConfig}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all uppercase tracking-wider flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Save Risk Controls
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: GAME LOGS */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-400 uppercase">Recent System Rounds</div>
              <div className="space-y-2 max-h-[350px] overflow-y-auto">
                {history.map((r: GameRound) => (
                  <div key={r.id} className="bg-[#1E293B] border border-slate-800 p-3 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${r.status === 'LOST' ? 'bg-rose-950 text-rose-400 border border-rose-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'}`}>
                        {r.status}
                      </span>
                      <span className="font-mono text-slate-400">{r.id.slice(0, 8)}</span>
                      <span className="text-slate-300 font-bold">{formatCurrency(r.betAmount)} bet</span>
                      <span className="text-purple-400 font-extrabold">{r.mineCount} Mines</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-cyan-400 font-extrabold">{formatMultiplier(r.multiplier)}</span>
                      <span className="text-emerald-400 font-black">{formatCurrency(r.payout)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
