import { requireAuth, getUserId } from '../../server/middleware/authMiddleware';
import { requireRole } from '../../server/middleware/roleMiddleware';
import { Request, Response, NextFunction } from 'express';

function mockSession(session: any) {
  return { session } as unknown as Request;
}

function mockResponse(): Response {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('requireAuth middleware', () => {
  test('пропускает запрос с userId в сессии', () => {
    const req = mockSession({ userId: 'user-123' });
    const res = mockResponse();
    const next: NextFunction = jest.fn();

    requireAuth(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test('возвращает 401 при отсутствии userId', () => {
    const req = mockSession({});
    const res = mockResponse();
    const next: NextFunction = jest.fn();

    requireAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
    expect(next).not.toHaveBeenCalled();
  });

  test('возвращает 401 при отсутствии сессии', () => {
    const req = mockSession(undefined as any);
    const res = mockResponse();
    const next: NextFunction = jest.fn();

    requireAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('возвращает 401 при userId = undefined', () => {
    const req = mockSession({ userId: undefined });
    const res = mockResponse();
    const next: NextFunction = jest.fn();

    requireAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});

describe('requireRole middleware', () => {
  test('пропускает запрос с правильной ролью', () => {
    const req = mockSession({ userId: 'user-123', role: 'admin' });
    const res = mockResponse();
    const next: NextFunction = jest.fn();

    const middleware = requireRole('admin', 'owner');
    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test('возвращает 403 при недостаточной роли', () => {
    const req = mockSession({ userId: 'user-123', role: 'user' });
    const res = mockResponse();
    const next: NextFunction = jest.fn();

    const middleware = requireRole('admin', 'owner');
    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test('возвращает 401 при отсутствии userId', () => {
    const req = mockSession({ role: 'admin' });
    const res = mockResponse();
    const next: NextFunction = jest.fn();

    const middleware = requireRole('admin');
    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('возвращает 403 при отсутствии роли в сессии', () => {
    const req = mockSession({ userId: 'user-123' });
    const res = mockResponse();
    const next: NextFunction = jest.fn();

    const middleware = requireRole('admin');
    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});

describe('getUserId helper', () => {
  test('возвращает userId при его наличии', () => {
    const req = mockSession({ userId: 'user-456' });
    expect(getUserId(req)).toBe('user-456');
  });

  test('возвращает undefined при отсутствии userId', () => {
    const req = mockSession({});
    expect(getUserId(req)).toBeUndefined();
  });

  test('возвращает undefined при отсутствии сессии', () => {
    const req = mockSession(undefined as any);
    expect(getUserId(req)).toBeUndefined();
  });
});
