"""initial_clean_schema

Revision ID: 001_initial_clean
Revises: 
Create Date: 2025-08-23 14:43:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '001_initial_clean'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create complete schema from scratch."""
    
    # === TABLAS PRINCIPALES ===
    
    # Users table
    op.create_table('users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('hashed_password', sa.String(), nullable=False),
        sa.Column('nombre', sa.String(length=100), nullable=True),
        sa.Column('empresa', sa.String(length=100), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True, default=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)

    # === AUDITORÍAS ===
    
    # Auditorías básicas
    op.create_table('auditorias_basicas',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('usuario_id', sa.Integer(), nullable=True),
        sa.Column('nombre_empresa', sa.String(length=100), nullable=False),
        sa.Column('sector', sa.String(length=50), nullable=False),
        sa.Column('tamano_instalacion', sa.Float(), nullable=False),
        sa.Column('num_empleados', sa.Integer(), nullable=False),
        sa.Column('consumo_anual', sa.Float(), nullable=False),
        sa.Column('factura_mensual', sa.Float(), nullable=False),
        sa.Column('tiene_auditoria_previa', sa.Boolean(), nullable=True, default=False),
        sa.Column('fuentes_energia', sa.JSON(), nullable=False),
        sa.Column('datos_equipos', sa.JSON(), nullable=True),
        sa.Column('notas', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        # Campos adicionales
        sa.Column('ip_address', sa.String(45), nullable=True),
        sa.Column('is_complete', sa.Boolean(), default=False, server_default='false'),
        sa.Column('equipment_age', sa.String(50), nullable=True),
        sa.Column('renewable_energy', sa.Boolean(), default=False, server_default='false'),
        sa.Column('energy_priorities', sa.String(200), nullable=True),
        sa.Column('savings_target', sa.Float(), nullable=True),
        sa.Column('implementation_budget', sa.String(50), nullable=True),
        # Campos calculados
        sa.Column('intensidad_energetica', sa.Float(), nullable=True),
        sa.Column('consumo_por_empleado', sa.Float(), nullable=True),
        sa.Column('costo_por_empleado', sa.Float(), nullable=True),
        sa.Column('potencial_ahorro', sa.Float(), nullable=True),
        sa.Column('puntuacion_eficiencia', sa.Float(), nullable=True),
        sa.Column('distribucion_consumo', sa.JSON(), nullable=True),
        sa.Column('comparacion_benchmark', sa.JSON(), nullable=True),
        sa.ForeignKeyConstraint(['usuario_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_auditorias_basicas_id'), 'auditorias_basicas', ['id'], unique=False)

    # Auditorías agro
    op.create_table('auditorias_agro',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('usuario_id', sa.Integer(), nullable=False),
        sa.Column('nombre_proyecto', sa.String(length=100), nullable=False),
        sa.Column('ubicacion', sa.String(length=100), nullable=False),
        sa.Column('area_total', sa.Float(), nullable=False),
        sa.Column('tipo_cultivo', sa.String(length=50), nullable=False),
        sa.Column('produccion_anual', sa.Float(), nullable=False),
        sa.Column('unidad_produccion', sa.String(length=20), nullable=False),
        sa.Column('consumo_electrico', sa.Float(), nullable=False),
        sa.Column('consumo_combustible', sa.Float(), nullable=False),
        sa.Column('consumo_agua', sa.Float(), nullable=False),
        # Consumos por etapa
        sa.Column('consumo_campo', sa.Float(), nullable=True),
        sa.Column('consumo_planta', sa.Float(), nullable=True),
        sa.Column('consumo_plantel', sa.Float(), nullable=True),
        sa.Column('consumo_faenamiento', sa.Float(), nullable=True),
        sa.Column('consumo_proceso', sa.Float(), nullable=True),
        sa.Column('consumo_distribucion', sa.Float(), nullable=True),
        # Equipamiento
        sa.Column('equipos', sa.JSON(), nullable=True),
        sa.Column('sistemas_riego', sa.JSON(), nullable=True),
        # Características
        sa.Column('tiene_certificacion', sa.Boolean(), default=False, server_default='false'),
        sa.Column('tiene_mantenimiento', sa.Boolean(), default=False, server_default='false'),
        sa.Column('tiene_automatizacion', sa.Boolean(), default=False, server_default='false'),
        sa.Column('observaciones', sa.Text(), nullable=True),
        # Timestamps
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        # Campos calculados
        sa.Column('consumo_total', sa.Float(), nullable=True),
        sa.Column('kpi_por_produccion', sa.Float(), nullable=True),
        sa.Column('kpi_por_area', sa.Float(), nullable=True),
        sa.Column('distribucion_consumo', sa.JSON(), nullable=True),
        sa.Column('potencial_ahorro', sa.Float(), nullable=True),
        sa.Column('puntuacion_eficiencia', sa.Float(), nullable=True),
        sa.Column('comparacion_benchmark', sa.JSON(), nullable=True),
        sa.Column('huella_carbono', sa.Float(), nullable=True),
        sa.Column('eficiencia_riego', sa.Float(), nullable=True),
        sa.Column('costo_energia_por_produccion', sa.Float(), nullable=True),
        sa.ForeignKeyConstraint(['usuario_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_auditorias_agro_id'), 'auditorias_agro', ['id'], unique=False)

    # === DATOS AGROPECUARIOS ===
    
    # Agro Industry Types
    op.create_table('agro_industry_type',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('sector', sa.String(), nullable=False),
        sa.Column('subsector', sa.String(), nullable=False),
        sa.Column('producto', sa.String(), nullable=False),
        sa.Column('kpi1_unidad', sa.String(), nullable=True),
        sa.Column('kpi2_unidad', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_agro_industry_type_id'), 'agro_industry_type', ['id'], unique=False)

    # Agro Equipment
    op.create_table('agro_equipment',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('sector', sa.String(), nullable=False),
        sa.Column('equipo', sa.String(), nullable=False),
        sa.Column('fuentes_energia', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_agro_equipment_id'), 'agro_equipment', ['id'], unique=False)

    # Agro Process
    op.create_table('agro_process',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('etapa', sa.String(), nullable=False),
        sa.Column('nombre', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_agro_process_id'), 'agro_process', ['id'], unique=False)

    # Agro Equipment Category
    op.create_table('agro_equipment_category',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('categoria', sa.String(), nullable=False),
        sa.Column('equipo_especifico', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_agro_equipment_category_id'), 'agro_equipment_category', ['id'], unique=False)

    # Agro Etapa Subsector
    op.create_table('agro_etapa_subsector',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('etapa', sa.String(length=100), nullable=False),
        sa.Column('subsector', sa.String(length=100), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_agro_etapa_subsector_id'), 'agro_etapa_subsector', ['id'], unique=False)

    # === RECOMENDACIONES ===
    
    op.create_table('recomendaciones',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('auditoria_basica_id', sa.Integer(), nullable=True),
        sa.Column('auditoria_agro_id', sa.Integer(), nullable=True),
        sa.Column('categoria', sa.String(length=50), nullable=False),
        sa.Column('titulo', sa.String(length=100), nullable=False),
        sa.Column('descripcion', sa.Text(), nullable=False),
        sa.Column('ahorro_estimado', sa.Float(), nullable=True),
        sa.Column('costo_implementacion', sa.String(length=20), nullable=True),
        sa.Column('periodo_retorno', sa.Float(), nullable=True),
        sa.Column('prioridad', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['auditoria_basica_id'], ['auditorias_basicas.id'], ),
        sa.ForeignKeyConstraint(['auditoria_agro_id'], ['auditorias_agro.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_recomendaciones_id'), 'recomendaciones', ['id'], unique=False)

    # === SISTEMA DE PANEL DE CONTROL ===
    
    # Sectores Industriales
    op.create_table('sectores_industriales',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('nombre', sa.String(), nullable=True),
        sa.Column('descripcion', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_sectores_industriales_id'), 'sectores_industriales', ['id'], unique=False)
    op.create_index(op.f('ix_sectores_industriales_nombre'), 'sectores_industriales', ['nombre'], unique=True)

    # Benchmarks
    op.create_table('benchmarks',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('sector_id', sa.Integer(), nullable=True),
        sa.Column('consumo_promedio', sa.Float(), nullable=True),
        sa.Column('consumo_optimo', sa.Float(), nullable=True),
        sa.Column('unidad_medida', sa.String(), nullable=True),
        sa.Column('año', sa.Integer(), nullable=True),
        sa.Column('fuente', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['sector_id'], ['sectores_industriales.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_benchmarks_id'), 'benchmarks', ['id'], unique=False)

    # Tipos de Equipos
    op.create_table('tipos_equipos',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('nombre', sa.String(), nullable=True),
        sa.Column('categoria', sa.String(), nullable=True),
        sa.Column('descripcion', sa.String(), nullable=True),
        sa.Column('potencia_tipica', sa.Float(), nullable=True),
        sa.Column('unidad_potencia', sa.String(), nullable=True),
        sa.Column('eficiencia_tipica', sa.Float(), nullable=True),
        sa.Column('vida_util', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_tipos_equipos_id'), 'tipos_equipos', ['id'], unique=False)
    op.create_index(op.f('ix_tipos_equipos_nombre'), 'tipos_equipos', ['nombre'], unique=True)

    # Plantillas de Recomendaciones
    op.create_table('plantillas_recomendaciones',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('categoria', sa.String(), nullable=True),
        sa.Column('titulo', sa.String(), nullable=True),
        sa.Column('descripcion', sa.String(), nullable=True),
        sa.Column('ahorro_estimado_min', sa.Float(), nullable=True),
        sa.Column('ahorro_estimado_max', sa.Float(), nullable=True),
        sa.Column('costo_implementacion', sa.String(), nullable=True),
        sa.Column('periodo_retorno_tipico', sa.Float(), nullable=True),
        sa.Column('prioridad', sa.Integer(), nullable=True),
        sa.Column('condiciones_aplicacion', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_plantillas_recomendaciones_id'), 'plantillas_recomendaciones', ['id'], unique=False)

    # Parámetros del Sistema
    op.create_table('parametros_sistema',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('categoria', sa.String(), nullable=True),
        sa.Column('nombre', sa.String(), nullable=True),
        sa.Column('valor', sa.JSON(), nullable=True),
        sa.Column('descripcion', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_parametros_sistema_id'), 'parametros_sistema', ['id'], unique=False)

    # === DIAGNÓSTICOS DE FERIA ===
    
    op.create_table('diagnosticos_feria',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('access_code', sa.String(length=8), nullable=True),
        sa.Column('contact_info', sa.JSON(), nullable=False),
        sa.Column('estado', sa.String(length=50), nullable=False, default='CONTACTO_INICIADO'),
        # Datos del diagnóstico
        sa.Column('background', sa.JSON(), nullable=True),
        sa.Column('production', sa.JSON(), nullable=True),
        sa.Column('equipment', sa.JSON(), nullable=True),
        sa.Column('renewable', sa.JSON(), nullable=True),
        sa.Column('volume', sa.JSON(), nullable=True),
        sa.Column('meta_data', sa.JSON(), nullable=True),
        # Resultados calculados
        sa.Column('intensidad_energetica', sa.Float(), nullable=True),
        sa.Column('costo_energia_anual', sa.Float(), nullable=True),
        sa.Column('potencial_ahorro', sa.Float(), nullable=True),
        sa.Column('puntuacion_eficiencia', sa.Float(), nullable=True),
        sa.Column('comparacion_sector', sa.JSON(), nullable=True),
        sa.Column('recomendaciones', sa.JSON(), nullable=True),
        # URLs
        sa.Column('pdf_url', sa.String(), nullable=True),
        sa.Column('view_url', sa.String(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_diagnosticos_feria_id'), 'diagnosticos_feria', ['id'], unique=False)
    op.create_index(op.f('ix_diagnosticos_feria_access_code'), 'diagnosticos_feria', ['access_code'], unique=True)

    # === AUTODIAGNÓSTICO ===
    
    # Preguntas de autodiagnóstico
    op.create_table('autodiagnostico_preguntas',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('numero_orden', sa.Integer(), nullable=False),
        sa.Column('pregunta', sa.Text(), nullable=False),
        sa.Column('tipo_respuesta', sa.String(length=50), nullable=False),
        sa.Column('es_obligatoria', sa.Boolean(), nullable=True, default=True),
        sa.Column('es_activa', sa.Boolean(), nullable=True, default=True),
        sa.Column('ayuda_texto', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('numero_orden')
    )
    op.create_index(op.f('ix_autodiagnostico_preguntas_id'), 'autodiagnostico_preguntas', ['id'], unique=False)

    # Opciones de autodiagnóstico
    op.create_table('autodiagnostico_opciones',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('pregunta_id', sa.Integer(), nullable=False),
        sa.Column('texto_opcion', sa.String(length=200), nullable=False),
        sa.Column('valor', sa.String(length=100), nullable=False),
        sa.Column('es_por_defecto', sa.Boolean(), nullable=True, default=False),
        sa.Column('es_especial', sa.Boolean(), nullable=True, default=False),
        sa.Column('orden', sa.Integer(), nullable=False),
        sa.Column('es_activa', sa.Boolean(), nullable=True, default=True),
        sa.Column('tiene_sugerencia', sa.Boolean(), nullable=True, default=False),
        sa.Column('sugerencia', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['pregunta_id'], ['autodiagnostico_preguntas.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_autodiagnostico_opciones_id'), 'autodiagnostico_opciones', ['id'], unique=False)

    # Respuestas de autodiagnóstico
    op.create_table('autodiagnostico_respuestas',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('session_id', sa.String(length=100), nullable=False),
        sa.Column('pregunta_id', sa.Integer(), nullable=False),
        sa.Column('respuesta_texto', sa.Text(), nullable=True),
        sa.Column('respuesta_numero', sa.Float(), nullable=True),
        sa.Column('opciones_seleccionadas', sa.JSON(), nullable=True),
        sa.Column('opcion_seleccionada', sa.String(length=100), nullable=True),
        sa.Column('archivo_adjunto', sa.String(), nullable=True),
        sa.Column('ip_address', sa.String(length=45), nullable=True),
        sa.Column('user_agent', sa.String(length=500), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['pregunta_id'], ['autodiagnostico_preguntas.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_autodiagnostico_respuestas_id'), 'autodiagnostico_respuestas', ['id'], unique=False)
    op.create_index(op.f('ix_autodiagnostico_respuestas_session_id'), 'autodiagnostico_respuestas', ['session_id'], unique=False)

    # === FORMULARIOS POR INDUSTRIA ===
    
    # Categorías de Industria
    op.create_table('categorias_industria',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('nombre', sa.String(length=100), nullable=False),
        sa.Column('descripcion', sa.Text(), nullable=True),
        sa.Column('icono', sa.String(length=50), nullable=True),
        sa.Column('color', sa.String(length=7), nullable=True),
        sa.Column('activa', sa.Boolean(), server_default='true', nullable=True),
        sa.Column('orden', sa.Integer(), nullable=False, default=0),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_categorias_industria_id'), 'categorias_industria', ['id'], unique=False)
    op.create_index(op.f('ix_categorias_industria_nombre'), 'categorias_industria', ['nombre'], unique=False)

    # Formularios de Industria
    op.create_table('formularios_industria',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('categoria_id', sa.Integer(), nullable=False),
        sa.Column('nombre', sa.String(length=200), nullable=False),
        sa.Column('descripcion', sa.Text(), nullable=True),
        sa.Column('activo', sa.Boolean(), server_default='true', nullable=True),
        sa.Column('orden', sa.Integer(), nullable=False, default=0),
        sa.Column('tiempo_estimado', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['categoria_id'], ['categorias_industria.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_formularios_industria_id'), 'formularios_industria', ['id'], unique=False)

    # Preguntas de Formulario (con soporte condicional)
    op.create_table('preguntas_formulario',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('formulario_id', sa.Integer(), nullable=False),
        sa.Column('texto', sa.Text(), nullable=False),
        sa.Column('subtitulo', sa.Text(), nullable=True),
        sa.Column('tipo', sa.String(length=50), nullable=False),
        sa.Column('opciones', sa.JSON(), nullable=True),
        sa.Column('tiene_opcion_otro', sa.Boolean(), server_default='false', nullable=True),
        sa.Column('placeholder_otro', sa.String(length=200), nullable=True),
        sa.Column('orden', sa.Integer(), nullable=False, default=0),
        sa.Column('requerida', sa.Boolean(), server_default='true', nullable=True),
        sa.Column('activa', sa.Boolean(), server_default='true', nullable=True),
        # Campos condicionales
        sa.Column('pregunta_padre_id', sa.Integer(), nullable=True),
        sa.Column('condicion_valor', sa.JSON(), nullable=True),
        sa.Column('condicion_operador', sa.String(length=20), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['formulario_id'], ['formularios_industria.id'], ),
        sa.ForeignKeyConstraint(['pregunta_padre_id'], ['preguntas_formulario.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_preguntas_formulario_id'), 'preguntas_formulario', ['id'], unique=False)

    # Respuestas de Formulario
    op.create_table('respuestas_formulario',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('session_id', sa.String(length=100), nullable=False),
        sa.Column('pregunta_id', sa.Integer(), nullable=False),
        sa.Column('valor_respuesta', sa.JSON(), nullable=True),
        sa.Column('valor_otro', sa.Text(), nullable=True),
        sa.Column('ip_address', sa.String(length=45), nullable=True),
        sa.Column('user_agent', sa.String(length=500), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['pregunta_id'], ['preguntas_formulario.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_respuestas_formulario_id'), 'respuestas_formulario', ['id'], unique=False)
    op.create_index(op.f('ix_respuestas_formulario_session_id'), 'respuestas_formulario', ['session_id'], unique=False)

    # === TABLAS DE RELACIÓN ===
    
    # Equipment Process (Many-to-Many)
    op.create_table('equipment_process',
        sa.Column('equipment_id', sa.Integer(), nullable=False),
        sa.Column('process_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['equipment_id'], ['agro_equipment.id'], ),
        sa.ForeignKeyConstraint(['process_id'], ['agro_process.id'], ),
        sa.PrimaryKeyConstraint('equipment_id', 'process_id')
    )

    # Proceso Producto
    op.create_table('proceso_producto',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('proceso_id', sa.Integer(), nullable=False),
        sa.Column('producto_id', sa.Integer(), nullable=False),
        sa.Column('consumo_referencia', sa.Float(), nullable=True),
        sa.Column('unidad_consumo', sa.String(length=50), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['proceso_id'], ['agro_process.id'], ),
        sa.ForeignKeyConstraint(['producto_id'], ['agro_industry_type.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('proceso_id', 'producto_id', name='uq_proceso_producto')
    )

    # Consumo por Fuente
    op.create_table('consumo_por_fuente',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('auditoria_id', sa.Integer(), nullable=False),
        sa.Column('equipo_id', sa.Integer(), nullable=False),
        sa.Column('fuente_energia', sa.String(length=50), nullable=False),
        sa.Column('consumo', sa.Float(), nullable=False),
        sa.Column('unidad', sa.String(length=20), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['auditoria_id'], ['auditorias_agro.id'], ),
        sa.ForeignKeyConstraint(['equipo_id'], ['agro_equipment.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('auditoria_id', 'equipo_id', 'fuente_energia', name='uq_consumo_fuente')
    )


def downgrade() -> None:
    """Drop all tables."""
    op.drop_table('consumo_por_fuente')
    op.drop_table('proceso_producto')
    op.drop_table('equipment_process')
    op.drop_table('respuestas_formulario')
    op.drop_table('preguntas_formulario')
    op.drop_table('formularios_industria')
    op.drop_table('categorias_industria')
    op.drop_table('autodiagnostico_respuestas')
    op.drop_table('autodiagnostico_opciones')
    op.drop_table('autodiagnostico_preguntas')
    op.drop_table('diagnosticos_feria')
    op.drop_table('parametros_sistema')
    op.drop_table('plantillas_recomendaciones')
    op.drop_table('tipos_equipos')
    op.drop_table('benchmarks')
    op.drop_table('sectores_industriales')
    op.drop_table('recomendaciones')
    op.drop_table('agro_etapa_subsector')
    op.drop_table('agro_equipment_category')
    op.drop_table('agro_process')
    op.drop_table('agro_equipment')
    op.drop_table('agro_industry_type')
    op.drop_table('auditorias_agro')
    op.drop_table('auditorias_basicas')
    op.drop_table('users')