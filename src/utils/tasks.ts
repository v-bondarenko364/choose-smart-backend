import Prisma from '@/clients/prisma';
import { DecisionStatus } from '@generated/prisma/enums';

import { aiClient } from '@/clients/ai';

export const generateInsights = async () => {
  console.log(
    `Starting generate insights for users on ${new Date().toUTCString()}`,
  );
  const pendingDecisions = await Prisma.connection.decision.findMany({
    where: {
      status: DecisionStatus.pending,
    },
    select: {
      id: true,
      situation: true,
      decision: true,
      reasoning: true,
    },
  });
  if (pendingDecisions.length === 0) {
    return;
  }

  try {
    const insights = await aiClient.generateInsightList(pendingDecisions);
    await Promise.allSettled(
      insights.map((insight) => {
        return Prisma.connection.decision.update({
          where: { id: insight.id },
          data:
            insight.status === 'completed'
              ? {
                  status: DecisionStatus.completed,
                  decisionCategory: insight.decisionCategory,
                  cognitiveBiases: insight.cognitiveBiases,
                  missedAlternatives: insight.missedAlternatives,
                  complexityScore: insight.complexityScore,
                }
              : {
                  status: DecisionStatus.failed,
                  errorMessage: insight.errorMessage,
                },
        });
      }),
    );
  } catch (error) {
    console.error('Failed to generate insights:', error);
  }
};
