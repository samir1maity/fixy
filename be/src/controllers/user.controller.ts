import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/user.service.js';
import { prisma } from '../configs/db.js';

/**
 * User signup controller
 * POST /api/users/signup
 */
export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name } = req.body;
    
    const result = await userService.signup({ email, password, name });
    
    res.status(201).json({
      message: 'User registered successfully',
      user: result.user,
      token: result.token
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'User with this email already exists') {
         res.status(409).json({ error: error.message });
         return;
      }
    }
    
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
};

/**
 * User login controller
 * POST /api/users/login
 */
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    
    const result = await userService.login({ email, password });
    
    res.status(200).json({
      message: 'Login successful',
      user: result.user,
      token: result.token
    });
  } catch (error) {
     if (error instanceof Error) {
       if (error.message === 'Invalid email or password') {
           res.status(401).json({ error: error.message });
           return;
        }
      }
    
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to authenticate' });
  }
};

/**
 * Get current user controller
 * GET /api/users/me
 * Requires authentication
 */
export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
       res.status(401).json({ error: 'Authentication required' });
       return;
    }
    const user = await userService.getUserProfile(req.user.userId);
    res.status(200).json(user);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Failed to retrieve current user' });
  }
};

/**
 * Forgot password controller
 * POST /api/users/forgot-password
 */
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    
    const result = await userService.forgotPassword({ email });
    
    // Always return success to prevent email enumeration
    res.status(200).json({ message: result.message });
  } catch (error) {
    console.error('Forgot password error:', error);
    
    // Still return a generic message to prevent email enumeration
    res.status(200).json({ 
      message: 'If an account with that email exists, a password reset link has been sent' 
    });
  }
};

/**
 * Reset password controller
 * POST /api/users/reset-password
 */
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, password } = req.body;
    
    const result = await userService.resetPassword({ token, password });
    
    res.status(200).json({ message: result.message });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Invalid or expired reset token') {
         res.status(400).json({ error: error.message });
         return;
      }
    }
    
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};

/**
 * Get user profile controller
 * GET /api/users/profile
 * Requires authentication
 */
export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
       res.status(401).json({ error: 'Authentication required' });
       return;
    }
    
    const userProfile = await userService.getUserProfile(req.user.userId);
    
    res.status(200).json({ user: userProfile });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'User not found') {
         res.status(404).json({ error: error.message });
         return;
      }
    }
    
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to retrieve user profile' });
  }
};

/**
 * Update user profile controller
 * PUT /api/users/profile
 * Requires authentication
 */
export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
       res.status(401).json({ error: 'Authentication required' });
       return;
    }
    
    const { name, email, currentPassword, newPassword } = req.body;
    
    const updatedUser = await userService.updateProfile(req.user.userId, {
      name,
      email,
      currentPassword,
      newPassword
    });
    
    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'User not found') {
         res.status(404).json({ error: error.message });
         return;
      }
      if (error.message === 'Current password is required to set a new password' ||
          error.message === 'Current password is incorrect') {
         res.status(400).json({ error: error.message });
         return;
      }
    }
    
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

/**
 * Delete user account controller
 * DELETE /api/users/account
 * Requires authentication
 */
export const deleteAccount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
       res.status(401).json({ error: 'Authentication required' });
       return
    }
    
    const { password } = req.body;
    
    if (!password) {
       res.status(400).json({ error: 'Password is required to delete account' });
       return
    }
    
    const result = await userService.deleteAccount(req.user.userId, password);
    
    res.status(200).json({ message: result.message });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'User not found') {
         res.status(404).json({ error: error.message });
         return;
      }
      if (error.message === 'Password is incorrect') {
         res.status(400).json({ error: error.message });
         return;
      }
    }
    
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
};

/**
 * Get all users controller (admin only)
 * GET /api/users
 * Requires authentication and admin role
 */
export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // This route is protected by the authorize middleware
    // so we know the user has admin privileges
    
    // Implement pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        role: true
      },
      skip: (page - 1) * limit,
      take: limit
    });
    
    const total = await prisma.user.count();
    
    res.status(200).json({
      users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
};

/**
 * Get user details controller (resource owner or admin)
 * GET /api/users/:userId/details
 * Requires authentication and resource ownership
 */
export const getUserDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // This route is protected by the isResourceOwner middleware
    // so we know the user is accessing their own data
    
    const userId = req.params.userId;
    
    const userDetails = await userService.getUserProfile(userId);
    
    // Get additional user-specific data
    const websites = await prisma.website.findMany({
      where: { customerId: userId },
      select: {
        id: true,
        domain: true,
        status: true,
        createdAt: true
      }
    });
    
    res.status(200).json({
      user: userDetails,
      websites
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'User not found') {
        res.status(404).json({ error: error.message });
      }
    }
    
    console.error('Get user details error:', error);
    res.status(500).json({ error: 'Failed to retrieve user details' });
  }
}; 