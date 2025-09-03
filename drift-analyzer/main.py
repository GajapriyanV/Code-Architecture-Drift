from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import tempfile
import subprocess
import os
import json
import shutil
from analysis.scan import analyze_repo

app = FastAPI(title="Drift Analyzer", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GitSpec(BaseModel):
    repo_url: str
    ref: str
    token: str | None = None

class AnalyzeReq(BaseModel):
    rules: dict
    git: GitSpec
    mode: str = "full"

@app.get("/")
def read_root():
    return {"message": "Drift Analyzer API", "version": "1.0.0"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/analyze")
def analyze(req: AnalyzeReq):
    """
    Analyze a repository for architecture drift violations
    """
    try:
        with tempfile.TemporaryDirectory() as temp_dir:
            # Clone the repository
            clone_cmd = ["git", "clone", "--depth", "1", req.git.repo_url, temp_dir]
            if req.git.token:
                # Handle private repos with token
                repo_url = req.git.repo_url.replace("https://", f"https://{req.git.token}@")
                clone_cmd = ["git", "clone", "--depth", "1", repo_url, temp_dir]
            
            result = subprocess.run(clone_cmd, capture_output=True, text=True, check=True)
            
            # Checkout specific ref
            checkout_cmd = ["git", "checkout", req.git.ref]
            result = subprocess.run(checkout_cmd, cwd=temp_dir, capture_output=True, text=True, check=True)
            
            # Analyze the repository
            analysis_result = analyze_repo(temp_dir, req.rules)
            
            return analysis_result
            
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=400, detail=f"Git operation failed: {e.stderr}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
