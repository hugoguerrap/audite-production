/**
 * Página de administración de categorías de industria
 * Gestión completa con CRUD, drag-and-drop, búsqueda y filtros
 */

import React, { useState, useEffect } from 'react';
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
  GripVertical,
  Eye,
  EyeOff,
  Building2,
  SortAsc,
  MoreHorizontal,
  Copy,
  Download,
  Upload
} from 'lucide-react';
import { CategoriaIndustria } from '@/types/industria';
import { useAdminCategorias } from './hooks/useAdminCategorias';
import CategoriaIndustriaForm from './components/CategoriaIndustriaForm';

type VistaTabla = 'tabla' | 'grid';
type FiltroEstado = 'todos' | 'activas' | 'inactivas';
type OrdenCampo = 'nombre' | 'descripcion' | 'orden' | 'created_at';
type OrdenDireccion = 'asc' | 'desc';

const AdminCategoriasIndustria: React.FC = () => {
  // Estados locales
  const [vistaActual, setVistaActual] = useState<VistaTabla>('tabla');
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('todos');
  const [ordenCampo, setOrdenCampo] = useState<OrdenCampo>('orden');
  const [ordenDireccion, setOrdenDireccion] = useState<OrdenDireccion>('asc');
  
  // Estados para modales y formularios
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState<CategoriaIndustria | null>(null);
  const [categoriaEliminar, setCategoriaEliminar] = useState<CategoriaIndustria | null>(null);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  // Estados para drag and drop
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [dragOverItem, setDragOverItem] = useState<number | null>(null);

  // Hook principal
  const {
    categorias,
    loading,
    error,
    fetchCategorias,
    createCategoria,
    updateCategoria,
    deleteCategoria,
    toggleEstadoCategoria,
    reorderCategorias,
    duplicateCategoria,
    exportCategorias,
    importCategorias
  } = useAdminCategorias();

  // Efecto para cargar categorías al montar
  useEffect(() => {
    fetchCategorias();
  }, [fetchCategorias]);

  // Función para filtrar y ordenar categorías
  const categoriasFiltradas = categorias
    .filter(categoria => {
      // Filtro por búsqueda
      const coincideBusqueda = busqueda === '' || 
        categoria.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        categoria.descripcion?.toLowerCase().includes(busqueda.toLowerCase());

      // Filtro por estado
      const coincideEstado = filtroEstado === 'todos' ||
        (filtroEstado === 'activas' && categoria.activa) ||
        (filtroEstado === 'inactivas' && !categoria.activa);

      return coincideBusqueda && coincideEstado;
    })
    .sort((a, b) => {
      let valorA: any, valorB: any;
      
      switch (ordenCampo) {
        case 'nombre':
          valorA = a.nombre.toLowerCase();
          valorB = b.nombre.toLowerCase();
          break;
        case 'descripcion':
          valorA = a.descripcion?.toLowerCase() || '';
          valorB = b.descripcion?.toLowerCase() || '';
          break;
        case 'orden':
          valorA = a.orden || 0;
          valorB = b.orden || 0;
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

  // Función para manejar creación
  const handleCrear = () => {
    setCategoriaEditando(null);
    setMostrarFormulario(true);
  };

  // Función para manejar edición
  const handleEditar = (categoria: CategoriaIndustria) => {
    setCategoriaEditando(categoria);
    setMostrarFormulario(true);
  };

  // Función para manejar eliminación
  const handleEliminar = (categoria: CategoriaIndustria) => {
    setCategoriaEliminar(categoria);
    setMostrarConfirmacion(true);
  };

  // Función para confirmar eliminación
  const confirmarEliminacion = async () => {
    if (categoriaEliminar) {
      await deleteCategoria(categoriaEliminar.id);
      setCategoriaEliminar(null);
      setMostrarConfirmacion(false);
    }
  };

  // Función para guardar categoría
  const handleGuardar = async (categoria: Partial<CategoriaIndustria>) => {
    try {
      if (categoriaEditando) {
        await updateCategoria(categoriaEditando.id, categoria);
      } else {
        await createCategoria(categoria);
      }
      setMostrarFormulario(false);
      setCategoriaEditando(null);
    } catch (error) {
      console.error('Error guardando categoría:', error);
    }
  };

  // Función para toggle estado
  const handleToggleEstado = async (categoria: CategoriaIndustria) => {
    await toggleEstadoCategoria(categoria.id, !categoria.activa);
  };

  // Función para duplicar
  const handleDuplicar = async (categoria: CategoriaIndustria) => {
    await duplicateCategoria(categoria.id);
  };

  // Funciones para drag and drop
  const handleDragStart = (e: React.DragEvent<HTMLTableRowElement>, categoriaId: number) => {
    setDraggedItem(categoriaId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLTableRowElement>, categoriaId: number) => {
    e.preventDefault();
    setDragOverItem(categoriaId);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleDrop = async (e: React.DragEvent<HTMLTableRowElement>, targetId: number) => {
    e.preventDefault();
    
    if (draggedItem && draggedItem !== targetId) {
      const draggedIndex = categoriasFiltradas.findIndex(c => c.id === draggedItem);
      const targetIndex = categoriasFiltradas.findIndex(c => c.id === targetId);
      
      if (draggedIndex !== -1 && targetIndex !== -1) {
        const newOrder = [...categoriasFiltradas];
        const [removed] = newOrder.splice(draggedIndex, 1);
        newOrder.splice(targetIndex, 0, removed);
        
        // Actualizar orden en backend
        const ordenIds = newOrder.map((c, index) => ({ id: c.id, orden: index + 1 }));
        await reorderCategorias(ordenIds);
      }
    }
    
    handleDragEnd();
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
    try {
      const data = await exportCategorias();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `categorias-industria-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exportando categorías:', error);
    }
  };

  // Función para importar
  const handleImportar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        await importCategorias(data);
        event.target.value = ''; // Reset input
      } catch (error) {
        console.error('Error importando categorías:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Building2 className="h-6 w-6" />
                Gestión de Categorías de Industria
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                Administra las categorías disponibles para diagnósticos especializados
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleCrear} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nueva Categoría
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Controles y filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Búsqueda */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar categorías..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtros */}
            <div className="flex items-center gap-2">
              <Select value={filtroEstado} onValueChange={(value: FiltroEstado) => setFiltroEstado(value)}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas</SelectItem>
                  <SelectItem value="activas">Activas</SelectItem>
                  <SelectItem value="inactivas">Inactivas</SelectItem>
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

      {/* Tabla de categorías */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Cargando categorías...</p>
            </div>
          ) : categoriasFiltradas.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay categorías</h3>
              <p className="text-muted-foreground mb-4">
                {busqueda || filtroEstado !== 'todos' 
                  ? 'No se encontraron categorías con los filtros aplicados'
                  : 'Comienza creando tu primera categoría de industria'
                }
              </p>
              {!busqueda && filtroEstado === 'todos' && (
                <Button onClick={handleCrear}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primera Categoría
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <GripVertical className="h-4 w-4" />
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:text-primary"
                    onClick={() => handleCambiarOrden('nombre')}
                  >
                    <div className="flex items-center gap-1">
                      Nombre
                      {ordenCampo === 'nombre' && (
                        <SortAsc className={`h-3 w-3 ${ordenDireccion === 'desc' ? 'rotate-180' : ''}`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Icono</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:text-primary"
                    onClick={() => handleCambiarOrden('orden')}
                  >
                    <div className="flex items-center gap-1">
                      Orden
                      {ordenCampo === 'orden' && (
                        <SortAsc className={`h-3 w-3 ${ordenDireccion === 'desc' ? 'rotate-180' : ''}`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoriasFiltradas.map((categoria) => (
                  <TableRow
                    key={categoria.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, categoria.id)}
                    onDragOver={(e) => handleDragOver(e, categoria.id)}
                    onDrop={(e) => handleDrop(e, categoria.id)}
                    onDragEnd={handleDragEnd}
                    className={`
                      ${draggedItem === categoria.id ? 'opacity-50' : ''}
                      ${dragOverItem === categoria.id ? 'border-t-2 border-t-primary' : ''}
                      hover:bg-muted/50 transition-colors
                    `}
                  >
                    <TableCell>
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div>
                        <span>{categoria.nombre}</span>
                        {categoria.color && (
                          <div 
                            className="w-3 h-3 rounded-full inline-block ml-2"
                            style={{ backgroundColor: categoria.color }}
                          />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <span className="text-sm text-muted-foreground truncate">
                        {categoria.descripcion || '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xl">{categoria.icono || '🏭'}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{categoria.orden || 0}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={categoria.activa ? 'default' : 'secondary'}>
                        {categoria.activa ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleEstado(categoria)}
                          title={categoria.activa ? 'Desactivar' : 'Activar'}
                        >
                          {categoria.activa ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDuplicar(categoria)}
                          title="Duplicar"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditar(categoria)}
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEliminar(categoria)}
                          title="Eliminar"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{categorias.length}</div>
            <p className="text-xs text-muted-foreground">Total categorías</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {categorias.filter(c => c.activa).length}
            </div>
            <p className="text-xs text-muted-foreground">Activas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-600">
              {categorias.filter(c => !c.activa).length}
            </div>
            <p className="text-xs text-muted-foreground">Inactivas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {categoriasFiltradas.length}
            </div>
            <p className="text-xs text-muted-foreground">Filtradas</p>
          </CardContent>
        </Card>
      </div>

      {/* Modal de formulario */}
      {mostrarFormulario && (
        <CategoriaIndustriaForm
          categoria={categoriaEditando}
          onSave={handleGuardar}
          onCancel={() => {
            setMostrarFormulario(false);
            setCategoriaEditando(null);
          }}
          mode={categoriaEditando ? 'edit' : 'create'}
        />
      )}

      {/* Modal de confirmación */}
      <AlertDialog open={mostrarConfirmacion} onOpenChange={setMostrarConfirmacion}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la categoría "{categoriaEliminar?.nombre}" 
              y todos los formularios asociados. Esta acción no se puede deshacer.
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

export default AdminCategoriasIndustria; 