import React from 'react';
import { ResultsSection } from '../components/results-section';
import { VirtualPitchManager } from '../components/virtual-pitch-manager';
import { useMatchData } from '../hooks/use-match-data';

const ResultsPage: React.FC = () => {
  const {
    filteredMatches,
    currentPage,
    itemsPerPage,
    setCurrentPage,
    setItemsPerPage,
    sortKey,
    sortDirection,
    setSortKey,
    setSortDirection
  } = useMatchData();

  // Scroll to virtual pitch manager if hash is present
  React.useEffect(() => {
    if (window.location.hash === '#virtual-pitch') {
      setTimeout(() => {
        document.getElementById('virtual-pitch')?.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    }
  }, []);

  return (
    <div className="page-content">
      <div className="text-center space-y-3 mb-10">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white">
          Eredmények
        </h1>
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-zinc-300">
          Böngészd a mérkőzések eredményeit, rendezd és szűrd őket különböző szempontok szerint.
        </p>
      </div>
      
      <ResultsSection 
        matches={filteredMatches}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        totalItems={filteredMatches.length}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSortChange={(key) => {
          if (sortKey === key) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
          } else {
            setSortKey(key);
            setSortDirection('asc');
          }
        }}
      />
      
      <VirtualPitchManager 
        match={filteredMatches.length > 0 ? filteredMatches[0] : undefined} 
      />
    </div>
  );
};

export default ResultsPage;