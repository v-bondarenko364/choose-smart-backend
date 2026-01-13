import { Request, Response } from 'express';

import { normalizeResponse } from '@/utils/general';

import DecisionService from './decision.service';
import { generateInsights } from '@/utils/tasks';

class DecisionController {
  public static async getDecisions(request: Request, response: Response) {
    try {
      const data = await DecisionService.getDecisions(request.user.id);

      response.send(normalizeResponse(200, data));
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Error during getting decisions';

      response.status(400).send(normalizeResponse(400, errorMessage));
    }
  }
  public static async createDecision(request: Request, response: Response) {
    try {
      const data = await DecisionService.createDecision({
        ...request.body,
        userId: request.user.id,
      });

      response.send(normalizeResponse(200, data));
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Error during creating decision';

      response.status(400).send(normalizeResponse(400, errorMessage));
    }
  }
  public static async retryDecision(request: Request, response: Response) {
    try {
      const data = await DecisionService.retryDecision(
        Number(request.params.id),
      );

      response.send(normalizeResponse(200, data));
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Error during retrying decision';

      response.status(400).send(normalizeResponse(400, errorMessage));
    }
  }

  public static async analyzeDecisions(_: Request, response: Response) {
    try {
      await generateInsights();

      response.status(200).send(normalizeResponse(200, {}));
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Error during analyzing decisions';

      response.status(400).send(normalizeResponse(400, errorMessage));
    }
  }
}

export default DecisionController;
