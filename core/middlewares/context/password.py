from passlib.context import CryptContext

# 1. Initialize the password context (handles salt generation automatically)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")