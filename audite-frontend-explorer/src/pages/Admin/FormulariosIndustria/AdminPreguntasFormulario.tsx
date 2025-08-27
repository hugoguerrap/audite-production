/**
 * Página de administración de preguntas de formulario con lógica condicional
 * Gestión jerárquica, drag-and-drop y preview en tiempo real
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { 
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  GripVertical,
  Eye,
  EyeOff,
  HelpCircle,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Copy,
  MoreHorizontal,
  Target,
  Layers,
  ArrowLeft,
  Settings,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react';
import { PreguntaFormulario } from '@/types/industria';
import { useAdminPreguntasCondicionales } from './hooks/useAdminPreguntasCondicionales';
import PreguntaCondicionalForm from './components/PreguntaCondicionalForm';
import PreviewFormulario from './components/PreviewFormulario';

interface PreguntaJerarquica extends PreguntaFormulario {
  hijas?: PreguntaJerarquica[];
  nivel: number;
}

type FiltroTipo = 'todos' | 'radio' | 'checkbox' | 'text' | 'number' | 'select' | 'ordering';
type FiltroCondicional = 'todos' | 'condicionales' | 'independientes';

const AdminPreguntasFormulario: React.FC = () => {
  const { formularioId } = useParams<{ formularioId: string }>();
  const navigate = useNavigate();
  
  // Si no hay formularioId en la URL, usar el formulario 1 por defecto
  const formularioIdActual = formularioId ? parseInt(formularioId) : 1;
  
  // Estados locales
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>('todos');
  const [filtroCondicional, setFiltroCondicional] = useState<FiltroCondicional>('todos');
  const [preguntasExpanded, setPreguntasExpanded] = useState<Set<number>>(new Set());
  
  // Estados para modales y formularios
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [preguntaEditando, setPreguntaEditando] = useState<PreguntaFormulario | null>(null);
  const [preguntaEliminar, setPreguntaEliminar] = useState<PreguntaFormulario | null>(null);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [mostrarPreview, setMostrarPreview] = useState(true);

  // Estados para drag and drop
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [dragOverItem, setDragOverItem] = useState<number | null>(null);

  // Hook principal
  const {
    preguntas,
    formulario,
    loading,
    error,
    fetchPreguntas,
    fetchFormulario,
    crearPregunta: createPregunta,
    actualizarPregunta: updatePregunta,
    eliminarPregunta: deletePregunta,
    duplicarPregunta,
    reordenarPreguntas: reorderPreguntas,
    toggleEstadoPregunta,
    validarEstructuraCompleta: validateCondiciones
  } = useAdminPreguntasCondicionales();

  // Funciones temporales para evitar errores
  const exportPreguntas = async () => {
    console.log('exportPreguntas: Pendiente de implementación');
  };
  
  const importPreguntas = async () => {
    console.log('importPreguntas: Pendiente de implementación');
  };

  // Efecto para cargar datos al montar
  useEffect(() => {
    if (formularioIdActual) {
      fetchFormulario(formularioIdActual);
      fetchPreguntas(formularioIdActual);
    }
  }, [formularioIdActual, fetchPreguntas, fetchFormulario]);

  // Función para construir estructura jerárquica
  const construirJerarquia = (preguntas: PreguntaFormulario[]): PreguntaJerarquica[] => {
    const preguntasMap = new Map<number, PreguntaJerarquica>();
    const preguntasRaiz: PreguntaJerarquica[] = [];

    // Crear mapa de preguntas con estructura jerárquica
    preguntas.forEach(pregunta => {
      preguntasMap.set(pregunta.id, {
        ...pregunta,
        hijas: [],
        nivel: 0
      });
    });

    // Construir jerarquía
    preguntas.forEach(pregunta => {
      const preguntaJerarquica = preguntasMap.get(pregunta.id)!;
      
      if (pregunta.pregunta_padre_id) {
        const padre = preguntasMap.get(pregunta.pregunta_padre_id);
        if (padre) {
          preguntaJerarquica.nivel = padre.nivel + 1;
          padre.hijas!.push(preguntaJerarquica);
        } else {
          // Pregunta huérfana, agregar a raíz
          preguntasRaiz.push(preguntaJerarquica);
        }
      } else {
        preguntasRaiz.push(preguntaJerarquica);
      }
    });

    return preguntasRaiz;
  };

  // Función para aplanar jerarquía para filtrado
  const aplanarJerarquia = (preguntas: PreguntaJerarquica[]): PreguntaJerarquica[] => {
    const resultado: PreguntaJerarquica[] = [];
    
    const procesar = (preguntasArray: PreguntaJerarquica[]) => {
      preguntasArray.forEach(pregunta => {
        resultado.push(pregunta);
        if (pregunta.hijas && pregunta.hijas.length > 0) {
          procesar(pregunta.hijas);
        }
      });
    };
    
    procesar(preguntas);
    return resultado;
  };

  // Función para filtrar preguntas
  const preguntasFiltradas = (): PreguntaJerarquica[] => {
    const jerarquia = construirJerarquia(preguntas);
    const aplanada = aplanarJerarquia(jerarquia);
    
    return aplanada.filter(pregunta => {
      // Filtro por búsqueda
      const coincideBusqueda = busqueda === '' || 
        pregunta.texto_pregunta.toLowerCase().includes(busqueda.toLowerCase()) ||
        pregunta.subtitulo?.toLowerCase().includes(busqueda.toLowerCase());

      // Filtro por tipo
      const coincideTipo = filtroTipo === 'todos' || pregunta.tipo_pregunta === filtroTipo;

      // Filtro por condicional
      const esCondicional = pregunta.pregunta_padre_id !== null;
      const coincideCondicional = filtroCondicional === 'todos' ||
        (filtroCondicional === 'condicionales' && esCondicional) ||
        (filtroCondicional === 'independientes' && !esCondicional);

      return coincideBusqueda && coincideTipo && coincideCondicional;
    });
  };

  // Función para toggle expansión de pregunta
  const toggleExpansion = (preguntaId: number) => {
    const newExpanded = new Set(preguntasExpanded);
    if (newExpanded.has(preguntaId)) {
      newExpanded.delete(preguntaId);
    } else {
      newExpanded.add(preguntaId);
    }
    setPreguntasExpanded(newExpanded);
  };

  // Función para expandir/colapsar todas
  const toggleExpandAll = () => {
    if (preguntasExpanded.size > 0) {
      setPreguntasExpanded(new Set());
    } else {
      const todasLasPreguntas = new Set(preguntas.map(p => p.id));
      setPreguntasExpanded(todasLasPreguntas);
    }
  };

  // Función para manejar creación
  const handleCrear = (preguntaPadreId?: number) => {
    setPreguntaEditando(null);
    // Si se pasa preguntaPadreId, la nueva pregunta será hija de esa pregunta
    setMostrarFormulario(true);
  };

  // Función para manejar edición
  const handleEditar = (pregunta: PreguntaFormulario) => {
    setPreguntaEditando(pregunta);
    setMostrarFormulario(true);
  };

  // Función para manejar eliminación
  const handleEliminar = (pregunta: PreguntaFormulario) => {
    setPreguntaEliminar(pregunta);
    setMostrarConfirmacion(true);
  };

  // Función para confirmar eliminación
  const confirmarEliminacion = async () => {
    if (preguntaEliminar && formularioIdActual) {
      await deletePregunta(formularioIdActual, preguntaEliminar.id);
      setPreguntaEliminar(null);
      setMostrarConfirmacion(false);
    }
  };

  // Función para guardar pregunta
  const handleGuardar = async (pregunta: Partial<PreguntaFormulario>) => {
    if (!formularioIdActual) return;
    
    try {
      // Asegurar que el formulario_id esté en los datos
      const preguntaConFormulario = {
        ...pregunta,
        formulario_id: formularioIdActual
      };
      
      if (preguntaEditando) {
        await updatePregunta(preguntaEditando.id, preguntaConFormulario);
      } else {
        await createPregunta(preguntaConFormulario);
      }
      setMostrarFormulario(false);
      setPreguntaEditando(null);
    } catch (error) {
      console.error('Error guardando pregunta:', error);
    }
  };

  // Función para toggle estado
  const handleToggleEstado = async (pregunta: PreguntaFormulario) => {
    if (formularioIdActual) {
      await toggleEstadoPregunta(formularioIdActual, pregunta.id, !pregunta.activa);
    }
  };

  // Función para duplicar
  const handleDuplicar = async (pregunta: PreguntaFormulario) => {
    if (formularioIdActual) {
      await duplicarPregunta(formularioIdActual, pregunta.id);
    }
  };

  // Funciones para drag and drop
  const handleDragStart = (e: React.DragEvent<HTMLTableRowElement>, preguntaId: number) => {
    setDraggedItem(preguntaId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLTableRowElement>, preguntaId: number) => {
    e.preventDefault();
    setDragOverItem(preguntaId);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleDrop = async (e: React.DragEvent<HTMLTableRowElement>, targetId: number) => {
    e.preventDefault();
    
    if (draggedItem && draggedItem !== targetId && formularioIdActual) {
      const preguntasFiltradas = preguntasFiltradas();
      const draggedIndex = preguntasFiltradas.findIndex(p => p.id === draggedItem);
      const targetIndex = preguntasFiltradas.findIndex(p => p.id === targetId);
      
      if (draggedIndex !== -1 && targetIndex !== -1) {
        const newOrder = [...preguntasFiltradas];
        const [removed] = newOrder.splice(draggedIndex, 1);
        newOrder.splice(targetIndex, 0, removed);
        
        // Actualizar orden en backend
        const ordenIds = newOrder.map((p, index) => ({ id: p.id, orden: index + 1 }));
        await reorderPreguntas(formularioIdActual, ordenIds);
      }
    }
    
    handleDragEnd();
  };

  // Función para exportar
  const handleExportar = async () => {
    if (!formularioIdActual) return;
    
    try {
      const data = await exportPreguntas();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `preguntas-formulario-${formularioIdActual}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exportando preguntas:', error);
    }
  };

  // Función para importar
  const handleImportar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && formularioIdActual) {
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        await importPreguntas();
        event.target.value = ''; // Reset input
      } catch (error) {
        console.error('Error importando preguntas:', error);
      }
    }
  };

  // Función para validar condiciones
  const handleValidarCondiciones = async () => {
    if (formularioIdActual) {
      await validateCondiciones(formularioIdActual);
    }
  };

  // Función para renderizar fila de pregunta
  const renderPreguntaRow = (pregunta: PreguntaJerarquica) => {
    const tieneHijas = pregunta.hijas && pregunta.hijas.length > 0;
    const esCondicional = pregunta.pregunta_padre_id !== null;
    const isExpanded = preguntasExpanded.has(pregunta.id);
    
    return (
      <React.Fragment key={pregunta.id}>
        <TableRow
          draggable
          onDragStart={(e) => handleDragStart(e, pregunta.id)}
          onDragOver={(e) => handleDragOver(e, pregunta.id)}
          onDrop={(e) => handleDrop(e, pregunta.id)}
          onDragEnd={handleDragEnd}
          className={`
            ${draggedItem === pregunta.id ? 'opacity-50' : ''}
            ${dragOverItem === pregunta.id ? 'border-t-2 border-t-primary' : ''}
            hover:bg-muted/50 transition-colors
          `}
          style={{ paddingLeft: `${pregunta.nivel * 20}px` }}
        >
          <TableCell className="w-[50px]">
            <div className="flex items-center gap-1">
              {tieneHijas && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleExpansion(pregunta.id)}
                  className="h-6 w-6 p-0"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </Button>
              )}
              <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
            </div>
          </TableCell>
          
          <TableCell>
            <div className="flex items-center gap-2">
              {pregunta.nivel > 0 && (
                <div className="flex items-center text-muted-foreground">
                  {Array.from({ length: pregunta.nivel }, (_, i) => (
                    <ArrowRight key={i} className="h-3 w-3" />
                  ))}
                </div>
              )}
              <div className="flex-1">
                <div className="font-medium">{pregunta.texto_pregunta}</div>
                {pregunta.subtitulo && (
                  <div className="text-sm text-muted-foreground">{pregunta.subtitulo}</div>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {pregunta.tipo_pregunta}
                  </Badge>
                  {esCondicional && (
                    <Badge variant="secondary" className="text-xs">
                      <HelpCircle className="h-3 w-3 mr-1" />
                      Condicional
                    </Badge>
                  )}
                  {pregunta.requerida && (
                    <Badge variant="destructive" className="text-xs">
                      Requerida
                    </Badge>
                  )}
                  {pregunta.tiene_opcion_otro && (
                    <Badge variant="outline" className="text-xs">
                      Con "Otro"
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </TableCell>
          
          <TableCell className="text-center">
            <Badge variant="outline">{pregunta.orden || 0}</Badge>
          </TableCell>
          
          <TableCell className="text-center">
            <Badge variant={pregunta.activa ? 'default' : 'secondary'}>
              {pregunta.activa ? 'Activa' : 'Inactiva'}
            </Badge>
          </TableCell>
          
          <TableCell className="text-right">
            <div className="flex items-center justify-end gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleToggleEstado(pregunta)}
                title={pregunta.activa ? 'Desactivar' : 'Activar'}
              >
                {pregunta.activa ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCrear(pregunta.id)}
                title="Agregar pregunta hija"
                className="text-green-600 hover:text-green-700"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDuplicar(pregunta)}
                title="Duplicar"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEditar(pregunta)}
                title="Editar"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEliminar(pregunta)}
                title="Eliminar"
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
        
        {/* Renderizar preguntas hijas si está expandida */}
        {isExpanded && tieneHijas && (
          <>
            {pregunta.hijas!.map(hija => renderPreguntaRow(hija))}
          </>
        )}
      </React.Fragment>
    );
  };

  if (!formularioIdActual) {
    return (
      <div className="text-center py-8">
        <Alert variant="destructive">
          <AlertDescription>ID de formulario no válido</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <Card className="mb-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin/formularios-industria')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Gestión de Preguntas - {formulario?.nombre || 'Cargando...'}
                </CardTitle>
                <p className="text-muted-foreground text-sm mt-1">
                  Administra las preguntas y su lógica condicional
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleValidarCondiciones}
                title="Validar lógica condicional"
              >
                <Target className="h-4 w-4 mr-2" />
                Validar
              </Button>
              <Button onClick={() => handleCrear()} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nueva Pregunta
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Contenido principal con panel resizable */}
      <div className="flex-1">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Panel de gestión de preguntas */}
          <ResizablePanel defaultSize={mostrarPreview ? 60 : 100} minSize={30}>
            <div className="h-full flex flex-col">
              {/* Controles y filtros */}
              <Card className="mb-4">
                <CardContent className="pt-4">
                  <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                    {/* Búsqueda */}
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar preguntas..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    {/* Filtros y controles */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Filtro por tipo */}
                      <Select value={filtroTipo} onValueChange={(value: FiltroTipo) => setFiltroTipo(value)}>
                        <SelectTrigger className="w-[140px]">
                          <Filter className="h-4 w-4 mr-2" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos los tipos</SelectItem>
                          <SelectItem value="radio">Radio</SelectItem>
                          <SelectItem value="checkbox">Checkbox</SelectItem>
                          <SelectItem value="text">Texto</SelectItem>
                          <SelectItem value="number">Número</SelectItem>
                          <SelectItem value="select">Select</SelectItem>
                          <SelectItem value="ordering">Ordenamiento</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Filtro por condicional */}
                      <Select value={filtroCondicional} onValueChange={(value: FiltroCondicional) => setFiltroCondicional(value)}>
                        <SelectTrigger className="w-[160px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todas</SelectItem>
                          <SelectItem value="condicionales">Condicionales</SelectItem>
                          <SelectItem value="independientes">Independientes</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Toggle preview */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setMostrarPreview(!mostrarPreview)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {mostrarPreview ? 'Ocultar' : 'Mostrar'} Preview
                      </Button>

                      {/* Expand/Collapse All */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleExpandAll}
                      >
                        {preguntasExpanded.size > 0 ? 'Colapsar' : 'Expandir'} Todo
                      </Button>

                      {/* Exportar/Importar */}
                      <Button variant="outline" size="sm" onClick={handleExportar}>
                        <Download className="h-4 w-4 mr-2" />
                        Exportar
                      </Button>
                      
                      <label className="cursor-pointer">
                        <Button variant="outline" size="sm" asChild>
                          <span>
                            <Upload className="h-4 w-4 mr-2" />
                            Importar
                          </span>
                        </Button>
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleImportar}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Alertas */}
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Lista de preguntas */}
              <Card className="flex-1">
                <CardContent className="pt-6 h-full">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Cargando preguntas...</p>
                    </div>
                  ) : preguntasFiltradas().length === 0 ? (
                    <div className="text-center py-8">
                      <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No hay preguntas</h3>
                      <p className="text-muted-foreground mb-4">
                        {busqueda || filtroTipo !== 'todos' || filtroCondicional !== 'todos'
                          ? 'No se encontraron preguntas con los filtros aplicados'
                          : 'Comienza creando la primera pregunta de este formulario'
                        }
                      </p>
                      {!busqueda && filtroTipo === 'todos' && filtroCondicional === 'todos' && (
                        <Button onClick={() => handleCrear()}>
                          <Plus className="h-4 w-4 mr-2" />
                          Crear Primera Pregunta
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[50px]">
                              <Layers className="h-4 w-4" />
                            </TableHead>
                            <TableHead>Pregunta</TableHead>
                            <TableHead className="text-center">Orden</TableHead>
                            <TableHead className="text-center">Estado</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {construirJerarquia(preguntasFiltradas()).map(pregunta => 
                            renderPreguntaRow(pregunta)
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </ResizablePanel>

          {/* Panel de preview */}
          {mostrarPreview && (
            <>
              <ResizableHandle />
              <ResizablePanel defaultSize={40} minSize={20}>
                <div className="h-full pl-4">
                  <PreviewFormulario
                    formularioId={formularioIdActual}
                    readonly={true}
                  />
                </div>
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{preguntas.length}</div>
            <p className="text-xs text-muted-foreground">Total preguntas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">
              {preguntas.filter(p => p.activa).length}
            </div>
            <p className="text-xs text-muted-foreground">Activas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-purple-600">
              {preguntas.filter(p => p.pregunta_padre_id !== null).length}
            </div>
            <p className="text-xs text-muted-foreground">Condicionales</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">
              {preguntas.filter(p => p.requerida).length}
            </div>
            <p className="text-xs text-muted-foreground">Requeridas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-orange-600">
              {preguntasFiltradas().length}
            </div>
            <p className="text-xs text-muted-foreground">Filtradas</p>
          </CardContent>
        </Card>
      </div>

      {/* Modal de formulario */}
      {mostrarFormulario && (
        <PreguntaCondicionalForm
          pregunta={preguntaEditando}
          formularioId={formularioIdActual}
          onSave={handleGuardar}
          onCancel={() => {
            setMostrarFormulario(false);
            setPreguntaEditando(null);
          }}
          mode={preguntaEditando ? 'edit' : 'create'}
        />
      )}

      {/* Modal de confirmación */}
      <AlertDialog open={mostrarConfirmacion} onOpenChange={setMostrarConfirmacion}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar pregunta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la pregunta "{preguntaEliminar?.texto_pregunta}" 
              y todas las preguntas hijas dependientes. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarEliminacion} className="bg-destructive text-destructive-foreground">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPreguntasFormulario; 