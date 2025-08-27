from fastapi import APIRouter, Depends, HTTPException, Request, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import func, desc
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime

from ..database import get_db
from ..models import (
    AutodiagnosticoPregunta, 
    AutodiagnosticoOpcion, 
    AutodiagnosticoRespuesta,
    User
)
from ..schemas import (
    AutodiagnosticoPregunta as AutodiagnosticoPreguntaSchema,
    AutodiagnosticoPreguntaCreate,
    AutodiagnosticoPreguntaUpdate,
    AutodiagnosticoRespuesta as AutodiagnosticoRespuestaSchema,
    AutodiagnosticoRespuestaCreate,
    AutodiagnosticoSesionCreate,
    AutodiagnosticoSesion,
    AutodiagnosticoEstadisticas,
    AutodiagnosticoSugerencia,
    AutodiagnosticoResultadosConSugerencias,
    AutodiagnosticoObtenerSugerenciasRequest,
    AutodiagnosticoObtenerSugerenciasResponse
)
from ..routers.auth import get_current_user

# Importar el nuevo sistema de autenticación
from ..routers.admin_auth import verify_admin_token

router = APIRouter(
    prefix="/autodiagnostico",
    tags=["Autodiagnóstico"],
    responses={404: {"description": "Not found"}},
)

# ========================================
# ENDPOINTS PÚBLICOS - FORMULARIO
# ========================================

@router.get("/preguntas", response_model=List[AutodiagnosticoPreguntaSchema])
async def obtener_preguntas_activas(db: Session = Depends(get_db)):
    """
    Obtiene todas las preguntas activas ordenadas por número de orden.
    Endpoint público para mostrar el formulario.
    """
    preguntas = db.query(AutodiagnosticoPregunta)\
        .options(selectinload(AutodiagnosticoPregunta.opciones))\
        .filter(AutodiagnosticoPregunta.es_activa == True)\
        .order_by(AutodiagnosticoPregunta.numero_orden)\
        .all()
    
    return preguntas

@router.post("/responder", response_model=dict)
async def enviar_respuestas(
    sesion_data: AutodiagnosticoSesionCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Envía las respuestas del formulario de autodiagnóstico.
    Endpoint público.
    """
    try:
        # Usar el session_id de las respuestas o generar uno nuevo si no se proporciona
        session_id = None
        if sesion_data.respuestas:
            # Tomar el session_id de la primera respuesta
            session_id = sesion_data.respuestas[0].session_id
        
        # Si no hay session_id en las respuestas, generar uno nuevo
        if not session_id:
            session_id = str(uuid.uuid4())
        
        # Obtener información del request
        client_ip = request.client.host if request.client else None
        user_agent = request.headers.get("user-agent", "")
        
        respuestas_guardadas = []
        
        for respuesta_data in sesion_data.respuestas:
            # Verificar que la pregunta existe
            pregunta = db.query(AutodiagnosticoPregunta)\
                .filter(AutodiagnosticoPregunta.id == respuesta_data.pregunta_id)\
                .first()
            
            if not pregunta:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Pregunta con ID {respuesta_data.pregunta_id} no encontrada"
                )
            
            # Crear respuesta
            respuesta = AutodiagnosticoRespuesta(
                id=str(uuid.uuid4()),
                session_id=session_id,
                pregunta_id=respuesta_data.pregunta_id,
                respuesta_texto=respuesta_data.respuesta_texto,
                respuesta_numero=respuesta_data.respuesta_numero,
                opciones_seleccionadas=respuesta_data.opciones_seleccionadas,
                opcion_seleccionada=respuesta_data.opcion_seleccionada,
                archivo_adjunto=respuesta_data.archivo_adjunto,
                ip_address=client_ip,
                user_agent=user_agent
            )
            
            db.add(respuesta)
            respuestas_guardadas.append(respuesta)
        
        db.commit()
        
        return {
            "message": "Respuestas guardadas exitosamente",
            "session_id": session_id,
            "total_respuestas": len(respuestas_guardadas),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al guardar respuestas: {str(e)}")

@router.get("/sesion/{session_id}", response_model=AutodiagnosticoSesion)
async def obtener_sesion(session_id: str, db: Session = Depends(get_db)):
    """
    Obtiene las respuestas de una sesión específica.
    Endpoint público para revisar respuestas enviadas.
    """
    respuestas = db.query(AutodiagnosticoRespuesta)\
        .options(selectinload(AutodiagnosticoRespuesta.pregunta))\
        .filter(AutodiagnosticoRespuesta.session_id == session_id)\
        .all()
    
    if not respuestas:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")
    
    total_preguntas = db.query(AutodiagnosticoPregunta)\
        .filter(AutodiagnosticoPregunta.es_activa == True)\
        .count()
    
    return AutodiagnosticoSesion(
        session_id=session_id,
        respuestas=respuestas,
        created_at=respuestas[0].created_at,
        total_preguntas=total_preguntas,
        preguntas_respondidas=len(respuestas),
        completado=len(respuestas) >= total_preguntas
    )

@router.get("/sugerencias/{session_id}", response_model=AutodiagnosticoObtenerSugerenciasResponse)
async def obtener_sugerencias_sesion(session_id: str, db: Session = Depends(get_db)):
    """
    Obtiene las sugerencias basadas en las respuestas de una sesión.
    Endpoint público para mostrar las recomendaciones al usuario.
    """
    respuestas = db.query(AutodiagnosticoRespuesta)\
        .filter(AutodiagnosticoRespuesta.session_id == session_id)\
        .all()
    
    if not respuestas:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")
    
    sugerencias_dict = {}
    
    for respuesta in respuestas:
        pregunta = db.query(AutodiagnosticoPregunta)\
            .options(selectinload(AutodiagnosticoPregunta.opciones))\
            .filter(AutodiagnosticoPregunta.id == respuesta.pregunta_id)\
            .first()
        
        if not pregunta:
            continue
            
        opciones_elegidas = []
        # Usar tipos de respuesta del backend (base de datos)
        if pregunta.tipo_respuesta in ['seleccion_unica', 'select'] and respuesta.opcion_seleccionada:
            opciones_elegidas.append(respuesta.opcion_seleccionada)
        elif pregunta.tipo_respuesta == 'seleccion_multiple' and respuesta.opciones_seleccionadas:
            opciones_elegidas.extend(respuesta.opciones_seleccionadas)

        for opcion in pregunta.opciones:
            if opcion.valor in opciones_elegidas and opcion.tiene_sugerencia and opcion.sugerencia:
                # Usar un diccionario para evitar duplicados si se responde varias veces
                sugerencia_key = f"{pregunta.id}-{opcion.id}"
                if sugerencia_key not in sugerencias_dict:
                    sugerencias_dict[sugerencia_key] = AutodiagnosticoSugerencia(
                        pregunta_id=pregunta.id,
                        pregunta=pregunta.pregunta,
                        opcion_seleccionada=opcion.texto_opcion,
                        sugerencia=opcion.sugerencia
                    )

    sugerencias = list(sugerencias_dict.values())
    
    return AutodiagnosticoObtenerSugerenciasResponse(
        session_id=session_id,
        sugerencias=sugerencias,
        total_sugerencias=len(sugerencias),
        fecha_generacion=datetime.now()
    )

@router.get("/sesion/{session_id}/completa", response_model=AutodiagnosticoResultadosConSugerencias)
async def obtener_sesion_completa_con_sugerencias(session_id: str, db: Session = Depends(get_db)):
    """
    Obtiene las respuestas de una sesión junto con las sugerencias correspondientes.
    Endpoint público para mostrar resultados completos.
    """
    # Obtener respuestas
    respuestas = db.query(AutodiagnosticoRespuesta)\
        .options(selectinload(AutodiagnosticoRespuesta.pregunta))\
        .filter(AutodiagnosticoRespuesta.session_id == session_id)\
        .all()
    
    if not respuestas:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")
    
    # Obtener sugerencias usando el endpoint existente
    sugerencias_response = await obtener_sugerencias_sesion(session_id, db)
    
    return AutodiagnosticoResultadosConSugerencias(
        session_id=session_id,
        respuestas=respuestas,
        sugerencias=sugerencias_response.sugerencias,
        total_sugerencias=len(sugerencias_response.sugerencias),
        created_at=respuestas[0].created_at
    )

# ========================================
# ENDPOINTS ADMIN - CRUD PREGUNTAS
# ========================================

@router.get("/admin/preguntas", response_model=List[AutodiagnosticoPreguntaSchema])
async def admin_listar_preguntas(
    incluir_inactivas: bool = False,
    current_admin: str = Depends(verify_admin_token),
    db: Session = Depends(get_db)
):
    """
    Lista todas las preguntas (admin).
    """
    query = db.query(AutodiagnosticoPregunta)\
        .options(selectinload(AutodiagnosticoPregunta.opciones))
    
    if not incluir_inactivas:
        query = query.filter(AutodiagnosticoPregunta.es_activa == True)
    
    preguntas = query.order_by(AutodiagnosticoPregunta.numero_orden).all()
    return preguntas

@router.post("/admin/preguntas", response_model=AutodiagnosticoPreguntaSchema)
async def admin_crear_pregunta(
    pregunta_data: AutodiagnosticoPreguntaCreate,
    current_admin: str = Depends(verify_admin_token),
    db: Session = Depends(get_db)
):
    """
    Crea una nueva pregunta (admin).
    """
    # Verificar que el número de orden no esté ocupado
    pregunta_existente = db.query(AutodiagnosticoPregunta)\
        .filter(AutodiagnosticoPregunta.numero_orden == pregunta_data.numero_orden)\
        .first()
    
    if pregunta_existente:
        raise HTTPException(
            status_code=400, 
            detail=f"Ya existe una pregunta con el orden {pregunta_data.numero_orden}"
        )
    
    try:
        # Crear la pregunta
        nueva_pregunta = AutodiagnosticoPregunta(
            numero_orden=pregunta_data.numero_orden,
            pregunta=pregunta_data.pregunta,
            tipo_respuesta=pregunta_data.tipo_respuesta,
            es_obligatoria=pregunta_data.es_obligatoria,
            es_activa=pregunta_data.es_activa,
            ayuda_texto=pregunta_data.ayuda_texto
        )
        
        db.add(nueva_pregunta)
        db.flush()  # Para obtener el ID
        
        # Crear las opciones
        for i, opcion_data in enumerate(pregunta_data.opciones):
            nueva_opcion = AutodiagnosticoOpcion(
                pregunta_id=nueva_pregunta.id,
                texto_opcion=opcion_data.texto_opcion,
                valor=opcion_data.valor,
                es_por_defecto=opcion_data.es_por_defecto,
                es_especial=opcion_data.es_especial,
                orden=opcion_data.orden if opcion_data.orden else i + 1,
                es_activa=opcion_data.es_activa
            )
            db.add(nueva_opcion)
        
        db.commit()
        db.refresh(nueva_pregunta)
        
        return nueva_pregunta
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al crear pregunta: {str(e)}")

@router.get("/admin/preguntas/{pregunta_id}", response_model=AutodiagnosticoPreguntaSchema)
async def admin_obtener_pregunta(
    pregunta_id: int,
    current_admin: str = Depends(verify_admin_token),
    db: Session = Depends(get_db)
):
    """
    Obtiene una pregunta específica (admin).
    """
    pregunta = db.query(AutodiagnosticoPregunta)\
        .options(selectinload(AutodiagnosticoPregunta.opciones))\
        .filter(AutodiagnosticoPregunta.id == pregunta_id)\
        .first()
    
    if not pregunta:
        raise HTTPException(status_code=404, detail="Pregunta no encontrada")
    
    return pregunta

@router.put("/admin/preguntas/{pregunta_id}", response_model=AutodiagnosticoPreguntaSchema)
async def admin_actualizar_pregunta(
    pregunta_id: int,
    pregunta_data: AutodiagnosticoPreguntaUpdate,
    current_admin: str = Depends(verify_admin_token),
    db: Session = Depends(get_db)
):
    """
    Actualiza una pregunta (admin).
    """
    pregunta = db.query(AutodiagnosticoPregunta)\
        .filter(AutodiagnosticoPregunta.id == pregunta_id)\
        .first()
    
    if not pregunta:
        raise HTTPException(status_code=404, detail="Pregunta no encontrada")
    
    try:
        # Actualizar campos de la pregunta
        for field, value in pregunta_data.dict(exclude_unset=True, exclude={"opciones"}).items():
            setattr(pregunta, field, value)
        
        # Si se proporcionan opciones, actualizar o crear según sea necesario
        if pregunta_data.opciones is not None:
            # Obtener opciones existentes
            opciones_existentes = db.query(AutodiagnosticoOpcion)\
                .filter(AutodiagnosticoOpcion.pregunta_id == pregunta_id)\
                .all()
            
            # Crear un diccionario de opciones existentes por valor para fácil acceso
            opciones_por_valor = {op.valor: op for op in opciones_existentes}
            
            # Procesar cada opción del request
            for i, opcion_data in enumerate(pregunta_data.opciones):
                if opcion_data.valor in opciones_por_valor:
                    # Actualizar opción existente
                    opcion_existente = opciones_por_valor[opcion_data.valor]
                    opcion_existente.texto_opcion = opcion_data.texto_opcion
                    opcion_existente.es_por_defecto = opcion_data.es_por_defecto
                    opcion_existente.es_especial = opcion_data.es_especial
                    opcion_existente.orden = opcion_data.orden if opcion_data.orden else i + 1
                    opcion_existente.es_activa = opcion_data.es_activa
                    
                    # Actualizar campos de sugerencias si están presentes
                    if hasattr(opcion_data, 'tiene_sugerencia') and opcion_data.tiene_sugerencia is not None:
                        opcion_existente.tiene_sugerencia = opcion_data.tiene_sugerencia
                    if hasattr(opcion_data, 'sugerencia') and opcion_data.sugerencia is not None:
                        opcion_existente.sugerencia = opcion_data.sugerencia
                        
                    # Marcar como procesada
                    del opciones_por_valor[opcion_data.valor]
                else:
                    # Crear nueva opción
                    nueva_opcion = AutodiagnosticoOpcion(
                        pregunta_id=pregunta_id,
                        texto_opcion=opcion_data.texto_opcion,
                        valor=opcion_data.valor,
                        es_por_defecto=opcion_data.es_por_defecto,
                        es_especial=opcion_data.es_especial,
                        orden=opcion_data.orden if opcion_data.orden else i + 1,
                        es_activa=opcion_data.es_activa,
                        tiene_sugerencia=getattr(opcion_data, 'tiene_sugerencia', False),
                        sugerencia=getattr(opcion_data, 'sugerencia', None)
                    )
                    db.add(nueva_opcion)
            
            # Eliminar opciones que ya no están en el request
            for opcion_sobrante in opciones_por_valor.values():
                db.delete(opcion_sobrante)
        
        pregunta.updated_at = datetime.now()
        db.commit()
        db.refresh(pregunta)
        
        return pregunta
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al actualizar pregunta: {str(e)}")

@router.delete("/admin/preguntas/{pregunta_id}")
async def admin_eliminar_pregunta(
    pregunta_id: int,
    current_admin: str = Depends(verify_admin_token),
    db: Session = Depends(get_db)
):
    """
    Elimina una pregunta (admin).
    """
    pregunta = db.query(AutodiagnosticoPregunta)\
        .filter(AutodiagnosticoPregunta.id == pregunta_id)\
        .first()
    
    if not pregunta:
        raise HTTPException(status_code=404, detail="Pregunta no encontrada")
    
    try:
        # Verificar si hay respuestas asociadas
        respuestas_count = db.query(AutodiagnosticoRespuesta)\
            .filter(AutodiagnosticoRespuesta.pregunta_id == pregunta_id)\
            .count()
        
        if respuestas_count > 0:
            # No eliminar físicamente, solo desactivar
            pregunta.es_activa = False
            pregunta.updated_at = datetime.now()
            db.commit()
            
            return {
                "message": f"Pregunta desactivada (tenía {respuestas_count} respuestas asociadas)",
                "desactivada": True
            }
        else:
            # Eliminar físicamente si no hay respuestas
            db.delete(pregunta)
            db.commit()
            
            return {
                "message": "Pregunta eliminada exitosamente",
                "eliminada": True
            }
            
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al eliminar pregunta: {str(e)}")

# ========================================
# ENDPOINTS ADMIN - ESTADÍSTICAS
# ========================================

@router.get("/admin/estadisticas", response_model=AutodiagnosticoEstadisticas)
async def admin_obtener_estadisticas(
    current_admin: str = Depends(verify_admin_token),
    db: Session = Depends(get_db)
):
    """
    Obtiene estadísticas del sistema de autodiagnóstico (admin).
    """
    # Contar preguntas
    total_preguntas = db.query(AutodiagnosticoPregunta).count()
    preguntas_activas = db.query(AutodiagnosticoPregunta)\
        .filter(AutodiagnosticoPregunta.es_activa == True).count()
    
    # Contar sesiones
    total_sesiones = db.query(AutodiagnosticoRespuesta.session_id)\
        .distinct().count()
    
    # Obtener respuestas por pregunta
    respuestas_por_pregunta = {}
    preguntas = db.query(AutodiagnosticoPregunta).all()
    
    for pregunta in preguntas:
        count = db.query(AutodiagnosticoRespuesta)\
            .filter(AutodiagnosticoRespuesta.pregunta_id == pregunta.id)\
            .count()
        respuestas_por_pregunta[pregunta.id] = count
    
    # Calcular sesiones completadas (aproximado)
    sesiones_completadas = 0
    if total_sesiones > 0 and preguntas_activas > 0:
        # Sesiones que tienen respuestas para todas las preguntas activas
        sesiones_completas_query = db.query(AutodiagnosticoRespuesta.session_id)\
            .group_by(AutodiagnosticoRespuesta.session_id)\
            .having(func.count(AutodiagnosticoRespuesta.id) >= preguntas_activas)
        
        sesiones_completadas = sesiones_completas_query.count()
    
    # Respuestas más comunes por pregunta (top 5 por pregunta)
    respuestas_mas_comunes = {}
    for pregunta in preguntas[:5]:  # Solo las primeras 5 preguntas para no sobrecargar
        if pregunta.tipo_respuesta in ['seleccion_unica', 'select']:
            comunes = db.query(
                AutodiagnosticoRespuesta.opcion_seleccionada,
                func.count(AutodiagnosticoRespuesta.id).label('count')
            )\
            .filter(
                AutodiagnosticoRespuesta.pregunta_id == pregunta.id,
                AutodiagnosticoRespuesta.opcion_seleccionada.isnot(None)
            )\
            .group_by(AutodiagnosticoRespuesta.opcion_seleccionada)\
            .order_by(desc('count'))\
            .limit(5)\
            .all()
            
            respuestas_mas_comunes[pregunta.id] = [
                {"opcion": opcion, "count": count} for opcion, count in comunes
            ]
    
    return AutodiagnosticoEstadisticas(
        total_preguntas=total_preguntas,
        preguntas_activas=preguntas_activas,
        total_sesiones=total_sesiones,
        sesiones_completadas=sesiones_completadas,
        respuestas_por_pregunta=respuestas_por_pregunta,
        respuestas_mas_comunes=respuestas_mas_comunes
    )

@router.get("/admin/respuestas")
async def admin_listar_respuestas(
    session_id: Optional[str] = None,
    pregunta_id: Optional[int] = None,
    limit: int = 100,
    offset: int = 0,
    current_admin: str = Depends(verify_admin_token),
    db: Session = Depends(get_db)
):
    """
    Lista respuestas con filtros opcionales (admin).
    """
    query = db.query(AutodiagnosticoRespuesta)\
        .options(selectinload(AutodiagnosticoRespuesta.pregunta))
    
    if session_id:
        query = query.filter(AutodiagnosticoRespuesta.session_id == session_id)
    
    if pregunta_id:
        query = query.filter(AutodiagnosticoRespuesta.pregunta_id == pregunta_id)
    
    respuestas = query.order_by(desc(AutodiagnosticoRespuesta.created_at))\
        .offset(offset)\
        .limit(limit)\
        .all()
    
    total = query.count()
    
    return {
        "respuestas": respuestas,
        "total": total,
        "limit": limit,
        "offset": offset
    } 