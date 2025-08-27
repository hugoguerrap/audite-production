from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Dict
from sqlalchemy.sql import func

from app.routers.auth import get_current_user
from .. import models, schemas
from ..database import get_db
import os
from datetime import datetime

router = APIRouter(
    prefix="/agro-data",
    tags=["Datos Agrícolas"]
)

def execute_sql_file(db: Session, file_path: str):
    """Ejecuta un archivo SQL"""
    with open(file_path, 'r') as file:
        sql = file.read()
        # Envolver el SQL en text() para manejar expresiones SQL sin formato
        db.execute(text(sql))
        db.commit()

@router.post("/load-default-data", status_code=status.HTTP_200_OK)
async def load_default_data(db: Session = Depends(get_db)):
    """
    Carga los datos por defecto desde los scripts SQL.
    Este endpoint debe ser ejecutado una sola vez al iniciar la aplicación.
    """
    try:
        # Obtener el directorio de scripts
        scripts_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'scripts')
        
        # Ejecutar los scripts en orden
        scripts = [
            'init_etapa_subsector.sql',
            'create_etapa_subsector.sql',
            'init_agro_data.sql',
            'create_equipo_proceso.sql',
            'insert_agro_data.sql'
        ]
        
        for script in scripts:
            script_path = os.path.join(scripts_dir, script)
            if os.path.exists(script_path):
                execute_sql_file(db, script_path)
        
        return {"message": "Datos cargados exitosamente"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al cargar los datos: {str(e)}"
        )

@router.post("/industry-types", response_model=schemas.AgroIndustryType, status_code=status.HTTP_201_CREATED)
async def create_industry_type(
    industry_type: schemas.AgroIndustryTypeCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Crea un nuevo tipo de industria agrícola."""
    db_industry_type = models.AgroIndustryType(**industry_type.model_dump())
    db.add(db_industry_type)
    db.commit()
    db.refresh(db_industry_type)
    return db_industry_type

@router.get("/industry-types", response_model=List[schemas.AgroIndustryType])
async def get_industry_types(db: Session = Depends(get_db)):
    """Obtiene la lista de tipos de industria agrícola"""
    return db.query(models.AgroIndustryType).all()

@router.get("/industry-types/id/{type_id}", response_model=schemas.AgroIndustryType)
async def get_industry_type_by_id(
    type_id: int,
    db: Session = Depends(get_db)
):
    """Obtiene un tipo de industria por ID."""
    db_industry_type = db.query(models.AgroIndustryType).filter(models.AgroIndustryType.id == type_id).first()
    if db_industry_type is None:
        raise HTTPException(status_code=404, detail="Tipo de industria no encontrado")
    return db_industry_type

@router.get("/industry-types/subsector/{subsector}", response_model=List[schemas.AgroIndustryType])
def get_industry_types_by_subsector(subsector: str, db: Session = Depends(get_db)):
    """
    Obtiene los tipos de industria agro filtrados por subsector.
    """
    return db.query(models.AgroIndustryType).filter(models.AgroIndustryType.subsector == subsector).all()

@router.put("/industry-types/{type_id}", response_model=schemas.AgroIndustryType)
async def update_industry_type(
    type_id: int,
    industry_type: schemas.AgroIndustryTypeCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Actualiza un tipo de industria agrícola existente."""
    db_industry_type = db.query(models.AgroIndustryType).filter(models.AgroIndustryType.id == type_id).first()
    if db_industry_type is None:
        raise HTTPException(status_code=404, detail="Tipo de industria no encontrado")
    
    for key, value in industry_type.model_dump(exclude_unset=True).items():
        setattr(db_industry_type, key, value)
        
    db.commit()
    db.refresh(db_industry_type)
    return db_industry_type

@router.delete("/industry-types/{type_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_industry_type(
    type_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Elimina un tipo de industria agrícola."""
    db_industry_type = db.query(models.AgroIndustryType).filter(models.AgroIndustryType.id == type_id).first()
    if db_industry_type is None:
        raise HTTPException(status_code=404, detail="Tipo de industria no encontrado")
    
    db.delete(db_industry_type)
    db.commit()
    return None

@router.post("/equipment", response_model=schemas.AgroEquipment, status_code=status.HTTP_201_CREATED)
async def create_equipment(
    equipment: schemas.AgroEquipmentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Crea un nuevo equipo agrícola."""
    db_equipment = models.AgroEquipment(**equipment.model_dump())
    db.add(db_equipment)
    db.commit()
    db.refresh(db_equipment)
    return db_equipment

@router.get("/equipment", response_model=List[schemas.AgroEquipment])
async def get_equipment(db: Session = Depends(get_db)):
    """Obtiene la lista de equipos agrícolas"""
    return db.query(models.AgroEquipment).all()

@router.get("/equipment/id/{equipment_id}", response_model=schemas.AgroEquipment)
async def get_equipment_by_id(
    equipment_id: int,
    db: Session = Depends(get_db)
):
    """Obtiene un equipo agrícola por ID."""
    db_equipment = db.query(models.AgroEquipment).filter(models.AgroEquipment.id == equipment_id).first()
    if db_equipment is None:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")
    return db_equipment

@router.get("/equipment/sector/{sector}", response_model=List[schemas.AgroEquipment])
def get_equipment_by_sector(sector: str, db: Session = Depends(get_db)):
    """
    Obtiene los equipos agro filtrados por sector.
    """
    return db.query(models.AgroEquipment).filter(models.AgroEquipment.sector == sector).all()

@router.put("/equipment/{equipment_id}", response_model=schemas.AgroEquipment)
async def update_equipment(
    equipment_id: int,
    equipment: schemas.AgroEquipmentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Actualiza un equipo agrícola existente."""
    db_equipment = db.query(models.AgroEquipment).filter(models.AgroEquipment.id == equipment_id).first()
    if db_equipment is None:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")
    
    for key, value in equipment.model_dump(exclude_unset=True).items():
        setattr(db_equipment, key, value)
        
    db.commit()
    db.refresh(db_equipment)
    return db_equipment

@router.delete("/equipment/{equipment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_equipment(
    equipment_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Elimina un equipo agrícola."""
    db_equipment = db.query(models.AgroEquipment).filter(models.AgroEquipment.id == equipment_id).first()
    if db_equipment is None:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")
    
    db.delete(db_equipment)
    db.commit()
    return None

@router.post("/processes", response_model=schemas.AgroProcess, status_code=status.HTTP_201_CREATED)
async def create_process(
    process: schemas.AgroProcessCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Crea un nuevo proceso agrícola."""
    process_data = process.model_dump(exclude={'productos'})
    db_process = models.AgroProcess(**process_data)
    db.add(db_process)
    db.commit()
    db.refresh(db_process)
    return db_process

@router.get("/processes", response_model=List[schemas.AgroProcess])
async def get_processes(db: Session = Depends(get_db)):
    """Obtiene la lista de procesos agrícolas"""
    return db.query(models.AgroProcess).all()

@router.get("/processes/id/{process_id}", response_model=schemas.AgroProcess)
async def get_process_by_id(
    process_id: int,
    db: Session = Depends(get_db)
):
    """Obtiene un proceso agrícola por ID."""
    db_process = db.query(models.AgroProcess).filter(models.AgroProcess.id == process_id).first()
    if db_process is None:
        raise HTTPException(status_code=404, detail="Proceso no encontrado")
    return db_process

@router.get("/processes/etapa/{etapa}", response_model=List[schemas.AgroProcess])
def get_processes_by_etapa(etapa: str, db: Session = Depends(get_db)):
    """
    Obtiene los procesos agro filtrados por etapa.
    """
    return db.query(models.AgroProcess).filter(models.AgroProcess.etapa == etapa).all()

@router.put("/processes/{process_id}", response_model=schemas.AgroProcess)
async def update_process(
    process_id: int,
    process: schemas.AgroProcessCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Actualiza un proceso agrícola existente."""
    db_process = db.query(models.AgroProcess).filter(models.AgroProcess.id == process_id).first()
    if db_process is None:
        raise HTTPException(status_code=404, detail="Proceso no encontrado")
    
    process_data = process.model_dump(exclude={'productos'}, exclude_unset=True)
    for key, value in process_data.items():
        setattr(db_process, key, value)
        
    db.commit()
    db.refresh(db_process)
    return db_process

@router.delete("/processes/{process_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_process(
    process_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Elimina un proceso agrícola."""
    db_process = db.query(models.AgroProcess).filter(models.AgroProcess.id == process_id).first()
    if db_process is None:
        raise HTTPException(status_code=404, detail="Proceso no encontrado")
    
    db.delete(db_process)
    db.commit()
    return None

@router.post("/equipment-categories", response_model=schemas.AgroEquipmentCategory, status_code=status.HTTP_201_CREATED)
async def create_equipment_category(
    category: schemas.AgroEquipmentCategoryCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Crea una nueva categoría de equipo agrícola."""
    db_category = models.AgroEquipmentCategory(**category.model_dump())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

@router.get("/equipment-categories", response_model=List[schemas.AgroEquipmentCategory])
async def get_equipment_categories(db: Session = Depends(get_db)):
    """Obtiene la lista de categorías de equipos"""
    return db.query(models.AgroEquipmentCategory).all()

@router.get("/equipment-categories/id/{category_id}", response_model=schemas.AgroEquipmentCategory)
async def get_equipment_category_by_id(
    category_id: int,
    db: Session = Depends(get_db)
):
    """Obtiene una categoría de equipo por ID."""
    db_category = db.query(models.AgroEquipmentCategory).filter(models.AgroEquipmentCategory.id == category_id).first()
    if db_category is None:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    return db_category

@router.get("/equipment-categories/category/{categoria}", response_model=List[schemas.AgroEquipmentCategory])
def get_equipment_categories_by_category(categoria: str, db: Session = Depends(get_db)):
    """
    Obtiene las categorías de equipos agro filtradas por categoría.
    """
    return db.query(models.AgroEquipmentCategory).filter(models.AgroEquipmentCategory.categoria == categoria).all()

@router.put("/equipment-categories/{category_id}", response_model=schemas.AgroEquipmentCategory)
async def update_equipment_category(
    category_id: int,
    category: schemas.AgroEquipmentCategoryCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Actualiza una categoría de equipo existente."""
    db_category = db.query(models.AgroEquipmentCategory).filter(models.AgroEquipmentCategory.id == category_id).first()
    if db_category is None:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    
    for key, value in category.model_dump(exclude_unset=True).items():
        setattr(db_category, key, value)
        
    db.commit()
    db.refresh(db_category)
    return db_category

@router.delete("/equipment-categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_equipment_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Elimina una categoría de equipo."""
    db_category = db.query(models.AgroEquipmentCategory).filter(models.AgroEquipmentCategory.id == category_id).first()
    if db_category is None:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    
    db.delete(db_category)
    db.commit()
    return None

@router.post("/etapa-subsector", response_model=schemas.AgroEtapaSubsector, status_code=status.HTTP_201_CREATED)
async def create_etapa_subsector(
    etapa_subsector: schemas.AgroEtapaSubsectorCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Crea una nueva relación etapa-subsector."""
    db_etapa_subsector = models.AgroEtapaSubsector(**etapa_subsector.model_dump())
    db.add(db_etapa_subsector)
    db.commit()
    db.refresh(db_etapa_subsector)
    return db_etapa_subsector

@router.get("/etapa-subsector", response_model=List[schemas.AgroEtapaSubsector])
async def get_etapa_subsector(db: Session = Depends(get_db)):
    """Obtiene la lista de relaciones entre etapas y subsectores"""
    return db.query(models.AgroEtapaSubsector).all()

@router.get("/etapa-subsector/id/{etapa_subsector_id}", response_model=schemas.AgroEtapaSubsector)
async def get_etapa_subsector_by_id(
    etapa_subsector_id: int,
    db: Session = Depends(get_db)
):
    """Obtiene una relación etapa-subsector por ID."""
    db_etapa_subsector = db.query(models.AgroEtapaSubsector).filter(models.AgroEtapaSubsector.id == etapa_subsector_id).first()
    if db_etapa_subsector is None:
        raise HTTPException(status_code=404, detail="Relación etapa-subsector no encontrada")
    return db_etapa_subsector

@router.get("/etapa-subsector/subsector/{subsector}", response_model=List[schemas.AgroEtapaSubsector])
def get_etapa_subsector_by_subsector(subsector: str, db: Session = Depends(get_db)):
    """
    Obtiene las relaciones entre etapas y subsectores filtradas por subsector.
    La búsqueda es insensible a mayúsculas/minúsculas y acentos.
    """
    return db.query(models.AgroEtapaSubsector).filter(
        func.unaccent(models.AgroEtapaSubsector.subsector).ilike(
            func.unaccent(f"%{subsector}%")
        )
    ).all()

@router.put("/etapa-subsector/{etapa_subsector_id}", response_model=schemas.AgroEtapaSubsector)
async def update_etapa_subsector(
    etapa_subsector_id: int,
    etapa_subsector: schemas.AgroEtapaSubsectorCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Actualiza una relación etapa-subsector existente."""
    db_etapa_subsector = db.query(models.AgroEtapaSubsector).filter(models.AgroEtapaSubsector.id == etapa_subsector_id).first()
    if db_etapa_subsector is None:
        raise HTTPException(status_code=404, detail="Relación etapa-subsector no encontrada")
    
    for key, value in etapa_subsector.model_dump(exclude_unset=True).items():
        setattr(db_etapa_subsector, key, value)
        
    db.commit()
    db.refresh(db_etapa_subsector)
    return db_etapa_subsector

@router.delete("/etapa-subsector/{etapa_subsector_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_etapa_subsector(
    etapa_subsector_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Elimina una relación etapa-subsector."""
    db_etapa_subsector = db.query(models.AgroEtapaSubsector).filter(models.AgroEtapaSubsector.id == etapa_subsector_id).first()
    if db_etapa_subsector is None:
        raise HTTPException(status_code=404, detail="Relación etapa-subsector no encontrada")
    
    db.delete(db_etapa_subsector)
    db.commit()
    return None

@router.post("/proceso-producto/", response_model=schemas.ProcesoProducto)
def create_proceso_producto(
    proceso_producto: schemas.ProcesoProducto,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Crear una nueva relación proceso-producto con consumo de referencia"""
    proceso = db.query(models.AgroProcess).filter(models.AgroProcess.id == proceso_producto.proceso_id).first()
    if not proceso:
        raise HTTPException(status_code=404, detail="Proceso no encontrado")
    
    producto = db.query(models.AgroIndustryType).filter(models.AgroIndustryType.id == proceso_producto.producto_id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    db_proceso_producto = models.proceso_producto.insert().values(**proceso_producto.dict())
    db.execute(db_proceso_producto)
    db.commit()
    return proceso_producto

@router.get("/proceso-producto/{proceso_id}", response_model=List[schemas.ProcesoProducto])
def get_productos_por_proceso(
    proceso_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Obtener todos los productos asociados a un proceso"""
    proceso = db.query(models.AgroProcess).filter(models.AgroProcess.id == proceso_id).first()
    if not proceso:
        raise HTTPException(status_code=404, detail="Proceso no encontrado")
    
    productos = db.query(models.proceso_producto).filter(models.proceso_producto.c.proceso_id == proceso_id).all()
    return productos

@router.post("/consumo-por-fuente/", response_model=schemas.ConsumoPorFuente)
def create_consumo_por_fuente(
    consumo: schemas.ConsumoPorFuente,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Registrar un nuevo consumo por fuente de energía"""
    auditoria = db.query(models.AuditoriaAgro).filter(models.AuditoriaAgro.id == consumo.auditoria_id).first()
    if not auditoria:
        raise HTTPException(status_code=404, detail="Auditoría no encontrada")
    
    equipo = db.query(models.AgroEquipment).filter(models.AgroEquipment.id == consumo.equipo_id).first()
    if not equipo:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")
    
    if consumo.fuente_energia not in equipo.fuentes_energia:
        raise HTTPException(
            status_code=400, 
            detail=f"Fuente de energía no válida para este equipo. Fuentes válidas: {equipo.fuentes_energia}"
        )
    
    db_consumo = models.consumo_por_fuente.insert().values(**consumo.dict())
    db.execute(db_consumo)
    db.commit()
    return consumo

@router.get("/consumo-por-fuente/{auditoria_id}", response_model=List[schemas.ConsumoPorFuente])
def get_consumos_por_auditoria(
    auditoria_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Obtener todos los consumos registrados para una auditoría"""
    auditoria = db.query(models.AuditoriaAgro).filter(models.AuditoriaAgro.id == auditoria_id).first()
    if not auditoria:
        raise HTTPException(status_code=404, detail="Auditoría no encontrada")
    
    consumos = db.query(models.consumo_por_fuente).filter(models.consumo_por_fuente.c.auditoria_id == auditoria_id).all()
    return consumos

@router.get("/equipo/{equipo_id}/fuentes-energia", response_model=List[str])
def get_fuentes_energia_equipo(
    equipo_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Obtener las fuentes de energía disponibles para un equipo"""
    equipo = db.query(models.AgroEquipment).filter(models.AgroEquipment.id == equipo_id).first()
    if not equipo:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")
    
    return equipo.fuentes_energia

@router.get("/auditoria/{auditoria_id}/consumo-total", response_model=Dict[str, float])
def get_consumo_total_por_fuente(
    auditoria_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Calcular el consumo total por fuente de energía para una auditoría"""
    auditoria = db.query(models.AuditoriaAgro).filter(models.AuditoriaAgro.id == auditoria_id).first()
    if not auditoria:
        raise HTTPException(status_code=404, detail="Auditoría no encontrada")
    
    result = db.execute(text("""
        SELECT fuente_energia, SUM(consumo) as total
        FROM consumo_por_fuente
        WHERE auditoria_id = :auditoria_id
        GROUP BY fuente_energia
    """), {"auditoria_id": auditoria_id})
    
    consumos = {row.fuente_energia: float(row.total) for row in result}
    return consumos

@router.get("/proceso-producto/id/{proceso_producto_id}", response_model=schemas.ProcesoProducto)
async def get_proceso_producto_by_id(
    proceso_producto_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Obtener una relación proceso-producto específica por su ID."""
    query = text("SELECT * FROM proceso_producto WHERE id = :id")
    result = db.execute(query, {"id": proceso_producto_id}).first()
    if not result:
        raise HTTPException(status_code=404, detail="Relación Proceso-Producto no encontrada")
    return result

@router.get("/consumo-por-fuente/id/{consumo_id}", response_model=schemas.ConsumoPorFuente)
async def get_consumo_por_fuente_by_id(
    consumo_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Obtener un registro de consumo por fuente específico por su ID."""
    query = text("SELECT * FROM consumo_por_fuente WHERE id = :id")
    result = db.execute(query, {"id": consumo_id}).first()
    if not result:
        raise HTTPException(status_code=404, detail="Registro de consumo no encontrado")
    return result 