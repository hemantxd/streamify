import { Router } from 'express';
import { protect } from '../middleware/protect.js';
import {
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  getPendingRequests,
  getFriends,
  removeFriend,
  searchUsers,
} from '../controllers/friend.controller.js';

const router = Router();

router.get('/search', protect, searchUsers);
router.get('/', protect, getFriends);
router.get('/requests/pending', protect, getPendingRequests);
router.post('/request', protect, sendFriendRequest);
router.put('/request/:requestId/accept', protect, acceptFriendRequest);
router.put('/request/:requestId/decline', protect, declineFriendRequest);
router.delete('/:friendId', protect, removeFriend);

export default router;