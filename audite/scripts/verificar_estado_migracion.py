#!/usr/bin/env python3
"""
VERIFICACIÓN DEL ESTADO ACTUAL DEL SISTEMA
=========================================

Script para verificar el estado actual de ambos sistemas
(tradicional y avanzado) antes de proceder con la migración.

Proporciona un reporte detallado del estado actual.
"""

import sys
import os
from datetime import datetime
from tabulate import tabulate
import json

# Agregar el directorio padre al path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from app.models import (
    # Sistema tradicional
    AutodiagnosticoPregunta,
    AutodiagnosticoOpcion,
    AutodiagnosticoRespuesta,
    # Sistema avanzado
    CategoriaIndustria,
    FormularioIndustria,
    PreguntaFormulario,
    RespuestaFormulario
)
from app.database import DATABASE_URL

class EstadoSistemaChecker:
    """Verificador del estado actual de ambos sistemas"""
    
    def __init__(self):
        self.engine = create_engine(DATABASE_URL)
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        self.db = self.SessionLocal()
    
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.db:
            self.db.close()
    
    def verificar_sistema_tradicional(self):
        """Verifica el estado del sistema tradicional"""
        print("📊 SISTEMA TRADICIONAL (Autodiagnóstico)")
        print("-" * 50)
        
        try:
            # Contar preguntas
            total_preguntas = self.db.query(AutodiagnosticoPregunta).count()
            preguntas_activas = self.db.query(AutodiagnosticoPregunta).filter(
                AutodiagnosticoPregunta.es_activa == True
            ).count()
            
            # Contar opciones
            total_opciones = self.db.query(AutodiagnosticoOpcion).count()
            opciones_con_sugerencias = self.db.query(AutodiagnosticoOpcion).filter(
                AutodiagnosticoOpcion.tiene_sugerencia == True
            ).count()
            
            # Contar respuestas
            total_respuestas = self.db.query(AutodiagnosticoRespuesta).count()
            sesiones_unicas = self.db.query(AutodiagnosticoRespuesta.session_id).distinct().count()
            
            # Tipos de preguntas
            tipos_preguntas = self.db.query(
                AutodiagnosticoPregunta.tipo_respuesta,
                self.db.query(AutodiagnosticoPregunta).filter(
                    AutodiagnosticoPregunta.tipo_respuesta == AutodiagnosticoPregunta.tipo_respuesta
                ).count().label('count')
            ).group_by(AutodiagnosticoPregunta.tipo_respuesta).all()
            
            # Mostrar estadísticas
            stats_tradicional = [
                ["Preguntas Total", total_preguntas],
                ["Preguntas Activas", preguntas_activas],
                ["Opciones Total", total_opciones],
                ["Opciones con Sugerencias", opciones_con_sugerencias],
                ["Respuestas Total", total_respuestas],
                ["Sesiones Únicas", sesiones_unicas]
            ]
            
            print(tabulate(stats_tradicional, headers=["Métrica", "Valor"], tablefmt="grid"))
            
            if tipos_preguntas:
                print("\n📝 Tipos de Preguntas:")
                tipos_data = [[tipo, count] for tipo, count in tipos_preguntas]
                print(tabulate(tipos_data, headers=["Tipo", "Cantidad"], tablefmt="grid"))
            
            # Últimas preguntas creadas
            ultimas_preguntas = self.db.query(AutodiagnosticoPregunta).order_by(
                AutodiagnosticoPregunta.created_at.desc()
            ).limit(3).all()
            
            if ultimas_preguntas:
                print("\n🆕 Últimas Preguntas:")
                preguntas_data = []
                for p in ultimas_preguntas:
                    preguntas_data.append([
                        p.id,
                        p.numero_orden,
                        p.pregunta[:50] + "..." if len(p.pregunta) > 50 else p.pregunta,
                        "✅" if p.es_activa else "❌"
                    ])
                print(tabulate(preguntas_data, headers=["ID", "Orden", "Pregunta", "Activa"], tablefmt="grid"))
            
            return {
                'preguntas': total_preguntas,
                'opciones': total_opciones,
                'respuestas': total_respuestas,
                'sesiones': sesiones_unicas
            }
            
        except Exception as e:
            print(f"❌ Error verificando sistema tradicional: {e}")
            return None
    
    def verificar_sistema_avanzado(self):
        """Verifica el estado del sistema avanzado"""
        print("\n🚀 SISTEMA AVANZADO (Formularios por Industria)")
        print("-" * 50)
        
        try:
            # Contar categorías
            total_categorias = self.db.query(CategoriaIndustria).count()
            categorias_activas = self.db.query(CategoriaIndustria).filter(
                CategoriaIndustria.activa == True
            ).count()
            
            # Contar formularios
            total_formularios = self.db.query(FormularioIndustria).count()
            formularios_activos = self.db.query(FormularioIndustria).filter(
                FormularioIndustria.activo == True
            ).count()
            
            # Contar preguntas
            total_preguntas_avanzadas = self.db.query(PreguntaFormulario).count()
            preguntas_activas_avanzadas = self.db.query(PreguntaFormulario).filter(
                PreguntaFormulario.activa == True
            ).count()
            preguntas_condicionales = self.db.query(PreguntaFormulario).filter(
                PreguntaFormulario.pregunta_padre_id.isnot(None)
            ).count()
            
            # Contar respuestas
            total_respuestas_avanzadas = self.db.query(RespuestaFormulario).count()
            sesiones_avanzadas = self.db.query(RespuestaFormulario.session_id).distinct().count()
            
            # Mostrar estadísticas
            stats_avanzado = [
                ["Categorías Total", total_categorias],
                ["Categorías Activas", categorias_activas],
                ["Formularios Total", total_formularios],
                ["Formularios Activos", formularios_activos],
                ["Preguntas Total", total_preguntas_avanzadas],
                ["Preguntas Activas", preguntas_activas_avanzadas],
                ["Preguntas Condicionales", preguntas_condicionales],
                ["Respuestas Total", total_respuestas_avanzadas],
                ["Sesiones Únicas", sesiones_avanzadas]
            ]
            
            print(tabulate(stats_avanzado, headers=["Métrica", "Valor"], tablefmt="grid"))
            
            # Mostrar categorías existentes
            categorias = self.db.query(CategoriaIndustria).order_by(CategoriaIndustria.orden).all()
            if categorias:
                print("\n🏭 Categorías Existentes:")
                cat_data = []
                for cat in categorias:
                    formularios_count = self.db.query(FormularioIndustria).filter(
                        FormularioIndustria.categoria_id == cat.id
                    ).count()
                    cat_data.append([
                        cat.id,
                        cat.nombre,
                        cat.icono,
                        "✅" if cat.activa else "❌",
                        formularios_count
                    ])
                print(tabulate(cat_data, headers=["ID", "Nombre", "Icono", "Activa", "Formularios"], tablefmt="grid"))
            
            # Mostrar formularios existentes
            formularios = self.db.query(FormularioIndustria).join(CategoriaIndustria).order_by(
                CategoriaIndustria.nombre, FormularioIndustria.orden
            ).all()
            if formularios:
                print("\n📋 Formularios Existentes:")
                form_data = []
                for form in formularios:
                    preguntas_count = self.db.query(PreguntaFormulario).filter(
                        PreguntaFormulario.formulario_id == form.id
                    ).count()
                    form_data.append([
                        form.id,
                        form.nombre[:30] + "..." if len(form.nombre) > 30 else form.nombre,
                        form.categoria.nombre,
                        "✅" if form.activo else "❌",
                        preguntas_count
                    ])
                print(tabulate(form_data, headers=["ID", "Formulario", "Categoría", "Activo", "Preguntas"], tablefmt="grid"))
            
            return {
                'categorias': total_categorias,
                'formularios': total_formularios,
                'preguntas': total_preguntas_avanzadas,
                'preguntas_condicionales': preguntas_condicionales,
                'respuestas': total_respuestas_avanzadas,
                'sesiones': sesiones_avanzadas
            }
            
        except Exception as e:
            print(f"❌ Error verificando sistema avanzado: {e}")
            return None
    
    def verificar_prerequisitos_migracion(self):
        """Verifica si los prerequisitos para migración están cumplidos"""
        print("\n🔍 VERIFICACIÓN DE PREREQUISITOS PARA MIGRACIÓN")
        print("-" * 50)
        
        prerequisitos = []
        todo_ok = True
        
        try:
            # 1. Verificar categoría "General"
            categoria_general = self.db.query(CategoriaIndustria).filter(
                CategoriaIndustria.nombre == 'General'
            ).first()
            
            if categoria_general:
                prerequisitos.append(["Categoría 'General'", "✅ EXISTS", f"ID: {categoria_general.id}"])
            else:
                prerequisitos.append(["Categoría 'General'", "❌ MISSING", "Ejecutar migration_phase1_setup.sql"])
                todo_ok = False
            
            # 2. Verificar formulario base
            formulario_basico = self.db.query(FormularioIndustria).filter(
                FormularioIndustria.nombre.ilike('%Autodiagnóstico Energético Básico%')
            ).first()
            
            if formulario_basico:
                prerequisitos.append(["Formulario Base", "✅ EXISTS", f"ID: {formulario_basico.id}"])
            else:
                prerequisitos.append(["Formulario Base", "❌ MISSING", "Ejecutar migration_phase1_setup.sql"])
                todo_ok = False
            
            # 3. Verificar datos a migrar
            preguntas_tradicionales = self.db.query(AutodiagnosticoPregunta).count()
            if preguntas_tradicionales > 0:
                prerequisitos.append(["Datos Tradicionales", "✅ AVAILABLE", f"{preguntas_tradicionales} preguntas"])
            else:
                prerequisitos.append(["Datos Tradicionales", "⚠️ EMPTY", "No hay datos para migrar"])
            
            # 4. Verificar tablas temporales
            try:
                result = self.db.execute(text("SELECT COUNT(*) FROM temp_pregunta_mapping")).scalar()
                prerequisitos.append(["Tabla Mapping", "✅ EXISTS", "Tabla temporal creada"])
            except:
                prerequisitos.append(["Tabla Mapping", "❌ MISSING", "Ejecutar migration_phase1_setup.sql"])
                todo_ok = False
            
            # 5. Verificar si ya existe migración previa
            if categoria_general and formulario_basico:
                preguntas_migradas = self.db.query(PreguntaFormulario).filter(
                    PreguntaFormulario.formulario_id == formulario_basico.id
                ).count()
                
                if preguntas_migradas > 0:
                    prerequisitos.append(["Migración Previa", "⚠️ EXISTS", f"{preguntas_migradas} preguntas ya migradas"])
                else:
                    prerequisitos.append(["Migración Previa", "✅ CLEAN", "Sin migraciones previas"])
            
            print(tabulate(prerequisitos, headers=["Prerequisito", "Estado", "Detalles"], tablefmt="grid"))
            
            if todo_ok:
                print("\n✅ TODOS LOS PREREQUISITOS CUMPLIDOS - LISTO PARA MIGRAR")
            else:
                print("\n❌ FALTAN PREREQUISITOS - EJECUTAR PREPARACIÓN PRIMERO")
                print("Comando: python scripts/run_migration_phase1.py")
            
            return todo_ok
            
        except Exception as e:
            print(f"❌ Error verificando prerequisitos: {e}")
            return False
    
    def generar_reporte_completo(self):
        """Genera un reporte completo del estado actual"""
        print("="*70)
        print("🔍 REPORTE COMPLETO DEL ESTADO DEL SISTEMA")
        print(f"📅 Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("="*70)
        
        # Verificar sistema tradicional
        stats_tradicional = self.verificar_sistema_tradicional()
        
        # Verificar sistema avanzado
        stats_avanzado = self.verificar_sistema_avanzado()
        
        # Verificar prerequisitos
        prerequisitos_ok = self.verificar_prerequisitos_migracion()
        
        # Resumen final
        print("\n📋 RESUMEN EJECUTIVO")
        print("-" * 50)
        
        resumen_data = []
        
        if stats_tradicional:
            resumen_data.append(["Sistema Tradicional", "Preguntas", stats_tradicional['preguntas']])
            resumen_data.append(["", "Respuestas", stats_tradicional['respuestas']])
            resumen_data.append(["", "Sesiones", stats_tradicional['sesiones']])
        
        if stats_avanzado:
            resumen_data.append(["Sistema Avanzado", "Categorías", stats_avanzado['categorias']])
            resumen_data.append(["", "Formularios", stats_avanzado['formularios']])
            resumen_data.append(["", "Preguntas", stats_avanzado['preguntas']])
            resumen_data.append(["", "P. Condicionales", stats_avanzado['preguntas_condicionales']])
            resumen_data.append(["", "Respuestas", stats_avanzado['respuestas']])
        
        resumen_data.append(["Migración", "Prerequisitos", "✅ OK" if prerequisitos_ok else "❌ Faltan"])
        
        print(tabulate(resumen_data, headers=["Sistema", "Métrica", "Valor"], tablefmt="grid"))
        
        # Recomendaciones
        print("\n💡 RECOMENDACIONES")
        print("-" * 50)
        
        if not prerequisitos_ok:
            print("1. ❌ Ejecutar preparación: python scripts/run_migration_phase1.py")
        elif stats_tradicional and stats_tradicional['preguntas'] > 0:
            print("1. ✅ Sistema listo para migración")
            print("2. 🚀 Ejecutar migración: python scripts/migrate_autodiagnostico_to_formularios.py")
        else:
            print("1. ⚠️ No hay datos tradicionales para migrar")
            print("2. 🎯 Proceder directamente con desarrollo frontend público")
        
        return {
            'tradicional': stats_tradicional,
            'avanzado': stats_avanzado,
            'prerequisitos': prerequisitos_ok
        }


def main():
    """Función principal"""
    with EstadoSistemaChecker() as checker:
        reporte = checker.generar_reporte_completo()
        
        # Guardar reporte en archivo JSON
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        reporte_file = f'reporte_estado_{timestamp}.json'
        
        with open(reporte_file, 'w', encoding='utf-8') as f:
            json.dump({
                'timestamp': timestamp,
                'tradicional': reporte['tradicional'],
                'avanzado': reporte['avanzado'],
                'prerequisitos': reporte['prerequisitos']
            }, f, indent=2, default=str)
        
        print(f"\n💾 Reporte guardado en: {reporte_file}")
        
        return 0 if reporte['prerequisitos'] else 1


if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print("\n⚠️ Operación cancelada por el usuario")
        sys.exit(1)
    except Exception as e:
        print(f"\n💥 Error inesperado: {e}")
        sys.exit(1)