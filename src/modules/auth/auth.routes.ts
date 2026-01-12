import { Router } from 'express';

import AuthController from './auth.controller';

const authRouter = Router();

authRouter.post('/login/vendor', AuthController.loginWithVendor);
authRouter.post('/token-verify', AuthController.verifyToken);

export default authRouter;
