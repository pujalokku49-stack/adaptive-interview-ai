import { NextFunction, Request, Response } from 'express';

import { asyncHandler } from '@shared/utils/asyncHandler';

describe('asyncHandler', () => {
  it('invokes the wrapped handler with req, res, next', async () => {
    const handler = jest.fn().mockResolvedValue(undefined);
    const wrapped = asyncHandler(handler);

    const req = {} as Request;
    const res = {} as Response;
    const next = jest.fn() as NextFunction;

    await wrapped(req, res, next);

    expect(handler).toHaveBeenCalledWith(req, res, next);
    expect(next).not.toHaveBeenCalled();
  });

  it('forwards a rejected promise to next', async () => {
    const error = new Error('boom');
    const handler = jest.fn().mockRejectedValue(error);
    const wrapped = asyncHandler(handler);

    const req = {} as Request;
    const res = {} as Response;
    const next = jest.fn() as NextFunction;

    wrapped(req, res, next);

    await new Promise((resolve) => process.nextTick(resolve));

    expect(next).toHaveBeenCalledWith(error);
  });
});
