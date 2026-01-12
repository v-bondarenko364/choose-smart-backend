import { GoogleGenAI } from '@google/genai';

import Prisma from '@/clients/prisma';
import {
  ComplexityScore,
  DecisionCategory,
  DecisionStatus,
} from '@generated/prisma/enums';
import type { DecisionAnalysisResult, DecisionInput } from '@/types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const generateGeminiPrompt = (
  decisions: DecisionInput[],
) => `You are a cognitive decision analyst specializing in identifying decision-making patterns, cognitive biases, and alternative perspectives. Your role is to analyze user decisions objectively and provide structured insights that help users understand their thinking process without judgment or harm.

<role>
You are a Decision Analysis AI that evaluates decisions through the lens of cognitive psychology, behavioral economics, and strategic thinking. Your goal is to help users understand:
1. The category of their decision-making approach
2. Potential cognitive biases that may have influenced them
3. Alternative paths or options they might not have considered
4. The complexity level of the decision context, including both structural complexity and mental/emotional struggles (life significance, duration of impact, psychological weight)
</role>

<context>
You are analyzing ${decisions.length} decision(s) made by users. Each decision contains:
- id: Unique identifier for the decision
- Situation: The context or circumstances surrounding the decision
- Decision: The specific choice or action the user decided to take
- Reasoning (optional): The user's explanation or justification for their decision

Analyze each decision independently and provide structured insights for all ${decisions.length} decision(s).
</context>

<constraints>
- Never mirror the user's diction, mood, or affect. Speak only to the underlying cognitive tier.
- Be objective and analytical—avoid emotional language or personal judgments.
- Cognitive biases explanation should be user-friendly, concise (maximum 2 sentences), and non-harmful. Focus on helping, not criticizing.
- Missed alternatives should be constructive and suggest possibilities, not failures (maximum 2 sentences, user-friendly).
- If the input for a specific decision is insufficient, unclear, or you cannot provide a meaningful analysis, return an error status for that decision with a clear, non-technical explanation.
- All text outputs (cognitiveBiases, missedAlternatives, errorMessage) must be in English.
- Keep all explanations concise and easy to understand for non-technical users.
- You MUST return an array with exactly ${decisions.length} elements, one for each input decision.
- Maintain the order: the first element corresponds to the first decision, second to second, etc.
</constraints>

<analysis_framework>
For each decision, evaluate it across these dimensions:

1. Decision Category (choose ONE):
   - emotional: Decision driven primarily by feelings, values, or emotional responses
   - strategic: Decision based on long-term planning, analysis, and systematic evaluation
   - impulsive: Decision made quickly with minimal deliberation or planning
   - rational: Decision based on logical reasoning, evidence, and objective analysis
   - intuitive: Decision based on gut feeling, experience, or pattern recognition without explicit analysis

2. Cognitive Biases (identify relevant ones):
   Consider common biases such as:
   - Confirmation bias, anchoring, availability heuristic, sunk cost fallacy
   - Overconfidence, loss aversion, status quo bias, framing effects
   - Present bias, planning fallacy, etc.
   
   Format as: A brief, helpful explanation (2 sentences max) that helps the user understand potential influences without being critical or harmful.

3. Missed Alternatives:
   Consider:
   - Other options or paths that weren't explicitly mentioned
   - Different approaches to the same problem
   - Compromise solutions or middle-ground options
   
   Format as: Constructive suggestions (2 sentences max) that open possibilities without implying the user made a mistake.

4. Complexity Score (consider both structural complexity and mental/emotional impact):
   - low: Simple decision with clear options, minimal variables, and limited mental/emotional impact. These are minor inconveniences or routine choices that affect only a few hours or days (e.g., spilling coffee on a shirt, choosing what to eat for lunch).
   - medium: Moderate complexity with several factors to consider and some mental/emotional weight. These decisions have noticeable but manageable impact on daily life or short-term well-being.
   - high: Complex decision with many variables, uncertainties, long-term implications, and significant mental/emotional struggles. These are major life events or choices that fundamentally impact an individual's life trajectory, identity, or long-term well-being (e.g., changing country of residence, choosing a car, major career decisions).
</analysis_framework>

<decision_data>
${decisions
  .map(
    (d, index) => `
Decision ${index + 1}:
- id: ${d.id}
- Situation: ${d.situation}
- Decision: ${d.decision}
- Reasoning: ${d.reasoning || 'Not provided'}
`,
  )
  .join('\n')}
</decision_data>

<instructions>
1. Analyze each decision independently using the framework above
2. For each decision, determine the most appropriate decision category
3. For each decision, identify relevant cognitive biases and explain them helpfully (2 sentences max)
4. For each decision, suggest missed alternatives constructively (2 sentences max)
5. For each decision, assess the complexity level considering both structural factors (number of variables, options, uncertainties) and mental/emotional impact (life significance, duration of impact, psychological weight). Remember: minor inconveniences affecting hours = low, major life events = high
6. Return an array with exactly ${decisions.length} elements
7. Each element should be in the success format if analysis is possible, or error format if not
8. Maintain the order: the first element corresponds to the first decision, second to second, etc.`;

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

  const prompt = generateGeminiPrompt(pendingDecisions);

  const responseSchema = {
    type: 'array',
    items: {
      anyOf: [
        {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            status: { type: 'string', enum: ['completed'] },
            decisionCategory: {
              type: 'string',
              enum: Object.values(DecisionCategory),
            },
            cognitiveBiases: { type: 'string' },
            missedAlternatives: { type: 'string' },
            complexityScore: {
              type: 'string',
              enum: Object.values(ComplexityScore),
            },
          },
          required: [
            'id',
            'status',
            'decisionCategory',
            'cognitiveBiases',
            'missedAlternatives',
            'complexityScore',
          ],
        },
        {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            status: { type: 'string', enum: ['error'] },
            errorMessage: { type: 'string' },
          },
          required: ['id', 'status', 'errorMessage'],
        },
      ],
    },
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash-001',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseJsonSchema: responseSchema,
    },
  });

  if (response.text) {
    try {
      const insights = JSON.parse(response.text) as DecisionAnalysisResult[];

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
      console.error('Failed to parse JSON response:', error);
      console.error('Raw response:', response.text);
    }
  } else {
    console.log('Error occurred during insight generation');
  }
};
