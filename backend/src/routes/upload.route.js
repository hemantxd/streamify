import { Router } from 'express';
import { protect } from '../middleware/protect.js';
import { upload } from '../lib/cloudinary.js';
import { uploadProfilePicture, updateProfile } from '../controllers/upload.controller.js';

const router = Router();

router.post('/profile-picture', protect, upload.single('image'), uploadProfilePicture);
router.put('/profile', protect, updateProfile);

export default router;