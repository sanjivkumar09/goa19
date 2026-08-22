import { Request, Response } from 'express';
import { AdminService } from '../services/adminService.js';
import { GameEngine } from '../services/gameEngine.js';
import { z } from 'zod';

const loginSchema = z.object({
  password: z.string()
});

const updateConfigSchema = z.object({
  boardRows: z.number().int().min(3).max(10).optional(),
  boardColumns: z.number().int().min(3).max(10).optional(),
  defaultMineCount: z.number().int().min(1).optional(),
  minMineCount: z.number().int().min(1).optional(),
  maxMineCount: z.number().int().min(1).optional(),
  minBet: z.number().positive().optional(),
  maxBet: z.number().positive().optional(),
  startingDemoBalance: z.number().positive().optional(),
  maxDemoBalance: z.number().positive().optional(),
  minDemoBalance: z.number().min(0).optional(),
  autoResetBalance: z.boolean().optional(),
  houseEdge: z.number().min(0).max(0.5).optional(),
  maxAllowedMultiplier: z.number().positive().optional(),
  maxPayoutPerGame: z.number().positive().optional(),
  emergencyStop: z.boolean().optional(),
  maintenanceMode: z.boolean().optional()
});

export class AdminController {
  static async login(req: Request, res: Response) {
    try {
      const parsed = loginSchema.parse(req.body);
      const isValid = AdminService.verifyPassword(parsed.password);

      if (!isValid) {
        return res.status(401).json({ error: 'Invalid admin password' });
      }

      const token = AdminService.createToken();
      return res.json({ success: true, token });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async getConfig(req: Request, res: Response) {
    try {
      const config = await AdminService.getConfig();
      return res.json({ success: true, config });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async updateConfig(req: Request, res: Response) {
    try {
      const parsed = updateConfigSchema.parse(req.body);
      const updated = await AdminService.updateConfig(parsed);
      return res.json({ success: true, config: updated });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async getStats(req: Request, res: Response) {
    try {
      const stats = await AdminService.getStats();
      return res.json({ success: true, stats });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async getHistory(req: Request, res: Response) {
    try {
      const history = await GameEngine.getHistory(100);
      return res.json({ success: true, history });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async toggleEmergencyStop(req: Request, res: Response) {
    try {
      const { enabled } = req.body || {};
      const config = await AdminService.toggleEmergencyStop(enabled);
      return res.json({ success: true, emergencyStop: config.emergencyStop });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
}
