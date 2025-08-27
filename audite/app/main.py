from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .routers import auth, auditoria_basica, auditoria_agro, admin, admin_auth
from .routers.agro_data import router as agro_data_router
from .routers.diagnostico_feria import router as diagnostico_feria_router
from .routers.autodiagnostico import router as autodiagnostico_router
from .routers.diagnosticos_industria import router as diagnosticos_industria_router
from .routers.admin_formularios import router as admin_formularios_router
from .health import router as health_router
from . import models
from .database import engine, test_connection
import os
import logging
from datetime import datetime
from datetime import datetime

# Configurar logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Solo crear tablas si SKIP_DB_SETUP no es "true"
skip_db_setup = os.getenv("SKIP_DB_SETUP", "false").lower() == "true"
if not skip_db_setup:
    logger.info("SKIP_DB_SETUP no es true, creando tablas...")
    try:
        models.Base.metadata.create_all(bind=engine)
        logger.info("Tablas creadas o ya existentes.")
    except Exception as e:
        logger.error(f"Error al crear tablas: {e}")
        # Podrías decidir si quieres que la app falle aquí o continúe
else:
    logger.info("SKIP_DB_SETUP es true, saltando creación de tablas.")

# Determinar el ambiente
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

app = FastAPI(
    title="Audite API",
    description="""
    API para el sistema de auditorías energéticas.
    
    Características principales:
    * Gestión de usuarios y autenticación
    * Auditorías energéticas básicas
    * Auditorías específicas para el sector agrícola
    * Cálculos automáticos de KPIs y métricas
    * Generación de recomendaciones
    """,
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Middleware para logging de requests
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.debug(f"Incoming request: {request.method} {request.url}")
    logger.debug(f"Headers: {request.headers}")
    response = await call_next(request)
    logger.debug(f"Response status: {response.status_code}")
    return response

# Configuración de CORS
# Leer orígenes desde variable de entorno, dividir por comas y quitar espacios
cors_origins_str = os.getenv("CORS_ORIGINS", "http://localhost:8080,http://127.0.0.1:8080,https://audit-energia.com")
origins = [origin.strip() for origin in cors_origins_str.split(',')]

# Log para verificar los orígenes cargados
logger.info(f"Orígenes CORS permitidos: {origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Usar la lista leída desde la variable de entorno
    allow_origin_regex=None,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=[
        "Accept",
        "Authorization",
        "Content-Type",
        "Origin",
        "X-Requested-With",
        "X-CSRF-Token",
    ],
    expose_headers=[
        "Content-Length",
        "Content-Range",
    ],
    max_age=3600,
)

# Health check endpoint para Docker
@app.get("/health")
async def health_check():
    """Endpoint de health check para Docker y monitoreo"""
    try:
        from datetime import datetime
        # Verificar conexión a base de datos
        db_status = test_connection()
        
        return {
            "status": "healthy" if db_status else "unhealthy",
            "timestamp": datetime.utcnow().isoformat(),
            "version": "2.0.0",
            "environment": ENVIRONMENT,
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

# Root endpoint
@app.get("/")
async def root():
    """Endpoint raíz con información básica"""
    from datetime import datetime
    return {
        "message": "AuditE API - Sistema de Auditorías Energéticas",
        "version": "2.0.0",
        "environment": ENVIRONMENT,
        "docs": "/docs",
        "health": "/health",
        "timestamp": datetime.utcnow().isoformat()
    }

# Manejador de errores personalizado para CORS
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Error handling request: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
        headers={
            "Access-Control-Allow-Origin": request.headers.get("origin", "*"),
            "Access-Control-Allow-Credentials": "true",
        },
    )

# Endpoint OPTIONS para manejar preflight requests
# @app.options("/{full_path:path}")
# async def options_handler(request: Request):
#     origin = request.headers.get("origin", "*")
#     return JSONResponse(
#         content={},
#         headers={
#             "Access-Control-Allow-Origin": origin,
#             "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
#             "Access-Control-Allow-Headers": "Accept, Authorization, Content-Type, Origin, X-Requested-With, X-CSRF-Token",
#             "Access-Control-Allow-Credentials": "true",
#             "Access-Control-Max-Age": "3600",
#         },
#     )

# Incluir los routers
# Health check y root endpoints
from .health import router as health_router
app.include_router(health_router)

app.include_router(auth.router)
app.include_router(auditoria_basica.router)
app.include_router(auditoria_agro.router)
app.include_router(admin.router)
app.include_router(admin_auth.router)  # Nuevo sistema de autenticación de admin
app.include_router(agro_data_router)
app.include_router(diagnostico_feria_router)
app.include_router(autodiagnostico_router)
# Nuevos routers para formularios por industria
app.include_router(diagnosticos_industria_router)  # Endpoints públicos
app.include_router(admin_formularios_router)  # Endpoints admin

# Health check endpoint para Docker
@app.get("/health")
async def health_check():
    """Endpoint de health check para Docker y monitoreo"""
    try:
        # Verificar conexión a base de datos
        db_status = test_connection()
        
        return {
            "status": "healthy" if db_status else "unhealthy",
            "timestamp": datetime.utcnow().isoformat(),
            "version": "2.0.0",
            "environment": ENVIRONMENT,
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

# Root endpoint
@app.get("/")
async def root():
    """Endpoint raíz con información básica"""
    return {
        "message": "AuditE API - Sistema de Auditorías Energéticas",
        "version": "2.0.0",
        "environment": ENVIRONMENT,
        "docs": "/docs",
        "health": "/health",
        "timestamp": datetime.utcnow().isoformat()
    } 