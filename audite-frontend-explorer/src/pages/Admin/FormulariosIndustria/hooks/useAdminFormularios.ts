/**
 * Hook admin para gestión de formularios por industria
 * CRUD completo con filtros por categoría y duplicación
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  FormularioIndustria, 
  FormularioIndustriaCreate, 
  FormularioIndustriaUpdate,
  CategoriaIndustria 
} from '@/types/industria';
import { API } from '@/config/api';

interface UseAdminFormulariosReturn {
  formularios: FormularioIndustria[];
  formulariosFiltrados: FormularioIndustria[];
  categorias: CategoriaIndustria[];
  loading: boolean;
  error: string | null;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  duplicating: boolean;
  categoriaFiltro: number | null;
  fetchFormularios: (categoriaId?: number) => Promise<void>;
  fetchAllFormularios: () => Promise<void>;
  crearFormulario: (data: FormularioIndustriaCreate) => Promise<FormularioIndustria>;
  actualizarFormulario: (id: number, data: FormularioIndustriaUpdate) => Promise<FormularioIndustria>;
  eliminarFormulario: (id: number, forzar?: boolean) => Promise<void>;
  duplicarFormulario: (id: number, nuevoNombre?: string) => Promise<FormularioIndustria>;
  toggleEstadoFormulario: (id: number) => Promise<void>;
  filtrarPorCategoria: (categoriaId: number | null) => void;
  getFormularioById: (id: number) => FormularioIndustria | undefined;
  getFormulariosPorCategoria: (categoriaId: number) => FormularioIndustria[];
  refreshAfterOperation: () => Promise<void>;
}

export const useAdminFormularios = (): UseAdminFormulariosReturn => {
  const [formularios, setFormularios] = useState<FormularioIndustria[]>([]);
  const [categorias, setCategorias] = useState<CategoriaIndustria[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categoriaFiltro, setCategoriaFiltro] = useState<number | null>(null);

  // Función para obtener headers de autenticación
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('adminToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }, []);

  // Formularios filtrados por categoría
  const formulariosFiltrados = categoriaFiltro 
    ? formularios.filter(form => form.categoria_id === categoriaFiltro)
    : formularios;

  // Función para cargar formularios (todos o por categoría)
  const fetchFormularios = useCallback(async (categoriaId?: number) => {
    try {
      setLoading(true);
      setError(null);

      const url = categoriaId 
        ? API.adminFormularios.formularios.byCategoria(categoriaId)
        : API.adminFormularios.formularios.list;

      const response = await fetch(url, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data: FormularioIndustria[] = await response.json();
      
      // Ordenar por orden y categoría
      const formulariosOrdenados = data.sort((a, b) => {
        if (a.categoria_id !== b.categoria_id) {
          return a.categoria_id - b.categoria_id;
        }
        return a.orden - b.orden;
      });

      if (categoriaId) {
        // Si se especificó categoría, reemplazar solo esos formularios
        setFormularios(prev => {
          const otrosFormularios = prev.filter(f => f.categoria_id !== categoriaId);
          return [...otrosFormularios, ...formulariosOrdenados].sort((a, b) => {
            if (a.categoria_id !== b.categoria_id) {
              return a.categoria_id - b.categoria_id;
            }
            return a.orden - b.orden;
          });
        });
      } else {
        setFormularios(formulariosOrdenados);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar formularios';
      setError(errorMessage);
      console.error('Error fetchFormularios:', err);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  // Función para cargar todos los formularios
  const fetchAllFormularios = useCallback(async () => {
    await fetchFormularios();
  }, [fetchFormularios]);

  // Función para cargar categorías
  const fetchCategorias = useCallback(async () => {
    try {
      const response = await fetch(API.adminFormularios.categorias.list, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data: CategoriaIndustria[] = await response.json();
        setCategorias(data.sort((a, b) => a.orden - b.orden));
      }
    } catch (err) {
      console.error('Error fetchCategorias:', err);
    }
  }, [getAuthHeaders]);

  // Función para crear formulario
  const crearFormulario = useCallback(async (data: FormularioIndustriaCreate): Promise<FormularioIndustria> => {
    try {
      setCreating(true);
      setError(null);

      const response = await fetch(API.adminFormularios.formularios.create, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const nuevoFormulario: FormularioIndustria = await response.json();
      
      // Actualizar lista local
      setFormularios(prev => [...prev, nuevoFormulario].sort((a, b) => {
        if (a.categoria_id !== b.categoria_id) {
          return a.categoria_id - b.categoria_id;
        }
        return a.orden - b.orden;
      }));
      
      return nuevoFormulario;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear formulario';
      setError(errorMessage);
      console.error('Error crearFormulario:', err);
      throw err;
    } finally {
      setCreating(false);
    }
  }, [getAuthHeaders]);

  // Función para actualizar formulario
  const actualizarFormulario = useCallback(async (
    id: number, 
    data: FormularioIndustriaUpdate
  ): Promise<FormularioIndustria> => {
    try {
      setUpdating(true);
      setError(null);

      const response = await fetch(API.adminFormularios.formularios.update(id), {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const formularioActualizado: FormularioIndustria = await response.json();
      
      // Actualizar lista local
      setFormularios(prev => 
        prev.map(form => form.id === id ? formularioActualizado : form)
          .sort((a, b) => {
            if (a.categoria_id !== b.categoria_id) {
              return a.categoria_id - b.categoria_id;
            }
            return a.orden - b.orden;
          })
      );
      
      return formularioActualizado;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar formulario';
      setError(errorMessage);
      console.error('Error actualizarFormulario:', err);
      throw err;
    } finally {
      setUpdating(false);
    }
  }, [getAuthHeaders]);

  // Función para eliminar formulario
  const eliminarFormulario = useCallback(async (id: number, forzar = false) => {
    try {
      setDeleting(true);
      setError(null);

      const url = forzar 
        ? `${API.adminFormularios.formularios.delete(id)}?forzar_eliminacion=true`
        : API.adminFormularios.formularios.delete(id);

      const response = await fetch(url, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 400) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'El formulario tiene preguntas o respuestas asociadas');
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      // Actualizar lista local
      setFormularios(prev => prev.filter(form => form.id !== id));

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar formulario';
      setError(errorMessage);
      console.error('Error eliminarFormulario:', err);
      throw err;
    } finally {
      setDeleting(false);
    }
  }, [getAuthHeaders]);

  // Función para duplicar formulario
  const duplicarFormulario = useCallback(async (
    id: number, 
    nuevoNombre?: string
  ): Promise<FormularioIndustria> => {
    try {
      setDuplicating(true);
      setError(null);

      const formularioOriginal = formularios.find(f => f.id === id);
      if (!formularioOriginal) {
        throw new Error('Formulario no encontrado');
      }

      const dataDuplicada: FormularioIndustriaCreate = {
        categoria_id: formularioOriginal.categoria_id,
        nombre: nuevoNombre || `${formularioOriginal.nombre} (Copia)`,
        descripcion: formularioOriginal.descripcion,
        activo: false, // Crear como inactivo por defecto
        orden: Math.max(
          ...formularios
            .filter(f => f.categoria_id === formularioOriginal.categoria_id)
            .map(f => f.orden)
        ) + 1,
        tiempo_estimado: formularioOriginal.tiempo_estimado
      };

      const nuevoFormulario = await crearFormulario(dataDuplicada);

      // TODO: En el futuro, también duplicar preguntas asociadas
      // mediante endpoint específico /api/admin/formularios/{id}/duplicar

      return nuevoFormulario;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al duplicar formulario';
      setError(errorMessage);
      console.error('Error duplicarFormulario:', err);
      throw err;
    } finally {
      setDuplicating(false);
    }
  }, [formularios, crearFormulario]);

  // Función para activar/desactivar formulario
  const toggleEstadoFormulario = useCallback(async (id: number) => {
    const formulario = formularios.find(f => f.id === id);
    if (!formulario) return;

    await actualizarFormulario(id, { activo: !formulario.activo });
  }, [formularios, actualizarFormulario]);

  // Función para filtrar por categoría
  const filtrarPorCategoria = useCallback((categoriaId: number | null) => {
    setCategoriaFiltro(categoriaId);
  }, []);

  // Función para obtener formulario por ID
  const getFormularioById = useCallback((id: number): FormularioIndustria | undefined => {
    return formularios.find(formulario => formulario.id === id);
  }, [formularios]);

  // Función para obtener formularios por categoría
  const getFormulariosPorCategoria = useCallback((categoriaId: number): FormularioIndustria[] => {
    return formularios.filter(formulario => formulario.categoria_id === categoriaId);
  }, [formularios]);

  // Función para refrescar después de operaciones
  const refreshAfterOperation = useCallback(async () => {
    await fetchAllFormularios();
  }, [fetchAllFormularios]);

  // Cargar datos al inicializar
  useEffect(() => {
    fetchAllFormularios();
    fetchCategorias();
  }, [fetchAllFormularios, fetchCategorias]);

  // Log para debugging en desarrollo
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('useAdminFormularios State:', {
        totalFormularios: formularios.length,
        formulariosFiltrados: formulariosFiltrados.length,
        categoriaFiltro,
        loading,
        creating,
        updating,
        deleting,
        duplicating,
        hasError: !!error
      });
    }
  }, [formularios.length, formulariosFiltrados.length, categoriaFiltro, loading, creating, updating, deleting, duplicating, error]);

  return {
    formularios,
    formulariosFiltrados,
    categorias,
    loading,
    error,
    creating,
    updating,
    deleting,
    duplicating,
    categoriaFiltro,
    fetchFormularios,
    fetchAllFormularios,
    crearFormulario,
    actualizarFormulario,
    eliminarFormulario,
    duplicarFormulario,
    toggleEstadoFormulario,
    filtrarPorCategoria,
    getFormularioById,
    getFormulariosPorCategoria,
    refreshAfterOperation
  };
}; 