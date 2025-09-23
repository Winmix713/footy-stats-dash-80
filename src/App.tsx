import React from 'react';
// Remove BrowserRouter import since we're now using it in main.tsx
import { Routes, Route } from 'react-router-dom';
import { Header } from './components/header';
import { Footer } from './components/footer';
import { BackgroundEffects } from './components/background-effects';
import { LoadingOverlay } from './components/loading-overlay';
import { MobileNav } from './components/mobile-nav';
import { FilterSection } from './components/filter-section';
import { StatsSection } from './components/stats-section';
import { ResultsSection } from './components/results-section';
import { ExtendedStatsModal } from './components/extended-stats-modal';
import { useMatchData } from './hooks/use-match-data';

// Import page components
import HomePage from './pages/home';
import TeamsPage from './pages/teams';
import StatsPage from './pages/stats';
import ResultsPage from './pages/results';

const App: React.FC = () => {
  const {
    isLoading,
    matches,
    filteredMatches,
    homeTeams,
    awayTeams,
    selectedHomeTeam,
    selectedAwayTeam,
    selectedBTTS,
    selectedComeback,
    setSelectedHomeTeam,
    setSelectedAwayTeam,
    setSelectedBTTS,
    setSelectedComeback,
    applyFilters,
    resetFilters,
    exportToCSV,
    stats,
    currentPage,
    itemsPerPage,
    setCurrentPage,
    setItemsPerPage,
    sortKey,
    sortDirection,
    setSortKey,
    setSortDirection,
    isExtendedStatsModalOpen,
    setIsExtendedStatsModalOpen,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
  } = useMatchData();

  return (
    // Remove Router wrapper since it's now in main.tsx
    <div className="min-h-screen bg-background text-foreground">
      <BackgroundEffects />
      <LoadingOverlay isLoading={isLoading} />
      
      <Header />
      
      <main className="relative z-10">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/teams" element={<TeamsPage matches={matches} />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/results" element={<ResultsPage />} />
        </Routes>
      </main>
      
      <Footer />
      
      {/* Mobile navigation */}
      <MobileNav />
      
      <ExtendedStatsModal 
        isOpen={isExtendedStatsModalOpen}
        onClose={() => setIsExtendedStatsModalOpen(false)}
        selectedHomeTeam={selectedHomeTeam}
        selectedAwayTeam={selectedAwayTeam}
        stats={stats}
      />
    </div>
  );
};

export default App;