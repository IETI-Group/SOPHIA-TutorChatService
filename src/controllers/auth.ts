import type { NextFunction, Request, Response } from 'express';
import { authService } from '../services/auth.service';

export class AuthController {
  // Helper para construir la config de request con headers y query
  private buildRequestConfig(req: Request) {
    return {
      queryParams: req.query,
      headers: req.headers as Record<string, string>,
    };
  }

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { queryParams, headers } = this.buildRequestConfig(req);
      const response = await authService.login(queryParams, headers);
      res.json(response.data);
    } catch (error) {
      next(error);
    }
  };

  callback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { queryParams, headers } = this.buildRequestConfig(req);
      const response = await authService.callback(queryParams, headers);
      res.json(response.data);
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { queryParams, headers } = this.buildRequestConfig(req);
      const response = await authService.logout(queryParams, headers);
      res.json(response.data);
    } catch (error) {
      next(error);
    }
  };

  me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { headers } = this.buildRequestConfig(req);
      const response = await authService.me(headers);
      res.json(response.data);
    } catch (error) {
      next(error);
    }
  };

  verify = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { headers } = this.buildRequestConfig(req);
      const response = await authService.verify(req.body, headers);
      res.json(response.data);
    } catch (error) {
      next(error);
    }
  };
}
