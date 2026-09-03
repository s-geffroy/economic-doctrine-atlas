export type Space = 'analytic' | 'normative';
export type QuestionType = 'likert' | 'choice';

export interface Dimension {
  id: string; label: string; space: Space; subspace: string;
  low: string; high: string; description: string;
}
export interface ReferenceProfile {
  id: string; name: string; vector: Record<string, number>;
  sigma: Record<string, number>; status: string;
}
export interface School extends ReferenceProfile {
  family: string; summary: string; caveat: string; analytic_weight: number;
  references: string[]; coding_note: string;
}
export interface Economist extends ReferenceProfile {
  historical_affiliation: string; era: 'historical'|'modern_contemporary'; summary: string; works: string[]; coding_note: string;
}
export interface ChoiceOption { id: string; label: string; contribution: Record<string, number>; }
export interface Question {
  id: string; text: string; type: QuestionType; anchor: boolean; context: string;
  loading: Record<string, number>; tags: string[];
  options: string[] | ChoiceOption[];
}
export type Answer = { questionId: string; value: string };
export interface UserProfile {
  vector: Record<string, number>;
  uncertainty: Record<string, number>;
  coverage: Record<string, number>;
  informativeAnswers: number;
}
export interface ProximityResult {
  id: string; name: string; score: number; analyticScore: number; normativeScore: number;
  distance: number; analyticDistance: number; normativeDistance: number;
}
