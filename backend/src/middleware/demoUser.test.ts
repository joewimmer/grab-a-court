import type { NextFunction, Request, Response } from 'express';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setupTestDatabase, teardownTestDatabase } from '../test/helpers.js';
import { optionalDemoUser } from './demoUser.js';

function buildReq(headerValue?: string): Request {
  return {
    header: (name: string) =>
      name === 'X-Demo-User-Id' ? headerValue : undefined,
  } as unknown as Request;
}

describe('optionalDemoUser', () => {
  beforeEach(() => {
    setupTestDatabase();
  });

  afterEach(() => {
    teardownTestDatabase();
  });

  it('attaches a known demo user', () => {
    const req = buildReq('1');
    const next = vi.fn() as unknown as NextFunction;
    optionalDemoUser(req, {} as Response, next);

    expect(req.demoUser?.name).toBe('Test Member');
    expect(next).toHaveBeenCalled();
  });

  it('continues without a user when no header is present', () => {
    const req = buildReq(undefined);
    const next = vi.fn() as unknown as NextFunction;
    optionalDemoUser(req, {} as Response, next);

    expect(req.demoUser).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });

  it('ignores a non-numeric header', () => {
    const req = buildReq('not-a-number');
    const next = vi.fn() as unknown as NextFunction;
    optionalDemoUser(req, {} as Response, next);

    expect(req.demoUser).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });
});
