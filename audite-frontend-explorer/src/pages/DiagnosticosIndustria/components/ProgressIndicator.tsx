/**
 * Componente indicador de progreso para formularios dinámicos
 * Muestra progreso considerando preguntas condicionales
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  Circle, 
  Clock,
  Target,
  Eye,
  HelpCircle,
  TrendingUp,
  BarChart3
} from 'lucide-react';

interface ProgressIndicatorProps {
  currentStep?: number;
  totalSteps?: number;
  visibleSteps?: number;
  completedSteps?: number;
  estimatedTimeMinutes?: number;
  showDetailedInfo?: boolean;
  showTimeEstimate?: boolean;
  showStepMap?: boolean;
  sectionNames?: string[];
  conditionalStepsHidden?: number;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ 
  currentStep = 0,
  totalSteps = 0,
  visibleSteps = 0,
  completedSteps = 0,
  estimatedTimeMinutes = 0,
  showDetailedInfo = true,
  showTimeEstimate = true,
  showStepMap = false,
  sectionNames = [],
  conditionalStepsHidden = 0
}) => {
  // Cálculos de progreso
  const progressPercentage = totalSteps > 0 ? Math.round((currentStep / totalSteps) * 100) : 0;
  const completionPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  const visibilityPercentage = totalSteps > 0 ? Math.round((visibleSteps / totalSteps) * 100) : 0;
  
  // Estimaciones de tiempo
  const timePerStep = totalSteps > 0 ? estimatedTimeMinutes / totalSteps : 0;
  const estimatedRemainingTime = Math.round((totalSteps - currentStep) * timePerStep);
  const elapsedTime = Math.round(currentStep * timePerStep);
  
  // Estados derivados
  const isCompleted = currentStep >= totalSteps;
  const hasConditionalQuestions = conditionalStepsHidden > 0;
  const progressIsAhead = currentStep > completedSteps;

  // Función para formatear tiempo
  const formatTime = (minutes: number): string => {
    if (minutes < 1) return 'menos de 1 min';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  // Función para obtener color del progreso
  const getProgressColor = (): string => {
    if (isCompleted) return 'bg-green-500';
    if (progressPercentage >= 75) return 'bg-blue-500';
    if (progressPercentage >= 50) return 'bg-yellow-500';
    if (progressPercentage >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  // Función para generar mini-mapa de secciones
  const renderStepMap = () => {
    if (!showStepMap || totalSteps === 0) return null;

    const stepsPerSection = Math.ceil(totalSteps / (sectionNames.length || 4));
    const sections = sectionNames.length > 0 ? sectionNames : 
      ['Inicio', 'Información Básica', 'Detalles', 'Finalización'];

    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Mapa de Progreso
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {sections.map((sectionName, index) => {
            const sectionStart = index * stepsPerSection;
            const sectionEnd = Math.min((index + 1) * stepsPerSection, totalSteps);
            const sectionProgress = Math.max(0, Math.min(currentStep - sectionStart, stepsPerSection));
            const sectionPercentage = (sectionProgress / stepsPerSection) * 100;
            const isCurrentSection = currentStep >= sectionStart && currentStep < sectionEnd;

            return (
              <div 
                key={index}
                className={`
                  p-2 rounded-lg border text-xs text-center transition-all
                  ${isCurrentSection 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-200 bg-gray-50 text-gray-600'
                  }
                `}
              >
                <div className="font-medium mb-1">{sectionName}</div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full transition-all ${
                      sectionPercentage === 100 ? 'bg-green-500' : 
                      isCurrentSection ? 'bg-blue-500' : 'bg-gray-400'
                    }`}
                    style={{ width: `${sectionPercentage}%` }}
                  />
                </div>
                <div className="mt-1 text-xs">
                  {Math.round(sectionPercentage)}%
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5" />
              Progreso del Diagnóstico
            </CardTitle>
            {showDetailedInfo && (
              <CardDescription>
                Paso {currentStep} de {totalSteps}
                {hasConditionalQuestions && ` (${conditionalStepsHidden} ocultas)`}
              </CardDescription>
            )}
          </div>
          
          {/* Badge de estado */}
          <Badge 
            variant={isCompleted ? "default" : progressPercentage >= 50 ? "secondary" : "outline"}
            className="flex items-center gap-1"
          >
            {isCompleted ? (
              <>
                <CheckCircle2 className="h-3 w-3" />
                Completado
              </>
            ) : (
              <>
                <TrendingUp className="h-3 w-3" />
                {progressPercentage}%
              </>
            )}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Barra de progreso principal */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Progreso general</span>
            <span className="font-medium">{progressPercentage}%</span>
          </div>
          <Progress 
            value={progressPercentage} 
            className="h-3"
          />
        </div>

        {/* Información detallada */}
        {showDetailedInfo && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {/* Paso actual */}
            <div className="text-center p-2 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                <Circle className="h-4 w-4" />
                <span className="font-medium">Actual</span>
              </div>
              <div className="text-lg font-bold text-blue-700">{currentStep}</div>
            </div>

            {/* Total de pasos */}
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                <BarChart3 className="h-4 w-4" />
                <span className="font-medium">Total</span>
              </div>
              <div className="text-lg font-bold text-gray-700">{totalSteps}</div>
            </div>

            {/* Pasos visibles */}
            <div className="text-center p-2 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                <Eye className="h-4 w-4" />
                <span className="font-medium">Visibles</span>
              </div>
              <div className="text-lg font-bold text-green-700">{visibleSteps}</div>
            </div>

            {/* Pasos completados */}
            <div className="text-center p-2 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
                <CheckCircle2 className="h-4 w-4" />
                <span className="font-medium">Completados</span>
              </div>
              <div className="text-lg font-bold text-purple-700">{completedSteps}</div>
            </div>
          </div>
        )}

        {/* Estimación de tiempo */}
        {showTimeEstimate && estimatedTimeMinutes > 0 && (
          <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
            <div className="flex items-center gap-2 text-amber-700">
              <Clock className="h-4 w-4" />
              <span className="font-medium">Tiempo estimado</span>
            </div>
            <div className="text-sm text-amber-600">
              {elapsedTime > 0 && (
                <span className="mr-2">
                  Transcurrido: {formatTime(elapsedTime)}
                </span>
              )}
              <span className="font-medium">
                Restante: {formatTime(estimatedRemainingTime)}
              </span>
            </div>
          </div>
        )}

        {/* Alertas e información adicional */}
        {hasConditionalQuestions && (
          <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg text-blue-700 text-sm">
            <HelpCircle className="h-4 w-4" />
            <span>
              {conditionalStepsHidden} pregunta{conditionalStepsHidden !== 1 ? 's' : ''} oculta{conditionalStepsHidden !== 1 ? 's' : ''} por lógica condicional
            </span>
          </div>
        )}

        {progressIsAhead && (
          <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg text-yellow-700 text-sm">
            <TrendingUp className="h-4 w-4" />
            <span>
              Estás navegando más rápido de lo completado. Asegúrate de responder todas las preguntas.
            </span>
          </div>
        )}

        {/* Mini-mapa de secciones */}
        {renderStepMap()}

        {/* Información de debug en desarrollo */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-3 bg-gray-50 rounded text-xs text-gray-600 space-y-1">
            <div><strong>Debug - ProgressIndicator:</strong></div>
            <div>currentStep: {currentStep}, totalSteps: {totalSteps}</div>
            <div>visibleSteps: {visibleSteps}, completedSteps: {completedSteps}</div>
            <div>progressPercentage: {progressPercentage}%, completionPercentage: {completionPercentage}%</div>
            <div>estimatedTimeMinutes: {estimatedTimeMinutes}, remaining: {estimatedRemainingTime}</div>
            <div>conditionalStepsHidden: {conditionalStepsHidden}</div>
            <div>isCompleted: {isCompleted ? 'true' : 'false'}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProgressIndicator; 