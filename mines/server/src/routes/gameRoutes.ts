import { Router } from 'express';
import { GameController } from '../controllers/gameController.js';

const router = Router();

router.post('/start', GameController.start);
router.post('/select-tile', GameController.selectTile);
router.post('/cashout', GameController.cashout);
router.get('/active', GameController.getActive);
router.get('/history', GameController.getHistory);
router.get('/:id', GameController.getById);

export default router;
