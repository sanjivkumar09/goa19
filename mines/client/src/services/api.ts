import { GameRound, DemoWallet, GameConfig, SystemStats } from '../types';

const API_BASE = '/api/webapi/mines';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('mines_auth_token') || localStorage.getItem('chicken_road_token') || '';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.message || data.error || `HTTP Error ${res.status}`);
  }
  return data;
}

export const api = {
  // Game Endpoints
  async startGame(betAmount: number, mineCount: number): Promise<{ round: GameRound }> {
    const res = await fetch(`${API_BASE}/start`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ betAmount, mineCount })
    });
    return handleResponse(res);
  },

  async selectTile(roundId: string, tileIndex: number): Promise<{
    round: GameRound;
    hitMine: boolean;
    revealedTile: 'GEM' | 'MINE';
  }> {
    const res = await fetch(`${API_BASE}/select-tile`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ roundId, tileIndex })
    });
    return handleResponse(res);
  },

  async cashout(roundId: string): Promise<{ round: GameRound }> {
    const res = await fetch(`${API_BASE}/cashout`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ roundId })
    });
    return handleResponse(res);
  },

  async getActiveRound(): Promise<{ round: GameRound | null }> {
    const res = await fetch(`${API_BASE}/active`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async getHistory(limit: number = 20): Promise<{ history: GameRound[] }> {
    const res = await fetch(`${API_BASE}/history?limit=${limit}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async getRoundById(id: string): Promise<{ round: GameRound }> {
    const res = await fetch(`${API_BASE}/${id}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // Wallet Endpoints
  async getWallet(): Promise<{ wallet: DemoWallet }> {
    const res = await fetch(`${API_BASE}/wallet`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async resetWallet(targetBalance?: number): Promise<{ wallet: DemoWallet }> {
    const res = await fetch(`${API_BASE}/wallet/reset`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ targetBalance })
    });
    return handleResponse(res);
  },

  // Admin Endpoints
  async adminLogin(password: string): Promise<{ token: string }> {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    return handleResponse(res);
  },

  async getConfig(): Promise<{ config: GameConfig }> {
    const res = await fetch(`${API_BASE}/config`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async updateConfig(config: Partial<GameConfig>, token: string): Promise<{ config: GameConfig }> {
    const res = await fetch(`${API_BASE}/config`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(config)
    });
    return handleResponse(res);
  },

  async getAdminStats(token: string): Promise<{ stats: SystemStats }> {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(res);
  },

  async toggleEmergencyStop(token: string, enabled?: boolean): Promise<{ emergencyStop: boolean }> {
    const res = await fetch(`${API_BASE}/admin/emergency-stop`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ enabled })
    });
    return handleResponse(res);
  }
};
