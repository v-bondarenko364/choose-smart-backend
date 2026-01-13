import { getGeminiConfig } from '@/configs/ai';
import { DecisionInput, DecisionAnalysisResult } from '@/types';
import { GoogleGenAI } from '@google/genai';

class AiClient {
  private readonly geminiAi: GoogleGenAI;

  constructor() {
    this.geminiAi = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }

  public async generateInsightList(
    decisions: DecisionInput[],
  ): Promise<DecisionAnalysisResult[]> {
    const response = await this.geminiAi.models.generateContent(
      getGeminiConfig('decisionList', decisions),
    );

    if (response.text) {
      const insights = JSON.parse(response.text) as DecisionAnalysisResult[];

      return insights;
    }
    throw new Error('Failed to generate insights');
  }
  public async generateInsightDecision(
    decision: DecisionInput,
  ): Promise<DecisionAnalysisResult> {
    const response = await this.geminiAi.models.generateContent(
      getGeminiConfig('decisionSingle', decision),
    );

    if (response.text) {
      const insight = JSON.parse(response.text) as DecisionAnalysisResult;

      return insight;
    }
    throw new Error('Failed to generate insight');
  }
}

export const aiClient = new AiClient();
