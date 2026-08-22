export interface GameRoundDTO {
  id: string;
  createdAt: Date;
  completedAt?: Date | null;
  betAmount: number;
  mineCount: number;
  boardRows: number;
  boardColumns: number;
  selectedTiles: number[];
  multiplier: number;
  status: 'PLAYING' | 'WON' | 'LOST' | 'CASHED_OUT';
  payout: number;
  nextMultiplier?: number;
  minePositions?: number[]; // Only populated when game is complete
}

export interface GameConfigDTO {
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

export interface SystemStatsDTO {
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
