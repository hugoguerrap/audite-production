import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from 'axios';
import { basicAuditService } from "@/lib/legacyApi";
import type { AuditoriaBasicaCreate } from "@/types/api";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const FUENTES_ENERGIA = [
  "Electricidad",
  "Gas Natural",
  "Solar",
  "Eólica",
  "Biomasa",
  "Diésel",
  "Gasolina"
];

const TIPOS_ILUMINACION = [
  "LED",
  "Fluorescente",
  "Halógena",
  "Incandescente",
  "Mixta"
];

const SISTEMAS_HVAC = [
  "Moderno",
  "Convencional",
  "Split",
  "Centralizado",
  "Sin sistema"
];

const RANGOS_EDAD = [
  "0-5 años",
  "5-10 años",
  "10-15 años",
  "15-20 años",
  "Más de 20 años"
];

const PRESUPUESTOS_IMPLEMENTACION = [
  "Bajo ($0-$10,000)",
  "Medio ($10,000-$50,000)",
  "Alto ($50,000+)"
];

const formSchema = z.object({
  nombre_empresa: z.string().min(1, "El nombre de la empresa es requerido"),
  sector: z.string().min(1, "El sector es requerido"),
  num_empleados: z.coerce.number().int().positive("Debe ser un número entero positivo"),
  tamano_instalacion: z.coerce.number().positive("Debe ser un número positivo"),
  consumo_anual: z.coerce.number().positive("Debe ser un número positivo"),
  factura_mensual: z.coerce.number().positive("Debe ser un número positivo"),
  tiene_auditoria_previa: z.boolean().default(false),
  fuentes_energia: z.array(z.string()).min(1, "Seleccione al menos una fuente de energía"),
  datos_equipos: z.object({
    tipo_iluminacion: z.string().min(1, "Seleccione el tipo de iluminación"),
    sistema_hvac: z.string().min(1, "Seleccione el sistema HVAC"),
    iluminacion_potencia: z.coerce.number().positive("Debe ser un número positivo"),
    climatizacion_potencia: z.coerce.number().positive("Debe ser un número positivo"),
    edad_promedio_equipos: z.string().min(1, "Seleccione el rango de edad"),
    mantenimiento_regular: z.boolean().default(false)
  }),
  equipment_age: z.string().min(1, "Seleccione el rango de edad del equipamiento"),
  renewable_energy: z.boolean().default(false),
  energy_priorities: z.string().min(1, "Las prioridades energéticas son requeridas"),
  savings_target: z.coerce.number().min(0).max(100, "El objetivo de ahorro debe estar entre 0 y 100"),
  implementation_budget: z.string().min(1, "Seleccione un rango de presupuesto"),
  notas: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

const BasicAuditCreate = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre_empresa: "",
      sector: "",
      num_empleados: 1,
      tamano_instalacion: 1,
      consumo_anual: 1,
      factura_mensual: 1,
      tiene_auditoria_previa: false,
      fuentes_energia: [],
      datos_equipos: {
        tipo_iluminacion: "",
        sistema_hvac: "",
        iluminacion_potencia: 1,
        climatizacion_potencia: 1,
        edad_promedio_equipos: "",
        mantenimiento_regular: false
      },
      equipment_age: "",
      renewable_energy: false,
      energy_priorities: "",
      savings_target: 0,
      implementation_budget: "",
      notas: ""
    },
  });

  const onSubmit = async (values: FormValues) => {
    const payload: AuditoriaBasicaCreate = {
      nombre_empresa: values.nombre_empresa!,
      sector: values.sector!,
      tamano_instalacion: values.tamano_instalacion!,
      num_empleados: values.num_empleados!,
      consumo_anual: values.consumo_anual!,
      factura_mensual: values.factura_mensual!,
      tiene_auditoria_previa: values.tiene_auditoria_previa!,
      fuentes_energia: values.fuentes_energia!,
      datos_equipos: {
        tipo_iluminacion: values.datos_equipos.tipo_iluminacion!,
        sistema_hvac: values.datos_equipos.sistema_hvac!,
        iluminacion_potencia: values.datos_equipos.iluminacion_potencia!,
        climatizacion_potencia: values.datos_equipos.climatizacion_potencia!,
        edad_promedio_equipos: values.datos_equipos.edad_promedio_equipos!,
        mantenimiento_regular: values.datos_equipos.mantenimiento_regular!,
      },
      equipment_age: values.equipment_age!,
      renewable_energy: values.renewable_energy!,
      energy_priorities: values.energy_priorities!,
      savings_target: values.savings_target!,
      implementation_budget: values.implementation_budget!,
      notas: values.notas || null,
    };

    try {
      setIsSubmitting(true);
      await basicAuditService.create(payload);
      toast.success("Auditoría básica creada exitosamente");
      navigate("/auditoria-basica");
    } catch (error) {
      console.error("Error creating basic audit:", error);
      if (axios.isAxiosError(error) && error.response?.status === 422) {
        toast.error("Error de validación. Revisa los datos del formulario.", {
          description: JSON.stringify(error.response.data?.detail || 'Error desconocido', null, 2),
        });
      } else {
        toast.error("Error al crear la auditoría básica");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center">
        <Button variant="ghost" onClick={() => navigate("/auditoria-basica")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <h1 className="text-3xl font-bold tracking-tight ml-4">Nueva Auditoría Básica</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos de la Auditoría</CardTitle>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="nombre_empresa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de la empresa</FormLabel>
                      <FormControl>
                        <Input placeholder="Empresa S.A." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sector"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sector</FormLabel>
                      <FormControl>
                        <Input placeholder="Industria, Servicios, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="num_empleados"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de empleados</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tamano_instalacion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tamaño instalación (m²)</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="consumo_anual"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Consumo anual (kWh)</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="factura_mensual"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Factura mensual (€)</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Equipamiento e Instalaciones</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="datos_equipos.tipo_iluminacion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de iluminación</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TIPOS_ILUMINACION.map((tipo) => (
                              <SelectItem key={tipo} value={tipo}>
                                {tipo}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="datos_equipos.sistema_hvac"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sistema HVAC</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar sistema" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {SISTEMAS_HVAC.map((sistema) => (
                              <SelectItem key={sistema} value={sistema}>
                                {sistema}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="datos_equipos.iluminacion_potencia"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Potencia iluminación (kW)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0.1" step="0.1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="datos_equipos.climatizacion_potencia"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Potencia climatización (kW)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0.1" step="0.1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="datos_equipos.edad_promedio_equipos"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Edad promedio equipos</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar rango" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {RANGOS_EDAD.map((rango) => (
                              <SelectItem key={rango} value={rango}>
                                {rango}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="datos_equipos.mantenimiento_regular"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Mantenimiento regular
                          </FormLabel>
                          <FormDescription>
                            ¿Se realiza mantenimiento regular a los equipos?
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Energía y Objetivos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="fuentes_energia"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fuentes de energía</FormLabel>
                        <div className="space-y-2">
                          {FUENTES_ENERGIA.map((fuente) => (
                            <div key={fuente} className="flex items-center space-x-2">
                              <Checkbox
                                checked={field.value.includes(fuente)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([...field.value, fuente]);
                                  } else {
                                    field.onChange(field.value.filter((value) => value !== fuente));
                                  }
                                }}
                              />
                              <FormLabel className="font-normal">
                                {fuente}
                              </FormLabel>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="equipment_age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Edad del equipamiento</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar rango" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {RANGOS_EDAD.map((rango) => (
                              <SelectItem key={rango} value={rango.replace(" ", "_").toLowerCase()}>
                                {rango}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="renewable_energy"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Energías renovables
                          </FormLabel>
                          <FormDescription>
                            ¿Utiliza energías renovables actualmente?
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="energy_priorities"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prioridades energéticas</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ej: Reducción de costos, Eficiencia energética"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="savings_target"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Objetivo de ahorro (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="implementation_budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Presupuesto de implementación</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar rango" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PRESUPUESTOS_IMPLEMENTACION.map((presupuesto) => (
                              <SelectItem key={presupuesto} value={presupuesto}>
                                {presupuesto}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="tiene_auditoria_previa"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        ¿Tiene auditoría energética previa?
                      </FormLabel>
                      <FormDescription>
                        Marcar si se ha realizado una auditoría energética anteriormente.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas adicionales</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Añade información adicional que pueda ser relevante..."
                        className="min-h-32"
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
                variant="outline"
                onClick={() => navigate("/auditoria-basica")}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar"
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default BasicAuditCreate;
