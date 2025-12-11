import type { NextFunction, Request, Response } from 'express';
import { HttpClientService } from '../services/http-client.service.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        username: string;
        email?: string;
        emailVerified?: boolean;
        phoneNumber?: string;
        phoneNumberVerified?: boolean;
        groups?: string[];
      };
      token?: string;
    }
  }
}

const authClient = new HttpClientService(env.authServiceUrl);

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'No authorization token provided',
        error: 'UNAUTHORIZED',
      });
      return;
    }

    // Verificar el token con el servicio de autenticación
    const token = authHeader.substring(7);
    const response = await authClient.post<{
      data: { valid: boolean; user: Express.Request['user'] };
    }>('/auth/verify', { token });

    if (response.data?.data?.valid && response.data?.data?.user) {
      req.user = response.data.data.user;
      req.token = token;
      next();
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
        error: 'UNAUTHORIZED',
      });
    }
  } catch (error) {
    logger.error('Authentication failed:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      error: 'UNAUTHORIZED',
    });
  }
};

export const optionalAuthenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    next();
    return;
  }

  const token = authHeader.substring(7);
  try {
    const response = await authClient.post<{
      data: { valid: boolean; user: Express.Request['user'] };
    }>('/auth/verify', { token });
    if (response.data?.data?.valid && response.data?.data?.user) {
      req.user = response.data.data.user;
    }
  } catch (error) {
    logger.debug('Optional authentication failed:', error);
  }

  next();
};

export const requireGroup = (groupName: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'UNAUTHORIZED',
      });
      return;
    }

    const userGroups = req.user.groups || [];

    if (!userGroups.includes(groupName)) {
      res.status(403).json({
        success: false,
        message: `Access denied. Required group: ${groupName}`,
        error: 'FORBIDDEN',
      });
      return;
    }

    next();
  };
};

export const requireAnyGroup = (groupNames: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'UNAUTHORIZED',
      });
      return;
    }

    const userGroups = req.user.groups || [];
    const hasRequiredGroup = groupNames.some((group) => userGroups.includes(group));

    if (!hasRequiredGroup) {
      res.status(403).json({
        success: false,
        message: `Access denied. Required groups: ${groupNames.join(', ')}`,
        error: 'FORBIDDEN',
      });
      return;
    }

    next();
  };
};
