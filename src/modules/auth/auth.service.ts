import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';

import Prisma from '@/clients/prisma';
import { User } from '@/types';

interface GoogleTokenPayload {
  name: string;
  vendorUserId: string;
  email: string;
}

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const userFieldsToSelect = {
  id: true,
  email: true,
  name: true,
};

class AuthService {
  private static async verifyGoogleToken(
    token: string,
  ): Promise<GoogleTokenPayload> {
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();

      if (!payload) {
        throw new Error('Invalid token payload');
      }

      return {
        name: payload.name || '',
        vendorUserId: payload.sub,
        email: payload.email || '',
      };
    } catch {
      throw new Error('Token is invalid');
    }
  }

  private static generateJwtToken(user: User): string {
    const secret = process.env.JWT_SECRET!;

    return jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      secret,
      { expiresIn: '7d' },
    );
  }

  public static async verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
        id: number;
        email: string;
      };

      const user = await Prisma.connection.user.findUnique({
        where: {
          id: decoded.id,
        },
        select: userFieldsToSelect,
      });

      if (!user) {
        throw new Error('User not found');
      }

      return {
        isValid: true,
      };
    } catch {
      return { isValid: false };
    }
  }
  public static async loginWithVendor(token: string) {
    let payload = {
      vendorUserId: '',
      email: '',
      name: '',
    };

    try {
      payload = await AuthService.verifyGoogleToken(token);
    } catch {
      throw new Error('Google token is incorrect');
    }

    let user = await Prisma.connection.user.findFirst({
      where: {
        vendorUserId: payload.vendorUserId,
      },
      select: userFieldsToSelect,
    });

    if (user) {
      return {
        user: user,
        token: AuthService.generateJwtToken(user),
      };
    }

    // Create new user if not found
    user = await Prisma.connection.user.create({
      data: {
        email: payload.email,
        name: payload.name,
        vendorUserId: payload.vendorUserId,
      },
      select: userFieldsToSelect,
    });

    return {
      user,
      token: AuthService.generateJwtToken(user),
    };
  }
}

export default AuthService;
