/**
 * Formulario para crear y editar categorías de industria
 * Incluye preview, validación en tiempo real y selector de iconos
 */

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { 
  Save, 
  X, 
  Eye, 
  AlertTriangle, 
  CheckCircle2,
  Palette,
  Smile,
  Building2,
  Target
} from 'lucide-react';
import { CategoriaIndustria } from '@/types/industria';

interface CategoriaIndustriaFormProps {
  categoria?: CategoriaIndustria | null;
  onSave: (categoria: Partial<CategoriaIndustria>) => Promise<void>;
  onCancel: () => void;
  mode: 'create' | 'edit';
}

// Lista de iconos disponibles
const iconosDisponibles = [
  { emoji: '🏭', nombre: 'Fábrica' },
  { emoji: '🔧', nombre: 'Manufactura' },
  { emoji: '⚡', nombre: 'Energía' },
  { emoji: '🌱', nombre: 'Agricultura' },
  { emoji: '🥛', nombre: 'Alimentario' },
  { emoji: '🏗️', nombre: 'Construcción' },
  { emoji: '🚗', nombre: 'Automotriz' },
  { emoji: '💊', nombre: 'Farmacéutico' },
  { emoji: '👕', nombre: 'Textil' },
  { emoji: '📱', nombre: 'Tecnología' },
  { emoji: '🛒', nombre: 'Retail' },
  { emoji: '🏥', nombre: 'Servicios de Salud' },
  { emoji: '🏫', nombre: 'Educación' },
  { emoji: '🏨', nombre: 'Hotelería' },
  { emoji: '✈️', nombre: 'Transporte' },
  { emoji: '📦', nombre: 'Logística' },
  { emoji: '🏢', nombre: 'Oficinas' },
  { emoji: '🔬', nombre: 'Investigación' },
  { emoji: '⛽', nombre: 'Petróleo y Gas' },
  { emoji: '💎', nombre: 'Minería' }
];

// Lista de colores predefinidos
const coloresPredefinidos = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#6B7280', // Gray
  '#14B8A6', // Teal
  '#A855F7', // Violet
  '#F43F5E', // Rose
  '#22D3EE', // Light Blue
  '#65A30D', // Green 600
  '#DC2626'  // Red 600
];

const CategoriaIndustriaForm: React.FC<CategoriaIndustriaFormProps> = ({
  categoria,
  onSave,
  onCancel,
  mode
}) => {
  // Estados del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    icono: '🏭',
    color: '#3B82F6',
    activa: true,
    orden: 0
  });

  // Estados de validación y UI
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [guardando, setGuardando] = useState(false);
  const [mostrarPreview, setMostrarPreview] = useState(false);
  const [tabActiva, setTabActiva] = useState('basico');

  // Efecto para cargar datos de categoría existente
  useEffect(() => {
    if (categoria && mode === 'edit') {
      setFormData({
        nombre: categoria.nombre || '',
        descripcion: categoria.descripcion || '',
        icono: categoria.icono || '🏭',
        color: categoria.color || '#3B82F6',
        activa: categoria.activa ?? true,
        orden: categoria.orden || 0
      });
    }
  }, [categoria, mode]);

  // Función de validación
  const validarFormulario = (): boolean => {
    const nuevosErrores: Record<string, string> = {};

    // Validar nombre
    if (!formData.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es requerido';
    } else if (formData.nombre.length < 3) {
      nuevosErrores.nombre = 'El nombre debe tener al menos 3 caracteres';
    } else if (formData.nombre.length > 100) {
      nuevosErrores.nombre = 'El nombre no puede exceder 100 caracteres';
    }

    // Validar descripción
    if (formData.descripcion && formData.descripcion.length > 500) {
      nuevosErrores.descripcion = 'La descripción no puede exceder 500 caracteres';
    }

    // Validar color
    if (!formData.color || !/^#[0-9A-F]{6}$/i.test(formData.color)) {
      nuevosErrores.color = 'El color debe ser un código hexadecimal válido';
    }

    // Validar orden
    if (formData.orden < 0 || formData.orden > 999) {
      nuevosErrores.orden = 'El orden debe estar entre 0 y 999';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // Función para manejar cambios en el formulario
  const handleChange = (campo: string, valor: any) => {
    setFormData(prev => ({
      ...prev,
      [campo]: valor
    }));

    // Limpiar error del campo si existe
    if (errores[campo]) {
      setErrores(prev => {
        const nuevosErrores = { ...prev };
        delete nuevosErrores[campo];
        return nuevosErrores;
      });
    }
  };

  // Función para guardar
  const handleGuardar = async () => {
    if (!validarFormulario()) {
      return;
    }

    setGuardando(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error guardando categoría:', error);
    } finally {
      setGuardando(false);
    }
  };

  // Función para generar preview
  const generarPreview = () => {
    return (
      <Card className={`border-2 transition-all`} style={{ borderColor: formData.color }}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{formData.icono}</div>
            <div className="flex-1">
              <h3 className="font-medium">{formData.nombre || 'Nombre de la categoría'}</h3>
              {formData.descripcion && (
                <p className="text-sm text-gray-600 mt-1">{formData.descripcion}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={formData.activa ? "default" : "secondary"}>
                {formData.activa ? 'Disponible' : 'No disponible'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {mode === 'create' ? 'Nueva Categoría de Industria' : `Editar ${categoria?.nombre}`}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={tabActiva} onValueChange={setTabActiva} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basico">Información Básica</TabsTrigger>
            <TabsTrigger value="apariencia">Apariencia</TabsTrigger>
            <TabsTrigger value="preview">Vista Previa</TabsTrigger>
          </TabsList>

          {/* Tab: Información Básica */}
          <TabsContent value="basico" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre */}
              <div className="space-y-2">
                <Label htmlFor="nombre">
                  Nombre <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => handleChange('nombre', e.target.value)}
                  placeholder="Ej: Manufactura Industrial"
                  className={errores.nombre ? 'border-red-500' : ''}
                />
                {errores.nombre && (
                  <p className="text-sm text-red-500">{errores.nombre}</p>
                )}
              </div>

              {/* Orden */}
              <div className="space-y-2">
                <Label htmlFor="orden">Orden de visualización</Label>
                <Input
                  id="orden"
                  type="number"
                  min="0"
                  max="999"
                  value={formData.orden}
                  onChange={(e) => handleChange('orden', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className={errores.orden ? 'border-red-500' : ''}
                />
                {errores.orden && (
                  <p className="text-sm text-red-500">{errores.orden}</p>
                )}
              </div>
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => handleChange('descripcion', e.target.value)}
                placeholder="Describe brevemente esta categoría industrial..."
                rows={3}
                className={errores.descripcion ? 'border-red-500' : ''}
              />
              <div className="flex justify-between items-center">
                {errores.descripcion && (
                  <p className="text-sm text-red-500">{errores.descripcion}</p>
                )}
                <p className="text-sm text-gray-500 ml-auto">
                  {formData.descripcion.length}/500 caracteres
                </p>
              </div>
            </div>

            {/* Estado */}
            <div className="flex items-center space-x-2">
              <Switch
                id="activa"
                checked={formData.activa}
                onCheckedChange={(checked) => handleChange('activa', checked)}
              />
              <Label htmlFor="activa">Categoría activa (visible para usuarios)</Label>
            </div>
          </TabsContent>

          {/* Tab: Apariencia */}
          <TabsContent value="apariencia" className="space-y-6">
            {/* Selector de icono */}
            <div className="space-y-4">
              <Label className="flex items-center gap-2">
                <Smile className="h-4 w-4" />
                Icono de la categoría
              </Label>
              <div className="grid grid-cols-5 md:grid-cols-10 gap-2 max-h-40 overflow-y-auto p-4 border rounded-lg">
                {iconosDisponibles.map((icono) => (
                  <button
                    key={icono.emoji}
                    type="button"
                    onClick={() => handleChange('icono', icono.emoji)}
                    className={`
                      p-2 text-2xl rounded-lg border-2 transition-all hover:bg-gray-50
                      ${formData.icono === icono.emoji ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
                    `}
                    title={icono.nombre}
                  >
                    {icono.emoji}
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-600">
                Icono seleccionado: {formData.icono} 
                ({iconosDisponibles.find(i => i.emoji === formData.icono)?.nombre || 'Personalizado'})
              </p>
            </div>

            {/* Selector de color */}
            <div className="space-y-4">
              <Label className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Color de acento
              </Label>
              
              {/* Colores predefinidos */}
              <div className="grid grid-cols-8 gap-2">
                {coloresPredefinidos.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleChange('color', color)}
                    className={`
                      w-10 h-10 rounded-lg border-4 transition-all
                      ${formData.color === color ? 'border-gray-800 scale-110' : 'border-gray-300 hover:scale-105'}
                    `}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>

              {/* Input de color personalizado */}
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={formData.color}
                  onChange={(e) => handleChange('color', e.target.value)}
                  className="w-20 h-10"
                />
                <Input
                  type="text"
                  value={formData.color}
                  onChange={(e) => handleChange('color', e.target.value)}
                  placeholder="#3B82F6"
                  className={`flex-1 ${errores.color ? 'border-red-500' : ''}`}
                />
              </div>
              {errores.color && (
                <p className="text-sm text-red-500">{errores.color}</p>
              )}
            </div>
          </TabsContent>

          {/* Tab: Vista Previa */}
          <TabsContent value="preview" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Vista previa en selector público
              </h3>
              
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Así se verá tu categoría en el selector público de diagnósticos:
                </p>
                
                {generarPreview()}
                
                {/* Información adicional */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Información</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nombre:</span>
                        <span className="font-medium">{formData.nombre || 'Sin nombre'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Orden:</span>
                        <span className="font-medium">{formData.orden}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Estado:</span>
                        <Badge variant={formData.activa ? "default" : "secondary"} className="text-xs">
                          {formData.activa ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Apariencia</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Icono:</span>
                        <span className="text-xl">{formData.icono}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Color:</span>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded border"
                            style={{ backgroundColor: formData.color }}
                          />
                          <span className="font-mono text-xs">{formData.color}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Alertas de validación */}
        {Object.keys(errores).length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Por favor corrige los errores en el formulario antes de guardar.
            </AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={guardando}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleGuardar} disabled={guardando}>
            {guardando ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {mode === 'create' ? 'Crear Categoría' : 'Guardar Cambios'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CategoriaIndustriaForm; 