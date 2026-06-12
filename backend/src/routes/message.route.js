import { Router } from 'express';
import { protect } from '../middleware/protect.js';
import { sendMessage, getMessages, getConversations } from '../controllers/message.controller.js';

const router = Router();

router.get('/conversations', protect, getConversations);
router.post('/', protect, sendMessage);
router.get('/:friendId', protect, getMessages);

export default router;