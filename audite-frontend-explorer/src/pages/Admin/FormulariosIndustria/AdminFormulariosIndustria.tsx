/**
 * Página de administración de formularios por industria
 * Gestión completa con filtros por categoría, CRUD y estadísticas
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Eye,
  EyeOff,
  FileText,
  Copy,
  Settings,
  BarChart3,
  Clock,
  Users,
  HelpCircle,
  ExternalLink,
  Download,
  Upload
} from 'lucide-react';
import { FormularioIndustria, CategoriaIndustria } from '@/types/industria';
import { useAdminFormularios } from './hooks/useAdminFormularios';
import { useIndustryCategories } from '../../DiagnosticosIndustria/hooks/useIndustryCategories';
import FormularioIndustriaForm from './components/FormularioIndustriaForm';

type FiltroEstado = 'todos' | 'activos' | 'inactivos';
type OrdenCampo = 'nombre' | 'categoria' | 'preguntas_count' | 'created_at' | 'tiempo_estimado';
type OrdenDireccion = 'asc' | 'desc';

const AdminFormulariosIndustria: React.FC = () => {
  const navigate = useNavigate();
  
  // Estados locales
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<number | 'todas'>('todas');
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('todos');
  const [ordenCampo, setOrdenCampo] = useState<OrdenCampo>('nombre');
  const [ordenDireccion, setOrdenDireccion] = useState<OrdenDireccion>('asc');
  
  // Estados para modales y formularios
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [formularioEditando, setFormularioEditando] = useState<FormularioIndustria | null>(null);
  const [formularioEliminar, setFormularioEliminar] = useState<FormularioIndustria | null>(null);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [mostrarEstadisticas, setMostrarEstadisticas] = useState<FormularioIndustria | null>(null);

  // Hooks principales
  const {
    formularios,
    loading,
    error,
    fetchFormularios,
    crearFormulario,
    actualizarFormulario,
    eliminarFormulario,
    toggleEstadoFormulario,
    duplicarFormulario,
    // TODO: Implementar estas funciones en el hook
    // exportFormularios,
    // importFormularios,
    // getEstadisticas
  } = useAdminFormularios();

  const { categorias, loading: loadingCategorias } = useIndustryCategories();

  // Efecto para cargar datos al montar
  useEffect(() => {
    fetchFormularios();
  }, [fetchFormularios]);

  // Función para filtrar y ordenar formularios
  const formulariosFiltrados = formularios
    .filter(formulario => {
      // Filtro por búsqueda
      const coincideBusqueda = busqueda === '' || 
        formulario.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        formulario.descripcion?.toLowerCase().includes(busqueda.toLowerCase());

      // Filtro por categoría
      const coincideCategoria = categoriaFiltro === 'todas' || 
        formulario.categoria_industria_id === categoriaFiltro;

      // Filtro por estado
      const coincideEstado = filtroEstado === 'todos' ||
        (filtroEstado === 'activos' && formulario.activo) ||
        (filtroEstado === 'inactivos' && !formulario.activo);

      return coincideBusqueda && coincideCategoria && coincideEstado;
    })
    .sort((a, b) => {
      let valorA: any, valorB: any;
      
      switch (ordenCampo) {
        case 'nombre':
          valorA = a.nombre.toLowerCase();
          valorB = b.nombre.toLowerCase();
          break;
        case 'categoria':
          const categoriaA = categorias.find(c => c.id === a.categoria_industria_id);
          const categoriaB = categorias.find(c => c.id === b.categoria_industria_id);
          valorA = categoriaA?.nombre.toLowerCase() || '';
          valorB = categoriaB?.nombre.toLowerCase() || '';
          break;
        case 'preguntas_count':
          valorA = a.preguntas_count || 0;
          valorB = b.preguntas_count || 0;
          break;
        case 'tiempo_estimado':
          valorA = a.tiempo_estimado || 0;
          valorB = b.tiempo_estimado || 0;
          break;
        case 'created_at':
          valorA = new Date(a.created_at || 0);
          valorB = new Date(b.created_at || 0);
          break;
        default:
          return 0;
      }

      if (valorA < valorB) return ordenDireccion === 'asc' ? -1 : 1;
      if (valorA > valorB) return ordenDireccion === 'asc' ? 1 : -1;
      return 0;
    });

  // Función para obtener información de categoría
  const getCategoria = (categoriaId: number): CategoriaIndustria | undefined => {
    return categorias.find(c => c.id === categoriaId);
  };

  // Función para manejar creación
  const handleCrear = () => {
    setFormularioEditando(null);
    setMostrarFormulario(true);
  };

  // Función para manejar edición
  const handleEditar = (formulario: FormularioIndustria) => {
    setFormularioEditando(formulario);
    setMostrarFormulario(true);
  };

  // Función para manejar eliminación
  const handleEliminar = (formulario: FormularioIndustria) => {
    setFormularioEliminar(formulario);
    setMostrarConfirmacion(true);
  };

  // Función para confirmar eliminación
  const confirmarEliminacion = async () => {
    if (formularioEliminar) {
      await eliminarFormulario(formularioEliminar.id);
      setFormularioEliminar(null);
      setMostrarConfirmacion(false);
    }
  };

  // Función para guardar formulario
  const handleGuardar = async (formulario: Partial<FormularioIndustria>) => {
    try {
      if (formularioEditando) {
        await actualizarFormulario(formularioEditando.id, formulario);
      } else {
        await crearFormulario(formulario);
      }
      setMostrarFormulario(false);
      setFormularioEditando(null);
    } catch (error) {
      console.error('Error guardando formulario:', error);
    }
  };

  // Función para toggle estado
  const handleToggleEstado = async (formulario: FormularioIndustria) => {
    await toggleEstadoFormulario(formulario.id, !formulario.activo);
  };

  // Función para duplicar
  const handleDuplicar = async (formulario: FormularioIndustria) => {
    await duplicarFormulario(formulario.id);
  };

  // Función para ver preguntas
  const handleVerPreguntas = (formulario: FormularioIndustria) => {
    // TODO: Temporalmente deshabilitado hasta resolver errores de tipos
    // navigate(`/admin/formularios-industria/${formulario.id}/preguntas`);
    alert(`Gestión de preguntas para "${formulario.nombre}" estará disponible pronto. Formulario ID: ${formulario.id}`);
  };

  // Función para cambiar orden
  const handleCambiarOrden = (campo: OrdenCampo) => {
    if (ordenCampo === campo) {
      setOrdenDireccion(ordenDireccion === 'asc' ? 'desc' : 'asc');
    } else {
      setOrdenCampo(campo);
      setOrdenDireccion('asc');
    }
  };

  // Función para exportar
  const handleExportar = async () => {
    // TODO: Temporalmente deshabilitado hasta implementar exportFormularios en el hook
    alert('Función de exportar estará disponible pronto');
    return;
    
    /*
    try {
      const categoriaId = categoriaFiltro !== 'todas' ? Number(categoriaFiltro) : undefined;
      const data = await exportFormularios(categoriaId);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `formularios-industria-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exportando:', error);
    }
    */
  };

  // Función para importar
  const handleImportar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    // TODO: Temporalmente deshabilitado hasta implementar importFormularios en el hook
    alert('Función de importar estará disponible pronto');
    if (event.target) {
      event.target.value = ''; // Reset input
    }
    return;
    
    /*
    const file = event.target.files?.[0];
    if (file) {
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        await importFormularios(data);
        event.target.value = ''; // Reset input
      } catch (error) {
        console.error('Error importando formularios:', error);
      }
    }
    */
  };

  // Función para mostrar estadísticas
  const handleMostrarEstadisticas = async (formulario: FormularioIndustria) => {
    setMostrarEstadisticas(formulario);
    // Aquí se podría cargar estadísticas específicas del formulario
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <FileText className="h-6 w-6" />
                Gestión de Formularios por Industria
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                Administra los formularios de diagnóstico específicos para cada categoría industrial
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleCrear} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nuevo Formulario
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Controles y filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Búsqueda */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar formularios..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Filtro por categoría */}
              <Select 
                value={categoriaFiltro.toString()} 
                onValueChange={(value) => setCategoriaFiltro(value === 'todas' ? 'todas' : Number(value))}
              >
                <SelectTrigger className="w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las categorías</SelectItem>
                  {categorias.map(categoria => (
                    <SelectItem key={categoria.id} value={categoria.id.toString()}>
                      {categoria.icono} {categoria.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Filtro por estado */}
              <Select value={filtroEstado} onValueChange={(value: FiltroEstado) => setFiltroEstado(value)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="activos">Activos</SelectItem>
                  <SelectItem value="inactivos">Inactivos</SelectItem>
                </SelectContent>
              </Select>

              {/* Botones de acción */}
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
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Tabla de formularios */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Cargando formularios...</p>
            </div>
          ) : formulariosFiltrados.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay formularios</h3>
              <p className="text-muted-foreground mb-4">
                {busqueda || categoriaFiltro !== 'todas' || filtroEstado !== 'todos'
                  ? 'No se encontraron formularios con los filtros aplicados'
                  : 'Comienza creando tu primer formulario de industria'
                }
              </p>
              {!busqueda && categoriaFiltro === 'todas' && filtroEstado === 'todos' && (
                <Button onClick={handleCrear}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primer Formulario
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:text-primary"
                    onClick={() => handleCambiarOrden('nombre')}
                  >
                    Nombre
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:text-primary"
                    onClick={() => handleCambiarOrden('categoria')}
                  >
                    Categoría
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:text-primary text-center"
                    onClick={() => handleCambiarOrden('preguntas_count')}
                  >
                    Preguntas
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:text-primary text-center"
                    onClick={() => handleCambiarOrden('tiempo_estimado')}
                  >
                    Tiempo Est.
                  </TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                  <TableHead className="text-center">Estadísticas</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formulariosFiltrados.map((formulario) => {
                  const categoria = getCategoria(formulario.categoria_industria_id);
                  const tienePreguntas = (formulario.preguntas_count || 0) > 0;
                  const tieneCondicionales = formulario.tiene_condicionales || false;
                  
                  return (
                    <TableRow key={formulario.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div>
                          <div className="font-medium">{formulario.nombre}</div>
                          {formulario.descripcion && (
                            <div className="text-sm text-muted-foreground truncate max-w-xs">
                              {formulario.descripcion}
                            </div>
                          )}
                          {tieneCondicionales && (
                            <Badge variant="outline" className="text-xs mt-1">
                              <HelpCircle className="h-3 w-3 mr-1" />
                              Con lógica condicional
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {categoria ? (
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{categoria.icono}</span>
                            <span className="text-sm">{categoria.nombre}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Sin categoría</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={tienePreguntas ? "default" : "secondary"}>
                          {formulario.preguntas_count || 0}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {formulario.tiempo_estimado ? (
                          <div className="flex items-center justify-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span className="text-sm">{formulario.tiempo_estimado}min</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={formulario.activo ? 'default' : 'secondary'}>
                          {formulario.activo ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMostrarEstadisticas(formulario)}
                          title="Ver estadísticas"
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <BarChart3 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleEstado(formulario)}
                            title={formulario.activo ? 'Desactivar' : 'Activar'}
                          >
                            {formulario.activo ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVerPreguntas(formulario)}
                            title="Gestionar preguntas"
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDuplicar(formulario)}
                            title="Duplicar"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditar(formulario)}
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEliminar(formulario)}
                            title="Eliminar"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{formularios.length}</div>
            <p className="text-xs text-muted-foreground">Total formularios</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {formularios.filter(f => f.activo).length}
            </div>
            <p className="text-xs text-muted-foreground">Activos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">
              {formularios.filter(f => f.tiene_condicionales).length}
            </div>
            <p className="text-xs text-muted-foreground">Con condicionales</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(formularios.reduce((acc, f) => acc + (f.tiempo_estimado || 0), 0) / formularios.length) || 0}
            </div>
            <p className="text-xs text-muted-foreground">Tiempo promedio (min)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">
              {formulariosFiltrados.length}
            </div>
            <p className="text-xs text-muted-foreground">Filtrados</p>
          </CardContent>
        </Card>
      </div>

      {/* Modal de formulario */}
      {mostrarFormulario && (
        <FormularioIndustriaForm
          formulario={formularioEditando}
          onSave={handleGuardar}
          onCancel={() => {
            setMostrarFormulario(false);
            setFormularioEditando(null);
          }}
          mode={formularioEditando ? 'edit' : 'create'}
        />
      )}

      {/* Modal de confirmación */}
      <AlertDialog open={mostrarConfirmacion} onOpenChange={setMostrarConfirmacion}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar formulario?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el formulario "{formularioEliminar?.nombre}" 
              y todas las preguntas asociadas. Esta acción no se puede deshacer.
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

export default AdminFormulariosIndustria; 