/**
 * Componente para preguntas con lógica condicional
 * Maneja visibilidad, animaciones y validación de dependencias
 */

import React, { useEffect, useState, ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  HelpCircle, 
  AlertTriangle, 
  CheckCircle2,
  Eye,
  EyeOff,
  ArrowRight,
  Link
} from 'lucide-react';
import { PreguntaCondicional as PreguntaCondicionalType, RespuestaConOtro } from '@/types/industria';
import { useConditionalQuestions } from '../hooks/useConditionalQuestions';

interface PreguntaCondicionalProps {
  pregunta: PreguntaCondicionalType;
  respuestas: Record<number, RespuestaConOtro>;
  onRespuestaChange: (preguntaId: number, valor: any, valorOtro?: string) => void;
  visible?: boolean;
  showDependencyInfo?: boolean;
  animationDuration?: number;
  children?: ReactNode;
}

const PreguntaCondicional: React.FC<PreguntaCondicionalProps> = ({
  pregunta,
  respuestas,
  onRespuestaChange,
  visible = true,
  showDependencyInfo = true,
  animationDuration = 300,
  children
}) => {
  // Estados locales para animaciones
  const [isVisible, setIsVisible] = useState(visible);
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(visible);

  // Hook para evaluación condicional
  const { 
    evaluateCondition,
    obtenerPreguntasDependientes,
    validateDependencies
  } = useConditionalQuestions({
    preguntas: [pregunta],
    respuestas: Object.fromEntries(
      Object.entries(respuestas).map(([id, resp]) => [parseInt(id), resp.valor])
    )
  });

  // Estados derivados
  const respuestaActual = respuestas[pregunta.id];
  const tieneRespuesta = respuestaActual && respuestaActual.valor !== undefined && respuestaActual.valor !== '';
  const esCondicional = !!pregunta.pregunta_padre_id;
  const preguntasDependientes = obtenerPreguntasDependientes(pregunta.id);
  const validacionDependencias = validateDependencies(pregunta);

  // Información de la pregunta padre
  const preguntaPadre = pregunta.pregunta_padre_id ? respuestas[pregunta.pregunta_padre_id] : null;
  const respuestaPadreValida = preguntaPadre && preguntaPadre.valor !== undefined;

  // Evaluación de condición
  const deberiaEstarVisible = !esCondicional || evaluateCondition(pregunta, 
    Object.fromEntries(
      Object.entries(respuestas).map(([id, resp]) => [parseInt(id), resp.valor])
    )
  );

  // Efecto para manejar animaciones de visibilidad
  useEffect(() => {
    if (visible !== isVisible) {
      setIsAnimating(true);
      
      if (visible) {
        // Mostrando: primero renderizar, luego animar
        setShouldRender(true);
        setTimeout(() => {
          setIsVisible(true);
          setTimeout(() => setIsAnimating(false), animationDuration);
        }, 10);
      } else {
        // Ocultando: primero animar, luego dejar de renderizar
        setIsVisible(false);
        setTimeout(() => {
          setShouldRender(false);
          setIsAnimating(false);
        }, animationDuration);
      }
    }
  }, [visible, isVisible, animationDuration]);

  // Función para generar información de dependencia
  const getDependencyInfo = () => {
    if (!esCondicional) return null;

    let statusIcon;
    let statusText;
    let statusColor;

    if (!respuestaPadreValida) {
      statusIcon = <AlertTriangle className="h-3 w-3" />;
      statusText = "Esperando respuesta padre";
      statusColor = "text-yellow-600 bg-yellow-50";
    } else if (deberiaEstarVisible) {
      statusIcon = <CheckCircle2 className="h-3 w-3" />;
      statusText = "Condición cumplida";
      statusColor = "text-green-600 bg-green-50";
    } else {
      statusIcon = <EyeOff className="h-3 w-3" />;
      statusText = "Condición no cumplida";
      statusColor = "text-gray-600 bg-gray-50";
    }

    return {
      statusIcon,
      statusText,
      statusColor
    };
  };

  // Función para obtener descripción de la condición
  const getConditionDescription = () => {
    if (!esCondicional || !pregunta.condicion_operador || !pregunta.condicion_valor) {
      return null;
    }

    const operadorTexto = {
      '=': 'es igual a',
      '!=': 'es diferente de',
      'includes': 'incluye',
      'not_includes': 'no incluye'
    }[pregunta.condicion_operador] || pregunta.condicion_operador;

    const valorCondicion = typeof pregunta.condicion_valor === 'object' 
      ? pregunta.condicion_valor.valor 
      : pregunta.condicion_valor;

    return `Se muestra cuando la pregunta padre ${operadorTexto} "${valorCondicion}"`;
  };

  // Si no debe renderizarse, no mostrar nada
  if (!shouldRender) {
    return null;
  }

  const dependencyInfo = getDependencyInfo();
  const conditionDescription = getConditionDescription();

  return (
    <div 
      className={`
        transition-all duration-${animationDuration} ease-in-out
        ${isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-2'}
        ${isAnimating ? 'pointer-events-none' : ''}
      `}
      style={{
        transitionDuration: `${animationDuration}ms`
      }}
    >
      {/* Información de dependencia */}
      {showDependencyInfo && esCondicional && (
        <div className="mb-3">
          <div className="flex items-center gap-2 text-xs">
            {/* Indicador de estado */}
            {dependencyInfo && (
              <div className={`flex items-center gap-1 px-2 py-1 rounded-md ${dependencyInfo.statusColor}`}>
                {dependencyInfo.statusIcon}
                <span>{dependencyInfo.statusText}</span>
              </div>
            )}

            {/* Enlace a pregunta padre */}
            <div className="flex items-center gap-1 text-gray-500">
              <Link className="h-3 w-3" />
              <span>Depende de pregunta #{pregunta.pregunta_padre_id}</span>
            </div>

            {/* Indicador de preguntas dependientes */}
            {preguntasDependientes.length > 0 && (
              <div className="flex items-center gap-1 text-blue-600">
                <ArrowRight className="h-3 w-3" />
                <span>{preguntasDependientes.length} pregunta(s) depende(n) de esta</span>
              </div>
            )}
          </div>

          {/* Descripción de la condición */}
          {conditionDescription && (
            <div className="mt-1 text-xs text-gray-600 italic">
              {conditionDescription}
            </div>
          )}
        </div>
      )}

      {/* Alertas de validación */}
      {!validacionDependencias.valida && (
        <Alert variant="destructive" className="mb-3">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Problemas de dependencia:</strong>
            <ul className="list-disc list-inside mt-1">
              {validacionDependencias.errores.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {validacionDependencias.advertencias.length > 0 && (
        <Alert className="mb-3">
          <HelpCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Advertencias:</strong>
            <ul className="list-disc list-inside mt-1">
              {validacionDependencias.advertencias.map((advertencia, index) => (
                <li key={index}>{advertencia}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Contenido principal */}
      <div 
        className={`
          relative
          ${esCondicional ? 'border-l-4 border-blue-200 pl-4' : ''}
          ${!deberiaEstarVisible ? 'opacity-50' : ''}
        `}
      >
        {/* Badges informativos */}
        <div className="flex items-center gap-2 mb-3">
          {esCondicional && (
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

          {pregunta.tiene_opcion_otro && (
            <Badge variant="secondary" className="text-xs">
              Con campo "Otro"
            </Badge>
          )}

          {tieneRespuesta && (
            <Badge variant="default" className="text-xs">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Respondida
            </Badge>
          )}

          {!deberiaEstarVisible && (
            <Badge variant="outline" className="text-xs">
              <EyeOff className="h-3 w-3 mr-1" />
              Oculta
            </Badge>
          )}
        </div>

        {/* Contenido hijo */}
        <div className={!deberiaEstarVisible ? 'pointer-events-none' : ''}>
          {children}
        </div>

        {/* Información de debug en desarrollo */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
            <div><strong>Debug - Pregunta #{pregunta.id}:</strong></div>
            <div>Visible: {visible ? 'Sí' : 'No'}</div>
            <div>Debería estar visible: {deberiaEstarVisible ? 'Sí' : 'No'}</div>
            <div>Es condicional: {esCondicional ? 'Sí' : 'No'}</div>
            <div>Tiene respuesta: {tieneRespuesta ? 'Sí' : 'No'}</div>
            <div>Dependientes: {preguntasDependientes.length}</div>
            {esCondicional && (
              <>
                <div>Pregunta padre: #{pregunta.pregunta_padre_id}</div>
                <div>Operador: {pregunta.condicion_operador}</div>
                <div>Valor esperado: {JSON.stringify(pregunta.condicion_valor)}</div>
                <div>Respuesta padre válida: {respuestaPadreValida ? 'Sí' : 'No'}</div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PreguntaCondicional; 