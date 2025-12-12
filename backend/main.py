from ml_engine.pipeline import run_pipeline
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Stock Prediction API")

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "ML Stock Prediction API is running"}

@app.get("/api/predict/{ticker}")
def predict(ticker: str):
    try:
        result = run_pipeline(ticker)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
