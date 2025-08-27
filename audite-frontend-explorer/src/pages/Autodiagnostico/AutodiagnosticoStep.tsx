import React from 'react';
import { AutodiagnosticoPregunta, OrderingResponse } from '@/types/autodiagnostico';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ProcessOrderingComponent from '@/components/ProcessOrderingComponent';

interface AutodiagnosticoStepProps {
  pregunta: AutodiagnosticoPregunta;
  value: string | number | string[] | OrderingResponse | undefined;
  onChange: (value: string | number | string[] | OrderingResponse) => void;
  loading?: boolean;
  // Para el ordenamiento, necesitamos los procesos seleccionados de la pregunta anterior
  selectedProcesses?: string[];
}

const AutodiagnosticoStep: React.FC<AutodiagnosticoStepProps> = ({
  pregunta,
  value,
  onChange,
  loading = false,
  selectedProcesses,
}) => {

  const renderRadioInput = () => (
    <RadioGroup
      value={value as string || ''}
      onValueChange={(newValue) => onChange(newValue)}
      className="space-y-3"
    >
      {pregunta.opciones.map((opcion) => (
        <div key={opcion.id} className="flex items-center space-x-2">
          <RadioGroupItem 
            value={opcion.valor} 
            id={`radio-${opcion.id}`}
            disabled={loading}
          />
          <Label 
            htmlFor={`radio-${opcion.id}`} 
            className="cursor-pointer flex-1 text-base"
          >
            {opcion.texto_opcion}
          </Label>
        </div>
      ))}
    </RadioGroup>
  );

  const renderCheckboxInput = () => {
    const selectedValues = Array.isArray(value) ? value : [];
    
    return (
      <div className="space-y-3">
        {pregunta.opciones.map((opcion) => (
          <div key={opcion.id} className="flex items-center space-x-2">
            <Checkbox
              id={`checkbox-${opcion.id}`}
              checked={selectedValues.includes(opcion.valor)}
              onCheckedChange={(checked) => {
                if (checked) {
                  onChange([...selectedValues, opcion.valor]);
                } else {
                  onChange(selectedValues.filter(v => v !== opcion.valor));
                }
              }}
              disabled={loading}
            />
            <Label 
              htmlFor={`checkbox-${opcion.id}`} 
              className="cursor-pointer flex-1 text-base"
            >
              {opcion.texto_opcion}
            </Label>
          </div>
        ))}
      </div>
    );
  };

  const renderSelectInput = () => (
    <Select
      value={value as string || ''}
      onValueChange={(newValue) => onChange(newValue)}
      disabled={loading}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Selecciona una opción..." />
      </SelectTrigger>
      <SelectContent>
        {pregunta.opciones.map((opcion) => (
          <SelectItem key={opcion.id} value={opcion.valor}>
            {opcion.texto_opcion}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  const renderTextInput = () => {
    const preguntaLower = pregunta.pregunta.toLowerCase();
    
    // Determinar si es un campo largo
    const isLongText = preguntaLower.includes('comentarios') || 
                      preguntaLower.includes('describe') || 
                      preguntaLower.includes('explica') ||
                      preguntaLower.includes('detalles') ||
                      preguntaLower.includes('ordena');

    // Determinar el tipo y placeholder específico
    let inputType = "text";
    let placeholder = "Escribe tu respuesta...";
    
    if (preguntaLower.includes('email') || preguntaLower.includes('correo')) {
      inputType = "email";
      placeholder = "ejemplo@correo.com";
    } else if (preguntaLower.includes('teléfono') || preguntaLower.includes('telefono')) {
      inputType = "tel";
      placeholder = "+56 9 1234 5678";
    } else if (preguntaLower.includes('nombre')) {
      placeholder = "Tu nombre completo";
    } else if (preguntaLower.includes('empresa') || preguntaLower.includes('finca')) {
      placeholder = "Nombre de tu empresa o finca";
    } else if (preguntaLower.includes('ordena')) {
      placeholder = "Ejemplo: 1. Refrigeración (40%), 2. Riego (30%)...";
    } else if (preguntaLower.includes('cantidad')) {
      placeholder = "Ingresa la cantidad estimada";
    }

    if (isLongText) {
      return (
        <Textarea
          value={value as string || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-h-[100px] resize-none"
          disabled={loading}
        />
      );
    }

    return (
      <Input
        type={inputType}
        value={value as string || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={loading}
        className="text-base"
      />
    );
  };

  const renderNumberInput = () => (
    <Input
      type="number"
      value={value as number || ''}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      placeholder="Ingresa un número..."
      min="0"
      step="0.01"
      disabled={loading}
    />
  );

  const renderInput = () => {
    // Mapear tipos de respuesta del backend a tipos del frontend
    const tipoMapeado = pregunta.tipo_respuesta === 'seleccion_unica' ? 'radio' :
                        pregunta.tipo_respuesta === 'seleccion_multiple' ? 'checkbox' :
                        pregunta.tipo_respuesta === 'texto' ? 'text' :
                        pregunta.tipo_respuesta === 'numero' ? 'number' :
                        pregunta.tipo_respuesta;
    
    switch (tipoMapeado) {
      case 'radio':
        return renderRadioInput();
      case 'checkbox':
        return renderCheckboxInput();
      case 'select':
        return renderSelectInput();
      case 'text':
        return renderTextInput();
      case 'number':
        return renderNumberInput();
      case 'ordering':
        return (
          <ProcessOrderingComponent
            selectedProcesses={selectedProcesses || []}
            value={value as OrderingResponse}
            onChange={(orderingValue) => onChange(orderingValue)}
          />
        );
      default:
        return (
          <div className="text-red-500 p-4 border border-red-200 rounded">
            Tipo de pregunta no soportado: {pregunta.tipo_respuesta} (mapeado: {tipoMapeado})
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      {pregunta.es_obligatoria && (
        <p className="text-sm text-muted-foreground">
          * Campo obligatorio
        </p>
      )}
      
      <div className="space-y-4">
        {renderInput()}
      </div>

      {/* Mostrar opciones especiales como botones auxiliares para radio/checkbox */}
      {((pregunta.tipo_respuesta === 'radio' || pregunta.tipo_respuesta === 'checkbox') ||
        (pregunta.tipo_respuesta === 'seleccion_unica' || pregunta.tipo_respuesta === 'seleccion_multiple')) && 
       pregunta.opciones.some(op => op.es_especial) && (
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground mb-2">Opciones rápidas:</p>
          <div className="flex flex-wrap gap-2">
            {pregunta.opciones
              .filter(op => op.es_especial)
              .map((opcion) => (
                <Button
                  key={opcion.id}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (pregunta.tipo_respuesta === 'radio' || pregunta.tipo_respuesta === 'seleccion_unica') {
                      onChange(opcion.valor);
                    } else if (pregunta.tipo_respuesta === 'checkbox' || pregunta.tipo_respuesta === 'seleccion_multiple') {
                      const selectedValues = Array.isArray(value) ? value : [];
                      if (selectedValues.includes(opcion.valor)) {
                        onChange(selectedValues.filter(v => v !== opcion.valor));
                      } else {
                        onChange([...selectedValues, opcion.valor]);
                      }
                    }
                  }}
                  disabled={loading}
                  className={
                    (pregunta.tipo_respuesta === 'radio' || pregunta.tipo_respuesta === 'seleccion_unica')
                      ? (value === opcion.valor ? 'bg-primary/10 border-primary' : '')
                      : (Array.isArray(value) && value.includes(opcion.valor) ? 'bg-primary/10 border-primary' : '')
                  }
                >
                  {opcion.texto_opcion}
                </Button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AutodiagnosticoStep; 