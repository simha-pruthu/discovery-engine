"""
server.py — drop this next to synthesizer.py and run it.

  pip install fastapi uvicorn
  python server.py

Listens on http://localhost:8000
Next.js /api/analyze proxies POST requests here.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import uvicorn

from synthesizer import run_pipeline

app = FastAPI(title="Briefd API")

# Allow Next.js dev server (localhost:3000) to call this
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["POST"],
    allow_headers=["Content-Type"],
)


class AnalyzeRequest(BaseModel):
    product:     str
    competitors: List[str] = []


@app.post("/analyze")
def analyze(req: AnalyzeRequest):
    """
    Calls run_pipeline and returns the result as JSON.
    The Next.js API route at /api/analyze proxies here.
    """
    try:
        result = run_pipeline(req.product, req.competitors)
        return result
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)