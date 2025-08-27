from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..database import get_db

router = APIRouter(
    prefix="/auditoria-basica",
    tags=["auditoría básica"]
)

@router.post("/", response_model=schemas.AuditoriaBasica)
def create_auditoria_basica(
    auditoria: schemas.AuditoriaBasicaCreate, 
    db: Session = Depends(get_db),
    request: Request = None
):
    # Crear la auditoría básica
    db_auditoria = models.AuditoriaBasica(**auditoria.dict())
    
    # Agregar IP y marcar como completo
    if request:
        db_auditoria.ip_address = request.client.host
    db_auditoria.is_complete = True
    
    # Calcular métricas
    db_auditoria.intensidad_energetica = db_auditoria.consumo_anual / db_auditoria.tamano_instalacion
    db_auditoria.consumo_por_empleado = db_auditoria.consumo_anual / db_auditoria.num_empleados
    db_auditoria.costo_por_empleado = db_auditoria.factura_mensual * 12 / db_auditoria.num_empleados
    
    # Calcular potencial de ahorro usando el nuevo método
    db_auditoria.potencial_ahorro = db_auditoria.calcular_potencial_ahorro() * 100  # Convertir a porcentaje
    
    # Calcular puntuación de eficiencia
    base_puntuacion = 70.0
    if db_auditoria.tiene_auditoria_previa:
        base_puntuacion += 5
    if db_auditoria.renewable_energy:
        base_puntuacion += 10
    if db_auditoria.equipment_age == 'menos_5_anos':
        base_puntuacion += 5
    db_auditoria.puntuacion_eficiencia = min(base_puntuacion, 100)
    
    # Calcular distribución del consumo usando el nuevo método
    db_auditoria.distribucion_consumo = db_auditoria.calcular_distribucion_consumo()
    
    # Comparación con benchmark del sector (podríamos mejorar esto con datos reales)
    benchmarks = {
        'industrial': 150000.0,
        'comercial': 100000.0,
        'alimentacion': 200000.0,
        'otros': 100000.0
    }
    consumo_promedio = benchmarks.get(db_auditoria.sector.lower(), benchmarks['otros'])
    db_auditoria.comparacion_benchmark = {
        "consumo_promedio_sector": consumo_promedio,
        "diferencia_porcentual": ((db_auditoria.consumo_anual - consumo_promedio) / consumo_promedio) * 100
    }
    
    # Generar recomendaciones
    recomendaciones = generar_recomendaciones_basicas(auditoria)
    db_auditoria.recomendaciones = recomendaciones
    
    # Guardar en la base de datos
    db.add(db_auditoria)
    db.commit()
    db.refresh(db_auditoria)
    return db_auditoria

@router.get("/", response_model=List[schemas.AuditoriaBasica])
def read_auditorias_basicas(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    auditorias = db.query(models.AuditoriaBasica).offset(skip).limit(limit).all()
    
    # Asegurar valores por defecto para campos booleanos y calculados
    for auditoria in auditorias:
        # Campos booleanos
        if auditoria.is_complete is None:
            auditoria.is_complete = False
        if auditoria.renewable_energy is None:
            auditoria.renewable_energy = False
        if auditoria.tiene_auditoria_previa is None:
            auditoria.tiene_auditoria_previa = False
            
        # Campos calculados
        if auditoria.intensidad_energetica is None:
            auditoria.intensidad_energetica = auditoria.consumo_anual / auditoria.tamano_instalacion if auditoria.tamano_instalacion > 0 else 0
        if auditoria.consumo_por_empleado is None:
            auditoria.consumo_por_empleado = auditoria.consumo_anual / auditoria.num_empleados if auditoria.num_empleados > 0 else 0
        if auditoria.costo_por_empleado is None:
            auditoria.costo_por_empleado = auditoria.factura_mensual * 12 / auditoria.num_empleados if auditoria.num_empleados > 0 else 0
        if auditoria.potencial_ahorro is None:
            auditoria.potencial_ahorro = 20.0
        if auditoria.puntuacion_eficiencia is None:
            auditoria.puntuacion_eficiencia = 70.0
            
        # Distribución del consumo
        if auditoria.distribucion_consumo is None:
            auditoria.distribucion_consumo = auditoria.calcular_distribucion_consumo()
            
        # Benchmark
        if auditoria.comparacion_benchmark is None:
            consumo_promedio = 100000.0  # valor por defecto
            auditoria.comparacion_benchmark = {
                "consumo_promedio_sector": consumo_promedio,
                "diferencia_porcentual": ((auditoria.consumo_anual - consumo_promedio) / consumo_promedio) * 100
            }
    
    db.commit()
    return auditorias

@router.get("/{auditoria_id}", response_model=schemas.AuditoriaBasica)
def read_auditoria_basica(auditoria_id: int, db: Session = Depends(get_db)):
    db_auditoria = db.query(models.AuditoriaBasica).filter(models.AuditoriaBasica.id == auditoria_id).first()
    if db_auditoria is None:
        raise HTTPException(status_code=404, detail="Auditoría no encontrada")
    return db_auditoria

def generar_recomendaciones_basicas(auditoria: schemas.AuditoriaBasicaCreate) -> List[models.Recomendacion]:
    """Genera recomendaciones básicas basadas en los datos de la auditoría"""
    recomendaciones = []
    
    # Recomendaciones basadas en el consumo anual
    if auditoria.consumo_anual > 100000:
        recomendaciones.append(models.Recomendacion(
            categoria="Energías Renovables",
            titulo="Instalación de sistemas de energía renovable",
            descripcion="Considerar la instalación de paneles solares u otros sistemas de energía renovable para reducir el consumo de la red",
            ahorro_estimado=30.0,
            costo_implementacion="Alto",
            periodo_retorno=48.0,
            prioridad=2
        ))
    
    # Recomendaciones basadas en las fuentes de energía
    if "electricidad" in auditoria.fuentes_energia:
        recomendaciones.extend([
            models.Recomendacion(
                categoria="Iluminación",
                titulo="Cambio a iluminación LED",
                descripcion="Reemplazar las luminarias existentes por tecnología LED de alta eficiencia",
                ahorro_estimado=15.0,
                costo_implementacion="Medio",
                periodo_retorno=24.0,
                prioridad=1
            ),
            models.Recomendacion(
                categoria="Control",
                titulo="Instalación de sensores de movimiento",
                descripcion="Implementar sensores de movimiento para control automático de iluminación",
                ahorro_estimado=10.0,
                costo_implementacion="Bajo",
                periodo_retorno=12.0,
                prioridad=1
            )
        ])
    
    # Recomendaciones basadas en el tamaño de la instalación
    if auditoria.tamano_instalacion > 500:
        recomendaciones.append(models.Recomendacion(
            categoria="Gestión",
            titulo="Sistema de gestión energética",
            descripcion="Implementar un sistema de gestión energética para monitoreo y control del consumo",
            ahorro_estimado=20.0,
            costo_implementacion="Medio",
            periodo_retorno=36.0,
            prioridad=2
        ))
    
    return recomendaciones 