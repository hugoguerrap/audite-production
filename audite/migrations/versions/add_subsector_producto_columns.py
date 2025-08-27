"""Agregar columnas subsector_id y producto_id a AgroDiagnostic

Revision ID: add_subsector_producto_columns
Revises: 6897f2cd6fa8
Create Date: 2024-04-01 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_subsector_producto_columns'
down_revision = '6897f2cd6fa8'
branch_labels = None
depends_on = None

def upgrade():
    # Agregar las nuevas columnas
    op.add_column('agro_diagnostic', sa.Column('subsector_id', sa.Integer(), nullable=True))
    op.add_column('agro_diagnostic', sa.Column('producto_id', sa.Integer(), nullable=True))
    op.add_column('agro_diagnostic', sa.Column('unidad_produccion', sa.String(20), nullable=True))
    op.add_column('agro_diagnostic', sa.Column('tiene_certificacion', sa.Boolean(), default=False))
    op.add_column('agro_diagnostic', sa.Column('tiene_mantenimiento', sa.Boolean(), default=False))
    op.add_column('agro_diagnostic', sa.Column('tiene_automatizacion', sa.Boolean(), default=False))
    op.add_column('agro_diagnostic', sa.Column('observaciones', sa.Text(), nullable=True))
    
    # Renombrar columnas existentes para mantener consistencia
    op.alter_column('agro_diagnostic', 'area_cultivo', new_column_name='area_instalacion')
    op.alter_column('agro_diagnostic', 'consumo_riego', new_column_name='consumo_campo')
    op.alter_column('agro_diagnostic', 'consumo_climatizacion', new_column_name='consumo_planta')
    op.alter_column('agro_diagnostic', 'consumo_refrigeracion', new_column_name='consumo_proceso')
    op.alter_column('agro_diagnostic', 'consumo_maquinaria', new_column_name='consumo_distribucion')
    
    # Agregar columnas de consumo faltantes
    op.add_column('agro_diagnostic', sa.Column('consumo_plantel', sa.Float(), nullable=True))
    op.add_column('agro_diagnostic', sa.Column('consumo_faenamiento', sa.Float(), nullable=True))
    
    # Agregar las foreign keys
    op.create_foreign_key('fk_agro_diagnostic_subsector', 'agro_diagnostic', 'agro_subsector', ['subsector_id'], ['id'])
    op.create_foreign_key('fk_agro_diagnostic_producto', 'agro_diagnostic', 'agro_product', ['producto_id'], ['id'])

def downgrade():
    # Eliminar las foreign keys
    op.drop_constraint('fk_agro_diagnostic_producto', 'agro_diagnostic', type_='foreignkey')
    op.drop_constraint('fk_agro_diagnostic_subsector', 'agro_diagnostic', type_='foreignkey')
    
    # Eliminar las columnas de consumo adicionales
    op.drop_column('agro_diagnostic', 'consumo_faenamiento')
    op.drop_column('agro_diagnostic', 'consumo_plantel')
    
    # Revertir los nombres de las columnas
    op.alter_column('agro_diagnostic', 'consumo_distribucion', new_column_name='consumo_maquinaria')
    op.alter_column('agro_diagnostic', 'consumo_proceso', new_column_name='consumo_refrigeracion')
    op.alter_column('agro_diagnostic', 'consumo_planta', new_column_name='consumo_climatizacion')
    op.alter_column('agro_diagnostic', 'consumo_campo', new_column_name='consumo_riego')
    op.alter_column('agro_diagnostic', 'area_instalacion', new_column_name='area_cultivo')
    
    # Eliminar las columnas agregadas
    op.drop_column('agro_diagnostic', 'observaciones')
    op.drop_column('agro_diagnostic', 'tiene_automatizacion')
    op.drop_column('agro_diagnostic', 'tiene_mantenimiento')
    op.drop_column('agro_diagnostic', 'tiene_certificacion')
    op.drop_column('agro_diagnostic', 'unidad_produccion')
    op.drop_column('agro_diagnostic', 'producto_id')
    op.drop_column('agro_diagnostic', 'subsector_id') 