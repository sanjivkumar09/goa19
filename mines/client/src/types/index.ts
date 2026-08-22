export type GameStatus = 'IDLE' | 'STARTING' | 'PLAYING' | 'WON' | 'LOST' | 'CASHED_OUT' | 'REVEALING';

export interface GameRound {
  id: string;
  createdAt: string;
  completedAt?: string | null;
  betAmount: number;
  mineCount: number;
  boardRows: number;
  boardColumns: number;
  selectedTiles: number[];
  multiplier: number;
  nextMultiplier?: number;
  status: GameStatus;
  payout: number;
  minePositions?: number[];
}

export interface DemoWallet {
  id: string;
  balance: number;
  updatedAt: string;
}

export interface GameConfig {
  boardRows: number;
  boardColumns: number;
  defaultMineCount: number;
  minMineCount: number;
  maxMineCount: number;
  minBet: number;
  maxBet: number;
  startingDemoBalance: number;
  maxDemoBalance: number;
  minDemoBalance: number;
  autoResetBalance: boolean;
  houseEdge: number;
  maxAllowedMultiplier: number;
  maxPayoutPerGame: number;
  emergencyStop: boolean;
  maintenanceMode: boolean;
}

export interface SystemStats {
  totalGames: number;
  totalBets: number;
  totalPayouts: number;
  houseProfit: number;
  totalMineHits: number;
  totalCashOuts: number;
  winRate: number;
  averageBet: number;
  averageMultiplier: number;
}
