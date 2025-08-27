/**
 * Componente para renderizar formularios dinámicos por industria
 * Maneja preguntas condicionales y campos "Otro"
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle,
  GripVertical,
  ArrowUpDown
} from 'lucide-react';
import { PreguntaCondicional, RespuestaConOtro } from '@/types/industria';
import { useConditionalQuestions } from '../hooks/useConditionalQuestions';
import { useOtroFields } from '../hooks/useOtroFields';
import PreguntaCondicionalComponent from './PreguntaCondicional';
import CampoOtro from './CampoOtro';

interface FormularioRendererProps {
  preguntas?: PreguntaCondicional[];
  respuestas?: Record<number, RespuestaConOtro>;
  onRespuestaChange?: (preguntaId: number, valor: any, valorOtro?: string) => void;
  readonly?: boolean;
  showConditionIndicators?: boolean;
  allowReordering?: boolean;
  formularioId?: number; // Para compatibilidad con props anteriores
  onSubmit?: (respuestas: any) => void; // Para compatibilidad con props anteriores
}

const FormularioRenderer: React.FC<FormularioRendererProps> = ({ 
  preguntas = [],
  respuestas = {},
  onRespuestaChange,
  readonly = false,
  showConditionIndicators = true,
  allowReordering = false,
  formularioId,
  onSubmit
}) => {
  // Estados locales
  const [draggedQuestion, setDraggedQuestion] = useState<number | null>(null);

  // Hooks para lógica condicional y campos "Otro"
  const { 
    preguntasVisibles, 
    evaluaciones,
    hayErroresDependencias 
  } = useConditionalQuestions({
    preguntas,
    respuestas: Object.fromEntries(
      Object.entries(respuestas).map(([id, resp]) => [parseInt(id), resp.valor])
    )
  });

  const { 
    campos_otro,
    campos_visibles,
    handleOtroChange,
    hasOtroErrors 
  } = useOtroFields({
    respuestas: Object.fromEntries(
      Object.entries(respuestas).map(([id, resp]) => [parseInt(id), resp.valor])
    ),
    preguntas: preguntas.map(p => ({
      ...p,
      tiene_opcion_otro: p.tiene_opcion_otro || false,
      requerida: p.requerida || false
    }))
  });

  // Función para manejar cambios de respuesta
  const handleRespuestaChangeInternal = (preguntaId: number, valor: any) => {
    // Si hay valor "Otro" gestionado por useOtroFields
    const valorOtro = campos_otro[preguntaId];
    
    onRespuestaChange?.(preguntaId, valor, valorOtro);
  };

  // Función para manejar cambios en campos "Otro"
  const handleOtroChangeInternal = (preguntaId: number, valorOtro: string) => {
    handleOtroChange(preguntaId, valorOtro);
    
    // También notificar al padre con la respuesta actual
    const respuestaActual = respuestas[preguntaId]?.valor;
    onRespuestaChange?.(preguntaId, respuestaActual, valorOtro);
  };

  // Renderizado de pregunta individual según su tipo
  const renderPregunta = (pregunta: PreguntaCondicional) => {
    const respuestaActual = respuestas[pregunta.id];
    const valorActual = respuestaActual?.valor;
    const valorOtro = respuestaActual?.otro || campos_otro[pregunta.id] || '';
    const esVisible = campos_visibles[pregunta.id];
    const evaluacion = evaluaciones.find(e => e.pregunta_id === pregunta.id);

    return (
      <PreguntaCondicionalComponent
        key={pregunta.id}
        pregunta={pregunta}
        respuestas={respuestas}
        onRespuestaChange={handleRespuestaChangeInternal}
        visible={evaluacion?.debe_mostrar ?? true}
      >
        <div className="space-y-4">
          {/* Header de pregunta */}
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Label className="text-base font-medium leading-relaxed">
                  {pregunta.texto}
                  {pregunta.requerida && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </Label>
                {pregunta.subtitulo && (
                  <p className="text-sm text-gray-600 mt-1">
                    {pregunta.subtitulo}
                  </p>
                )}
              </div>

              {/* Indicadores de estado */}
              <div className="flex items-center gap-2 ml-4">
                {showConditionIndicators && pregunta.pregunta_padre_id && (
                  <Badge variant="outline" className="text-xs">
                    <HelpCircle className="h-3 w-3 mr-1" />
                    Condicional
                  </Badge>
                )}
                {pregunta.requerida && (
                  <Badge variant="destructive" className="text-xs">
                    Requerida
                  </Badge>
                )}
                {allowReordering && (
                  <div className="cursor-move text-gray-400">
                    <GripVertical className="h-4 w-4" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Campo de entrada según tipo */}
          <div className="space-y-3">
            {pregunta.tipo === 'radio' && (
              <RadioGroup
                value={valorActual || ''}
                onValueChange={(value) => handleRespuestaChangeInternal(pregunta.id, value)}
                disabled={readonly}
              >
                {pregunta.opciones?.map((opcion, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={opcion} id={`${pregunta.id}-${index}`} />
                    <Label htmlFor={`${pregunta.id}-${index}`} className="text-sm">
                      {opcion}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {pregunta.tipo === 'checkbox' && (
              <div className="space-y-2">
                {pregunta.opciones?.map((opcion, index) => {
                  const isChecked = Array.isArray(valorActual) && valorActual.includes(opcion);
                  return (
                    <div key={index} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${pregunta.id}-${index}`}
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          const currentValues = Array.isArray(valorActual) ? valorActual : [];
                          let newValues;
                          if (checked) {
                            newValues = [...currentValues, opcion];
                          } else {
                            newValues = currentValues.filter(v => v !== opcion);
                          }
                          handleRespuestaChangeInternal(pregunta.id, newValues);
                        }}
                        disabled={readonly}
                      />
                      <Label htmlFor={`${pregunta.id}-${index}`} className="text-sm">
                        {opcion}
                      </Label>
                    </div>
                  );
                })}
              </div>
            )}

            {pregunta.tipo === 'select' && (
              <Select
                value={valorActual || ''}
                onValueChange={(value) => handleRespuestaChangeInternal(pregunta.id, value)}
                disabled={readonly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una opción..." />
                </SelectTrigger>
                <SelectContent>
                  {pregunta.opciones?.map((opcion, index) => (
                    <SelectItem key={index} value={opcion}>
                      {opcion}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {pregunta.tipo === 'text' && (
              <Input
                value={valorActual || ''}
                onChange={(e) => handleRespuestaChangeInternal(pregunta.id, e.target.value)}
                placeholder={pregunta.placeholder_otro || 'Escribe tu respuesta...'}
                disabled={readonly}
              />
            )}

            {pregunta.tipo === 'number' && (
              <Input
                type="number"
                value={valorActual || ''}
                onChange={(e) => handleRespuestaChangeInternal(pregunta.id, parseFloat(e.target.value) || 0)}
                placeholder="Ingresa un número..."
                disabled={readonly}
              />
            )}

            {pregunta.tipo === 'ordering' && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <ArrowUpDown className="h-4 w-4" />
                  Arrastra para ordenar por prioridad
                </div>
                <div className="space-y-2">
                  {(valorActual || pregunta.opciones || []).map((opcion: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50 cursor-move"
                      draggable={!readonly}
                    >
                      <GripVertical className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-sm">{index + 1}.</span>
                      <span className="flex-1 text-sm">{opcion}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Campo "Otro" si aplica */}
          {pregunta.tiene_opcion_otro && esVisible && (
            <CampoOtro
              preguntaId={pregunta.id}
              valor={valorOtro}
              placeholder={pregunta.placeholder_otro}
              required={pregunta.requerida && (valorActual === 'Otro' || (Array.isArray(valorActual) && valorActual.includes('Otro')))}
              onChange={(valor) => handleOtroChangeInternal(pregunta.id, valor)}
              visible={valorActual === 'Otro' || (Array.isArray(valorActual) && valorActual.includes('Otro'))}
            />
          )}

          {/* Información de evaluación condicional */}
          {showConditionIndicators && evaluacion && !evaluacion.debe_mostrar && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Esta pregunta está oculta: {evaluacion.razon}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </PreguntaCondicionalComponent>
    );
  };

  // Renderizado principal
  if (preguntas.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-gray-500">
            <HelpCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No hay preguntas disponibles para mostrar</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alertas de validación */}
      {hayErroresDependencias && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Se detectaron problemas en la estructura de dependencias de las preguntas.
          </AlertDescription>
        </Alert>
      )}

      {hasOtroErrors && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Hay errores en los campos "Otro". Revisa las respuestas requeridas.
          </AlertDescription>
        </Alert>
      )}

      {/* Renderizado de preguntas */}
      <div className="space-y-6">
        {preguntasVisibles.map((pregunta) => (
          <Card key={pregunta.id} className="relative">
            <CardContent className="pt-6">
              {renderPregunta(pregunta)}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Información de debug en desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="text-xs space-y-2 text-gray-500">
              <p><strong>Debug Info:</strong></p>
              <p>Total preguntas: {preguntas.length}</p>
              <p>Preguntas visibles: {preguntasVisibles.length}</p>
              <p>Respuestas: {Object.keys(respuestas).length}</p>
              <p>Campos "Otro" activos: {Object.keys(campos_otro).length}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FormularioRenderer; 