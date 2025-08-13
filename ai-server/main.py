from fastapi import FastAPI

app = FastAPI()


@app.get("/ai")
async def root():
    return {"message": "Hello World"}