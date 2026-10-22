


import uuid

from fastapi import Depends, HTTPException, Path, status

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


def school_require_permission(*permissions: str):
    def permission_checker(
        school_id: uuid.UUID = Path(...),
        current_user = Depends(get_user),
    ):
        user_roles = get_user_roles()

        if not user_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )

        school_role = next((role for role in user_roles if role.get("school_id") == str(school_id)), None)

        if not school_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"You are not a member of this tenant: {school_id}."
            )

        role_permissions = school_role.get("permissions", [])

        missing_permissions = set(permissions) - set(role_permissions)

        if missing_permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions: Required permissions: {', '.join(permissions)}",
            )

        return current_user

    return permission_checker