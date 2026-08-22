import { Request, Response } from 'express';
import { WalletService } from '../services/walletService.js';
import { z } from 'zod';

const resetWalletSchema = z.object({
  targetBalance: z.number().positive().optional()
});

export class WalletController {
  static async getWallet(req: Request, res: Response) {
    try {
      const wallet = await WalletService.getWallet();
      return res.json({ success: true, wallet });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async resetWallet(req: Request, res: Response) {
    try {
      const parsed = resetWalletSchema.parse(req.body || {});
      const wallet = await WalletService.resetBalance(parsed.targetBalance);
      return res.json({ success: true, wallet });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
}
