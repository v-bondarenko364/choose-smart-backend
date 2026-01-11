import { addDays } from 'date-fns';
import { Request, Response } from 'express';

import { normalizeResponse } from '@/utils/general';

import AuthService from './auth.service';

class AuthController {
  public static async loginWithToken(request: Request, response: Response) {
    const { user, token } = await AuthService.loginWithToken();

    // FIXME: If not user, return 401
    // FIXME: verify that it's works
    response.cookie('token', token, {
      httpOnly: true,
      expires: addDays(new Date(), 7),
      secure: process.env.NODE_ENV === 'production',
      // domain:
      //   process.env.NODE_ENV === 'production' ? '.endurepath.com' : undefined,
      // sameSite: 'none',
    });

    response.send(normalizeResponse(200, { user }));
  }
  public static async loginWithVendor(request: Request, response: Response) {
    const { user, token } = await AuthService.loginWithVendor();

    // FIXME: If not user, return 401
    // FIXME: verify that it's works
    // TODO: move to another util function
    response.cookie('token', token, {
      httpOnly: true,
      expires: addDays(new Date(), 7),
      secure: process.env.NODE_ENV === 'production',
      // domain:
      //   process.env.NODE_ENV === 'production' ? '.endurepath.com' : undefined,
      // sameSite: 'none',
    });

    response.send(normalizeResponse(200, { user }));
  }
}

export default AuthController;
