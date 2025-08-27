import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Home, RotateCcw, Mail, Phone, MessageCircle, Lightbulb, AlertCircle, Building2, Target, ArrowRight } from 'lucide-react';
import { AutodiagnosticoSugerencia } from '@/types/autodiagnostico';
import { CategoriaIndustria } from '@/types/industria';
import { API } from '@/config/api';
import { useIndustryCategories } from '../DiagnosticosIndustria/hooks/useIndustryCategories';

interface AutodiagnosticoCompleteProps {
  sessionId: string;
  onRestart: () => void;
  // Nuevas props para soporte de industrias
  categoriaIndustria?: CategoriaIndustria;
  formularioIndustriaId?: number;
  tipoFormulario?: 'general' | 'industria';
}

const AutodiagnosticoComplete: React.FC<AutodiagnosticoCompleteProps> = ({
  sessionId,
  onRestart,
  categoriaIndustria,
  formularioIndustriaId,
  tipoFormulario = 'general'
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sugerencias, setSugerencias] = useState<AutodiagnosticoSugerencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hook para categorías (para navegación entre industrias)
  const { categorias, loading: loadingCategorias } = useIndustryCategories();

  // Detectar automáticamente el tipo de formulario basado en la URL
  const tipoFormularioDetectado = location.pathname.includes('/diagnostico-industria/') ? 'industria' : 'general';
  const tipoFinal = tipoFormulario || tipoFormularioDetectado;

  // Función para abrir WhatsApp con mensaje personalizado
  const openWhatsApp = () => {
    const phoneNumber = "56935116312"; // Número real de AuditE
    
    let message = "";
    if (tipoFinal === 'industria' && categoriaIndustria) {
      message = `¡Hola! He completado el diagnóstico energético especializado para ${categoriaIndustria.nombre} en AuditE y me gustaría obtener más información sobre servicios de consultoría específicos para mi sector industrial.`;
    } else {
      message = "¡Hola! He completado el autodiagnóstico energético en AuditE y me gustaría obtener más información sobre sus servicios de consultoría energética.";
    }
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  // Función para abrir email con mensaje personalizado
  const openEmail = () => {
    const email = "contacto@audite.cl";
    
    let subject = "";
    let body = "";
    
    if (tipoFinal === 'industria' && categoriaIndustria) {
      subject = `Consulta sobre Diagnóstico Energético - ${categoriaIndustria.nombre}`;
      body = `Hola,

He completado el diagnóstico energético especializado para el sector ${categoriaIndustria.nombre} en su plataforma y me gustaría obtener más información sobre sus servicios de consultoría energética específicos para mi industria.

Mi sector: ${categoriaIndustria.nombre}
${categoriaIndustria.descripcion ? `Descripción: ${categoriaIndustria.descripcion}` : ''}

Me interesa conocer más sobre:
- Auditorías energéticas especializadas para ${categoriaIndustria.nombre}
- Planes de eficiencia energética sectoriales
- Implementación de mejoras energéticas
- Financiamiento y subsidios disponibles

Saludos cordiales`;
    } else {
      subject = "Consulta sobre Autodiagnóstico Energético";
      body = `Hola,

He completado el autodiagnóstico energético en su plataforma y me gustaría obtener más información sobre sus servicios de consultoría energética.

Saludos cordiales`;
    }
    
    const emailUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(emailUrl, '_blank');
  };

  // Cargar sugerencias según el tipo de formulario
  useEffect(() => {
    const fetchSugerencias = async () => {
      try {
        console.log('Cargando sugerencias para sessionId:', sessionId, 'tipo:', tipoFinal);
        setLoading(true);
        
        let response;
        if (tipoFinal === 'industria' && formularioIndustriaId) {
          // Usar API de sugerencias por industria
          response = await fetch(API.diagnosticoIndustria.sugerencias(sessionId));
        } else {
          // Usar API de sugerencias general
          response = await fetch(API.autodiagnostico.sugerencias(sessionId));
        }
        
        if (!response.ok) {
          throw new Error('Error al cargar las sugerencias');
        }
        
        const data = await response.json();
        console.log('Sugerencias cargadas:', data);
        setSugerencias(data.sugerencias || []);
      } catch (err) {
        console.error('Error cargando sugerencias:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchSugerencias();
    }
  }, [sessionId, tipoFinal, formularioIndustriaId]);

  // Función para navegar a diagnóstico de otra industria
  const handleDiagnosticoOtraIndustria = () => {
    navigate('/', { state: { scrollToIndustrySelector: true } });
  };

  // Función para reiniciar el mismo tipo de diagnóstico
  const handleRestart = () => {
    if (tipoFinal === 'industria' && categoriaIndustria) {
      navigate(`/diagnostico-industria/${categoriaIndustria.id}`);
    } else {
      onRestart();
    }
  };

  // Obtener título y descripción según el tipo
  const getTituloYDescripcion = () => {
    if (tipoFinal === 'industria' && categoriaIndustria) {
      return {
        titulo: `¡Diagnóstico ${categoriaIndustria.nombre} Completado!`,
        descripcion: `Has completado exitosamente tu diagnóstico energético especializado para el sector ${categoriaIndustria.nombre}. A continuación encontrarás recomendaciones específicas para tu industria.`,
        badge: `Sector: ${categoriaIndustria.nombre}`
      };
    } else {
      return {
        titulo: "¡Autodiagnóstico Completado!",
        descripcion: "Has completado exitosamente tu autodiagnóstico energético. A continuación encontrarás recomendaciones personalizadas para mejorar tu eficiencia energética.",
        badge: "Diagnóstico General"
      };
    }
  };

  const { titulo, descripcion, badge } = getTituloYDescripcion();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header de éxito */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="bg-green-500 rounded-full p-3">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Badge variant="secondary" className="mb-2">
                  {tipoFinal === 'industria' ? (
                    <>
                      <Building2 className="h-3 w-3 mr-1" />
                      {badge}
                    </>
                  ) : (
                    <>
                      <Target className="h-3 w-3 mr-1" />
                      {badge}
                    </>
                  )}
                </Badge>
                
                <h1 className="text-3xl font-bold text-green-800">
                  {titulo}
                </h1>
                
                <p className="text-green-700 max-w-2xl mx-auto">
                  {descripcion}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información específica de industria */}
        {tipoFinal === 'industria' && categoriaIndustria && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{categoriaIndustria.icono || '🏭'}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-800">{categoriaIndustria.nombre}</h3>
                  {categoriaIndustria.descripcion && (
                    <p className="text-sm text-blue-600">{categoriaIndustria.descripcion}</p>
                  )}
                </div>
                <Badge variant="outline" className="text-blue-700 border-blue-300">
                  Diagnóstico Especializado
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sección de sugerencias */}
        {loading ? (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-muted-foreground">
                  {tipoFinal === 'industria' 
                    ? `Generando recomendaciones especializadas para ${categoriaIndustria?.nombre}...`
                    : 'Generando recomendaciones personalizadas...'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="mb-6 border-red-200">
            <CardContent className="p-6">
              <div className="text-center">
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-red-700">Error al cargar recomendaciones</h3>
                <p className="text-muted-foreground">{error}</p>
              </div>
            </CardContent>
          </Card>
        ) : sugerencias.length > 0 ? (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Lightbulb className="h-6 w-6 text-yellow-500" />
                {tipoFinal === 'industria' 
                  ? `Recomendaciones para ${categoriaIndustria?.nombre}`
                  : 'Recomendaciones Personalizadas'
                }
              </CardTitle>
              <p className="text-muted-foreground">
                {tipoFinal === 'industria'
                  ? `Basándose en tus respuestas y las características específicas del sector ${categoriaIndustria?.nombre}, aquí tienes sugerencias especializadas:`
                  : 'Basándose en tus respuestas, aquí tienes sugerencias específicas para mejorar tu eficiencia energética:'
                }
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {sugerencias.map((sugerencia, index) => (
                <div key={index} className={`border rounded-lg p-4 ${
                  tipoFinal === 'industria' 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'bg-primary/5 border-primary/20'
                }`}>
                  <h4 className={`font-semibold mb-2 ${
                    tipoFinal === 'industria' ? 'text-blue-700' : 'text-primary'
                  }`}>
                    {sugerencia.pregunta}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong>Tu respuesta:</strong> {sugerencia.opcion_seleccionada}
                  </p>
                  <p className="text-sm leading-relaxed">
                    <strong>Recomendación:</strong> {sugerencia.sugerencia}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="text-center">
                <Lightbulb className="h-8 w-8 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Sin recomendaciones específicas</h3>
                <p className="text-muted-foreground">
                  {tipoFinal === 'industria'
                    ? `No se generaron recomendaciones específicas para el sector ${categoriaIndustria?.nombre}, pero nuestro equipo revisará tu información para proporcionarte consejos especializados.`
                    : 'No se generaron recomendaciones específicas para tus respuestas, pero nuestro equipo revisará tu información para proporcionarte consejos personalizados.'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contact Info Card */}
        <Card className="mb-6">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">¿Necesitas más ayuda?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className={`p-6 rounded-lg ${
                tipoFinal === 'industria' ? 'bg-blue-50' : 'bg-primary/10'
              }`}>
                <h3 className={`text-lg font-semibold mb-3 ${
                  tipoFinal === 'industria' ? 'text-blue-700' : 'text-primary'
                }`}>
                  {tipoFinal === 'industria'
                    ? `Consultoría especializada en ${categoriaIndustria?.nombre}`
                    : 'Contacta con nuestros expertos'
                  }
                </h3>
                <p className="text-muted-foreground">
                  {tipoFinal === 'industria'
                    ? `Nuestros especialistas en ${categoriaIndustria?.nombre} están disponibles para brindarte asesoría personalizada y un análisis más detallado de tu situación energética.`
                    : 'Si deseas un análisis más detallado o tienes preguntas específicas sobre las recomendaciones, nuestro equipo está disponible para ayudarte.'
                  }
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <button 
                  onClick={openEmail}
                  className="flex items-center gap-3 p-4 bg-secondary/50 rounded-lg hover:bg-secondary/70 transition-colors cursor-pointer border border-border/50 hover:border-primary/30"
                >
                  <Mail className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <p className="font-medium">Por email</p>
                    <p className="text-sm text-muted-foreground">
                      {tipoFinal === 'industria' ? 'Consulta especializada' : 'Consulta detallada'}
                    </p>
                  </div>
                </button>
                
                <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-lg border border-border/50">
                  <Phone className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <p className="font-medium">Por teléfono</p>
                    <p className="text-sm text-muted-foreground">
                      {tipoFinal === 'industria' ? 'Asesoría sectorial' : 'Asesoría personalizada'}
                    </p>
                  </div>
                </div>
                
                <button 
                  onClick={openWhatsApp}
                  className="flex items-center gap-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors cursor-pointer border border-green-200 hover:border-green-300"
                >
                  <MessageCircle className="h-5 w-5 text-green-600" />
                  <div className="text-left">
                    <p className="font-medium text-green-700">Por WhatsApp</p>
                    <p className="text-sm text-green-600">Respuesta rápida</p>
                  </div>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Volver al inicio
          </Button>
          
          {tipoFinal === 'industria' && (
            <Button 
              size="lg" 
              variant="outline" 
              onClick={handleDiagnosticoOtraIndustria}
              className="flex items-center gap-2"
            >
              <Building2 className="h-4 w-4" />
              Diagnóstico de otra industria
            </Button>
          )}
          
          <Button 
            size="lg" 
            variant="outline" 
            onClick={handleRestart}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            {tipoFinal === 'industria' 
              ? `Repetir diagnóstico ${categoriaIndustria?.nombre}`
              : 'Realizar otro diagnóstico'
            }
          </Button>
        </div>

        {/* Explorar otras opciones (solo para diagnósticos de industria) */}
        {tipoFinal === 'industria' && !loadingCategorias && categorias.length > 1 && (
          <Card className="border-dashed">
            <CardHeader className="text-center">
              <CardTitle className="text-lg flex items-center justify-center gap-2">
                <Target className="h-5 w-5" />
                Explora otros sectores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground mb-4">
                ¿Tu empresa opera en múltiples sectores? Realiza diagnósticos adicionales:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {categorias
                  .filter(cat => cat.id !== categoriaIndustria?.id && cat.activa)
                  .slice(0, 6)
                  .map((categoria) => (
                    <Button
                      key={categoria.id}
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/diagnostico-industria/${categoria.id}`)}
                      className="flex items-center gap-2 text-left justify-start"
                    >
                      <span className="text-lg">{categoria.icono || '🏭'}</span>
                      <span className="text-xs">{categoria.nombre}</span>
                    </Button>
                  ))
                }
              </div>
              {categorias.filter(cat => cat.activa).length > 7 && (
                <div className="text-center mt-3">
                  <Button 
                    variant="link" 
                    onClick={() => navigate('/')}
                    className="text-sm"
                  >
                    Ver todas las industrias
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Footer Note */}
        <div className="text-center mt-8 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Nota:</strong> {tipoFinal === 'industria'
              ? `Estas recomendaciones están especializadas para el sector ${categoriaIndustria?.nombre} y son orientativas basadas en tus respuestas.`
              : 'Estas recomendaciones son orientativas basadas en tus respuestas.'
            } Para un análisis completo, recomendamos contactar con nuestros especialistas.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AutodiagnosticoComplete; 