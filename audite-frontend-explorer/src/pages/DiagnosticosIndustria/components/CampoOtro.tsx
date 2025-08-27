/**
 * Componente para campos "Otro" dinámicos
 * Se muestra cuando el usuario selecciona la opción "Otro"
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Edit3, 
  AlertTriangle, 
  CheckCircle2,
  Clock,
  Type,
  Save
} from 'lucide-react';

interface CampoOtroProps {
  preguntaId: number;
  placeholder?: string;
  valor?: string;
  required?: boolean;
  onChange?: (valor: string) => void;
  visible?: boolean;
  maxLength?: number;
  type?: 'text' | 'textarea';
  debounceMs?: number;
  showCharacterCount?: boolean;
  autoFocus?: boolean;
  validateOnChange?: boolean;
  customValidation?: (value: string) => string | null;
}

const CampoOtro: React.FC<CampoOtroProps> = ({
  preguntaId,
  placeholder = 'Especificar...',
  valor = '',
  required = false,
  onChange,
  visible = false,
  maxLength = 500,
  type = 'text',
  debounceMs = 500,
  showCharacterCount = true,
  autoFocus = true,
  validateOnChange = true,
  customValidation
}) => {
  // Estados locales
  const [localValue, setLocalValue] = useState(valor);
  const [isFocused, setIsFocused] = useState(false);
  const [hasChanged, setHasChanged] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<string>(valor);

  // Referencias
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();

  // Estados derivados
  const isVisible = visible;
  const isEmpty = !localValue || localValue.trim() === '';
  const isValid = !validationError && (!required || !isEmpty);
  const characterCount = localValue.length;
  const isNearLimit = characterCount > maxLength * 0.8;
  const isOverLimit = characterCount > maxLength;
  const hasUnsavedChanges = localValue !== lastSaved;

  // Función de validación
  const validateValue = (value: string): string | null => {
    // Validación requerido
    if (required && (!value || value.trim() === '')) {
      return 'Este campo es requerido';
    }

    // Validación de longitud
    if (value.length > maxLength) {
      return `El texto no puede exceder ${maxLength} caracteres`;
    }

    // Validación personalizada
    if (customValidation) {
      return customValidation(value);
    }

    return null;
  };

  // Efecto para sincronizar valor externo
  useEffect(() => {
    if (valor !== localValue) {
      setLocalValue(valor);
      setLastSaved(valor);
    }
  }, [valor]);

  // Efecto para auto-focus cuando se hace visible
  useEffect(() => {
    if (visible && autoFocus) {
      const timer = setTimeout(() => {
        if (type === 'textarea') {
          textareaRef.current?.focus();
        } else {
          inputRef.current?.focus();
        }
      }, 150); // Pequeño delay para animaciones

      return () => clearTimeout(timer);
    }
  }, [visible, autoFocus, type]);

  // Efecto para debounce y envío de cambios
  useEffect(() => {
    if (hasChanged) {
      // Limpiar timeout anterior
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Configurar nuevo timeout
      debounceTimeoutRef.current = setTimeout(() => {
        if (validateOnChange) {
          setIsValidating(true);
          const error = validateValue(localValue);
          setValidationError(error);
          setIsValidating(false);
        }

        // Enviar cambio al padre
        onChange?.(localValue);
        setLastSaved(localValue);
        setHasChanged(false);
      }, debounceMs);
    }

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [localValue, hasChanged, debounceMs, validateOnChange, onChange]);

  // Función para manejar cambios
  const handleChange = (newValue: string) => {
    setLocalValue(newValue);
    setHasChanged(true);
  };

  // Función para manejar pérdida de foco
  const handleBlur = () => {
    setIsFocused(false);
    
    // Validar inmediatamente al perder foco
    if (validateOnChange) {
      const error = validateValue(localValue);
      setValidationError(error);
    }

    // Enviar cambio inmediatamente si hay cambios pendientes
    if (hasChanged) {
      onChange?.(localValue);
      setLastSaved(localValue);
      setHasChanged(false);
    }
  };

  // Función para manejar focus
  const handleFocus = () => {
    setIsFocused(true);
  };

  // Si no es visible, no renderizar nada
  if (!isVisible) {
    return null;
  }

  return (
    <div 
      className={`
        transition-all duration-300 ease-in-out
        ${isVisible ? 'opacity-100 transform translate-y-0 max-h-96' : 'opacity-0 transform -translate-y-2 max-h-0 overflow-hidden'}
      `}
    >
      <Card className={`
        mt-3 border-dashed
        ${isFocused ? 'border-blue-500 shadow-sm' : 'border-gray-300'}
        ${validationError ? 'border-red-500' : ''}
        ${isValid && !isEmpty ? 'border-green-500' : ''}
      `}>
        <CardContent className="pt-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Edit3 className="h-4 w-4 text-gray-500" />
              <Label className="text-sm font-medium text-gray-700">
                Especificar "Otro"
                {required && <span className="text-red-500 ml-1">*</span>}
              </Label>
            </div>

            {/* Badges de estado */}
            <div className="flex items-center gap-2">
              {isValidating && (
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  Validando...
                </Badge>
              )}

              {hasUnsavedChanges && (
                <Badge variant="secondary" className="text-xs">
                  <Type className="h-3 w-3 mr-1" />
                  Escribiendo...
                </Badge>
              )}

              {isValid && !isEmpty && !hasUnsavedChanges && (
                <Badge variant="default" className="text-xs">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Guardado
                </Badge>
              )}
            </div>
          </div>

          {/* Campo de entrada */}
          <div className="space-y-2">
            {type === 'textarea' ? (
              <Textarea
                ref={textareaRef}
                value={localValue}
                onChange={(e) => handleChange(e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder={placeholder}
                maxLength={maxLength}
                rows={3}
                className={`
                  resize-none transition-all duration-200
                  ${validationError ? 'border-red-500 focus:border-red-500' : ''}
                  ${isValid && !isEmpty ? 'border-green-500 focus:border-green-500' : ''}
                `}
              />
            ) : (
              <Input
                ref={inputRef}
                value={localValue}
                onChange={(e) => handleChange(e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder={placeholder}
                maxLength={maxLength}
                className={`
                  transition-all duration-200
                  ${validationError ? 'border-red-500 focus:border-red-500' : ''}
                  ${isValid && !isEmpty ? 'border-green-500 focus:border-green-500' : ''}
                `}
              />
            )}

            {/* Información adicional */}
            <div className="flex justify-between items-center text-xs">
              {/* Contador de caracteres */}
              {showCharacterCount && (
                <div className={`
                  ${isOverLimit ? 'text-red-600' : isNearLimit ? 'text-yellow-600' : 'text-gray-500'}
                `}>
                  {characterCount} / {maxLength} caracteres
                </div>
              )}

              {/* Indicador de auto-guardado */}
              {debounceMs > 0 && (
                <div className="text-gray-400">
                  Auto-guardado en {Math.round(debounceMs / 1000)}s
                </div>
              )}
            </div>
          </div>

          {/* Alertas de validación */}
          {validationError && (
            <Alert variant="destructive" className="mt-3">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                {validationError}
              </AlertDescription>
            </Alert>
          )}

          {/* Mensaje de éxito */}
          {isValid && !isEmpty && !hasUnsavedChanges && !validationError && (
            <Alert className="mt-3">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription className="text-sm text-green-700">
                Respuesta guardada correctamente
              </AlertDescription>
            </Alert>
          )}

          {/* Ayuda contextual */}
          {isFocused && isEmpty && (
            <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-700">
              💡 <strong>Consejo:</strong> Sé específico en tu respuesta para obtener mejores recomendaciones.
            </div>
          )}

          {/* Información de debug en desarrollo */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
              <div><strong>Debug - Campo Otro #{preguntaId}:</strong></div>
              <div>Visible: {isVisible ? 'Sí' : 'No'}</div>
              <div>Valor local: "{localValue}"</div>
              <div>Último guardado: "{lastSaved}"</div>
              <div>Tiene cambios: {hasUnsavedChanges ? 'Sí' : 'No'}</div>
              <div>Es válido: {isValid ? 'Sí' : 'No'}</div>
              <div>Error: {validationError || 'Ninguno'}</div>
              <div>Caracteres: {characterCount}/{maxLength}</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CampoOtro; 