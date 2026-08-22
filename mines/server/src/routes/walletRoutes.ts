import { Router } from 'express';
import { WalletController } from '../controllers/walletController.js';

const router = Router();

router.get('/', WalletController.getWallet);
router.post('/reset', WalletController.resetWallet);

export default router;
