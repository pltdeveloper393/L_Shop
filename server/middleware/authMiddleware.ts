import { Request, Response, NextFunction } from 'express';

// Защита роутов
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Авторизуйтесь для доступа' });
  }
  next();
};

// Проверка корректности SPA
export const getUser = (req: Request) => {
  return req.session.userId;
};