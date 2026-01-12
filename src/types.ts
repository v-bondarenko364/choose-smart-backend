import { ComplexityScore, DecisionCategory } from '@generated/prisma/enums';

export type User = {
  id: number;
  email: string;
  name: string;
};

export type DecisionInput = {
  id: number;
  situation: string;
  decision: string;
  reasoning?: string;
};

export type DecisionAnalysisSuccess = {
  id: number;
  status: 'completed';
  decisionCategory: DecisionCategory;
  cognitiveBiases: string;
  missedAlternatives: string;
  complexityScore: ComplexityScore;
};

export type DecisionAnalysisError = {
  id: number;
  status: 'error';
  errorMessage: string;
};

export type DecisionAnalysisResult =
  | DecisionAnalysisSuccess
  | DecisionAnalysisError;
