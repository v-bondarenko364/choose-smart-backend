import { addDays } from 'date-fns';
import { Request, Response } from 'express';

import { normalizeResponse } from '@/utils/general';

import AuthService from './auth.service';

const isProduction = process.env.NODE_ENV === 'production';

class AuthController {
  public static async loginWithToken(request: Request, response: Response) {
    try {
      const userData = await AuthService.verifyToken(request.body.token);

      response.cookie('token', request.body.token, {
        httpOnly: true,
        expires: addDays(new Date(), 7),
        secure: isProduction,
        domain: isProduction ? '.choosesm.art' : undefined,
        sameSite: 'none',
      });

      response.send(normalizeResponse(200, userData));
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Error during login with token';

      response.status(400).send(normalizeResponse(400, errorMessage));
    }
  }
  public static async loginWithVendor(request: Request, response: Response) {
    console.log('loginWithVendor', request.body);
    try {
      const { user, token } = await AuthService.loginWithVendor(
        request.body.token,
      );

      response.cookie('token', token, {
        httpOnly: true,
        expires: addDays(new Date(), 7),
        secure: isProduction,
        domain: isProduction ? '.choosesm.art' : undefined,
        sameSite: 'none',
      });

      response.send(normalizeResponse(200, { user }));
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Error during login with vendor';
      response.status(400).send(normalizeResponse(400, errorMessage));
    }
  }
}

export default AuthController;
