


from fastapi import Depends, HTTPException

from middlewares.context.request import get_user_roles
from shared.utils.token import get_current_user


def require_permission(permission: str):
    user_roles = get_user_roles()

    if len(user_roles) == 0:
        raise HTTPException(
            status_code=403,
            detail="Insufficient permissions"
        )

    permissions = []
    for role in user_roles:
        for perm in role:
            permissions.append(perm)

    permissions = list(set(permissions))
