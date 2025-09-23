import React, { forwardRef, useImperativeHandle, useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { TableProps, TableRef, TableColumn, SortDirection, TableSize, TableTheme, TableLabels } from './table.types';
import { Icon } from '@iconify/react';
import { Button, Tooltip, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Input, Select, SelectItem, Checkbox } from '@heroui/react';
import { useResizeObserver } from '../../hooks/use-resize-observer';
import { useKeyboardNavigation } from '../../hooks/use-keyboard-navigation';
import { ErrorBoundary } from '../error-boundary/error-boundary';

// Alapértelmezett témák
const defaultThemes: Record<'light' | 'dark', TableTheme> = {
  light: {
    backgroundColor: 'transparent',
    textColor: '#374151',
    headerBackgroundColor: '#f9fafb',
    headerTextColor: '#111827',
    oddRowBackgroundColor: 'transparent',
    evenRowBackgroundColor: '#f9fafb',
    selectedRowBackgroundColor: '#eff6ff',
    selectedRowTextColor: '#1e40af',
    hoverRowBackgroundColor: '#f3f4f6',
    hoverRowTextColor: '#111827',
    borderColor: '#e5e7eb',
    borderWidth: '1px',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    fontFamily: 'inherit',
    fontSize: '0.875rem',
    fontWeight: '400',
    lineHeight: '1.25rem',
    cellPadding: '0.75rem 1rem',
  },
  dark: {
    backgroundColor: 'transparent',
    textColor: '#d1d5db',
    headerBackgroundColor: '#111827',
    headerTextColor: '#f9fafb',
    oddRowBackgroundColor: 'transparent',
    evenRowBackgroundColor: 'rgba(255, 255, 255, 0.05)',
    selectedRowBackgroundColor: 'rgba(59, 130, 246, 0.1)',
    selectedRowTextColor: '#60a5fa',
    hoverRowBackgroundColor: 'rgba(255, 255, 255, 0.05)',
    hoverRowTextColor: '#f9fafb',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: '1px',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.2)',
    fontFamily: 'inherit',
    fontSize: '0.875rem',
    fontWeight: '400',
    lineHeight: '1.25rem',
    cellPadding: '0.75rem 1rem',
  }
};

// Alapértelmezett szövegek
const defaultLabels: TableLabels = {
  noDataMessage: 'Nincs megjeleníthető adat',
  loadingMessage: 'Adatok betöltése...',
  errorMessage: 'Hiba történt az adatok betöltése közben',
  sortAscending: 'Rendezés növekvő sorrendbe',
  sortDescending: 'Rendezés csökkenő sorrendbe',
  clearSort: 'Rendezés törlése',
  rowsCountText: 'Sorok: {count}',
  selectedRowsText: 'Kijelölve: {count}',
  pageSizeText: 'Sorok oldalanként:',
  previousPageText: 'Előző oldal',
  nextPageText: 'Következő oldal',
  pageText: 'Oldal:',
  ofText: '/',
  searchPlaceholder: 'Keresés...',
  filterPlaceholder: 'Szűrés...',
  columnVisibilityTooltip: 'Oszlopok láthatósága',
  exportTooltip: 'Exportálás',
};

// Méret beállítások
const sizeStyles: Record<TableSize, {
  fontSize: string,
  cellPadding: string,
  buttonSize: 'sm' | 'md' | 'lg',
  inputSize: 'sm' | 'md' | 'lg',
}> = {
  sm: {
    fontSize: '0.75rem',
    cellPadding: '0.5rem 0.75rem',
    buttonSize: 'sm',
    inputSize: 'sm',
  },
  md: {
    fontSize: '0.875rem',
    cellPadding: '0.75rem 1rem',
    buttonSize: 'md',
    inputSize: 'md',
  },
  lg: {
    fontSize: '1rem',
    cellPadding: '1rem 1.25rem',
    buttonSize: 'lg',
    inputSize: 'lg',
  },
};

/**
 * Fejlett táblázat komponens
 */
function TableComponent<T extends Record<string, any>>(
  props: TableProps<T>,
  ref: React.ForwardedRef<TableRef>
) {
  const {
    data = [],
    columns = [],
    keyField,
    isLoading = false,
    error = null,
    emptyComponent,
    loadingComponent,
    errorComponent,
    size = 'md',
    theme: customTheme = {},
    labels: customLabels = {},
    striped = false,
    bordered = false,
    compact = false,
    fullWidth = true,
    stickyHeader = false,
    hideHeader = false,
    removeWrapper = false,
    selectable = false,
    selectedRows = [],
    onRowSelect,
    sortable = false,
    sortColumn,
    sortDirection,
    onSort,
    paginated = false,
    currentPage = 1,
    pageSize = 10,
    totalItems,
    onPageChange,
    onPageSizeChange,
    searchable = false,
    searchTerm = '',
    onSearch,
    columnVisibility = false,
    visibleColumns,
    onColumnVisibilityChange,
    exportable = false,
    onExport,
    onRowClick,
    onRowMouseEnter,
    onRowMouseLeave,
    rowClassName,
    rowStyle,
    headerClassName,
    headerStyle,
    className,
    style,
    wrapperClassName,
    wrapperStyle,
    renderHeader,
    renderRow,
    renderCell,
    renderFooter,
    renderToolbar,
    renderPagination,
    renderSearch,
    renderColumnVisibility,
    renderExport,
    renderLoading,
    renderError,
    renderEmpty,
    virtualized = false,
    rowHeight = 48,
    height,
    width,
    overscanCount = 3,
    ...restProps
  } = props;

  // Refs
  const tableRef = useRef<HTMLTableElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLTableSectionElement>(null);
  const bodyRef = useRef<HTMLTableSectionElement>(null);
  const footerRef = useRef<HTMLTableSectionElement>(null);

  // Állapotok
  const [internalSortColumn, setInternalSortColumn] = useState<string | undefined>(sortColumn);
  const [internalSortDirection, setInternalSortDirection] = useState<SortDirection>(sortDirection || null);
  const [internalSelectedRows, setInternalSelectedRows] = useState<React.Key[]>(selectedRows || []);
  const [internalCurrentPage, setInternalCurrentPage] = useState<number>(currentPage);
  const [internalPageSize, setInternalPageSize] = useState<number>(pageSize);
  const [internalSearchTerm, setInternalSearchTerm] = useState<string>(searchTerm || '');
  const [internalVisibleColumns, setInternalVisibleColumns] = useState<string[]>(
    visibleColumns || columns.filter(col => col.visible !== false).map(col => col.key)
  );
  const [hoveredRowKey, setHoveredRowKey] = useState<React.Key | null>(null);
  const [focusedCell, setFocusedCell] = useState<{rowIndex: number, colIndex: number} | null>(null);
  const [tableWidth, setTableWidth] = useState<number>(0);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [isScrollable, setIsScrollable] = useState<boolean>(false);
  const [isOverflowing, setIsOverflowing] = useState<boolean>(false);
  const [announcements, setAnnouncements] = useState<string>('');

  // Téma és címkék egyesítése
  const isDarkMode = document.documentElement.classList.contains('dark');
  const baseTheme = isDarkMode ? defaultThemes.dark : defaultThemes.light;
  const theme = { ...baseTheme, ...customTheme };
  const labels = { ...defaultLabels, ...customLabels };
  const sizeConfig = sizeStyles[size];

  // Látható oszlopok
  const visibleColumnsData = useMemo(() => {
    return columns.filter(column => 
      internalVisibleColumns.includes(column.key) && column.visible !== false
    );
  }, [columns, internalVisibleColumns]);

  // Kulcs kinyerő függvény
  const getRowKey = useCallback((item: T): React.Key => {
    if (typeof keyField === 'function') {
      return keyField(item);
    }
    return String(item[keyField]);
  }, [keyField]);

  // Rendezett és lapozott adatok
  const processedData = useMemo(() => {
    let result = [...data];

    // Rendezés
    if (internalSortColumn && internalSortDirection) {
      const sortCol = columns.find(col => col.key === internalSortColumn);
      if (sortCol) {
        result.sort((a, b) => {
          const aValue = a[internalSortColumn];
          const bValue = b[internalSortColumn];
          
          // Null értékek kezelése
          if (aValue === null || aValue === undefined) return internalSortDirection === 'asc' ? -1 : 1;
          if (bValue === null || bValue === undefined) return internalSortDirection === 'asc' ? 1 : -1;
          
          // Dátumok kezelése
          if (aValue instanceof Date && bValue instanceof Date) {
            return internalSortDirection === 'asc' 
              ? aValue.getTime() - bValue.getTime() 
              : bValue.getTime() - aValue.getTime();
          }
          
          // Számok kezelése
          if (typeof aValue === 'number' && typeof bValue === 'number') {
            return internalSortDirection === 'asc' ? aValue - bValue : bValue - aValue;
          }
          
          // Szövegek kezelése
          const aString = String(aValue).toLowerCase();
          const bString = String(bValue).toLowerCase();
          return internalSortDirection === 'asc' 
            ? aString.localeCompare(bString, 'hu') 
            : bString.localeCompare(aString, 'hu');
        });
      }
    }

    // Keresés
    if (searchable && internalSearchTerm) {
      const searchLower = internalSearchTerm.toLowerCase();
      result = result.filter(item => {
        return Object.values(item).some(value => {
          if (value === null || value === undefined) return false;
          return String(value).toLowerCase().includes(searchLower);
        });
      });
    }

    // Lapozás
    if (paginated) {
      const totalCount = totalItems !== undefined ? totalItems : result.length;
      const pageCount = Math.ceil(totalCount / internalPageSize);
      
      // Oldalszám korrekció, ha túl nagy
      if (internalCurrentPage > pageCount && pageCount > 0) {
        setTimeout(() => setInternalCurrentPage(pageCount), 0);
      }
      
      // Csak akkor szeleteljük az adatokat, ha nincs külső adatforrás (totalItems)
      if (totalItems === undefined) {
        const start = (internalCurrentPage - 1) * internalPageSize;
        result = result.slice(start, start + internalPageSize);
      }
    }

    return result;
  }, [
    data, 
    columns, 
    internalSortColumn, 
    internalSortDirection, 
    searchable, 
    internalSearchTerm, 
    paginated, 
    internalCurrentPage, 
    internalPageSize,
    totalItems
  ]);

  // Méretfigyelés
  useResizeObserver(wrapperRef, (entry) => {
    if (entry && entry.contentRect) {
      setTableWidth(entry.contentRect.width);
      
      if (tableRef.current) {
        setIsScrollable(tableRef.current.scrollWidth > entry.contentRect.width);
        setIsOverflowing(tableRef.current.scrollWidth > tableRef.current.clientWidth);
      }
    }
  });

  // Billentyűzet navigáció
  const { focusedIndex } = useKeyboardNavigation({
    enabled: !isLoading && !error && processedData.length > 0,
    onArrowUp: () => {
      if (!focusedCell) return;
      const { rowIndex, colIndex } = focusedCell;
      if (rowIndex > 0) {
        setFocusedCell({ rowIndex: rowIndex - 1, colIndex });
      }
    },
    onArrowDown: () => {
      if (!focusedCell) return;
      const { rowIndex, colIndex } = focusedCell;
      const rowsCount = processedData.length;
      if (rowIndex < rowsCount - 1) {
        setFocusedCell({ rowIndex: rowIndex + 1, colIndex });
      }
    },
    onArrowLeft: () => {
      if (!focusedCell) return;
      const { rowIndex, colIndex } = focusedCell;
      if (colIndex > 0) {
        setFocusedCell({ rowIndex, colIndex: colIndex - 1 });
      }
    },
    onArrowRight: () => {
      if (!focusedCell) return;
      const { rowIndex, colIndex } = focusedCell;
      const colsCount = visibleColumnsData.length;
      if (colIndex < colsCount - 1) {
        setFocusedCell({ rowIndex, colIndex: colIndex + 1 });
      }
    },
    onHome: () => {
      if (!focusedCell) return;
      setFocusedCell({ rowIndex: focusedCell.rowIndex, colIndex: 0 });
    },
    onEnd: () => {
      if (!focusedCell) return;
      const colsCount = visibleColumnsData.length;
      setFocusedCell({ rowIndex: focusedCell.rowIndex, colIndex: colsCount - 1 });
    },
    onPageUp: () => {
      if (paginated && internalCurrentPage > 1) {
        handlePageChange(internalCurrentPage - 1);
      } else if (focusedCell) {
        setFocusedCell({ rowIndex: 0, colIndex: focusedCell.colIndex });
      }
    },
    onPageDown: () => {
      if (paginated && totalItems && internalCurrentPage < Math.ceil(totalItems / internalPageSize)) {
        handlePageChange(internalCurrentPage + 1);
      } else if (focusedCell) {
        const rowsCount = processedData.length;
        setFocusedCell({ rowIndex: rowsCount - 1, colIndex: focusedCell.colIndex });
      }
    },
    onEnter: () => {
      if (!focusedCell) return;
      const { rowIndex } = focusedCell;
      if (selectable) {
        const rowKey = getRowKey(processedData[rowIndex]);
        toggleRowSelection(rowKey);
      } else if (onRowClick) {
        onRowClick(processedData[rowIndex], rowIndex);
      }
    }
  });

  // Ref API
  useImperativeHandle(ref, () => ({
    tableElement: tableRef.current,
    wrapperElement: wrapperRef.current,
    headerElement: headerRef.current,
    bodyElement: bodyRef.current,
    footerElement: footerRef.current,
    refresh: () => {
      // Frissítés logika
    },
    exportData: (type) => {
      handleExport(type);
    },
    search: (term) => {
      setInternalSearchTerm(term);
      if (onSearch) onSearch(term);
    },
    sort: (column, direction) => {
      handleSort(column, direction);
    },
    goToPage: (page) => {
      handlePageChange(page);
    },
    setPageSize: (size) => {
      handlePageSizeChange(size);
    },
    toggleColumnVisibility: (column, visible) => {
      handleColumnVisibilityChange(column, visible);
    },
    selectRow: (key, selected) => {
      handleRowSelection(key, selected);
    },
    selectAllRows: (selected) => {
      handleSelectAllRows(selected);
    }
  }), [
    processedData, 
    onSearch, 
    onSort, 
    onPageChange, 
    onPageSizeChange, 
    onColumnVisibilityChange, 
    onRowSelect
  ]);

  // Rendezés kezelése
  const handleSort = useCallback((column: string, direction?: SortDirection) => {
    const newDirection = direction !== undefined 
      ? direction 
      : (column === internalSortColumn 
        ? (internalSortDirection === 'asc' ? 'desc' : internalSortDirection === 'desc' ? null : 'asc')
        : 'asc');
    
    setInternalSortColumn(newDirection === null ? undefined : column);
    setInternalSortDirection(newDirection);
    
    if (onSort) {
      onSort(column, newDirection);
    }
    
    // Bejelentés a képernyőolvasóknak
    const columnObj = columns.find(col => col.key === column);
    const columnName = columnObj?.header || column;
    let announcement = '';
    
    if (newDirection === 'asc') {
      announcement = `${columnName} oszlop rendezve növekvő sorrendben`;
    } else if (newDirection === 'desc') {
      announcement = `${columnName} oszlop rendezve csökkenő sorrendben`;
    } else {
      announcement = `${columnName} oszlop rendezése törölve`;
    }
    
    setAnnouncements(announcement);
  }, [internalSortColumn, internalSortDirection, onSort, columns]);

  // Sor kijelölés kezelése
  const handleRowSelection = useCallback((key: React.Key, selected: boolean) => {
    const newSelectedRows = selected
      ? [...internalSelectedRows, key]
      : internalSelectedRows.filter(k => k !== key);
    
    setInternalSelectedRows(newSelectedRows);
    
    if (onRowSelect) {
      onRowSelect(newSelectedRows);
    }
    
    // Bejelentés a képernyőolvasóknak
    const announcement = selected 
      ? 'Sor kijelölve' 
      : 'Sor kijelölés törölve';
    setAnnouncements(announcement);
  }, [internalSelectedRows, onRowSelect]);

  // Sor kijelölés váltása
  const toggleRowSelection = useCallback((key: React.Key) => {
    const isSelected = internalSelectedRows.includes(key);
    handleRowSelection(key, !isSelected);
  }, [internalSelectedRows, handleRowSelection]);

  // Összes sor kijelölése
  const handleSelectAllRows = useCallback((selected: boolean) => {
    const newSelectedRows = selected
      ? processedData.map(getRowKey)
      : [];
    
    setInternalSelectedRows(newSelectedRows);
    
    if (onRowSelect) {
      onRowSelect(newSelectedRows);
    }
    
    // Bejelentés a képernyőolvasóknak
    const announcement = selected 
      ? 'Összes sor kijelölve' 
      : 'Összes sor kijelölés törölve';
    setAnnouncements(announcement);
  }, [processedData, getRowKey, onRowSelect]);

  // Oldal váltás kezelése
  const handlePageChange = useCallback((page: number) => {
    setInternalCurrentPage(page);
    
    if (onPageChange) {
      onPageChange(page);
    }
    
    // Bejelentés a képernyőolvasóknak
    setAnnouncements(`${page}. oldalra lépés`);
  }, [onPageChange]);

  // Oldalméret váltás kezelése
  const handlePageSizeChange = useCallback((size: number) => {
    setInternalPageSize(size);
    setInternalCurrentPage(1); // Visszalépés az első oldalra
    
    if (onPageSizeChange) {
      onPageSizeChange(size);
    }
    
    // Bejelentés a képernyőolvasóknak
    setAnnouncements(`Oldalméret módosítva ${size} sorra`);
  }, [onPageSizeChange]);

  // Keresés kezelése
  const handleSearch = useCallback((term: string) => {
    setInternalSearchTerm(term);
    
    if (onSearch) {
      onSearch(term);
    }
  }, [onSearch]);

  // Oszlop láthatóság kezelése
  const handleColumnVisibilityChange = useCallback((column: string, visible: boolean) => {
    const newVisibleColumns = visible
      ? [...internalVisibleColumns, column]
      : internalVisibleColumns.filter(c => c !== column);
    
    setInternalVisibleColumns(newVisibleColumns);
    
    if (onColumnVisibilityChange) {
      onColumnVisibilityChange(newVisibleColumns);
    }
    
    // Bejelentés a képernyőolvasóknak
    const columnObj = columns.find(col => col.key === column);
    const columnName = columnObj?.header || column;
    const announcement = visible 
      ? `${columnName} oszlop láthatóvá téve` 
      : `${columnName} oszlop elrejtve`;
    setAnnouncements(announcement);
  }, [internalVisibleColumns, onColumnVisibilityChange, columns]);

  // Exportálás kezelése
  const handleExport = useCallback((type: 'csv' | 'excel' | 'pdf') => {
    if (onExport) {
      onExport(type);
    } else {
      // Alapértelmezett CSV exportálás
      if (type === 'csv') {
        const visibleCols = columns.filter(col => 
          internalVisibleColumns.includes(col.key) && col.visible !== false
        );
        
        const headers = visibleCols.map(col => 
          typeof col.header === 'string' ? col.header : col.key
        );
        
        const rows = data.map(item => 
          visibleCols.map(col => {
            const value = item[col.key];
            if (value === null || value === undefined) return '';
            if (value instanceof Date) return value.toISOString();
            return String(value);
          })
        );
        
        const csvContent = [
          headers.join(','),
          ...rows.map(row => row.join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `export-${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
    
    // Bejelentés a képernyőolvasóknak
    setAnnouncements(`Adatok exportálva ${type} formátumban`);
  }, [data, columns, internalVisibleColumns, onExport]);

  // Sor eseménykezelők
  const handleRowClick = useCallback((item: T, index: number) => {
    if (onRowClick) {
      onRowClick(item, index);
    }
  }, [onRowClick]);

  const handleRowMouseEnter = useCallback((item: T, index: number) => {
    setHoveredRowKey(getRowKey(item));
    
    if (onRowMouseEnter) {
      onRowMouseEnter(item, index);
    }
  }, [onRowMouseEnter, getRowKey]);

  const handleRowMouseLeave = useCallback((item: T, index: number) => {
    setHoveredRowKey(null);
    
    if (onRowMouseLeave) {
      onRowMouseLeave(item, index);
    }
  }, [onRowMouseLeave]);

  // Cella fókusz kezelése
  const handleCellFocus = useCallback((rowIndex: number, colIndex: number) => {
    setFocusedCell({ rowIndex, colIndex });
  }, []);

  // Eszköztár renderelése
  const renderTableToolbar = () => {
    if (renderToolbar) {
      return renderToolbar();
    }
    
    const hasToolbarItems = searchable || columnVisibility || exportable;
    if (!hasToolbarItems) return null;
    
    return (
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          {searchable && (
            renderSearch ? renderSearch() : (
              <div className="w-64">
                <Input
                  aria-label="Táblázat keresés"
                  placeholder={labels.searchPlaceholder}
                  value={internalSearchTerm}
                  onValueChange={handleSearch}
                  size={sizeConfig.inputSize}
                  startContent={<Icon icon="lucide:search" width={16} height={16} />}
                  isClearable
                />
              </div>
            )
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {columnVisibility && (
            renderColumnVisibility ? renderColumnVisibility() : (
              <Dropdown>
                <DropdownTrigger>
                  <Button 
                    variant="flat" 
                    size={sizeConfig.buttonSize}
                    aria-label={labels.columnVisibilityTooltip}
                  >
                    <Icon icon="lucide:columns" width={16} height={16} />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu 
                  aria-label="Oszlopok láthatósága"
                  selectionMode="multiple"
                  selectedKeys={new Set(internalVisibleColumns)}
                  onSelectionChange={(keys) => {
                    const selectedKeys = Array.from(keys).map(String);
                    setInternalVisibleColumns(selectedKeys);
                    if (onColumnVisibilityChange) {
                      onColumnVisibilityChange(selectedKeys);
                    }
                  }}
                >
                  {columns.map((column) => (
                    <DropdownItem key={column.key}>
                      {typeof column.header === 'string' ? column.header : column.key}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            )
          )}
          
          {exportable && (
            renderExport ? renderExport() : (
              <Dropdown>
                <DropdownTrigger>
                  <Button 
                    variant="flat" 
                    size={sizeConfig.buttonSize}
                    aria-label={labels.exportTooltip}
                  >
                    <Icon icon="lucide:download" width={16} height={16} />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Exportálási lehetőségek">
                  <DropdownItem key="csv" onPress={() => handleExport('csv')}>
                    CSV
                  </DropdownItem>
                  <DropdownItem key="excel" onPress={() => handleExport('excel')}>
                    Excel
                  </DropdownItem>
                  <DropdownItem key="pdf" onPress={() => handleExport('pdf')}>
                    PDF
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            )
          )}
        </div>
      </div>
    );
  };

  // Lapozó renderelése
  const renderTablePagination = () => {
    if (!paginated) return null;
    
    if (renderPagination) {
      return renderPagination();
    }
    
    const totalCount = totalItems !== undefined ? totalItems : data.length;
    const pageCount = Math.max(1, Math.ceil(totalCount / internalPageSize));
    const startItem = (internalCurrentPage - 1) * internalPageSize + 1;
    const endItem = Math.min(internalCurrentPage * internalPageSize, totalCount);
    
    return (
      <div className="flex flex-wrap items-center justify-between gap-2 mt-3">
        <div className="flex items-center gap-2 text-sm">
          <span>
            {labels.rowsCountText.replace('{count}', String(totalCount))}
          </span>
          {selectable && internalSelectedRows.length > 0 && (
            <span className="ml-2">
              {labels.selectedRowsText.replace('{count}', String(internalSelectedRows.length))}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-sm">{labels.pageSizeText}</span>
            <Select
              aria-label="Sorok száma oldalanként"
              selectedKeys={[String(internalPageSize)]}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              size={sizeConfig.inputSize}
              className="w-20"
            >
              {[10, 25, 50, 100].map((size) => (
                <SelectItem key={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </Select>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="flat"
              size={sizeConfig.buttonSize}
              isDisabled={internalCurrentPage <= 1}
              onPress={() => handlePageChange(internalCurrentPage - 1)}
              aria-label={labels.previousPageText}
            >
              <Icon icon="lucide:chevron-left" width={16} height={16} />
            </Button>
            
            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: Math.min(5, pageCount) }, (_, i) => {
                let pageNum;
                if (pageCount <= 5) {
                  pageNum = i + 1;
                } else if (internalCurrentPage <= 3) {
                  pageNum = i + 1;
                } else if (internalCurrentPage >= pageCount - 2) {
                  pageNum = pageCount - 4 + i;
                } else {
                  pageNum = internalCurrentPage - 2 + i;
                }
                
                if (pageNum <= 0 || pageNum > pageCount) return null;
                
                return (
                  <Button
                    key={pageNum}
                    variant={internalCurrentPage === pageNum ? "solid" : "flat"}
                    color={internalCurrentPage === pageNum ? "primary" : "default"}
                    size={sizeConfig.buttonSize}
                    onPress={() => handlePageChange(pageNum)}
                    className="min-w-[36px]"
                    aria-label={`${pageNum}. oldal`}
                    aria-current={internalCurrentPage === pageNum ? "page" : undefined}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            
            <span className="sm:hidden text-sm px-2">
              {internalCurrentPage} / {pageCount}
            </span>
            
            <Button
              variant="flat"
              size={sizeConfig.buttonSize}
              isDisabled={internalCurrentPage >= pageCount}
              onPress={() => handlePageChange(internalCurrentPage + 1)}
              aria-label={labels.nextPageText}
            >
              <Icon icon="lucide:chevron-right" width={16} height={16} />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Fejléc renderelése
  const renderTableHeader = () => {
    if (hideHeader) return null;
    
    if (renderHeader) {
      return renderHeader(visibleColumnsData);
    }
    
    return (
      <thead
        ref={headerRef}
        className={`text-left ${headerClassName || ''}`}
        style={{
          position: stickyHeader ? 'sticky' : 'relative',
          top: stickyHeader ? 0 : undefined,
          zIndex: stickyHeader ? 1 : undefined,
          backgroundColor: theme.headerBackgroundColor,
          color: theme.headerTextColor,
          ...headerStyle
        }}
      >
        <tr>
          {selectable && (
            <th
              className="select-none"
              style={{
                padding: sizeConfig.cellPadding,
                borderBottom: bordered ? `${theme.borderWidth} solid ${theme.borderColor}` : undefined,
                fontWeight: theme.fontWeight,
                fontSize: sizeConfig.fontSize,
                lineHeight: theme.lineHeight,
              }}
            >
              <Checkbox
                aria-label="Összes sor kijelölése"
                isSelected={
                  processedData.length > 0 && 
                  processedData.every(item => internalSelectedRows.includes(getRowKey(item)))
                }
                isIndeterminate={
                  internalSelectedRows.length > 0 && 
                  internalSelectedRows.length < processedData.length
                }
                onValueChange={(selected) => handleSelectAllRows(selected)}
              />
            </th>
          )}
          
          {visibleColumnsData.map((column, colIndex) => {
            const isSortable = sortable && (column.sortable !== false);
            const isSorted = internalSortColumn === column.key;
            const sortDir = isSorted ? internalSortDirection : null;
            
            let sortAriaLabel = '';
            if (isSortable) {
              if (sortDir === 'asc') {
                sortAriaLabel = labels.sortDescending || '';
              } else if (sortDir === 'desc') {
                sortAriaLabel = labels.clearSort || '';
              } else {
                sortAriaLabel = labels.sortAscending || '';
              }
            }
            
            return (
              <th
                key={column.key}
                className={`${column.className || ''} ${isSortable ? 'cursor-pointer select-none' : ''}`}
                style={{
                  width: column.width,
                  minWidth: column.minWidth,
                  maxWidth: column.maxWidth,
                  textAlign: column.align || 'left',
                  padding: sizeConfig.cellPadding,
                  borderBottom: bordered ? `${theme.borderWidth} solid ${theme.borderColor}` : undefined,
                  fontWeight: theme.fontWeight,
                  fontSize: sizeConfig.fontSize,
                  lineHeight: theme.lineHeight,
                  ...column.style
                }}
                onClick={isSortable ? () => handleSort(column.key) : undefined}
                onKeyDown={isSortable ? (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleSort(column.key);
                    e.preventDefault();
                  }
                } : undefined}
                tabIndex={isSortable ? 0 : -1}
                aria-sort={
                  isSorted 
                    ? (sortDir === 'asc' ? 'ascending' : 'descending') 
                    : undefined
                }
                aria-label={
                  isSortable 
                    ? `${typeof column.header === 'string' ? column.header : column.key}, ${sortAriaLabel}`
                    : undefined
                }
                role="columnheader"
              >
                <div className="flex items-center gap-1">
                  {column.renderHeader 
                    ? column.renderHeader(column) 
                    : column.header}
                  
                  {isSortable && (
                    <div className="flex flex-col ml-1">
                      <Icon 
                        icon="lucide:chevron-up" 
                        width={12} 
                        height={12} 
                        className={`${sortDir === 'asc' ? 'text-primary-500' : 'text-gray-400'} -mb-1`} 
                      />
                      <Icon 
                        icon="lucide:chevron-down" 
                        width={12} 
                        height={12} 
                        className={`${sortDir === 'desc' ? 'text-primary-500' : 'text-gray-400'}`} 
                      />
                    </div>
                  )}
                </div>
              </th>
            );
          })}
        </tr>
      </thead>
    );
  };

  // Törzs renderelése
  const renderTableBody = () => {
    if (isLoading) {
      return (
        <tbody ref={bodyRef}>
          <tr>
            <td
              colSpan={selectable ? visibleColumnsData.length + 1 : visibleColumnsData.length}
              style={{
                padding: sizeConfig.cellPadding,
                textAlign: 'center',
                color: theme.textColor,
              }}
            >
              {renderLoading ? renderLoading() : (
                <div className="flex items-center justify-center py-8">
                  <div className="flex flex-col items-center gap-3">
                    <span className="inline-flex h-10 w-10 rounded-full border-2 border-white/20 border-t-primary-500 animate-spin"></span>
                    <span>{labels.loadingMessage}</span>
                  </div>
                </div>
              )}
            </td>
          </tr>
        </tbody>
      );
    }
    
    if (error) {
      return (
        <tbody ref={bodyRef}>
          <tr>
            <td
              colSpan={selectable ? visibleColumnsData.length + 1 : visibleColumnsData.length}
              style={{
                padding: sizeConfig.cellPadding,
                textAlign: 'center',
                color: theme.textColor,
              }}
            >
              {renderError ? renderError(error) : (
                <div className="flex items-center justify-center py-8 text-danger-500">
                  <div className="flex flex-col items-center gap-3">
                    <Icon icon="lucide:alert-triangle" width={24} height={24} />
                    <span>{labels.errorMessage}: {error.message}</span>
                  </div>
                </div>
              )}
            </td>
          </tr>
        </tbody>
      );
    }
    
    if (processedData.length === 0) {
      return (
        <tbody ref={bodyRef}>
          <tr>
            <td
              colSpan={selectable ? visibleColumnsData.length + 1 : visibleColumnsData.length}
              style={{
                padding: sizeConfig.cellPadding,
                textAlign: 'center',
                color: theme.textColor,
              }}
            >
              {renderEmpty ? renderEmpty() : emptyComponent || (
                <div className="flex items-center justify-center py-8">
                  <div className="flex flex-col items-center gap-3">
                    <Icon icon="lucide:inbox" width={24} height={24} />
                    <span>{labels.noDataMessage}</span>
                  </div>
                </div>
              )}
            </td>
          </tr>
        </tbody>
      );
    }
    
    return (
      <tbody ref={bodyRef}>
        {processedData.map((item, rowIndex) => {
          const rowKey = getRowKey(item);
          const isSelected = internalSelectedRows.includes(rowKey);
          const isHovered = hoveredRowKey === rowKey;
          const isEven = rowIndex % 2 === 1;
          
          // Sor osztályok és stílusok
          let rowClassNameValue = '';
          let rowStyleValue: React.CSSProperties = {};
          
          if (typeof rowClassName === 'function') {
            rowClassNameValue = rowClassName(item, rowIndex);
          } else if (rowClassName) {
            rowClassNameValue = rowClassName;
          }
          
          if (typeof rowStyle === 'function') {
            rowStyleValue = rowStyle(item, rowIndex);
          } else if (rowStyle) {
            rowStyleValue = rowStyle;
          }
          
          if (renderRow) {
            return renderRow(item, rowIndex);
          }
          
          return (
            <tr
              key={String(rowKey)}
              className={rowClassNameValue}
              style={{
                backgroundColor: isSelected 
                  ? theme.selectedRowBackgroundColor 
                  : isHovered 
                    ? theme.hoverRowBackgroundColor 
                    : striped && isEven 
                      ? theme.evenRowBackgroundColor 
                      : theme.oddRowBackgroundColor,
                color: isSelected 
                  ? theme.selectedRowTextColor 
                  : isHovered 
                    ? theme.hoverRowTextColor 
                    : theme.textColor,
                ...rowStyleValue
              }}
              onClick={() => handleRowClick(item, rowIndex)}
              onMouseEnter={() => handleRowMouseEnter(item, rowIndex)}
              onMouseLeave={() => handleRowMouseLeave(item, rowIndex)}
              aria-selected={isSelected}
              data-selected={isSelected}
              data-row-index={rowIndex}
            >
              {selectable && (
                <td
                  style={{
                    padding: sizeConfig.cellPadding,
                    borderBottom: bordered ? `${theme.borderWidth} solid ${theme.borderColor}` : undefined,
                    fontSize: sizeConfig.fontSize,
                    lineHeight: theme.lineHeight,
                  }}
                >
                  <Checkbox
                    aria-label={`${rowIndex + 1}. sor kijelölése`}
                    isSelected={isSelected}
                    onValueChange={(selected) => handleRowSelection(rowKey, selected)}
                  />
                </td>
              )}
              
              {visibleColumnsData.map((column, colIndex) => {
                // Cella osztályok és stílusok
                let cellClassNameValue = '';
                let cellStyleValue: React.CSSProperties = {};
                
                if (typeof column.cellClassName === 'function') {
                  cellClassNameValue = column.cellClassName(item, rowIndex);
                } else if (column.cellClassName) {
                  cellClassNameValue = column.cellClassName;
                }
                
                if (typeof column.cellStyle === 'function') {
                  cellStyleValue = column.cellStyle(item, rowIndex);
                } else if (column.cellStyle) {
                  cellStyleValue = column.cellStyle;
                }
                
                const isFocused = focusedCell?.rowIndex === rowIndex && focusedCell?.colIndex === colIndex;
                
                return (
                  <td
                    key={column.key}
                    className={cellClassNameValue}
                    style={{
                      textAlign: column.align || 'left',
                      padding: sizeConfig.cellPadding,
                      borderBottom: bordered ? `${theme.borderWidth} solid ${theme.borderColor}` : undefined,
                      fontSize: sizeConfig.fontSize,
                      lineHeight: theme.lineHeight,
                      outline: isFocused ? '2px solid var(--heroui-focus)' : undefined,
                      outlineOffset: isFocused ? '-2px' : undefined,
                      ...cellStyleValue
                    }}
                    tabIndex={isFocused ? 0 : -1}
                    onFocus={() => handleCellFocus(rowIndex, colIndex)}
                    aria-colindex={colIndex + (selectable ? 2 : 1)}
                    role="cell"
                  >
                    {renderCell 
                      ? renderCell(item, column, rowIndex)
                      : column.renderCell 
                        ? column.renderCell(item, rowIndex)
                        : item[column.key] !== undefined && item[column.key] !== null
                          ? String(item[column.key])
                          : ''}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    );
  };

  // Lábléc renderelése
  const renderTableFooter = () => {
    if (renderFooter) {
      return (
        <tfoot ref={footerRef}>
          {renderFooter()}
        </tfoot>
      );
    }
    return null;
  };

  // Táblázat renderelése
  const tableContent = (
    <table
      ref={tableRef}
      className={className}
      style={{
        width: fullWidth ? '100%' : undefined,
        borderCollapse: 'separate',
        borderSpacing: 0,
        borderRadius: theme.borderRadius,
        overflow: 'hidden',
        backgroundColor: theme.backgroundColor,
        color: theme.textColor,
        fontFamily: theme.fontFamily,
        ...style
      }}
      {...restProps}
      role="grid"
      aria-rowcount={processedData.length}
      aria-colcount={visibleColumnsData.length}
      aria-busy={isLoading}
    >
      {renderTableHeader()}
      {renderTableBody()}
      {renderTableFooter()}
    </table>
  );

  // Képernyőolvasó bejelentések
  const accessibilityAnnouncements = (
    <div 
      aria-live="polite" 
      className="sr-only"
      role="status"
    >
      {announcements}
    </div>
  );

  // Wrapper nélküli renderelés
  if (removeWrapper) {
    return (
      <>
        {tableContent}
        {accessibilityAnnouncements}
      </>
    );
  }

  // Wrapper-rel renderelés
  return (
    <div
      ref={wrapperRef}
      className={`relative ${isOverflowing ? 'overflow-x-auto' : ''} ${wrapperClassName || ''}`}
      style={{
        borderRadius: theme.borderRadius,
        boxShadow: bordered ? theme.boxShadow : undefined,
        ...wrapperStyle
      }}
    >
      {renderTableToolbar()}
      {tableContent}
      {renderTablePagination()}
      {accessibilityAnnouncements}
    </div>
  );
}

// ErrorBoundary wrapper
const TableWithErrorBoundary = forwardRef(
  <T extends Record<string, any>>(props: TableProps<T>, ref: React.ForwardedRef<TableRef>) => (
    <ErrorBoundary
      fallback={(error) => (
        <div className="p-4 text-danger-500 bg-danger-50 rounded-md border border-danger-200">
          <h3 className="font-semibold mb-1">Hiba történt a táblázat renderelése közben</h3>
          <p>{error.message}</p>
        </div>
      )}
    >
      <TableComponent {...props} ref={ref} />
    </ErrorBoundary>
  )
) as <T extends Record<string, any>>(
  props: TableProps<T> & { ref?: React.ForwardedRef<TableRef> }
) => React.ReactElement;

export const Table = TableWithErrorBoundary;
