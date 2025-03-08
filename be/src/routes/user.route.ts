import { Router } from 'express';
import { authenticate, authorize, isResourceOwner } from '../middlewares/auth.middleware.js';
import * as userController from '../controllers/user.controller.js';

const router = Router();

// Public routes
router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);

// Protected routes
router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, userController.updateProfile);
router.delete('/account', authenticate, userController.deleteAccount);

// Admin-only routes
router.get('/users', authenticate, authorize('admin'), userController.getAllUsers);

// Resource owner routes
router.get('/users/:userId/details', authenticate, isResourceOwner(), userController.getUserDetails);

export default router; 