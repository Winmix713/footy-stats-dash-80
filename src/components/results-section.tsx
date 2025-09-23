import React from 'react';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, Select, SelectItem, Input } from '@heroui/react';
import { Icon } from '@iconify/react';
import { Match, SortKey, SortDirection } from '../types/match';

interface ResultsSectionProps {
  matches: Match[];
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  sortKey: SortKey;
  sortDirection: SortDirection;
  onSortChange: (key: SortKey) => void;
}

// Add enhanced sort icon rendering
const renderSortIcon = (columnKey: SortKey, currentSortKey: SortKey, currentSortDirection: SortDirection) => {
  if (currentSortKey === columnKey) {
    return currentSortDirection === 'asc' 
      ? <Icon icon="lucide:chevron-up" className="ml-1" width={14} height={14} /> 
      : <Icon icon="lucide:chevron-down" className="ml-1" width={14} height={14} />;
  }
  return <Icon icon="lucide:chevrons-up-down" className="ml-1 opacity-60" width={14} height={14} />;
};

export const ResultsSection: React.FC<ResultsSectionProps> = ({
  matches,
  currentPage,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
  sortKey,
  sortDirection,
  onSortChange
}) => {
  // Calculate pagination with safety checks
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  
  // Add loading state for pagination
  const [isChangingPage, setIsChangingPage] = React.useState(false);
  
  // Calculate start and end indices with safety checks
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  
  // Get current page matches with safety checks
  const currentMatches = React.useMemo(() => {
    if (!matches || !Array.isArray(matches)) return [];
    return matches.slice(startIndex, endIndex);
  }, [matches, startIndex, endIndex]);
  
  // Handle page change with loading state
  const handlePageChange = async (page: number) => {
    if (page < 1 || page > totalPages) return;
    
    setIsChangingPage(true);
    // Add small delay to show loading state
    setTimeout(() => {
      onPageChange(page);
      setIsChangingPage(false);
    }, 300);
  };

  return (
    <section id="results" className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">Listázott eredmények</h2>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300">
            <Icon icon="lucide:table" width={14} height={14} />
            Mérkőzések: {totalItems}
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400">
          <Icon icon="lucide:database" width={16} height={16} />
          <span>Supabase adatbázis</span>
        </div>
      </div>

      {/* Pagination Controls (Top) */}
      {totalItems > 0 && (
        <div className="mb-4 flex items-center justify-between bg-white/5 ring-1 ring-white/10 rounded-lg px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-400">Mérkőzések oldalanként:</span>
            <Select 
              selectedKeys={[itemsPerPage.toString()]}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="bg-white/10 ring-1 ring-white/20 rounded-md text-sm text-zinc-200 border-none"
              size="sm"
              isDisabled={isChangingPage}
            >
              <SelectItem key="25">25</SelectItem>
              <SelectItem key="50">50</SelectItem>
              <SelectItem key="100">100</SelectItem>
              <SelectItem key="200">200</SelectItem>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="flat"
              color="default"
              size="sm"
              isDisabled={currentPage === 1 || isChangingPage}
              onPress={() => handlePageChange(currentPage - 1)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-zinc-200 border border-white/10 rounded-md hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon icon="lucide:chevron-left" width={16} height={16} />
              Előző
            </Button>
            
            {/* Add page number buttons */}
            <div className="hidden sm:flex items-center gap-1">
              {/* First page button */}
              {currentPage > 3 && (
                <Button
                  variant="flat"
                  color="default"
                  size="sm"
                  isDisabled={isChangingPage}
                  onPress={() => handlePageChange(1)}
                  className={`w-9 h-9 p-0 flex items-center justify-center text-sm ${currentPage === 1 ? 'bg-primary-500 text-white' : 'text-zinc-300'}`}
                >
                  1
                </Button>
              )}
              
              {/* Ellipsis if needed */}
              {currentPage > 4 && (
                <span className="text-zinc-500 px-1">...</span>
              )}
              
              {/* Page numbers around current page */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Calculate page numbers to show around current page
                let pageNum;
                if (currentPage <= 3) {
                  // Show first 5 pages
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  // Show last 5 pages
                  pageNum = totalPages - 4 + i;
                } else {
                  // Show 2 before and 2 after current page
                  pageNum = currentPage - 2 + i;
                }
                
                // Only show if page number is valid
                if (pageNum > 0 && pageNum <= totalPages) {
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "solid" : "flat"}
                      color={currentPage === pageNum ? "primary" : "default"}
                      size="sm"
                      isDisabled={isChangingPage}
                      onPress={() => handlePageChange(pageNum)}
                      className={`w-9 h-9 p-0 flex items-center justify-center text-sm`}
                    >
                      {pageNum}
                    </Button>
                  );
                }
                return null;
              }).filter(Boolean)}
              
              {/* Ellipsis if needed */}
              {currentPage < totalPages - 3 && (
                <span className="text-zinc-500 px-1">...</span>
              )}
              
              {/* Last page button */}
              {currentPage < totalPages - 2 && totalPages > 5 && (
                <Button
                  variant="flat"
                  color="default"
                  size="sm"
                  isDisabled={isChangingPage}
                  onPress={() => handlePageChange(totalPages)}
                  className={`w-9 h-9 p-0 flex items-center justify-center text-sm ${currentPage === totalPages ? 'bg-primary-500 text-white' : 'text-zinc-300'}`}
                >
                  {totalPages}
                </Button>
              )}
            </div>
            
            {/* Mobile page indicator */}
            <span className="sm:hidden px-3 py-1.5 text-sm text-zinc-300 bg-white/10 rounded-md">
              {currentPage} / {totalPages}
            </span>
            
            <Button
              variant="flat"
              color="default"
              size="sm"
              isDisabled={currentPage === totalPages || isChangingPage}
              onPress={() => handlePageChange(currentPage + 1)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-zinc-200 border border-white/10 rounded-md hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Következő
              <Icon icon="lucide:chevron-right" width={16} height={16} />
            </Button>
          </div>
        </div>
      )}

      {/* Add loading state for table */}
      {isChangingPage ? (
        <div className="flex items-center justify-center py-20 bg-white/5 rounded-2xl ring-1 ring-white/10">
          <div className="flex flex-col items-center gap-3">
            <span className="inline-flex h-10 w-10 rounded-full border-2 border-white/20 border-t-violet-400 animate-spin"></span>
            <span className="text-sm text-zinc-300">Mérkőzések betöltése...</span>
          </div>
        </div>
      ) : (
        <Table
          aria-label="Mérkőzés eredmények"
          removeWrapper
          className="overflow-hidden rounded-2xl ring-1 ring-white/10 bg-white/5"
          classNames={{
            th: "bg-white/5 text-zinc-300 border-b border-white/10",
            td: "border-b border-white/5",
          }}
        >
          <TableHeader>
            <TableColumn 
              className="cursor-pointer select-none hover:bg-white/5"
              onClick={() => onSortChange('home')}
            >
              <div className="inline-flex items-center gap-1">
                Hazai csapat
                {renderSortIcon('home', sortKey, sortDirection)}
              </div>
            </TableColumn>
            <TableColumn 
              className="cursor-pointer select-none hover:bg-white/5"
              onClick={() => onSortChange('away')}
            >
              <div className="inline-flex items-center gap-1">
                Vendég csapat
                {renderSortIcon('away', sortKey, sortDirection)}
              </div>
            </TableColumn>
            <TableColumn 
              className="cursor-pointer select-none hover:bg-white/5"
              onClick={() => onSortChange('ht')}
            >
              <div className="inline-flex items-center gap-1">
                Félidő eredmény
                {renderSortIcon('ht', sortKey, sortDirection)}
              </div>
            </TableColumn>
            <TableColumn 
              className="cursor-pointer select-none hover:bg-white/5"
              onClick={() => onSortChange('ft')}
            >
              <div className="inline-flex items-center gap-1">
                Végeredmény
                {renderSortIcon('ft', sortKey, sortDirection)}
              </div>
            </TableColumn>
            <TableColumn 
              className="cursor-pointer select-none hover:bg-white/5"
              onClick={() => onSortChange('btts')}
            >
              <div className="inline-flex items-center gap-1">
                Mindkét csapat gólt szerzett
                {renderSortIcon('btts', sortKey, sortDirection)}
              </div>
            </TableColumn>
            <TableColumn 
              className="cursor-pointer select-none hover:bg-white/5"
              onClick={() => onSortChange('comeback')}
            >
              <div className="inline-flex items-center gap-1">
                Fordítás
                {renderSortIcon('comeback', sortKey, sortDirection)}
              </div>
            </TableColumn>
            <TableColumn>
              <div className="inline-flex items-center gap-1">
                Taktikai tábla
              </div>
            </TableColumn>
          </TableHeader>
          <TableBody>
            {currentMatches.map((match) => (
              <TableRow key={match.id} className="hover:bg-white/5 transition-all duration-150 hover:-translate-y-[1px]">
                <TableCell>
                  <div className="flex items-center gap-2">
                    {match.home.logo && (
                      <img 
                        src={match.home.logo} 
                        alt={`${match.home_team} logo`} 
                        className="h-6 w-6 rounded-full ring-1 ring-white/10 object-cover"
                        loading="lazy"
                      />
                    )}
                    <span className="text-zinc-200">{match.home_team}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {match.away.logo && (
                      <img 
                        src={match.away.logo} 
                        alt={`${match.away_team} logo`} 
                        className="h-6 w-6 rounded-full ring-1 ring-white/10 object-cover"
                        loading="lazy"
                      />
                    )}
                    <span className="text-zinc-200">{match.away_team}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="px-2 py-1 rounded bg-white/5 text-zinc-200 font-medium">
                    {match.half_time_home_goals !== null ? match.half_time_home_goals : '-'} - {match.half_time_away_goals !== null ? match.half_time_away_goals : '-'}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs ring-1 
                    ${match.result_computed === 'H' 
                      ? 'bg-emerald-500/10 text-emerald-300 ring-emerald-400/30'
                      : match.result_computed === 'A' 
                      ? 'bg-sky-500/10 text-sky-300 ring-sky-400/30'
                      : 'bg-amber-500/10 text-amber-300 ring-amber-400/30'}`
                  }>
                    <Icon 
                      icon={match.result_computed === 'H' ? 'lucide:circle-dot' : match.result_computed === 'A' ? 'lucide:circle' : 'lucide:minus'} 
                      width={14} 
                      height={14} 
                    />
                    {match.full_time_home_goals} - {match.full_time_away_goals}
                  </span>
                </TableCell>
                <TableCell>
                  {match.btts_computed ? (
                    <span className="inline-flex items-center gap-1 text-emerald-300">
                      <Icon icon="lucide:check" width={16} height={16} />
                      Igen
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-zinc-400">
                      <Icon icon="lucide:x" width={16} height={16} />
                      Nem
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {match.comeback_computed ? (
                    <span className="inline-flex items-center gap-1 text-emerald-300">
                      <Icon icon="lucide:check" width={16} height={16} />
                      Igen
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-zinc-400">
                      <Icon icon="lucide:x" width={16} height={16} />
                      Nem
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="flat"
                    color="primary"
                    onPress={() => {
                      // Scroll to virtual pitch manager and set the selected match
                      document.getElementById('virtual-pitch')?.scrollIntoView({ behavior: 'smooth' });
                      // Note: You would need to implement a way to set the selected match
                    }}
                  >
                    <Icon icon="lucide:layout" width={16} height={16} className="mr-1" />
                    Megnyitás
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Pagination Controls (Bottom) */}
      {totalItems > 0 && (
        <div className="mt-4 flex items-center justify-between bg-white/5 ring-1 ring-white/10 rounded-lg px-4 py-3">
          <div className="flex items-center gap-3 text-sm text-zinc-400">
            <span>Összesen: <span className="font-medium text-zinc-200">{totalItems}</span> mérkőzés</span>
            <span className="hidden sm:inline">|</span>
            <span className="hidden sm:inline">Oldal: <span className="font-medium text-zinc-200">{currentPage}/{totalPages}</span></span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="flat"
              color="default"
              size="sm"
              isDisabled={currentPage === 1 || isChangingPage}
              onPress={() => handlePageChange(currentPage - 1)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-zinc-200 border border-white/10 rounded-md hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon icon="lucide:chevron-left" width={16} height={16} />
              Előző
            </Button>
            
            {/* Add jump to page input for bottom pagination */}
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm text-zinc-400">Ugrás:</span>
              <Input
                type="number"
                min={1}
                max={totalPages}
                value={currentPage.toString()}
                onValueChange={(value) => {
                  const page = parseInt(value);
                  if (!isNaN(page) && page >= 1 && page <= totalPages) {
                    handlePageChange(page);
                  }
                }}
                className="w-16 h-9 text-center"
                size="sm"
                isDisabled={isChangingPage}
              />
            </div>
            
            <Button
              variant="flat"
              color="default"
              size="sm"
              isDisabled={currentPage === totalPages || isChangingPage}
              onPress={() => handlePageChange(currentPage + 1)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-zinc-200 border border-white/10 rounded-md hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Következő
              <Icon icon="lucide:chevron-right" width={16} height={16} />
            </Button>
          </div>
        </div>
      )}
      
      {/* Add performance info */}
      <div className="mt-2 text-xs text-zinc-500 text-right">
        <span>Optimalizált lapozás 9360 mérkőzéshez</span>
      </div>
    </section>
  );
};