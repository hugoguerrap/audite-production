import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { agroAuditService, agroDataService } from "@/lib/legacyApi";
import type {
  AgroIndustryType,
  AgroEquipment,
  AgroProcess,
  AuditoriaAgro,
  AuditoriaAgroCreate,
  AuditoriaAgroUpdate,
} from "@/types/api";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import axios from "axios";

interface AgroAuditFormProps {
  isEditing?: boolean;
}

const formSchema = z.object({
  nombre_proyecto: z.string().min(1, "El nombre de la explotación es requerido"),
  ubicacion: z.string().min(1, "La ubicación es requerida"),
  area_total: z.coerce.number().positive("El área total debe ser positiva"),
  tipo_cultivo: z.string().min(1, "El tipo de cultivo es requerido"),
  
  // Consumos principales
  consumo_electrico: z.coerce.number().nonnegative("El consumo eléctrico no puede ser negativo"),
  consumo_combustible: z.coerce.number().nonnegative("El consumo de combustible no puede ser negativo"),
  consumo_agua: z.coerce.number().nonnegative("El consumo de agua no puede ser negativo"),
  
  // Consumos por etapa
  consumo_campo: z.coerce.number().nonnegative("El consumo de campo no puede ser negativo"),
  consumo_planta: z.coerce.number().nonnegative("El consumo de planta no puede ser negativo"),
  consumo_plantel: z.coerce.number().nonnegative("El consumo de plantel no puede ser negativo"),
  consumo_faenamiento: z.coerce.number().nonnegative("El consumo de faenamiento no puede ser negativo"),
  consumo_proceso: z.coerce.number().nonnegative("El consumo de proceso no puede ser negativo"),
  consumo_distribucion: z.coerce.number().nonnegative("El consumo de distribución no puede ser negativo"),
  
  produccion_anual: z.coerce.number().positive("La producción anual debe ser positiva"),
  unidad_produccion: z.string().min(1, "Selecciona una unidad de producción"),
  
  sistemas_riego: z.object({
    tipo: z.string().min(1, "Selecciona el tipo de sistema de riego"),
    consumo_agua: z.coerce.number().nonnegative("El consumo de agua no puede ser negativo"),
    eficiencia: z.coerce.number().min(0, "La eficiencia mínima es 0").max(1, "La eficiencia máxima es 1")
  }),
  
  // Características de gestión
  tiene_certificacion: z.boolean().default(false),
  tiene_mantenimiento: z.boolean().default(false),
  tiene_automatizacion: z.boolean().default(false),
  
  observaciones: z.string().optional(),
  equipos: z.record(z.number()).default({})
});

type FormValues = z.infer<typeof formSchema>;

const AgroAuditForm = ({ isEditing = false }: AgroAuditFormProps) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tiposCultivo, setTiposCultivo] = useState<AgroIndustryType[]>([]);
  const [equiposDisponibles, setEquiposDisponibles] = useState<AgroEquipment[]>([]);
  const [procesosDisponibles, setProcesosDisponibles] = useState<AgroProcess[]>([]);

  const unidadesProduccion = [
    "kg",
    "toneladas",
    "cajas",
    "unidades",
    "litros",
    "quintales",
    "fardos"
  ];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre_proyecto: "",
      ubicacion: "",
      area_total: 0,
      tipo_cultivo: "",
      consumo_electrico: 0,
      consumo_combustible: 0,
      consumo_agua: 0,
      consumo_campo: 0,
      consumo_planta: 0,
      consumo_plantel: 0,
      consumo_faenamiento: 0,
      consumo_proceso: 0,
      consumo_distribucion: 0,
      produccion_anual: 0,
      unidad_produccion: "",
      sistemas_riego: {
        tipo: "",
        consumo_agua: 0,
        eficiencia: 0
      },
      tiene_certificacion: false,
      tiene_mantenimiento: false,
      tiene_automatizacion: false,
      observaciones: "",
      equipos: {}
    },
  });

  useEffect(() => {
    const loadFormData = async () => {
      try {
        setIsLoading(true);
        
        const [industryTypesData, equiposData, procesosData] = await Promise.all([
          agroDataService.getIndustryTypes(),
          agroDataService.getEquipment(),
          agroDataService.getProcesses()
        ]);
        
        setTiposCultivo(industryTypesData);
        setEquiposDisponibles(equiposData);
        setProcesosDisponibles(procesosData);
        
        if (isEditing && id) {
          const auditData: AuditoriaAgro = await agroAuditService.getById(Number(id));
          
          const sistemaRiego = {
            tipo: typeof auditData.sistemas_riego.tipo === 'string' 
              ? auditData.sistemas_riego.tipo 
              : '',
            consumo_agua: typeof auditData.sistemas_riego.consumo_agua === 'number'
              ? auditData.sistemas_riego.consumo_agua
              : 0,
            eficiencia: typeof auditData.sistemas_riego.eficiencia === 'number'
              ? auditData.sistemas_riego.eficiencia
              : 0
          };
          
          form.reset({
            nombre_proyecto: auditData.nombre_proyecto,
            ubicacion: auditData.ubicacion,
            area_total: auditData.area_total,
            tipo_cultivo: auditData.tipo_cultivo,
            consumo_electrico: auditData.consumo_electrico,
            consumo_combustible: auditData.consumo_combustible,
            consumo_agua: auditData.consumo_agua,
            consumo_campo: auditData.consumo_campo,
            consumo_planta: auditData.consumo_planta,
            consumo_plantel: auditData.consumo_plantel,
            consumo_faenamiento: auditData.consumo_faenamiento,
            consumo_proceso: auditData.consumo_proceso,
            consumo_distribucion: auditData.consumo_distribucion,
            produccion_anual: auditData.produccion_anual,
            unidad_produccion: auditData.unidad_produccion,
            sistemas_riego: sistemaRiego,
            tiene_certificacion: auditData.tiene_certificacion,
            tiene_mantenimiento: auditData.tiene_mantenimiento,
            tiene_automatizacion: auditData.tiene_automatizacion,
            observaciones: auditData.observaciones,
            equipos: auditData.equipos
          });
        }
      } catch (error) {
        console.error("Error loading form data:", error);
        toast.error(isEditing 
          ? "Error al cargar los datos de la auditoría" 
          : "Error al cargar los datos de referencia");
      } finally {
        setIsLoading(false);
      }
    };

    loadFormData();
  }, [isEditing, id, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);

      const submitData: AuditoriaAgroCreate = {
        nombre_proyecto: values.nombre_proyecto,
        ubicacion: values.ubicacion,
        area_total: values.area_total,
        tipo_cultivo: values.tipo_cultivo,
        consumo_electrico: values.consumo_electrico,
        consumo_combustible: values.consumo_combustible,
        consumo_agua: values.consumo_agua,
        consumo_campo: values.consumo_campo,
        consumo_planta: values.consumo_planta,
        consumo_plantel: values.consumo_plantel,
        consumo_faenamiento: values.consumo_faenamiento,
        consumo_proceso: values.consumo_proceso,
        consumo_distribucion: values.consumo_distribucion,
        produccion_anual: values.produccion_anual,
        unidad_produccion: values.unidad_produccion,
        sistemas_riego: {
          tipo: values.sistemas_riego.tipo,
          consumo_agua: values.sistemas_riego.consumo_agua,
          eficiencia: values.sistemas_riego.eficiencia
        },
        tiene_certificacion: values.tiene_certificacion,
        tiene_mantenimiento: values.tiene_mantenimiento,
        tiene_automatizacion: values.tiene_automatizacion,
        observaciones: values.observaciones,
        equipos: values.equipos
      };

      if (isEditing && id) {
        await agroAuditService.update(Number(id), submitData);
        toast.success("Auditoría agrícola actualizada exitosamente");
      } else {
        await agroAuditService.create(submitData);
        toast.success("Auditoría agrícola creada exitosamente");
      }
      
      navigate("/auditoria-agro");
    } catch (error) {
      console.error("Error saving agro audit:", error);
      if (axios.isAxiosError(error) && error.response?.status === 422) {
        const validationErrors = error.response.data.detail;
        console.log("Validation errors:", validationErrors);
        toast.error("Error de validación. Revisa los datos del formulario.");
      } else {
        toast.error(isEditing 
          ? "Error al actualizar la auditoría agrícola" 
          : "Error al crear la auditoría agrícola");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Cargando formulario...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center">
        <Button 
          variant="secondary"
          onClick={() => navigate("/auditoria-agro")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <h1 className="text-3xl font-bold tracking-tight ml-4">
          {isEditing ? "Editar" : "Nueva"} Auditoría Agrícola
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos de la Auditoría</CardTitle>
        </CardHeader>
        <Form {...form}>
          {/* Mostrar errores globales de validación */}
          {Object.keys(form.formState.errors).length > 0 && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
              <strong>Errores en el formulario:</strong>
              <ul className="list-disc list-inside text-sm mt-1">
                {Object.entries(form.formState.errors).map(([key, error]) => {
                  const msg = typeof error === 'object' && error && 'message' in error
                    ? (error as any).message
                    : 'Error de validación';
                  return (
                    <li key={key}>{key}: {msg}</li>
                  );
                })}
              </ul>
            </div>
          )}
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Información general</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="nombre_proyecto"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre de la explotación</FormLabel>
                        <FormControl>
                          <Input placeholder="Finca El Olivar" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ubicacion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ubicación</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Calle Principal, 123" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="area_total"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Área total (ha)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0.1" step="0.1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tipo_cultivo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de cultivo</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar tipo de cultivo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {tiposCultivo.map((tipo) => {
                              const nombreCultivo = tipo.producto || tipo.subsector || tipo.sector;
                              return (
                                <SelectItem key={nombreCultivo} value={nombreCultivo}>
                                  {nombreCultivo}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="produccion_anual"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Producción anual</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input type="number" min="0.01" step="0.01" placeholder="Ej: 10000" {...field} />
                          </FormControl>
                          <FormField
                            control={form.control}
                            name="unidad_produccion"
                            render={({ field: unitField }) => (
                              <Select
                                onValueChange={unitField.onChange}
                                value={unitField.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Unidad" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {unidadesProduccion.map((unidad) => (
                                    <SelectItem key={unidad} value={unidad}>
                                      {unidad}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Consumo energético</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="consumo_electrico"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Consumo eléctrico (kWh/año)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="consumo_combustible"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Consumo combustible (L/año)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="consumo_agua"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Consumo de agua (m³/año)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Consumos por etapa</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="consumo_campo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Consumo campo (kWh/año)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="consumo_planta"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Consumo planta (kWh/año)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="consumo_plantel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Consumo plantel (kWh/año)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="consumo_faenamiento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Consumo faenamiento (kWh/año)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="consumo_proceso"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Consumo proceso (kWh/año)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="consumo_distribucion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Consumo distribución (kWh/año)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Equipos utilizados</h3>
                
                {equiposDisponibles.length === 0 ? (
                  <Alert className="mb-4">
                    <AlertDescription>
                      No hay equipos disponibles. Esto podría deberse a un problema con la carga de datos iniciales.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <FormField
                    control={form.control}
                    name="equipos"
                    render={({ field }) => {
                      return (
                        <FormItem>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {equiposDisponibles.map((equipo) => {
                              const currentEquipo = field.value[equipo.id] || 0;
                              const isChecked = currentEquipo > 0;

                              return (
                                <div key={equipo.id} className="flex flex-col p-2 border rounded space-y-2">
                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`equipo-${equipo.id}`}
                                      checked={isChecked}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          field.onChange({ ...field.value, [equipo.id]: 1 });
                                        } else {
                                          field.onChange({ ...field.value, [equipo.id]: 0 });
                                        }
                                      }}
                                    />
                                    <FormLabel htmlFor={`equipo-${equipo.id}`} className="font-normal cursor-pointer text-sm">
                                      {equipo.equipo} ({equipo.fuentes_energia.join(", ")})
                                    </FormLabel>
                                  </div>
                                  {isChecked && (
                                    <div className="pl-6 space-y-2">
                                      <div>
                                        <FormLabel htmlFor={`horas-${equipo.id}`} className="text-xs text-muted-foreground">
                                          Horas de uso anuales:
                                        </FormLabel>
                                        <Input
                                          id={`horas-${equipo.id}`}
                                          type="number"
                                          min="0"
                                          value={currentEquipo}
                                          onChange={e => {
                                            const horas = parseInt(e.target.value, 10) || 0;
                                            field.onChange({ ...field.value, [equipo.id]: horas });
                                          }}
                                          className="h-8 text-sm w-full"
                                        />
                                      </div>
                                      <div>
                                        <FormLabel htmlFor={`consumo-${equipo.id}`} className="text-xs text-muted-foreground">
                                          Consumo combustible (L/h):
                                        </FormLabel>
                                        <Input
                                          id={`consumo-${equipo.id}`}
                                          type="number"
                                          min="0"
                                          step="0.1"
                                          value={currentEquipo}
                                          onChange={e => {
                                            const consumo = parseFloat(e.target.value) || 0;
                                            field.onChange({ ...field.value, [equipo.id]: consumo });
                                          }}
                                          className="h-8 text-sm w-full"
                                        />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                )}
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Sistemas de riego</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="sistemas_riego.tipo"
                    render={({ field }) => {
                      const sistemasRiegoNombres = [
                        "Goteros",
                        "Aspersores",
                        "Microaspersores",
                        "Nebulizadores",
                        "Pivotes de riego",
                        "Filtros (riego)",
                        "Bomba de impulsión (riego)",
                        "Motobomba (riego)"
                      ];

                      return (
                        <FormItem>
                          <FormLabel>Tipo de sistema de riego</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {sistemasRiegoNombres.map((nombre) => (
                                <SelectItem key={nombre} value={nombre}>
                                  {nombre}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />

                  <FormField
                    control={form.control}
                    name="sistemas_riego.eficiencia"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Eficiencia del sistema de riego</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" max="1" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="sistemas_riego.consumo_agua"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Consumo de agua del sistema de riego (m³/año)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <h3 className="text-lg font-medium mb-4">Características de gestión</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="tiene_certificacion"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Certificaciones de calidad/eficiencia
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tiene_mantenimiento"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Programa de mantenimiento
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tiene_automatizacion"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Sistemas automatizados
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="observaciones"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observaciones</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ingrese observaciones adicionales..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="secondary"
                onClick={() => navigate("/auditoria-agro")}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditing ? "Actualizando..." : "Guardando..."}
                  </>
                ) : (
                  isEditing ? "Actualizar" : "Guardar"
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default AgroAuditForm;
