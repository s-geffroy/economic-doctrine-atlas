from pathlib import Path
import json, sys
root=Path(__file__).resolve().parents[1]/'src'/'data'
D=json.loads((root/'dimensions.json').read_text()); S=json.loads((root/'schools.json').read_text()); E=json.loads((root/'economists.json').read_text()); Q=json.loads((root/'questions.json').read_text())
ids=[d['id'] for d in D]; errors=[]
def check_vec(label,v):
  missing=set(ids)-set(v); extra=set(v)-set(ids)
  if missing: errors.append(f'{label}: missing {sorted(missing)}')
  if extra: errors.append(f'{label}: extra {sorted(extra)}')
  for k,x in v.items():
    if not isinstance(x,(int,float)) or x < -1 or x > 1: errors.append(f'{label}.{k}: out of range {x}')
for s in S: check_vec('school '+s['id'],s['vector'])
for e in E: check_vec('economist '+e['id'],e['vector'])
for q in Q:
  for k,w in q.get('loading',{}).items():
    if k not in ids: errors.append(f"{q['id']}: unknown dimension {k}")
anchors=sum(1 for q in Q if q['anchor'])
print(f'dimensions={len(D)} schools={len(S)} economists={len(E)} questions={len(Q)} anchors={anchors}')
if not (80 <= len(Q) <= 120): errors.append('question bank outside target 80–120')
if not (18 <= anchors <= 22): errors.append('anchor count outside target 18–22')
if len(S) < 15 or len(E) < 40: errors.append('reference registry below target size')
if errors:
  print('\n'.join('ERROR '+e for e in errors)); sys.exit(1)
print('OK')
