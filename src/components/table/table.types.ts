import React from 'react';

/**
 * Táblázat rendezési irány típusa
 */
export type SortDirection = 'asc' | 'desc' | null;

/**
 * Táblázat oszlop típusa
 */
export interface TableColumn<T> {
  /** Egyedi azonosító az oszlophoz */
  key: string;
  /** Megjelenítendő fejléc szöveg */
  header: React.ReactNode;
  /** Cella tartalom renderelő függvény */
  renderCell?: (item: T, rowIndex: number) => React.ReactNode;
  /** Oszlop szélessége (px, %, vagy auto) */
  width?: string | number;
  /** Oszlop minimális szélessége */
  minWidth?: string | number;
  /** Oszlop maximális szélessége */
  maxWidth?: string | number;
  /** Tartalom igazítása */
  align?: 'left' | 'center' | 'right';
  /** Rendezhető-e az oszlop */
  sortable?: boolean;
  /** Egyedi osztályok az oszlophoz */
  className?: string;
  /** Egyedi stílusok az oszlophoz */
  style?: React.CSSProperties;
  /** Egyedi osztályok a cellához */
  cellClassName?: string | ((item: T, rowIndex: number) => string);
  /** Egyedi stílusok a cellához */
  cellStyle?: React.CSSProperties | ((item: T, rowIndex: number) => React.CSSProperties);
  /** Oszlop láthatósága */
  visible?: boolean;
  /** Egyedi fejléc renderelő függvény */
  renderHeader?: (column: TableColumn<T>) => React.ReactNode;
}

/**
 * Táblázat téma beállítások
 */
export interface TableTheme {
  /** Táblázat háttérszíne */
  backgroundColor?: string;
  /** Táblázat szövegszíne */
  textColor?: string;
  /** Fejléc háttérszíne */
  headerBackgroundColor?: string;
  /** Fejléc szövegszíne */
  headerTextColor?: string;
  /** Páratlan sorok háttérszíne */
  oddRowBackgroundColor?: string;
  /** Páros sorok háttérszíne */
  evenRowBackgroundColor?: string;
  /** Kijelölt sor háttérszíne */
  selectedRowBackgroundColor?: string;
  /** Kijelölt sor szövegszíne */
  selectedRowTextColor?: string;
  /** Hover sor háttérszíne */
  hoverRowBackgroundColor?: string;
  /** Hover sor szövegszíne */
  hoverRowTextColor?: string;
  /** Keret színe */
  borderColor?: string;
  /** Keret vastagsága */
  borderWidth?: string;
  /** Keret sugara */
  borderRadius?: string;
  /** Árnyék */
  boxShadow?: string;
  /** Betűtípus */
  fontFamily?: string;
  /** Betűméret */
  fontSize?: string;
  /** Betűvastagság */
  fontWeight?: string;
  /** Sortávolság */
  lineHeight?: string;
  /** Cellapadding */
  cellPadding?: string;
}

/**
 * Táblázat szövegek testreszabása
 */
export interface TableLabels {
  /** Üres táblázat üzenet */
  noDataMessage?: string;
  /** Betöltés üzenet */
  loadingMessage?: string;
  /** Hiba üzenet */
  errorMessage?: string;
  /** Rendezés növekvő tooltip */
  sortAscending?: string;
  /** Rendezés csökkenő tooltip */
  sortDescending?: string;
  /** Rendezés törlése tooltip */
  clearSort?: string;
  /** Sorok száma szöveg */
  rowsCountText?: string;
  /** Kijelölt sorok szöveg */
  selectedRowsText?: string;
  /** Oldal méret szöveg */
  pageSizeText?: string;
  /** Előző oldal gomb szöveg */
  previousPageText?: string;
  /** Következő oldal gomb szöveg */
  nextPageText?: string;
  /** Oldal szöveg */
  pageText?: string;
  /** Összes oldal szöveg */
  ofText?: string;
  /** Keresés placeholder */
  searchPlaceholder?: string;
  /** Oszlop szűrő placeholder */
  filterPlaceholder?: string;
  /** Oszlop láthatóság gomb tooltip */
  columnVisibilityTooltip?: string;
  /** Exportálás gomb tooltip */
  exportTooltip?: string;
}

/**
 * Táblázat méret típusa
 */
export type TableSize = 'sm' | 'md' | 'lg';

/**
 * Táblázat props
 */
export interface TableProps<T> {
  /** Táblázat adatok */
  data: T[];
  /** Oszlop definíciók */
  columns: TableColumn<T>[];
  /** Egyedi kulcs mező az adatokban */
  keyField: keyof T | ((item: T) => React.Key);
  /** Betöltés állapot */
  isLoading?: boolean;
  /** Hiba állapot */
  error?: Error | null;
  /** Üres táblázat komponens */
  emptyComponent?: React.ReactNode;
  /** Betöltés komponens */
  loadingComponent?: React.ReactNode;
  /** Hiba komponens */
  errorComponent?: React.ReactNode;
  /** Táblázat mérete */
  size?: TableSize;
  /** Táblázat témája */
  theme?: TableTheme;
  /** Táblázat szövegei */
  labels?: TableLabels;
  /** Csíkozott sorok */
  striped?: boolean;
  /** Keret megjelenítése */
  bordered?: boolean;
  /** Kompakt megjelenés */
  compact?: boolean;
  /** Teljes szélesség */
  fullWidth?: boolean;
  /** Fejléc rögzítése */
  stickyHeader?: boolean;
  /** Fejléc elrejtése */
  hideHeader?: boolean;
  /** Táblázat wrapper eltávolítása */
  removeWrapper?: boolean;
  /** Sor kijelölés engedélyezése */
  selectable?: boolean;
  /** Kijelölt sorok */
  selectedRows?: React.Key[];
  /** Sor kijelölés eseménykezelő */
  onRowSelect?: (selectedKeys: React.Key[]) => void;
  /** Rendezés engedélyezése */
  sortable?: boolean;
  /** Rendezett oszlop */
  sortColumn?: string;
  /** Rendezés iránya */
  sortDirection?: SortDirection;
  /** Rendezés eseménykezelő */
  onSort?: (column: string, direction: SortDirection) => void;
  /** Lapozás engedélyezése */
  paginated?: boolean;
  /** Aktuális oldal */
  currentPage?: number;
  /** Oldalméret */
  pageSize?: number;
  /** Összes elem száma */
  totalItems?: number;
  /** Oldal változás eseménykezelő */
  onPageChange?: (page: number) => void;
  /** Oldalméret változás eseménykezelő */
  onPageSizeChange?: (pageSize: number) => void;
  /** Keresés engedélyezése */
  searchable?: boolean;
  /** Keresési kifejezés */
  searchTerm?: string;
  /** Keresés eseménykezelő */
  onSearch?: (term: string) => void;
  /** Oszlop láthatóság vezérlés engedélyezése */
  columnVisibility?: boolean;
  /** Látható oszlopok */
  visibleColumns?: string[];
  /** Oszlop láthatóság változás eseménykezelő */
  onColumnVisibilityChange?: (columns: string[]) => void;
  /** Exportálás engedélyezése */
  exportable?: boolean;
  /** Exportálás eseménykezelő */
  onExport?: (type: 'csv' | 'excel' | 'pdf') => void;
  /** Sor eseménykezelő */
  onRowClick?: (item: T, index: number) => void;
  /** Sor hover eseménykezelő */
  onRowMouseEnter?: (item: T, index: number) => void;
  /** Sor hover vége eseménykezelő */
  onRowMouseLeave?: (item: T, index: number) => void;
  /** Sor egyedi osztályok */
  rowClassName?: string | ((item: T, index: number) => string);
  /** Sor egyedi stílusok */
  rowStyle?: React.CSSProperties | ((item: T, index: number) => React.CSSProperties);
  /** Táblázat fejléc egyedi osztályok */
  headerClassName?: string;
  /** Táblázat fejléc egyedi stílusok */
  headerStyle?: React.CSSProperties;
  /** Táblázat egyedi osztályok */
  className?: string;
  /** Táblázat egyedi stílusok */
  style?: React.CSSProperties;
  /** Táblázat wrapper egyedi osztályok */
  wrapperClassName?: string;
  /** Táblázat wrapper egyedi stílusok */
  wrapperStyle?: React.CSSProperties;
  /** Táblázat fejléc egyedi renderelő */
  renderHeader?: (columns: TableColumn<T>[]) => React.ReactNode;
  /** Táblázat sor egyedi renderelő */
  renderRow?: (item: T, index: number) => React.ReactNode;
  /** Táblázat cella egyedi renderelő */
  renderCell?: (item: T, column: TableColumn<T>, rowIndex: number) => React.ReactNode;
  /** Táblázat lábléc egyedi renderelő */
  renderFooter?: () => React.ReactNode;
  /** Táblázat eszköztár egyedi renderelő */
  renderToolbar?: () => React.ReactNode;
  /** Táblázat lapozó egyedi renderelő */
  renderPagination?: () => React.ReactNode;
  /** Táblázat keresés egyedi renderelő */
  renderSearch?: () => React.ReactNode;
  /** Táblázat oszlop láthatóság egyedi renderelő */
  renderColumnVisibility?: () => React.ReactNode;
  /** Táblázat exportálás egyedi renderelő */
  renderExport?: () => React.ReactNode;
  /** Táblázat betöltés egyedi renderelő */
  renderLoading?: () => React.ReactNode;
  /** Táblázat hiba egyedi renderelő */
  renderError?: (error: Error) => React.ReactNode;
  /** Táblázat üres egyedi renderelő */
  renderEmpty?: () => React.ReactNode;
  /** Virtualizáció engedélyezése */
  virtualized?: boolean;
  /** Virtualizált sor magasság */
  rowHeight?: number;
  /** Virtualizált táblázat magasság */
  height?: number;
  /** Virtualizált táblázat szélesség */
  width?: number;
  /** Virtualizált táblázat túlcsordulás */
  overscanCount?: number;
  /** Egyéb props */
  [key: string]: any;
}

/**
 * Táblázat komponens ref típusa
 */
export interface TableRef {
  /** Táblázat DOM elem */
  tableElement: HTMLTableElement | null;
  /** Táblázat wrapper DOM elem */
  wrapperElement: HTMLDivElement | null;
  /** Táblázat fejléc DOM elem */
  headerElement: HTMLTableSectionElement | null;
  /** Táblázat törzs DOM elem */
  bodyElement: HTMLTableSectionElement | null;
  /** Táblázat lábléc DOM elem */
  footerElement: HTMLTableSectionElement | null;
  /** Táblázat frissítése */
  refresh: () => void;
  /** Táblázat exportálása */
  exportData: (type: 'csv' | 'excel' | 'pdf') => void;
  /** Táblázat keresése */
  search: (term: string) => void;
  /** Táblázat rendezése */
  sort: (column: string, direction: SortDirection) => void;
  /** Táblázat oldal váltása */
  goToPage: (page: number) => void;
  /** Táblázat oldalméret váltása */
  setPageSize: (size: number) => void;
  /** Táblázat oszlop láthatóság váltása */
  toggleColumnVisibility: (column: string, visible: boolean) => void;
  /** Táblázat sor kijelölése */
  selectRow: (key: React.Key, selected: boolean) => void;
  /** Táblázat összes sor kijelölése */
  selectAllRows: (selected: boolean) => void;
}
