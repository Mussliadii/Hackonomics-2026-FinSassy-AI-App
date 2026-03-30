from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
import models

from routes.auth import router as auth_router
from routes.transactions import router as transactions_router
from routes.roast import router as roast_router
from routes.learning import router as learning_router
from routes.user import router as user_router
from routes.insights import router as insights_router
from routes.forecast import router as forecast_router

# Create DB tables
models.Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 FinSassy AI API starting up...")
    yield
    print("👋 FinSassy AI API shutting down...")


app = FastAPI(
    title="FinSassy AI",
    version="1.0.0",
    description="AI-powered financial literacy platform with roast-style engagement",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers
app.include_router(auth_router, prefix="/api/v1")
app.include_router(transactions_router, prefix="/api/v1")
app.include_router(roast_router, prefix="/api/v1")
app.include_router(learning_router, prefix="/api/v1")
app.include_router(user_router, prefix="/api/v1")
app.include_router(insights_router, prefix="/api/v1")
app.include_router(forecast_router, prefix="/api/v1")


@app.get("/")
async def root():
    return {"message": "FinSassy AI API v1.0.0", "status": "running"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
