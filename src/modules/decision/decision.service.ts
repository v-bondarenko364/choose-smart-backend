import { aiClient } from '@/clients/ai';
import Prisma from '@/clients/prisma';
import { DecisionStatus } from '@generated/prisma/enums';

type DecisionInput = {
  situation: string;
  decision: string;
  reasoning?: string;
  userId: number;
};

const decisionFieldsToSelect = {
  id: true,
  situation: true,
  decision: true,
  reasoning: true,
  status: true,
  errorMessage: true,
  decisionCategory: true,
  cognitiveBiases: true,
  missedAlternatives: true,
  complexityScore: true,
  createdAt: true,
};

class DecisionService {
  public static async getDecisions(userId: number) {
    const decisions = await Prisma.connection.decision.findMany({
      where: {
        userId,
      },
      select: decisionFieldsToSelect,
      orderBy: {
        createdAt: 'desc',
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
      select: {
        id: true,
        situation: true,
        decision: true,
        reasoning: true,
      },
    });

    if (!decision) {
      throw new Error('Decision not found');
    }

    const insight = await aiClient.generateInsightDecision(decision);

    const updatedDecision = await Prisma.connection.decision.update({
      where: { id },
      data:
        insight.status === 'completed'
          ? {
              status: insight.status,
              decisionCategory: insight.decisionCategory,
              cognitiveBiases: insight.cognitiveBiases,
              missedAlternatives: insight.missedAlternatives,
              complexityScore: insight.complexityScore,
            }
          : {
              status: DecisionStatus.failed,
              errorMessage: insight.errorMessage,
            },
      select: decisionFieldsToSelect,
    });

    return updatedDecision;
  }
}

export default DecisionService;
