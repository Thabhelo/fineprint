from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any
import uvicorn
from ..config.model_config import ModelConfig
from ..models.contract_analyzer import ContractAnalyzer
import time
from functools import lru_cache

app = FastAPI(title="FinePrint Contract Analyzer API")

# Initialize model and config
config = ModelConfig()
analyzer = ContractAnalyzer(config)

class ContractRequest(BaseModel):
    text: str

class ContractResponse(BaseModel):
    risk_level: str
    word_count: int
    red_flags: list
    processing_time: float

@lru_cache(maxsize=100)
def cached_analyze(text: str) -> Dict[str, Any]:
    """Cache analysis results for 1 hour"""
    return analyzer.analyze_contract(text)

@app.post("/analyze", response_model=ContractResponse)
async def analyze_contract(request: ContractRequest):
    try:
        start_time = time.time()
        result = cached_analyze(request.text)
        processing_time = time.time() - start_time
        
        return ContractResponse(
            risk_level=result["risk_level"],
            word_count=result["word_count"],
            red_flags=result["red_flags"],
            processing_time=processing_time
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=config.api_host,
        port=config.api_port,
        reload=True
    ) 