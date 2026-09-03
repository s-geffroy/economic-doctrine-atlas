from pathlib import Path
import json, math, random, statistics, collections
root=Path(__file__).resolve().parents[1]/'src'/'data'
D=json.loads((root/'dimensions.json').read_text()); S=json.loads((root/'schools.json').read_text()); Q=json.loads((root/'questions.json').read_text())
ids=[d['id'] for d in D]; qmap={q['id']:q for q in Q}; anchors=[q for q in Q if q['anchor']]
def expected(q,vec):
    den=sum(abs(w) for w in q.get('loading',{}).values()) or 1
    return sum(vec.get(k,0)*w for k,w in q.get('loading',{}).items())/den
def noisy_answer(q,vec,rng):
    if q['type']=='likert':
        x=max(-1,min(1,expected(q,vec)+rng.gauss(0,.24)))
        if rng.random()<.05:return rng.choice(['unsure','depends'])
        return 'strongly_disagree' if x<=-.75 else 'disagree' if x<=-.25 else 'neutral' if x<.25 else 'agree' if x<.75 else 'strongly_agree'
    opts=q['options']; scores=[]
    for o in opts:
        d=sum((vec[k]-v)**2 for k,v in o['contribution'].items()) + rng.random()*.08
        scores.append((d,o['id']))
    return min(scores)[1]
def score_answers(ans):
    sums={k:0. for k in ids}; weights={k:0. for k in ids}; lk={'strongly_disagree':-1,'disagree':-.5,'neutral':0,'agree':.5,'strongly_agree':1,'unsure':None,'depends':None}
    for qid,val in ans.items():
        q=qmap[qid]
        if q['type']=='likert':
            v=lk[val]
            if v is None:continue
            for k,w in q['loading'].items():sums[k]+=v*w;weights[k]+=abs(w)
        else:
            o=next(o for o in q['options'] if o['id']==val)
            for k,c in o['contribution'].items():sums[k]+=c;weights[k]+=1
    return {k:(sums[k]/weights[k] if weights[k] else 0) for k in ids}
def dist(a,b):
    analytic=[d['id'] for d in D if d['space']=='analytic']; normative=[d['id'] for d in D if d['space']=='normative']
    da=math.sqrt(sum((a[k]-b[k])**2 for k in analytic)/len(analytic))/2
    dn=math.sqrt(sum((a[k]-b[k])**2 for k in normative)/len(normative))/2
    return math.sqrt(.68*da*da+.32*dn*dn)
def rank(v):return sorted(S,key=lambda s:dist(v,s['vector']))
def select_next(answered,cands):
    elig=[q for q in Q if not q['anchor'] and q['id'] not in answered]
    best=None; bs=-1
    for q in elig:
        vals=[expected(q,s['vector']) for s in cands]
        var=statistics.variance(vals) if len(vals)>1 else 0
        sc=var+(.03 if q['context']=='scenario' else 0)
        if sc>bs:bs=sc;best=q
    return best
rng=random.Random(20260814)
N=40; overall=0; top3=0; confusion=collections.Counter(); per=[]
for target in S:
    good=0; good3=0
    for _ in range(N):
        latent={k:max(-1,min(1,target['vector'][k]+rng.gauss(0,.12))) for k in ids}
        ans={}
        for q in anchors: ans[q['id']]=noisy_answer(q,latent,rng)
        while len(ans)<35:
            p=score_answers(ans); c=rank(p)[:5]; q=select_next(set(ans),c)
            if not q:break
            ans[q['id']]=noisy_answer(q,latent,rng)
        rr=rank(score_answers(ans)); pred=rr[0]['id']
        good += pred==target['id']; good3 += target['id'] in [x['id'] for x in rr[:3]]
        if pred!=target['id']:confusion[(target['id'],pred)]+=1
    overall+=good; top3+=good3; per.append((good/N,good3/N,target['id']))
print(f'noisy synthetic top-1={overall/(N*len(S)):.1%} top-3={top3/(N*len(S)):.1%} (N={N}/school)')
for a,b,s in sorted(per):print(f'{s:22s} top1={a:.1%} top3={b:.1%}')
print('\nMost common confusions:')
for (a,b),n in confusion.most_common(15):print(f'{a:22s} -> {b:22s} {n}')
