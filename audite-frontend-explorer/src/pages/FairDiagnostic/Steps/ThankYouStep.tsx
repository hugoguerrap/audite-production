import React from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Home, ExternalLink, Copy } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import type { FairDiagnosticoResponse, FairRecomendacionDiagnostico } from "@/types/api";

interface ThankYouStepProps {
  results: FairDiagnosticoResponse | null;
}

const ThankYouStep: React.FC<ThankYouStepProps> = ({ results }) => {
  const handleDownloadPDF = () => {
    if (results && results.pdfUrl) {
      window.open(results.pdfUrl, '_blank');
    } else {
      toast.error("El PDF aún no está disponible. Inténtelo más tarde.");
    }
  };

  const handleCopyAccessCode = () => {
    if (results && results.accessCode) {
      navigator.clipboard.writeText(results.accessCode)
        .then(() => toast.success("Código copiado al portapapeles"))
        .catch(() => toast.error("No se pudo copiar el código"));
    }
  };

  const handleViewResults = () => {
    if (results && results.accessCode) {
      window.location.href = `/codigo/${results.accessCode}`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <svg
            className="h-10 w-10 text-primary"
            fill="none"
            height="24"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        
        <div className="mt-4">
          <h2 className="text-2xl font-bold">¡Gracias por completar el diagnóstico energético!</h2>
          <p className="text-muted-foreground mt-2">
            Hemos analizado su información y generado un informe personalizado con recomendaciones.
          </p>
        </div>
      </div>
      
      {results && (
        <div className="space-y-4 mt-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Su código de acceso</CardTitle>
              <CardDescription>
                Guarde este código para acceder a su diagnóstico más tarde
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between bg-primary/5 p-3 rounded-md">
                <span className="font-mono text-lg font-bold">{results.accessCode}</span>
                <Button variant="ghost" size="sm" onClick={handleCopyAccessCode}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Resumen del Diagnóstico</CardTitle>
              <CardDescription>
                Resultados clave de su evaluación energética
              </CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2">
                <div className="flex justify-between text-sm">
                  <dt className="text-muted-foreground">Puntuación de Eficiencia:</dt>
                  <dd className="font-medium">{results.results.puntuacionEficiencia}/100</dd>
                </div>
                <div className="flex justify-between text-sm">
                  <dt className="text-muted-foreground">Potencial de Ahorro:</dt>
                  <dd className="font-medium">${results.results.potencialAhorro.toLocaleString()}</dd>
                </div>
                <div className="flex justify-between text-sm">
                  <dt className="text-muted-foreground">Intensidad Energética:</dt>
                  <dd className="font-medium">{results.results.intensidadEnergetica.toLocaleString()} kWh/unidad</dd>
                </div>
                <div className="flex justify-between text-sm">
                  <dt className="text-muted-foreground">Comparación con el sector:</dt>
                  <dd className={`font-medium ${results.results.comparacionSector.diferenciaPorcentual > 0 ? 'text-destructive' : 'text-green-600'}`}>
                    {results.results.comparacionSector.diferenciaPorcentual > 0 ? '+' : ''}
                    {results.results.comparacionSector.diferenciaPorcentual.toFixed(1)}%
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
          
          {results.recomendaciones && results.recomendaciones.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Principales Recomendaciones</CardTitle>
                <CardDescription>
                  Acciones que puede implementar para mejorar su eficiencia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {results.recomendaciones
                    .sort((a, b) => b.prioridad - a.prioridad)
                    .slice(0, 2)
                    .map((rec: FairRecomendacionDiagnostico) => (
                      <li key={rec.id} className="bg-muted/30 p-3 rounded-md">
                        <h4 className="font-medium">{rec.titulo}</h4>
                        <p className="text-sm text-muted-foreground">{rec.descripcion.substring(0, 100)}...</p>
                        <div className="flex justify-between mt-2 text-xs">
                          <span>
                            Ahorro estimado: {rec.ahorroEstimado != null ? `$${rec.ahorroEstimado.toLocaleString()}` : 'N/A'}
                          </span>
                          <span>
                            Prioridad: {rec.prioridad != null ? `${rec.prioridad}/5` : 'N/A'}
                          </span>
                        </div>
                      </li>
                    ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
        {results && results.pdfUrl && (
          <Button onClick={handleDownloadPDF} className="flex items-center gap-2">
            <FileDown className="h-4 w-4" /> Descargar PDF
          </Button>
        )}
        
        {results && results.viewUrl && (
          <Button variant="outline" onClick={handleViewResults} className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4" /> Ver Resultados Completos
          </Button>
        )}
        
        <Button variant="outline" asChild>
          <Link to="/" className="flex items-center gap-2">
            <Home className="h-4 w-4" /> Volver al Inicio
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default ThankYouStep; 