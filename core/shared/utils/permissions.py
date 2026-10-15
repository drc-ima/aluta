


from fastapi import Depends, HTTPException, status

from middlewares.context.request import get_user_roles
from shared.data.session import get_user


def require_permission(*permissions: str):
    def permission_checker(
        current_user = Depends(get_user),
    ):
        user_roles = get_user_roles()

        if not user_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )

        user_permissions = {
            perm
            for role in user_roles
            for perm in role.get("permissions", [])
        }

        missing_permissions = set(permissions) - user_permissions

        if missing_permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )

        return current_user

    return permission_checker