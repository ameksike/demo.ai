from fastapi import FastAPI
import subprocess

app = FastAPI()

MODEL_PATH = "C:\\Users\\user\\.lmstudio\\models\\lmstudio-community\\Qwen2.5-7B-Instruct-GGUF\\Qwen2.5-7B-Instruct-Q4_K_M.gguf"

@app.post("/generate/")
async def generate(prompt: str):
    result = subprocess.run(
        ["llama-cli", "-m", MODEL_PATH, "-p", prompt],
        capture_output=True,
        text=True
    )
    return {"response": result.stdout}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
