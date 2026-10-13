from contextvars import ContextVar
from typing import Any

request_id_context = ContextVar("request_id", default=None)
auth_token_context = ContextVar("auth_token", default=None)
user_id_context = ContextVar("user_id", default=None)
user_email_context = ContextVar("user_email", default=None)
user_roles_context = ContextVar("user_roles", default=[])

def get_request_id() -> str:
    return request_id_context.get()

def get_auth_token() -> str:
    return auth_token_context.get()

def get_user_id_email() -> dict | None:
    if user_email_context.get() is None:
        return None
    return {
        "email": user_email_context.get(),
        "id": user_id_context.get()
    }

def get_user_roles() -> list[dict[str, Any]]:
    return user_roles_context.get()