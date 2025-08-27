# Makefile para AuditE - Ambiente de Desarrollo
# =============================================

.PHONY: help setup setup-sqlite setup-postgres start-db stop-db migrate install dev test clean logs docker-full docker-stop docker-logs docker-build

# Variables
PYTHON = python3
VENV = venv
DOCKER_COMPOSE = docker-compose -f docker-compose.dev.yml
DOCKER_COMPOSE_FULL = docker-compose -f docker-compose.full.yml

# Mostrar ayuda por defecto
help:
	@echo "🚀 AuditE - Comandos de Desarrollo"
	@echo "=================================="
	@echo ""
	@echo "📋 Configuración inicial:"
	@echo "  setup            - Configurador interactivo"
	@echo "  setup-sqlite     - Configurar con SQLite"
	@echo "  setup-postgres   - Configurar con PostgreSQL"
	@echo ""
	@echo "🐳 Docker Compose Completo:"
	@echo "  docker-full      - Levantar stack completo (Backend + Frontend + DB)"
	@echo "  docker-stop      - Detener stack completo"
	@echo "  docker-build     - Construir imágenes Docker"
	@echo "  docker-logs      - Ver logs del stack completo"
	@echo "  docker-clean     - Limpiar contenedores e imágenes"
	@echo ""
	@echo "🗄️  Base de datos:"
	@echo "  start-db         - Iniciar PostgreSQL (Docker)"
	@echo "  stop-db          - Detener PostgreSQL"
	@echo "  migrate          - Ejecutar migraciones"
	@echo "  reset-db         - Resetear base de datos"
	@echo ""
	@echo "🔧 Desarrollo:"
	@echo "  install          - Instalar dependencias"
	@echo "  dev              - Iniciar servidor de desarrollo"
	@echo "  test             - Ejecutar tests"
	@echo "  logs             - Ver logs de PostgreSQL"
	@echo ""
	@echo "🧹 Limpieza:"
	@echo "  clean            - Limpiar archivos temporales"
	@echo "  clean-all        - Limpiar todo (incluye Docker)"

# ========================================
# COMANDOS DOCKER COMPOSE COMPLETO
# ========================================

# Levantar stack completo (Backend + Frontend + PostgreSQL)
docker-full:
	@echo "🚀 Levantando stack completo de AuditE..."
	@echo "📦 Esto incluye: PostgreSQL + Backend FastAPI + Frontend React + Adminer"
	@echo ""
	$(DOCKER_COMPOSE_FULL) up --build
	@echo ""
	@echo "✅ Stack completo iniciado!"
	@echo "🌐 URLs disponibles:"
	@echo "   Frontend:     http://localhost:8080"
	@echo "   Backend API:  http://localhost:8000"
	@echo "   API Docs:     http://localhost:8000/docs"
	@echo "   Adminer:      http://localhost:8081"
	@echo ""
	@echo "🔐 Credenciales Admin:"
	@echo "   Usuario: admin_audite"
	@echo "   Password: AuditE2024!SecureAdmin#2024"

# Levantar stack completo en background
docker-full-bg:
	@echo "🚀 Levantando stack completo en background..."
	$(DOCKER_COMPOSE_FULL) up -d --build
	@echo "✅ Stack iniciado en background"
	@$(MAKE) docker-status

# Detener stack completo
docker-stop:
	@echo "🛑 Deteniendo stack completo..."
	$(DOCKER_COMPOSE_FULL) down
	@echo "✅ Stack detenido"

# Construir imágenes Docker
docker-build:
	@echo "🔨 Construyendo imágenes Docker..."
	$(DOCKER_COMPOSE_FULL) build --no-cache
	@echo "✅ Imágenes construidas"

# Ver logs del stack completo
docker-logs:
	@echo "📋 Logs del stack completo:"
	$(DOCKER_COMPOSE_FULL) logs -f

# Ver logs de un servicio específico
docker-logs-backend:
	@echo "📋 Logs del Backend:"
	$(DOCKER_COMPOSE_FULL) logs -f backend

docker-logs-frontend:
	@echo "📋 Logs del Frontend:"
	$(DOCKER_COMPOSE_FULL) logs -f frontend

docker-logs-db:
	@echo "📋 Logs de PostgreSQL:"
	$(DOCKER_COMPOSE_FULL) logs -f db

# Estado de los contenedores
docker-status:
	@echo "📊 Estado de los contenedores:"
	$(DOCKER_COMPOSE_FULL) ps
	@echo ""
	@echo "🌐 URLs disponibles:"
	@echo "   Frontend:     http://localhost:8080"
	@echo "   Backend API:  http://localhost:8000"
	@echo "   API Docs:     http://localhost:8000/docs"
	@echo "   Adminer:      http://localhost:8081"

# Reiniciar un servicio específico
docker-restart-backend:
	@echo "🔄 Reiniciando Backend..."
	$(DOCKER_COMPOSE_FULL) restart backend

docker-restart-frontend:
	@echo "🔄 Reiniciando Frontend..."
	$(DOCKER_COMPOSE_FULL) restart frontend

# Limpiar contenedores e imágenes Docker
docker-clean:
	@echo "🧹 Limpiando contenedores e imágenes Docker..."
	$(DOCKER_COMPOSE_FULL) down -v --remove-orphans
	@docker image prune -f
	@docker container prune -f
	@echo "✅ Limpieza Docker completada"

# ========================================
# COMANDOS ORIGINALES (sin cambios)
# ========================================

# Configuración interactiva
setup:
	@echo "🚀 Iniciando configurador..."
	$(PYTHON) scripts/setup_dev.py

# Configuración con SQLite
setup-sqlite:
	@echo "🗄️  Configurando con SQLite..."
	@if [ ! -f .env ]; then \
		echo "❌ Archivo .env no encontrado"; \
		exit 1; \
	fi
	@$(MAKE) install
	@$(MAKE) migrate
	@echo "✅ Configuración SQLite completada"

# Configuración con PostgreSQL
setup-postgres:
	@echo "🐘 Configurando con PostgreSQL..."
	@if [ ! -f .env.dev ]; then \
		echo "❌ Archivo .env.dev no encontrado"; \
		exit 1; \
	fi
	@cp .env.dev .env
	@$(MAKE) start-db
	@sleep 5
	@$(MAKE) install
	@$(MAKE) migrate
	@echo "✅ Configuración PostgreSQL completada"

# Iniciar base de datos PostgreSQL
start-db:
	@echo "🐳 Iniciando PostgreSQL..."
	$(DOCKER_COMPOSE) up -d db adminer
	@echo "✅ PostgreSQL iniciado en puerto 5432"
	@echo "🌐 Adminer disponible en http://localhost:8081"

# Detener base de datos
stop-db:
	@echo "🛑 Deteniendo PostgreSQL..."
	$(DOCKER_COMPOSE) down
	@echo "✅ PostgreSQL detenido"

# Ejecutar migraciones
migrate:
	@echo "🔄 Ejecutando migraciones..."
	@if [ -d $(VENV) ]; then \
		$(VENV)/bin/alembic upgrade head; \
	else \
		alembic upgrade head; \
	fi
	@echo "✅ Migraciones aplicadas"

# Resetear base de datos
reset-db:
	@echo "⚠️  Reseteando base de datos..."
	@read -p "¿Estás seguro? Esto borrará todos los datos (y/N): " confirm; \
	if [ "$$confirm" = "y" ] || [ "$$confirm" = "Y" ]; then \
		if [ -f audite.db ]; then \
			rm audite.db; \
			echo "🗑️  SQLite eliminada"; \
		fi; \
		$(DOCKER_COMPOSE) down -v; \
		$(DOCKER_COMPOSE) up -d db; \
		sleep 5; \
		$(MAKE) migrate; \
		echo "✅ Base de datos reseteada"; \
	else \
		echo "❌ Operación cancelada"; \
	fi

# Instalar dependencias
install:
	@echo "📦 Instalando dependencias..."
	@if [ ! -d $(VENV) ]; then \
		$(PYTHON) -m venv $(VENV); \
		echo "🔧 Entorno virtual creado"; \
	fi
	@$(VENV)/bin/pip install -r requirements.txt
	@echo "✅ Dependencias instaladas"

# Iniciar servidor de desarrollo
dev:
	@echo "🚀 Iniciando servidor de desarrollo..."
	@if [ -d $(VENV) ]; then \
		$(VENV)/bin/python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000; \
	else \
		echo "❌ Entorno virtual no encontrado. Ejecuta 'make install' primero"; \
	fi

# Ejecutar tests
test:
	@echo "🧪 Ejecutando tests..."
	@if [ -d $(VENV) ]; then \
		$(VENV)/bin/python -m pytest tests/ -v; \
	else \
		echo "❌ Entorno virtual no encontrado. Ejecuta 'make install' primero"; \
	fi

# Ver logs de PostgreSQL
logs:
	@echo "📋 Logs de PostgreSQL:"
	$(DOCKER_COMPOSE) logs -f db

# Limpiar archivos temporales
clean:
	@echo "🧹 Limpiando archivos temporales..."
	@find . -name "*.pyc" -delete
	@find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
	@find . -name "*.log" -delete 2>/dev/null || true
	@echo "✅ Limpieza completada"

# Limpieza completa
clean-all: clean
	@echo "🧹 Limpieza completa..."
	@$(DOCKER_COMPOSE) down -v --remove-orphans 2>/dev/null || true
	@docker system prune -f 2>/dev/null || true
	@rm -rf $(VENV) 2>/dev/null || true
	@echo "✅ Limpieza completa terminada"

# Verificar estado del sistema
status:
	@echo "📊 Estado del sistema:"
	@echo ""
	@echo "🔧 Entorno virtual:"
	@if [ -d $(VENV) ]; then \
		echo "  ✅ Creado"; \
	else \
		echo "  ❌ No creado"; \
	fi
	@echo ""
	@echo "🗄️  Base de datos:"
	@if [ -f audite.db ]; then \
		echo "  ✅ SQLite encontrada"; \
	fi
	@if docker ps | grep -q audite_postgres_dev; then \
		echo "  ✅ PostgreSQL corriendo"; \
	else \
		echo "  ❌ PostgreSQL no está corriendo"; \
	fi
	@echo ""
	@echo "⚙️  Configuración:"
	@if [ -f .env ]; then \
		echo "  ✅ .env encontrado"; \
		grep "^DATABASE_URL" .env | head -1; \
	else \
		echo "  ❌ .env no encontrado"; \
	fi 