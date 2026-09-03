from pathlib import Path
import json, math, itertools
root=Path(__file__).resolve().parents[1]/'src'/'data'
D=json.loads((root/'dimensions.json').read_text()); S=json.loads((root/'schools.json').read_text()); Q=json.loads((root/'questions.json').read_text())
ids=[d['id'] for d in D]
def dist(a,b): return math.sqrt(sum((a[k]-b[k])**2 for k in ids)/len(ids))/2
pairs=sorted((dist(a['vector'],b['vector']),a['name'],b['name']) for a,b in itertools.combinations(S,2))
print('Closest school pairs (seed geometry):')
for d,a,b in pairs[:12]: print(f'{d:.3f}  {a} <> {b}')
print('\nQuestion coverage:')
for dim in ids:
  n=sum(1 for q in Q if dim in q.get('loading',{}))
  print(f'{dim:30s} {n:3d}')
