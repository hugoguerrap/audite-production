from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from .. import models, schemas
from ..database import get_db
import uuid
import random
import string
import math
from datetime import datetime, timezone
import logging
from sqlalchemy.sql import func

# Configurar logging
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/diagnosticos-feria",
    tags=["Diagnóstico Feria"],
    responses={404: {"description": "Not found"}},
)

# Benchmark de consumo por tipo de producto
BENCHMARKS = {
    "frutas": {"consumo": 450, "eficiencia": 0.8},
    "hortalizas": {"consumo": 380, "eficiencia": 0.75},
    "cereales": {"consumo": 320, "eficiencia": 0.7},
    "lacteos": {"consumo": 520, "eficiencia": 0.85},
    "carnes": {"consumo": 780, "eficiencia": 0.8},
    "vino": {"consumo": 650, "eficiencia": 0.75},
    "default": {"consumo": 500, "eficiencia": 0.75}
}

# Plantillas de recomendaciones por categoría
RECOMENDACIONES_TEMPLATES = {
    "equipos": [
        {
            "categoria": "equipos",
            "titulo": "Actualización de sistemas de refrigeración",
            "descripcion": "Reemplazar equipos de refrigeración antiguos por modelos eficientes con tecnología inverter puede reducir el consumo hasta un 40%.",
            "ahorroEstimado": 0.25,  # 25%
            "costoImplementacion": "alto",
            "periodoRetorno": 24,
            "prioridad": 4
        },
        {
            "categoria": "equipos",
            "titulo": "Mantenimiento preventivo de equipos críticos",
            "descripcion": "Implementar un programa de mantenimiento preventivo para equipos con alto consumo energético para optimizar su eficiencia.",
            "ahorroEstimado": 0.12,  # 12%
            "costoImplementacion": "bajo",
            "periodoRetorno": 6,
            "prioridad": 5
        }
    ],
    "gestion": [
        {
            "categoria": "gestion",
            "titulo": "Sistema de monitoreo energético",
            "descripcion": "Implementar un sistema de monitoreo energético en tiempo real para identificar consumos anómalos y oportunidades de ahorro.",
            "ahorroEstimado": 0.15,  # 15%
            "costoImplementacion": "medio",
            "periodoRetorno": 12,
            "prioridad": 4
        },
        {
            "categoria": "gestion",
            "titulo": "Capacitación del personal en eficiencia energética",
            "descripcion": "Programa de capacitación para operadores y personal sobre buenas prácticas de uso energético y optimización de procesos.",
            "ahorroEstimado": 0.08,  # 8%
            "costoImplementacion": "bajo",
            "periodoRetorno": 3,
            "prioridad": 5
        }
    ],
    "renovables": [
        {
            "categoria": "renovables",
            "titulo": "Instalación de sistema fotovoltaico",
            "descripcion": "Implementar un sistema solar fotovoltaico para autoconsumo que cubra parcialmente la demanda energética.",
            "ahorroEstimado": 0.30,  # 30%
            "costoImplementacion": "alto",
            "periodoRetorno": 48,
            "prioridad": 3
        },
        {
            "categoria": "renovables",
            "titulo": "Calentamiento solar de agua para procesos",
            "descripcion": "Sistema de colectores solares térmicos para precalentar agua en procesos industriales.",
            "ahorroEstimado": 0.20,  # 20%
            "costoImplementacion": "medio",
            "periodoRetorno": 24,
            "prioridad": 4
        }
    ],
    "iluminacion": [
        {
            "categoria": "iluminacion",
            "titulo": "Reemplazo por iluminación LED",
            "descripcion": "Sustituir sistemas de iluminación convencionales por tecnología LED de alta eficiencia.",
            "ahorroEstimado": 0.70,  # 70% del consumo en iluminación
            "costoImplementacion": "bajo",
            "periodoRetorno": 8,
            "prioridad": 5
        }
    ],
    "factor_potencia": [
        {
            "categoria": "factor_potencia",
            "titulo": "Corrección de factor de potencia",
            "descripcion": "Instalar banco de capacitores para corregir el factor de potencia y eliminar las multas por este concepto.",
            "ahorroEstimado": 1.0,  # 100% de las multas
            "costoImplementacion": "medio",
            "periodoRetorno": 12,
            "prioridad": 5
        }
    ]
}

def generar_codigo_acceso():
    """Genera un código de acceso aleatorio de 8 caracteres alfanuméricos"""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))

def calcular_intensidad_energetica(consumo: float, produccion: float) -> float:
    """Calcula la intensidad energética: kWh/unidad producida"""
    return consumo / produccion if produccion > 0 else 0

def calcular_costo_energia_anual(consumo: float, costo_electricidad: float, costo_combustible: float) -> float:
    """Calcula el costo energético anual total"""
    costo_electricidad_anual = consumo * costo_electricidad
    costo_combustible_estimado = (consumo * 0.3) * costo_combustible  # Estimación simplificada
    return costo_electricidad_anual + costo_combustible_estimado

def calcular_potencial_ahorro(equipo_intensivo: str, tiene_multas: bool, costo_total: float) -> float:
    """Calcula el potencial de ahorro basado en las características del consumo"""
    potencial_ahorro_base = 0.15  # 15% ahorro base
    
    # Modificadores basados en equipos intensivos
    if equipo_intensivo == "Sistemas de refrigeración":
        potencial_ahorro_base += 0.05
    elif equipo_intensivo == "Sistemas de iluminación":
        potencial_ahorro_base += 0.08
    elif equipo_intensivo == "Bombas de agua":
        potencial_ahorro_base += 0.12
    
    # Modificadores por mantenimiento y multas
    if tiene_multas:
        potencial_ahorro_base += 0.07
    
    return costo_total * potencial_ahorro_base

def calcular_puntuacion_eficiencia(interes_renovables: bool, auditorias_previas: bool, 
                                 tiene_multas: bool, num_multas: int, porcentaje_costo: float) -> float:
    """Calcula una puntuación de eficiencia energética (0-100)"""
    # Base inicial
    puntuacion_base = 50
    
    # Factores de ajuste
    if interes_renovables:
        puntuacion_base += 5
    if auditorias_previas:
        puntuacion_base += 10
    if tiene_multas:
        puntuacion_base -= (5 * min(num_multas or 1, 5))
    if porcentaje_costo > 30:
        puntuacion_base -= 15
    if porcentaje_costo < 10:
        puntuacion_base += 10
    
    # Normalización
    return max(0, min(100, puntuacion_base))

def calcular_comparacion_sector(tipo_producto: str, consumo: float, produccion: float) -> Dict[str, float]:
    """Calcula la comparación con los benchmarks del sector"""
    # Obtener benchmark para el tipo de producto
    tipo_benchmark = tipo_producto
    if tipo_producto.startswith("otro:"):
        tipo_benchmark = "default"
    
    benchmark = BENCHMARKS.get(tipo_benchmark, BENCHMARKS["default"])
    
    # Calcular intensidad energética actual
    intensidad_actual = calcular_intensidad_energetica(consumo, produccion)
    
    # Calcular diferencia porcentual con el sector
    diferencia_porcentual = ((intensidad_actual - benchmark["consumo"]) / benchmark["consumo"]) * 100
    
    return {
        "consumoPromedioSector": benchmark["consumo"],
        "diferenciaPorcentual": diferencia_porcentual,
        "eficienciaReferencia": benchmark["eficiencia"]
    }

def generar_recomendaciones(datos: schemas.DiagnosticoFeriaCreate, 
                           potencial_ahorro: float, 
                           costo_anual: float) -> List[Dict[str, Any]]:
    """Genera recomendaciones personalizadas basadas en los datos del diagnóstico"""
    recomendaciones = []
    categorias_usadas = set()
    
    # Recomendaciones basadas en interés en renovables
    if datos.renewable.interestedInRenewable:
        for recomendacion in RECOMENDACIONES_TEMPLATES["renovables"]:
            rec_copy = recomendacion.copy()
            rec_copy["id"] = str(uuid.uuid4())
            rec_copy["ahorroEstimado"] = costo_anual * rec_copy["ahorroEstimado"]
            recomendaciones.append(rec_copy)
            categorias_usadas.add("renovables")
    
    # Recomendaciones por factor de potencia
    if datos.renewable.penaltiesReceived:
        for recomendacion in RECOMENDACIONES_TEMPLATES["factor_potencia"]:
            rec_copy = recomendacion.copy()
            rec_copy["id"] = str(uuid.uuid4())
            # Estimar el costo de multas como 5% del costo energético
            costo_multas = costo_anual * 0.05 * (datos.renewable.penaltyCount or 1)
            rec_copy["ahorroEstimado"] = costo_multas
            recomendaciones.append(rec_copy)
            categorias_usadas.add("factor_potencia")
    
    # Recomendaciones por tipo de equipo intensivo
    if datos.equipment.mostIntensiveEquipment == "Sistemas de iluminación":
        for recomendacion in RECOMENDACIONES_TEMPLATES["iluminacion"]:
            rec_copy = recomendacion.copy()
            rec_copy["id"] = str(uuid.uuid4())
            # Estimamos que iluminación es 15% del consumo
            costo_iluminacion = costo_anual * 0.15
            rec_copy["ahorroEstimado"] = costo_iluminacion * rec_copy["ahorroEstimado"]
            recomendaciones.append(rec_copy)
            categorias_usadas.add("iluminacion")
    
    # Siempre incluir al menos una recomendación de equipos
    if "equipos" not in categorias_usadas and len(recomendaciones) < 5:
        recomendacion = RECOMENDACIONES_TEMPLATES["equipos"][0].copy()
        recomendacion["id"] = str(uuid.uuid4())
        recomendacion["ahorroEstimado"] = costo_anual * recomendacion["ahorroEstimado"]
        recomendaciones.append(recomendacion)
    
    # Siempre incluir al menos una recomendación de gestión
    if "gestion" not in categorias_usadas and len(recomendaciones) < 5:
        recomendacion = RECOMENDACIONES_TEMPLATES["gestion"][0].copy()
        recomendacion["id"] = str(uuid.uuid4())
        recomendacion["ahorroEstimado"] = costo_anual * recomendacion["ahorroEstimado"]
        recomendaciones.append(recomendacion)
    
    # Asegurarse de tener al menos 3 recomendaciones
    while len(recomendaciones) < 3:
        # Añadir recomendaciones adicionales de categorías no usadas
        for categoria, templates in RECOMENDACIONES_TEMPLATES.items():
            if categoria not in categorias_usadas and templates:
                recomendacion = templates[0].copy()
                recomendacion["id"] = str(uuid.uuid4())
                recomendacion["ahorroEstimado"] = costo_anual * recomendacion["ahorroEstimado"]
                recomendaciones.append(recomendacion)
                categorias_usadas.add(categoria)
                break
        else:
            # Si ya hemos usado todas las categorías, terminamos el bucle
            break
    
    return recomendaciones

@router.post("/", response_model=schemas.DiagnosticoFeriaResponse)
async def crear_diagnostico_feria(
    diagnostico: schemas.DiagnosticoFeriaCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Crea un diagnóstico energético para ferias.
    No requiere autenticación.
    """
    try:
        # Calcular métricas
        intensidad_energetica = calcular_intensidad_energetica(
            diagnostico.equipment.energyConsumption, 
            diagnostico.volume.annualProduction
        )
        
        costo_energia_anual = calcular_costo_energia_anual(
            diagnostico.equipment.energyConsumption,
            diagnostico.volume.energyCosts.electricity,
            diagnostico.volume.energyCosts.fuel
        )
        
        potencial_ahorro = calcular_potencial_ahorro(
            diagnostico.equipment.mostIntensiveEquipment,
            diagnostico.renewable.penaltiesReceived,
            costo_energia_anual
        )
        
        puntuacion_eficiencia = calcular_puntuacion_eficiencia(
            diagnostico.renewable.interestedInRenewable,
            diagnostico.background.hasPreviousAudits,
            diagnostico.renewable.penaltiesReceived,
            diagnostico.renewable.penaltyCount,
            diagnostico.volume.energyCostPercentage
        )
        
        comparacion_sector = calcular_comparacion_sector(
            diagnostico.production.productType,
            diagnostico.equipment.energyConsumption,
            diagnostico.volume.annualProduction
        )
        
        # Generar recomendaciones
        recomendaciones = generar_recomendaciones(
            diagnostico,
            potencial_ahorro,
            costo_energia_anual
        )
        
        # Crear registro en DB
        diagnostico_id = str(uuid.uuid4())
        access_code = generar_codigo_acceso()
        
        nuevo_diagnostico = models.DiagnosticoFeria(
            id=diagnostico_id,
            access_code=access_code,
            contact_info=diagnostico.contactInfo.dict(),
            background=diagnostico.background.dict(),
            production=diagnostico.production.dict(),
            equipment=diagnostico.equipment.dict(),
            renewable=diagnostico.renewable.dict(),
            volume=diagnostico.volume.dict(),
            meta_data=diagnostico.metadata.dict(),
            intensidad_energetica=intensidad_energetica,
            costo_energia_anual=costo_energia_anual,
            potencial_ahorro=potencial_ahorro,
            puntuacion_eficiencia=puntuacion_eficiencia,
            comparacion_sector=comparacion_sector,
            recomendaciones=recomendaciones,
            view_url=f"/diagnósticos/{diagnostico_id}"
        )
        
        db.add(nuevo_diagnostico)
        db.commit()
        db.refresh(nuevo_diagnostico)
        
        # Preparar respuesta
        resultados = {
            "intensidadEnergetica": intensidad_energetica,
            "costoEnergiaAnual": costo_energia_anual,
            "potencialAhorro": potencial_ahorro,
            "puntuacionEficiencia": puntuacion_eficiencia,
            "comparacionSector": comparacion_sector
        }
        
        return {
            "id": diagnostico_id,
            "createdAt": datetime.now().isoformat(),
            "accessCode": access_code,
            "contactInfo": diagnostico.contactInfo,
            "background": diagnostico.background,
            "production": diagnostico.production,
            "equipment": diagnostico.equipment,
            "renewable": diagnostico.renewable,
            "volume": diagnostico.volume,
            "results": resultados,
            "recomendaciones": recomendaciones,
            "viewUrl": f"/diagnósticos/{diagnostico_id}"
        }
        
    except Exception as e:
        logger.error(f"Error al crear diagnóstico: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al procesar el diagnóstico: {str(e)}")

@router.get("/{diagnostico_id}", response_model=schemas.DiagnosticoFeriaResponse)
async def obtener_diagnostico_feria(diagnostico_id: str, db: Session = Depends(get_db)):
    """
    Obtiene un diagnóstico específico por su ID.
    No requiere autenticación.
    """
    diagnostico = db.query(models.DiagnosticoFeria).filter(models.DiagnosticoFeria.id == diagnostico_id).first()
    
    if not diagnostico:
        raise HTTPException(status_code=404, detail="Diagnóstico no encontrado")
    
    # Convertir datos almacenados al formato de respuesta
    resultados = {
        "intensidadEnergetica": diagnostico.intensidad_energetica,
        "costoEnergiaAnual": diagnostico.costo_energia_anual,
        "potencialAhorro": diagnostico.potencial_ahorro,
        "puntuacionEficiencia": diagnostico.puntuacion_eficiencia,
        "comparacionSector": diagnostico.comparacion_sector
    }
    
    return {
        "id": diagnostico.id,
        "createdAt": diagnostico.created_at.isoformat(),
        "accessCode": diagnostico.access_code,
        "contactInfo": diagnostico.contact_info,
        "background": diagnostico.background,
        "production": diagnostico.production,
        "equipment": diagnostico.equipment,
        "renewable": diagnostico.renewable,
        "volume": diagnostico.volume,
        "results": resultados,
        "recomendaciones": diagnostico.recomendaciones,
        "pdfUrl": diagnostico.pdf_url,
        "viewUrl": diagnostico.view_url
    }

@router.get("/codigo/{access_code}", response_model=schemas.DiagnosticoFeriaResponse)
async def obtener_diagnostico_por_codigo(access_code: str, db: Session = Depends(get_db)):
    """
    Obtiene un diagnóstico específico por su código de acceso.
    No requiere autenticación.
    """
    diagnostico = db.query(models.DiagnosticoFeria).filter(models.DiagnosticoFeria.access_code == access_code).first()
    
    if not diagnostico:
        raise HTTPException(status_code=404, detail="Diagnóstico no encontrado")
    
    # Inicializar campos faltantes con valores por defecto si están en estado CONTACTO_INICIADO
    if diagnostico.estado == 'CONTACTO_INICIADO':
        # Proporcionar valores predeterminados para los campos requeridos
        default_background = {"hasPreviousAudits": False, "mainInterest": ""}
        default_production = {"productType": "", "exportProducts": False, "processesOfInterest": []}
        default_equipment = {"mostIntensiveEquipment": "", "energyConsumption": 0.0}
        default_renewable = {"interestedInRenewable": False, "electricTariff": "", "penaltiesReceived": False}
        default_volume = {"annualProduction": 0.0, "productionUnit": "", "energyCosts": {"electricity": 0.0, "fuel": 0.0}, "energyCostPercentage": 0.0}
        default_results = {
            "intensidadEnergetica": 0.0,
            "costoEnergiaAnual": 0.0,
            "potencialAhorro": 0.0,
            "puntuacionEficiencia": 0.0,
            "comparacionSector": {
                "consumoPromedioSector": 0.0,
                "diferenciaPorcentual": 0.0,
                "eficienciaReferencia": 0.0
            }
        }
        
        # Asignar valores por defecto si son None
        background = diagnostico.background or default_background
        production = diagnostico.production or default_production
        equipment = diagnostico.equipment or default_equipment
        renewable = diagnostico.renewable or default_renewable
        volume = diagnostico.volume or default_volume
        resultados = default_results
        recomendaciones = diagnostico.recomendaciones or []
    else:
        # Para diagnósticos completos, usar los datos existentes
        background = diagnostico.background
        production = diagnostico.production
        equipment = diagnostico.equipment
        renewable = diagnostico.renewable
        volume = diagnostico.volume
        
        # Convertir datos almacenados al formato de respuesta
        resultados = {
            "intensidadEnergetica": diagnostico.intensidad_energetica,
            "costoEnergiaAnual": diagnostico.costo_energia_anual,
            "potencialAhorro": diagnostico.potencial_ahorro,
            "puntuacionEficiencia": diagnostico.puntuacion_eficiencia,
            "comparacionSector": diagnostico.comparacion_sector
        }
        recomendaciones = diagnostico.recomendaciones
    
    return {
        "id": diagnostico.id,
        "createdAt": diagnostico.created_at.isoformat(),
        "accessCode": diagnostico.access_code,
        "contactInfo": diagnostico.contact_info,
        "background": background,
        "production": production,
        "equipment": equipment,
        "renewable": renewable,
        "volume": volume,
        "results": resultados,
        "recomendaciones": recomendaciones or [], # Asegurar que nunca sea None
        "pdfUrl": diagnostico.pdf_url,
        "viewUrl": diagnostico.view_url
    }

@router.post("/iniciar-contacto/", response_model=schemas.DiagnosticoFeriaIniciarContactoResponse, summary="Iniciar Diagnóstico - Captura de Contacto")
async def iniciar_diagnostico_feria_contacto(
    contact_data: schemas.ContactInfo,
    db: Session = Depends(get_db)
):
    """
    Crea una entrada inicial para un diagnóstico de feria, capturando solo la información de contacto.
    Devuelve un ID y un código de acceso para completar el diagnóstico posteriormente.
    """
    try:
        diagnostico_id = str(uuid.uuid4())
        access_code = generar_codigo_acceso()
        view_url_inicial = f"/diagnosticos/{diagnostico_id}"

        nuevo_diagnostico_parcial = models.DiagnosticoFeria(
            id=diagnostico_id,
            access_code=access_code,
            contact_info=contact_data.dict(),
            estado='CONTACTO_INICIADO',
            view_url=view_url_inicial,
        )
        
        db.add(nuevo_diagnostico_parcial)
        db.commit()
        db.refresh(nuevo_diagnostico_parcial)
        
        return schemas.DiagnosticoFeriaIniciarContactoResponse(
            id=nuevo_diagnostico_parcial.id,
            accessCode=nuevo_diagnostico_parcial.access_code
        )
    except Exception as e:
        logger.error(f"Error al iniciar contacto para diagnóstico: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error interno al iniciar contacto: {str(e)}")

@router.put("/{access_code}/completar/", response_model=schemas.DiagnosticoFeriaResponse, summary="Completar Diagnóstico de Feria")
async def completar_diagnostico_feria(
    access_code: str,
    datos_completar: schemas.DiagnosticoFeriaCompletarRequest,
    db: Session = Depends(get_db)
):
    """
    Completa un diagnóstico de feria existente (identificado por access_code) 
    con los datos detallados, calcula resultados y genera recomendaciones.
    """
    diagnostico_existente = db.query(models.DiagnosticoFeria).filter(models.DiagnosticoFeria.access_code == access_code).first()
    
    if not diagnostico_existente:
        raise HTTPException(status_code=404, detail="Diagnóstico con este código de acceso no encontrado.")

    if diagnostico_existente.estado == 'DIAGNOSTICO_COMPLETO':
        logger.info(f"Diagnóstico {access_code} ya estaba completo, se procederá a actualizar y recalcular.")

    try:
        diagnostico_existente.background = datos_completar.background.dict()
        diagnostico_existente.production = datos_completar.production.dict()
        diagnostico_existente.equipment = datos_completar.equipment.dict()
        diagnostico_existente.renewable = datos_completar.renewable.dict()
        diagnostico_existente.volume = datos_completar.volume.dict()
        diagnostico_existente.meta_data = datos_completar.metadata.dict()

        current_equipment_data = datos_completar.equipment
        current_volume_data = datos_completar.volume
        current_production_data = datos_completar.production
        current_renewable_data = datos_completar.renewable
        current_background_data = datos_completar.background

        intensidad_energetica = calcular_intensidad_energetica(
            current_equipment_data.energyConsumption, 
            current_volume_data.annualProduction
        )
        costo_energia_anual = calcular_costo_energia_anual(
            current_equipment_data.energyConsumption,
            current_volume_data.energyCosts.electricity,
            current_volume_data.energyCosts.fuel
        )
        potencial_ahorro = calcular_potencial_ahorro(
            current_equipment_data.mostIntensiveEquipment,
            current_renewable_data.penaltiesReceived,
            costo_energia_anual
        )
        puntuacion_eficiencia = calcular_puntuacion_eficiencia(
            current_renewable_data.interestedInRenewable,
            current_background_data.hasPreviousAudits,
            current_renewable_data.penaltiesReceived,
            current_renewable_data.penaltyCount,
            current_volume_data.energyCostPercentage
        )
        comparacion_sector = calcular_comparacion_sector(
            current_production_data.productType,
            current_equipment_data.energyConsumption,
            current_volume_data.annualProduction
        )
        
        datos_para_recomendaciones_dict = {
            "contactInfo": diagnostico_existente.contact_info,
            "background": datos_completar.background.dict(),
            "production": datos_completar.production.dict(),
            "equipment": datos_completar.equipment.dict(),
            "renewable": datos_completar.renewable.dict(),
            "volume": datos_completar.volume.dict(),
            "metadata": datos_completar.metadata.dict()
        }
        
        temp_datos_completos_para_recom = schemas.DiagnosticoFeriaCreate(
             contactInfo=schemas.ContactInfo(**diagnostico_existente.contact_info),
             background=datos_completar.background,
             production=datos_completar.production,
             equipment=datos_completar.equipment,
             renewable=datos_completar.renewable,
             volume=datos_completar.volume,
             metadata=datos_completar.metadata
        )
        recomendaciones = generar_recomendaciones(
             temp_datos_completos_para_recom,
             potencial_ahorro,
             costo_energia_anual
        )
        diagnostico_existente.recomendaciones = recomendaciones

        diagnostico_existente.intensidad_energetica = intensidad_energetica
        diagnostico_existente.costo_energia_anual = costo_energia_anual
        diagnostico_existente.potencial_ahorro = potencial_ahorro
        diagnostico_existente.puntuacion_eficiencia = puntuacion_eficiencia
        diagnostico_existente.comparacion_sector = comparacion_sector
        
        diagnostico_existente.estado = 'DIAGNOSTICO_COMPLETO'
        diagnostico_existente.updated_at = func.now()
        
        db.add(diagnostico_existente)
        db.commit()
        db.refresh(diagnostico_existente)
        
        response_results = {
            "intensidadEnergetica": diagnostico_existente.intensidad_energetica,
            "costoEnergiaAnual": diagnostico_existente.costo_energia_anual,
            "potencialAhorro": diagnostico_existente.potencial_ahorro,
            "puntuacionEficiencia": diagnostico_existente.puntuacion_eficiencia,
            "comparacionSector": diagnostico_existente.comparacion_sector
        }

        return schemas.DiagnosticoFeriaResponse(
            id=diagnostico_existente.id,
            createdAt=diagnostico_existente.created_at.isoformat(),
            accessCode=diagnostico_existente.access_code,
            contactInfo=diagnostico_existente.contact_info,
            background=diagnostico_existente.background,
            production=diagnostico_existente.production,
            equipment=diagnostico_existente.equipment,
            renewable=diagnostico_existente.renewable,
            volume=diagnostico_existente.volume,
            results=response_results,
            recomendaciones=diagnostico_existente.recomendaciones,
            pdfUrl=diagnostico_existente.pdf_url,
            viewUrl=diagnostico_existente.view_url
        )

    except Exception as e:
        logger.error(f"Error al completar diagnóstico {access_code}: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error interno al completar el diagnóstico: {str(e)}") 