#!/usr/bin/env python3
"""
Script para crear datos de prueba en AuditE
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app import models, crud, schemas

def create_test_data():
    """Crear datos de prueba para el sistema"""
    db: Session = SessionLocal()
    
    try:
        print("🚀 Creando datos de prueba para AuditE...")
        
        # 1. Crear categorías de industria
        print("\n📋 Creando categorías de industria...")
        categorias_data = [
            {
                "nombre": "Manufactura",
                "descripcion": "Industrias manufactureras y de producción",
                "icono": "factory",
                "color": "#3B82F6",
                "activa": True,
                "orden": 1
            },
            {
                "nombre": "Servicios",
                "descripcion": "Empresas de servicios y comercio",
                "icono": "building",
                "color": "#10B981",
                "activa": True,
                "orden": 2
            },
            {
                "nombre": "Agricultura",
                "descripcion": "Sector agrícola y ganadero",
                "icono": "leaf",
                "color": "#F59E0B",
                "activa": True,
                "orden": 3
            }
        ]
        
        categorias_creadas = []
        for cat_data in categorias_data:
            # Verificar si ya existe
            existing = db.query(models.CategoriaIndustria).filter(
                models.CategoriaIndustria.nombre == cat_data["nombre"]
            ).first()
            
            if not existing:
                categoria_schema = schemas.CategoriaIndustriaCreate(**cat_data)
                categoria = crud.create_categoria_industria(db, categoria_schema)
                categorias_creadas.append(categoria)
                print(f"  ✅ Creada categoría: {categoria.nombre}")
            else:
                categorias_creadas.append(existing)
                print(f"  ⚠️  Categoría ya existe: {existing.nombre}")
        
        # 2. Crear formularios
        print("\n📝 Creando formularios...")
        formularios_data = [
            {
                "categoria_id": categorias_creadas[0].id,  # Manufactura
                "nombre": "Diagnóstico Energético - Manufactura",
                "descripcion": "Evaluación energética para industrias manufactureras",
                "activo": True,
                "orden": 1
            },
            {
                "categoria_id": categorias_creadas[1].id,  # Servicios
                "nombre": "Diagnóstico Energético - Servicios",
                "descripcion": "Evaluación energética para empresas de servicios",
                "activo": True,
                "orden": 1
            }
        ]
        
        formularios_creados = []
        for form_data in formularios_data:
            # Verificar si ya existe
            existing = db.query(models.FormularioIndustria).filter(
                models.FormularioIndustria.nombre == form_data["nombre"]
            ).first()
            
            if not existing:
                formulario_schema = schemas.FormularioIndustriaCreate(**form_data)
                formulario = crud.create_formulario_industria(db, formulario_schema)
                formularios_creados.append(formulario)
                print(f"  ✅ Creado formulario: {formulario.nombre}")
            else:
                formularios_creados.append(existing)
                print(f"  ⚠️  Formulario ya existe: {existing.nombre}")
        
        # 3. Crear preguntas de ejemplo
        print("\n❓ Creando preguntas de ejemplo...")
        preguntas_data = [
            {
                "formulario_id": formularios_creados[0].id,
                "texto": "¿Cuál es el tamaño de su empresa?",
                "subtitulo": "Seleccione el rango que mejor describe su empresa",
                "tipo": "radio",
                "opciones": [
                    {
                        "valor": "pequena",
                        "texto": "Pequeña (1-10 empleados)",
                        "sugerencia": "Para empresas pequeñas, recomendamos comenzar con medidas básicas de eficiencia energética como iluminación LED y equipos eficientes."
                    },
                    {
                        "valor": "mediana",
                        "texto": "Mediana (11-50 empleados)",
                        "sugerencia": "Las empresas medianas pueden beneficiarse de auditorías energéticas más detalladas y sistemas de monitoreo básico."
                    },
                    {
                        "valor": "grande",
                        "texto": "Grande (51+ empleados)",
                        "sugerencia": "Las empresas grandes deben considerar sistemas de gestión energética ISO 50001 y tecnologías avanzadas de eficiencia."
                    }
                ],
                "orden": 1,
                "requerida": True,
                "activa": True
            },
            {
                "formulario_id": formularios_creados[0].id,
                "texto": "¿Qué tipos de equipos utilizan más energía en su empresa?",
                "subtitulo": "Puede seleccionar múltiples opciones",
                "tipo": "checkbox",
                "opciones": [
                    {
                        "valor": "iluminacion",
                        "texto": "Iluminación",
                        "sugerencia": "Considere cambiar a tecnología LED para reducir el consumo hasta un 80%."
                    },
                    {
                        "valor": "climatizacion",
                        "texto": "Climatización (A/C, calefacción)",
                        "sugerencia": "Implemente sistemas de control inteligente y mantenimiento preventivo para optimizar el consumo."
                    },
                    {
                        "valor": "maquinaria",
                        "texto": "Maquinaria de producción",
                        "sugerencia": "Evalúe la eficiencia de sus motores y considere variadores de velocidad."
                    },
                    {
                        "valor": "compresores",
                        "texto": "Compresores de aire",
                        "sugerencia": "Los compresores pueden representar hasta el 30% del consumo. Revise fugas y presiones de trabajo."
                    }
                ],
                "tiene_opcion_otro": True,
                "placeholder_otro": "Especifique otros equipos...",
                "orden": 2,
                "requerida": True,
                "activa": True
            }
        ]
        
        for pregunta_data in preguntas_data:
            # Verificar si ya existe
            existing = db.query(models.PreguntaFormulario).filter(
                models.PreguntaFormulario.texto == pregunta_data["texto"],
                models.PreguntaFormulario.formulario_id == pregunta_data["formulario_id"]
            ).first()
            
            if not existing:
                pregunta_schema = schemas.PreguntaFormularioCreate(**pregunta_data)
                pregunta = crud.create_pregunta_formulario(db, pregunta_schema)
                print(f"  ✅ Creada pregunta: {pregunta.texto[:50]}...")
            else:
                print(f"  ⚠️  Pregunta ya existe: {existing.texto[:50]}...")
        
        print("\n🎉 Datos de prueba creados exitosamente!")
        print(f"📊 Resumen:")
        print(f"  - Categorías: {len(categorias_creadas)}")
        print(f"  - Formularios: {len(formularios_creados)}")
        print(f"  - Preguntas: {len(preguntas_data)}")
        
    except Exception as e:
        print(f"❌ Error creando datos de prueba: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    create_test_data() 