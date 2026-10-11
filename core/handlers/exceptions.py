
import asyncio
import functools
import traceback
import httpx
from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse

from core.middlewares.logging.logger import logger
from sqlalchemy.exc import SQLAlchemyError


async def exception_handler(request: Request, call_next: callable) -> JSONResponse:

    try:
        response = await call_next(request)
        return response

    except HTTPException as http_exception:
        logger.error(f"HTTPException occurred: {http_exception.detail}")
        return JSONResponse(
            status_code=http_exception.status_code,
            content={
                "detail": f"HTTPException occurred: {http_exception.detail}"
            }
        )
    except Exception as e:
        logger.error(f"Unexpected error occurred: {str(e)}")
        logger.error(traceback.format_exc())
        return JSONResponse(
            status_code=500,
            content={"detail": "An unexpected error occurred."}
        )

def exception_catcher(func: callable) -> callable:

    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except HTTPException as http_exc:
            logger.error(
                f"HTTPException in function '{func.__name__}': {http_exc.detail}"
            )
            raise http_exc
        except ValueError as ve:
            logger.warning(
                f"ValueErro in function '{func.__name__}': {ve}"
            )
            raise ve
        except SQLAlchemyError as e:
            logger.error(f"Database error in function '{func.__name__}': {e}")
            logger.error(traceback.format_exc())
            raise HTTPException(status_code=500, detail="Database error occured.")
        except Exception as e:
            logger.error(
                f"Error in function '{func.__name__}': {e}"
            )
            logger.error(traceback.format_exc())
            raise HTTPException(status_code=500, detail="An unexpected error occurred")

    return wrapper


def retry_too_many_requests(max_retries=3, base_delay=2) -> callable:

    def decorator(func):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            for attempt in range(1, max_retries + 1):
                try:
                    return await func(*args, **kwargs)
                except httpx.HTTPStatusError as e:
                    if e.response.status_code == 429:
                        delay = base_delay * (2 ** (attempt -1))
                        logger.info(
                            f"HTTP 429 received, retrying in {delay} seconds (attempt {attempt}/{max_retries})"
                        )
                        await asyncio.sleep(delay)
                    else:
                        raise

            raise Exception(
                f"Max retries ({max_retries}) exceeded for HTTP 429 (Too Many Requests) errors"
            )

        return wrapper
    return decorator