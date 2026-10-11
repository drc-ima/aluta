from fastapi import APIRouter

from modules.token.api.v1.routes import token

token_router = APIRouter()

token_router.include_router(
    token.router,
    tags=["Token"]
)