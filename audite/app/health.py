"""
Módulo de health check para AuditE API
"""

from fastapi import APIRouter
from fastapi.responses import JSONResponse
from datetime import datetime
import logging
import os

from .database import test_connection

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/health")
async def health_check():
    """Endpoint de health check para Docker y monitoreo"""
    try:
        # Verificar conexión a base de datos
        db_status = test_connection()
        environment = os.getenv("ENVIRONMENT", "development")
        
        return {
            "status": "healthy" if db_status else "unhealthy",
            "timestamp": datetime.utcnow().isoformat(),
            "version": "2.0.0",
            "environment": environment,
            "database": "connected" if db_status else "disconnected",
            "services": {
                "api": "running",
                "database": "connected" if db_status else "error"
            }
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "timestamp": datetime.utcnow().isoformat(),
                "error": str(e)
            }
        )

@router.get("/")
async def root():
    """Endpoint raíz con información básica"""
    environment = os.getenv("ENVIRONMENT", "development")
    return {
        "message": "AuditE API - Sistema de Auditorías Energéticas",
        "version": "2.0.0",
        "environment": environment,
        "docs": "/docs",
        "health": "/health",
        "timestamp": datetime.utcnow().isoformat()
    } 