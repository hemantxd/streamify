import { Router } from 'express';
import { protect } from '../middleware/protect.js';
import {
  getNotifications,
  markNotificationRead,
  markAllRead,
} from '../controllers/notification.controller.js';

const router = Router();

router.get('/', protect, getNotifications);
router.put('/:notificationId/read', protect, markNotificationRead);
router.put('/read-all', protect, markAllRead);

export default router;