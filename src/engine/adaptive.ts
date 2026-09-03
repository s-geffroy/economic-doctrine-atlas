import type { Question, School } from '../types';

function predictedPosition(q: Question, school: School): number {
  let sum=0, den=0;
  for (const [dim,w] of Object.entries(q.loading)) { sum += (school.vector[dim]??0)*w; den += Math.abs(w); }
  return den ? sum/den : 0;
}
export function selectNextQuestion(questions: Question[], answeredIds: Set<string>, candidateSchools: School[]): Question | undefined {
  const eligible=questions.filter(q=>!q.anchor && !answeredIds.has(q.id));
  if (!eligible.length) return undefined;
  const candidates=candidateSchools.length >= 2 ? candidateSchools : [];
  let best: Question|undefined; let bestScore=-Infinity;
  for (const q of eligible) {
    const vals=(candidates.length?candidates:[]).map(s=>predictedPosition(q,s));
    const mean=vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:0;
    const variance=vals.length>1?vals.reduce((a,b)=>a+(b-mean)**2,0)/(vals.length-1):0;
    const scenarioBonus=q.context==='scenario'?0.03:0;
    const score=variance+scenarioBonus;
    if(score>bestScore){bestScore=score;best=q;}
  }
  return best ?? eligible[0];
}

export function shouldStop(informativeAnswers:number, maxQuestions:number, topScores:number[], confidence:number): boolean {
  if (informativeAnswers >= maxQuestions) return true;
  if (informativeAnswers < 25 || topScores.length < 2) return false;
  const margin=topScores[0]-topScores[1];
  return confidence >= 0.76 && margin >= 7;
}
