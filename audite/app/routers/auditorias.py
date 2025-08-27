from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..database import get_db

router = APIRouter(
    prefix="/auditorias",
    tags=["auditorias"]
)

@router.post("/", response_model=schemas.Auditoria)
def create_auditoria(auditoria: schemas.AuditoriaCreate, db: Session = Depends(get_db)):
    db_auditoria = models.Auditoria(**auditoria.dict())
    db.add(db_auditoria)
    db.commit()
    db.refresh(db_auditoria)
    return db_auditoria

@router.get("/", response_model=List[schemas.Auditoria])
def read_auditorias(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    auditorias = db.query(models.Auditoria).offset(skip).limit(limit).all()
    return auditorias

@router.get("/{auditoria_id}", response_model=schemas.Auditoria)
def read_auditoria(auditoria_id: int, db: Session = Depends(get_db)):
    db_auditoria = db.query(models.Auditoria).filter(models.Auditoria.id == auditoria_id).first()
    if db_auditoria is None:
        raise HTTPException(status_code=404, detail="Auditoría no encontrada")
    return db_auditoria

@router.put("/{auditoria_id}", response_model=schemas.Auditoria)
def update_auditoria(auditoria_id: int, auditoria: schemas.AuditoriaCreate, db: Session = Depends(get_db)):
    db_auditoria = db.query(models.Auditoria).filter(models.Auditoria.id == auditoria_id).first()
    if db_auditoria is None:
        raise HTTPException(status_code=404, detail="Auditoría no encontrada")
    
    for key, value in auditoria.dict().items():
        setattr(db_auditoria, key, value)
    
    db.commit()
    db.refresh(db_auditoria)
    return db_auditoria

@router.delete("/{auditoria_id}")
def delete_auditoria(auditoria_id: int, db: Session = Depends(get_db)):
    db_auditoria = db.query(models.Auditoria).filter(models.Auditoria.id == auditoria_id).first()
    if db_auditoria is None:
        raise HTTPException(status_code=404, detail="Auditoría no encontrada")
    
    db.delete(db_auditoria)
    db.commit()
    return {"message": "Auditoría eliminada"} 