import type { Dimension, ProximityResult, ReferenceProfile, School, UserProfile } from '../types';

function distanceForSpace(user: UserProfile, ref: ReferenceProfile, dimensions: Dimension[], space?: 'analytic'|'normative'): number {
  const dims=dimensions.filter(d => !space || d.space===space);
  let num=0, den=0;
  for (const d of dims) {
    const coverage = user.coverage[d.id] ?? 0;
    if (coverage <= 0) continue; // unknown is not neutral
    const weight = coverage;
    const delta=(user.vector[d.id]??0)-(ref.vector[d.id]??0);
    num += weight*delta*delta; den += weight;
  }
  return den > 0 ? Math.sqrt(num/den)/2 : 1; // no evidence => no artificial proximity
}
export function proximity(user: UserProfile, ref: ReferenceProfile, dimensions: Dimension[]): Omit<ProximityResult,'id'|'name'> {
  const a=distanceForSpace(user,ref,dimensions,'analytic');
  const n=distanceForSpace(user,ref,dimensions,'normative');
  const analyticWeight = 'analytic_weight' in ref ? Number((ref as any).analytic_weight) : 0.68;
  const d=Math.sqrt(analyticWeight*a*a+(1-analyticWeight)*n*n);
  const score=(x:number)=>Math.round(1000*Math.max(0,1-x))/10;
  return {score:score(d),analyticScore:score(a),normativeScore:score(n),distance:d,analyticDistance:a,normativeDistance:n};
}
export function rankProfiles<T extends ReferenceProfile>(user: UserProfile, refs: T[], dimensions: Dimension[]): ProximityResult[] {
  return refs.map(ref=>({id:ref.id,name:ref.name,...proximity(user,ref,dimensions)})).sort((a,b)=>b.score-a.score);
}
export function inSchoolRegion(user: UserProfile, school: School, dimensions: Dimension[]): {insideRatio:number} {
  let inside=0;
  for (const d of dimensions) if (Math.abs((user.vector[d.id]??0)-(school.vector[d.id]??0)) <= (school.sigma[d.id]??0.25)+(user.uncertainty[d.id]??0)) inside++;
  return {insideRatio: inside/Math.max(1,dimensions.length)};
}
