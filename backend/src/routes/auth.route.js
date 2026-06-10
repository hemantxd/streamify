import express from 'express';
import authController from '../controllers/auth.controller.js';
import { protect } from '../middleware/protect.js';

const router = express.Router();

router.post('/login', authController.login);

router.post('/signup', authController.signup);

router.post('/logout', authController.logout);

router.post('/onboard', protect, authController.onboard);
router.get('/me', protect, authController.getMe);

export default router;
