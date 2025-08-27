/**
 * Formulario avanzado para crear y editar preguntas con lógica condicional
 * Editor completo con validación, preview y asistente de condiciones
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { 
  Save, 
  X, 
  Eye, 
  AlertTriangle, 
  CheckCircle2,
  HelpCircle,
  Plus,
  Trash2,
  Target,
  Settings,
  Wand2,
  ArrowRight,
  ArrowDown,
  Info,
  Lightbulb,
  Zap,
  Move
} from 'lucide-react';
import { PreguntaFormulario, CondicionPregunta, OpcionPregunta } from '@/types/industria';
import { useAdminPreguntasCondicionales } from '../hooks/useAdminPreguntasCondicionales';

interface PreguntaCondicionalFormProps {
  pregunta?: PreguntaFormulario | null;
  formularioId: number;
  onSave: (pregunta: Partial<PreguntaFormulario>) => Promise<void>;
  onCancel: () => void;
  mode: 'create' | 'edit';
}

type TipoPregunta = 'radio' | 'checkbox' | 'text' | 'number' | 'select' | 'ordering';
type OperadorCondicion = '=' | '!=' | 'includes' | 'not_includes';

const PreguntaCondicionalForm: React.FC<PreguntaCondicionalFormProps> = ({
  pregunta,
  formularioId,
  onSave,
  onCancel,
  mode
}) => {
  // Estados del formulario
  const [formData, setFormData] = useState({
    texto_pregunta: '',
    subtitulo: '',
    tipo_pregunta: 'radio' as TipoPregunta,
    orden: 1,
    requerida: false,
    activa: true,
    tiene_opcion_otro: false,
    opciones: [] as OpcionPregunta[],
    pregunta_padre_id: null as number | null,
    condiciones: [] as CondicionPregunta[]
  });

  // Estados de validación y UI
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [guardando, setGuardando] = useState(false);
  const [tabActiva, setTabActiva] = useState('basico');
  const [mostrarAsistente, setMostrarAsistente] = useState(false);
  const [nuevaOpcion, setNuevaOpcion] = useState('');
  const [nuevaCondicion, setNuevaCondicion] = useState({
    pregunta_padre_id: null as number | null,
    operador: '=' as OperadorCondicion,
    valor_esperado: ''
  });

  // Hook para obtener preguntas disponibles
  const { preguntas: preguntasDisponibles } = useAdminPreguntasCondicionales();

  // Efecto para cargar datos de pregunta existente
  useEffect(() => {
    if (pregunta && mode === 'edit') {
      setFormData({
        texto_pregunta: pregunta.texto_pregunta || '',
        subtitulo: pregunta.subtitulo || '',
        tipo_pregunta: pregunta.tipo_pregunta as TipoPregunta || 'radio',
        orden: pregunta.orden || 1,
        requerida: pregunta.requerida || false,
        activa: pregunta.activa ?? true,
        tiene_opcion_otro: pregunta.tiene_opcion_otro || false,
        opciones: pregunta.opciones || [],
        pregunta_padre_id: pregunta.pregunta_padre_id || null,
        condiciones: pregunta.condiciones || []
      });
    }
  }, [pregunta, mode]);

  // Preguntas disponibles para ser padre (excluir la actual)
  const preguntasPadreDisponibles = useMemo(() => {
    return preguntasDisponibles.filter(p => 
      p.id !== pregunta?.id && // No incluir la pregunta actual
      p.tipo_pregunta !== 'text' && // Solo preguntas con opciones pueden ser padre
      p.tipo_pregunta !== 'number'
    );
  }, [preguntasDisponibles, pregunta?.id]);

  // Función de validación
  const validarFormulario = (): boolean => {
    const nuevosErrores: Record<string, string> = {};

    // Validar texto de pregunta
    if (!formData.texto_pregunta.trim()) {
      nuevosErrores.texto_pregunta = 'El texto de la pregunta es requerido';
    } else if (formData.texto_pregunta.length < 10) {
      nuevosErrores.texto_pregunta = 'El texto debe tener al menos 10 caracteres';
    } else if (formData.texto_pregunta.length > 500) {
      nuevosErrores.texto_pregunta = 'El texto no puede exceder 500 caracteres';
    }

    // Validar subtítulo
    if (formData.subtitulo && formData.subtitulo.length > 200) {
      nuevosErrores.subtitulo = 'El subtítulo no puede exceder 200 caracteres';
    }

    // Validar orden
    if (formData.orden < 1 || formData.orden > 999) {
      nuevosErrores.orden = 'El orden debe estar entre 1 y 999';
    }

    // Validar opciones para tipos que las requieren
    if (['radio', 'checkbox', 'select', 'ordering'].includes(formData.tipo_pregunta)) {
      if (formData.opciones.length === 0) {
        nuevosErrores.opciones = 'Debe agregar al menos una opción';
      } else if (formData.opciones.length < 2) {
        nuevosErrores.opciones = 'Debe agregar al menos dos opciones';
      }
    }

    // Validar condiciones si es pregunta condicional
    if (formData.pregunta_padre_id) {
      if (formData.condiciones.length === 0) {
        nuevosErrores.condiciones = 'Debe configurar al menos una condición';
      } else {
        formData.condiciones.forEach((condicion, index) => {
          if (!condicion.valor_esperado.trim()) {
            nuevosErrores[`condicion_${index}`] = 'El valor esperado es requerido';
          }
        });
      }
    }

    // Validar ciclos en dependencias
    if (formData.pregunta_padre_id && detectarCiclo()) {
      nuevosErrores.ciclo = 'Esta configuración crearía un ciclo de dependencias';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // Función para detectar ciclos de dependencias
  const detectarCiclo = (): boolean => {
    if (!formData.pregunta_padre_id) return false;
    
    const visitados = new Set<number>();
    const enRecorrido = new Set<number>();
    
    const dfs = (preguntaId: number): boolean => {
      if (enRecorrido.has(preguntaId)) return true; // Ciclo detectado
      if (visitados.has(preguntaId)) return false;
      
      visitados.add(preguntaId);
      enRecorrido.add(preguntaId);
      
      // Buscar hijas de esta pregunta
      const hijas = preguntasDisponibles.filter(p => p.pregunta_padre_id === preguntaId);
      for (const hija of hijas) {
        if (dfs(hija.id)) return true;
      }
      
      enRecorrido.delete(preguntaId);
      return false;
    };
    
    return dfs(formData.pregunta_padre_id);
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

    // Lógica especial para cambios de tipo
    if (campo === 'tipo_pregunta') {
      if (['text', 'number'].includes(valor)) {
        // Limpiar opciones si cambia a tipo que no las necesita
        setFormData(prev => ({ ...prev, opciones: [] }));
      }
    }
  };

  // Función para agregar opción
  const agregarOpcion = () => {
    if (nuevaOpcion.trim()) {
      const nuevaOpcionObj: OpcionPregunta = {
        id: Date.now(), // ID temporal
        texto: nuevaOpcion.trim(),
        orden: formData.opciones.length + 1,
        valor: nuevaOpcion.trim().toLowerCase().replace(/\s+/g, '_')
      };
      
      setFormData(prev => ({
        ...prev,
        opciones: [...prev.opciones, nuevaOpcionObj]
      }));
      setNuevaOpcion('');
    }
  };

  // Función para eliminar opción
  const eliminarOpcion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      opciones: prev.opciones.filter((_, i) => i !== index)
    }));
  };

  // Función para reordenar opciones
  const reordenarOpcion = (index: number, direccion: 'up' | 'down') => {
    const nuevasOpciones = [...formData.opciones];
    const newIndex = direccion === 'up' ? index - 1 : index + 1;
    
    if (newIndex >= 0 && newIndex < nuevasOpciones.length) {
      [nuevasOpciones[index], nuevasOpciones[newIndex]] = [nuevasOpciones[newIndex], nuevasOpciones[index]];
      
      // Actualizar orden
      nuevasOpciones.forEach((opcion, i) => {
        opcion.orden = i + 1;
      });
      
      setFormData(prev => ({ ...prev, opciones: nuevasOpciones }));
    }
  };

  // Función para agregar condición
  const agregarCondicion = () => {
    if (nuevaCondicion.pregunta_padre_id && nuevaCondicion.valor_esperado.trim()) {
      const condicion: CondicionPregunta = {
        id: Date.now(), // ID temporal
        pregunta_padre_id: nuevaCondicion.pregunta_padre_id,
        operador: nuevaCondicion.operador,
        valor_esperado: nuevaCondicion.valor_esperado.trim()
      };
      
      setFormData(prev => ({
        ...prev,
        condiciones: [...prev.condiciones, condicion],
        pregunta_padre_id: nuevaCondicion.pregunta_padre_id
      }));
      
      setNuevaCondicion({
        pregunta_padre_id: null,
        operador: '=',
        valor_esperado: ''
      });
    }
  };

  // Función para eliminar condición
  const eliminarCondicion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      condiciones: prev.condiciones.filter((_, i) => i !== index)
    }));
  };

  // Función para obtener opciones de pregunta padre
  const getOpcionesPreguntaPadre = (preguntaId: number): OpcionPregunta[] => {
    const pregunta = preguntasDisponibles.find(p => p.id === preguntaId);
    return pregunta?.opciones || [];
  };

  // Función para guardar
  const handleGuardar = async () => {
    if (!validarFormulario()) {
      return;
    }

    setGuardando(true);
    try {
      // Transformar datos al formato esperado por el backend
      const preguntaParaBackend = {
        texto: formData.texto_pregunta,
        subtitulo: formData.subtitulo || null,
        tipo: formData.tipo_pregunta,
        opciones: formData.opciones,
        tiene_opcion_otro: formData.tiene_opcion_otro,
        placeholder_otro: formData.placeholder_otro || null,
        orden: formData.orden,
        requerida: formData.requerida,
        activa: formData.activa,
        pregunta_padre_id: formData.pregunta_padre_id || null,
        condicion_valor: formData.condiciones.length > 0 ? formData.condiciones[0] : null,
        condicion_operador: formData.condiciones.length > 0 ? formData.condiciones[0]?.operador : null
      };
      
      console.log('Datos enviados al backend:', preguntaParaBackend);
      await onSave(preguntaParaBackend);
    } catch (error) {
      console.error('Error guardando pregunta:', error);
    } finally {
      setGuardando(false);
    }
  };

  // Función para generar preview
  const generarPreview = () => {
    const renderOpcionesPreview = () => {
      switch (formData.tipo_pregunta) {
        case 'radio':
          return (
            <div className="space-y-2">
              {formData.opciones.map((opcion, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input type="radio" name="preview" disabled />
                  <label className="text-sm">{opcion.texto}</label>
                </div>
              ))}
              {formData.tiene_opcion_otro && (
                <div className="flex items-center space-x-2">
                  <input type="radio" name="preview" disabled />
                  <label className="text-sm">Otro:</label>
                  <input 
                    type="text" 
                    placeholder="Especificar..." 
                    className="text-xs border rounded px-2 py-1" 
                    disabled 
                  />
                </div>
              )}
            </div>
          );
        
        case 'checkbox':
          return (
            <div className="space-y-2">
              {formData.opciones.map((opcion, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input type="checkbox" disabled />
                  <label className="text-sm">{opcion.texto}</label>
                </div>
              ))}
              {formData.tiene_opcion_otro && (
                <div className="flex items-center space-x-2">
                  <input type="checkbox" disabled />
                  <label className="text-sm">Otro:</label>
                  <input 
                    type="text" 
                    placeholder="Especificar..." 
                    className="text-xs border rounded px-2 py-1" 
                    disabled 
                  />
                </div>
              )}
            </div>
          );
          
        case 'select':
          return (
            <select className="w-full border rounded px-3 py-2" disabled>
              <option>Seleccionar opción...</option>
              {formData.opciones.map((opcion, index) => (
                <option key={index}>{opcion.texto}</option>
              ))}
            </select>
          );
          
        case 'text':
          return (
            <textarea 
              className="w-full border rounded px-3 py-2" 
              placeholder="Respuesta de texto libre..." 
              rows={3}
              disabled 
            />
          );
          
        case 'number':
          return (
            <input 
              type="number" 
              className="w-full border rounded px-3 py-2" 
              placeholder="Ingrese un número..." 
              disabled 
            />
          );
          
        case 'ordering':
          return (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Arrastra para ordenar:</p>
              {formData.opciones.map((opcion, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 border rounded bg-gray-50">
                  <Move className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{opcion.texto}</span>
                </div>
              ))}
            </div>
          );
          
        default:
          return null;
      }
    };

    return (
      <Card className="border-2 border-blue-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">
                {formData.texto_pregunta || 'Texto de la pregunta'}
                {formData.requerida && <span className="text-red-500 ml-1">*</span>}
              </CardTitle>
              {formData.subtitulo && (
                <p className="text-sm text-muted-foreground mt-1">{formData.subtitulo}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{formData.tipo_pregunta}</Badge>
              {formData.pregunta_padre_id && (
                <Badge variant="secondary">
                  <HelpCircle className="h-3 w-3 mr-1" />
                  Condicional
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Condiciones si aplica */}
          {formData.pregunta_padre_id && formData.condiciones.length > 0 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm font-medium text-blue-800 mb-2">Se muestra cuando:</p>
              <div className="space-y-1">
                {formData.condiciones.map((condicion, index) => {
                  const preguntaPadre = preguntasDisponibles.find(p => p.id === condicion.pregunta_padre_id);
                  return (
                    <p key={index} className="text-xs text-blue-700">
                      "{preguntaPadre?.texto_pregunta}" {condicion.operador} "{condicion.valor_esperado}"
                    </p>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Renderizar preview según tipo */}
          {renderOpcionesPreview()}
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            {mode === 'create' ? 'Nueva Pregunta' : `Editar: ${pregunta?.texto_pregunta}`}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={tabActiva} onValueChange={setTabActiva} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basico">Básico</TabsTrigger>
            <TabsTrigger value="opciones">Opciones</TabsTrigger>
            <TabsTrigger value="condicional">Condicional</TabsTrigger>
            <TabsTrigger value="asistente">Asistente</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          {/* Tab: Información Básica */}
          <TabsContent value="basico" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Columna izquierda */}
              <div className="space-y-4">
                {/* Texto de pregunta */}
                <div className="space-y-2">
                  <Label htmlFor="texto_pregunta">
                    Texto de la pregunta <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="texto_pregunta"
                    value={formData.texto_pregunta}
                    onChange={(e) => handleChange('texto_pregunta', e.target.value)}
                    placeholder="¿Cuál es tu pregunta?"
                    rows={3}
                    className={errores.texto_pregunta ? 'border-red-500' : ''}
                  />
                  <div className="flex justify-between items-center">
                    {errores.texto_pregunta && (
                      <p className="text-sm text-red-500">{errores.texto_pregunta}</p>
                    )}
                    <p className="text-sm text-gray-500 ml-auto">
                      {formData.texto_pregunta.length}/500 caracteres
                    </p>
                  </div>
                </div>

                {/* Subtítulo */}
                <div className="space-y-2">
                  <Label htmlFor="subtitulo">Subtítulo (opcional)</Label>
                  <Input
                    id="subtitulo"
                    value={formData.subtitulo}
                    onChange={(e) => handleChange('subtitulo', e.target.value)}
                    placeholder="Información adicional o aclaración..."
                    className={errores.subtitulo ? 'border-red-500' : ''}
                  />
                  <div className="flex justify-between items-center">
                    {errores.subtitulo && (
                      <p className="text-sm text-red-500">{errores.subtitulo}</p>
                    )}
                    <p className="text-sm text-gray-500 ml-auto">
                      {formData.subtitulo.length}/200 caracteres
                    </p>
                  </div>
                </div>
              </div>

              {/* Columna derecha */}
              <div className="space-y-4">
                {/* Tipo de pregunta */}
                <div className="space-y-2">
                  <Label htmlFor="tipo_pregunta">Tipo de pregunta</Label>
                  <Select 
                    value={formData.tipo_pregunta} 
                    onValueChange={(value: TipoPregunta) => handleChange('tipo_pregunta', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="radio">Selección única (Radio)</SelectItem>
                      <SelectItem value="checkbox">Selección múltiple (Checkbox)</SelectItem>
                      <SelectItem value="select">Lista desplegable (Select)</SelectItem>
                      <SelectItem value="text">Texto libre</SelectItem>
                      <SelectItem value="number">Número</SelectItem>
                      <SelectItem value="ordering">Ordenamiento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Orden */}
                <div className="space-y-2">
                  <Label htmlFor="orden">Orden de visualización</Label>
                  <Input
                    id="orden"
                    type="number"
                    min="1"
                    max="999"
                    value={formData.orden}
                    onChange={(e) => handleChange('orden', parseInt(e.target.value) || 1)}
                    className={errores.orden ? 'border-red-500' : ''}
                  />
                  {errores.orden && (
                    <p className="text-sm text-red-500">{errores.orden}</p>
                  )}
                </div>

                {/* Switches */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requerida"
                      checked={formData.requerida}
                      onCheckedChange={(checked) => handleChange('requerida', checked)}
                    />
                    <Label htmlFor="requerida">Pregunta requerida</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="activa"
                      checked={formData.activa}
                      onCheckedChange={(checked) => handleChange('activa', checked)}
                    />
                    <Label htmlFor="activa">Pregunta activa</Label>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Tab: Opciones */}
          <TabsContent value="opciones" className="space-y-4">
            {['radio', 'checkbox', 'select', 'ordering'].includes(formData.tipo_pregunta) ? (
              <div className="space-y-6">
                {/* Agregar nueva opción */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Configurar opciones</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Escribir nueva opción..."
                        value={nuevaOpcion}
                        onChange={(e) => setNuevaOpcion(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && agregarOpcion()}
                        className="flex-1"
                      />
                      <Button onClick={agregarOpcion} disabled={!nuevaOpcion.trim()}>
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar
                      </Button>
                    </div>

                    {/* Opción "Otro" */}
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="tiene_opcion_otro"
                        checked={formData.tiene_opcion_otro}
                        onCheckedChange={(checked) => handleChange('tiene_opcion_otro', checked)}
                      />
                      <Label htmlFor="tiene_opcion_otro">Incluir opción "Otro" con campo de texto</Label>
                    </div>

                    {errores.opciones && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{errores.opciones}</AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>

                {/* Lista de opciones */}
                {formData.opciones.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Opciones configuradas ({formData.opciones.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {formData.opciones.map((opcion, index) => (
                          <div key={index} className="flex items-center gap-2 p-3 border rounded">
                            <span className="text-sm font-medium text-gray-500">
                              {index + 1}.
                            </span>
                            <span className="flex-1">{opcion.texto}</span>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => reordenarOpcion(index, 'up')}
                                disabled={index === 0}
                                title="Subir"
                              >
                                ↑
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => reordenarOpcion(index, 'down')}
                                disabled={index === formData.opciones.length - 1}
                                title="Bajar"
                              >
                                ↓
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => eliminarOpcion(index)}
                                className="text-red-600 hover:text-red-700"
                                title="Eliminar"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No requiere opciones</h3>
                    <p className="text-muted-foreground">
                      El tipo de pregunta "{formData.tipo_pregunta}" no requiere configuración de opciones.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tab: Lógica Condicional */}
          <TabsContent value="condicional" className="space-y-4">
            <div className="space-y-6">
              {/* Selector de pregunta padre */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Configurar lógica condicional
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>¿Esta pregunta depende de otra pregunta?</Label>
                    <Select 
                      value={formData.pregunta_padre_id?.toString() || 'ninguna'} 
                      onValueChange={(value) => {
                        const preguntaPadreId = value === 'ninguna' ? null : parseInt(value);
                        handleChange('pregunta_padre_id', preguntaPadreId);
                        if (!preguntaPadreId) {
                          // Limpiar condiciones si no hay pregunta padre
                          handleChange('condiciones', []);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ninguna">No depende de otra pregunta</SelectItem>
                        {preguntasPadreDisponibles.map(pregunta => (
                          <SelectItem key={pregunta.id} value={pregunta.id.toString()}>
                            {pregunta.texto_pregunta.substring(0, 60)}...
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {errores.ciclo && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{errores.ciclo}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Configurar condiciones */}
              {formData.pregunta_padre_id && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Condiciones para mostrar esta pregunta</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Agregar nueva condición */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                      <Select
                        value={nuevaCondicion.pregunta_padre_id?.toString() || ''}
                        onValueChange={(value) => setNuevaCondicion(prev => ({
                          ...prev,
                          pregunta_padre_id: parseInt(value)
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pregunta" />
                        </SelectTrigger>
                        <SelectContent>
                          {preguntasPadreDisponibles.map(pregunta => (
                            <SelectItem key={pregunta.id} value={pregunta.id.toString()}>
                              {pregunta.texto_pregunta.substring(0, 30)}...
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={nuevaCondicion.operador}
                        onValueChange={(value: OperadorCondicion) => setNuevaCondicion(prev => ({
                          ...prev,
                          operador: value
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="=">es igual a</SelectItem>
                          <SelectItem value="!=">es diferente de</SelectItem>
                          <SelectItem value="includes">incluye</SelectItem>
                          <SelectItem value="not_includes">no incluye</SelectItem>
                        </SelectContent>
                      </Select>

                      {nuevaCondicion.pregunta_padre_id ? (
                        <Select
                          value={nuevaCondicion.valor_esperado}
                          onValueChange={(value) => setNuevaCondicion(prev => ({
                            ...prev,
                            valor_esperado: value
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Valor" />
                          </SelectTrigger>
                          <SelectContent>
                            {getOpcionesPreguntaPadre(nuevaCondicion.pregunta_padre_id).map((opcion, index) => (
                              <SelectItem key={index} value={opcion.valor}>
                                {opcion.texto}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          placeholder="Valor esperado"
                          value={nuevaCondicion.valor_esperado}
                          onChange={(e) => setNuevaCondicion(prev => ({
                            ...prev,
                            valor_esperado: e.target.value
                          }))}
                        />
                      )}

                      <Button 
                        onClick={agregarCondicion}
                        disabled={!nuevaCondicion.pregunta_padre_id || !nuevaCondicion.valor_esperado.trim()}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar
                      </Button>
                    </div>

                    {errores.condiciones && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{errores.condiciones}</AlertDescription>
                      </Alert>
                    )}

                    {/* Lista de condiciones */}
                    {formData.condiciones.length > 0 && (
                      <div className="space-y-2">
                        <Label>Condiciones configuradas:</Label>
                        {formData.condiciones.map((condicion, index) => {
                          const preguntaPadre = preguntasDisponibles.find(p => p.id === condicion.pregunta_padre_id);
                          return (
                            <div key={index} className="flex items-center gap-2 p-3 border rounded bg-gray-50">
                              <span className="flex-1 text-sm">
                                <strong>{preguntaPadre?.texto_pregunta.substring(0, 40)}...</strong>
                                {' '}{condicion.operador === '=' ? 'es igual a' : 
                                     condicion.operador === '!=' ? 'es diferente de' :
                                     condicion.operador === 'includes' ? 'incluye' : 'no incluye'}{' '}
                                <em>"{condicion.valor_esperado}"</em>
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => eliminarCondicion(index)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Tab: Asistente */}
          <TabsContent value="asistente" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Wand2 className="h-5 w-5" />
                  Asistente inteligente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="tipos">
                    <AccordionTrigger>Guía de tipos de pregunta</AccordionTrigger>
                    <AccordionContent className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 border rounded">
                          <h4 className="font-semibold">Radio (Selección única)</h4>
                          <p className="text-sm text-gray-600">El usuario puede elegir solo una opción. Ideal para preguntas con respuestas mutuamente excluyentes.</p>
                        </div>
                        <div className="p-3 border rounded">
                          <h4 className="font-semibold">Checkbox (Selección múltiple)</h4>
                          <p className="text-sm text-gray-600">El usuario puede elegir varias opciones. Perfecto para "selecciona todas las que apliquen".</p>
                        </div>
                        <div className="p-3 border rounded">
                          <h4 className="font-semibold">Texto libre</h4>
                          <p className="text-sm text-gray-600">Respuesta abierta. Usado para comentarios, descripciones o cuando las opciones predefinidas no son suficientes.</p>
                        </div>
                        <div className="p-3 border rounded">
                          <h4 className="font-semibold">Ordenamiento</h4>
                          <p className="text-sm text-gray-600">El usuario debe ordenar las opciones por prioridad, importancia o secuencia.</p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="condicionales">
                    <AccordionTrigger>Mejores prácticas para preguntas condicionales</AccordionTrigger>
                    <AccordionContent className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                          <p className="text-sm">Mantén las condiciones simples y claras</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                          <p className="text-sm">Evita cadenas muy largas de dependencias</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                          <p className="text-sm">Prueba el flujo completo antes de publicar</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                          <p className="text-sm">Usa preguntas condicionales para personalizar la experiencia</p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="validacion">
                    <AccordionTrigger>Validación automática</AccordionTrigger>
                    <AccordionContent className="space-y-3">
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                        <h4 className="font-semibold text-blue-800 mb-2">El sistema valida automáticamente:</h4>
                        <ul className="space-y-1 text-sm text-blue-700">
                          <li>• Ciclos de dependencias</li>
                          <li>• Preguntas huérfanas</li>
                          <li>• Condiciones inválidas</li>
                          <li>• Opciones duplicadas</li>
                          <li>• Longitud de textos</li>
                        </ul>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Vista Previa */}
          <TabsContent value="preview" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Vista previa de la pregunta
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Preview principal */}
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Así se verá tu pregunta en el formulario:
                  </p>
                  {generarPreview()}
                </div>

                {/* Información técnica */}
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Información técnica</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tipo:</span>
                        <Badge variant="outline">{formData.tipo_pregunta}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Orden:</span>
                        <span>{formData.orden}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Requerida:</span>
                        <Badge variant={formData.requerida ? "destructive" : "secondary"}>
                          {formData.requerida ? 'Sí' : 'No'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Opciones:</span>
                        <span>{formData.opciones.length}</span>
                      </div>
                      {formData.pregunta_padre_id && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Condicional:</span>
                          <Badge variant="secondary">Sí</Badge>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Campo "Otro":</span>
                        <Badge variant={formData.tiene_opcion_otro ? "default" : "secondary"}>
                          {formData.tiene_opcion_otro ? 'Sí' : 'No'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Flujo condicional */}
                  {formData.pregunta_padre_id && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Flujo condicional</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        {formData.condiciones.map((condicion, index) => {
                          const preguntaPadre = preguntasDisponibles.find(p => p.id === condicion.pregunta_padre_id);
                          return (
                            <div key={index} className="p-2 bg-gray-50 rounded">
                              <div className="font-medium">{preguntaPadre?.texto_pregunta?.substring(0, 40)}...</div>
                              <div className="text-gray-600">
                                {condicion.operador} "{condicion.valor_esperado}"
                              </div>
                            </div>
                          );
                        })}
                      </CardContent>
                    </Card>
                  )}
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
                {mode === 'create' ? 'Crear Pregunta' : 'Guardar Cambios'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PreguntaCondicionalForm; 