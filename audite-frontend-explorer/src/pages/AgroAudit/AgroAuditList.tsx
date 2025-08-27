
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { agroAuditService } from "@/lib/legacyApi";
import type { AuditoriaAgro } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit2, Eye, FilePlus, Loader2, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const AgroAuditList = () => {
  const navigate = useNavigate();
  const [audits, setAudits] = useState<AuditoriaAgro[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [auditToDelete, setAuditToDelete] = useState<number | null>(null);

  const fetchAudits = async () => {
    try {
      setIsLoading(true);
      const data = await agroAuditService.getAll();
      setAudits(data);
    } catch (error) {
      console.error("Error fetching agro audits:", error);
      toast.error("Error al cargar las auditorías agrícolas");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAudits();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      setIsDeleting(true);
      await agroAuditService.delete(id);
      toast.success("Auditoría eliminada correctamente");
      fetchAudits();
    } catch (error) {
      console.error("Error deleting agro audit:", error);
      toast.error("Error al eliminar la auditoría");
    } finally {
      setIsDeleting(false);
      setAuditToDelete(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Auditorías Agrícolas</h1>
        <Button onClick={() => navigate("/auditoria-agro/nueva")}>
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
              <p>No hay auditorías agrícolas registradas.</p>
              <Button 
                variant="link" 
                onClick={() => navigate("/auditoria-agro/nueva")}
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
                    <TableHead>Nombre Proyecto</TableHead>
                    <TableHead>Tipo Cultivo</TableHead>
                    <TableHead>Área Total (ha)</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Producción</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {audits.map((audit) => (
                    <TableRow key={audit.id}>
                      <TableCell className="font-medium">{audit.nombre_proyecto}</TableCell>
                      <TableCell>{audit.tipo_cultivo}</TableCell>
                      <TableCell>{audit.area_total?.toLocaleString() || "N/A"}</TableCell>
                      <TableCell>{new Date(audit.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {audit.produccion_anual?.toLocaleString() || "N/A"} {audit.unidad_produccion}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => navigate(`/auditoria-agro/${audit.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Ver</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => navigate(`/auditoria-agro/editar/${audit.id}`)}
                          >
                            <Edit2 className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                          <AlertDialog
                            open={auditToDelete === audit.id}
                            onOpenChange={(open) => {
                              if (!open) setAuditToDelete(null);
                            }}
                          >
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-destructive"
                                onClick={() => setAuditToDelete(audit.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Eliminar</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción eliminará permanentemente la auditoría de "{audit.nombre_proyecto}" 
                                  y no puede deshacerse.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDelete(audit.id)}
                                  disabled={isDeleting}
                                  className="bg-destructive hover:bg-destructive/90"
                                >
                                  {isDeleting ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Eliminando...
                                    </>
                                  ) : (
                                    "Eliminar"
                                  )}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
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
            Las auditorías agrícolas permiten evaluar el rendimiento energético de explotaciones agrícolas.
            A diferencia de las auditorías básicas, estas pueden ser creadas, visualizadas, editadas y eliminadas.
          </p>
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Campos principales para una auditoría agrícola:</h3>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Nombre de la explotación</li>
              <li>Tipo de cultivo</li>
              <li>Superficie de cultivo (hectáreas)</li>
              <li>Consumos energéticos</li>
              <li>Equipos utilizados</li>
              <li>Procesos agrícolas</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgroAuditList;
