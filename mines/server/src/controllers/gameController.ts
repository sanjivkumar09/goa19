import { Request, Response } from 'express';
import { GameEngine } from '../services/gameEngine.js';
import { z } from 'zod';

const startGameSchema = z.object({
  betAmount: z.number().positive(),
  mineCount: z.number().int().min(1)
});

const selectTileSchema = z.object({
  roundId: z.string().uuid(),
  tileIndex: z.number().int().min(0)
});

const cashoutSchema = z.object({
  roundId: z.string().uuid()
});

export class GameController {
  static async start(req: Request, res: Response) {
    try {
      const parsed = startGameSchema.parse(req.body);
      const round = await GameEngine.startGame(parsed.betAmount, parsed.mineCount);
      return res.status(201).json({ success: true, round });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async selectTile(req: Request, res: Response) {
    try {
      const parsed = selectTileSchema.parse(req.body);
      const result = await GameEngine.selectTile(parsed.roundId, parsed.tileIndex);
      return res.json({ success: true, ...result });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async cashout(req: Request, res: Response) {
    try {
      const parsed = cashoutSchema.parse(req.body);
      const round = await GameEngine.cashOut(parsed.roundId);
      return res.json({ success: true, round });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async getActive(req: Request, res: Response) {
    try {
      const round = await GameEngine.getActiveRound();
      return res.json({ success: true, round });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async getHistory(req: Request, res: Response) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const history = await GameEngine.getHistory(limit);
      return res.json({ success: true, history });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const round = await GameEngine.getRoundById(id);
      if (!round) return res.status(404).json({ error: 'Game round not found' });
      return res.json({ success: true, round });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
}
