import os, time, uuid
from contextlib import asynccontextmanager

import uvicorn
from api.router import api_router
from middlewares.context.request import (
    auth_token_context,
    request_id_context,
    user_email_context,
    user_id_context,
    user_roles_context
)
from middlewares.logging.logger import logger
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi

from shared.utils.token import decode_token

title = os.environ.get("PROJECT_NAME")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """

    """
    logger.info("Starting up the application...")

    try:
        yield
    finally:
        logger.info("Shutdown event completed")


def get_openapi_schema():
    openapi_schema = get_openapi(title=title, version="1.0.0", routes=app.routes)
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app = FastAPI(lifespan=lifespan)

app.openapi = get_openapi_schema

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    expose_headers=["X-Request-ID", 'X-Elapsed-Time'],
)

@app.middleware("http")
async def add_request_id_and_elapsed_time(request: Request, call_next):
    request_id = str(uuid.uuid4())
    request_id_context.set(request_id)

    if request.method == "OPTION":
        response = await call_next(request)
        return response

    auth_header = request.headers.get("Authorization")
    if auth_header:
        if auth_header.startswith("Bearer "):
            token_split = auth_header.split(" ")
            token = token_split[1]

            logger.info(f"[Middleware]: Decoding token...")

            payload = decode_token(token, type="access")

            if not payload:
                logger.error(
                    f"[Middleware]: Invalid Authorization header found in request to {request.url.path}"
                )
            else:
                user_id_context.set(payload.get("sub"))
                user_email_context.set(payload.get("upn"))
                user_roles_context.set(payload.get("roles"))
                auth_token_context.set(token)
    else:
        logger.warning(
            f"[Middleware]: No Authorization header found in request to {request.url.path}"
        )

    start_time = time.time()
    params = {}
    if request.query_params:
        params["query"] = dict(request.query_params)

    # try:
    #     if request.method in ["POST", "PUT", "PATCH"]:
    #         params["body"] = await request.json()
    # except Exception:
    #     pass

    try:
        if request.headers.get("content-type", "").startswith("multipart/form-data"):
            form = await request.form()
            params["form"] = dict(form)
    except Exception:
        pass
    response = await call_next(request)
    elapsed_time = time.time() - start_time

    response.headers["X-Request-ID"] = request_id
    response.headers["X-Elapsed-Time"] = str(elapsed_time)
    logger.info(
        f"Request {request_id} | {request.method} {request.url.path} | Params: {params} | Elapsed: {elapsed_time:.4f}s"
    )
    return response

app.include_router(
    api_router,
    prefix="/api/v1"
)

logger.info("API setup complete")

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=int(os.environ.get("PORT", "8000")), reload=True)