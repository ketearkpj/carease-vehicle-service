// ===== src/Hooks/useFetch.js =====
import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useFetch Hook - GOD MODE
 * Advanced data fetching with caching, retry, and abort control
 * 
 * @param {string} url - API endpoint
 * @param {Object} options - Fetch options
 * @param {boolean} immediate - Fetch immediately on mount
 * @param {Function} onSuccess - Success callback
 * @param {Function} onError - Error callback
 * @param {number} retries - Number of retry attempts
 * @param {number} retryDelay - Delay between retries (ms)
 * @param {boolean} cache - Enable caching
 * @param {number} cacheTime - Cache duration (ms)
 * @returns {Object} - Fetch state and methods
 */
const useFetch = ({
  url,
  options = {},
  immediate = true,
  onSuccess,
  onError,
  retries = 3,
  retryDelay = 1000,
  cache = true,
  cacheTime = 5 * 60 * 1000 // 5 minutes
}) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusCode, setStatusCode] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const abortControllerRef = useRef(null);
  const cacheRef = useRef(new Map());
  const mountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Cache management
  const getCachedData = useCallback((key) => {
    if (!cache) return null;
    
    const cached = cacheRef.current.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > cacheTime) {
      cacheRef.current.delete(key);
      return null;
    }
    
    return cached.data;
  }, [cache, cacheTime]);

  const setCachedData = useCallback((key, data) => {
    if (!cache) return;
    cacheRef.current.set(key, {
      data,
      timestamp: Date.now()
    });
  }, [cache]);

  // Clear cache
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  // Invalidate specific cache entry
  const invalidateCache = useCallback((key) => {
    cacheRef.current.delete(key);
  }, []);

  // Main fetch function
  const fetchData = useCallback(async (fetchUrl = url, fetchOptions = options) => {
    if (!fetchUrl) return;

    // Check cache
    const cacheKey = `${fetchUrl}-${JSON.stringify(fetchOptions)}`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      setData(cachedData);
      setLoading(false);
      onSuccess?.(cachedData);
      return;
    }

    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    setLoading(true);
    setError(null);
    
    const attemptFetch = async (attempt) => {
      try {
        const response = await fetch(fetchUrl, {
          ...fetchOptions,
          signal: abortControllerRef.current?.signal,
          headers: {
            'Content-Type': 'application/json',
            ...fetchOptions.headers,
          },
        });

        setStatusCode(response.status);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (mountedRef.current) {
          setData(result);
          setError(null);
          setRetryCount(0);
          
          // Cache the result
          setCachedData(cacheKey, result);
          
          onSuccess?.(result);
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          return; // Ignore abort errors
        }

        if (mountedRef.current) {
          if (attempt < retries - 1) {
            // Retry with exponential backoff
            setTimeout(() => {
              if (mountedRef.current) {
                setRetryCount(attempt + 1);
                attemptFetch(attempt + 1);
              }
            }, retryDelay * Math.pow(2, attempt));
          } else {
            setError(err.message);
            onError?.(err);
          }
        }
      } finally {
        if (mountedRef.current && attempt === retries - 1) {
          setLoading(false);
        }
      }
    };

    attemptFetch(0);
  }, [url, options, retries, retryDelay, getCachedData, setCachedData, onSuccess, onError]);

  // Refetch with new options
  const refetch = useCallback((newOptions = {}) => {
    const mergedOptions = { ...options, ...newOptions };
    fetchData(url, mergedOptions);
  }, [fetchData, url, options]);

  // Abort current request
  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Reset state
  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
    setStatusCode(null);
    setRetryCount(0);
  }, []);

  // Fetch on mount if immediate
  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [immediate, fetchData]);

  return {
    data,
    error,
    loading,
    statusCode,
    retryCount,
    refetch,
    abort,
    reset,
    clearCache,
    invalidateCache
  };
};

export default useFetch;