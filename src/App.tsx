import React, {useEffect, useMemo, useState} from 'react';
import dimensionsRaw from './data/dimensions.json';
import schoolsRaw from './data/schools.json';
import economistsRaw from './data/economists.json';
import questionsRaw from './data/questions.json';
import sourcesRaw from './data/sources.json';
import type {Answer, Dimension, School, Economist, Question} from './types';
import {scoreAnswers, globalConfidence} from './engine/scoring';
import {rankProfiles} from './engine/metrics';
import {selectNextQuestion, shouldStop} from './engine/adaptive';
import Radar from './components/Radar';
import DoctrineMap from './components/DoctrineMap';
import AxisExplorer from './components/AxisExplorer';
import './styles.css';

// Les imports JSON sont inferes par TypeScript en types litteraux : chaque
// objet `loading` recoit la forme exacte de ses cles, avec `undefined` pour
// toutes les autres. Aucune de ces formes ne recouvre `Record<string, number>`,
// et `type: string` ne recouvre pas l'union `QuestionType`. Le passage par
// `unknown` est l'echappatoire prevue par TS2352. Le contrat reel est tenu
// par `schemas/` et verifie a chaque CI par `scripts/validate_data.py`.
const dimensions=dimensionsRaw as unknown as Dimension[], schools=schoolsRaw as unknown as School[], economists=economistsRaw as unknown as Economist[], questions=questionsRaw as unknown as Question[];
const LIKERT=[['strongly_disagree','Pas du tout d’accord'],['disagree','Plutôt pas d’accord'],['neutral','Entre les deux'],['agree','Plutôt d’accord'],['strongly_agree','Tout à fait d’accord'],['unsure','Je ne sais pas'],['depends','Cela dépend']];

type Page='home'|'test'|'results'|'schools'|'economists'|'method';

// Marqueur d'arete du site. Trace calcule depuis CRETE_ICONE (generate.py) :
// la simplification a cinq segments, celle qui reste lisible en petite taille.
function Crete(){
 return <svg className="marque-glyphe" width="22" height="14" viewBox="0 0 100 62"
   fill="none" stroke="currentColor" strokeWidth="7" strokeLinejoin="round"
   strokeLinecap="round" aria-hidden="true" focusable="false">
  <path d="M4.50 57.50 L36.45 4.50 L54.84 40.54 L79.04 12.98 L95.50 44.78"/>
 </svg>;
}

// Meme cle de stockage que ligne-de-crete.fr (`ldc-theme`). Depuis la
// publication sur GitHub Pages, les deux sites n'ont plus la meme origine :
// la cle garde la convention, la preference ne passe plus de l'un a l'autre.
function useTheme(): [string, () => void] {
 const [theme, setTheme] = useState<string>(() => {
   if (typeof document === 'undefined') return 'dark';
   return document.documentElement.dataset.theme || 'dark';
 });
 useEffect(() => {
   document.documentElement.dataset.theme = theme;
   try { localStorage.setItem('ldc-theme', theme); } catch (e) {}
 }, [theme]);
 return [theme, () => setTheme(t => (t === 'light' ? 'dark' : 'light'))];
}

export default function App(){
 const [theme,basculerTheme]=useTheme(); const [page,setPage]=useState<Page>('home'); const [answers,setAnswers]=useState<Answer[]>([]); const [current,setCurrent]=useState<string|undefined>();
 const profile=useMemo(()=>scoreAnswers(answers,questions,dimensions),[answers]);
 const schoolRank=useMemo(()=>rankProfiles(profile,schools,dimensions),[profile]);
 const econRank=useMemo(()=>rankProfiles(profile,economists,dimensions),[profile]);
 const confidence=globalConfidence(profile);
 const answeredIds=new Set(answers.map(a=>a.questionId));
 const anchorIds=questions.filter(q=>q.anchor).map(q=>q.id);
 const start=()=>{setAnswers([]);setCurrent(anchorIds[0]);setPage('test')};
 function advance(answer:Answer){
   const nextAnswers=[...answers.filter(a=>a.questionId!==answer.questionId),answer]; setAnswers(nextAnswers);
   const nextAnswered=new Set(nextAnswers.map(a=>a.questionId));
   const remainingAnchor=anchorIds.find(id=>!nextAnswered.has(id));
   if(remainingAnchor){setCurrent(remainingAnchor);return;}
   const p=scoreAnswers(nextAnswers,questions,dimensions); const ranks=rankProfiles(p,schools,dimensions); const conf=globalConfidence(p);
   if(nextAnswers.length>=35 || shouldStop(p.informativeAnswers,35,ranks.slice(0,3).map(r=>r.score),conf)){setPage('results');setCurrent(undefined);return;}
   const candidateIds=new Set(ranks.slice(0,5).map(r=>r.id));
   const next=selectNextQuestion(questions,nextAnswered,schools.filter(s=>candidateIds.has(s.id)));
   if(!next){setPage('results');setCurrent(undefined);} else setCurrent(next.id);
 }

 // Point d'entree direct. /economic-doctrine-atlas/#test demarre le
 // questionnaire sans passer par le bandeau d'accueil : c'est le lien que
 // pose la fiche du travail sur ligne-de-crete.fr, qui annonce « Faire le
 // test » et doit donc tenir sa promesse en un seul clic.
 useEffect(()=>{ if(window.location.hash==='#test') start(); }, []);

 const q=questions.find(x=>x.id===current);
 const answerLabel=(a:Answer)=>{const qq=questions.find(x=>x.id===a.questionId); if(!qq)return a.value; if(qq.type==='likert')return LIKERT.find(x=>x[0]===a.value)?.[1]??a.value; const o=(qq.options as any[]).find(x=>x.id===a.value); return o?.label??a.value;};
 const historicalRank=econRank.filter(r=>(economists.find(e=>e.id===r.id) as any)?.era==='historical');
 const contemporaryRank=econRank.filter(r=>(economists.find(e=>e.id===r.id) as any)?.era==='modern_contemporary');
 return <div className="app"><header>
  <button className="brand" onClick={()=>setPage('home')}><Crete/>Atlas doctrinal</button>
  <nav>
   {[['schools','Écoles'],['economists','Économistes'],['method','Méthode']].map(([p,l])=>
     <button className="lien-nav" key={p} aria-current={page===p?'page':undefined} onClick={()=>setPage(p as Page)}>{l}</button>)}
   <a className="retour lien-nav" href="/travaux/atlas-doctrines-eco/">← ligne de crête</a>
   <button className="bascule-theme" onClick={basculerTheme}
     aria-label="Basculer le thème clair / sombre" title="Basculer le thème clair / sombre">
    {theme==='light'?'◑':'◐'}
   </button>
  </nav>
 </header><main id="main" tabIndex={-1}>
 {page==='home'&&<section className="hero"><p className="eyebrow">Cartographie de la pensée économique</p><h1>Où se situe votre raisonnement économique ?</h1><p>Un test adaptatif, explicable et versionné qui sépare analyse positive et préférences normatives, puis compare votre profil aux écoles et économistes de référence.</p><button className="primary" onClick={start}>Commencer le test</button><div className="stats"><span>19 écoles V1</span><span>{economists.length} économistes</span><span>{questions.length} items en banque</span><span>35 questions max</span></div></section>}
 {page==='test'&&q&&<section className="test"><div className="progress"><span>{answers.length+1} / 35 max</span><span>{q.anchor?'Noyau commun':'Question adaptative'}</span></div><h2>{q.text}</h2>{q.type==='likert'?<div className="options">{LIKERT.map(([v,l])=><button key={v} onClick={()=>advance({questionId:q.id,value:v})}>{l}</button>)}</div>:<div className="options">{(q.options as any[]).map(o=><button key={o.id} onClick={()=>advance({questionId:q.id,value:o.id})}>{o.label}</button>)}</div>}<p className="muted">Aucun nom d’école ou d’économiste n’est utilisé pendant le questionnaire.</p></section>}
 {page==='results'&&<section><p className="eyebrow">Résultat · modèle V0.1</p><h1>Votre carte doctrinale</h1>{schoolRank[0]&&schoolRank[1]&&<p className="warning">{schoolRank[0].score-schoolRank[1].score<7?'Profil hybride ou frontière doctrinale probable : l’écart entre les deux premières écoles est faible.':'Profil relativement distinct : l’écart entre les deux premières écoles dépasse le seuil exploratoire de 7 points.'}</p>}<div className="result-grid"><div className="panel"><h3>Écoles les plus proches</h3>{schoolRank.slice(0,3).map((r,i)=><div className="rank" key={r.id}><b>{i+1}. {r.name}</b><span>{r.score}/100</span><small>Analytique {r.analyticScore} · Normatif {r.normativeScore}</small></div>)}</div><div className="panel"><h3>Économistes les plus proches</h3>{econRank.slice(0,3).map((r,i)=><div className="rank" key={r.id}><b>{i+1}. {r.name}</b><span>{r.score}/100</span><small>Analytique {r.analyticScore} · Normatif {r.normativeScore}</small></div>)}<details><summary>Historiques / modernes</summary><p><b>Historiques :</b> {historicalRank.slice(0,3).map(r=>`${r.name} (${r.score})`).join(' · ')}</p><p><b>Modernes/contemporains :</b> {contemporaryRank.slice(0,3).map(r=>`${r.name} (${r.score})`).join(' · ')}</p></details></div></div><div className="panel"><h3>Projection doctrinale 2D</h3><DoctrineMap vector={profile.vector} showEconomists/></div><div className="panel"><h3>Profil multidimensionnel</h3><Radar vector={profile.vector} dimensions={dimensions}/><p>Confiance instrumentale : <b>{Math.round(confidence*100)}/100</b>. Ce score exprime couverture et cohérence des réponses, pas une probabilité d’appartenance.</p></div><div className="panel"><h3>Explorer les axes réels</h3><AxisExplorer dimensions={dimensions} schools={schools} economists={economists} user={profile.vector}/></div><div className="dimension-grid">{dimensions.map(d=><div className="dimension" key={d.id}><b>{d.label}</b><div className="bar"><i style={{width:`${((profile.vector[d.id]??0)+1)*50}%`}}/></div><small>{(profile.vector[d.id]??0).toFixed(2)} · incertitude {(profile.uncertainty[d.id]??1).toFixed(2)}</small></div>)}</div><div className="result-grid"><div className="panel"><h3>Écoles les plus éloignées</h3>{schoolRank.slice(-3).reverse().map(r=><div className="rank" key={r.id}><b>{r.name}</b><span>{r.score}/100</span></div>)}</div><div className="panel"><h3>Économistes les plus éloignés</h3>{econRank.slice(-3).reverse().map(r=><div className="rank" key={r.id}><b>{r.name}</b><span>{r.score}/100</span></div>)}</div></div><details className="panel"><summary><b>Explication réponse par réponse</b></summary>{answers.map(a=>{const qq=questions.find(x=>x.id===a.questionId);return <div className="answer-audit" key={a.questionId}><p><b>{qq?.text}</b></p><p>{answerLabel(a)}</p><small>Dimensions : {Object.entries(qq?.loading??{}).map(([d,w])=>`${dimensions.find(x=>x.id===d)?.label} (${Number(w)>0?'+':''}${w})`).join(' · ')||'scénario explicite'}</small></div>})}</details><button onClick={start}>Refaire le test</button></section>}
 {page==='schools'&&<section><p className="eyebrow">Référentiel V1</p><h1>Écoles économiques</h1><div className="cards">{schools.map(s=><article className="card" key={s.id}><h3>{s.name}</h3><p>{s.summary}</p><p className="muted">{s.caveat}</p><h4>Références d’ancrage</h4><ul>{s.references.map(r=><li key={r}>{r}</li>)}</ul><a href={`reference/schools/${s.id}.html`}>Fiche détaillée →</a></article>)}</div></section>}
 {page==='economists'&&<section><p className="eyebrow">Référentiel V1</p><h1>Économistes</h1><div className="cards">{economists.map(e=><article className="card" key={e.id}><h3>{e.name}</h3><p>{e.summary}</p><p><small>Affiliation historique : {schools.find(s=>s.id===e.historical_affiliation)?.name}</small></p><ul>{e.works.map(w=><li key={w}>{w}</li>)}</ul><a href={`reference/economists/${e.id}.html`}>Fiche détaillée →</a></article>)}</div></section>}
 {page==='method'&&<section><p className="eyebrow">Auditabilité</p><h1>Méthode</h1><p>Le moteur projette les réponses sur 12 dimensions définies a priori, calcule séparément les espaces analytique et normatif, puis mesure des distances normalisées aux profils de référence. Le code, les poids, les profils et le registre de sources sont publics.</p><h2>Dimensions</h2><div className="cards">{dimensions.map(d=><article className="card" key={d.id}><h3>{d.label}</h3><p>{d.description}</p><small>{d.low} ↔ {d.high}</small></article>)}</div><h2>Sources académiques</h2><ol>{(sourcesRaw as any[]).map(s=><li key={s.id}>{s.citation}{s.url&&<> — <a href={s.url} target="_blank">source</a></>}</li>)}</ol><p className="warning">Statut V0.1 : le référentiel est un codage de recherche initial. Il ne doit pas être présenté comme psychométriquement validé avant double codage, étude inter-codeurs, calibration des items et validation externe.</p></section>}
 </main><footer>Un travail de <a href="/travaux/atlas-doctrines-eco/">ligne de crête</a> · open source · calcul local · aucune réponse transmise · modèle versionné</footer></div>
}
