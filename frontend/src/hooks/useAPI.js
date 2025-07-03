import { useState, useCallback, useRef, useEffect } from 'react';
import api from '../services/api.js';

export const useAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  // Отмена запроса при размонтировании компонента
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Универсальная функция для выполнения запросов
  const request = useCallback(async (apiCall, options = {}) => {
    const {
      showLoading = true,
      showError = true,
      onSuccess,
      onError,
      timeout = 30000
    } = options;

    // Отменяем предыдущий запрос если он существует
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Создаем новый AbortController
    abortControllerRef.current = new AbortController();

    if (showLoading) setLoading(true);
    if (showError) setError(null);

    try {
      // Таймаут для запроса
      const timeoutId = setTimeout(() => {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
      }, timeout);

      const result = await apiCall({
        signal: abortControllerRef.current.signal
      });

      clearTimeout(timeoutId);

      if (onSuccess) {
        onSuccess(result);
      }

      return { success: true, data: result };
    } catch (err) {
      if (err.name === 'AbortError') {
        return { success: false, cancelled: true };
      }

      const errorMessage = err.response?.data?.message || err.message || 'Request failed';

      if (showError) {
        setError(errorMessage);
      }

      if (onError) {
        onError(err, errorMessage);
      }

      return { success: false, error: errorMessage, originalError: err };
    } finally {
      if (showLoading) setLoading(false);
      abortControllerRef.current = null;
    }
  }, []);

  // Отмена текущего запроса
  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Очистка ошибки
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    request,
    cancelRequest,
    clearError
  };
};

// Специализированные хуки для разных типов запросов

// Хук для получения данных с кешированием
export const useFetch = (url, options = {}) => {
  const [data, setData] = useState(null);
  const { request, loading, error } = useAPI();
  const cacheRef = useRef(new Map());

  const fetchData = useCallback(async (forceRefresh = false) => {
    const cacheKey = url + JSON.stringify(options);

    // Проверяем кеш
    if (!forceRefresh && cacheRef.current.has(cacheKey)) {
      const cached = cacheRef.current.get(cacheKey);
      const isExpired = Date.now() - cached.timestamp > (options.cacheTime || 300000); // 5 минут по умолчанию

      if (!isExpired) {
        setData(cached.data);
        return { success: true, data: cached.data, fromCache: true };
      }
    }

    const result = await request(() => api.get(url, options));

    if (result.success) {
      setData(result.data);
      // Сохраняем в кеш
      cacheRef.current.set(cacheKey, {
        data: result.data,
        timestamp: Date.now()
      });
    }

    return result;
  }, [url, options, request]);

  // Автоматическая загрузка при изменении URL
  useEffect(() => {
    if (url && options.autoFetch !== false) {
      fetchData();
    }
  }, [url, fetchData, options.autoFetch]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    clearCache: () => cacheRef.current.clear()
  };
};

// Хук для мутаций (POST, PUT, DELETE)
export const useMutation = (mutationFn, options = {}) => {
  const { request, loading, error } = useAPI();
  const [data, setData] = useState(null);

  const mutate = useCallback(async (variables) => {
    const result = await request(
      () => mutationFn(variables),
      {
        onSuccess: (data) => {
          setData(data);
          if (options.onSuccess) {
            options.onSuccess(data, variables);
          }
        },
        onError: (err, errorMessage) => {
          if (options.onError) {
            options.onError(err, errorMessage);
          }
        },
        ...options
      }
    );

    return result;
  }, [request, mutationFn, options]);

  const reset = useCallback(() => {
    setData(null);
  }, []);

  return {
    mutate,
    data,
    loading,
    error,
    reset
  };
};

// Хук для пагинации
export const usePagination = (fetchFn, options = {}) => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: options.limit || 20,
    total: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const { request, loading, error } = useAPI();

  const fetchPage = useCallback(async (page = 1, append = false) => {
    const result = await request(
      () => fetchFn({
        page,
        limit: pagination.limit,
        ...options.params
      })
    );

    if (result.success) {
      const { items, total, hasNextPage, hasPrevPage } = result.data;

      setData(prev => append ? [...prev, ...items] : items);
      setPagination({
        page,
        limit: pagination.limit,
        total,
        hasNextPage,
        hasPrevPage
      });
    }

    return result;
  }, [request, fetchFn, pagination.limit, options.params]);

  const nextPage = useCallback(() => {
    if (pagination.hasNextPage) {
      fetchPage(pagination.page + 1, options.infinite);
    }
  }, [fetchPage, pagination.hasNextPage, pagination.page, options.infinite]);

  const prevPage = useCallback(() => {
    if (pagination.hasPrevPage) {
      fetchPage(pagination.page - 1);
    }
  }, [fetchPage, pagination.hasPrevPage, pagination.page]);

  const reset = useCallback(() => {
    setData([]);
    setPagination({
      page: 1,
      limit: options.limit || 20,
      total: 0,
      hasNextPage: false,
      hasPrevPage: false
    });
  }, [options.limit]);

  return {
    data,
    pagination,
    loading,
    error,
    fetchPage,
    nextPage,
    prevPage,
    reset
  };
};
