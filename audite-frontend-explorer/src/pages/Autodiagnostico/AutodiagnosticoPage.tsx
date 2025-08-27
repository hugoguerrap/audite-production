import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { useAutodiagnostico } from '@/hooks/useAutodiagnostico';
import AutodiagnosticoStep from './AutodiagnosticoStep';
import AutodiagnosticoComplete from './AutodiagnosticoComplete';

const AutodiagnosticoPage = () => {
  const navigate = useNavigate();
  const {
    preguntas,
    currentStep,
    sessionId,
    loading,
    error,
    nextStep,
    prevStep,
    resetForm,
    isCurrentStepValid,
    isComplete,
    progress,
    submitSingleRespuesta,
    saveRespuesta,
    respuestas,
    submitRespuestas
  } = useAutodiagnostico();

  const handleNext = async () => {
    const currentPregunta = preguntas[currentStep];
    if (!currentPregunta) return;

    if (currentStep === preguntas.length - 1) {
      // Es la última pregunta, enviar todas las respuestas ANTES de avanzar
      // Incluir todas las respuestas, incluyendo la actual
      const todasLasRespuestas = { ...respuestas };
      // Asegurar que la respuesta actual esté incluida
      if (respuestas[currentPregunta.id] !== undefined) {
        todasLasRespuestas[currentPregunta.id] = respuestas[currentPregunta.id];
      }
      
      const allRespuestas = Object.entries(todasLasRespuestas).map(([preguntaId, valor]) => {
        const pregunta = preguntas.find(p => p.id === parseInt(preguntaId));
        if (!pregunta) return null;

        const respuesta: any = {
          session_id: sessionId,
          pregunta_id: parseInt(preguntaId),
        };

        switch (pregunta.tipo_respuesta) {
          case 'radio':
          case 'select':
            respuesta.opcion_seleccionada = valor as string;
            break;
          case 'checkbox':
            respuesta.opciones_seleccionadas = valor as string[];
            break;
          case 'text':
            respuesta.respuesta_texto = valor as string;
            break;
          case 'number':
            respuesta.respuesta_numero = valor as number;
            break;
          case 'ordering':
            respuesta.respuesta_texto = JSON.stringify(valor);
            break;
        }

        return respuesta;
      }).filter(Boolean);

      // Enviar todas las respuestas y esperar confirmación
      const finalSessionId = await submitRespuestas(allRespuestas);
      if (finalSessionId) {
        // Solo avanzar después de que se envíen exitosamente
        console.log('Respuestas enviadas exitosamente, sessionId final:', finalSessionId);
        nextStep();
      } else {
        // Si hay error, mostrar mensaje pero no avanzar
        console.error('Error al enviar las respuestas');
      }
    } else {
      // No es la última pregunta, solo avanzar
      nextStep();
    }
  };

  const handlePrev = () => {
    prevStep();
  };

  const handleStart = () => {
    resetForm();
  };

  if (loading && preguntas.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/10">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Cargando autodiagnóstico...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/10">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-red-500 mb-4">❌</div>
              <h3 className="text-lg font-semibold mb-2">Error al cargar</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Intentar de nuevo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (preguntas.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/10">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">No hay preguntas disponibles</h3>
              <p className="text-muted-foreground mb-4">
                No se encontraron preguntas para el autodiagnóstico.
              </p>
              <Button onClick={() => navigate('/')}>
                Volver al inicio
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mostrar pantalla de completado si estamos al final
  if (currentStep >= preguntas.length) {
    console.log('Mostrando pantalla de completado con sessionId:', sessionId);
    return <AutodiagnosticoComplete sessionId={sessionId} onRestart={handleStart} />;
  }

  const currentPregunta = preguntas[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al inicio
          </Button>
          
          <div className="text-center">
            {/* Logo de AuditE en el autodiagnóstico */}
            <div className="flex justify-center mb-10">
              <img 
                src="/logo primary@2x.png" 
                alt="AuditE - Conecta. Ahorra. Transforma." 
                className="h-32 w-auto object-contain"
                style={{ maxWidth: '500px' }}
              />
            </div>
            
            <h1 className="text-3xl font-bold mb-2">Autodiagnóstico Energético</h1>
            <p className="text-muted-foreground mb-4">
              Responde a estas preguntas para obtener recomendaciones personalizadas
            </p>
            
            {/* Progress bar */}
            <div className="max-w-md mx-auto">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Pregunta {currentStep + 1} de {preguntas.length}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                  {currentStep + 1}
                </span>
                {currentPregunta.pregunta}
              </CardTitle>
              {currentPregunta.ayuda_texto && (
                <p className="text-sm text-muted-foreground">
                  {currentPregunta.ayuda_texto}
                </p>
              )}
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Render current step */}
              <AutodiagnosticoStep 
                pregunta={currentPregunta}
                value={respuestas[currentPregunta.id]}
                onChange={(value) => saveRespuesta(currentPregunta.id, value)}
                loading={loading}
                selectedProcesses={
                  // Para la pregunta 6 (ordenamiento), pasar los procesos seleccionados de la pregunta 5
                  currentPregunta.numero_orden === 6 
                    ? (respuestas[preguntas.find(p => p.numero_orden === 5)?.id || 0] as string[] || [])
                    : undefined
                }
              />

              {/* Navigation buttons */}
              <div className="flex justify-between pt-6">
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Anterior
                </Button>

                <div className="flex gap-2">
                  {currentStep === preguntas.length - 1 ? (
                    <Button
                      onClick={handleNext}
                      disabled={!isCurrentStepValid() || loading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {loading ? (
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Finalizar
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNext}
                      disabled={!isCurrentStepValid() || loading}
                    >
                      {loading ? (
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      ) : (
                        <>Siguiente <ArrowRight className="h-4 w-4 ml-2" /></>
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {/* Step indicators */}
              <div className="flex justify-center space-x-2 pt-4">
                {preguntas.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentStep
                        ? 'bg-primary'
                        : index < currentStep
                        ? 'bg-green-500'
                        : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Session ID display for debugging */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 text-center">
            <p className="text-xs text-muted-foreground">
              Session ID: {sessionId}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AutodiagnosticoPage; 