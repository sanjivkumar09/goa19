import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'mines_admin_super_secret_jwt_key_2026_x99';

export class AdminService {
  static async getConfig() {
    let config = await prisma.gameConfiguration.findUnique({
      where: { id: 'default' }
    });

    if (!config) {
      config = await prisma.gameConfiguration.create({
        data: {
          id: 'default',
          boardRows: 5,
          boardColumns: 5,
          defaultMineCount: 5,
          minMineCount: 1,
          maxMineCount: 24,
          minBet: 10,
          maxBet: 50000,
          startingDemoBalance: 10000,
          maxDemoBalance: 1000000,
          minDemoBalance: 0,
          autoResetBalance: true,
          houseEdge: 0.05,
          maxAllowedMultiplier: 10000,
          maxPayoutPerGame: 1000000,
          emergencyStop: false,
          maintenanceMode: false
        }
      });
    } else if (config.defaultMineCount === 3) {
      config = await prisma.gameConfiguration.update({
        where: { id: 'default' },
        data: { defaultMineCount: 5 }
      });
    }

    return config;
  }

  static async updateConfig(data: Partial<{
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
  }>) {
    await this.getConfig(); // ensure default exists
    return await prisma.gameConfiguration.update({
      where: { id: 'default' },
      data
    });
  }

  static async getStats() {
    const rounds = await prisma.gameRound.findMany();
    
    let totalGames = rounds.length;
    let totalBets = 0;
    let totalPayouts = 0;
    let totalMineHits = 0;
    let totalCashOuts = 0;
    let sumMultiplier = 0;

    for (const r of rounds) {
      totalBets += r.betAmount;
      totalPayouts += r.payout;
      if (r.status === 'LOST') totalMineHits++;
      if (r.status === 'CASHED_OUT' || r.status === 'WON') {
        totalCashOuts++;
        sumMultiplier += r.multiplier;
      }
    }

    const houseProfit = totalBets - totalPayouts;
    const winRate = totalGames > 0 ? (totalCashOuts / totalGames) * 100 : 0;
    const averageBet = totalGames > 0 ? totalBets / totalGames : 0;
    const averageMultiplier = totalCashOuts > 0 ? sumMultiplier / totalCashOuts : 1.0;

    return {
      totalGames,
      totalBets: Math.round(totalBets * 100) / 100,
      totalPayouts: Math.round(totalPayouts * 100) / 100,
      houseProfit: Math.round(houseProfit * 100) / 100,
      totalMineHits,
      totalCashOuts,
      winRate: Math.round(winRate * 100) / 100,
      averageBet: Math.round(averageBet * 100) / 100,
      averageMultiplier: Math.round(averageMultiplier * 100) / 100
    };
  }

  static async toggleEmergencyStop(enabled?: boolean) {
    const config = await this.getConfig();
    const targetState = enabled !== undefined ? enabled : !config.emergencyStop;
    
    return await prisma.gameConfiguration.update({
      where: { id: 'default' },
      data: { emergencyStop: targetState }
    });
  }

  static verifyPassword(password: string): boolean {
    const expectedPassword = process.env.ADMIN_PASSWORD || 'change_this_password';
    return password === expectedPassword;
  }

  static createToken(): string {
    return jwt.sign({ role: 'admin' }, ADMIN_SESSION_SECRET, { expiresIn: '24h' });
  }
}
