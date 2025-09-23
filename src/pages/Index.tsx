
import { useState } from 'react';
import { Dashboard } from "@/components/Dashboard";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { LeagueSelector } from "@/components/LeagueSelector";

const Index = () => {
  const [showLeagueSelector, setShowLeagueSelector] = useState(true);
  const {
    data,
    leagues,
    teams,
    isLoading,
    params,
    updateParams,
    goToPage,
    analyzeTeams,
    searchTeam,
    selectLeague,
    clearFilters,
    refetch
  } = useSupabaseData();

  const handleLeagueSelect = (leagueId: string) => {
    selectLeague(leagueId);
    setShowLeagueSelector(false);
  };

  const handleBackToLeagues = () => {
    setShowLeagueSelector(true);
  };

  if (showLeagueSelector) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto p-4 md:p-8">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-primary mb-2">
              Futball Analitika Rendszer
            </h1>
            <p className="text-muted-foreground text-lg">
              Válassz egy bajnokságot a részletes elemzésekért
            </p>
          </div>
          
          <LeagueSelector
            leagues={leagues || []}
            selectedLeagueId={params.league_id}
            onSelectLeague={handleLeagueSelect}
            isLoading={isLoading}
          />
        </main>
      </div>
    );
  }

  return (
    <Dashboard
      data={data}
      isLoading={isLoading}
      params={params}
      updateParams={updateParams}
      goToPage={goToPage}
      analyzeTeams={analyzeTeams}
      searchTeam={searchTeam}
      clearFilters={clearFilters}
      refetch={refetch}
      onBackToLeagues={handleBackToLeagues}
      leagues={leagues || []}
      teams={teams || []}
    />
  );
};

export default Index;
