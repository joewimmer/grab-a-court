import type { NextFunction, Request, Response } from 'express';
import { getMemberById } from '../repositories/memberRepository.js';
import type { Member } from '../types.js';

declare global {
  namespace Express {
    interface Request {
      demoUser?: Member;
    }
  }
}

export function requireDemoUser(req: Request, res: Response, next: NextFunction): void {
  const userIdHeader = req.header('X-Demo-User-Id');

  if (!userIdHeader) {
    res.status(401).json({ error: 'X-Demo-User-Id header is required.' });
    return;
  }

  const userId = Number(userIdHeader);
  if (Number.isNaN(userId)) {
    res.status(400).json({ error: 'X-Demo-User-Id must be a number.' });
    return;
  }

  const member = getMemberById(userId);
  if (!member) {
    res.status(404).json({ error: 'Demo user not found.' });
    return;
  }

  req.demoUser = member;
  next();
}

export function optionalDemoUser(req: Request, _res: Response, next: NextFunction): void {
  const userIdHeader = req.header('X-Demo-User-Id');
  if (userIdHeader) {
    const userId = Number(userIdHeader);
    if (!Number.isNaN(userId)) {
      req.demoUser = getMemberById(userId);
    }
  }
  next();
}
