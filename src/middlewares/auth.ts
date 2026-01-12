import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import Prisma from '@/clients/prisma';
import { normalizeResponse } from '@/utils/general';
import { User } from '@/types';

const userFieldsToSelect = {
  id: true,
  email: true,
  name: true,
};

declare global {
  export namespace Express {
    export interface Request {
      user?: User;
    }
  }
}

export const authMiddleware = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  // Skip auth check for auth routes and webhooks
  if (request.path.startsWith('/webhooks/')) {
    return next();
  }

  try {
    // Extract token from Authorization header or cookie
    const authHeader = request.headers.authorization;
    const requestToken =
      (authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null) ||
      (request.cookies?.token as string);

    if (!requestToken) {
      return response
        .status(401)
        .send(normalizeResponse(401, 'No token provided'));
    }

    // Verify JWT token
    const secret = process.env.JWT_SECRET!;
    const decoded = jwt.verify(requestToken, secret) as {
      id: number;
      email: string;
    };

    // Fetch user from database
    const user = await Prisma.connection.user.findUnique({
      where: {
        id: decoded.id,
        email: decoded.email,
      },
      select: userFieldsToSelect,
    });

    if (!user) {
      return response
        .status(401)
        .send(normalizeResponse(401, 'User not found'));
    }

    // Store user in request object
    request.user = user;
    next();
  } catch {
    return response.status(401).send(normalizeResponse(401, 'Invalid token'));
  }
};
