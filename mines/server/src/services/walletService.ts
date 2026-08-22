import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class WalletService {
  static async getWallet() {
    let wallet = await prisma.demoWallet.findUnique({
      where: { id: 'default' }
    });

    if (!wallet) {
      const config = await prisma.gameConfiguration.findUnique({ where: { id: 'default' } });
      const startingBalance = config?.startingDemoBalance ?? 10000.0;
      wallet = await prisma.demoWallet.create({
        data: {
          id: 'default',
          balance: startingBalance
        }
      });
    }

    return wallet;
  }

  static async updateBalance(amountDelta: number) {
    const wallet = await this.getWallet();
    const newBalance = Math.max(0, Math.round((wallet.balance + amountDelta) * 100) / 100);
    
    return await prisma.demoWallet.update({
      where: { id: 'default' },
      data: { balance: newBalance }
    });
  }

  static async resetBalance(targetBalance?: number) {
    const config = await prisma.gameConfiguration.findUnique({ where: { id: 'default' } });
    const balance = targetBalance ?? config?.startingDemoBalance ?? 10000.0;

    return await prisma.demoWallet.update({
      where: { id: 'default' },
      data: { balance }
    });
  }
}
