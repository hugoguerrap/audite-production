import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { basicAuditService } from "@/lib/legacyApi";
import type { AuditoriaBasica } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
} from "recharts";

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Colores para los gráficos
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

// Componente para el gráfico de distribución de consumo
const ConsumptionDistributionChart = ({ data }: { data: Record<string, number> }) => {
  const chartData = Object.entries(data).map(([name, value]) => ({
    name,
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
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

// Componente para el gráfico de comparación con el sector
const BenchmarkComparisonChart = ({ auditData }: { auditData: AuditoriaBasica }) => {
  const chartData = [
    {
      name: "Tu Empresa",
      consumo: auditData.consumo_anual,
    },
    {
      name: "Promedio Sector",
      consumo: auditData.comparacion_benchmark.consumo_promedio_sector,
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip formatter={(value) => `${Number(value).toLocaleString()} kWh`} />
        <Legend />
        <Bar
          dataKey="consumo"
          fill="#8884d8"
          name="Consumo Anual (kWh)"
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

// Componente para el gráfico de métricas clave
const KeyMetricsChart = ({ auditData }: { auditData: AuditoriaBasica }) => {
  const chartData = [
    {
      metric: "Eficiencia",
      value: auditData.puntuacion_eficiencia,
      fullMark: 100,
    },
    {
      metric: "Ahorro Potencial",
      value: auditData.potencial_ahorro,
      fullMark: 100,
    },
    {
      metric: "Intensidad Energética",
      value: Math.min(100, (auditData.intensidad_energetica / 500) * 100),
      fullMark: 100,
    },
    {
      metric: "Mantenimiento",
      value: auditData.datos_equipos.mantenimiento_regular ? 100 : 50,
      fullMark: 100,
    },
    {
      metric: "Renovables",
      value: auditData.renewable_energy ? 100 : 0,
      fullMark: 100,
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
        <PolarGrid />
        <PolarAngleAxis dataKey="metric" />
        <PolarRadiusAxis angle={30} domain={[0, 100]} />
        <Radar
          name="Métricas"
          dataKey="value"
          stroke="#8884d8"
          fill="#8884d8"
          fillOpacity={0.6}
        />
        <Tooltip />
        <Legend />
      </RadarChart>
    </ResponsiveContainer>
  );
};

const BasicAuditDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [auditData, setAuditData] = useState<AuditoriaBasica | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<{
    message: string;
    details?: string;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await basicAuditService.getById(Number(id));
        setAuditData(data);
      } catch (error) {
        console.error("Error fetching audit data:", error);
        let errorMessage = "Error al cargar los datos de la auditoría";
        let errorDetails = "";

        if (axios.isAxiosError(error)) {
          if (error.response) {
            // Error de respuesta del servidor
            errorMessage = `Error ${error.response.status}: ${error.response.statusText}`;
            errorDetails = JSON.stringify(error.response.data, null, 2);
          } else if (error.request) {
            // Error de red/no hay respuesta
            errorMessage = "Error de conexión con el servidor";
            errorDetails = "No se pudo establecer conexión con el servidor. Por favor, verifica tu conexión a internet.";
          } else {
            // Error de configuración
            errorMessage = "Error de configuración de la solicitud";
            errorDetails = error.message;
          }
        }

        setError({ message: errorMessage, details: errorDetails });
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => navigate("/auditoria-basica")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </div>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error al cargar la auditoría</AlertTitle>
          <AlertDescription>
            {error.message}
            {error.details && (
              <pre className="mt-2 p-2 bg-secondary/10 rounded-md text-xs overflow-auto">
                {error.details}
              </pre>
            )}
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Acciones sugeridas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="list-disc list-inside space-y-2">
              <li>Verifica que el servidor esté funcionando correctamente</li>
              <li>Comprueba tu conexión a internet</li>
              <li>Asegúrate de que tienes los permisos necesarios para acceder a esta auditoría</li>
              <li>Si el problema persiste, contacta con el administrador del sistema</li>
            </ul>
            <div className="flex gap-4 mt-4">
              <Button onClick={() => window.location.reload()}>
                Intentar de nuevo
              </Button>
              <Button variant="outline" onClick={() => navigate("/auditoria-basica")}>
                Volver al listado
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!auditData) {
    return (
      <div className="text-center">
        <p>No se encontró la auditoría</p>
        <Button onClick={() => navigate("/auditoria-basica")}>Volver</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => navigate("/auditoria-basica")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <h1 className="text-3xl font-bold tracking-tight ml-4">
            {auditData.nombre_empresa}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Creado: {formatDate(auditData.created_at)}
          </div>
          <Badge variant={auditData.is_complete ? "default" : "secondary"}>
            {auditData.is_complete ? "Completa" : "En proceso"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Información General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Sector</p>
                <p className="font-medium">{auditData.sector}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Empleados</p>
                <p className="font-medium">{auditData.num_empleados}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tamaño (m²)</p>
                <p className="font-medium">{auditData.tamano_instalacion.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Consumo Anual (kWh)</p>
                <p className="font-medium">{auditData.consumo_anual.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Factura Mensual (€)</p>
                <p className="font-medium">{auditData.factura_mensual.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Auditoría Previa</p>
                <p className="font-medium">{auditData.tiene_auditoria_previa ? "Sí" : "No"}</p>
              </div>
            </div>
            <div className="pt-4 border-t">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">ID Usuario</p>
                  <p className="font-medium">{auditData.usuario_id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">IP</p>
                  <p className="font-medium">{auditData.ip_address}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Métricas Clave</CardTitle>
          </CardHeader>
          <CardContent>
            <KeyMetricsChart auditData={auditData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Equipamiento e Instalaciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Tipo Iluminación</p>
                <p className="font-medium">{auditData.datos_equipos.tipo_iluminacion}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sistema HVAC</p>
                <p className="font-medium">{auditData.datos_equipos.sistema_hvac}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Potencia Iluminación</p>
                <p className="font-medium">{auditData.datos_equipos.iluminacion_potencia} kW</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Potencia Climatización</p>
                <p className="font-medium">{auditData.datos_equipos.climatizacion_potencia} kW</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Edad Promedio</p>
                <p className="font-medium">{auditData.datos_equipos.edad_promedio_equipos}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mantenimiento Regular</p>
                <p className="font-medium">{auditData.datos_equipos.mantenimiento_regular ? "Sí" : "No"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Energía y Objetivos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Fuentes de Energía</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {auditData.fuentes_energia.map((fuente) => (
                  <Badge key={fuente} variant="secondary">
                    {fuente}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-sm text-muted-foreground">Edad Equipamiento</p>
                <p className="font-medium">{auditData.equipment_age.replace(/_/g, " ")}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Energías Renovables</p>
                <p className="font-medium">{auditData.renewable_energy ? "Sí" : "No"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Objetivo de Ahorro</p>
                <p className="font-medium">{auditData.savings_target}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Presupuesto</p>
                <p className="font-medium">{auditData.implementation_budget}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">Prioridades Energéticas</p>
              <p className="font-medium">{auditData.energy_priorities}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Distribución del Consumo</CardTitle>
          </CardHeader>
          <CardContent>
            <ConsumptionDistributionChart data={auditData.distribucion_consumo} />
            <div className="mt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Área</TableHead>
                    <TableHead className="text-right">Porcentaje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(auditData.distribucion_consumo).map(([area, porcentaje]) => (
                    <TableRow key={area}>
                      <TableCell>{area}</TableCell>
                      <TableCell className="text-right">{porcentaje}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Comparación con el Sector</CardTitle>
          </CardHeader>
          <CardContent>
            <BenchmarkComparisonChart auditData={auditData} />
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div>
                <p className="text-sm text-muted-foreground">Consumo Promedio del Sector</p>
                <p className="font-medium">
                  {auditData.comparacion_benchmark.consumo_promedio_sector.toLocaleString()} kWh
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Diferencia Porcentual</p>
                <p className={`font-medium ${auditData.comparacion_benchmark.diferencia_porcentual > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {auditData.comparacion_benchmark.diferencia_porcentual > 0 ? "+" : ""}
                  {auditData.comparacion_benchmark.diferencia_porcentual}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {auditData.recomendaciones && auditData.recomendaciones.length > 0 && (
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Recomendaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {auditData.recomendaciones.map((recomendacion) => (
                  <div
                    key={recomendacion.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-lg">{recomendacion.titulo}</h3>
                        <Badge variant="outline">{recomendacion.categoria}</Badge>
                      </div>
                      <Badge variant="secondary">Prioridad {recomendacion.prioridad}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {recomendacion.descripcion}
                    </p>
                    <div className="grid grid-cols-3 gap-4 pt-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Ahorro Estimado</p>
                        <p className="font-medium text-green-600">{recomendacion.ahorro_estimado}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Costo Implementación</p>
                        <p className="font-medium">{recomendacion.costo_implementacion}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Periodo de Retorno</p>
                        <p className="font-medium">{recomendacion.periodo_retorno} meses</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {auditData.notas && (
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Notas Adicionales</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{auditData.notas}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BasicAuditDetail;
