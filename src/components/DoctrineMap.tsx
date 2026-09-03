import React from 'react';
import projection from '../data/projection2d.json';

type Props={vector:Record<string,number>; showEconomists?:boolean};
export default function DoctrineMap({vector,showEconomists=false}:Props){
  const p=projection as any;
  const centered=p.dimensions.map((d:string,i:number)=>(vector[d]??0)-p.mean[i]);
  const ux=centered.reduce((s:number,v:number,i:number)=>s+v*p.components[0][i],0)/p.scale;
  const uy=centered.reduce((s:number,v:number,i:number)=>s+v*p.components[1][i],0)/p.scale;
  const points=p.points.filter((x:any)=>showEconomists||x.kind==='school');
  const map=(v:number)=>50+42*Math.max(-1,Math.min(1,v));
  return <div className="doctrine-map" aria-label="Projection 2D de l’espace doctrinal">
    <svg viewBox="0 0 100 100" role="img">
      <line x1="50" y1="5" x2="50" y2="95"/><line x1="5" y1="50" x2="95" y2="50"/>
      {points.map((x:any)=><g key={`${x.kind}-${x.id}`}><circle className={x.kind} cx={map(x.x)} cy={map(-x.y)} r={x.kind==='school'?1.45:.65}/><title>{x.name}</title></g>)}
      <circle className="user" cx={map(ux)} cy={map(-uy)} r="2.2"/><text x={map(ux)+2.8} y={map(-uy)-2}>Vous</text>
    </svg>
    <p className="muted">Projection PCA de visualisation uniquement · variance représentée : {Math.round((p.explained_variance_ratio[0]+p.explained_variance_ratio[1])*100)} %. Le scoring utilise l’espace complet.</p>
  </div>
}
