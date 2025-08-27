import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Home, ArrowLeft } from "lucide-react";
import { toast } from "@/components/ui/sonner";

const DiagnosticSearchPage: React.FC = () => {
  const [accessCode, setAccessCode] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accessCode) {
      toast.error("Por favor, introduce un código de acceso");
      return;
    }
    
    // Eliminar espacios y convertir a mayúsculas
    const formattedCode = accessCode.trim().toUpperCase();
    
    if (formattedCode.length < 6) {
      toast.error("El código de acceso debe tener al menos 6 caracteres");
      return;
    }
    
    setIsSubmitting(true);
    
    // Navegamos directamente a la página de resultados con el código de acceso
    navigate(`/codigo/${formattedCode}`);
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 flex items-center justify-center">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" /> Volver al inicio
        </Link>
        
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Buscar Mi Diagnóstico</CardTitle>
            <CardDescription>
              Introduce el código de acceso que recibiste al finalizar tu diagnóstico energético
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="accessCode">Código de Acceso</Label>
                <Input
                  id="accessCode"
                  placeholder="Ej: ABC123XYZ"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  className="font-mono"
                  autoComplete="off"
                />
                <p className="text-xs text-muted-foreground">
                  El código consiste en una combinación de letras y números que recibiste al completar tu diagnóstico
                </p>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                <Search className="mr-2 h-4 w-4" />
                {isSubmitting ? "Buscando..." : "Buscar Diagnóstico"}
              </Button>
            </form>
            
            <div className="mt-6 pt-6 border-t border-border text-center">
              <p className="text-sm text-muted-foreground mb-4">
                ¿No tienes un código? Realiza un diagnóstico energético gratuito para recibir recomendaciones personalizadas.
              </p>
              <Button variant="outline" asChild className="w-full">
                <Link to="/dignostico">Realizar Nuevo Diagnóstico</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <p className="text-center text-xs text-muted-foreground mt-8">
          Si tienes problemas para acceder a tu diagnóstico, por favor contacta con nuestro equipo de soporte
        </p>
      </div>
    </div>
  );
};

export default DiagnosticSearchPage; 