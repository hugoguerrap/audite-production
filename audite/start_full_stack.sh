#!/bin/bash

# Script para levantar el stack completo de AuditE
# Backend FastAPI + Frontend React + PostgreSQL + Adminer

echo "🚀 AUDITE - INICIANDO STACK COMPLETO"
echo "===================================="
echo ""

# Verificar si Docker está corriendo
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker no está corriendo. Por favor, inicia Docker Desktop."
    exit 1
fi

echo "✅ Docker está corriendo"
echo ""

# Verificar si existe docker-compose.full.yml
if [ ! -f "docker-compose.full.yml" ]; then
    echo "❌ No se encontró docker-compose.full.yml"
    exit 1
fi

echo "📦 Iniciando servicios:"
echo "   🐘 PostgreSQL (Base de datos)"
echo "   🐍 FastAPI Backend"
echo "   ⚛️  React Frontend"
echo "   🌐 Adminer (Gestor BD)"
echo ""

# Detener servicios existentes si están corriendo
echo "🛑 Deteniendo servicios existentes..."
docker-compose -f docker-compose.full.yml down > /dev/null 2>&1

# Construir e iniciar servicios
echo "🔨 Construyendo e iniciando servicios..."
docker-compose -f docker-compose.full.yml up --build -d

# Esperar a que los servicios estén listos
echo ""
echo "⏳ Esperando que los servicios estén listos..."
sleep 10

# Verificar estado de los servicios
echo ""
echo "📊 Estado de los servicios:"
docker-compose -f docker-compose.full.yml ps

echo ""
echo "🎉 ¡STACK COMPLETO INICIADO!"
echo "=========================="
echo ""
echo "🌐 URLs disponibles:"
echo "   📱 Frontend:     http://localhost:8080"
echo "   🔧 Backend API:  http://localhost:8000"
echo "   📚 API Docs:     http://localhost:8000/docs"
echo "   🗄️  Adminer:      http://localhost:8081"
echo ""
echo "🔐 Credenciales de Admin:"
echo "   Usuario:   admin_audite"
echo "   Password:  AuditE2024!SecureAdmin#2024"
echo ""
echo "📋 Comandos útiles:"
echo "   Ver logs:           docker-compose -f docker-compose.full.yml logs -f"
echo "   Detener todo:       docker-compose -f docker-compose.full.yml down"
echo "   Ver estado:         docker-compose -f docker-compose.full.yml ps"
echo ""
echo "🔍 Para ver logs en tiempo real:"
echo "   make docker-logs"
echo ""
echo "✅ ¡Todo listo para desarrollar!" 