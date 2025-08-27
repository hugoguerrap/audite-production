/**
 * Formulario para crear y editar formularios de industria
 * Incluye validación, selector de categoría y opción de duplicación
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
  FileText,
  Building2,
  Clock,
  Copy,
  Info,
  Target
} from 'lucide-react';
import { FormularioIndustria, CategoriaIndustria } from '@/types/industria';
import { useIndustryCategories } from '../../../DiagnosticosIndustria/hooks/useIndustryCategories';
import { useAdminFormularios } from '../hooks/useAdminFormularios';

interface FormularioIndustriaFormProps {
  formulario?: FormularioIndustria | null;
  onSave: (formulario: Partial<FormularioIndustria>) => Promise<void>;
  onCancel: () => void;
  mode: 'create' | 'edit';
}

const FormularioIndustriaForm: React.FC<FormularioIndustriaFormProps> = ({
  formulario,
  onSave,
  onCancel,
  mode
}) => {
  // Estados del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    categoria_id: 0,
    tiempo_estimado: 10,
    activo: true,
    duplicar_desde: 0 // Para la opción de duplicar
  });

  // Estados de validación y UI
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [guardando, setGuardando] = useState(false);
  const [tabActiva, setTabActiva] = useState('basico');
  const [mostrarDuplicacion, setMostrarDuplicacion] = useState(false);

  // Hooks
  const { categorias, loading: loadingCategorias } = useIndustryCategories();
  const { formularios: formulariosDisponibles, loading: loadingFormularios } = useAdminFormularios();

  // Efecto para cargar datos de formulario existente
  useEffect(() => {
    if (formulario && mode === 'edit') {
      setFormData({
        nombre: formulario.nombre || '',
        descripcion: formulario.descripcion || '',
        categoria_id: formulario.categoria_id || 0,
        tiempo_estimado: formulario.tiempo_estimado || 10,
        activo: formulario.activo ?? true,
        duplicar_desde: 0
      });
    }
  }, [formulario, mode]);

  // Función de validación
  const validarFormulario = (): boolean => {
    const nuevosErrores: Record<string, string> = {};

    // Validar nombre
    if (!formData.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es requerido';
    } else if (formData.nombre.length < 3) {
      nuevosErrores.nombre = 'El nombre debe tener al menos 3 caracteres';
    } else if (formData.nombre.length > 200) {
      nuevosErrores.nombre = 'El nombre no puede exceder 200 caracteres';
    }

    // Validar descripción
    if (formData.descripcion && formData.descripcion.length > 1000) {
      nuevosErrores.descripcion = 'La descripción no puede exceder 1000 caracteres';
    }

    // Validar categoría
    if (!formData.categoria_id || formData.categoria_id === 0) {
      nuevosErrores.categoria_id = 'Debe seleccionar una categoría de industria';
    }

    // Validar tiempo estimado
    if (formData.tiempo_estimado < 1 || formData.tiempo_estimado > 120) {
      nuevosErrores.tiempo_estimado = 'El tiempo estimado debe estar entre 1 y 120 minutos';
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
      const datosParaGuardar = { ...formData };
      
      // Remover campo duplicar_desde si no se está usando
      if (!mostrarDuplicacion || !datosParaGuardar.duplicar_desde) {
        delete datosParaGuardar.duplicar_desde;
      }

      await onSave(datosParaGuardar);
    } catch (error) {
      console.error('Error guardando formulario:', error);
    } finally {
      setGuardando(false);
    }
  };

  // Función para obtener categoría por ID
  const getCategoria = (categoriaId: number): CategoriaIndustria | undefined => {
    return categorias.find(c => c.id === categoriaId);
  };

  // Función para obtener formularios de la misma categoría para duplicación
  const getFormulariosMismaCategoria = () => {
    if (!formData.categoria_id) return [];
    
    return formulariosDisponibles.filter(f => 
      f.categoria_id === formData.categoria_id &&
      f.id !== formulario?.id // Excluir el formulario actual si es edición
    );
  };

  // Función para cargar datos de formulario a duplicar
  const handleSeleccionarFormularioDuplicar = (formularioId: number) => {
    const formularioADuplicar = formulariosDisponibles.find(f => f.id === formularioId);
    if (formularioADuplicar) {
      setFormData(prev => ({
        ...prev,
        // Mantener datos básicos pero copiar estructura
        tiempo_estimado: formularioADuplicar.tiempo_estimado || prev.tiempo_estimado,
        duplicar_desde: formularioId
      }));
    }
  };

  // Función para generar preview
  const generarPreview = () => {
    const categoria = getCategoria(formData.categoria_id);
    
    return (
      <Card className="border-2 border-blue-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {categoria && (
                <div className="text-2xl">{categoria.icono}</div>
              )}
              <div>
                <CardTitle className="text-lg">
                  {formData.nombre || 'Nombre del formulario'}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {categoria?.nombre || 'Categoría no seleccionada'}
                </p>
              </div>
            </div>
            <Badge variant={formData.activo ? "default" : "secondary"}>
              {formData.activo ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {formData.descripcion && (
            <p className="text-sm text-gray-600">{formData.descripcion}</p>
          )}
          
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{formData.tiempo_estimado} min</span>
            </div>
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>Formulario de diagnóstico</span>
            </div>
          </div>

          {mostrarDuplicacion && formData.duplicar_desde > 0 && (
            <div className="border-t pt-3">
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <Copy className="h-4 w-4" />
                <span>Se duplicará estructura de formulario existente</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {mode === 'create' ? 'Nuevo Formulario de Industria' : `Editar ${formulario?.nombre}`}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={tabActiva} onValueChange={setTabActiva} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basico">Información Básica</TabsTrigger>
            <TabsTrigger value="configuracion">Configuración</TabsTrigger>
            {mode === 'create' && (
              <TabsTrigger value="duplicacion">Duplicar Existente</TabsTrigger>
            )}
            <TabsTrigger value="preview">Vista Previa</TabsTrigger>
          </TabsList>

          {/* Tab: Información Básica */}
          <TabsContent value="basico" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre */}
              <div className="space-y-2">
                <Label htmlFor="nombre">
                  Nombre del formulario <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => handleChange('nombre', e.target.value)}
                  placeholder="Ej: Diagnóstico Energético Industrial"
                  className={errores.nombre ? 'border-red-500' : ''}
                />
                {errores.nombre && (
                  <p className="text-sm text-red-500">{errores.nombre}</p>
                )}
              </div>

              {/* Categoría */}
              <div className="space-y-2">
                <Label htmlFor="categoria">
                  Categoría de industria <span className="text-red-500">*</span>
                </Label>
                <Select 
                  value={formData.categoria_id.toString()} 
                  onValueChange={(value) => handleChange('categoria_id', Number(value))}
                >
                  <SelectTrigger className={errores.categoria_id ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map(categoria => (
                      <SelectItem key={categoria.id} value={categoria.id.toString()}>
                        <div className="flex items-center gap-2">
                          <span>{categoria.icono}</span>
                          <span>{categoria.nombre}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errores.categoria_id && (
                  <p className="text-sm text-red-500">{errores.categoria_id}</p>
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
                placeholder="Describe el propósito y alcance de este formulario de diagnóstico..."
                rows={4}
                className={errores.descripcion ? 'border-red-500' : ''}
              />
              <div className="flex justify-between items-center">
                {errores.descripcion && (
                  <p className="text-sm text-red-500">{errores.descripcion}</p>
                )}
                <p className="text-sm text-gray-500 ml-auto">
                  {formData.descripcion.length}/1000 caracteres
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Tab: Configuración */}
          <TabsContent value="configuracion" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tiempo estimado */}
              <div className="space-y-2">
                <Label htmlFor="tiempo_estimado">Tiempo estimado (minutos)</Label>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <Input
                    id="tiempo_estimado"
                    type="number"
                    min="1"
                    max="120"
                    value={formData.tiempo_estimado}
                    onChange={(e) => handleChange('tiempo_estimado', parseInt(e.target.value) || 10)}
                    className={errores.tiempo_estimado ? 'border-red-500' : ''}
                  />
                  <span className="text-sm text-gray-500">min</span>
                </div>
                {errores.tiempo_estimado && (
                  <p className="text-sm text-red-500">{errores.tiempo_estimado}</p>
                )}
                <p className="text-xs text-gray-500">
                  Tiempo promedio que toma completar el formulario
                </p>
              </div>

              {/* Estado */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="activo"
                    checked={formData.activo}
                    onCheckedChange={(checked) => handleChange('activo', checked)}
                  />
                  <Label htmlFor="activo">Formulario activo</Label>
                </div>
                <div className="text-sm text-gray-600 pl-6">
                  Los formularios activos están disponibles para los usuarios en la plataforma pública
                </div>
              </div>
            </div>

            {/* Información adicional */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Configuración avanzada
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <Target className="h-4 w-4 mt-0.5 text-blue-500" />
                  <div>
                    <p className="font-medium">Preguntas dinámicas</p>
                    <p>Podrás agregar preguntas con lógica condicional después de crear el formulario</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500" />
                  <div>
                    <p className="font-medium">Sugerencias automáticas</p>
                    <p>El sistema generará sugerencias personalizadas basadas en las respuestas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Duplicación (solo en modo create) */}
          {mode === 'create' && (
            <TabsContent value="duplicacion" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="mostrar_duplicacion"
                    checked={mostrarDuplicacion}
                    onCheckedChange={setMostrarDuplicacion}
                  />
                  <Label htmlFor="mostrar_duplicacion">Duplicar desde formulario existente</Label>
                </div>

                {mostrarDuplicacion && (
                  <div className="space-y-4 pl-6">
                    <p className="text-sm text-gray-600">
                      Selecciona un formulario existente para copiar su estructura de preguntas
                    </p>

                    {formData.categoria_id > 0 ? (
                      <div className="space-y-2">
                        <Label>Formularios disponibles en la misma categoría:</Label>
                        <Select 
                          value={formData.duplicar_desde.toString()} 
                          onValueChange={(value) => handleSeleccionarFormularioDuplicar(Number(value))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar formulario a duplicar" />
                          </SelectTrigger>
                          <SelectContent>
                            {getFormulariosMismaCategoria().map(form => (
                              <SelectItem key={form.id} value={form.id.toString()}>
                                <div className="flex items-center justify-between w-full">
                                  <span>{form.nombre}</span>
                                  <Badge variant="outline" className="ml-2">
                                    {form.preguntas_count || 0} preguntas
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        {getFormulariosMismaCategoria().length === 0 && (
                          <p className="text-sm text-gray-500">
                            No hay otros formularios en esta categoría para duplicar
                          </p>
                        )}
                      </div>
                    ) : (
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          Primero selecciona una categoría de industria en la pestaña "Información Básica"
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
          )}

          {/* Tab: Vista Previa */}
          <TabsContent value="preview" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Vista previa del formulario
              </h3>
              
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Así se verá tu formulario en la plataforma pública:
                </p>
                
                {generarPreview()}
                
                {/* Resumen de configuración */}
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
                        <span className="text-gray-600">Categoría:</span>
                        <span className="font-medium">
                          {getCategoria(formData.categoria_id)?.nombre || 'Sin seleccionar'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Estado:</span>
                        <Badge variant={formData.activo ? "default" : "secondary"} className="text-xs">
                          {formData.activo ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Configuración</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Tiempo estimado:</span>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formData.tiempo_estimado} min</span>
                        </div>
                      </div>
                      {mostrarDuplicacion && formData.duplicar_desde > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Duplicar desde:</span>
                          <div className="flex items-center gap-1">
                            <Copy className="h-3 w-3" />
                            <span className="text-xs">Sí</span>
                          </div>
                        </div>
                      )}
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
                {mode === 'create' ? 'Crear Formulario' : 'Guardar Cambios'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FormularioIndustriaForm; 