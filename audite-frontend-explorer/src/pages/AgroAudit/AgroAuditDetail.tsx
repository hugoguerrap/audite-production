import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { agroAuditService, agroDataService } from "@/lib/legacyApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Edit2, Trash2, Loader2, AlertCircle, LightbulbIcon } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import type { AuditoriaAgro, ConsumoPorFuente } from "@/types/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";

interface Recomendacion {
  id: number;
  categoria: string;
  titulo: string;
  descripcion: string;
}

interface AgroAuditDetailState {
  id: number;
  nombre_explotacion: string;
  tipo_cultivo: { id: number; nombre: string };
  superficie_cultivo: number;
  consumo_electricidad: number;
  consumo_combustible: number;
  consumo_agua?: number | null;
  equipos: Record<string, number>;
  produccion_anual?: number | null;
  unidad_produccion?: string | null;
  observaciones?: string | null;
  fecha_creacion: string;
  kpi_por_produccion?: number | null;
  kpi_por_area?: number | null;
  consumo_total?: number | null;
  distribucion_consumo?: Record<string, number> | null;
  recomendaciones?: Recomendacion[] | null;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

// Gráfico de distribución de consumo por etapa
const ConsumptionDistributionChart = ({ data }: { data: Record<string, number> }) => {
  const chartData = Object.entries(data).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

// Gráfico de consumos principales
const ResourceConsumptionChart = ({ audit }: { audit: AgroAuditDetailState }) => {
  const chartData = [
    {
      name: "Electricidad",
      valor: audit.consumo_electricidad,
      unidad: "kWh/año",
    },
    {
      name: "Combustible",
      valor: audit.consumo_combustible,
      unidad: "L/año",
    },
    {
      name: "Agua",
      valor: audit.consumo_agua || 0,
      unidad: "m³/año",
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip 
          formatter={(value, name, props) => [
            `${Number(value).toLocaleString()} ${props.payload.unidad}`,
            props.payload.name
          ]}
        />
        <Legend />
        <Bar 
          dataKey="valor" 
          fill="#8884d8" 
          name="Consumo de Recursos"
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

// Gráfico de KPIs
const KPIChart = ({ audit }: { audit: AgroAuditDetailState }) => {
  const chartData = [
    {
      name: "KPI por Producción",
      valor: audit.kpi_por_produccion || 0,
      objetivo: (audit.kpi_por_produccion || 0) * 0.8, // 20% menos como objetivo
    },
    {
      name: "KPI por Área",
      valor: audit.kpi_por_area || 0,
      objetivo: (audit.kpi_por_area || 0) * 0.8,
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="valor" fill="#8884d8" name="Valor Actual" />
        <Bar dataKey="objetivo" fill="#82ca9d" name="Objetivo" />
      </BarChart>
    </ResponsiveContainer>
  );
};

// Gráfico de equipamiento
const EquipmentChart = ({ equipos }: { equipos: Record<string, number> }) => {
  const chartData = Object.entries(equipos).map(([name, value]) => ({
    name: name.replace(/_/g, " ").charAt(0).toUpperCase() + name.slice(1),
    cantidad: value,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis dataKey="name" type="category" width={150} />
        <Tooltip />
        <Legend />
        <Bar dataKey="cantidad" fill="#8884d8" name="Cantidad" />
      </BarChart>
    </ResponsiveContainer>
  );
};

const AgroAuditDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [audit, setAudit] = useState<AgroAuditDetailState | null>(null);
  const [equiposCatalogo, setEquiposCatalogo] = useState<any[]>([]);
  const [procesosCatalogo, setProcesosCatalogo] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    const fetchAudit = async () => {
      try {
        setIsLoading(true);
        if (!id) throw new Error("ID no válido");
        const [data, equiposData, procesosData] = await Promise.all<any>([
          agroAuditService.getById(Number(id)),
          agroDataService.getEquipment(),
          agroDataService.getProcesses()
        ]);
        setEquiposCatalogo(equiposData);
        setProcesosCatalogo(procesosData);

        const tipoCultivoObj = typeof data.tipo_cultivo === "string"
          ? { id: 1, nombre: data.tipo_cultivo }
          : { id: 1, nombre: "No especificado" };

        setAudit({
          id: data.id,
          nombre_explotacion: data.nombre_proyecto,
          tipo_cultivo: tipoCultivoObj,
          superficie_cultivo: data.area_total,
          consumo_electricidad: data.consumo_electrico,
          consumo_combustible: data.consumo_combustible,
          consumo_agua: data.consumo_agua,
          equipos: data.equipos || {},
          produccion_anual: data.produccion_anual,
          unidad_produccion: data.unidad_produccion,
          observaciones: data.observaciones,
          fecha_creacion: data.created_at,
          kpi_por_produccion: data.kpi_por_produccion,
          kpi_por_area: data.kpi_por_area,
          consumo_total: data.consumo_total,
          distribucion_consumo: data.distribucion_consumo,
          recomendaciones: data.recomendaciones || [],
        });
      } catch (err: any) {
        console.error("Error fetching agro audit:", err);
        setError(err.message || "Error al cargar la auditoría");
        toast.error("Error al cargar la auditoría agrícola");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAudit();
  }, [id]);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      if (!id) throw new Error("ID no válido");
      
      await agroAuditService.delete(Number(id));
      toast.success("Auditoría eliminada correctamente");
      navigate("/auditoria-agro");
    } catch (error) {
      console.error("Error deleting agro audit:", error);
      toast.error("Error al eliminar la auditoría");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Cargando auditoría...</span>
      </div>
    );
  }

  if (error || !audit) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate("/auditoria-agro")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al listado
        </Button>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error || "No se pudo cargar la auditoría"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center">
        <Button variant="ghost" onClick={() => navigate("/auditoria-agro")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <h1 className="text-3xl font-bold tracking-tight ml-4">
          Auditoría: {audit.nombre_explotacion}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Datos básicos</CardTitle>
            <CardDescription>
              Creada el {new Date(audit.fecha_creacion).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Explotación</p>
                <p>{audit.nombre_explotacion}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tipo de cultivo</p>
                <p>{audit.tipo_cultivo?.nombre || "No especificado"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Superficie</p>
                <p>{typeof audit.superficie_cultivo === 'number' ? audit.superficie_cultivo.toLocaleString() : 'N/A'} ha</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Consumo eléctrico</p>
                <p>{typeof audit.consumo_electricidad === 'number' ? audit.consumo_electricidad.toLocaleString() : 'N/A'} kWh/año</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Consumo combustible</p>
                <p>{typeof audit.consumo_combustible === 'number' ? audit.consumo_combustible.toLocaleString() : 'N/A'} L/año</p>
              </div>
              {audit.consumo_agua !== null && audit.consumo_agua !== undefined && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Consumo de agua</p>
                  <p>{typeof audit.consumo_agua === 'number' ? audit.consumo_agua.toLocaleString() : 'N/A'} m³/año</p>
                </div>
              )}
              {audit.produccion_anual !== null && audit.produccion_anual !== undefined && (
                 <div>
                   <p className="text-sm font-medium text-muted-foreground">Producción anual</p>
                   <p>{typeof audit.produccion_anual === 'number' ? audit.produccion_anual.toLocaleString() : 'N/A'} {audit.unidad_produccion || ''}</p>
                 </div>
               )}
            </div>

            {audit.observaciones && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Observaciones</p>
                  <p>{audit.observaciones}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Consumo de Recursos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResourceConsumptionChart audit={audit} />
          </CardContent>
        </Card>

        {audit.distribucion_consumo && (
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Distribución del Consumo por Etapa</CardTitle>
            </CardHeader>
            <CardContent>
              <ConsumptionDistributionChart data={audit.distribucion_consumo} />
            </CardContent>
          </Card>
        )}

        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Indicadores de Rendimiento (KPIs)</CardTitle>
          </CardHeader>
          <CardContent>
            <KPIChart audit={audit} />
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Equipamiento</CardTitle>
          </CardHeader>
          <CardContent>
            <EquipmentChart equipos={audit.equipos} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Equipos utilizados</CardTitle>
          </CardHeader>
          <CardContent>
            {!audit.equipos || Object.keys(audit.equipos).length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <p>No hay equipos registrados para esta auditoría.</p>
              </div>
            ) : (
              <ul className="list-disc list-inside space-y-2">
                {Object.entries(audit.equipos).map(([nombre, cantidad]) => (
                  <li key={nombre}>
                    {nombre.replace(/_/g, " ")}: {cantidad}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recomendaciones</CardTitle>
          </CardHeader>
          <CardContent>
            {!audit.recomendaciones || audit.recomendaciones.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <p>No hay recomendaciones disponibles para esta auditoría.</p>
              </div>
            ) : (
              <ul className="list-disc list-inside space-y-2">
                {audit.recomendaciones.map((rec) => (
                  <li key={rec.id}>{rec.titulo}: {rec.descripcion}</li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Acciones disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => navigate(`/auditoria-agro/editar/${audit.id}`)}
              >
                <Edit2 className="h-4 w-4" />
                Editar auditoría
              </Button>
              
              <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="text-destructive flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Eliminar auditoría
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción eliminará permanentemente la auditoría de "{audit.nombre_explotacion}" 
                      y no puede deshacerse.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDelete}
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AgroAuditDetail;
