from pathlib import Path
import json, math
root=Path(__file__).resolve().parents[1]/'src'/'data'
D=json.loads((root/'dimensions.json').read_text()); S=json.loads((root/'schools.json').read_text()); E=json.loads((root/'economists.json').read_text())
ids=[d['id'] for d in D]
def distance(a,b): return math.sqrt(sum((a[k]-b[k])**2 for k in ids)/len(ids))/2
def score(a,b): return 100*(1-distance(a,b))
# Canonical self-profile must rank itself first among school centroids.
for target in S:
  ranked=sorted(S,key=lambda s:distance(target['vector'],s['vector']))
  assert ranked[0]['id']==target['id'], (target['id'],ranked[0]['id'])
  assert abs(score(target['vector'],target['vector'])-100)<1e-9
# Every economist profile stays in valid cube.
for e in E:
  assert all(-1 <= e['vector'][k] <= 1 for k in ids)
# Analytic and normative dimensions both exist.
assert any(d['space']=='analytic' for d in D) and any(d['space']=='normative' for d in D)
print(f'OK: {len(S)} canonical school profiles, {len(E)} economist profiles, {len(ids)} dimensions')
