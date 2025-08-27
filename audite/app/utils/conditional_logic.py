"""
Módulo de lógica condicional para formularios por industria.
Maneja la evaluación de condiciones, filtrado de preguntas visibles,
y validación de dependencias entre preguntas.
"""

from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
import json


def evaluar_condicion(pregunta: Any, respuestas_anteriores: Dict[int, Any]) -> bool:
    """
    Evalúa si una pregunta condicional debe mostrarse basándose en respuestas anteriores.
    
    Args:
        pregunta: Objeto PreguntaFormulario con información condicional
        respuestas_anteriores: Dict con pregunta_id -> valor_respuesta
        
    Returns:
        bool: True si la pregunta debe mostrarse, False en caso contrario
    """
    # Si no tiene pregunta padre, siempre mostrar
    if not pregunta.pregunta_padre_id:
        return True
    
    # Si no hay respuesta del padre, no mostrar
    if pregunta.pregunta_padre_id not in respuestas_anteriores:
        return False
    
    respuesta_padre = respuestas_anteriores[pregunta.pregunta_padre_id]
    
    # Si no tiene condición configurada, mostrar por defecto
    if not pregunta.condicion_valor or not pregunta.condicion_operador:
        return True
    
    # Obtener valor de la condición
    valor_esperado = pregunta.condicion_valor.get("valor") if isinstance(pregunta.condicion_valor, dict) else pregunta.condicion_valor
    operador = pregunta.condicion_operador
    
    # Manejar campo "Otro" - si existe valor_otro en respuestas_anteriores
    respuesta_otro = respuestas_anteriores.get(f"{pregunta.pregunta_padre_id}_otro")
    
    # Evaluar según operador
    if operador == "=":
        return _comparar_igual(respuesta_padre, valor_esperado, respuesta_otro)
    elif operador == "!=":
        return not _comparar_igual(respuesta_padre, valor_esperado, respuesta_otro)
    elif operador == "includes":
        return _comparar_incluye(respuesta_padre, valor_esperado, respuesta_otro)
    elif operador == "not_includes":
        return not _comparar_incluye(respuesta_padre, valor_esperado, respuesta_otro)
    else:
        # Operador no soportado, mostrar por defecto
        return True


def _comparar_igual(respuesta: Any, valor_esperado: Any, respuesta_otro: Optional[str] = None) -> bool:
    """Compara si respuesta es igual al valor esperado."""
    # Si hay respuesta "Otro", compararla también
    if respuesta_otro and valor_esperado == "Otro":
        return bool(respuesta_otro.strip())
    
    # Comparación directa
    if isinstance(respuesta, list):
        return valor_esperado in respuesta
    
    return str(respuesta).lower() == str(valor_esperado).lower()


def _comparar_incluye(respuesta: Any, valor_esperado: Any, respuesta_otro: Optional[str] = None) -> bool:
    """Compara si respuesta incluye el valor esperado (para respuestas múltiples)."""
    # Si hay respuesta "Otro", verificar si se busca "Otro"
    if respuesta_otro and valor_esperado == "Otro":
        return bool(respuesta_otro.strip())
    
    if isinstance(respuesta, list):
        return valor_esperado in respuesta
    elif isinstance(respuesta, str):
        return valor_esperado.lower() in respuesta.lower()
    
    return str(valor_esperado).lower() in str(respuesta).lower()


def filtrar_preguntas_visibles(preguntas: List[Any], respuestas: Dict[int, Any]) -> List[Any]:
    """
    Filtra la lista de preguntas para mostrar solo las que cumplen sus condiciones.
    
    Args:
        preguntas: Lista de objetos PreguntaFormulario
        respuestas: Dict con pregunta_id -> valor_respuesta
        
    Returns:
        List: Lista filtrada de preguntas visibles
    """
    preguntas_visibles = []
    
    # Ordenar preguntas por orden para evaluar dependencias correctamente
    preguntas_ordenadas = sorted(preguntas, key=lambda p: p.orden)
    
    for pregunta in preguntas_ordenadas:
        if evaluar_condicion(pregunta, respuestas):
            preguntas_visibles.append(pregunta)
    
    return preguntas_visibles


def validar_dependencias_pregunta(pregunta: Any, todas_las_preguntas: List[Any]) -> Dict[str, Any]:
    """
    Valida las dependencias de una pregunta para evitar ciclos y configuraciones inválidas.
    
    Args:
        pregunta: Objeto PreguntaFormulario a validar
        todas_las_preguntas: Lista completa de preguntas del formulario
        
    Returns:
        Dict con información de validación: {
            "valida": bool,
            "errores": List[str],
            "advertencias": List[str]
        }
    """
    resultado = {
        "valida": True,
        "errores": [],
        "advertencias": []
    }
    
    # Si no es condicional, es válida
    if not pregunta.pregunta_padre_id:
        return resultado
    
    # Buscar pregunta padre
    pregunta_padre = None
    for p in todas_las_preguntas:
        if p.id == pregunta.pregunta_padre_id:
            pregunta_padre = p
            break
    
    if not pregunta_padre:
        resultado["valida"] = False
        resultado["errores"].append(f"Pregunta padre con ID {pregunta.pregunta_padre_id} no encontrada")
        return resultado
    
    # Validar que pregunta padre tenga orden menor
    if pregunta_padre.orden >= pregunta.orden:
        resultado["valida"] = False
        resultado["errores"].append("La pregunta padre debe tener un orden menor que la pregunta condicional")
    
    # Detectar ciclos de dependencias
    ciclo_detectado = _detectar_ciclo_dependencias(pregunta, todas_las_preguntas, set())
    if ciclo_detectado:
        resultado["valida"] = False
        resultado["errores"].append("Se detectó un ciclo en las dependencias de preguntas")
    
    # Validar que la condición sea coherente con el tipo de pregunta padre
    if pregunta_padre.tipo in ["checkbox"] and pregunta.condicion_operador not in ["includes", "not_includes"]:
        resultado["advertencias"].append("Para preguntas de tipo checkbox se recomienda usar operadores 'includes' o 'not_includes'")
    
    # Validar que el valor de condición esté en las opciones del padre
    if pregunta_padre.opciones and pregunta.condicion_valor:
        valor_condicion = pregunta.condicion_valor.get("valor") if isinstance(pregunta.condicion_valor, dict) else pregunta.condicion_valor
        if valor_condicion not in pregunta_padre.opciones and valor_condicion != "Otro":
            resultado["advertencias"].append(f"El valor de condición '{valor_condicion}' no está en las opciones de la pregunta padre")
    
    return resultado


def _detectar_ciclo_dependencias(pregunta: Any, todas_las_preguntas: List[Any], visitadas: set) -> bool:
    """Detecta ciclos en las dependencias de preguntas usando DFS."""
    if pregunta.id in visitadas:
        return True
    
    if not pregunta.pregunta_padre_id:
        return False
    
    visitadas.add(pregunta.id)
    
    # Buscar pregunta padre
    for p in todas_las_preguntas:
        if p.id == pregunta.pregunta_padre_id:
            if _detectar_ciclo_dependencias(p, todas_las_preguntas, visitadas.copy()):
                return True
            break
    
    return False


def procesar_respuestas_con_otro(respuestas_raw: Dict[int, Any]) -> Dict[int, Any]:
    """
    Procesa respuestas incluyendo campos "Otro" para uso en evaluaciones condicionales.
    
    Args:
        respuestas_raw: Dict con respuestas originales que pueden incluir campos "otro"
        
    Returns:
        Dict procesado con respuestas y campos "otro" separados
    """
    respuestas_procesadas = {}
    
    for pregunta_id, respuesta in respuestas_raw.items():
        if isinstance(respuesta, dict) and "valor" in respuesta:
            # Respuesta con estructura valor/otro
            respuestas_procesadas[pregunta_id] = respuesta["valor"]
            if "otro" in respuesta and respuesta["otro"]:
                respuestas_procesadas[f"{pregunta_id}_otro"] = respuesta["otro"]
        else:
            # Respuesta simple
            respuestas_procesadas[pregunta_id] = respuesta
    
    return respuestas_procesadas


def obtener_preguntas_dependientes(pregunta_id: int, todas_las_preguntas: List[Any]) -> List[Any]:
    """
    Obtiene todas las preguntas que dependen directa o indirectamente de una pregunta.
    
    Args:
        pregunta_id: ID de la pregunta padre
        todas_las_preguntas: Lista completa de preguntas
        
    Returns:
        List: Preguntas que dependen de la pregunta especificada
    """
    dependientes = []
    
    # Buscar dependientes directos
    for pregunta in todas_las_preguntas:
        if pregunta.pregunta_padre_id == pregunta_id:
            dependientes.append(pregunta)
            # Buscar dependientes indirectos (recursivo)
            dependientes.extend(obtener_preguntas_dependientes(pregunta.id, todas_las_preguntas))
    
    return dependientes


def validar_respuestas_condicionales(respuestas: Dict[int, Any], preguntas: List[Any]) -> Dict[str, Any]:
    """
    Valida que las respuestas sean consistentes con la lógica condicional.
    
    Args:
        respuestas: Dict con las respuestas del usuario
        preguntas: Lista de preguntas del formulario
        
    Returns:
        Dict con resultado de validación y errores
    """
    resultado = {
        "valido": True,
        "errores": [],
        "preguntas_faltantes": [],
        "preguntas_sobrantes": []
    }
    
    # Procesar respuestas para manejo de campos "otro"
    respuestas_procesadas = procesar_respuestas_con_otro(respuestas)
    
    # Filtrar preguntas que deberían estar visibles
    preguntas_visibles = filtrar_preguntas_visibles(preguntas, respuestas_procesadas)
    
    # Verificar que todas las preguntas requeridas visibles tengan respuesta
    for pregunta in preguntas_visibles:
        if pregunta.requerida and pregunta.id not in respuestas:
            resultado["valido"] = False
            resultado["preguntas_faltantes"].append({
                "id": pregunta.id,
                "texto": pregunta.texto,
                "razon": "Pregunta requerida sin respuesta"
            })
    
    # Verificar que no haya respuestas para preguntas que no deberían estar visibles
    preguntas_visibles_ids = {p.id for p in preguntas_visibles}
    for pregunta_id in respuestas:
        if isinstance(pregunta_id, int) and pregunta_id not in preguntas_visibles_ids:
            resultado["valido"] = False
            resultado["preguntas_sobrantes"].append({
                "id": pregunta_id,
                "razon": "Respuesta para pregunta que no debería estar visible"
            })
    
    return resultado 