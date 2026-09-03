import type { Answer, Dimension, Question, UserProfile } from '../types';

const LIKERT: Record<string, number | null> = {
  strongly_disagree: -1, disagree: -0.5, neutral: 0,
  agree: 0.5, strongly_agree: 1, unsure: null, depends: null,
};

export function scoreAnswers(answers: Answer[], questions: Question[], dimensions: Dimension[]): UserProfile {
  const qmap = new Map(questions.map(q => [q.id, q]));
  const sums: Record<string, number> = {};
  const weights: Record<string, number> = {};
  const valuesByDim: Record<string, number[]> = {};
  for (const d of dimensions) { sums[d.id]=0; weights[d.id]=0; valuesByDim[d.id]=[]; }
  let informativeAnswers = 0;

  for (const answer of answers) {
    const q = qmap.get(answer.questionId); if (!q) continue;
    if (q.type === 'likert') {
      const v = LIKERT[answer.value];
      if (v === null || v === undefined) continue;
      informativeAnswers++;
      for (const [dim,w] of Object.entries(q.loading)) {
        const contribution = v*w;
        sums[dim] += contribution;
        weights[dim] += Math.abs(w);
        valuesByDim[dim].push(contribution/Math.max(Math.abs(w), 1e-9));
      }
    } else {
      const opts = q.options as {id:string,label:string,contribution:Record<string,number>}[];
      const opt = opts.find(o => o.id === answer.value); if (!opt) continue;
      informativeAnswers++;
      for (const [dim,c] of Object.entries(opt.contribution)) {
        sums[dim] += c; weights[dim] += 1; valuesByDim[dim].push(c);
      }
    }
  }

  const vector: Record<string, number> = {};
  const uncertainty: Record<string, number> = {};
  const coverage: Record<string, number> = {};
  for (const d of dimensions) {
    const w=weights[d.id];
    vector[d.id] = w ? Math.max(-1, Math.min(1, sums[d.id]/w)) : 0;
    coverage[d.id] = Math.min(1, w/3);
    const vals=valuesByDim[d.id];
    const mean = vals.length ? vals.reduce((a,b)=>a+b,0)/vals.length : 0;
    const variance = vals.length>1 ? vals.reduce((a,b)=>a+(b-mean)**2,0)/(vals.length-1) : 1;
    // uncertainty decreases with evidence, but incoherent answers prevent overconfidence.
    uncertainty[d.id] = Math.min(1, Math.max(0.08, Math.sqrt(variance+0.15)/Math.sqrt(Math.max(1, vals.length))));
  }
  return {vector, uncertainty, coverage, informativeAnswers};
}

export function globalConfidence(profile: UserProfile): number {
  const cov=Object.values(profile.coverage); const unc=Object.values(profile.uncertainty);
  const c=cov.reduce((a,b)=>a+b,0)/Math.max(1,cov.length);
  const u=unc.reduce((a,b)=>a+b,0)/Math.max(1,unc.length);
  return Math.max(0, Math.min(1, 0.65*c + 0.35*(1-u)));
}
