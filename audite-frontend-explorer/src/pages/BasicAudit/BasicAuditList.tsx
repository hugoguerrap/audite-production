
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { basicAuditService } from "@/lib/legacyApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, FilePlus, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { Badge } from "@/components/ui/badge";

interface BasicAudit {
  id: number;
  nombre_empresa: string;
  sector: string;
  consumo_anual?: number;
  fecha_creacion: string;
  estado: string;
}

const BasicAuditList = () => {
  const navigate = useNavigate();
  const [audits, setAudits] = useState<BasicAudit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAudits = async () => {
      try {
        setIsLoading(true);
        const data = await basicAuditService.getAll();
        setAudits(data);
      } catch (error) {
        console.error("Error fetching basic audits:", error);
        toast.error("Error al cargar las auditorías básicas");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAudits();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Auditorías Básicas</h1>
        <Button onClick={() => navigate("/auditoria-basica/nueva")}>
          <FilePlus className="mr-2 h-4 w-4" />
          Nueva Auditoría
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Listado de Auditorías</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Cargando auditorías...</span>
            </div>
          ) : audits.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No hay auditorías básicas registradas.</p>
              <Button 
                variant="link" 
                onClick={() => navigate("/auditoria-basica/nueva")}
                className="mt-2"
              >
                Crear tu primera auditoría
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre Empresa</TableHead>
                    <TableHead>Sector</TableHead>
                    <TableHead>Consumo Anual (kWh)</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {audits.map((audit) => (
                    <TableRow key={audit.id}>
                      <TableCell className="font-medium">{audit.nombre_empresa}</TableCell>
                      <TableCell>{audit.sector}</TableCell>
                      <TableCell>{audit.consumo_anual?.toLocaleString() || "N/A"}</TableCell>
                      <TableCell>{new Date(audit.fecha_creacion).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={audit.estado === "completada" ? "default" : "outline"}>
                          {audit.estado === "completada" ? "Completada" : "En progreso"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => navigate(`/auditoria-basica/${audit.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Ver</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Información</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Las auditorías básicas permiten evaluar el rendimiento energético de empresas generales. 
            Actualmente, solo es posible crear y visualizar auditorías básicas. La funcionalidad de edición y eliminación no está disponible.
          </p>
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Campos requeridos para crear una auditoría básica:</h3>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Nombre de la empresa</li>
              <li>Sector</li>
              <li>Número de empleados</li>
              <li>Superficie (m²)</li>
              <li>Consumo anual (kWh)</li>
              <li>Gasto anual (€)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BasicAuditList;
