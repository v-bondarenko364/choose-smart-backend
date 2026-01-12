import { Router } from 'express';

import { authMiddleware } from '@/middlewares/auth';

import DecisionController from './decision.controller';

const decisionRouter = Router();

decisionRouter.use(authMiddleware);

decisionRouter.get('/', DecisionController.getDecisions);

decisionRouter.post('/', DecisionController.createDecision);

decisionRouter.post('/analyze', DecisionController.analyzeDecisions);

decisionRouter.post('/:id/retry', DecisionController.retryDecision);

export default decisionRouter;
