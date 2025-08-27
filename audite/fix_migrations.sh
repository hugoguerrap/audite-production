#!/bin/bash

echo "🔧 ARREGLANDO MIGRACIONES DE AUDITE"
echo "=================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Verificar que estamos en el directorio correcto
if [ ! -f "alembic.ini" ]; then
    echo -e "${RED}❌ Error: No se encontró alembic.ini${NC}"
    echo "Ejecuta este script desde el directorio audite/"
    exit 1
fi

echo -e "${GREEN}✅ Directorio correcto encontrado${NC}"

# 2. Crear backup de migraciones actuales
echo -e "${YELLOW}📦 Creando backup de migraciones...${NC}"
mkdir -p backups/migrations_$(date +%Y%m%d_%H%M%S)
cp -r alembic/versions/* backups/migrations_$(date +%Y%m%d_%H%M%S)/ 2>/dev/null || true

# 3. Activar entorno virtual si existe
if [ -d "venv" ]; then
    echo -e "${YELLOW}🔄 Activando entorno virtual...${NC}"
    source venv/bin/activate
elif [ -d "../venv" ]; then
    echo -e "${YELLOW}🔄 Activando entorno virtual...${NC}"
    source ../venv/bin/activate
else
    echo -e "${YELLOW}⚠️  No se encontró entorno virtual${NC}"
fi

# 4. Verificar si alembic está disponible
if ! command -v alembic &> /dev/null; then
    echo -e "${RED}❌ Alembic no encontrado. Instalando...${NC}"
    pip install alembic
fi

# 5. Verificar estado actual
echo -e "${YELLOW}🔍 Verificando estado de migraciones...${NC}"
alembic current || echo "No hay versión actual"

# 6. Verificar múltiples heads
echo -e "${YELLOW}🔗 Verificando heads...${NC}"
HEADS=$(alembic heads)
HEAD_COUNT=$(echo "$HEADS" | wc -l)

if [ $HEAD_COUNT -gt 1 ]; then
    echo -e "${RED}⚠️  Múltiples heads detectados:${NC}"
    echo "$HEADS"
    
    # 7. Resolver múltiples heads automáticamente
    echo -e "${YELLOW}🔄 Resolviendo múltiples heads...${NC}"
    alembic merge heads -m "resolve_multiple_heads_$(date +%Y%m%d)"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Heads resueltos exitosamente${NC}"
    else
        echo -e "${RED}❌ Error al resolver heads${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Solo un head encontrado${NC}"
fi

# 8. Aplicar migraciones pendientes
echo -e "${YELLOW}🚀 Aplicando migraciones...${NC}"
alembic upgrade head

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Migraciones aplicadas exitosamente${NC}"
else
    echo -e "${RED}❌ Error al aplicar migraciones${NC}"
    echo -e "${YELLOW}💡 Soluciones posibles:${NC}"
    echo "   1. Verificar conexión a la base de datos"
    echo "   2. Revisar DATABASE_URL en variables de entorno"
    echo "   3. Ejecutar manualmente: alembic stamp head"
fi

# 9. Mostrar estado final
echo -e "${YELLOW}📊 Estado final:${NC}"
alembic current
alembic heads

echo -e "${GREEN}🎉 Proceso completado${NC}"
echo -e "${YELLOW}💡 Si sigues teniendo problemas:${NC}"
echo "   1. Revisa los logs arriba"
echo "   2. Verifica tu DATABASE_URL"  
echo "   3. Considera usar: alembic stamp head (como último recurso)"