import { Router } from 'express';
import { AdminController } from '../controllers/adminController.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.post('/login', AdminController.login);
router.get('/config', AdminController.getConfig);
router.put('/config', requireAdmin, AdminController.updateConfig);
router.get('/stats', requireAdmin, AdminController.getStats);
router.get('/history', requireAdmin, AdminController.getHistory);
router.post('/emergency-stop', requireAdmin, AdminController.toggleEmergencyStop);

export default router;
