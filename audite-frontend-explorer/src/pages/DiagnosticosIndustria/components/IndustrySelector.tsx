/**
 * Componente para selección de categoría de industria
 * Muestra grid de categorías disponibles con iconos y colores
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { CategoriaIndustria } from '@/types/industria';
import { useIndustryCategories } from '../hooks/useIndustryCategories';

interface IndustrySelectorProps {
  onIndustrySelect?: (categoria: CategoriaIndustria) => void;
  selectedIndustry?: CategoriaIndustria | null;
  showOnlyActive?: boolean;
  mode?: 'grid' | 'list';
  allowClearSelection?: boolean;
}

const IndustrySelector: React.FC<IndustrySelectorProps> = ({ 
  onIndustrySelect,
  selectedIndustry,
  showOnlyActive = true,
  mode = 'grid',
  allowClearSelection = false
}) => {
  const { 
    categorias, 
    categoriasActivas, 
    loading, 
    error, 
    selectCategoria,
    clearSelection 
  } = useIndustryCategories();

  // Determinar qué categorías mostrar
  const categoriasAMostrar = showOnlyActive ? categoriasActivas : categorias;

  // Función para manejar selección
  const handleSelection = (categoria: CategoriaIndustria) => {
    selectCategoria(categoria);
    onIndustrySelect?.(categoria);
  };

  // Función para limpiar selección
  const handleClearSelection = () => {
    clearSelection();
    onIndustrySelect?.(null);
  };

  // Función para obtener ícono de categoría
  const getIconForCategory = (icono?: string) => {
    // Por ahora retorna texto, en el futuro se puede integrar con una librería de iconos
    return icono || '🏭';
  };

  // Función para generar estilo de color
  const getColorStyle = (color?: string) => {
    if (!color) return {};
    return {
      borderColor: color,
      backgroundColor: `${color}15`, // 15% opacity
    };
  };

  // Renderizado de estados de carga y error
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cargando Industrias...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={mode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-8 w-8" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error al cargar las categorías de industria: {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (categoriasAMostrar.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No hay categorías de industria disponibles en este momento.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              Selecciona tu Sector Industrial
              {selectedIndustry && <CheckCircle2 className="h-5 w-5 text-green-600" />}
            </CardTitle>
            <CardDescription>
              Obtén recomendaciones específicas para tu sector
            </CardDescription>
          </div>
          {allowClearSelection && selectedIndustry && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleClearSelection}
            >
              Limpiar Selección
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Mostrar selección actual */}
        {selectedIndustry && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getIconForCategory(selectedIndustry.icono)}</span>
              <div>
                <p className="font-medium text-green-800">{selectedIndustry.nombre}</p>
                <p className="text-sm text-green-600">{selectedIndustry.descripcion}</p>
              </div>
              <Badge variant="secondary" className="ml-auto">
                Seleccionado
              </Badge>
            </div>
          </div>
        )}

        {/* Grid o lista de categorías */}
        <div className={
          mode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' 
            : 'space-y-3'
        }>
          {categoriasAMostrar.map((categoria) => {
            const isSelected = selectedIndustry?.id === categoria.id;
            
            return (
              <div
                key={categoria.id}
                className={`
                  border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md
                  ${isSelected 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
                style={categoria.color ? getColorStyle(categoria.color) : {}}
                onClick={() => handleSelection(categoria)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelection(categoria);
                  }
                }}
                aria-label={`Seleccionar ${categoria.nombre}`}
              >
                <div className="flex items-start gap-3">
                  {/* Ícono de la categoría */}
                  <div className="text-2xl flex-shrink-0">
                    {getIconForCategory(categoria.icono)}
                  </div>
                  
                  {/* Información de la categoría */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-medium mb-1 ${isSelected ? 'text-blue-700' : 'text-gray-900'}`}>
                      {categoria.nombre}
                    </h3>
                    
                    {categoria.descripcion && (
                      <p className={`text-sm mb-2 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`}>
                        {categoria.descripcion}
                      </p>
                    )}

                    {/* Badges de estado */}
                    <div className="flex gap-2 flex-wrap">
                      {isSelected && (
                        <Badge variant="default" className="text-xs">
                          Seleccionado
                        </Badge>
                      )}
                      
                      {categoria.activa ? (
                        <Badge variant="secondary" className="text-xs">
                          Disponible
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          No Disponible
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Indicador visual de selección */}
                  {isSelected && (
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Información adicional */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Mostrando {categoriasAMostrar.length} {categoriasAMostrar.length === 1 ? 'categoría' : 'categorías'}
            {showOnlyActive && ' activas'}
          </p>
          {selectedIndustry && (
            <p className="text-sm text-blue-600 mt-1">
              Continúa para obtener un diagnóstico personalizado para {selectedIndustry.nombre}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default IndustrySelector; 