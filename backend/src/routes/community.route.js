import { Router } from 'express';
import { protect } from '../middleware/protect.js';
import {
  getCommunities,
  getCommunityMembers,
  joinCommunity,
  leaveCommunity,
  getCommunityMessages,
  sendCommunityMessage,
} from '../controllers/community.controller.js';

const router = Router();

router.get('/', protect, getCommunities);
router.post('/join', protect, joinCommunity);
router.post('/leave', protect, leaveCommunity);
router.get('/:language/members', protect, getCommunityMembers);
router.get('/:language/messages', protect, getCommunityMessages);
router.post('/message', protect, sendCommunityMessage);

export default router;