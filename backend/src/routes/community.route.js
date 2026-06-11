import { Router } from 'express';
import { protect } from '../middleware/protect.js';
import { getCommunities, getCommunityMembers } from '../controllers/community.controller.js';

const router = Router();

router.get('/', protect, getCommunities);
router.get('/:language/members', protect, getCommunityMembers);

export default router;