from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import jwt
import hashlib
import secrets
import os
from passlib.context import CryptContext

router = APIRouter(prefix="/admin/auth", tags=["Admin Authentication"])

# Configuración de seguridad
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "audite_jwt_secret_key_development_only_change_in_production_12345")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60  # 1 hora

# Configuración de hash para contraseñas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Credenciales de administrador (en producción, esto debería estar en base de datos)
ADMIN_CREDENTIALS = {
    "username": os.getenv("ADMIN_USERNAME", "admin_audite"),
    "password_hash": pwd_context.hash(os.getenv("ADMIN_PASSWORD", "AuditE2024!SecureAdmin#2024"))
}

# Modelos
class AdminLoginRequest(BaseModel):
    username: str
    password: str

class AdminLoginResponse(BaseModel):
    access_token: str
    token_type: str
    expires_in: int

class AdminTokenData(BaseModel):
    username: Optional[str] = None
    exp: Optional[datetime] = None

# Funciones de utilidad
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Convertir a timestamp para evitar problemas de zona horaria
    to_encode.update({"exp": int(expire.timestamp())})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_admin_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verificar token JWT de administrador"""
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        exp_timestamp: int = payload.get("exp")
        
        if username is None or username != ADMIN_CREDENTIALS["username"]:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Verificar expiración usando timestamp directamente
        current_timestamp = datetime.utcnow().timestamp()
        if current_timestamp > exp_timestamp:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token expirado",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        return username
        
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido",
            headers={"WWW-Authenticate": "Bearer"},
        )

# Endpoints
@router.post("/login", response_model=AdminLoginResponse)
async def admin_login(credentials: AdminLoginRequest):
    """Autenticar administrador y generar token JWT"""
    
    # Verificar credenciales
    if (credentials.username != ADMIN_CREDENTIALS["username"] or 
        not verify_password(credentials.password, ADMIN_CREDENTIALS["password_hash"])):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Crear token de acceso
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": credentials.username}, 
        expires_delta=access_token_expires
    )
    
    return AdminLoginResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60  # en segundos
    )

@router.post("/verify")
async def verify_admin_access(current_admin: str = Depends(verify_admin_token)):
    """Verificar si el token actual es válido"""
    return {"valid": True, "admin": current_admin}

@router.post("/refresh")
async def refresh_admin_token(current_admin: str = Depends(verify_admin_token)):
    """Renovar token de administrador"""
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": current_admin}, 
        expires_delta=access_token_expires
    )
    
    return AdminLoginResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60
    ) 