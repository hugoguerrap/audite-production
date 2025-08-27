from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import csv
import io
import json

from .. import models, schemas
from ..database import get_db
from .auth import get_current_active_user

router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    dependencies=[Depends(get_current_active_user)]
)

# Endpoints para Sectores Industriales
@router.get("/sectores/", response_model=List[schemas.SectorIndustrial])
def listar_sectores(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    return db.query(models.SectorIndustrial).offset(skip).limit(limit).all()

@router.post("/sectores/", response_model=schemas.SectorIndustrial)
def crear_sector(
    sector: schemas.SectorIndustrialCreate,
    db: Session = Depends(get_db)
):
    db_sector = models.SectorIndustrial(**sector.model_dump())
    db.add(db_sector)
    db.commit()
    db.refresh(db_sector)
    return db_sector

@router.put("/sectores/{sector_id}", response_model=schemas.SectorIndustrial)
def actualizar_sector(
    sector_id: int,
    sector: schemas.SectorIndustrialCreate,
    db: Session = Depends(get_db)
):
    db_sector = db.query(models.SectorIndustrial).filter(models.SectorIndustrial.id == sector_id).first()
    if not db_sector:
        raise HTTPException(status_code=404, detail="Sector no encontrado")
    
    for key, value in sector.model_dump().items():
        setattr(db_sector, key, value)
    
    db_sector.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_sector)
    return db_sector

@router.delete("/sectores/{sector_id}")
def eliminar_sector(
    sector_id: int,
    db: Session = Depends(get_db)
):
    db_sector = db.query(models.SectorIndustrial).filter(models.SectorIndustrial.id == sector_id).first()
    if not db_sector:
        raise HTTPException(status_code=404, detail="Sector no encontrado")
    
    db.delete(db_sector)
    db.commit()
    return {"message": "Sector eliminado"}

@router.post("/sectores/importar")
def importar_sectores(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    content = file.file.read().decode('utf-8')
    csv_reader = csv.DictReader(io.StringIO(content))
    
    sectores_creados = []
    for row in csv_reader:
        sector = models.SectorIndustrial(
            nombre=row['nombre'],
            descripcion=row.get('descripcion', '')
        )
        db.add(sector)
        sectores_creados.append(sector)
    
    db.commit()
    return {"message": f"Se importaron {len(sectores_creados)} sectores"}

# Endpoints para Benchmarks
@router.get("/benchmarks/", response_model=List[schemas.Benchmark])
def listar_benchmarks(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    return db.query(models.Benchmark).offset(skip).limit(limit).all()

@router.post("/benchmarks/", response_model=schemas.Benchmark)
def crear_benchmark(
    benchmark: schemas.BenchmarkCreate,
    db: Session = Depends(get_db)
):
    db_benchmark = models.Benchmark(**benchmark.model_dump())
    db.add(db_benchmark)
    db.commit()
    db.refresh(db_benchmark)
    return db_benchmark

@router.get("/benchmarks/sector/{sector_id}", response_model=List[schemas.Benchmark])
def obtener_benchmarks_sector(
    sector_id: int,
    db: Session = Depends(get_db)
):
    return db.query(models.Benchmark).filter(models.Benchmark.sector_id == sector_id).all()

# Endpoints para Tipos de Equipos
@router.get("/equipos/", response_model=List[schemas.TipoEquipo])
def listar_equipos(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    return db.query(models.TipoEquipo).offset(skip).limit(limit).all()

@router.post("/equipos/", response_model=schemas.TipoEquipo)
def crear_equipo(
    equipo: schemas.TipoEquipoCreate,
    db: Session = Depends(get_db)
):
    db_equipo = models.TipoEquipo(**equipo.model_dump())
    db.add(db_equipo)
    db.commit()
    db.refresh(db_equipo)
    return db_equipo

@router.post("/equipos/eficiencia")
def registrar_eficiencia(
    equipo_id: int,
    eficiencia: float,
    db: Session = Depends(get_db)
):
    db_equipo = db.query(models.TipoEquipo).filter(models.TipoEquipo.id == equipo_id).first()
    if not db_equipo:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")
    
    db_equipo.eficiencia_tipica = eficiencia
    db_equipo.updated_at = datetime.utcnow()
    db.commit()
    return {"message": "Eficiencia actualizada"}

# Endpoints para Plantillas de Recomendaciones
@router.get("/recomendaciones/", response_model=List[schemas.PlantillaRecomendacion])
def listar_plantillas(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    return db.query(models.PlantillaRecomendacion).offset(skip).limit(limit).all()

@router.post("/recomendaciones/", response_model=schemas.PlantillaRecomendacion)
def crear_plantilla(
    plantilla: schemas.PlantillaRecomendacionCreate,
    db: Session = Depends(get_db)
):
    db_plantilla = models.PlantillaRecomendacion(**plantilla.model_dump())
    db.add(db_plantilla)
    db.commit()
    db.refresh(db_plantilla)
    return db_plantilla

@router.get("/recomendaciones/categoria/{categoria}", response_model=List[schemas.PlantillaRecomendacion])
def filtrar_por_categoria(
    categoria: str,
    db: Session = Depends(get_db)
):
    return db.query(models.PlantillaRecomendacion).filter(models.PlantillaRecomendacion.categoria == categoria).all()

# Endpoints para Parámetros del Sistema
@router.get("/parametros/", response_model=List[schemas.ParametrosSistema])
def obtener_parametros(
    db: Session = Depends(get_db)
):
    return db.query(models.ParametrosSistema).all()

@router.put("/parametros/", response_model=schemas.ParametrosSistema)
def actualizar_parametros(
    parametro_id: int,
    parametro: schemas.ParametrosSistemaCreate,
    db: Session = Depends(get_db)
):
    db_parametro = db.query(models.ParametrosSistema).filter(models.ParametrosSistema.id == parametro_id).first()
    if not db_parametro:
        raise HTTPException(status_code=404, detail="Parámetro no encontrado")
    
    for key, value in parametro.model_dump().items():
        setattr(db_parametro, key, value)
    
    db_parametro.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_parametro)
    return db_parametro

# Endpoints para Exportación
@router.get("/exportar/auditorias")
def exportar_auditorias(
    db: Session = Depends(get_db)
):
    # Obtener todas las auditorías
    auditorias_basicas = db.query(models.AuditoriaBasica).all()
    auditorias_agro = db.query(models.AuditoriaAgro).all()
    
    # Convertir a formato exportable
    datos = {
        "auditorias_basicas": [{"id": a.id, "nombre_empresa": a.nombre_empresa, "created_at": a.created_at} for a in auditorias_basicas],
        "auditorias_agro": [{"id": a.id, "nombre_proyecto": a.nombre_proyecto, "created_at": a.created_at} for a in auditorias_agro]
    }
    
    return datos

@router.get("/exportar/estadisticas")
def exportar_estadisticas(
    db: Session = Depends(get_db)
):
    # Calcular estadísticas generales
    total_auditorias_basicas = db.query(models.AuditoriaBasica).count()
    total_auditorias_agro = db.query(models.AuditoriaAgro).count()
    total_sectores = db.query(models.SectorIndustrial).count()
    total_benchmarks = db.query(models.Benchmark).count()
    
    return {
        "total_auditorias_basicas": total_auditorias_basicas,
        "total_auditorias_agro": total_auditorias_agro,
        "total_sectores": total_sectores,
        "total_benchmarks": total_benchmarks
    } 