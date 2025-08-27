import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { basicAuditService, agroAuditService } from "@/lib/legacyApi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BrandButton from "@/components/ui/BrandButton";
import { Link } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ClipboardList, Leaf, Loader2, PieChart, Info, BarChart3, TrendingUp } from "lucide-react";
import { toast } from "@/components/ui/sonner";

const Dashboard = () => {
  const { user } = useAuth();
  const [basicAudits, setBasicAudits] = useState([]);
  const [agroAudits, setAgroAudits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [basicData, agroData] = await Promise.all([
          basicAuditService.getAll(),
          agroAuditService.getAll()
        ]);
        
        setBasicAudits(basicData);
        setAgroAudits(agroData);
      } catch (err: any) {
        console.error("Error fetching dashboard data:", err);
        setError(err.message || "Error al cargar datos");
        toast.error("Error al cargar datos del dashboard");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 font-body text-audite-secondary">Cargando dashboard...</span>
      </div>
    );
  }

  const totalAudits = basicAudits.length + agroAudits.length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header del Dashboard con Logo */}
      <div className="text-center section-padding bg-gradient-to-r from-audite-light to-audite-accent-soft rounded-lg border border-audite-accent-medium/20">
        <div className="flex flex-col items-center mb-8">
          <img 
            src="/logo primary@2x.png" 
            alt="AuditE - Conecta. Ahorra. Transforma." 
            className="h-32 w-auto object-contain mb-6"
            style={{ maxWidth: '500px' }}
          />
          <h1 className="text-4xl font-brand font-bold text-audite-dark mb-2">
            Dashboard AuditE
          </h1>
        </div>
        <p className="text-lg text-audite-secondary font-body mb-4">
          Bienvenido, {user?.nombre || user?.email}
        </p>
        <div className="slogan text-lg">
          Conecta. Ahorra. Transforma.
        </div>
      </div>
      
      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="dashboard-card border-audite-accent-medium/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-brand font-semibold flex items-center text-audite-dark">
              <BarChart3 className="mr-2 h-5 w-5 text-primary" />
              Total de Auditorías
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-brand font-bold text-primary mb-2">
              {totalAudits}
            </div>
            <p className="text-sm text-audite-secondary font-body">
              Auditorías registradas en el sistema
            </p>
          </CardContent>
        </Card>

        <Card className="dashboard-card border-audite-accent-medium/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-brand font-semibold flex items-center text-audite-dark">
              <ClipboardList className="mr-2 h-5 w-5 text-audite-secondary" />
              Auditorías Básicas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-brand font-bold text-audite-secondary mb-2">
              {basicAudits.length}
            </div>
            <p className="text-sm text-audite-secondary font-body">
              Evaluaciones energéticas generales
            </p>
          </CardContent>
        </Card>

        <Card className="dashboard-card border-audite-accent-medium/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-brand font-semibold flex items-center text-audite-dark">
              <Leaf className="mr-2 h-5 w-5 text-audite-tertiary" />
              Auditorías Agrícolas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-brand font-bold text-audite-tertiary mb-2">
              {agroAudits.length}
            </div>
            <p className="text-sm text-audite-secondary font-body">
              Evaluaciones especializadas agrícolas
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Acciones Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="dashboard-card border-audite-accent-medium/20">
          <CardHeader>
            <CardTitle className="text-xl font-brand font-semibold flex items-center text-audite-dark">
              <ClipboardList className="mr-3 h-6 w-6 text-primary" />
              Auditorías Básicas
            </CardTitle>
            <CardDescription className="font-body text-audite-secondary">
              Gestiona y crea nuevas auditorías energéticas básicas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-audite-accent-soft/50 rounded-lg">
              <div>
                <p className="text-2xl font-brand font-bold text-audite-dark">
                  {basicAudits.length}
                </p>
                <p className="text-sm text-audite-secondary font-body">
                  Auditorías registradas
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <div className="flex gap-3">
              <BrandButton asChild variant="primary" className="flex-1">
                <Link to="/auditoria-basica">Ver Auditorías</Link>
              </BrandButton>
              <BrandButton asChild variant="outline" className="flex-1">
                <Link to="/auditoria-basica/nueva">Nueva Auditoría</Link>
              </BrandButton>
            </div>
          </CardContent>
        </Card>
        
        <Card className="dashboard-card border-audite-accent-medium/20">
          <CardHeader>
            <CardTitle className="text-xl font-brand font-semibold flex items-center text-audite-dark">
              <Leaf className="mr-3 h-6 w-6 text-primary" />
              Auditorías Agrícolas
            </CardTitle>
            <CardDescription className="font-body text-audite-secondary">
              Gestiona auditorías especializadas para el sector agrícola
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-audite-accent-soft/50 rounded-lg">
              <div>
                <p className="text-2xl font-brand font-bold text-audite-dark">
                  {agroAudits.length}
                </p>
                <p className="text-sm text-audite-secondary font-body">
                  Auditorías especializadas
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-audite-tertiary" />
            </div>
            <div className="flex gap-3">
              <BrandButton asChild variant="primary" className="flex-1">
                <Link to="/auditoria-agro">Ver Auditorías</Link>
              </BrandButton>
              <BrandButton asChild variant="outline" className="flex-1">
                <Link to="/auditoria-agro/nueva">Nueva Auditoría</Link>
              </BrandButton>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Información de la Plataforma */}
      <Card className="dashboard-card border-audite-accent-medium/20">
        <CardHeader>
          <CardTitle className="text-xl font-brand font-semibold flex items-center text-audite-dark">
            <PieChart className="mr-3 h-6 w-6 text-primary" />
            Plataforma AuditE
          </CardTitle>
          <CardDescription className="font-body text-audite-secondary">
            Información sobre las capacidades y funciones del sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="border-primary/20 bg-primary/5">
            <Info className="h-4 w-4" />
            <AlertTitle className="font-brand font-semibold text-audite-dark">
              AuditE v2.0.0 - Sistema de Auditorías Energéticas
            </AlertTitle>
            <AlertDescription className="font-body text-audite-secondary">
              Plataforma integral para la realización y gestión de auditorías energéticas, 
              con enfoque especializado en el sector agrícola y recomendaciones automatizadas.
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-brand font-semibold text-audite-dark">
                Funciones Principales
              </h3>
              <ul className="space-y-2 font-body text-audite-secondary">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  Gestión completa de auditorías energéticas básicas
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-audite-secondary rounded-full mt-2 flex-shrink-0"></div>
                  Auditorías especializadas para el sector agrícola
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-audite-tertiary rounded-full mt-2 flex-shrink-0"></div>
                  Cálculo automático de KPIs energéticos
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  Generación de recomendaciones personalizadas
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-brand font-semibold text-audite-dark">
                Enlaces de Interés
              </h3>
              <div className="space-y-2">
                <BrandButton asChild variant="ghost" className="justify-start p-2">
                  <Link to="/api-info" className="flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Información de la API
                  </Link>
                </BrandButton>
              </div>
              
              <div className="mt-4 p-4 bg-audite-accent-soft/30 rounded-lg">
                <p className="text-sm font-body text-audite-secondary text-center">
                  <span className="font-brand font-medium text-audite-dark">
                    "Conecta. Ahorra. Transforma."
                  </span>
                  <br />
                  Optimiza el consumo energético para un futuro sostenible
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
