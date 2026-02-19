"""
BNB Edge DePIN Node — AI Health Prediction Service
"""
import os, time, logging
from typing import Optional
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from predictor import NodeHealthPredictor
from chain import ChainInterface
from keeper import start_keeper, stop_keeper

load_dotenv()
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)
predictor = NodeHealthPredictor()
chain: Optional[ChainInterface] = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global chain
    rpc = os.getenv("RPC_URL", "https://opbnb-mainnet-rpc.bnbchain.org")
    key = os.getenv("KEEPER_PRIVATE_KEY", "")
    nr = os.getenv("NODE_REGISTRY_ADDRESS", "")
    ro = os.getenv("REPUTATION_ORACLE_ADDRESS", "")
    if nr and key:
        chain = ChainInterface(rpc, nr, ro, key)
        start_keeper(chain, predictor)
        logger.info("🚀 AI Service started with keeper")
    else:
        logger.warning("⚠️ Running in demo mode")
    yield
    stop_keeper()

app = FastAPI(title="BNB Edge DePIN Node — AI Service", version="1.0.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

class BatchReq(BaseModel):
    addresses: list[str]

class ScoreRes(BaseModel):
    address: str
    predictedScore: int
    successRate: float
    uptimeScore: int
    stakeBonus: int
    trend: str
    riskLevel: str
    recommendation: str

def _mock(addr: str) -> dict:
    import hashlib
    s = int(hashlib.md5(addr.encode()).hexdigest()[:8], 16)
    return {"address": addr, "node_type": "GPU", "status": "ACTIVE", "staked_amount": 0.05 + (s % 10) * 0.01,
            "registered_at": int(time.time()) - 86400*30, "jobs_completed": (s % 50) + 5, "jobs_failed": s % 5,
            "total_uptime": (s % 100)*3600, "last_heartbeat": int(time.time()) - (s % 600), "reputation_score": 75}

@app.get("/health")
async def health(): return {"status": "ok", "timestamp": int(time.time()), "chainConnected": chain is not None}

@app.get("/node/{address}/score", response_model=ScoreRes)
async def score(address: str):
    data = chain.get_node(address) if chain else _mock(address)
    return ScoreRes(**predictor.predict(data))

@app.post("/nodes/batch-score")
async def batch(request: BatchReq):
    scores = [ScoreRes(**predictor.predict(chain.get_node(a) if chain else _mock(a))) for a in request.addresses]
    updated = False
    if chain and scores:
        try:
            chain.submit_batch_scores([s.address for s in scores], [s.predictedScore for s in scores])
            updated = True
        except: pass
    return {"scores": scores, "updatedOnChain": updated}

@app.get("/nodes/critical")
async def critical():
    nodes = []
    if chain:
        for a in chain.get_active_nodes():
            r = predictor.predict(chain.get_node(a))
            if r["predictedScore"] < 40: nodes.append(r)
    else:
        m = _mock("0xAA3f1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a")
        m["jobs_failed"], m["last_heartbeat"] = 8, int(time.time()) - 25000
        nodes.append(predictor.predict(m))
    return {"critical_nodes": nodes, "count": len(nodes)}

@app.websocket("/ws/live-scores")
async def ws(websocket: WebSocket):
    import asyncio, random
    await websocket.accept()
    try:
        while True:
            addr = f"0x{''.join(random.choices('0123456789abcdef', k=40))}"
            s = random.randint(20, 100)
            await websocket.send_json({"address": addr, "score": s, "timestamp": int(time.time()), "alert": s < 70})
            await asyncio.sleep(30)
    except WebSocketDisconnect: pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", "8000")), reload=True)
