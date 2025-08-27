/**
 * Componente simple para crear preguntas con recomendaciones
 * Enfocado en funcionalidad básica y confiable
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Save, X } from 'lucide-react';
import { API } from '@/config/api';

interface OpcionConRecomendacion {
  value: string;
  label: string;
  sugerencia: string;
}

interface CrearPreguntaSimpleProps {
  formularioId: number;
  preguntaInicial?: any; // Pregunta a editar (opcional)
  onSuccess: () => void;
  onCancel: () => void;
}

const CrearPreguntaSimple: React.FC<CrearPreguntaSimpleProps> = ({
  formularioId,
  preguntaInicial,
  onSuccess,
  onCancel
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    texto: preguntaInicial?.texto || '',
    subtitulo: preguntaInicial?.subtitulo || '',
    tipo: preguntaInicial?.tipo || 'radio' as 'radio' | 'checkbox' | 'text' | 'number' | 'select',
    orden: preguntaInicial?.orden || 1,
    requerida: preguntaInicial?.requerida ?? true,
    activa: preguntaInicial?.activa ?? true,
    tiene_opcion_otro: preguntaInicial?.tiene_opcion_otro || false,
    placeholder_otro: preguntaInicial?.placeholder_otro || ''
  });
  
  const [opciones, setOpciones] = useState<OpcionConRecomendacion[]>(() => {
    if (preguntaInicial?.opciones && Array.isArray(preguntaInicial.opciones)) {
      return preguntaInicial.opciones.map((op: any) => ({
        value: op.value || '',
        label: op.label || '',
        sugerencia: op.sugerencia || ''
      }));
    }
    return [{ value: '', label: '', sugerencia: '' }];
  });

  const agregarOpcion = () => {
    setOpciones([...opciones, { value: '', label: '', sugerencia: '' }]);
  };

  const eliminarOpcion = (index: number) => {
    if (opciones.length > 1) {
      setOpciones(opciones.filter((_, i) => i !== index));
    }
  };

  const actualizarOpcion = (index: number, campo: keyof OpcionConRecomendacion, valor: string) => {
    const nuevasOpciones = [...opciones];
    nuevasOpciones[index][campo] = valor;
    setOpciones(nuevasOpciones);
  };

  const validarFormulario = (): boolean => {
    if (!formData.texto.trim()) {
      alert('El texto de la pregunta es requerido');
      return false;
    }

    if (['radio', 'checkbox', 'select'].includes(formData.tipo)) {
      const opcionesValidas = opciones.filter(op => op.value.trim() && op.label.trim());
      if (opcionesValidas.length < 2) {
        alert('Se requieren al menos 2 opciones válidas');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validarFormulario()) return;

    setLoading(true);
    try {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        throw new Error('No hay token de admin');
      }

      // Preparar opciones (solo para tipos que las necesitan)
      let opcionesParaEnviar = null;
      if (['radio', 'checkbox', 'select'].includes(formData.tipo)) {
        opcionesParaEnviar = opciones
          .filter(op => op.value.trim() && op.label.trim())
          .map(op => ({
            value: op.value.trim(),
            label: op.label.trim(),
            sugerencia: op.sugerencia.trim() || null
          }));
      }

      const preguntaData = {
        formulario_id: formularioId,
        texto: formData.texto.trim(),
        subtitulo: formData.subtitulo.trim() || null,
        tipo: formData.tipo,
        opciones: opcionesParaEnviar,
        tiene_opcion_otro: formData.tiene_opcion_otro,
        placeholder_otro: formData.placeholder_otro.trim() || null,
        orden: formData.orden,
        requerida: formData.requerida,
        activa: formData.activa
      };

      console.log('Datos enviados:', preguntaData);

      // Determinar si es creación o edición
      const url = preguntaInicial 
        ? API.adminFormularios.preguntas.update(preguntaInicial.id)
        : API.adminFormularios.preguntas.create;
      
      const method = preguntaInicial ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(preguntaData)
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Error ${response.status}: ${errorData}`);
      }

      const resultado = await response.json();
      console.log('Pregunta guardada:', resultado);
      
      alert(preguntaInicial ? 'Pregunta actualizada exitosamente' : 'Pregunta creada exitosamente');
      onSuccess();

    } catch (error) {
      console.error('Error guardando pregunta:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const tiposConOpciones = ['radio', 'checkbox', 'select'];

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          {preguntaInicial ? 'Editar Pregunta' : 'Crear Nueva Pregunta'}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Formulario: {formularioId} • {preguntaInicial ? `ID: ${preguntaInicial.id}` : 'Nueva pregunta'}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Texto de la pregunta */}
        <div>
          <Label htmlFor="texto">Texto de la Pregunta *</Label>
          <Textarea
            id="texto"
            value={formData.texto}
            onChange={(e) => setFormData({...formData, texto: e.target.value})}
            placeholder="¿Cuál es su pregunta?"
            rows={3}
          />
        </div>

        {/* Subtítulo */}
        <div>
          <Label htmlFor="subtitulo">Subtítulo (opcional)</Label>
          <Input
            id="subtitulo"
            value={formData.subtitulo}
            onChange={(e) => setFormData({...formData, subtitulo: e.target.value})}
            placeholder="Texto explicativo adicional"
          />
        </div>

        {/* Tipo de pregunta */}
        <div>
          <Label>Tipo de Pregunta *</Label>
          <Select 
            value={formData.tipo} 
            onValueChange={(value) => setFormData({...formData, tipo: value as any})}
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
            </SelectContent>
          </Select>
        </div>

        {/* Opciones (solo para tipos que las necesitan) */}
        {tiposConOpciones.includes(formData.tipo) && (
          <div>
            <Label>Opciones con Recomendaciones</Label>
            <div className="space-y-4 mt-2">
              {opciones.map((opcion, index) => (
                <Card key={index} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor={`value-${index}`}>Valor</Label>
                      <Input
                        id={`value-${index}`}
                        value={opcion.value}
                        onChange={(e) => actualizarOpcion(index, 'value', e.target.value)}
                        placeholder="valor_interno"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`label-${index}`}>Texto Visible</Label>
                      <Input
                        id={`label-${index}`}
                        value={opcion.label}
                        onChange={(e) => actualizarOpcion(index, 'label', e.target.value)}
                        placeholder="Texto que ve el usuario"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <div className="flex justify-between items-center">
                        <Label htmlFor={`sugerencia-${index}`}>Recomendación</Label>
                        {opciones.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => eliminarOpcion(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <Textarea
                        id={`sugerencia-${index}`}
                        value={opcion.sugerencia}
                        onChange={(e) => actualizarOpcion(index, 'sugerencia', e.target.value)}
                        placeholder="Recomendación específica para esta opción..."
                        rows={2}
                      />
                    </div>
                  </div>
                </Card>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={agregarOpcion}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Opción
              </Button>
            </div>
          </div>
        )}

        {/* Configuración adicional */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="orden">Orden</Label>
            <Input
              id="orden"
              type="number"
              value={formData.orden}
              onChange={(e) => setFormData({...formData, orden: parseInt(e.target.value) || 1})}
              min="1"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="requerida"
              checked={formData.requerida}
              onCheckedChange={(checked) => setFormData({...formData, requerida: checked})}
            />
            <Label htmlFor="requerida">Pregunta requerida</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="activa"
              checked={formData.activa}
              onCheckedChange={(checked) => setFormData({...formData, activa: checked})}
            />
            <Label htmlFor="activa">Pregunta activa</Label>
          </div>
        </div>

        {/* Opción "Otro" */}
        {tiposConOpciones.includes(formData.tipo) && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="tiene_otro"
                checked={formData.tiene_opcion_otro}
                onCheckedChange={(checked) => setFormData({...formData, tiene_opcion_otro: checked})}
              />
              <Label htmlFor="tiene_otro">Incluir opción "Otro"</Label>
            </div>
            
            {formData.tiene_opcion_otro && (
              <div>
                <Label htmlFor="placeholder_otro">Placeholder para "Otro"</Label>
                <Input
                  id="placeholder_otro"
                  value={formData.placeholder_otro}
                  onChange={(e) => setFormData({...formData, placeholder_otro: e.target.value})}
                  placeholder="Especifique..."
                />
              </div>
            )}
          </div>
        )}

        {/* Botones */}
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Guardando...' : 'Crear Pregunta'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CrearPreguntaSimple; 