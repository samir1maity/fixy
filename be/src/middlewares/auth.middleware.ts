import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../configs/db.js';
import config from '../configs/config.js';
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
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    
    const token = authHeader.split(' ')[1];
    
    const decoded = jwt.verify(token, config.auth.jwt) as { userId: string };
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true }
    });
    
    if (!user) {
      res.status(401).json({ error: 'Invalid authentication token' });
      return;
    }
    
    req.user = {
      userId: user.id,
      email: user.email
    };
    
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: 'Invalid authentication token' });
      return;
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'Authentication token expired' });
      return;
    }
    
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Role-based authorization middleware
 */
export const authorize = (roles: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }
      
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { id: true, role: true }
      });
      
      if (!user) {
        res.status(401).json({ error: 'User not found' });
        return;
      }
      
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
    
    if (!apiSecret) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    
    const website = await prisma.website.findFirst({
      where: {
        api_secret: apiSecret
      }
    });

    
    if (!website) {
      res.status(401).json({ error: 'Invalid API key' });
      return;
    }
    
    req.body.websiteId = website.id;
    req.website = { websiteId: website.id };
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
