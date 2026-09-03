import React from 'react';
import type { Dimension } from '../types';
export default function Radar({vector, dimensions, size=360}:{vector:Record<string,number>,dimensions:Dimension[],size?:number}){
  const dims=dimensions.slice(0,12); const c=size/2, r=size*0.36;
  const pts=dims.map((d,i)=>{const a=-Math.PI/2+2*Math.PI*i/dims.length; const rr=r*((vector[d.id]??0)+1)/2; return [c+rr*Math.cos(a),c+rr*Math.sin(a)]});
  const outer=dims.map((_,i)=>{const a=-Math.PI/2+2*Math.PI*i/dims.length; return [c+r*Math.cos(a),c+r*Math.sin(a)]});
  return <svg viewBox={`0 0 ${size} ${size}`} className="radar" role="img" aria-label="Radar doctrinal">
    <polygon points={outer.map(p=>p.join(',')).join(' ')} fill="none" stroke="currentColor" opacity=".25"/>
    {outer.map((p,i)=><line key={i} x1={c} y1={c} x2={p[0]} y2={p[1]} stroke="currentColor" opacity=".15"/>)}
    <polygon points={pts.map(p=>p.join(',')).join(' ')} fill="currentColor" fillOpacity=".12" stroke="currentColor" strokeWidth="2"/>
    {dims.map((d,i)=>{const a=-Math.PI/2+2*Math.PI*i/dims.length; const rr=r*1.18; return <text key={d.id} x={c+rr*Math.cos(a)} y={c+rr*Math.sin(a)} textAnchor="middle" dominantBaseline="middle" fontSize="9">{d.label.split(' ').slice(0,2).join(' ')}</text>})}
  </svg>
}
