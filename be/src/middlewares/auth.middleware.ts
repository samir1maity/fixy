import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../configs/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email?: string;
      };
      website?: {
        websiteId: number;
      }
    }
  }
}

/**
 * Middleware to authenticate requests using JWT
 * Adds user object to request if authentication is successful
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true }
    });
    
    if (!user) {
      res.status(401).json({ error: 'Invalid authentication token' });
      return;
    }
    
    // Add user to request object
    req.user = {
      userId: user.id,
      email: user.email
    };
    
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: 'Invalid authentication token' });
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'Authentication token expired' });
    }
    
    console.error('Authentication error:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Optional authentication middleware
 * Adds user to request if token is valid, but doesn't require authentication
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continue without authentication
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true }
    });
    
    if (user) {
      // Add user to request object
      req.user = {
        userId: user.id,
        email: user.email
      };
    }
    
    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

/**
 * Role-based authorization middleware
 * Requires the authenticate middleware to be used first
 */
export const authorize = (roles: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }
      
      // Get user with role
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { id: true, role: true }
      });
      
      if (!user) {
        res.status(401).json({ error: 'User not found' });
        return;
      }
      
      // Check if user has required role
      if (!roles.includes(user.role)) {
        res.status(403).json({ error: 'Insufficient permissions' });
        return;
      }
      
      next();
    } catch (error) {
      console.error('Authorization error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

/**
 * Middleware to check if user is accessing their own resource
 * Useful for endpoints that should only allow users to access their own data
 */
export const isResourceOwner = (paramName: string = 'userId') => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    
    const resourceId = req.params[paramName];
    
    if (resourceId !== req?.user?.userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }
    
    next();
  };
}; 


/**
 * Middleware to authenticate chat requests using secret key
 * Adds website object to request if authentication is successful
 */
export const authenticateChat = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const apiSecret = req.headers['x-api-secret'] as string;
    const websiteId = Number(req.body.websiteId);
    
    if (!apiSecret || !websiteId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    
    const website = await prisma.website.findFirst({
      where: {
        id: websiteId,
        api_secret: apiSecret
      }
    });

    
    if (!website) {
      res.status(401).json({ error: 'Invalid API key for this website' });
      return;
    }
    
    req.website = { websiteId: website.id };
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};