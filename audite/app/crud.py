from sqlalchemy.orm import Session
from . import models, schemas
from datetime import datetime

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(
        email=user.email,
        nombre=user.nombre,
        empresa=user.empresa
    )
    db_user.hashed_password = user.password  # En realidad, aquí se debe hashear la contraseña
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# Funciones para Auditoría Básica
def create_auditoria_basica(db: Session, auditoria: schemas.AuditoriaBasicaCreate, user_id: int = None):
    db_auditoria = models.AuditoriaBasica(
        **auditoria.dict(),
        usuario_id=user_id
    )
    db.add(db_auditoria)
    db.commit()
    db.refresh(db_auditoria)
    return db_auditoria

def get_auditoria_basica(db: Session, auditoria_id: int):
    return db.query(models.AuditoriaBasica).filter(models.AuditoriaBasica.id == auditoria_id).first()

def get_auditorias_basicas(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.AuditoriaBasica).offset(skip).limit(limit).all()

def get_auditorias_basicas_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.AuditoriaBasica)\
        .filter(models.AuditoriaBasica.usuario_id == user_id)\
        .offset(skip)\
        .limit(limit)\
        .all()

def update_auditoria_basica(db: Session, db_auditoria: models.AuditoriaBasica, auditoria: schemas.AuditoriaBasicaCreate):
    for key, value in auditoria.dict(exclude_unset=True).items():
        setattr(db_auditoria, key, value)
    db.commit()
    db.refresh(db_auditoria)
    return db_auditoria

def delete_auditoria_basica(db: Session, auditoria_id: int):
    db_auditoria = db.query(models.AuditoriaBasica).filter(models.AuditoriaBasica.id == auditoria_id).first()
    if db_auditoria:
        db.delete(db_auditoria)
        db.commit()
    return db_auditoria

# Funciones para Recomendaciones
def create_recomendacion(db: Session, recomendacion: schemas.RecomendacionBase, auditoria_id: int, tipo_auditoria: str = 'basica'):
    """
    Crea una nueva recomendación asociada a una auditoría.
    
    Args:
        db: Sesión de la base de datos
        recomendacion: Datos de la recomendación
        auditoria_id: ID de la auditoría
        tipo_auditoria: Tipo de auditoría ('basica' o 'agro')
    """
    db_recomendacion = models.Recomendacion(
        **recomendacion.dict(),
        auditoria_basica_id=auditoria_id if tipo_auditoria == 'basica' else None,
        auditoria_agro_id=auditoria_id if tipo_auditoria == 'agro' else None
    )
    db.add(db_recomendacion)
    db.commit()
    db.refresh(db_recomendacion)
    return db_recomendacion

def get_recomendaciones_by_auditoria(db: Session, auditoria_id: int, tipo_auditoria: str = 'basica'):
    if tipo_auditoria == 'agro':
        return db.query(models.Recomendacion)\
            .filter(models.Recomendacion.auditoria_agro_id == auditoria_id)\
            .order_by(models.Recomendacion.prioridad)\
            .all()
    else:
        return db.query(models.Recomendacion)\
            .filter(models.Recomendacion.auditoria_basica_id == auditoria_id)\
            .order_by(models.Recomendacion.prioridad)\
            .all()

def delete_recomendaciones_auditoria(db: Session, auditoria_id: int, tipo_auditoria: str = 'basica'):
    if tipo_auditoria == 'agro':
        db.query(models.Recomendacion)\
            .filter(models.Recomendacion.auditoria_agro_id == auditoria_id)\
            .delete()
    else:
        db.query(models.Recomendacion)\
            .filter(models.Recomendacion.auditoria_basica_id == auditoria_id)\
            .delete()
    db.commit()

# Funciones para Auditoría Agro
def create_auditoria_agro(db: Session, auditoria: schemas.AuditoriaAgroCreate, user_id: int):
    db_auditoria = models.AuditoriaAgro(
        **auditoria.dict(),
        usuario_id=user_id
    )
    db.add(db_auditoria)
    db.commit()
    db.refresh(db_auditoria)
    return db_auditoria

def get_auditoria_agro(db: Session, auditoria_id: int):
    return db.query(models.AuditoriaAgro).filter(models.AuditoriaAgro.id == auditoria_id).first()

def get_auditorias_agro_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    """
    Obtiene las auditorías agrícolas de un usuario y calcula sus métricas.
    """
    auditorias = db.query(models.AuditoriaAgro)\
        .filter(models.AuditoriaAgro.usuario_id == user_id)\
        .offset(skip)\
        .limit(limit)\
        .all()
    
    # Calcular métricas para cada auditoría
    for auditoria in auditorias:
        auditoria.consumo_total = auditoria.calcular_consumo_total()
        auditoria.kpi_por_produccion = auditoria.calcular_kpi_produccion()
        auditoria.kpi_por_area = auditoria.calcular_kpi_area()
        auditoria.distribucion_consumo = auditoria.calcular_distribucion_consumo()
        
        # Asegurar que updated_at tenga un valor
        if not auditoria.updated_at:
            auditoria.updated_at = auditoria.created_at
        
        # Actualizar en la base de datos
        db.add(auditoria)
    
    db.commit()
    return auditorias

def update_auditoria_agro(db: Session, db_auditoria: models.AuditoriaAgro, auditoria: schemas.AuditoriaAgroUpdate):
    update_data = auditoria.dict(exclude_unset=True)
    
    # Actualizar campos básicos
    for key, value in update_data.items():
        if hasattr(db_auditoria, key):
            setattr(db_auditoria, key, value)
    
    # Actualizar timestamp
    db_auditoria.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(db_auditoria)
    return db_auditoria

def delete_auditoria_agro(db: Session, auditoria_id: int):
    # Primero eliminar las recomendaciones asociadas
    delete_recomendaciones_auditoria(db, auditoria_id)
    
    # Luego eliminar la auditoría
    db_auditoria = db.query(models.AuditoriaAgro).filter(models.AuditoriaAgro.id == auditoria_id).first()
    if db_auditoria:
        db.delete(db_auditoria)
        db.commit()
    return db_auditoria


# ========================================
# CRUD: FORMULARIOS POR INDUSTRIA
# ========================================

# CRUD para CategoriaIndustria
def get_categorias_industria(db: Session, skip: int = 0, limit: int = 100, solo_activas: bool = True):
    """Listar todas las categorías activas ordenadas por orden"""
    query = db.query(models.CategoriaIndustria)
    if solo_activas:
        query = query.filter(models.CategoriaIndustria.activa == True)
    return query.order_by(models.CategoriaIndustria.orden, models.CategoriaIndustria.nombre)\
        .offset(skip).limit(limit).all()

def get_categoria_by_id(db: Session, categoria_id: int):
    """Obtener categoría por ID"""
    return db.query(models.CategoriaIndustria)\
        .filter(models.CategoriaIndustria.id == categoria_id).first()

def create_categoria_industria(db: Session, categoria: schemas.CategoriaIndustriaCreate):
    """Crear nueva categoría de industria"""
    db_categoria = models.CategoriaIndustria(**categoria.dict())
    db.add(db_categoria)
    db.commit()
    db.refresh(db_categoria)
    return db_categoria

def update_categoria_industria(db: Session, categoria_id: int, categoria: schemas.CategoriaIndustriaUpdate):
    """Actualizar categoría existente"""
    db_categoria = get_categoria_by_id(db, categoria_id)
    if not db_categoria:
        return None
    
    update_data = categoria.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_categoria, field, value)
    
    db.commit()
    db.refresh(db_categoria)
    return db_categoria

def delete_categoria_industria(db: Session, categoria_id: int):
    """Soft delete - marcar categoría como inactiva"""
    db_categoria = get_categoria_by_id(db, categoria_id)
    if not db_categoria:
        return None
    
    db_categoria.activa = False
    db.commit()
    db.refresh(db_categoria)
    return db_categoria


# CRUD para FormularioIndustria
def get_formularios_by_categoria(db: Session, categoria_id: int, skip: int = 0, limit: int = 100, solo_activos: bool = True):
    """Obtener formularios por categoría"""
    query = db.query(models.FormularioIndustria)\
        .filter(models.FormularioIndustria.categoria_id == categoria_id)
    if solo_activos:
        query = query.filter(models.FormularioIndustria.activo == True)
    return query.order_by(models.FormularioIndustria.orden, models.FormularioIndustria.nombre)\
        .offset(skip).limit(limit).all()

def get_formulario_by_id(db: Session, formulario_id: int, incluir_preguntas: bool = False):
    """Obtener formulario por ID con preguntas incluidas opcionalmente"""
    formulario = db.query(models.FormularioIndustria)\
        .filter(models.FormularioIndustria.id == formulario_id).first()
    
    if formulario and incluir_preguntas:
        # Cargar preguntas activas ordenadas
        formulario.preguntas = db.query(models.PreguntaFormulario)\
            .filter(models.PreguntaFormulario.formulario_id == formulario_id,
                   models.PreguntaFormulario.activa == True)\
            .order_by(models.PreguntaFormulario.orden).all()
    
    return formulario

def create_formulario_industria(db: Session, formulario: schemas.FormularioIndustriaCreate):
    """Crear nuevo formulario de industria"""
    db_formulario = models.FormularioIndustria(**formulario.dict())
    db.add(db_formulario)
    db.commit()
    db.refresh(db_formulario)
    return db_formulario

def update_formulario_industria(db: Session, formulario_id: int, formulario: schemas.FormularioIndustriaUpdate):
    """Actualizar formulario existente"""
    db_formulario = get_formulario_by_id(db, formulario_id)
    if not db_formulario:
        return None
    
    update_data = formulario.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_formulario, field, value)
    
    db.commit()
    db.refresh(db_formulario)
    return db_formulario

def delete_formulario_industria(db: Session, formulario_id: int):
    """Soft delete - marcar formulario como inactivo"""
    db_formulario = get_formulario_by_id(db, formulario_id)
    if not db_formulario:
        return None
    
    db_formulario.activo = False
    db.commit()
    db.refresh(db_formulario)
    return db_formulario


# CRUD para PreguntaFormulario
def get_preguntas_by_formulario(db: Session, formulario_id: int, solo_activas: bool = True):
    """Obtener preguntas por formulario ordenadas"""
    query = db.query(models.PreguntaFormulario)\
        .filter(models.PreguntaFormulario.formulario_id == formulario_id)
    if solo_activas:
        query = query.filter(models.PreguntaFormulario.activa == True)
    return query.order_by(models.PreguntaFormulario.orden).all()

def get_pregunta_by_id(db: Session, pregunta_id: int):
    """Obtener pregunta individual por ID"""
    return db.query(models.PreguntaFormulario)\
        .filter(models.PreguntaFormulario.id == pregunta_id).first()

def create_pregunta_formulario(db: Session, pregunta: schemas.PreguntaFormularioCreate):
    """Crear nueva pregunta de formulario"""
    db_pregunta = models.PreguntaFormulario(**pregunta.dict())
    db.add(db_pregunta)
    db.commit()
    db.refresh(db_pregunta)
    return db_pregunta

def update_pregunta_formulario(db: Session, pregunta_id: int, pregunta: schemas.PreguntaFormularioUpdate):
    """Actualizar pregunta existente"""
    db_pregunta = get_pregunta_by_id(db, pregunta_id)
    if not db_pregunta:
        return None
    
    update_data = pregunta.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_pregunta, field, value)
    
    db.commit()
    db.refresh(db_pregunta)
    return db_pregunta

def delete_pregunta_formulario(db: Session, pregunta_id: int):
    """Soft delete - marcar pregunta como inactiva"""
    db_pregunta = get_pregunta_by_id(db, pregunta_id)
    if not db_pregunta:
        return None
    
    db_pregunta.activa = False
    db.commit()
    db.refresh(db_pregunta)
    return db_pregunta

def get_preguntas_condicionales(db: Session, formulario_id: int, solo_activas: bool = True):
    """Obtener preguntas con información de lógica condicional"""
    preguntas = get_preguntas_by_formulario(db, formulario_id, solo_activas=solo_activas)
    
    # Enriquecer con información condicional
    preguntas_con_info = []
    for pregunta in preguntas:
        pregunta_info = {
            "pregunta": pregunta,
            "es_condicional": pregunta.pregunta_padre_id is not None,
            "pregunta_padre": None,
            "preguntas_hijas": []
        }
        
        # Obtener información de pregunta padre si existe
        if pregunta.pregunta_padre_id:
            pregunta_info["pregunta_padre"] = get_pregunta_by_id(db, pregunta.pregunta_padre_id)
        
        # Obtener preguntas hijas que dependen de esta
        hijas = db.query(models.PreguntaFormulario)\
            .filter(models.PreguntaFormulario.pregunta_padre_id == pregunta.id,
                   models.PreguntaFormulario.activa == True)\
            .order_by(models.PreguntaFormulario.orden).all()
        pregunta_info["preguntas_hijas"] = hijas
        
        preguntas_con_info.append(pregunta_info)
    
    return preguntas_con_info


# CRUD para RespuestaFormulario
def save_respuesta_formulario(db: Session, respuesta: schemas.RespuestaFormularioCreate):
    """Guardar respuesta individual"""
    db_respuesta = models.RespuestaFormulario(**respuesta.dict())
    db.add(db_respuesta)
    db.commit()
    db.refresh(db_respuesta)
    return db_respuesta

def save_respuestas_batch(db: Session, session_id: str, respuestas: list[schemas.RespuestaFormularioCreate]):
    """Guardar múltiples respuestas en lote"""
    db_respuestas = []
    
    for respuesta_data in respuestas:
        # Asegurar que todas tengan el mismo session_id
        respuesta_dict = respuesta_data.dict()
        respuesta_dict["session_id"] = session_id
        
        db_respuesta = models.RespuestaFormulario(**respuesta_dict)
        db.add(db_respuesta)
        db_respuestas.append(db_respuesta)
    
    db.commit()
    
    # Refresh todas las respuestas
    for db_respuesta in db_respuestas:
        db.refresh(db_respuesta)
    
    return db_respuestas

def get_respuestas_by_session(db: Session, session_id: str):
    """Obtener todas las respuestas por sesión"""
    return db.query(models.RespuestaFormulario)\
        .filter(models.RespuestaFormulario.session_id == session_id)\
        .order_by(models.RespuestaFormulario.created_at).all()

def get_estadisticas_formulario(db: Session, formulario_id: int):
    """Obtener métricas y estadísticas de un formulario"""
    # Obtener todas las respuestas del formulario
    respuestas = db.query(models.RespuestaFormulario)\
        .join(models.PreguntaFormulario)\
        .filter(models.PreguntaFormulario.formulario_id == formulario_id).all()
    
    # Calcular estadísticas básicas
    total_respuestas = len(respuestas)
    sesiones_unicas = len(set([r.session_id for r in respuestas]))
    
    # Estadísticas por pregunta
    preguntas = get_preguntas_by_formulario(db, formulario_id)
    estadisticas_preguntas = {}
    
    for pregunta in preguntas:
        respuestas_pregunta = [r for r in respuestas if r.pregunta_id == pregunta.id]
        estadisticas_preguntas[pregunta.id] = {
            "pregunta_texto": pregunta.texto,
            "total_respuestas": len(respuestas_pregunta),
            "porcentaje_respuesta": (len(respuestas_pregunta) / sesiones_unicas * 100) if sesiones_unicas > 0 else 0,
            "tiene_opcion_otro": pregunta.tiene_opcion_otro,
            "respuestas_otro": len([r for r in respuestas_pregunta if r.valor_otro])
        }
    
    return {
        "formulario_id": formulario_id,
        "total_respuestas": total_respuestas,
        "sesiones_unicas": sesiones_unicas,
        "promedio_respuestas_por_sesion": total_respuestas / sesiones_unicas if sesiones_unicas > 0 else 0,
        "estadisticas_por_pregunta": estadisticas_preguntas
    } 