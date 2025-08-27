from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import models, schemas, crud
from ..database import get_db
from . import auth
from .auth import get_current_user

router = APIRouter(
    prefix="/auditoria-agro",
    tags=["Auditoría Agro"],
    responses={404: {"description": "No encontrado"}}
)

async def get_current_user_auditoria(
    auditoria_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> models.AuditoriaAgro:
    """Verifica que la auditoría pertenezca al usuario actual"""
    auditoria = crud.get_auditoria_agro(db, auditoria_id)
    if not auditoria:
        raise HTTPException(status_code=404, detail="Auditoría no encontrada")
    if auditoria.usuario_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permiso para acceder a esta auditoría")
    return auditoria

@router.post("/", response_model=schemas.AuditoriaAgro)
def create_auditoria_agro(
    auditoria: schemas.AuditoriaAgroCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Crea una nueva auditoría agrícola con análisis automático.
    
    - Calcula consumos por etapa
    - Genera KPIs de producción y área
    - Analiza distribución de consumo
    - Genera recomendaciones basadas en los datos
    """
    # Crear la auditoría con los datos básicos
    db_auditoria = models.AuditoriaAgro(**auditoria.dict())
    db_auditoria.usuario_id = current_user.id
    
    # Calcular campos derivados
    db_auditoria.consumo_total = db_auditoria.calcular_consumo_total()
    db_auditoria.kpi_por_produccion = db_auditoria.calcular_kpi_produccion()
    db_auditoria.kpi_por_area = db_auditoria.calcular_kpi_area()
    db_auditoria.distribucion_consumo = db_auditoria.calcular_distribucion_consumo()
    
    # Calcular métricas de eficiencia
    db_auditoria.potencial_ahorro = db_auditoria.calcular_potencial_ahorro() * 100
    db_auditoria.puntuacion_eficiencia = db_auditoria.calcular_puntuacion_eficiencia()
    db_auditoria.huella_carbono = db_auditoria.calcular_huella_carbono()
    db_auditoria.eficiencia_riego = db_auditoria.calcular_eficiencia_riego()
    db_auditoria.costo_energia_por_produccion = db_auditoria.calcular_costo_energia_por_produccion()
    
    # Obtener benchmark y comparaciones
    db_auditoria.comparacion_benchmark = db_auditoria.get_benchmark_sector()
    
    # Guardar en la base de datos
    db.add(db_auditoria)
    db.commit()
    db.refresh(db_auditoria)
    
    # Generar recomendaciones basadas en los datos
    recomendaciones = generar_recomendaciones_agro(db_auditoria)
    for recomendacion in recomendaciones:
        db_recomendacion = models.Recomendacion(
            **recomendacion.dict(),
            auditoria_agro_id=db_auditoria.id
        )
        db.add(db_recomendacion)
    
    db.commit()
    db.refresh(db_auditoria)
    
    return db_auditoria

@router.get("/", response_model=List[schemas.AuditoriaAgro])
def read_auditorias_agro(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    auditorias = db.query(models.AuditoriaAgro).offset(skip).limit(limit).all()
    
    for auditoria in auditorias:
        # Calcular todos los campos si no existen
        if auditoria.consumo_total is None:
            auditoria.consumo_total = auditoria.calcular_consumo_total()
        
        if auditoria.kpi_por_produccion is None:
            auditoria.kpi_por_produccion = auditoria.calcular_kpi_produccion()
        
        if auditoria.kpi_por_area is None:
            auditoria.kpi_por_area = auditoria.calcular_kpi_area()
        
        if auditoria.distribucion_consumo is None:
            auditoria.distribucion_consumo = auditoria.calcular_distribucion_consumo()
        
        if auditoria.potencial_ahorro is None:
            auditoria.potencial_ahorro = auditoria.calcular_potencial_ahorro() * 100
        
        if auditoria.puntuacion_eficiencia is None:
            auditoria.puntuacion_eficiencia = auditoria.calcular_puntuacion_eficiencia()
        
        if auditoria.huella_carbono is None:
            auditoria.huella_carbono = auditoria.calcular_huella_carbono()
        
        if auditoria.eficiencia_riego is None:
            auditoria.eficiencia_riego = auditoria.calcular_eficiencia_riego()
        
        if auditoria.costo_energia_por_produccion is None:
            auditoria.costo_energia_por_produccion = auditoria.calcular_costo_energia_por_produccion()
        
        if auditoria.comparacion_benchmark is None:
            auditoria.comparacion_benchmark = auditoria.get_benchmark_sector()
        
        # Asegurar que los campos booleanos tengan valores
        if auditoria.tiene_certificacion is None:
            auditoria.tiene_certificacion = False
        if auditoria.tiene_mantenimiento is None:
            auditoria.tiene_mantenimiento = False
        if auditoria.tiene_automatizacion is None:
            auditoria.tiene_automatizacion = False
    
    # Guardar todos los cambios
    db.commit()
    
    return auditorias

@router.get("/{auditoria_id}", response_model=schemas.AuditoriaAgro)
def read_auditoria_agro(auditoria_id: int, db: Session = Depends(get_db)):
    db_auditoria = db.query(models.AuditoriaAgro).filter(models.AuditoriaAgro.id == auditoria_id).first()
    if db_auditoria is None:
        raise HTTPException(status_code=404, detail="Auditoría no encontrada")
    
    # Calcular todos los campos si no existen
    if db_auditoria.consumo_total is None:
        db_auditoria.consumo_total = db_auditoria.calcular_consumo_total()
    
    if db_auditoria.kpi_por_produccion is None:
        db_auditoria.kpi_por_produccion = db_auditoria.calcular_kpi_produccion()
    
    if db_auditoria.kpi_por_area is None:
        db_auditoria.kpi_por_area = db_auditoria.calcular_kpi_area()
    
    if db_auditoria.distribucion_consumo is None:
        db_auditoria.distribucion_consumo = db_auditoria.calcular_distribucion_consumo()
    
    if db_auditoria.potencial_ahorro is None:
        db_auditoria.potencial_ahorro = db_auditoria.calcular_potencial_ahorro() * 100  # Convertir a porcentaje
    
    if db_auditoria.puntuacion_eficiencia is None:
        db_auditoria.puntuacion_eficiencia = db_auditoria.calcular_puntuacion_eficiencia()
    
    if db_auditoria.huella_carbono is None:
        db_auditoria.huella_carbono = db_auditoria.calcular_huella_carbono()
    
    if db_auditoria.eficiencia_riego is None:
        db_auditoria.eficiencia_riego = db_auditoria.calcular_eficiencia_riego()
    
    if db_auditoria.costo_energia_por_produccion is None:
        db_auditoria.costo_energia_por_produccion = db_auditoria.calcular_costo_energia_por_produccion()
    
    if db_auditoria.comparacion_benchmark is None:
        db_auditoria.comparacion_benchmark = db_auditoria.get_benchmark_sector()
    
    # Asegurar que los campos booleanos tengan valores
    if db_auditoria.tiene_certificacion is None:
        db_auditoria.tiene_certificacion = False
    if db_auditoria.tiene_mantenimiento is None:
        db_auditoria.tiene_mantenimiento = False
    if db_auditoria.tiene_automatizacion is None:
        db_auditoria.tiene_automatizacion = False
    
    # Guardar los cambios en la base de datos
    db.commit()
    
    return db_auditoria

@router.put("/{auditoria_id}", response_model=schemas.AuditoriaAgro)
async def update_auditoria_agro(
    auditoria_id: int,
    auditoria: schemas.AuditoriaAgroUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Actualiza una auditoría agrícola y recalcula todas las métricas.
    - Actualiza los datos básicos
    - Recalcula consumos y KPIs
    - Actualiza recomendaciones según los nuevos datos
    """
    db_auditoria = await get_current_user_auditoria(auditoria_id, current_user, db)
    
    # Actualizar datos
    updated_auditoria = crud.update_auditoria_agro(db, db_auditoria, auditoria)
    
    # Recalcular métricas
    updated_auditoria.calcular_consumo_total()
    updated_auditoria.calcular_kpi_produccion()
    updated_auditoria.calcular_kpi_area()
    updated_auditoria.calcular_distribucion_consumo()
    
    # Actualizar recomendaciones
    # Primero eliminar las existentes
    crud.delete_recomendaciones_auditoria(db, auditoria_id, tipo_auditoria='agro')
    
    # Generar nuevas recomendaciones
    recomendaciones = generar_recomendaciones_agro(updated_auditoria)
    for recomendacion in recomendaciones:
        db_recomendacion = models.Recomendacion(
            **recomendacion.dict(),
            auditoria_agro_id=updated_auditoria.id
        )
        db.add(db_recomendacion)
    
    return updated_auditoria

@router.delete("/{auditoria_id}")
async def delete_auditoria_agro(
    auditoria_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Elimina una auditoría agrícola y sus recomendaciones asociadas"""
    auditoria = await get_current_user_auditoria(auditoria_id, current_user, db)
    crud.delete_auditoria_agro(db, auditoria_id)
    return None

def generar_recomendaciones_agro(auditoria: models.AuditoriaAgro) -> List[schemas.RecomendacionBase]:
    """Genera recomendaciones basadas en los datos de la auditoría agrícola"""
    recomendaciones = []
    
    # Análisis de eficiencia de riego
    if auditoria.sistemas_riego:
        tipo_riego = auditoria.sistemas_riego.get('tipo', '').lower()
        if tipo_riego == 'gravedad' or tipo_riego == 'aspersores':
            recomendaciones.append(schemas.RecomendacionBase(
                categoria="Riego",
                titulo="Modernización del sistema de riego",
                descripcion="Implementar un sistema de riego por goteo para mejorar la eficiencia",
                ahorro_estimado=30.0,
                costo_implementacion="Alto",
                periodo_retorno=24.0,
                prioridad=1
            ))
    
    # Análisis de equipos
    if auditoria.equipos:
        if not auditoria.tiene_mantenimiento:
            recomendaciones.append(schemas.RecomendacionBase(
                categoria="Equipos",
                titulo="Programa de mantenimiento preventivo",
                descripcion="Implementar un programa de mantenimiento para optimizar el consumo de combustible",
                ahorro_estimado=15.0,
                costo_implementacion="Medio",
                periodo_retorno=12.0,
                prioridad=2
            ))
    
    # Análisis de automatización
    if not auditoria.tiene_automatizacion and auditoria.area_total > 50:
        recomendaciones.append(schemas.RecomendacionBase(
            categoria="Automatización",
            titulo="Sistema de control automático",
            descripcion="Implementar sistemas de control y monitoreo automático para optimizar el consumo",
            ahorro_estimado=20.0,
            costo_implementacion="Alto",
            periodo_retorno=36.0,
            prioridad=3
        ))
    
    # Análisis de consumo eléctrico
    if auditoria.consumo_electrico > 100000:
        recomendaciones.append(schemas.RecomendacionBase(
            categoria="Energía Renovable",
            titulo="Sistema fotovoltaico",
            descripcion="Instalar sistema de energía solar para reducir consumo eléctrico",
            ahorro_estimado=25.0,
            costo_implementacion="Alto",
            periodo_retorno=48.0,
            prioridad=2
        ))
    
    # Análisis de eficiencia energética
    if auditoria.calcular_kpi_area() > auditoria.get_benchmark_sector()["consumo_promedio_sector"]:
        recomendaciones.append(schemas.RecomendacionBase(
            categoria="Eficiencia Energética",
            titulo="Auditoría energética detallada",
            descripcion="Realizar una auditoría energética detallada para identificar oportunidades de mejora",
            ahorro_estimado=20.0,
            costo_implementacion="Medio",
            periodo_retorno=12.0,
            prioridad=1
        ))
    
    return recomendaciones 