import express from 'express';
import authController from '../controllers/auth.controller.js';

const router = express.Router();

router.get('/login', authController.login);

router.post('/signup', authController.signup);

router.post('/logout', authController.logout);

export default router;