"""
Módulo generador de sugerencias personalizadas por industria.
Genera recomendaciones específicas basadas en las respuestas del usuario
y la categoría de industria del formulario.
"""

from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
import json
from datetime import datetime


def generar_sugerencias_industria(categoria_id: int, respuestas: Dict[int, Any], 
                                 db: Session, formulario_id: Optional[int] = None) -> List[Dict[str, Any]]:
    """
    Genera sugerencias personalizadas basadas en la industria y respuestas del usuario.
    
    Args:
        categoria_id: ID de la categoría de industria
        respuestas: Dict con las respuestas del usuario
        db: Sesión de base de datos
        formulario_id: ID del formulario (opcional para contexto adicional)
        
    Returns:
        List[Dict]: Lista de sugerencias personalizadas
    """
    # Obtener información de la categoría
    from ..crud import get_categoria_by_id
    categoria = get_categoria_by_id(db, categoria_id)
    
    if not categoria:
        return _generar_sugerencias_genericas(respuestas)
    
    # Generar sugerencias según la industria
    if categoria.nombre.lower() == "industrial":
        return _generar_sugerencias_industrial(respuestas, db)
    elif categoria.nombre.lower() == "agropecuario" or categoria.nombre.lower() == "agro":
        return _generar_sugerencias_agropecuario(respuestas, db)
    elif categoria.nombre.lower() == "comercial":
        return _generar_sugerencias_comercial(respuestas, db)
    elif categoria.nombre.lower() == "servicios":
        return _generar_sugerencias_servicios(respuestas, db)
    else:
        return _generar_sugerencias_genericas(respuestas)


def _generar_sugerencias_industrial(respuestas: Dict[int, Any], db: Session) -> List[Dict[str, Any]]:
    """Genera sugerencias específicas para sector industrial."""
    sugerencias = []
    
    # Analizar respuestas clave para industria
    tiene_maquinaria_pesada = _evaluar_respuesta_clave(respuestas, ["maquinaria pesada", "equipos industriales", "si"])
    consumo_alto = _evaluar_respuesta_numerica(respuestas, "consumo", threshold=1000)
    usa_renovables = _evaluar_respuesta_clave(respuestas, ["solar", "eólica", "renovable", "si"])
    
    # Sugerencias para maquinaria pesada
    if tiene_maquinaria_pesada:
        sugerencias.append({
            "id": "industrial_01",
            "categoria": "Optimización de Maquinaria",
            "titulo": "Optimización de Equipos Industriales",
            "descripcion": "Sus equipos industriales pueden beneficiarse de programas de mantenimiento preventivo y modernización para mejorar la eficiencia energética.",
            "beneficio_estimado": "15-25% de ahorro energético",
            "prioridad": "alta",
            "acciones": [
                "Implementar mantenimiento predictivo con sensores IoT",
                "Actualizar motores a tecnología de alta eficiencia",
                "Instalar variadores de frecuencia",
                "Programar operación en horarios de tarifa reducida"
            ],
            "inversion_estimada": "Media-Alta",
            "tiempo_implementacion": "3-6 meses"
        })
    
    # Sugerencias para alto consumo
    if consumo_alto:
        sugerencias.append({
            "id": "industrial_02",
            "categoria": "Gestión Energética",
            "titulo": "Sistema de Gestión Energética ISO 50001",
            "descripcion": "Su alto consumo energético justifica implementar un sistema de gestión energética certificado para identificar y controlar oportunidades de ahorro.",
            "beneficio_estimado": "10-20% de ahorro energético",
            "prioridad": "alta",
            "acciones": [
                "Instalar sistema de monitoreo energético en tiempo real",
                "Capacitar equipo en gestión energética",
                "Establecer indicadores de desempeño energético",
                "Crear comité de energía interno"
            ],
            "inversion_estimada": "Media",
            "tiempo_implementacion": "4-8 meses"
        })
    
    # Sugerencias para energías renovables
    if not usa_renovables:
        sugerencias.append({
            "id": "industrial_03",
            "categoria": "Energías Renovables",
            "titulo": "Instalación de Sistema Solar Industrial",
            "descripcion": "La instalación de paneles solares puede reducir significativamente los costos energéticos industriales con rápido retorno de inversión.",
            "beneficio_estimado": "20-40% reducción en factura eléctrica",
            "prioridad": "media",
            "acciones": [
                "Estudio de factibilidad técnica y económica",
                "Dimensionamiento según perfil de consumo",
                "Tramitar permisos y conexión a red",
                "Instalar sistema de monitoreo de generación"
            ],
            "inversion_estimada": "Alta",
            "tiempo_implementacion": "6-12 meses"
        })
    
    return sugerencias


def _generar_sugerencias_agropecuario(respuestas: Dict[int, Any], db: Session) -> List[Dict[str, Any]]:
    """Genera sugerencias específicas para sector agropecuario."""
    sugerencias = []
    
    tiene_riego = _evaluar_respuesta_clave(respuestas, ["riego", "irrigación", "si"])
    tiene_refrigeracion = _evaluar_respuesta_clave(respuestas, ["refrigeración", "cámara fría", "si"])
    usa_bombas = _evaluar_respuesta_clave(respuestas, ["bombas", "bombeo", "si"])
    
    # Sugerencias para sistemas de riego
    if tiene_riego:
        sugerencias.append({
            "id": "agro_01",
            "categoria": "Sistemas de Riego",
            "titulo": "Optimización de Sistema de Riego",
            "descripcion": "Los sistemas de riego representan uno de los mayores consumos energéticos en el sector agropecuario. La tecnificación puede generar ahorros significativos.",
            "beneficio_estimado": "25-35% de ahorro en riego",
            "prioridad": "alta",
            "acciones": [
                "Instalar riego por goteo o microaspersión",
                "Implementar sensores de humedad del suelo",
                "Programar riego en horarios de tarifa preferencial",
                "Mantener y calibrar equipos de bombeo"
            ],
            "inversion_estimada": "Media",
            "tiempo_implementacion": "2-4 meses"
        })
    
    # Sugerencias para refrigeración
    if tiene_refrigeracion:
        sugerencias.append({
            "id": "agro_02", 
            "categoria": "Refrigeración",
            "titulo": "Eficiencia en Cámaras de Frío",
            "descripcion": "Las cámaras de refrigeración pueden optimizarse para reducir significativamente el consumo energético manteniendo la calidad del producto.",
            "beneficio_estimado": "20-30% de ahorro en refrigeración",
            "prioridad": "alta",
            "acciones": [
                "Mejorar aislamiento térmico de cámaras",
                "Instalar cortinas de aire en accesos",
                "Programar descongelado automático eficiente",
                "Usar compresores de alta eficiencia"
            ],
            "inversion_estimada": "Media-Alta",
            "tiempo_implementacion": "1-3 meses"
        })
    
    # Sugerencias para bombas
    if usa_bombas:
        sugerencias.append({
            "id": "agro_03",
            "categoria": "Sistemas de Bombeo", 
            "titulo": "Optimización de Equipos de Bombeo",
            "descripcion": "Los sistemas de bombeo agrícola pueden mejorarse con tecnología moderna para reducir consumos y mejorar la productividad.",
            "beneficio_estimado": "15-25% de ahorro en bombeo",
            "prioridad": "media",
            "acciones": [
                "Instalar variadores de frecuencia en bombas",
                "Optimizar diámetros y trazado de tuberías",
                "Implementar bombeo solar para pozos",
                "Mantener equipos según especificaciones"
            ],
            "inversion_estimada": "Media",
            "tiempo_implementacion": "2-6 meses"
        })
    
    return sugerencias


def _generar_sugerencias_comercial(respuestas: Dict[int, Any], db: Session) -> List[Dict[str, Any]]:
    """Genera sugerencias específicas para sector comercial."""
    sugerencias = []
    
    tiene_climatizacion = _evaluar_respuesta_clave(respuestas, ["aire acondicionado", "climatización", "calefacción", "si"])
    tiene_iluminacion = _evaluar_respuesta_clave(respuestas, ["iluminación", "luces", "luminarias"])
    area_grande = _evaluar_respuesta_numerica(respuestas, "área", threshold=500)
    
    # Sugerencias para climatización
    if tiene_climatizacion:
        sugerencias.append({
            "id": "comercial_01",
            "categoria": "Climatización",
            "titulo": "Eficiencia en Sistemas de Climatización",
            "descripcion": "Los sistemas de climatización en espacios comerciales ofrecen grandes oportunidades de ahorro con tecnologías eficientes y control inteligente.",
            "beneficio_estimado": "20-30% de ahorro en climatización",
            "prioridad": "alta",
            "acciones": [
                "Instalar equipos inverter de alta eficiencia",
                "Implementar termostatos programables",
                "Mejorar aislamiento térmico del edificio",
                "Realizar mantenimiento preventivo regular"
            ],
            "inversion_estimada": "Media-Alta",
            "tiempo_implementacion": "1-3 meses"
        })
    
    # Sugerencias para iluminación
    if tiene_iluminacion:
        sugerencias.append({
            "id": "comercial_02",
            "categoria": "Iluminación",
            "titulo": "Modernización de Sistema de Iluminación",
            "descripcion": "La actualización a tecnología LED con control inteligente puede reducir drásticamente los costos de iluminación.",
            "beneficio_estimado": "40-60% de ahorro en iluminación",
            "prioridad": "alta",
            "acciones": [
                "Reemplazar luminarias por tecnología LED",
                "Instalar sensores de presencia y luz natural",
                "Implementar control centralizado de iluminación",
                "Aprovechar luz natural con sistemas automáticos"
            ],
            "inversion_estimada": "Media",
            "tiempo_implementacion": "1-2 meses"
        })
    
    return sugerencias


def _generar_sugerencias_servicios(respuestas: Dict[int, Any], db: Session) -> List[Dict[str, Any]]:
    """Genera sugerencias específicas para sector servicios."""
    sugerencias = []
    
    # Sugerencias generales para sector servicios
    sugerencias.append({
        "id": "servicios_01",
        "categoria": "Gestión Energética",
        "titulo": "Sistema de Monitoreo Energético",
        "descripcion": "En el sector servicios, el monitoreo detallado del consumo permite identificar patrones y oportunidades de ahorro.",
        "beneficio_estimado": "10-20% de ahorro general",
        "prioridad": "media",
        "acciones": [
            "Instalar medidores inteligentes por área",
            "Implementar software de gestión energética",
            "Capacitar personal en uso eficiente",
            "Establecer metas de consumo por departamento"
        ],
        "inversion_estimada": "Baja-Media",
        "tiempo_implementacion": "2-4 meses"
    })
    
    return sugerencias


def _generar_sugerencias_genericas(respuestas: Dict[int, Any]) -> List[Dict[str, Any]]:
    """Genera sugerencias genéricas aplicables a cualquier sector."""
    return [
        {
            "id": "general_01",
            "categoria": "Eficiencia General",
            "titulo": "Auditoría Energética Profesional",
            "descripcion": "Una auditoría energética profesional identificará las mejores oportunidades de ahorro específicas para su empresa.",
            "beneficio_estimado": "15-25% de ahorro potencial",
            "prioridad": "alta",
            "acciones": [
                "Contratar auditoría energética certificada",
                "Implementar medidas de bajo costo identificadas",
                "Planificar inversiones de mayor retorno",
                "Establecer línea base de consumo"
            ],
            "inversion_estimada": "Baja",
            "tiempo_implementacion": "1-2 meses"
        }
    ]


def _evaluar_respuesta_clave(respuestas: Dict[int, Any], palabras_clave: List[str]) -> bool:
    """Evalúa si alguna respuesta contiene palabras clave específicas."""
    for respuesta in respuestas.values():
        if isinstance(respuesta, str):
            respuesta_lower = respuesta.lower()
            if any(palabra.lower() in respuesta_lower for palabra in palabras_clave):
                return True
        elif isinstance(respuesta, list):
            for item in respuesta:
                if isinstance(item, str) and any(palabra.lower() in item.lower() for palabra in palabras_clave):
                    return True
    return False


def _evaluar_respuesta_numerica(respuestas: Dict[int, Any], concepto: str, threshold: float) -> bool:
    """Evalúa si alguna respuesta numérica supera un umbral."""
    for respuesta in respuestas.values():
        if isinstance(respuesta, (int, float)):
            if respuesta > threshold:
                return True
        elif isinstance(respuesta, str):
            try:
                valor = float(respuesta.replace(",", ""))
                if valor > threshold:
                    return True
            except (ValueError, AttributeError):
                continue
    return False


def mapear_respuestas_a_templates(categoria_id: int, respuestas: Dict[int, Any]) -> Dict[str, Any]:
    """
    Mapea respuestas específicas a templates de sugerencias para personalización avanzada.
    
    Args:
        categoria_id: ID de la categoría de industria
        respuestas: Respuestas del usuario
        
    Returns:
        Dict con mapeo de respuestas a templates
    """
    templates = {
        "consumo_alto": False,
        "tiene_renovables": False,
        "necesita_monitoreo": True,
        "sector_especifico": {},
        "prioridades": []
    }
    
    # Evaluar consumo alto
    templates["consumo_alto"] = _evaluar_respuesta_numerica(respuestas, "consumo", 1000)
    
    # Evaluar renovables
    templates["tiene_renovables"] = _evaluar_respuesta_clave(respuestas, ["solar", "eólica", "renovable"])
    
    # Mapear respuestas específicas por sector
    if categoria_id == 1:  # Industrial
        templates["sector_especifico"] = {
            "maquinaria_pesada": _evaluar_respuesta_clave(respuestas, ["maquinaria", "industrial"]),
            "procesos_continuos": _evaluar_respuesta_clave(respuestas, ["24/7", "continuo"]),
            "vapor": _evaluar_respuesta_clave(respuestas, ["vapor", "caldera"])
        }
    elif categoria_id == 2:  # Agropecuario
        templates["sector_especifico"] = {
            "riego": _evaluar_respuesta_clave(respuestas, ["riego", "irrigación"]),
            "refrigeracion": _evaluar_respuesta_clave(respuestas, ["refrigeración", "frío"]),
            "bombeo": _evaluar_respuesta_clave(respuestas, ["bomba", "pozo"])
        }
    
    return templates


def generar_plan_implementacion(sugerencias: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Genera un plan de implementación ordenado por prioridad y retorno de inversión.
    
    Args:
        sugerencias: Lista de sugerencias generadas
        
    Returns:
        Dict con plan de implementación estructurado
    """
    # Ordenar por prioridad
    prioridades = {"alta": 3, "media": 2, "baja": 1}
    sugerencias_ordenadas = sorted(
        sugerencias, 
        key=lambda x: prioridades.get(x.get("prioridad", "baja"), 1), 
        reverse=True
    )
    
    plan = {
        "fases": {
            "inmediata": [],  # 0-3 meses
            "corto_plazo": [],  # 3-6 meses
            "mediano_plazo": []  # 6+ meses
        },
        "inversion_total_estimada": "Media",
        "ahorro_total_estimado": "15-30%",
        "tiempo_total": "6-12 meses"
    }
    
    for sugerencia in sugerencias_ordenadas:
        tiempo = sugerencia.get("tiempo_implementacion", "")
        if "1-2" in tiempo or "1-3" in tiempo:
            plan["fases"]["inmediata"].append(sugerencia)
        elif "3-6" in tiempo or "2-4" in tiempo:
            plan["fases"]["corto_plazo"].append(sugerencia)
        else:
            plan["fases"]["mediano_plazo"].append(sugerencia)
    
    return plan 