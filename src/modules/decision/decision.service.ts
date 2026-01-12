import Prisma from '@/clients/prisma';
import { normalizeResponse } from '@/utils/general';

type DecisionInput = {
  situation: string;
  decision: string;
  reasoning?: string;
  userId: number;
};

class DecisionService {
  public static async getDecisions(userId: number) {
    const decisions = await Prisma.connection.decision.findMany({
      where: {
        userId,
      },
    });

    return decisions;
  }

  public static async createDecision(decision: DecisionInput) {
    await Prisma.connection.decision.create({
      data: decision,
    });

    return { status: 'success' };
  }

  public static async retryDecision(id: number) {
    const decision = await Prisma.connection.decision.findUnique({
      where: { id },
    });

    if (!decision) {
      throw new Error('Decision not found');
    }

    return normalizeResponse(200, decision);
  }
}

export default DecisionService;
