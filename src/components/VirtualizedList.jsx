import React, { useState, useEffect, useRef, useMemo, memo } from 'react';

/**
 * Componente de lista virtualizada para melhorar performance com grandes quantidades de dados
 */
const VirtualizedList = memo(({
  items = [],
  itemHeight = 50,
  containerHeight = 400,
  overscan = 5,
  renderItem,
  className = '',
  onScroll,
  ...props
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);

  // Calcular itens visíveis
  const visibleItems = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    return {
      startIndex,
      endIndex,
      items: items.slice(startIndex, endIndex + 1).map((item, index) => ({
        ...item,
        index: startIndex + index
      }))
    };
  }, [items, scrollTop, itemHeight, containerHeight, overscan]);

  // Altura total da lista
  const totalHeight = items.length * itemHeight;

  // Offset para posicionar os itens visíveis
  const offsetY = visibleItems.startIndex * itemHeight;

  const handleScroll = (e) => {
    const newScrollTop = e.target.scrollTop;
    setScrollTop(newScrollTop);
    onScroll?.(e);
  };

  return (
    <div
      ref={containerRef}
      className={`virtualized-list ${className}`}
      style={{
        height: containerHeight,
        overflow: 'auto',
        position: 'relative'
      }}
      onScroll={handleScroll}
      {...props}
    >
      {/* Container com altura total para scroll */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* Itens visíveis */}
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleItems.items.map((item) => (
            <div
              key={item.index}
              style={{
                height: itemHeight,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {renderItem(item, item.index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

VirtualizedList.displayName = 'VirtualizedList';

/**
 * Hook para usar com VirtualizedList
 * Calcula automaticamente a altura dos itens
 */
export const useVirtualizedList = (items, options = {}) => {
  const {
    itemHeight = 50,
    containerHeight = 400,
    overscan = 5
  } = options;

  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    return { startIndex, endIndex };
  }, [items.length, scrollTop, itemHeight, containerHeight, overscan]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;

  return {
    visibleItems,
    totalHeight,
    offsetY,
    visibleRange,
    setScrollTop
  };
};

/**
 * Componente de tabela virtualizada
 */
const VirtualizedTable = memo(({
  data = [],
  columns = [],
  rowHeight = 40,
  headerHeight = 50,
  containerHeight = 400,
  overscan = 5,
  className = '',
  onRowClick,
  ...props
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);

  const visibleRows = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
    const endIndex = Math.min(
      data.length - 1,
      Math.ceil((scrollTop + containerHeight - headerHeight) / rowHeight) + overscan
    );

    return {
      startIndex,
      endIndex,
      rows: data.slice(startIndex, endIndex + 1).map((row, index) => ({
        ...row,
        index: startIndex + index
      }))
    };
  }, [data, scrollTop, rowHeight, containerHeight, headerHeight, overscan]);

  const totalHeight = data.length * rowHeight;
  const offsetY = visibleRows.startIndex * rowHeight;

  const handleScroll = (e) => {
    setScrollTop(e.target.scrollTop);
  };

  return (
    <div
      ref={containerRef}
      className={`virtualized-table ${className}`}
      style={{
        height: containerHeight,
        overflow: 'auto',
        border: '1px solid #ddd',
        borderRadius: '4px'
      }}
      onScroll={handleScroll}
      {...props}
    >
      {/* Header fixo */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1,
          backgroundColor: '#f8f9fa',
          borderBottom: '1px solid #ddd'
        }}
      >
        <div
          style={{
            display: 'flex',
            height: headerHeight,
            alignItems: 'center',
            fontWeight: 'bold'
          }}
        >
          {columns.map((column, index) => (
            <div
              key={index}
              style={{
                flex: column.width || 1,
                padding: '0 12px',
                borderRight: index < columns.length - 1 ? '1px solid #ddd' : 'none'
              }}
            >
              {column.header}
            </div>
          ))}
        </div>
      </div>

      {/* Container com altura total */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* Rows visíveis */}
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleRows.rows.map((row) => (
            <div
              key={row.index}
              style={{
                height: rowHeight,
                display: 'flex',
                alignItems: 'center',
                borderBottom: '1px solid #eee',
                cursor: onRowClick ? 'pointer' : 'default'
              }}
              onClick={() => onRowClick?.(row, row.index)}
            >
              {columns.map((column, index) => (
                <div
                  key={index}
                  style={{
                    flex: column.width || 1,
                    padding: '0 12px',
                    borderRight: index < columns.length - 1 ? '1px solid #eee' : 'none'
                  }}
                >
                  {column.render ? column.render(row, row.index) : row[column.key]}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

VirtualizedTable.displayName = 'VirtualizedTable';

/**
 * Componente de grid virtualizado
 */
const VirtualizedGrid = memo(({
  items = [],
  itemWidth = 200,
  itemHeight = 200,
  containerWidth = 800,
  containerHeight = 400,
  gap = 10,
  overscan = 2,
  renderItem,
  className = '',
  ...props
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const containerRef = useRef(null);

  const visibleItems = useMemo(() => {
    const itemsPerRow = Math.floor((containerWidth + gap) / (itemWidth + gap));
    const totalRows = Math.ceil(items.length / itemsPerRow);
    
    const startRow = Math.max(0, Math.floor(scrollTop / (itemHeight + gap)) - overscan);
    const endRow = Math.min(
      totalRows - 1,
      Math.ceil((scrollTop + containerHeight) / (itemHeight + gap)) + overscan
    );

    const visibleItems = [];
    for (let row = startRow; row <= endRow; row++) {
      const startIndex = row * itemsPerRow;
      const endIndex = Math.min(startIndex + itemsPerRow - 1, items.length - 1);
      
      for (let i = startIndex; i <= endIndex; i++) {
        if (items[i]) {
          visibleItems.push({
            ...items[i],
            index: i,
            row,
            col: i - startIndex
          });
        }
      }
    }

    return visibleItems;
  }, [items, itemWidth, itemHeight, containerWidth, containerHeight, gap, scrollTop, overscan]);

  const totalWidth = Math.ceil(items.length / Math.floor((containerWidth + gap) / (itemWidth + gap))) * (itemWidth + gap);
  const totalHeight = Math.ceil(items.length / Math.floor((containerWidth + gap) / (itemWidth + gap))) * (itemHeight + gap);

  const handleScroll = (e) => {
    setScrollTop(e.target.scrollTop);
    setScrollLeft(e.target.scrollLeft);
  };

  return (
    <div
      ref={containerRef}
      className={`virtualized-grid ${className}`}
      style={{
        width: containerWidth,
        height: containerHeight,
        overflow: 'auto',
        position: 'relative'
      }}
      onScroll={handleScroll}
      {...props}
    >
      <div style={{ width: totalWidth, height: totalHeight, position: 'relative' }}>
        {visibleItems.map((item) => (
          <div
            key={item.index}
            style={{
              position: 'absolute',
              left: item.col * (itemWidth + gap),
              top: item.row * (itemHeight + gap),
              width: itemWidth,
              height: itemHeight
            }}
          >
            {renderItem(item, item.index)}
          </div>
        ))}
      </div>
    </div>
  );
});

VirtualizedGrid.displayName = 'VirtualizedGrid';

export { VirtualizedList, VirtualizedTable, VirtualizedGrid, useVirtualizedList };
export default VirtualizedList;
