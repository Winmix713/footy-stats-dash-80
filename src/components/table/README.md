# Táblázat Komponens

Fejlett, teljesen testreszabható táblázat komponens React és TypeScript használatával. A komponens támogatja a rendezést, szűrést, lapozást, keresést, sor kijelölést és számos más funkciót.

## Telepítés

```bash
npm install @heroui/react
```

## Használat

```tsx
import React from 'react';
import { Table } from './components/table/table';

const App = () => {
  const data = [
    { id: 1, name: 'Teszt Elek', email: 'teszt.elek@example.com', age: 30 },
    { id: 2, name: 'Gipsz Jakab', email: 'gipsz.jakab@example.com', age: 25 },
    { id: 3, name: 'Kovács Anna', email: 'kovacs.anna@example.com', age: 35 },
  ];

  const columns = [
    { key: 'name', header: 'Név', sortable: true },
    { key: 'email', header: 'E-mail cím' },
    { key: 'age', header: 'Kor', sortable: true },
  ];

  return (
    <Table
      data={data}
      columns={columns}
      keyField="id"
      striped
      bordered
      sortable
      paginated
      searchable
    />
  );
};

export default App;
```

## Tulajdonságok (Props)

### Alap tulajdonságok

| Név | Típus | Alapértelmezett | Leírás |
|-----|-------|----------------|--------|
| `data` | `T[]` | `[]` | Táblázat adatok |
| `columns` | `TableColumn<T>[]` | `[]` | Oszlop definíciók |
| `keyField` | `keyof T \| ((item: T) => React.Key)` | - | Egyedi kulcs mező az adatokban |
| `isLoading` | `boolean` | `false` | Betöltés állapot |
| `error` | `Error \| null` | `null` | Hiba állapot |
| `emptyComponent` | `React.ReactNode` | - | Üres táblázat komponens |
| `loadingComponent` | `React.ReactNode` | - | Betöltés komponens |
| `errorComponent` | `React.ReactNode` | - | Hiba komponens |

### Megjelenés

| Név | Típus | Alapértelmezett | Leírás |
|-----|-------|----------------|--------|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Táblázat mérete |
| `theme` | `TableTheme` | - | Táblázat témája |
| `labels` | `TableLabels` | - | Táblázat szövegei |
| `striped` | `boolean` | `false` | Csíkozott sorok |
| `bordered` | `boolean` | `false` | Keret megjelenítése |
| `compact` | `boolean` | `false` | Kompakt megjelenés |
| `fullWidth` | `boolean` | `true` | Teljes szélesség |
| `stickyHeader` | `boolean` | `false` | Fejléc rögzítése |
| `hideHeader` | `boolean` | `false` | Fejléc elrejtése |
| `removeWrapper` | `boolean` | `false` | Táblázat wrapper eltávolítása |

### Funkciók

| Név | Típus | Alapértelmezett | Leírás |
|-----|-------|----------------|--------|
| `selectable` | `boolean` | `false` | Sor kijelölés engedélyezése |
| `selectedRows` | `React.Key[]` | `[]` | Kijelölt sorok |
| `onRowSelect` | `(selectedKeys: React.Key[]) => void` | - | Sor kijelölés eseménykezelő |
| `sortable` | `boolean` | `false` | Rendezés engedélyezése |
| `sortColumn` | `string` | - | Rendezett oszlop |
| `sortDirection` | `'asc' \| 'desc' \| null` | - | Rendezés iránya |
| `onSort` | `(column: string, direction: SortDirection) => void` | - | Rendezés eseménykezelő |
| `paginated` | `boolean` | `false` | Lapozás engedélyezése |
| `currentPage` | `number` | `1` | Aktuális oldal |
| `pageSize` | `number` | `10` | Oldalméret |
| `totalItems` | `number` | - | Összes elem száma |
| `onPageChange` | `(page: number) => void` | - | Oldal változás eseménykezelő |
| `onPageSizeChange` | `(pageSize: number) => void` | - | Oldalméret változás eseménykezelő |
| `searchable` | `boolean` | `false` | Keresés engedélyezése |
| `searchTerm` | `string` | `''` | Keresési kifejezés |
| `onSearch` | `(term: string) => void` | - | Keresés eseménykezelő |
| `columnVisibility` | `boolean` | `false` | Oszlop láthatóság vezérlés engedélyezése |
| `visibleColumns` | `string[]` | - | Látható oszlopok |
| `onColumnVisibilityChange` | `(columns: string[]) => void` | - | Oszlop láthatóság változás eseménykezelő |
| `exportable` | `boolean` | `false` | Exportálás engedélyezése |
| `onExport` | `(type: 'csv' \| 'excel' \| 'pdf') => void` | - | Exportálás eseménykezelő |

### Eseménykezelők

| Név | Típus | Alapértelmezett | Leírás |
|-----|-------|----------------|--------|
| `onRowClick` | `(item: T, index: number) => void` | - | Sor eseménykezelő |
| `onRowMouseEnter` | `(item: T, index: number) => void` | - | Sor hover eseménykezelő |
| `onRowMouseLeave` | `(item: T, index: number) => void` | - | Sor hover vége eseménykezelő |

### Testreszabás

| Név | Típus | Alapértelmezett | Leírás |
|-----|-------|----------------|--------|
| `rowClassName` | `string \| ((item: T, index: number) => string)` | - | Sor egyedi osztályok |
| `rowStyle` | `React.CSSProperties \| ((item: T, index: number) => React.CSSProperties)` | - | Sor egyedi stílusok |
| `headerClassName` | `string` | - | Táblázat fejléc egyedi osztályok |
| `headerStyle` | `React.CSSProperties` | - | Táblázat fejléc egyedi stílusok |
| `className` | `string` | - | Táblázat egyedi osztályok |
| `style` | `React.CSSProperties` | - | Táblázat egyedi stílusok |
| `wrapperClassName` | `string` | - | Táblázat wrapper egyedi osztályok |
| `wrapperStyle` | `React.CSSProperties` | - | Táblázat wrapper egyedi stílusok |

### Egyedi renderelők

| Név | Típus | Alapértelmezett | Leírás |
|-----|-------|----------------|--------|
| `renderHeader` | `(columns: TableColumn<T>[]) => React.ReactNode` | - | Táblázat fejléc egyedi renderelő |
| `renderRow` | `(item: T, index: number) => React.ReactNode` | - | Táblázat sor egyedi renderelő |
| `renderCell` | `(item: T, column: TableColumn<T>, rowIndex: number) => React.ReactNode` | - | Táblázat cella egyedi renderelő |
| `renderFooter` | `() => React.ReactNode` | - | Táblázat lábléc egyedi renderelő |
| `renderToolbar` | `() => React.ReactNode` | - | Táblázat eszköztár egyedi renderelő |
| `renderPagination` | `() => React.ReactNode` | - | Táblázat lapozó egyedi renderelő |
| `renderSearch` | `() => React.ReactNode` | - | Táblázat keresés egyedi renderelő |
| `renderColumnVisibility` | `() => React.ReactNode` | - | Táblázat oszlop láthatóság egyedi renderelő |
| `renderExport` | `() => React.ReactNode` | - | Táblázat exportálás egyedi renderelő |
| `renderLoading` | `() => React.ReactNode` | - | Táblázat betöltés egyedi renderelő |
| `renderError` | `(error: Error) => React.ReactNode` | - | Táblázat hiba egyedi renderelő |
| `renderEmpty` | `() => React.ReactNode` | - | Táblázat üres egyedi renderelő |

### Virtualizáció

| Név | Típus | Alapértelmezett | Leírás |
|-----|-------|----------------|--------|
| `virtualized` | `boolean` | `false` | Virtualizáció engedélyezése |
| `rowHeight` | `number` | `48` | Virtualizált sor magasság |
| `height` | `number` | - | Virtualizált táblázat magasság |
| `width` | `number` | - | Virtualizált táblázat szélesség |
| `overscanCount` | `number` | `3` | Virtualizált táblázat túlcsordulás |

## Oszlop definíciók

```tsx
interface TableColumn<T> {
  key: string;
  header: React.ReactNode;
  renderCell?: (item: T, rowIndex: number) => React.ReactNode;
  width?: string | number;
  minWidth?: string | number;
  maxWidth?: string | number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  className?: string;
  style?: React.CSSProperties;
  cellClassName?: string | ((item: T, rowIndex: number) => string);
  cellStyle?: React.CSSProperties | ((item: T, rowIndex: number) => React.CSSProperties);
  visible?: boolean;
  renderHeader?: (column: TableColumn<T>) => React.ReactNode;
}
```

## Téma testreszabás

```tsx
interface TableTheme {
  backgroundColor?: string;
  textColor?: string;
  headerBackgroundColor?: string;
  headerTextColor?: string;
  oddRowBackgroundColor?: string;
  evenRowBackgroundColor?: string;
  selectedRowBackgroundColor?: string;
  selectedRowTextColor?: string;
  hoverRowBackgroundColor?: string;
  hoverRowTextColor?: string;
  borderColor?: string;
  borderWidth?: string;
  borderRadius?: string;
  boxShadow?: string;
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  lineHeight?: string;
  cellPadding?: string;
}
```

## Szövegek testreszabása

```tsx
interface TableLabels {
  noDataMessage?: string;
  loadingMessage?: string;
  errorMessage?: string;
  sortAscending?: string;
  sortDescending?: string;
  clearSort?: string;
  rowsCountText?: string;
  selectedRowsText?: string;
  pageSizeText?: string;
  previousPageText?: string;
  nextPageText?: string;
  pageText?: string;
  ofText?: string;
  searchPlaceholder?: string;
  filterPlaceholder?: string;
  columnVisibilityTooltip?: string;
  exportTooltip?: string;
}
```

## Ref API

A táblázat komponens egy ref API-t is biztosít, amely lehetővé teszi a táblázat programozott vezérlését:

```tsx
interface TableRef {
  tableElement: HTMLTableElement | null;
  wrapperElement: HTMLDivElement | null;
  headerElement: HTMLTableSectionElement | null;
  bodyElement: HTMLTableSectionElement | null;
  footerElement: HTMLTableSectionElement | null;
  refresh: () => void;
  exportData: (type: 'csv' | 'excel' | 'pdf') => void;
  search: (term: string) => void;
  sort: (column: string, direction: SortDirection) => void;
  goToPage: (page: number) => void;
  setPageSize: (size: number) => void;
  toggleColumnVisibility: (column: string, visible: boolean) => void;
  selectRow: (key: React.Key, selected: boolean) => void;
  selectAllRows: (selected: boolean) => void;
}
```

Használata:

```tsx
import React, { useRef } from 'react';
import { Table, TableRef } from './components/table';

const App = () => {
  const tableRef = useRef<TableRef>(null);
  
  const handleExport = () => {
    if (tableRef.current) {
      tableRef.current.exportData('csv');
    }
  };
  
  return (
    <div>
      <button onClick={handleExport}>Exportálás CSV-be</button>
      <Table
        ref={tableRef}
        data={data}
        columns={columns}
        keyField="id"
      />
    </div>
  );
};
```

## Elérhetőség

A táblázat komponens teljes mértékben támogatja az elérhetőségi funkciókat:

- ARIA attribútumok a táblázat fejlécekhez és interaktív elemekhez
- Billentyűzet navigáció támogatása
- Képernyőolvasó bejelentések
- WCAG 2.1 AA megfelelőség

## Mobil kompatibilitás

A táblázat komponens reszponzív és támogatja a mobil eszközöket:

- Horizontális görgetés széles táblázatokhoz
- Érintés alapú interakciók
- Mobil-first tervezés

## Példák

### Alap táblázat

```tsx
<Table
  data={data}
  columns={columns}
  keyField="id"
/>
```

### Rendezés és lapozás

```tsx
const [sortColumn, setSortColumn] = useState<string | undefined>();
const [sortDirection, setSortDirection] = useState<SortDirection>(null);
const [currentPage, setCurrentPage] = useState(1);
const [pageSize, setPageSize] = useState(10);

const handleSort = (column: string, direction: SortDirection) => {
  setSortColumn(column);
  setSortDirection(direction);
};

const handlePageChange = (page: number) => {
  setCurrentPage(page);
};

const handlePageSizeChange = (size: number) => {
  setPageSize(size);
  setCurrentPage(1);
};

return (
  <Table
    data={data}
    columns={columns}
    keyField="id"
    sortable
    sortColumn={sortColumn}
    sortDirection={sortDirection}
    onSort={handleSort}
    paginated
    currentPage={currentPage}
    pageSize={pageSize}
    totalItems={totalItems}
    onPageChange={handlePageChange}
    onPageSizeChange={handlePageSizeChange}
  />
);
```

### Sor kijelölés

```tsx
const [selectedRows, setSelectedRows] = useState<React.Key[]>([]);

const handleRowSelect = (keys: React.Key[]) => {
  setSelectedRows(keys);
};

return (
  <Table
    data={data}
    columns={columns}
    keyField="id"
    selectable
    selectedRows={selectedRows}
    onRowSelect={handleRowSelect}
  />
);
```

### Egyedi cella renderelés

```tsx
const columns = [
  { key: 'name', header: 'Név' },
  { key: 'status', header: 'Állapot', renderCell: (item) => (
    <span className={`status-badge ${item.status === 'Aktív' ? 'active' : 'inactive'}`}>
      {item.status}
    </span>
  )},
  { key: 'actions', header: 'Műveletek', renderCell: (item) => (
    <div className="actions">
      <button onClick={() => handleEdit(item.id)}>Szerkesztés</button>
      <button onClick={() => handleDelete(item.id)}>Törlés</button>
    </div>
  )},
];

return (
  <Table
    data={data}
    columns={columns}
    keyField="id"
  />
);
```

### Testreszabott téma

```tsx
const darkTheme: TableTheme = {
  backgroundColor: '#1f2937',
  textColor: '#f3f4f6',
  headerBackgroundColor: '#111827',
  headerTextColor: '#f9fafb',
  oddRowBackgroundColor: '#1f2937',
  evenRowBackgroundColor: '#374151',
  selectedRowBackgroundColor: 'rgba(59, 130, 246, 0.2)',
  selectedRowTextColor: '#93c5fd',
  hoverRowBackgroundColor: '#374151',
  hoverRowTextColor: '#f9fafb',
  borderColor: 'rgba(255, 255, 255, 0.1)',
  borderWidth: '1px',
  borderRadius: '0.5rem',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
};

return (
  <Table
    data={data}
    columns={columns}
    keyField="id"
    theme={darkTheme}
  />
);
```

## Licenc

MIT
