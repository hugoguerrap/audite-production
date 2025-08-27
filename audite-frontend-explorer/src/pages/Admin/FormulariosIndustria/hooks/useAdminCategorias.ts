/**
 * Hook admin para gestión de categorías de industria
 * CRUD completo con validaciones y reordenamiento
 */

import { useState, useEffect, useCallback } from 'react';
import { CategoriaIndustria, CategoriaIndustriaCreate, CategoriaIndustriaUpdate } from '@/types/industria';
import { API } from '@/config/api';

interface UseAdminCategoriasReturn {
  categorias: CategoriaIndustria[];
  loading: boolean;
  error: string | null;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  fetchCategorias: () => Promise<void>;
  crearCategoria: (data: CategoriaIndustriaCreate) => Promise<CategoriaIndustria>;
  actualizarCategoria: (id: number, data: CategoriaIndustriaUpdate) => Promise<CategoriaIndustria>;
  eliminarCategoria: (id: number, forzar?: boolean) => Promise<void>;
  reordenarCategorias: (nuevoOrden: number[]) => Promise<void>;
  toggleEstadoCategoria: (id: number) => Promise<void>;
  duplicarCategoria: (id: number) => Promise<CategoriaIndustria>;
  exportarCategorias: () => Promise<void>;
  importarCategorias: (archivo: File) => Promise<void>;
  getCategoriaById: (id: number) => CategoriaIndustria | undefined;
  refreshAfterOperation: () => Promise<void>;
}

export const useAdminCategorias = (): UseAdminCategoriasReturn => {
  const [categorias, setCategorias] = useState<CategoriaIndustria[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener token admin (simplificado - en producción usar contexto auth)
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('adminToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }, []);

  // Función para cargar categorías
  const fetchCategorias = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(API.adminFormularios.categorias.list, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data: CategoriaIndustria[] = await response.json();
      
      // Ordenar por orden
      const categoriasOrdenadas = data.sort((a, b) => a.orden - b.orden);
      setCategorias(categoriasOrdenadas);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar categorías';
      setError(errorMessage);
      console.error('Error fetchCategorias:', err);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  // Función para crear categoría
  const crearCategoria = useCallback(async (data: CategoriaIndustriaCreate): Promise<CategoriaIndustria> => {
    try {
      setCreating(true);
      setError(null);

      const response = await fetch(API.adminFormularios.categorias.create, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const nuevaCategoria: CategoriaIndustria = await response.json();
      
      // Actualizar lista local
      setCategorias(prev => [...prev, nuevaCategoria].sort((a, b) => a.orden - b.orden));
      
      return nuevaCategoria;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear categoría';
      setError(errorMessage);
      console.error('Error crearCategoria:', err);
      throw err;
    } finally {
      setCreating(false);
    }
  }, [getAuthHeaders]);

  // Función para actualizar categoría
  const actualizarCategoria = useCallback(async (
    id: number, 
    data: CategoriaIndustriaUpdate
  ): Promise<CategoriaIndustria> => {
    try {
      setUpdating(true);
      setError(null);

      const response = await fetch(API.adminFormularios.categorias.update(id), {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const categoriaActualizada: CategoriaIndustria = await response.json();
      
      // Actualizar lista local
      setCategorias(prev => 
        prev.map(cat => cat.id === id ? categoriaActualizada : cat)
          .sort((a, b) => a.orden - b.orden)
      );
      
      return categoriaActualizada;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar categoría';
      setError(errorMessage);
      console.error('Error actualizarCategoria:', err);
      throw err;
    } finally {
      setUpdating(false);
    }
  }, [getAuthHeaders]);

  // Función para eliminar categoría
  const eliminarCategoria = useCallback(async (id: number, forzar = false) => {
    try {
      setDeleting(true);
      setError(null);

      const url = forzar 
        ? `${API.adminFormularios.categorias.delete(id)}?forzar_eliminacion=true`
        : API.adminFormularios.categorias.delete(id);

      const response = await fetch(url, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 400) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'La categoría tiene formularios asociados');
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      // Actualizar lista local
      setCategorias(prev => prev.filter(cat => cat.id !== id));

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar categoría';
      setError(errorMessage);
      console.error('Error eliminarCategoria:', err);
      throw err;
    } finally {
      setDeleting(false);
    }
  }, [getAuthHeaders]);

  // Función para reordenar categorías
  const reordenarCategorias = useCallback(async (nuevoOrden: number[]) => {
    try {
      setLoading(true);
      setError(null);

      // Actualizar orden en el servidor para cada categoría
      const promises = nuevoOrden.map((categoriaId, index) => {
        const categoria = categorias.find(c => c.id === categoriaId);
        if (categoria && categoria.orden !== index + 1) {
          return fetch(API.adminFormularios.categorias.update(categoriaId), {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ orden: index + 1 }),
          });
        }
        return Promise.resolve();
      });

      await Promise.all(promises);
      
      // Refrescar lista
      await fetchCategorias();

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al reordenar categorías';
      setError(errorMessage);
      console.error('Error reordenarCategorias:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [categorias, getAuthHeaders, fetchCategorias]);

  // Función para activar/desactivar categoría
  const toggleEstadoCategoria = useCallback(async (id: number) => {
    const categoria = categorias.find(c => c.id === id);
    if (!categoria) return;

    await actualizarCategoria(id, { activa: !categoria.activa });
  }, [categorias, actualizarCategoria]);

  // Función para duplicar categoría
  const duplicarCategoria = useCallback(async (id: number): Promise<CategoriaIndustria> => {
    const categoriaOriginal = categorias.find(c => c.id === id);
    if (!categoriaOriginal) {
      throw new Error('Categoría no encontrada');
    }

    const dataDuplicada: CategoriaIndustriaCreate = {
      nombre: `${categoriaOriginal.nombre} (Copia)`,
      descripcion: categoriaOriginal.descripcion,
      icono: categoriaOriginal.icono,
      color: categoriaOriginal.color,
      activa: false, // Crear como inactiva por defecto
      orden: Math.max(...categorias.map(c => c.orden)) + 1 // Al final
    };

    return await crearCategoria(dataDuplicada);
  }, [categorias, crearCategoria]);

  // Función para exportar categorías
  const exportarCategorias = useCallback(async () => {
    try {
      const dataExport = categorias.map(categoria => ({
        nombre: categoria.nombre,
        descripcion: categoria.descripcion,
        icono: categoria.icono,
        color: categoria.color,
        activa: categoria.activa,
        orden: categoria.orden
      }));

      const blob = new Blob([JSON.stringify(dataExport, null, 2)], {
        type: 'application/json'
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `categorias_industria_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al exportar categorías';
      setError(errorMessage);
      console.error('Error exportarCategorias:', err);
      throw err;
    }
  }, [categorias]);

  // Función para importar categorías
  const importarCategorias = useCallback(async (archivo: File) => {
    try {
      setLoading(true);
      setError(null);

      const texto = await archivo.text();
      const categoriasImportadas: CategoriaIndustriaCreate[] = JSON.parse(texto);

      // Validar estructura básica
      if (!Array.isArray(categoriasImportadas)) {
        throw new Error('El archivo debe contener un array de categorías');
      }

      // Crear categorías una por una
      const promesasCreacion = categoriasImportadas.map(categoria => {
        // Validar campos requeridos
        if (!categoria.nombre) {
          throw new Error('Todas las categorías deben tener nombre');
        }
        return crearCategoria(categoria);
      });

      await Promise.all(promesasCreacion);
      
      // Refrescar lista
      await fetchCategorias();

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al importar categorías';
      setError(errorMessage);
      console.error('Error importarCategorias:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [crearCategoria, fetchCategorias]);

  // Función para obtener categoría por ID
  const getCategoriaById = useCallback((id: number): CategoriaIndustria | undefined => {
    return categorias.find(categoria => categoria.id === id);
  }, [categorias]);

  // Función para refrescar después de operaciones
  const refreshAfterOperation = useCallback(async () => {
    await fetchCategorias();
  }, [fetchCategorias]);

  // Cargar categorías al inicializar
  useEffect(() => {
    fetchCategorias();
  }, [fetchCategorias]);

  // Log para debugging en desarrollo
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('useAdminCategorias State:', {
        totalCategorias: categorias.length,
        loading,
        creating,
        updating,
        deleting,
        hasError: !!error
      });
    }
  }, [categorias.length, loading, creating, updating, deleting, error]);

  return {
    categorias,
    loading,
    error,
    creating,
    updating,
    deleting,
    fetchCategorias,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria,
    reordenarCategorias,
    toggleEstadoCategoria,
    duplicarCategoria,
    exportarCategorias,
    importarCategorias,
    getCategoriaById,
    refreshAfterOperation
  };
}; 