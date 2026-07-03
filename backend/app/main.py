from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config.settings import settings
from app.routes.menu import router as menu_router
from app.routes.checkout import router as checkout_router
from app.routes.websocket import router as websocket_router





app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "AI Restaurant Backend Running 🚀"
    }

app.include_router(menu_router)
app.include_router(checkout_router)
app.include_router(websocket_router)


@app.get("/health")
def health():
    return {
        "status": "ok"
    }