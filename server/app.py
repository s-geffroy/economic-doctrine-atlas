from __future__ import annotations

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from pathlib import Path
from typing import Any
import hashlib, json, os, secrets, sqlite3, time, uuid

DB_PATH = Path(os.getenv('ATLAS_DB', '/data/atlas.db'))
DB_PATH.parent.mkdir(parents=True, exist_ok=True)
app = FastAPI(title='Atlas doctrinal optional backend', version='0.1.0')

def db():
    con=sqlite3.connect(DB_PATH)
    con.row_factory=sqlite3.Row
    con.execute('''CREATE TABLE IF NOT EXISTS profiles(
      id TEXT PRIMARY KEY, owner_hash TEXT NOT NULL, created_at INTEGER NOT NULL,
      model_version TEXT NOT NULL, vector_json TEXT NOT NULL, results_json TEXT NOT NULL,
      is_public INTEGER NOT NULL DEFAULT 0
    )''')
    con.execute('''CREATE TABLE IF NOT EXISTS contributions(
      id TEXT PRIMARY KEY, created_at INTEGER NOT NULL, questionnaire_version TEXT NOT NULL,
      answers_json TEXT NOT NULL, metadata_json TEXT NOT NULL
    )''')
    con.commit(); return con

def token_hash(token:str)->str:
    return hashlib.sha256(token.encode()).hexdigest()

class SavedProfile(BaseModel):
    model_version: str
    vector: dict[str,float]
    results: dict[str,Any]
    is_public: bool=False

class VisibilityUpdate(BaseModel):
    owner_token: str
    is_public: bool

class ResearchContribution(BaseModel):
    consent: bool
    questionnaire_version: str
    answers: list[dict[str,Any]]
    metadata: dict[str,Any]=Field(default_factory=dict)

@app.get('/health')
def health(): return {'ok':True}

@app.post('/profiles')
def create_profile(payload:SavedProfile):
    pid=str(uuid.uuid4()); owner=secrets.token_urlsafe(32)
    with db() as con:
        con.execute('INSERT INTO profiles VALUES(?,?,?,?,?,?,?)',(pid,token_hash(owner),int(time.time()),payload.model_version,json.dumps(payload.vector),json.dumps(payload.results),1 if payload.is_public else 0))
    return {'id':pid,'owner_token':owner,'public_url':f'/profiles/{pid}' if payload.is_public else None}

@app.get('/profiles/{profile_id}')
def get_public_profile(profile_id:str):
    with db() as con:
        row=con.execute('SELECT id,created_at,model_version,vector_json,results_json,is_public FROM profiles WHERE id=?',(profile_id,)).fetchone()
    if not row or not row['is_public']: raise HTTPException(404,'profile not public or not found')
    return {'id':row['id'],'created_at':row['created_at'],'model_version':row['model_version'],'vector':json.loads(row['vector_json']),'results':json.loads(row['results_json'])}

@app.patch('/profiles/{profile_id}/visibility')
def set_visibility(profile_id:str,payload:VisibilityUpdate):
    with db() as con:
        row=con.execute('SELECT owner_hash FROM profiles WHERE id=?',(profile_id,)).fetchone()
        if not row or not secrets.compare_digest(row['owner_hash'],token_hash(payload.owner_token)): raise HTTPException(403,'invalid owner token')
        con.execute('UPDATE profiles SET is_public=? WHERE id=?',(1 if payload.is_public else 0,profile_id))
    return {'id':profile_id,'is_public':payload.is_public}

@app.post('/research/contributions')
def contribute(payload:ResearchContribution):
    if payload.consent is not True: raise HTTPException(400,'explicit consent required')
    cid=str(uuid.uuid4())
    # This endpoint intentionally accepts only questionnaire answers + explicitly supplied metadata.
    # Deployment must not enrich with IP/user-agent analytics unless a separate consent basis exists.
    with db() as con:
        con.execute('INSERT INTO contributions VALUES(?,?,?,?,?)',(cid,int(time.time()),payload.questionnaire_version,json.dumps(payload.answers),json.dumps(payload.metadata)))
    return {'id':cid,'accepted':True}
