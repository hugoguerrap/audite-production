import React, { useState, useEffect } from 'react';
import { AdminPregunta, useAdminQuestions, CreatePreguntaData, CreateOpcionData } from '@/hooks/useAdminQuestions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, X, Save, Lightbulb } from 'lucide-react';

interface AdminQuestionFormProps {
  pregunta?: AdminPregunta | null;
  onClose: () => void;
  onSuccess: () => void;
}

const AdminQuestionForm: React.FC<AdminQuestionFormProps> = ({
  pregunta: preguntaEdit,
  onClose,
  onSuccess
}) => {
  const { createPregunta, updatePregunta } = useAdminQuestions();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados del formulario
  const [orden, setOrden] = useState(1);
  const [textoPregunta, setTextoPregunta] = useState('');
  const [tipoRespuesta, setTipoRespuesta] = useState<'radio' | 'checkbox' | 'text' | 'number' | 'select'>('radio');
  const [activa, setActiva] = useState(true);
  const [opciones, setOpciones] = useState<CreateOpcionData[]>([]);

  const isEdit = !!preguntaEdit;

  // Cargar datos si es edición
  useEffect(() => {
    if (preguntaEdit) {
      setOrden(preguntaEdit.numero_orden);
      setTextoPregunta(preguntaEdit.pregunta);
      setTipoRespuesta(preguntaEdit.tipo_respuesta);
      setActiva(preguntaEdit.es_activa);
      setOpciones(preguntaEdit.opciones.map(op => ({
        texto_opcion: op.texto_opcion,
        valor: op.texto_opcion,
        orden: op.orden,
        es_especial: op.es_especial,
        tiene_sugerencia: op.tiene_sugerencia || false,
        sugerencia: op.sugerencia || ''
      })));
    } else {
      // Reset para nueva pregunta
      setOrden(1);
      setTextoPregunta('');
      setTipoRespuesta('radio');
      setActiva(true);
      setOpciones([]);
    }
  }, [preguntaEdit]);

  const tiposConOpciones = ['radio', 'checkbox', 'select'];
  const necesitaOpciones = tiposConOpciones.includes(tipoRespuesta);

  const agregarOpcion = () => {
    const nuevaOpcion: CreateOpcionData = {
      texto_opcion: '',
      valor: '',
      orden: opciones.length + 1,
      es_especial: false,
      tiene_sugerencia: false,
      sugerencia: ''
    };
    setOpciones([...opciones, nuevaOpcion]);
  };

  const actualizarOpcion = (index: number, campo: keyof CreateOpcionData, valor: any) => {
    const nuevasOpciones = [...opciones];
    const opcion = { ...nuevasOpciones[index], [campo]: valor };

    // Mantener el valor sincronizado con el texto de la opción
    if (campo === 'texto_opcion') {
      opcion.valor = valor;
    }
    
    // Limpiar sugerencia si se desactiva
    if (campo === 'tiene_sugerencia' && !valor) {
      opcion.sugerencia = '';
    }
    
    nuevasOpciones[index] = opcion;
    setOpciones(nuevasOpciones);
  };

  const eliminarOpcion = (index: number) => {
    const nuevasOpciones = opciones.filter((_, i) => i !== index);
    // Reordenar
    nuevasOpciones.forEach((opcion, i) => {
      opcion.orden = i + 1;
    });
    setOpciones(nuevasOpciones);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validaciones
      if (!textoPregunta.trim()) {
        throw new Error('El texto de la pregunta es obligatorio');
      }

      if (necesitaOpciones && opciones.length === 0) {
        throw new Error('Este tipo de pregunta requiere al menos una opción');
      }

      if (necesitaOpciones && opciones.some(op => !op.texto_opcion.trim())) {
        throw new Error('Todas las opciones deben tener texto');
      }

      // Validar que las opciones con sugerencias tengan texto de sugerencia
      if (necesitaOpciones && opciones.some(op => op.tiene_sugerencia && !op.sugerencia?.trim())) {
        throw new Error('Las opciones marcadas con sugerencia deben tener texto de sugerencia');
      }

      const data: CreatePreguntaData = {
        numero_orden: orden,
        pregunta: textoPregunta.trim(),
        tipo_respuesta: tipoRespuesta,
        es_activa: activa,
        opciones: necesitaOpciones ? opciones.filter(op => op.texto_opcion.trim()) : []
      };

      if (isEdit && preguntaEdit) {
        await updatePregunta(preguntaEdit.id, data);
      } else {
        await createPregunta(data);
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Editar Pregunta' : 'Nueva Pregunta'}
          </DialogTitle>
          <DialogDescription>
            {isEdit 
              ? 'Modifica los detalles de la pregunta existente y sus sugerencias'
              : 'Crea una nueva pregunta para el autodiagnóstico energético con sugerencias personalizadas'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Información básica */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="orden">Orden</Label>
              <Input
                id="orden"
                type="number"
                min="1"
                value={orden}
                onChange={(e) => setOrden(parseInt(e.target.value) || 1)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Respuesta</Label>
              <Select value={tipoRespuesta} onValueChange={(value: any) => setTipoRespuesta(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="radio">Opción Única</SelectItem>
                  <SelectItem value="checkbox">Múltiple Selección</SelectItem>
                  <SelectItem value="text">Texto Libre</SelectItem>
                  <SelectItem value="number">Número</SelectItem>
                  <SelectItem value="select">Lista Desplegable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Texto de la pregunta */}
          <div className="space-y-2">
            <Label htmlFor="pregunta">Texto de la Pregunta</Label>
            <Textarea
              id="pregunta"
              placeholder="Escribe aquí el texto de la pregunta..."
              value={textoPregunta}
              onChange={(e) => setTextoPregunta(e.target.value)}
              rows={3}
              required
            />
          </div>

          {/* Estado activa */}
          <div className="flex items-center space-x-2">
            <Switch
              id="activa"
              checked={activa}
              onCheckedChange={setActiva}
            />
            <Label htmlFor="activa">Pregunta activa</Label>
          </div>

          {/* Opciones */}
          {necesitaOpciones && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Opciones de Respuesta</span>
                  <Button type="button" size="sm" onClick={agregarOpcion}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Opción
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {opciones.map((opcion, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">Opción {index + 1}</Badge>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => eliminarOpcion(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Texto de la Opción</Label>
                          <Input
                            value={opcion.texto_opcion}
                            onChange={(e) => actualizarOpcion(index, 'texto_opcion', e.target.value)}
                            placeholder="Texto que verá el usuario"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={opcion.es_especial || false}
                              onCheckedChange={(checked) => actualizarOpcion(index, 'es_especial', checked)}
                            />
                            <Label>Opción Especial</Label>
                          </div>
                        </div>
                      </div>

                      {/* Sección de Sugerencias */}
                      <div className="border-t pt-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <Switch
                            checked={opcion.tiene_sugerencia || false}
                            onCheckedChange={(checked) => actualizarOpcion(index, 'tiene_sugerencia', checked)}
                          />
                          <Label className="flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-yellow-500" />
                            Incluir Sugerencia Personalizada
                          </Label>
                        </div>
                        
                        {opcion.tiene_sugerencia && (
                          <div className="space-y-2">
                            <Label>Sugerencia para esta opción</Label>
                            <Textarea
                              value={opcion.sugerencia || ''}
                              onChange={(e) => actualizarOpcion(index, 'sugerencia', e.target.value)}
                              placeholder="Escribe aquí la recomendación que se mostrará al usuario si selecciona esta opción..."
                              rows={3}
                              className="bg-yellow-50 border-yellow-200"
                            />
                            <p className="text-xs text-muted-foreground">
                              Esta sugerencia se mostrará al final del autodiagnóstico si el usuario selecciona esta opción.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
                
                {opciones.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No hay opciones configuradas.</p>
                    <p className="text-sm">Haz clic en "Agregar Opción" para comenzar.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Botones de acción */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Crear')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminQuestionForm; 