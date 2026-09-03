import React, {useState} from 'react';
import type {Dimension, School, Economist} from '../types';

export default function AxisExplorer({dimensions,schools,economists,user}:{dimensions:Dimension[],schools:School[],economists:Economist[],user:Record<string,number>}){
  const [dimId,setDimId]=useState(dimensions[0]?.id??'');
  const d=dimensions.find(x=>x.id===dimId)??dimensions[0];
  if(!d)return null;
  const x=(v:number)=>8+84*((Math.max(-1,Math.min(1,v))+1)/2);
  return <div className="axis-explorer">
    <label><b>Axe doctrinal</b><select value={d.id} onChange={e=>setDimId(e.target.value)}>{dimensions.map(x=><option key={x.id} value={x.id}>{x.label}</option>)}</select></label>
    <svg viewBox="0 0 100 58" role="img" aria-label={`Positionnement sur ${d.label}`}>
      <line className="axis-line" x1="8" y1="28" x2="92" y2="28"/>
      <text x="8" y="54" textAnchor="start">−1 · {d.low}</text><text x="92" y="54" textAnchor="end">+1 · {d.high}</text>
      {economists.map(e=><circle key={e.id} className="economist" cx={x(e.vector[d.id]??0)} cy="34" r=".65"><title>{e.name} · {(e.vector[d.id]??0).toFixed(2)}</title></circle>)}
      {schools.map(s=><circle key={s.id} className="school" cx={x(s.vector[d.id]??0)} cy="23" r="1.25"><title>{s.name} · {(s.vector[d.id]??0).toFixed(2)} ± {(s.sigma[d.id]??0).toFixed(2)}</title></circle>)}
      <line className="user-line" x1={x(user[d.id]??0)} y1="10" x2={x(user[d.id]??0)} y2="42"/><circle className="user" cx={x(user[d.id]??0)} cy="14" r="2"/><text className="user-label" x={x(user[d.id]??0)} y="8" textAnchor="middle">Vous {(user[d.id]??0).toFixed(2)}</text>
    </svg>
    <div className="legend"><span>● Écoles</span><span>· Économistes</span><span>│ Vous</span></div>
    <p className="muted">Les coordonnées affichées sont celles du modèle complet, pas celles d’une projection statistique.</p>
  </div>
}
