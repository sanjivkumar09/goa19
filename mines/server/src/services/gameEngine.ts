import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { calculateMultiplier, calculatePayout } from '../utils/math.js';
import { WalletService } from './walletService.js';
import { AdminService } from './adminService.js';
import { GameRoundDTO } from '../types/index.js';

const prisma = new PrismaClient();

export class GameEngine {
  /**
   * Generates N unique random mine positions on a grid of size totalTiles.
   */
  private static generateMines(totalTiles: number, count: number): number[] {
    const positions = new Set<number>();
    while (positions.size < count) {
      const rand = crypto.randomInt(0, totalTiles);
      positions.add(rand);
    }
    return Array.from(positions).sort((a, b) => a - b);
  }

  static async startGame(betAmount: number, mineCount: number): Promise<GameRoundDTO> {
    const config = await AdminService.getConfig();

    if (config.maintenanceMode) {
      throw new Error('Game temporarily unavailable. Maintenance mode is enabled.');
    }
    if (config.emergencyStop) {
      throw new Error('New game creations are temporarily suspended by admin.');
    }

    if (betAmount < config.minBet || betAmount > config.maxBet) {
      throw new Error(`Bet amount must be between ₹${config.minBet} and ₹${config.maxBet}`);
    }

    const totalTiles = config.boardRows * config.boardColumns;
    if (mineCount < config.minMineCount || mineCount > config.maxMineCount || mineCount >= totalTiles) {
      throw new Error(`Mine count must be between ${config.minMineCount} and ${Math.min(config.maxMineCount, totalTiles - 1)}`);
    }

    // Check balance
    const wallet = await WalletService.getWallet();
    if (wallet.balance < betAmount) {
      throw new Error('Insufficient wallet balance');
    }

    // Check if there is already an active game round, if so fail or auto-forfeit
    const existingActive = await prisma.gameRound.findFirst({
      where: { status: 'PLAYING' }
    });
    if (existingActive) {
      throw new Error('An active game round is already in progress. Please complete or cash out your round.');
    }

    // Deduct bet from wallet
    await WalletService.updateBalance(-betAmount);

    // Generate mines securely
    const minePositions = this.generateMines(totalTiles, mineCount);

    const round = await prisma.gameRound.create({
      data: {
        betAmount,
        mineCount,
        boardRows: config.boardRows,
        boardColumns: config.boardColumns,
        minePositions: JSON.stringify(minePositions),
        selectedTiles: JSON.stringify([]),
        houseEdge: config.houseEdge,
        multiplier: 1.0,
        status: 'PLAYING',
        payout: 0.0
      }
    });

    const nextMult = calculateMultiplier(totalTiles, mineCount, 1, config.houseEdge);

    return {
      id: round.id,
      createdAt: round.createdAt,
      betAmount: round.betAmount,
      mineCount: round.mineCount,
      boardRows: round.boardRows,
      boardColumns: round.boardColumns,
      selectedTiles: [],
      multiplier: 1.0,
      nextMultiplier: nextMult,
      status: 'PLAYING',
      payout: 0.0
    };
  }

  static async selectTile(roundId: string, tileIndex: number): Promise<{
    round: GameRoundDTO;
    hitMine: boolean;
    revealedTile: 'GEM' | 'MINE';
  }> {
    const round = await prisma.gameRound.findUnique({
      where: { id: roundId }
    });

    if (!round) throw new Error('Game round not found');
    if (round.status !== 'PLAYING') throw new Error('Game round is not active');

    const totalTiles = round.boardRows * round.boardColumns;
    if (tileIndex < 0 || tileIndex >= totalTiles) {
      throw new Error('Invalid tile selection index');
    }

    const selectedTiles: number[] = JSON.parse(round.selectedTiles);
    if (selectedTiles.includes(tileIndex)) {
      throw new Error('Tile has already been selected');
    }

    const minePositions: number[] = JSON.parse(round.minePositions);
    const hitMine = minePositions.includes(tileIndex);

    if (hitMine) {
      // Game Lost!
      const updated = await prisma.gameRound.update({
        where: { id: roundId },
        data: {
          status: 'LOST',
          completedAt: new Date(),
          payout: 0.0
        }
      });

      return {
        round: {
          id: updated.id,
          createdAt: updated.createdAt,
          completedAt: updated.completedAt,
          betAmount: updated.betAmount,
          mineCount: updated.mineCount,
          boardRows: updated.boardRows,
          boardColumns: updated.boardColumns,
          selectedTiles: [...selectedTiles, tileIndex],
          multiplier: updated.multiplier,
          status: 'LOST',
          payout: 0.0,
          minePositions
        },
        hitMine: true,
        revealedTile: 'MINE'
      };
    } else {
      // Safe tile revealed!
      const newSelected = [...selectedTiles, tileIndex];
      const picksCount = newSelected.length;
      const newMultiplier = calculateMultiplier(totalTiles, round.mineCount, picksCount, round.houseEdge);
      const safeTilesCount = totalTiles - round.mineCount;

      let newStatus: 'PLAYING' | 'WON' = 'PLAYING';
      let payout = 0.0;
      let completedAt: Date | undefined = undefined;

      // Check if all safe tiles found
      if (picksCount === safeTilesCount) {
        newStatus = 'WON';
        payout = calculatePayout(round.betAmount, newMultiplier);
        completedAt = new Date();
        await WalletService.updateBalance(payout);
      }

      const updated = await prisma.gameRound.update({
        where: { id: roundId },
        data: {
          selectedTiles: JSON.stringify(newSelected),
          multiplier: newMultiplier,
          status: newStatus,
          payout,
          completedAt
        }
      });

      const nextMult = picksCount < safeTilesCount 
        ? calculateMultiplier(totalTiles, round.mineCount, picksCount + 1, round.houseEdge)
        : newMultiplier;

      return {
        round: {
          id: updated.id,
          createdAt: updated.createdAt,
          completedAt: updated.completedAt,
          betAmount: updated.betAmount,
          mineCount: updated.mineCount,
          boardRows: updated.boardRows,
          boardColumns: updated.boardColumns,
          selectedTiles: newSelected,
          multiplier: newMultiplier,
          nextMultiplier: nextMult,
          status: newStatus,
          payout,
          ...(newStatus === 'WON' ? { minePositions } : {})
        },
        hitMine: false,
        revealedTile: 'GEM'
      };
    }
  }

  static async cashOut(roundId: string): Promise<GameRoundDTO> {
    const round = await prisma.gameRound.findUnique({
      where: { id: roundId }
    });

    if (!round) throw new Error('Game round not found');
    if (round.status !== 'PLAYING') throw new Error('Game round is not active');

    const selectedTiles: number[] = JSON.parse(round.selectedTiles);
    if (selectedTiles.length === 0) {
      throw new Error('Must reveal at least one safe tile before cashing out');
    }

    const payout = calculatePayout(round.betAmount, round.multiplier);
    await WalletService.updateBalance(payout);

    const minePositions: number[] = JSON.parse(round.minePositions);
    const updated = await prisma.gameRound.update({
      where: { id: roundId },
      data: {
        status: 'CASHED_OUT',
        payout,
        completedAt: new Date()
      }
    });

    return {
      id: updated.id,
      createdAt: updated.createdAt,
      completedAt: updated.completedAt,
      betAmount: updated.betAmount,
      mineCount: updated.mineCount,
      boardRows: updated.boardRows,
      boardColumns: updated.boardColumns,
      selectedTiles,
      multiplier: updated.multiplier,
      status: 'CASHED_OUT',
      payout,
      minePositions
    };
  }

  static async getActiveRound(): Promise<GameRoundDTO | null> {
    const round = await prisma.gameRound.findFirst({
      where: { status: 'PLAYING' },
      orderBy: { createdAt: 'desc' }
    });

    if (!round) return null;

    const totalTiles = round.boardRows * round.boardColumns;
    const selectedTiles: number[] = JSON.parse(round.selectedTiles);
    const nextMult = selectedTiles.length < totalTiles - round.mineCount
      ? calculateMultiplier(totalTiles, round.mineCount, selectedTiles.length + 1, round.houseEdge)
      : round.multiplier;

    return {
      id: round.id,
      createdAt: round.createdAt,
      betAmount: round.betAmount,
      mineCount: round.mineCount,
      boardRows: round.boardRows,
      boardColumns: round.boardColumns,
      selectedTiles,
      multiplier: round.multiplier,
      nextMultiplier: nextMult,
      status: 'PLAYING',
      payout: 0.0
    };
  }

  static async getHistory(limit: number = 20): Promise<GameRoundDTO[]> {
    const rounds = await prisma.gameRound.findMany({
      where: {
        status: { in: ['WON', 'LOST', 'CASHED_OUT'] }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return rounds.map(r => ({
      id: r.id,
      createdAt: r.createdAt,
      completedAt: r.completedAt,
      betAmount: r.betAmount,
      mineCount: r.mineCount,
      boardRows: r.boardRows,
      boardColumns: r.boardColumns,
      selectedTiles: JSON.parse(r.selectedTiles),
      multiplier: r.multiplier,
      status: r.status as any,
      payout: r.payout,
      minePositions: JSON.parse(r.minePositions)
    }));
  }

  static async getRoundById(id: string): Promise<GameRoundDTO | null> {
    const round = await prisma.gameRound.findUnique({
      where: { id }
    });
    if (!round) return null;

    return {
      id: round.id,
      createdAt: round.createdAt,
      completedAt: round.completedAt,
      betAmount: round.betAmount,
      mineCount: round.mineCount,
      boardRows: round.boardRows,
      boardColumns: round.boardColumns,
      selectedTiles: JSON.parse(round.selectedTiles),
      multiplier: round.multiplier,
      status: round.status as any,
      payout: round.payout,
      minePositions: round.status !== 'PLAYING' ? JSON.parse(round.minePositions) : undefined
    };
  }
}
