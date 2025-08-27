"""
Router administrativo para gestión de formularios por industria.
Incluye CRUD completo para categorías, formularios, preguntas y análisis.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime

from ..database import get_db
from .. import crud, schemas
from ..routers.admin_auth import verify_admin_token
from ..utils.conditional_logic import validar_dependencias_pregunta, obtener_preguntas_dependientes
from ..utils.sugerencias_industria import mapear_respuestas_a_templates

router = APIRouter(prefix="/api/admin", tags=["Admin - Formularios por Industria"])

# Dependency para verificar autenticación admin
def verify_admin(current_admin = Depends(verify_admin_token)):
    return current_admin


# ============================================================================
# SECCIÓN 2.4.1: ENDPOINTS ADMIN - CATEGORÍAS
# ============================================================================

@router.get("/categorias-industria", response_model=List[schemas.CategoriaIndustriaResponse])
async def admin_listar_categorias_industria(
    skip: int = 0,
    limit: int = 100,
    incluir_inactivas: bool = True,
    db: Session = Depends(get_db),
    admin_user = Depends(verify_admin)
):
    """
    [ADMIN] Listar todas las categorías de industria (incluidas las inactivas).
    """
    categorias = crud.get_categorias_industria(
        db, skip=skip, limit=limit, 
        solo_activas=not incluir_inactivas
    )
    return categorias


@router.post("/categorias-industria", response_model=schemas.CategoriaIndustriaResponse)
async def admin_crear_categoria_industria(
    categoria: schemas.CategoriaIndustriaCreate,
    db: Session = Depends(get_db),
    admin_user = Depends(verify_admin)
):
    """
    [ADMIN] Crear una nueva categoría de industria.
    """
    try:
        nueva_categoria = crud.create_categoria_industria(db, categoria)
        return nueva_categoria
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear categoría: {str(e)}"
        )


@router.put("/categorias-industria/{categoria_id}", response_model=schemas.CategoriaIndustriaResponse)
async def admin_actualizar_categoria_industria(
    categoria_id: int,
    categoria_update: schemas.CategoriaIndustriaUpdate,
    db: Session = Depends(get_db),
    admin_user = Depends(verify_admin)
):
    """
    [ADMIN] Actualizar una categoría de industria existente.
    """
    categoria_existente = crud.get_categoria_by_id(db, categoria_id)
    if not categoria_existente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoría no encontrada"
        )
    
    try:
        categoria_actualizada = crud.update_categoria_industria(db, categoria_id, categoria_update)
        return categoria_actualizada
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar categoría: {str(e)}"
        )


@router.delete("/categorias-industria/{categoria_id}")
async def admin_eliminar_categoria_industria(
    categoria_id: int,
    forzar_eliminacion: bool = False,
    db: Session = Depends(get_db),
    admin_user = Depends(verify_admin)
):
    """
    [ADMIN] Eliminar una categoría de industria.
    Si tiene formularios asociados, requiere forzar_eliminacion=True.
    """
    categoria = crud.get_categoria_by_id(db, categoria_id)
    if not categoria:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoría no encontrada"
        )
    
    # Verificar si tiene formularios asociados
    formularios = crud.get_formularios_by_categoria(db, categoria_id, limit=1)
    if formularios and not forzar_eliminacion:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La categoría tiene formularios asociados. Use forzar_eliminacion=True para continuar."
        )
    
    try:
        resultado = crud.delete_categoria_industria(db, categoria_id)
        if resultado:
            return {"message": "Categoría eliminada exitosamente", "categoria_id": categoria_id}
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al eliminar categoría"
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar categoría: {str(e)}"
        )


# ============================================================================
# SECCIÓN 2.4.2: ENDPOINTS ADMIN - FORMULARIOS
# ============================================================================

@router.get("/formularios", response_model=List[schemas.FormularioIndustriaResponse])
async def admin_listar_formularios(
    skip: int = 0,
    limit: int = 100,
    categoria_id: Optional[int] = None,
    incluir_inactivos: bool = True,
    db: Session = Depends(get_db),
    admin_user = Depends(verify_admin)
):
    """
    [ADMIN] Listar todos los formularios o filtrar por categoría.
    """
    if categoria_id:
        formularios = crud.get_formularios_by_categoria(
            db, categoria_id=categoria_id, skip=skip, limit=limit,
            solo_activos=not incluir_inactivos
        )
    else:
        # Implementar función get_all_formularios en crud.py si no existe
        formularios = []
        categorias = crud.get_categorias_industria(db, solo_activas=False)
        for categoria in categorias:
            forms_categoria = crud.get_formularios_by_categoria(
                db, categoria_id=categoria.id, skip=0, limit=1000,
                solo_activos=not incluir_inactivos
            )
            formularios.extend(forms_categoria)
    
    return formularios


@router.get("/formularios/{categoria_id}", response_model=List[schemas.FormularioIndustriaResponse])
async def admin_formularios_por_categoria(
    categoria_id: int,
    skip: int = 0,
    limit: int = 100,
    incluir_inactivos: bool = True,
    db: Session = Depends(get_db),
    admin_user = Depends(verify_admin)
):
    """
    [ADMIN] Obtener formularios específicos de una categoría.
    """
    # Verificar que la categoría existe
    categoria = crud.get_categoria_by_id(db, categoria_id)
    if not categoria:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoría no encontrada"
        )
    
    formularios = crud.get_formularios_by_categoria(
        db, categoria_id=categoria_id, skip=skip, limit=limit,
        solo_activos=not incluir_inactivos
    )
    return formularios


@router.post("/formularios", response_model=schemas.FormularioIndustriaResponse)
async def admin_crear_formulario(
    formulario: schemas.FormularioIndustriaCreate,
    db: Session = Depends(get_db),
    admin_user = Depends(verify_admin)
):
    """
    [ADMIN] Crear un nuevo formulario para una categoría.
    """
    # Verificar que la categoría existe
    categoria = crud.get_categoria_by_id(db, formulario.categoria_id)
    if not categoria:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoría de industria no encontrada"
        )
    
    try:
        nuevo_formulario = crud.create_formulario_industria(db, formulario)
        return nuevo_formulario
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear formulario: {str(e)}"
        )


@router.get("/formularios/{formulario_id}", response_model=schemas.FormularioIndustriaResponse)
async def admin_obtener_formulario(
    formulario_id: int,
    db: Session = Depends(get_db),
    admin_user = Depends(verify_admin)
):
    """
    [ADMIN] Obtener un formulario específico por ID.
    """
    formulario = crud.get_formulario_by_id(db, formulario_id)
    if not formulario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Formulario no encontrado"
        )
    
    return formulario


@router.put("/formularios/{formulario_id}", response_model=schemas.FormularioIndustriaResponse)
async def admin_actualizar_formulario(
    formulario_id: int,
    formulario_update: schemas.FormularioIndustriaUpdate,
    db: Session = Depends(get_db),
    admin_user = Depends(verify_admin)
):
    """
    [ADMIN] Actualizar un formulario existente.
    """
    formulario_existente = crud.get_formulario_by_id(db, formulario_id)
    if not formulario_existente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Formulario no encontrado"
        )
    
    try:
        formulario_actualizado = crud.update_formulario_industria(db, formulario_id, formulario_update)
        return formulario_actualizado
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar formulario: {str(e)}"
        )


@router.delete("/formularios/{formulario_id}")
async def admin_eliminar_formulario(
    formulario_id: int,
    forzar_eliminacion: bool = False,
    db: Session = Depends(get_db),
    admin_user = Depends(verify_admin)
):
    """
    [ADMIN] Eliminar un formulario.
    Si tiene preguntas/respuestas asociadas, requiere forzar_eliminacion=True.
    """
    formulario = crud.get_formulario_by_id(db, formulario_id)
    if not formulario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Formulario no encontrado"
        )
    
    # Verificar si tiene preguntas asociadas
    preguntas = crud.get_preguntas_by_formulario(db, formulario_id, limit=1)
    if preguntas and not forzar_eliminacion:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El formulario tiene preguntas asociadas. Use forzar_eliminacion=True para continuar."
        )
    
    try:
        resultado = crud.delete_formulario_industria(db, formulario_id)
        if resultado:
            return {"message": "Formulario eliminado exitosamente", "formulario_id": formulario_id}
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al eliminar formulario"
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar formulario: {str(e)}"
        )


# ============================================================================
# SECCIÓN 2.4.3: ENDPOINTS ADMIN - PREGUNTAS
# ============================================================================

@router.get("/preguntas/{formulario_id}", response_model=List[schemas.PreguntaFormularioResponse])
async def admin_preguntas_por_formulario(
    formulario_id: int,
    incluir_inactivas: bool = True,
    incluir_condicionales: bool = True,
    db: Session = Depends(get_db),
    admin_user = Depends(verify_admin)
):
    """
    [ADMIN] Obtener preguntas de un formulario con información condicional completa.
    """
    # Verificar que el formulario existe
    formulario = crud.get_formulario_by_id(db, formulario_id)
    if not formulario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Formulario no encontrado"
        )
    
    # Usar siempre get_preguntas_by_formulario para evitar problemas de schema
    preguntas = crud.get_preguntas_by_formulario(
        db, formulario_id=formulario_id, solo_activas=not incluir_inactivas
    )
    
    return preguntas


@router.post("/preguntas", response_model=schemas.PreguntaFormularioResponse)
async def admin_crear_pregunta(
    pregunta: schemas.PreguntaFormularioCreate,
    db: Session = Depends(get_db),
    admin_user = Depends(verify_admin)
):
    """
    [ADMIN] Crear una nueva pregunta para un formulario.
    Incluye validación de dependencias condicionales.
    """
    # Verificar que el formulario existe
    formulario = crud.get_formulario_by_id(db, pregunta.formulario_id)
    if not formulario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Formulario no encontrado"
        )
    
    # Si es pregunta condicional, validar dependencias
    if pregunta.pregunta_padre_id:
        todas_las_preguntas = crud.get_preguntas_by_formulario(db, pregunta.formulario_id, solo_activas=False)
        
        # Crear objeto temporal para validación
        class PreguntaTemp:
            def __init__(self, pregunta_data):
                self.id = None  # Nueva pregunta
                self.pregunta_padre_id = pregunta_data.pregunta_padre_id
                self.condicion_valor = pregunta_data.condicion_valor
                self.condicion_operador = pregunta_data.condicion_operador
                self.orden = pregunta_data.orden
        
        pregunta_temp = PreguntaTemp(pregunta)
        validacion = validar_dependencias_pregunta(pregunta_temp, todas_las_preguntas)
        
        if not validacion["valida"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "message": "Configuración condicional no válida",
                    "errores": validacion["errores"],
                    "advertencias": validacion["advertencias"]
                }
            )
    
    try:
        nueva_pregunta = crud.create_pregunta_formulario(db, pregunta)
        return nueva_pregunta
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear pregunta: {str(e)}"
        )


@router.put("/preguntas/{pregunta_id}", response_model=schemas.PreguntaFormularioResponse)
async def admin_actualizar_pregunta(
    pregunta_id: int,
    pregunta_update: schemas.PreguntaFormularioUpdate,
    db: Session = Depends(get_db),
    admin_user = Depends(verify_admin)
):
    """
    [ADMIN] Actualizar una pregunta existente.
    Incluye validación de dependencias si se modifican aspectos condicionales.
    """
    pregunta_existente = crud.get_pregunta_by_id(db, pregunta_id)
    if not pregunta_existente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pregunta no encontrada"
        )
    
    # Si se modifica lógica condicional, validar
    if (hasattr(pregunta_update, 'pregunta_padre_id') or 
        hasattr(pregunta_update, 'condicion_valor') or 
        hasattr(pregunta_update, 'condicion_operador') or
        hasattr(pregunta_update, 'orden')):
        
        todas_las_preguntas = crud.get_preguntas_by_formulario(
            db, pregunta_existente.formulario_id, solo_activas=False
        )
        
        # Crear objeto con datos actualizados para validación
        pregunta_padre_id = getattr(pregunta_update, 'pregunta_padre_id', pregunta_existente.pregunta_padre_id)
        
        if pregunta_padre_id:
            class PreguntaTemp:
                def __init__(self):
                    self.id = pregunta_id
                    self.pregunta_padre_id = pregunta_padre_id
                    self.condicion_valor = getattr(pregunta_update, 'condicion_valor', pregunta_existente.condicion_valor)
                    self.condicion_operador = getattr(pregunta_update, 'condicion_operador', pregunta_existente.condicion_operador)
                    self.orden = getattr(pregunta_update, 'orden', pregunta_existente.orden)
            
            pregunta_temp = PreguntaTemp()
            validacion = validar_dependencias_pregunta(pregunta_temp, todas_las_preguntas)
            
            if not validacion["valida"]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail={
                        "message": "Configuración condicional no válida",
                        "errores": validacion["errores"],
                        "advertencias": validacion["advertencias"]
                    }
                )
    
    try:
        pregunta_actualizada = crud.update_pregunta_formulario(db, pregunta_id, pregunta_update)
        return pregunta_actualizada
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar pregunta: {str(e)}"
        )


@router.delete("/preguntas/{pregunta_id}")
async def admin_eliminar_pregunta(
    pregunta_id: int,
    forzar_eliminacion: bool = False,
    db: Session = Depends(get_db),
    admin_user = Depends(verify_admin)
):
    """
    [ADMIN] Eliminar una pregunta.
    Verifica dependencias y preguntas hijas antes de eliminar.
    """
    pregunta = crud.get_pregunta_by_id(db, pregunta_id)
    if not pregunta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pregunta no encontrada"
        )
    
    # Verificar si tiene preguntas dependientes
    todas_las_preguntas = crud.get_preguntas_by_formulario(db, pregunta.formulario_id, solo_activas=False)
    preguntas_dependientes = obtener_preguntas_dependientes(pregunta_id, todas_las_preguntas)
    
    if preguntas_dependientes and not forzar_eliminacion:
        dependientes_info = [{"id": p.id, "texto": p.texto[:50]} for p in preguntas_dependientes]
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "message": "La pregunta tiene preguntas dependientes.",
                "preguntas_dependientes": dependientes_info,
                "solucion": "Use forzar_eliminacion=True para eliminar en cascada o modifique las dependencias primero."
            }
        )
    
    try:
        resultado = crud.delete_pregunta_formulario(db, pregunta_id)
        if resultado:
            return {
                "message": "Pregunta eliminada exitosamente", 
                "pregunta_id": pregunta_id,
                "dependientes_eliminadas": len(preguntas_dependientes) if forzar_eliminacion else 0
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al eliminar pregunta"
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar pregunta: {str(e)}"
        )


@router.put("/preguntas/{pregunta_id}/orden")
async def admin_reordenar_pregunta(
    pregunta_id: int,
    nuevo_orden: int,
    db: Session = Depends(get_db),
    admin_user = Depends(verify_admin)
):
    """
    [ADMIN] Cambiar el orden de una pregunta.
    Valida que el reordenamiento no rompa dependencias condicionales.
    """
    pregunta = crud.get_pregunta_by_id(db, pregunta_id)
    if not pregunta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pregunta no encontrada"
        )
    
    # Validar que el nuevo orden no rompa dependencias
    todas_las_preguntas = crud.get_preguntas_by_formulario(db, pregunta.formulario_id, solo_activas=False)
    
    # Simular cambio de orden
    class PreguntaTemp:
        def __init__(self):
            self.id = pregunta_id
            self.pregunta_padre_id = pregunta.pregunta_padre_id
            self.condicion_valor = pregunta.condicion_valor
            self.condicion_operador = pregunta.condicion_operador
            self.orden = nuevo_orden
    
    pregunta_temp = PreguntaTemp()
    if pregunta.pregunta_padre_id:
        validacion = validar_dependencias_pregunta(pregunta_temp, todas_las_preguntas)
        if not validacion["valida"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "message": "El nuevo orden rompe dependencias condicionales",
                    "errores": validacion["errores"]
                }
            )
    
    try:
        update_data = schemas.PreguntaFormularioUpdate(orden=nuevo_orden)
        pregunta_actualizada = crud.update_pregunta_formulario(db, pregunta_id, update_data)
        return {
            "message": "Orden actualizado exitosamente",
            "pregunta_id": pregunta_id,
            "orden_anterior": pregunta.orden,
            "orden_nuevo": nuevo_orden
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al reordenar pregunta: {str(e)}"
        )


# ============================================================================
# SECCIÓN 2.4.4: ENDPOINTS ADMIN - ANÁLISIS
# ============================================================================

@router.get("/estadisticas/{formulario_id}")
async def admin_estadisticas_formulario(
    formulario_id: int,
    fecha_inicio: Optional[str] = None,
    fecha_fin: Optional[str] = None,
    db: Session = Depends(get_db),
    admin_user = Depends(verify_admin)
):
    """
    [ADMIN] Obtener estadísticas detalladas de un formulario.
    """
    # Verificar que el formulario existe
    formulario = crud.get_formulario_by_id(db, formulario_id)
    if not formulario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Formulario no encontrado"
        )
    
    try:
        estadisticas = crud.get_estadisticas_formulario(db, formulario_id)
        
        # Enriquecer con información adicional
        preguntas = crud.get_preguntas_by_formulario(db, formulario_id, solo_activas=False)
        total_preguntas = len(preguntas)
        preguntas_condicionales = len([p for p in preguntas if p.pregunta_padre_id])
        
        return {
            "formulario_id": formulario_id,
            "formulario_nombre": formulario.nombre,
            "categoria_industria": formulario.categoria.nombre if formulario.categoria else None,
            "total_preguntas": total_preguntas,
            "preguntas_condicionales": preguntas_condicionales,
            "estadisticas_respuestas": estadisticas,
            "fecha_consulta": datetime.now()
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener estadísticas: {str(e)}"
        )


@router.get("/respuestas/{formulario_id}")
async def admin_respuestas_formulario(
    formulario_id: int,
    limit: int = 100,
    skip: int = 0,
    session_id: Optional[str] = None,
    db: Session = Depends(get_db),
    admin_user = Depends(verify_admin)
):
    """
    [ADMIN] Obtener respuestas detalladas de un formulario.
    """
    # Verificar que el formulario existe
    formulario = crud.get_formulario_by_id(db, formulario_id)
    if not formulario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Formulario no encontrado"
        )
    
    try:
        if session_id:
            # Respuestas de una sesión específica
            respuestas = crud.get_respuestas_by_session(db, session_id)
            respuestas_filtradas = [r for r in respuestas 
                                  if crud.get_pregunta_by_id(db, r.pregunta_id).formulario_id == formulario_id]
            return {
                "session_id": session_id,
                "formulario_id": formulario_id,
                "total_respuestas": len(respuestas_filtradas),
                "respuestas": respuestas_filtradas
            }
        else:
            # Implementar función para obtener todas las respuestas de un formulario
            # Esta funcionalidad requeriría una nueva función en crud.py
            return {
                "formulario_id": formulario_id,
                "message": "Funcionalidad de listado general pendiente de implementación",
                "sugerencia": "Use session_id para consultas específicas"
            }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener respuestas: {str(e)}"
        )


@router.get("/analisis-condicionales/{formulario_id}")
async def admin_analisis_condicionales(
    formulario_id: int,
    db: Session = Depends(get_db),
    admin_user = Depends(verify_admin)
):
    """
    [ADMIN] Análisis del uso de preguntas condicionales en un formulario.
    """
    # Verificar que el formulario existe
    formulario = crud.get_formulario_by_id(db, formulario_id)
    if not formulario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Formulario no encontrado"
        )
    
    try:
        preguntas = crud.get_preguntas_by_formulario(db, formulario_id, solo_activas=False)
        
        # Análisis de estructura condicional
        preguntas_base = [p for p in preguntas if not p.pregunta_padre_id]
        preguntas_condicionales = [p for p in preguntas if p.pregunta_padre_id]
        
        # Mapear dependencias
        mapa_dependencias = {}
        for pregunta in preguntas_condicionales:
            padre_id = pregunta.pregunta_padre_id
            if padre_id not in mapa_dependencias:
                mapa_dependencias[padre_id] = []
            mapa_dependencias[padre_id].append({
                "id": pregunta.id,
                "texto": pregunta.texto[:100],
                "condicion": f"{pregunta.condicion_operador} {pregunta.condicion_valor}",
                "activa": pregunta.activa
            })
        
        # Detectar posibles problemas
        problemas = []
        for pregunta in preguntas_condicionales:
            validacion = validar_dependencias_pregunta(pregunta, preguntas)
            if not validacion["valida"]:
                problemas.append({
                    "pregunta_id": pregunta.id,
                    "texto": pregunta.texto[:100],
                    "errores": validacion["errores"],
                    "advertencias": validacion["advertencias"]
                })
        
        return {
            "formulario_id": formulario_id,
            "resumen": {
                "total_preguntas": len(preguntas),
                "preguntas_base": len(preguntas_base),
                "preguntas_condicionales": len(preguntas_condicionales),
                "porcentaje_condicionales": round(len(preguntas_condicionales) / len(preguntas) * 100, 2) if preguntas else 0
            },
            "mapa_dependencias": mapa_dependencias,
            "problemas_detectados": problemas,
            "recomendaciones": [
                "Revisar preguntas con problemas de dependencias",
                "Verificar que el orden de preguntas respete las dependencias",
                "Considerar simplificar lógica condicional compleja"
            ] if problemas else ["La estructura condicional está bien configurada"],
            "fecha_analisis": datetime.now()
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al analizar estructura condicional: {str(e)}"
        ) 