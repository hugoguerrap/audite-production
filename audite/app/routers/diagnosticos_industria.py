"""
Router principal para diagnósticos por industria.
Endpoints públicos para usuarios finales.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import uuid
from datetime import datetime

from ..database import get_db
from .. import crud, schemas
from ..utils.conditional_logic import (
    filtrar_preguntas_visibles, 
    validar_respuestas_condicionales,
    procesar_respuestas_con_otro
)
from ..utils.sugerencias_industria import generar_sugerencias_industria, generar_plan_implementacion

router = APIRouter(prefix="/api", tags=["Diagnósticos por Industria"])


@router.get("/categorias-industria", response_model=schemas.CategoriaIndustriaListResponse)
async def listar_categorias_industria(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Listar todas las categorías de industria disponibles para diagnóstico.
    Solo retorna categorías activas ordenadas por orden de visualización.
    """
    categorias = crud.get_categorias_industria(db, skip=skip, limit=limit, solo_activas=True)
    total = len(categorias)  # Para paginación futura
    
    return schemas.CategoriaIndustriaListResponse(
        categorias=categorias,
        total=total
    )


@router.get("/formularios/{categoria_id}", response_model=List[schemas.FormularioIndustriaResponse])
async def obtener_formularios_por_categoria(
    categoria_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Obtener formularios disponibles para una categoría específica de industria.
    """
    # Validar que la categoría existe y está activa
    categoria = crud.get_categoria_by_id(db, categoria_id)
    if not categoria:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoría de industria no encontrada"
        )
    
    if not categoria.activa:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Categoría de industria no está activa"
        )
    
    # Obtener formularios activos
    formularios = crud.get_formularios_by_categoria(
        db, categoria_id=categoria_id, skip=skip, limit=limit, solo_activos=True
    )
    
    # Enriquecer con información de categoría
    for formulario in formularios:
        formulario.categoria = categoria
    
    return formularios


@router.get("/formulario/{formulario_id}/preguntas", response_model=List[schemas.PreguntaFormularioResponse])
async def obtener_preguntas_formulario(
    formulario_id: int,
    respuestas_actuales: str = "",  # JSON string con respuestas para evaluar condiciones
    db: Session = Depends(get_db)
):
    """
    Obtener preguntas de un formulario con evaluación de lógica condicional.
    
    Args:
        formulario_id: ID del formulario
        respuestas_actuales: JSON string con respuestas actuales para evaluar condiciones
    """
    # Validar que el formulario existe y está activo
    formulario = crud.get_formulario_by_id(db, formulario_id, incluir_preguntas=False)
    if not formulario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Formulario no encontrado"
        )
    
    if not formulario.activo:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Formulario no está activo"
        )
    
    # Obtener todas las preguntas activas
    preguntas = crud.get_preguntas_by_formulario(db, formulario_id, solo_activas=True)
    
    # Si hay respuestas actuales, filtrar preguntas según lógica condicional
    if respuestas_actuales:
        try:
            import json
            respuestas_dict = json.loads(respuestas_actuales)
            respuestas_procesadas = procesar_respuestas_con_otro(respuestas_dict)
            preguntas = filtrar_preguntas_visibles(preguntas, respuestas_procesadas)
        except (json.JSONDecodeError, Exception):
            # Si hay error en el procesamiento, devolver todas las preguntas base
            preguntas = [p for p in preguntas if not p.pregunta_padre_id]
    else:
        # Sin respuestas, solo mostrar preguntas base (sin dependencias)
        preguntas = [p for p in preguntas if not p.pregunta_padre_id]
    
    return preguntas


@router.post("/formulario/responder")
async def enviar_respuestas_formulario(
    request: schemas.EnvioRespuestasRequest,
    db: Session = Depends(get_db)
):
    """
    Enviar respuestas de un formulario con validación de lógica condicional.
    """
    # Validar que el formulario existe
    formulario = crud.get_formulario_by_id(db, request.formulario_id)
    if not formulario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Formulario no encontrado"
        )
    
    # Obtener preguntas del formulario para validación
    preguntas = crud.get_preguntas_by_formulario(db, request.formulario_id, solo_activas=True)
    
    # Convertir respuestas a formato de validación
    respuestas_dict = {}
    for respuesta in request.respuestas:
        respuestas_dict[respuesta.pregunta_id] = respuesta.valor_respuesta
        if respuesta.valor_otro:
            respuestas_dict[f"{respuesta.pregunta_id}_otro"] = respuesta.valor_otro
    
    # Validar respuestas con lógica condicional
    validacion = validar_respuestas_condicionales(respuestas_dict, preguntas)
    if not validacion["valido"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "message": "Respuestas no válidas según lógica condicional",
                "errores": validacion["errores"],
                "preguntas_faltantes": validacion["preguntas_faltantes"],
                "preguntas_sobrantes": validacion["preguntas_sobrantes"]
            }
        )
    
    # Guardar respuestas en la base de datos
    try:
        respuestas_guardadas = crud.save_respuestas_batch(db, request.session_id, request.respuestas)
        
        return {
            "success": True,
            "session_id": request.session_id,
            "respuestas_guardadas": len(respuestas_guardadas),
            "message": "Respuestas guardadas exitosamente"
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al guardar respuestas: {str(e)}"
        )


@router.get("/formulario/sugerencias/{session_id}")
async def obtener_sugerencias_formulario(
    session_id: str,
    formulario_id: int = None,  # Opcional, si no se proporciona se infiere
    db: Session = Depends(get_db)
):
    """
    Obtener sugerencias personalizadas basadas en las respuestas de una sesión.
    """
    # Obtener respuestas de la sesión
    respuestas = crud.get_respuestas_by_session(db, session_id)
    if not respuestas:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sesión no encontrada o sin respuestas"
        )
    
    # Inferir formulario_id si no se proporciona
    if not formulario_id:
        # Obtener formulario_id desde la primera pregunta respondida
        primera_respuesta = respuestas[0]
        pregunta = crud.get_pregunta_by_id(db, primera_respuesta.pregunta_id)
        if pregunta:
            formulario_id = pregunta.formulario_id
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo determinar el formulario asociado"
            )
    
    # Obtener formulario y categoría
    formulario = crud.get_formulario_by_id(db, formulario_id)
    if not formulario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Formulario no encontrado"
        )
    
    # Convertir respuestas a formato para generación de sugerencias
    respuestas_dict = {}
    for respuesta in respuestas:
        respuestas_dict[respuesta.pregunta_id] = respuesta.valor_respuesta
        if respuesta.valor_otro:
            respuestas_dict[f"{respuesta.pregunta_id}_otro"] = respuesta.valor_otro
    
    # Generar sugerencias específicas por industria
    sugerencias = generar_sugerencias_industria(
        categoria_id=formulario.categoria_id,
        respuestas=respuestas_dict,
        db=db,
        formulario_id=formulario_id
    )
    
    # Generar plan de implementación
    plan_implementacion = generar_plan_implementacion(sugerencias)
    
    return {
        "session_id": session_id,
        "formulario_id": formulario_id,
        "categoria_industria": formulario.categoria.nombre if formulario.categoria else "Desconocida",
        "total_sugerencias": len(sugerencias),
        "sugerencias": sugerencias,
        "plan_implementacion": plan_implementacion,
        "fecha_generacion": datetime.now(),
        "metadata": {
            "respuestas_procesadas": len(respuestas),
            "tiempo_formulario": formulario.tiempo_estimado,
            "categoria_color": formulario.categoria.color if formulario.categoria else None
        }
    }


@router.get("/formulario/sesion/{session_id}")
async def obtener_estado_sesion(
    session_id: str,
    db: Session = Depends(get_db)
):
    """
    Obtener estado actual de una sesión de diagnóstico.
    """
    # Obtener respuestas de la sesión
    respuestas = crud.get_respuestas_by_session(db, session_id)
    
    if not respuestas:
        return {
            "session_id": session_id,
            "existe": False,
            "respuestas_totales": 0,
            "estado": "no_iniciada"
        }
    
    # Obtener información del formulario
    primera_respuesta = respuestas[0]
    pregunta = crud.get_pregunta_by_id(db, primera_respuesta.pregunta_id)
    formulario = None
    if pregunta:
        formulario = crud.get_formulario_by_id(db, pregunta.formulario_id)
    
    # Calcular progreso
    if formulario:
        total_preguntas = len(crud.get_preguntas_by_formulario(db, formulario.id, solo_activas=True))
        progreso = (len(respuestas) / total_preguntas * 100) if total_preguntas > 0 else 0
    else:
        progreso = 0
    
    # Determinar estado
    estado = "en_progreso"
    if progreso >= 100:
        estado = "completada"
    elif progreso > 0:
        estado = "en_progreso"
    else:
        estado = "iniciada"
    
    return {
        "session_id": session_id,
        "existe": True,
        "respuestas_totales": len(respuestas),
        "progreso_porcentaje": round(progreso, 2),
        "estado": estado,
        "formulario_id": formulario.id if formulario else None,
        "formulario_nombre": formulario.nombre if formulario else None,
        "categoria_industria": formulario.categoria.nombre if formulario and formulario.categoria else None,
        "fecha_inicio": respuestas[0].created_at if respuestas else None,
        "fecha_ultima_respuesta": respuestas[-1].created_at if respuestas else None
    }


# Endpoint auxiliar para generar session_id único
@router.post("/formulario/nueva-sesion")
async def crear_nueva_sesion():
    """
    Generar un nuevo session_id único para iniciar un diagnóstico.
    """
    session_id = str(uuid.uuid4())
    return {
        "session_id": session_id,
        "fecha_creacion": datetime.now(),
        "mensaje": "Nueva sesión creada exitosamente"
    } 