import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { Search, ArrowLeft } from "lucide-react";
import { feriaService } from "@/lib/legacyApi";

const BuscarDiagnostico: React.FC = () => {
  const [accessCode, setAccessCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accessCode.trim()) {
      toast.error("Por favor, ingrese un código de acceso válido");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Primero, verificamos si existe un diagnóstico con este código
      const diagnostic = await feriaService.getDiagnosticoByCode(accessCode);
      
      if (!diagnostic) {
        toast.error("No se encontró ningún diagnóstico con este código");
        return;
      }
      
      // Si tiene resultados completos, es un diagnóstico completo
      if (diagnostic.results) {
        toast.success("Diagnóstico completo encontrado");
        navigate(`/codigo/${accessCode}`);
        return;
      }
      
      // Si tiene contactInfo pero no tiene results, es un diagnóstico pendiente
      if (diagnostic.contactInfo && !diagnostic.results) {
        toast.success("Diagnóstico pendiente encontrado, continuando con el formulario...");
        
        // Navegar a la página de diagnóstico pasando la información del diagnóstico
        navigate("/diagnostico-energia", { 
          state: { 
            diagnosticMeta: { 
              id: diagnostic.id, 
              accessCode 
            },
            isPendingDiagnostic: true // Marcador para indicar que es un diagnóstico pendiente
          } 
        });
        return;
      }
      
      // Si llegamos aquí, el diagnóstico está en un estado indefinido
      toast.warning("El diagnóstico existe pero está en un estado inusual");
      
    } catch (error) {
      console.error("Error al buscar el diagnóstico:", error);
      toast.error("Hubo un problema al buscar el diagnóstico. Inténtelo de nuevo más tarde.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="bg-primary/10 pb-4">
            <CardTitle className="text-2xl font-bold text-center text-primary">
              Buscar Diagnóstico
            </CardTitle>
            <CardDescription className="text-center">
              Ingrese su código de acceso para continuar un diagnóstico o ver uno completado
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 pb-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="accessCode">Código de Acceso</Label>
                <Input
                  id="accessCode"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  placeholder="Ej. XYZ123AB"
                  className="font-mono"
                  autoComplete="off"
                  required
                />
              </div>
              
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => navigate("/")}
                  className="flex items-center gap-1"
                >
                  <ArrowLeft className="h-4 w-4" /> Volver
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-1 w-full"
                >
                  {isLoading ? (
                    <>
                      <span className="animate-spin h-4 w-4 mr-1">◌</span>
                      Buscando...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" /> Buscar Diagnóstico
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BuscarDiagnostico; 