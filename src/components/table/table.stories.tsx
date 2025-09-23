import React from 'react';
import { Table } from './table';
import { TableRef } from './table.types';

export default {
  title: 'Components/Table',
  component: Table,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Fejlett táblázat komponens adatok megjelenítéséhez, rendezéséhez, szűréséhez és lapozásához.',
      },
    },
  },
  argTypes: {
    data: {
      control: 'object',
      description: 'Táblázat adatok',
    },
    columns: {
      control: 'object',
      description: 'Oszlop definíciók',
    },
    keyField: {
      control: 'text',
      description: 'Egyedi kulcs mező az adatokban',
    },
    isLoading: {
      control: 'boolean',
      description: 'Betöltés állapot',
    },
    error: {
      control: 'object',
      description: 'Hiba állapot',
    },
    size: {
      control: { type: 'select', options: ['sm', 'md', 'lg'] },
      description: 'Táblázat mérete',
    },
    striped: {
      control: 'boolean',
      description: 'Csíkozott sorok',
    },
    bordered: {
      control: 'boolean',
      description: 'Keret megjelenítése',
    },
    compact: {
      control: 'boolean',
      description: 'Kompakt megjelenés',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Teljes szélesség',
    },
    stickyHeader: {
      control: 'boolean',
      description: 'Fejléc rögzítése',
    },
    hideHeader: {
      control: 'boolean',
      description: 'Fejléc elrejtése',
    },
    removeWrapper: {
      control: 'boolean',
      description: 'Táblázat wrapper eltávolítása',
    },
    selectable: {
      control: 'boolean',
      description: 'Sor kijelölés engedélyezése',
    },
    sortable: {
      control: 'boolean',
      description: 'Rendezés engedélyezése',
    },
    paginated: {
      control: 'boolean',
      description: 'Lapozás engedélyezése',
    },
    searchable: {
      control: 'boolean',
      description: 'Keresés engedélyezése',
    },
    columnVisibility: {
      control: 'boolean',
      description: 'Oszlop láthatóság vezérlés engedélyezése',
    },
    exportable: {
      control: 'boolean',
      description: 'Exportálás engedélyezése',
    },
  },
};

// Teszt adatok
const users = [
  { id: 1, name: 'Teszt Elek', email: 'teszt.elek@example.com', role: 'Admin', status: 'Aktív', lastLogin: new Date('2023-01-15T10:30:00') },
  { id: 2, name: 'Gipsz Jakab', email: 'gipsz.jakab@example.com', role: 'Felhasználó', status: 'Aktív', lastLogin: new Date('2023-01-10T14:20:00') },
  { id: 3, name: 'Kovács Anna', email: 'kovacs.anna@example.com', role: 'Szerkesztő', status: 'Inaktív', lastLogin: new Date('2022-12-05T09:15:00') },
  { id: 4, name: 'Nagy Béla', email: 'nagy.bela@example.com', role: 'Felhasználó', status: 'Aktív', lastLogin: new Date('2023-01-18T16:45:00') },
  { id: 5, name: 'Szabó Katalin', email: 'szabo.katalin@example.com', role: 'Szerkesztő', status: 'Aktív', lastLogin: new Date('2023-01-05T11:10:00') },
];

const columns = [
  { key: 'name', header: 'Név', sortable: true },
  { key: 'email', header: 'E-mail cím' },
  { key: 'role', header: 'Szerepkör', sortable: true },
  { key: 'status', header: 'Állapot', sortable: true, renderCell: (item) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      item.status === 'Aktív' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }`}>
      {item.status}
    </span>
  )},
  { key: 'lastLogin', header: 'Utolsó belépés', sortable: true, renderCell: (item) => (
    <span>{item.lastLogin.toLocaleDateString('hu-HU')}</span>
  )},
];

// Alap példa
export const Basic = {
  args: {
    data: users,
    columns: columns,
    keyField: 'id',
  },
};

// Betöltés állapot
export const Loading = {
  args: {
    data: [],
    columns: columns,
    keyField: 'id',
    isLoading: true,
  },
};

// Hiba állapot
export const ErrorState = {
  args: {
    data: [],
    columns: columns,
    keyField: 'id',
    error: new Error('Hiba történt az adatok betöltése közben'),
  },
};

// Üres állapot
export const Empty = {
  args: {
    data: [],
    columns: columns,
    keyField: 'id',
  },
};

// Csíkozott sorok
export const Striped = {
  args: {
    data: users,
    columns: columns,
    keyField: 'id',
    striped: true,
  },
};

// Keretezett
export const Bordered = {
  args: {
    data: users,
    columns: columns,
    keyField: 'id',
    bordered: true,
  },
};

// Kompakt
export const Compact = {
  args: {
    data: users,
    columns: columns,
    keyField: 'id',
    compact: true,
    size: 'sm',
  },
};

// Rögzített fejléc
export const StickyHeader = {
  args: {
    data: [...users, ...users, ...users, ...users], // Több sor a görgetéshez
    columns: columns,
    keyField: 'id',
    stickyHeader: true,
    style: { maxHeight: '300px', overflow: 'auto' },
  },
};

// Kijelölhető sorok
export const Selectable = {
  args: {
    data: users,
    columns: columns,
    keyField: 'id',
    selectable: true,
  },
};

// Rendezhető
export const Sortable = {
  args: {
    data: users,
    columns: columns,
    keyField: 'id',
    sortable: true,
  },
};

// Lapozható
export const Paginated = {
  args: {
    data: users,
    columns: columns,
    keyField: 'id',
    paginated: true,
    currentPage: 1,
    pageSize: 3,
    totalItems: users.length,
  },
};

// Kereshető
export const Searchable = {
  args: {
    data: users,
    columns: columns,
    keyField: 'id',
    searchable: true,
  },
};

// Oszlop láthatóság
export const ColumnVisibility = {
  args: {
    data: users,
    columns: columns,
    keyField: 'id',
    columnVisibility: true,
  },
};

// Exportálható
export const Exportable = {
  args: {
    data: users,
    columns: columns,
    keyField: 'id',
    exportable: true,
  },
};

// Teljes funkcionalitás
export const FullFeatured = {
  args: {
    data: users,
    columns: columns,
    keyField: 'id',
    striped: true,
    bordered: true,
    selectable: true,
    sortable: true,
    paginated: true,
    searchable: true,
    columnVisibility: true,
    exportable: true,
    currentPage: 1,
    pageSize: 3,
    totalItems: users.length,
  },
};

// Egyedi téma
export const CustomTheme = {
  args: {
    data: users,
    columns: columns,
    keyField: 'id',
    theme: {
      backgroundColor: '#f8f9fa',
      textColor: '#212529',
      headerBackgroundColor: '#e9ecef',
      headerTextColor: '#343a40',
      oddRowBackgroundColor: '#ffffff',
      evenRowBackgroundColor: '#f2f2f2',
      selectedRowBackgroundColor: '#e6f7ff',
      selectedRowTextColor: '#0958d9',
      hoverRowBackgroundColor: '#f5f5f5',
      hoverRowTextColor: '#212529',
      borderColor: '#dee2e6',
      borderWidth: '1px',
      borderRadius: '0.5rem',
      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
    },
  },
};

// Egyedi címkék
export const CustomLabels = {
  args: {
    data: users,
    columns: columns,
    keyField: 'id',
    paginated: true,
    searchable: true,
    labels: {
      noDataMessage: 'Nincsenek adatok',
      loadingMessage: 'Betöltés folyamatban...',
      errorMessage: 'Hiba történt',
      sortAscending: 'Rendezés növekvő sorrendben',
      sortDescending: 'Rendezés csökkenő sorrendben',
      clearSort: 'Rendezés törlése',
      rowsCountText: 'Összes: {count}',
      selectedRowsText: 'Kijelölve: {count}',
      pageSizeText: 'Oldalméret:',
      previousPageText: 'Előző',
      nextPageText: 'Következő',
      pageText: 'Oldal:',
      ofText: '/',
      searchPlaceholder: 'Keresés a táblázatban...',
    },
  },
};

// Ref API használata
export const WithRefAPI = () => {
  const tableRef = React.useRef<TableRef>(null);
  
  const handleRefAction = (action: string) => {
    if (!tableRef.current) return;
    
    switch (action) {
      case 'refresh':
        tableRef.current.refresh();
        break;
      case 'export':
        tableRef.current.exportData('csv');
        break;
      case 'search':
        tableRef.current.search('Teszt');
        break;
      case 'sort':
        tableRef.current.sort('name', 'asc');
        break;
      case 'page':
        tableRef.current.goToPage(2);
        break;
      case 'pageSize':
        tableRef.current.setPageSize(5);
        break;
      case 'selectAll':
        tableRef.current.selectAllRows(true);
        break;
      case 'unselectAll':
        tableRef.current.selectAllRows(false);
        break;
    }
  };
  
  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        <button 
          onClick={() => handleRefAction('refresh')}
          className="px-3 py-1 bg-blue-500 text-white rounded"
        >
          Frissítés
        </button>
        <button 
          onClick={() => handleRefAction('export')}
          className="px-3 py-1 bg-green-500 text-white rounded"
        >
          Exportálás (CSV)
        </button>
        <button 
          onClick={() => handleRefAction('search')}
          className="px-3 py-1 bg-purple-500 text-white rounded"
        >
          Keresés: "Teszt"
        </button>
        <button 
          onClick={() => handleRefAction('sort')}
          className="px-3 py-1 bg-yellow-500 text-white rounded"
        >
          Rendezés: Név (növekvő)
        </button>
        <button 
          onClick={() => handleRefAction('page')}
          className="px-3 py-1 bg-red-500 text-white rounded"
        >
          Ugrás a 2. oldalra
        </button>
        <button 
          onClick={() => handleRefAction('selectAll')}
          className="px-3 py-1 bg-indigo-500 text-white rounded"
        >
          Összes kijelölése
        </button>
        <button 
          onClick={() => handleRefAction('unselectAll')}
          className="px-3 py-1 bg-pink-500 text-white rounded"
        >
          Kijelölések törlése
        </button>
      </div>
      
      <Table
        ref={tableRef}
        data={users}
        columns={columns}
        keyField="id"
        striped={true}
        bordered={true}
        selectable={true}
        sortable={true}
        paginated={true}
        searchable={true}
        columnVisibility={true}
        exportable={true}
        currentPage={1}
        pageSize={3}
        totalItems={users.length}
      />
    </div>
  );
};

// Mobil reszponzív
export const MobileResponsive = {
  args: {
    data: users,
    columns: columns,
    keyField: 'id',
    paginated: true,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

// Sötét téma
export const DarkTheme = {
  args: {
    data: users,
    columns: columns,
    keyField: 'id',
    striped: true,
    bordered: true,
    selectable: true,
    sortable: true,
    paginated: true,
    searchable: true,
    theme: {
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
    },
  },
  parameters: {
    backgrounds: {
      default: 'dark',
    },
  },
};
