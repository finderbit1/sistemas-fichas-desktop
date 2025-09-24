import React, { Suspense, lazy, useState, useEffect, useRef, memo } from 'react';
import LoadingSpinner from './LoadingSpinner';

/**
 * Componente de loading personalizado para Suspense
 */
const SuspenseFallback = memo(({ message = 'Carregando...', size = 'medium' }) => (
  <div style={{ 
    display: 'flex', 
    flexDirection: 'column',
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '200px',
    gap: '12px'
  }}>
    <LoadingSpinner size={size} />
    <span style={{ color: '#666', fontSize: '14px' }}>{message}</span>
  </div>
));

SuspenseFallback.displayName = 'SuspenseFallback';

/**
 * Hook para lazy loading com intersection observer
 */
export const useLazyLoad = (options = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    triggerOnce = true
  } = options;

  const [isVisible, setIsVisible] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            setHasTriggered(true);
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, triggerOnce]);

  return {
    elementRef,
    isVisible: triggerOnce ? (hasTriggered || isVisible) : isVisible,
    hasTriggered
  };
};

/**
 * Componente wrapper para lazy loading de componentes
 */
export const LazyWrapper = memo(({ 
  children, 
  fallback = null,
  fallbackMessage = 'Carregando componente...',
  threshold = 0.1,
  rootMargin = '50px',
  minHeight = '200px',
  className = '',
  style = {}
}) => {
  const { elementRef, isVisible } = useLazyLoad({ threshold, rootMargin });

  return (
    <div
      ref={elementRef}
      className={`lazy-wrapper ${className}`}
      style={{
        minHeight,
        ...style
      }}
    >
      {isVisible ? (
        <Suspense fallback={fallback || <SuspenseFallback message={fallbackMessage} />}>
          {children}
        </Suspense>
      ) : (
        fallback || <SuspenseFallback message={fallbackMessage} />
      )}
    </div>
  );
});

LazyWrapper.displayName = 'LazyWrapper';

/**
 * Componente para lazy loading de imagens
 */
export const LazyImage = memo(({ 
  src, 
  alt, 
  placeholder = null,
  className = '',
  style = {},
  onLoad = () => {},
  onError = () => {},
  ...props 
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { elementRef, isVisible } = useLazyLoad();

  useEffect(() => {
    if (isVisible && src) {
      const img = new Image();
      img.onload = () => {
        setImageLoaded(true);
        onLoad();
      };
      img.onerror = () => {
        setImageError(true);
        onError();
      };
      img.src = src;
    }
  }, [isVisible, src, onLoad, onError]);

  return (
    <div
      ref={elementRef}
      className={`lazy-image ${className}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        ...style
      }}
      {...props}
    >
      {imageLoaded && !imageError ? (
        <img
          src={src}
          alt={alt}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      ) : imageError ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          backgroundColor: '#f5f5f5',
          color: '#999'
        }}>
          Erro ao carregar imagem
        </div>
      ) : (
        placeholder || (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            backgroundColor: '#f5f5f5'
          }}>
            <LoadingSpinner size="small" />
          </div>
        )
      )}
    </div>
  );
});

LazyImage.displayName = 'LazyImage';

/**
 * Hook para criar componentes lazy com retry automático
 */
export const useLazyComponent = (importFunction, options = {}) => {
  const {
    retryCount = 3,
    retryDelay = 1000,
    fallback = null
  } = options;

  const [Component, setComponent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const retryCountRef = useRef(0);

  const loadComponent = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const module = await importFunction();
      const component = module.default || module;
      
      setComponent(() => component);
      retryCountRef.current = 0;
    } catch (err) {
      setError(err);
      
      if (retryCountRef.current < retryCount) {
        retryCountRef.current++;
        setTimeout(() => {
          loadComponent();
        }, retryDelay * retryCountRef.current);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComponent();
  }, []);

  const LazyComponent = useMemo(() => {
    if (loading) {
      return fallback || <SuspenseFallback message="Carregando componente..." />;
    }
    
    if (error) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          color: '#e74c3c'
        }}>
          <p>Erro ao carregar componente</p>
          <button 
            onClick={loadComponent}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Tentar novamente
          </button>
        </div>
      );
    }
    
    if (Component) {
      return <Component />;
    }
    
    return null;
  }, [loading, error, Component, fallback]);

  return {
    Component: LazyComponent,
    loading,
    error,
    retry: loadComponent
  };
};

/**
 * Componente para lazy loading de listas grandes
 */
export const LazyList = memo(({ 
  items = [],
  renderItem,
  itemHeight = 50,
  containerHeight = 400,
  overscan = 5,
  className = '',
  style = {},
  ...props 
}) => {
  const [visibleItems, setVisibleItems] = useState([]);
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    setVisibleItems(items.slice(startIndex, endIndex + 1));
  }, [items, scrollTop, itemHeight, containerHeight, overscan]);

  const handleScroll = (e) => {
    setScrollTop(e.target.scrollTop);
  };

  const totalHeight = items.length * itemHeight;
  const offsetY = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan) * itemHeight;

  return (
    <div
      ref={containerRef}
      className={`lazy-list ${className}`}
      style={{
        height: containerHeight,
        overflow: 'auto',
        position: 'relative',
        ...style
      }}
      onScroll={handleScroll}
      {...props}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={index}
              style={{
                height: itemHeight,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

LazyList.displayName = 'LazyList';

/**
 * Componente para lazy loading de modais
 */
export const LazyModal = memo(({ 
  isOpen, 
  onClose, 
  children, 
  fallback = null,
  fallbackMessage = 'Carregando modal...',
  className = '',
  style = {},
  ...props 
}) => {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
    } else {
      // Delay para permitir animação de saída
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <div
      className={`modal-overlay ${className}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        ...style
      }}
      onClick={onClose}
      {...props}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '20px',
          maxWidth: '90vw',
          maxHeight: '90vh',
          overflow: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Suspense fallback={fallback || <SuspenseFallback message={fallbackMessage} />}>
          {children}
        </Suspense>
      </div>
    </div>
  );
});

LazyModal.displayName = 'LazyModal';

export default LazyWrapper;
