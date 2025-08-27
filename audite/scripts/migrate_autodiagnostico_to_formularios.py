#!/usr/bin/env python3
"""
SCRIPT DE MIGRACIÓN: SISTEMA TRADICIONAL → SISTEMA AVANZADO
===========================================================

Migra el sistema de autodiagnóstico tradicional al sistema avanzado
de formularios por industria, unificando toda la lógica bajo una
arquitectura consistente.

Autor: Sistema AuditE
Fecha: 2025
Versión: 1.0
"""

import sys
import os
import json
from datetime import datetime
from typing import Dict, List, Optional, Any
import logging

# Agregar el directorio padre al path para imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.exc import SQLAlchemyError

# Imports de modelos
from app.models import (
    # Sistema tradicional (origen)
    AutodiagnosticoPregunta,
    AutodiagnosticoOpcion, 
    AutodiagnosticoRespuesta,
    # Sistema avanzado (destino)
    CategoriaIndustria,
    FormularioIndustria,
    PreguntaFormulario,
    RespuestaFormulario
)
from app.database import get_db
from app.database import DATABASE_URL

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f'migration_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

class AutodiagnosticoMigrator:
    """Clase principal para gestionar la migración completa"""
    
    def __init__(self):
        self.engine = create_engine(DATABASE_URL)
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        self.db = self.SessionLocal()
        
        # Mapeos para conversión
        self.pregunta_id_mapping: Dict[int, int] = {}
        self.migration_stats = {
            'preguntas_migradas': 0,
            'opciones_migradas': 0,
            'respuestas_migradas': 0,
            'errores': 0,
            'inicio': datetime.now(),
            'fin': None
        }
    
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.db:
            self.db.close()
    
    def verificar_prerequisitos(self) -> bool:
        """Verifica que la estructura esté preparada para la migración"""
        logger.info("🔍 Verificando prerequisitos de migración...")
        
        try:
            # Verificar que existe la categoría "General"
            categoria_general = self.db.query(CategoriaIndustria).filter(
                CategoriaIndustria.nombre == 'General'
            ).first()
            
            if not categoria_general:
                logger.error("❌ No existe la categoría 'General'. Ejecutar migration_phase1_setup.sql primero")
                return False
            
            # Verificar que existe el formulario "Autodiagnóstico Básico"
            formulario_basico = self.db.query(FormularioIndustria).filter(
                FormularioIndustria.nombre.ilike('%Autodiagnóstico Energético Básico%')
            ).first()
            
            if not formulario_basico:
                logger.error("❌ No existe el formulario 'Autodiagnóstico Energético Básico'")
                return False
            
            # Verificar datos existentes a migrar
            total_preguntas = self.db.query(AutodiagnosticoPregunta).count()
            total_respuestas = self.db.query(AutodiagnosticoRespuesta).count()
            
            logger.info(f"✅ Prerequisitos verificados:")
            logger.info(f"   - Categoría 'General': {categoria_general.id}")
            logger.info(f"   - Formulario básico: {formulario_basico.id}")
            logger.info(f"   - Preguntas a migrar: {total_preguntas}")
            logger.info(f"   - Respuestas a migrar: {total_respuestas}")
            
            # Guardar IDs para uso posterior
            self.categoria_general_id = categoria_general.id
            self.formulario_basico_id = formulario_basico.id
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Error verificando prerequisitos: {str(e)}")
            return False
    
    def crear_backup_temporal(self) -> bool:
        """Crea backup de datos críticos antes de migración"""
        logger.info("💾 Creando backup temporal de datos...")
        
        try:
            # Crear tabla de backup si no existe
            backup_sql = """
            CREATE TABLE IF NOT EXISTS migration_backup_autodiagnostico AS
            SELECT 
                'pregunta' as tipo,
                p.id::text as original_id,
                p.numero_orden::text,
                p.pregunta as contenido,
                p.tipo_respuesta,
                p.es_activa::text,
                NOW() as backup_timestamp
            FROM autodiagnostico_preguntas p
            
            UNION ALL
            
            SELECT 
                'opcion' as tipo,
                o.id::text as original_id,
                o.pregunta_id::text,
                o.texto_opcion as contenido,
                o.valor,
                o.es_activa::text,
                NOW() as backup_timestamp
            FROM autodiagnostico_opciones o
            
            UNION ALL
            
            SELECT 
                'respuesta' as tipo,
                r.id as original_id,
                r.session_id,
                COALESCE(r.respuesta_texto, r.opcion_seleccionada) as contenido,
                r.pregunta_id::text,
                NULL,
                NOW() as backup_timestamp
            FROM autodiagnostico_respuestas r
            """
            
            # Limpiar backup anterior
            self.db.execute(text("DROP TABLE IF EXISTS migration_backup_autodiagnostico"))
            self.db.execute(text(backup_sql))
            self.db.commit()
            
            # Contar registros respaldados
            backup_count = self.db.execute(
                text("SELECT COUNT(*) FROM migration_backup_autodiagnostico")
            ).scalar()
            
            logger.info(f"✅ Backup creado: {backup_count} registros respaldados")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error creando backup: {str(e)}")
            self.db.rollback()
            return False
    
    def migrar_preguntas_y_opciones(self) -> bool:
        """Migra preguntas y sus opciones del sistema tradicional al avanzado"""
        logger.info("🔄 Iniciando migración de preguntas y opciones...")
        
        try:
            # Obtener todas las preguntas del sistema tradicional
            preguntas_tradicionales = self.db.query(AutodiagnosticoPregunta).order_by(
                AutodiagnosticoPregunta.numero_orden
            ).all()
            
            logger.info(f"📝 Encontradas {len(preguntas_tradicionales)} preguntas a migrar")
            
            for pregunta_tradicional in preguntas_tradicionales:
                try:
                    # Obtener opciones de la pregunta tradicional
                    opciones_tradicionales = self.db.query(AutodiagnosticoOpcion).filter(
                        AutodiagnosticoOpcion.pregunta_id == pregunta_tradicional.id
                    ).order_by(AutodiagnosticoOpcion.orden).all()
                    
                    # Convertir opciones a formato JSON
                    opciones_json = []
                    for opcion in opciones_tradicionales:
                        opcion_dict = {
                            "value": opcion.valor,
                            "label": opcion.texto_opcion,
                            "order": opcion.orden,
                            "is_default": opcion.es_por_defecto,
                            "is_special": opcion.es_especial,
                            "has_suggestion": opcion.tiene_sugerencia,
                            "suggestion": opcion.sugerencia if opcion.tiene_sugerencia else None
                        }
                        opciones_json.append(opcion_dict)
                    
                    # Mapear tipo de pregunta
                    tipo_mapeado = self._mapear_tipo_pregunta(pregunta_tradicional.tipo_respuesta)
                    
                    # Crear nueva pregunta en sistema avanzado
                    nueva_pregunta = PreguntaFormulario(
                        formulario_id=self.formulario_basico_id,
                        texto=pregunta_tradicional.pregunta,
                        subtitulo=pregunta_tradicional.ayuda_texto,
                        tipo=tipo_mapeado,
                        opciones=opciones_json if opciones_json else None,
                        tiene_opcion_otro=any(opt.es_especial for opt in opciones_tradicionales),
                        placeholder_otro="Especificar...",
                        orden=pregunta_tradicional.numero_orden,
                        requerida=pregunta_tradicional.es_obligatoria,
                        activa=pregunta_tradicional.es_activa,
                        # Campos condicionales (por ahora None, no hay lógica condicional en sistema tradicional)
                        pregunta_padre_id=None,
                        condicion_valor=None,
                        condicion_operador=None
                    )
                    
                    self.db.add(nueva_pregunta)
                    self.db.flush()  # Para obtener el ID
                    
                    # Guardar mapeo de IDs
                    self.pregunta_id_mapping[pregunta_tradicional.id] = nueva_pregunta.id
                    
                    # Estadísticas
                    self.migration_stats['preguntas_migradas'] += 1
                    self.migration_stats['opciones_migradas'] += len(opciones_tradicionales)
                    
                    logger.info(f"✅ Migrada pregunta {pregunta_tradicional.id} → {nueva_pregunta.id}: '{pregunta_tradicional.pregunta[:50]}...'")
                    
                except Exception as e:
                    logger.error(f"❌ Error migrando pregunta {pregunta_tradicional.id}: {str(e)}")
                    self.migration_stats['errores'] += 1
                    continue
            
            # Guardar mapeo para migración de respuestas
            self._guardar_mapeo_preguntas()
            
            self.db.commit()
            logger.info(f"✅ Migración de preguntas completada: {self.migration_stats['preguntas_migradas']} preguntas, {self.migration_stats['opciones_migradas']} opciones")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error en migración de preguntas: {str(e)}")
            self.db.rollback()
            return False
    
    def migrar_respuestas(self) -> bool:
        """Migra respuestas del sistema tradicional al avanzado"""
        logger.info("🔄 Iniciando migración de respuestas...")
        
        try:
            # Obtener todas las respuestas del sistema tradicional
            respuestas_tradicionales = self.db.query(AutodiagnosticoRespuesta).all()
            
            logger.info(f"📊 Encontradas {len(respuestas_tradicionales)} respuestas a migrar")
            
            for respuesta_tradicional in respuestas_tradicionales:
                try:
                    # Verificar que existe mapeo para esta pregunta
                    if respuesta_tradicional.pregunta_id not in self.pregunta_id_mapping:
                        logger.warning(f"⚠️ No existe mapeo para pregunta_id {respuesta_tradicional.pregunta_id}")
                        continue
                    
                    nueva_pregunta_id = self.pregunta_id_mapping[respuesta_tradicional.pregunta_id]
                    
                    # Determinar valor de respuesta en formato unificado
                    valor_respuesta = self._convertir_valor_respuesta(respuesta_tradicional)
                    
                    # Crear nueva respuesta en sistema avanzado
                    nueva_respuesta = RespuestaFormulario(
                        session_id=respuesta_tradicional.session_id,
                        pregunta_id=nueva_pregunta_id,
                        valor_respuesta=valor_respuesta,
                        valor_otro=None,  # Sistema tradicional no maneja "otro"
                        ip_address=respuesta_tradicional.ip_address,
                        user_agent=respuesta_tradicional.user_agent,
                        created_at=respuesta_tradicional.created_at
                    )
                    
                    self.db.add(nueva_respuesta)
                    self.migration_stats['respuestas_migradas'] += 1
                    
                    # Commit por lotes para performance
                    if self.migration_stats['respuestas_migradas'] % 100 == 0:
                        self.db.commit()
                        logger.info(f"📈 Progreso: {self.migration_stats['respuestas_migradas']} respuestas migradas...")
                    
                except Exception as e:
                    logger.error(f"❌ Error migrando respuesta {respuesta_tradicional.id}: {str(e)}")
                    self.migration_stats['errores'] += 1
                    continue
            
            self.db.commit()
            logger.info(f"✅ Migración de respuestas completada: {self.migration_stats['respuestas_migradas']} respuestas")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error en migración de respuestas: {str(e)}")
            self.db.rollback()
            return False
    
    def validar_migracion(self) -> bool:
        """Valida que la migración se completó correctamente"""
        logger.info("🔍 Validando migración...")
        
        try:
            # Contar registros originales
            total_preguntas_orig = self.db.query(AutodiagnosticoPregunta).count()
            total_respuestas_orig = self.db.query(AutodiagnosticoRespuesta).count()
            
            # Contar registros migrados
            total_preguntas_migr = self.db.query(PreguntaFormulario).filter(
                PreguntaFormulario.formulario_id == self.formulario_basico_id
            ).count()
            
            total_respuestas_migr = self.db.query(RespuestaFormulario).join(
                PreguntaFormulario
            ).filter(
                PreguntaFormulario.formulario_id == self.formulario_basico_id
            ).count()
            
            # Verificar integridad
            preguntas_ok = total_preguntas_orig == total_preguntas_migr
            respuestas_ok = total_respuestas_orig == total_respuestas_migr
            
            logger.info("📊 Resultados de validación:")
            logger.info(f"   Preguntas - Original: {total_preguntas_orig}, Migrado: {total_preguntas_migr} {'✅' if preguntas_ok else '❌'}")
            logger.info(f"   Respuestas - Original: {total_respuestas_orig}, Migrado: {total_respuestas_migr} {'✅' if respuestas_ok else '❌'}")
            logger.info(f"   Errores durante migración: {self.migration_stats['errores']}")
            
            return preguntas_ok and respuestas_ok and self.migration_stats['errores'] == 0
            
        except Exception as e:
            logger.error(f"❌ Error en validación: {str(e)}")
            return False
    
    def actualizar_estadisticas_migracion(self) -> None:
        """Actualiza estadísticas finales de migración"""
        try:
            self.migration_stats['fin'] = datetime.now()
            duracion = self.migration_stats['fin'] - self.migration_stats['inicio']
            
            # Actualizar tabla de estadísticas
            update_sql = """
            UPDATE temp_migration_stats 
            SET 
                total_records = :total,
                migrated_records = :migrated,
                failed_records = :failed,
                migration_end = NOW(),
                notes = :notes
            WHERE entity_type = 'migration_phase1'
            """
            
            self.db.execute(text(update_sql), {
                'total': self.migration_stats['preguntas_migradas'] + self.migration_stats['respuestas_migradas'],
                'migrated': self.migration_stats['preguntas_migradas'] + self.migration_stats['respuestas_migradas'],
                'failed': self.migration_stats['errores'],
                'notes': f"Migración completada. Duración: {duracion}. Preguntas: {self.migration_stats['preguntas_migradas']}, Respuestas: {self.migration_stats['respuestas_migradas']}"
            })
            
            self.db.commit()
            
        except Exception as e:
            logger.error(f"⚠️ Error actualizando estadísticas: {str(e)}")
    
    def ejecutar_migracion_completa(self) -> bool:
        """Ejecuta el proceso completo de migración"""
        logger.info("🚀 INICIANDO MIGRACIÓN COMPLETA DEL AUTODIAGNÓSTICO")
        
        try:
            # Fase 1: Verificación
            if not self.verificar_prerequisitos():
                logger.error("❌ Falló verificación de prerequisitos")
                return False
            
            # Fase 2: Backup
            if not self.crear_backup_temporal():
                logger.error("❌ Falló creación de backup")
                return False
            
            # Fase 3: Migrar preguntas
            if not self.migrar_preguntas_y_opciones():
                logger.error("❌ Falló migración de preguntas")
                return False
            
            # Fase 4: Migrar respuestas
            if not self.migrar_respuestas():
                logger.error("❌ Falló migración de respuestas")
                return False
            
            # Fase 5: Validación
            if not self.validar_migracion():
                logger.error("❌ Falló validación de migración")
                return False
            
            # Fase 6: Estadísticas finales
            self.actualizar_estadisticas_migracion()
            
            duracion = datetime.now() - self.migration_stats['inicio']
            logger.info("🎉 MIGRACIÓN COMPLETADA EXITOSAMENTE")
            logger.info(f"📊 Resumen final:")
            logger.info(f"   - Preguntas migradas: {self.migration_stats['preguntas_migradas']}")
            logger.info(f"   - Opciones migradas: {self.migration_stats['opciones_migradas']}")
            logger.info(f"   - Respuestas migradas: {self.migration_stats['respuestas_migradas']}")
            logger.info(f"   - Errores: {self.migration_stats['errores']}")
            logger.info(f"   - Duración total: {duracion}")
            
            return True
            
        except Exception as e:
            logger.error(f"💥 Error crítico en migración: {str(e)}")
            return False
    
    # MÉTODOS AUXILIARES
    # ==================
    
    def _mapear_tipo_pregunta(self, tipo_tradicional: str) -> str:
        """Mapea tipos de pregunta del sistema tradicional al avanzado"""
        mapeo = {
            'radio': 'radio',
            'checkbox': 'checkbox', 
            'text': 'text',
            'number': 'number',
            'select': 'select'
        }
        return mapeo.get(tipo_tradicional, 'text')
    
    def _convertir_valor_respuesta(self, respuesta_tradicional) -> Any:
        """Convierte valor de respuesta tradicional a formato unificado JSON"""
        if respuesta_tradicional.respuesta_texto:
            return respuesta_tradicional.respuesta_texto
        elif respuesta_tradicional.respuesta_numero is not None:
            return respuesta_tradicional.respuesta_numero
        elif respuesta_tradicional.opciones_seleccionadas:
            return respuesta_tradicional.opciones_seleccionadas
        elif respuesta_tradicional.opcion_seleccionada:
            return respuesta_tradicional.opcion_seleccionada
        else:
            return None
    
    def _guardar_mapeo_preguntas(self) -> None:
        """Guarda mapeo de IDs en tabla temporal"""
        try:
            for old_id, new_id in self.pregunta_id_mapping.items():
                insert_sql = """
                INSERT INTO temp_pregunta_mapping (old_id, new_id, migrated_at)
                VALUES (:old_id, :new_id, NOW())
                ON CONFLICT (old_id) DO UPDATE SET 
                    new_id = EXCLUDED.new_id,
                    migrated_at = EXCLUDED.migrated_at
                """
                self.db.execute(text(insert_sql), {'old_id': old_id, 'new_id': new_id})
            
            self.db.commit()
            logger.info(f"✅ Mapeo de IDs guardado: {len(self.pregunta_id_mapping)} entradas")
            
        except Exception as e:
            logger.error(f"⚠️ Error guardando mapeo: {str(e)}")


def main():
    """Función principal para ejecutar migración desde línea de comandos"""
    print("🚀 MIGRACIÓN DE AUTODIAGNÓSTICO TRADICIONAL → FORMULARIOS INDUSTRIA")
    print("="*70)
    
    respuesta = input("¿Desea proceder con la migración? (s/N): ").strip().lower()
    if respuesta not in ['s', 'si', 'sí', 'y', 'yes']:
        print("❌ Migración cancelada por el usuario")
        return
    
    with AutodiagnosticoMigrator() as migrator:
        success = migrator.ejecutar_migracion_completa()
        
        if success:
            print("✅ Migración completada exitosamente")
            print("📋 Próximos pasos:")
            print("   1. Verificar datos en el panel admin")
            print("   2. Probar funcionalidad de preguntas migradas")
            print("   3. Ejecutar Fase 2 de la migración")
            return 0
        else:
            print("❌ Migración falló. Revisar logs para detalles")
            return 1


if __name__ == "__main__":
    sys.exit(main())