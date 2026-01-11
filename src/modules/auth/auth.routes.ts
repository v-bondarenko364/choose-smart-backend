import { Router } from 'express';

import AuthController from './auth.controller';

const authRouter = Router();

authRouter.post('/login/vendor', AuthController.loginWithVendor);
authRouter.post('/login/token', AuthController.loginWithToken);

export default authRouter;
