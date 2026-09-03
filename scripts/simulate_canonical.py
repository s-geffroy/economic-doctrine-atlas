from pathlib import Path
import json, math, statistics
root=Path(__file__).resolve().parents[1]/'src'/'data'
D=json.loads((root/'dimensions.json').read_text()); S=json.loads((root/'schools.json').read_text()); Q=json.loads((root/'questions.json').read_text())
ids=[d['id'] for d in D]
qmap={q['id']:q for q in Q}

def expected(q, vec):
    den=sum(abs(w) for w in q.get('loading',{}).values()) or 1
    return sum(vec.get(k,0)*w for k,w in q.get('loading',{}).items())/den

def answer(q, vec):
    if q['type']=='likert':
        x=expected(q,vec)
        if x <= -0.75: return 'strongly_disagree'
        if x <= -0.25: return 'disagree'
        if x < 0.25: return 'neutral'
        if x < 0.75: return 'agree'
        return 'strongly_agree'
    best=None; bestd=1e9
    for o in q['options']:
        # choose option whose explicit contributions are closest to target vector on contributed dims
        d=sum((vec[k]-v)**2 for k,v in o['contribution'].items())
        if d<bestd: bestd=d; best=o['id']
    return best

def score_answers(ans):
    sums={k:0.0 for k in ids}; weights={k:0.0 for k in ids}
    l={'strongly_disagree':-1,'disagree':-.5,'neutral':0,'agree':.5,'strongly_agree':1}
    for qid,val in ans.items():
        q=qmap[qid]
        if q['type']=='likert':
            v=l[val]
            for k,w in q['loading'].items(): sums[k]+=v*w; weights[k]+=abs(w)
        else:
            o=next(o for o in q['options'] if o['id']==val)
            for k,c in o['contribution'].items(): sums[k]+=c; weights[k]+=1
    return {k:(sums[k]/weights[k] if weights[k] else 0) for k in ids}

def dist(a,b):
    analytic=[d['id'] for d in D if d['space']=='analytic']; normative=[d['id'] for d in D if d['space']=='normative']
    da=math.sqrt(sum((a[k]-b[k])**2 for k in analytic)/len(analytic))/2
    dn=math.sqrt(sum((a[k]-b[k])**2 for k in normative)/len(normative))/2
    return math.sqrt(.68*da*da+.32*dn*dn)

def rank(vec): return sorted(S,key=lambda s:dist(vec,s['vector']))

def select_next(answered,candidates):
    eligible=[q for q in Q if not q['anchor'] and q['id'] not in answered]
    if not eligible: return None
    best=None; bestscore=-1
    for q in eligible:
        vals=[expected(q,s['vector']) for s in candidates]
        var=statistics.variance(vals) if len(vals)>1 else 0
        score=var+(0.03 if q['context']=='scenario' else 0)
        if score>bestscore: bestscore=score; best=q
    return best

anchors=[q for q in Q if q['anchor']]
rows=[]
for target in S:
    ans={q['id']:answer(q,target['vector']) for q in anchors}
    while len(ans)<35:
        p=score_answers(ans); cand=rank(p)[:5]
        q=select_next(set(ans),cand)
        if not q: break
        ans[q['id']]=answer(q,target['vector'])
        p=score_answers(ans); rr=rank(p)
        margin=(1-dist(p,rr[0]['vector']))-(1-dist(p,rr[1]['vector']))
        if len(ans)>=25 and rr[0]['id']==target['id'] and margin>=0.035: break
    p=score_answers(ans); rr=rank(p)
    rows.append((target['id'],rr[0]['id'],len(ans),dist(p,target['vector']),dist(p,rr[1]['vector'])-dist(p,rr[0]['vector'])))

ok=sum(a==b for a,b,_,_,_ in rows)
print(f'canonical top-1: {ok}/{len(rows)} = {ok/len(rows):.1%}')
for r in rows:
    mark='OK' if r[0]==r[1] else 'FAIL'
    print(f'{mark:4s} {r[0]:22s} -> {r[1]:22s} n={r[2]:2d} self_d={r[3]:.3f} margin={r[4]:.3f}')
