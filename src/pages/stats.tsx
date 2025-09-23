import React from 'react';
import { StatsSection } from '../components/stats-section';
import { ExtendedStatsModal } from '../components/extended-stats-modal';
import { useMatchData } from '../hooks/use-match-data';

const StatsPage: React.FC = () => {
  const {
    stats,
    selectedHomeTeam,
    selectedAwayTeam,
    isExtendedStatsModalOpen,
    setIsExtendedStatsModalOpen
  } = useMatchData();

  return (
    <div className="page-content">
      <div className="text-center space-y-3 mb-10">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white">
          Statisztikák
        </h1>
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-zinc-300">
          Elemezd a mérkőzések eredményeit, góleloszlását és egyéb statisztikai mutatókat.
        </p>
      </div>
      
      <StatsSection 
        stats={stats}
        onExtendedStatsClick={() => setIsExtendedStatsModalOpen(true)}
      />
      
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

export default StatsPage;