import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MatchList } from "@/components/MatchList";
import { StatsDashboard } from "@/components/StatsDashboard";
import { TeamAnalysis } from "@/components/TeamAnalysis";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import { CSVUploader } from "@/components/CSVUploader";
import { apiLogger } from '../utils/apiLogger';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { type ApiResponse } from '@/services/footballApi';

interface DashboardProps {
  data?: ApiResponse;
  isLoading: boolean;
  params: any;
  updateParams: (params: any) => void;
  goToPage: (page: number) => void;
  analyzeTeams: (homeTeam: string, awayTeam: string, leagueId?: string) => void;
  searchTeam: (team: string, leagueId?: string) => void;
  clearFilters: () => void;
  refetch: () => void;
  onBackToLeagues: () => void;
  leagues: Array<{ id: string; display_name: string; }>;
  teams: Array<{ id: string; name: string; }>;
}

export const Dashboard = ({
  data,
  isLoading,
  params,
  updateParams,
  goToPage,
  analyzeTeams,
  searchTeam,
  clearFilters,
  refetch,
  onBackToLeagues,
  leagues,
  teams
}: DashboardProps) => {
  const [activeTab, setActiveTab] = useState("matches");
  const [homeTeam, setHomeTeam] = useState("");
  const [awayTeam, setAwayTeam] = useState("");
  const [searchTeamName, setSearchTeamName] = useState("");
  
  const hasNextPage = data && data.page ? (data.page * (data.page_size || 20)) < data.total_matches : false;

  const selectedLeague = leagues.find(l => l.id === params.league_id);
  const teamNames = teams.map(t => t.name);

  const handleAnalyzeTeams = () => {
    if (homeTeam && awayTeam) {
      analyzeTeams(homeTeam, awayTeam, params.league_id);
    }
  };

  const handleSearchTeam = () => {
    if (searchTeamName) {
      searchTeam(searchTeamName, params.league_id);
    }
  };

  const handleCSVUploadComplete = () => {
    refetch();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Back Button */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={onBackToLeagues}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Vissza a Bajnokságokhoz
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-primary">
                  {selectedLeague?.display_name || 'Futball Analitika'}
                </h1>
                <p className="text-muted-foreground">
                  Részletes meccs elemzések és statisztikák
                </p>
              </div>
            </div>
          <div className="flex gap-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto p-4 md:p-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="matches">Meccsek</TabsTrigger>
            <TabsTrigger value="upload">CSV Feltöltés</TabsTrigger>
            <TabsTrigger value="analysis">Elemzés</TabsTrigger>
            <TabsTrigger value="stats">Statisztikák</TabsTrigger>
            <TabsTrigger value="logs">API Logok</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <div className="grid gap-6">
              {selectedLeague && (
                <CSVUploader
                  leagueId={params.league_id}
                  leagueName={selectedLeague.display_name}
                  onUploadComplete={handleCSVUploadComplete}
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="matches" className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-semibold">Csapat Elemzés</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Hazai Csapat</label>
                    <select 
                      value={homeTeam} 
                      onChange={(e) => setHomeTeam(e.target.value)}
                      className="w-full p-2 border border-border rounded bg-background"
                    >
                      <option value="">Válasszon csapatot</option>
                      {teamNames.map((team) => (
                        <option key={team} value={team}>{team}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Vendég Csapat</label>
                    <select 
                      value={awayTeam} 
                      onChange={(e) => setAwayTeam(e.target.value)}
                      className="w-full p-2 border border-border rounded bg-background"
                    >
                      <option value="">Válasszon csapatot</option>
                      {teamNames.map((team) => (
                        <option key={team} value={team}>{team}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <Button onClick={handleAnalyzeTeams} disabled={!homeTeam || !awayTeam || isLoading}>
                  Csapatok Elemzése
                </Button>

                <div className="pt-4 border-t border-border">
                  <h3 className="text-lg font-semibold mb-4">Csapat Keresés</h3>
                  <div className="flex gap-2">
                    <select 
                      value={searchTeamName} 
                      onChange={(e) => setSearchTeamName(e.target.value)}
                      className="flex-1 p-2 border border-border rounded bg-background"
                    >
                      <option value="">Válasszon csapatot</option>
                      {teamNames.map((team) => (
                        <option key={team} value={team}>{team}</option>
                      ))}
                    </select>
                    <Button onClick={handleSearchTeam} disabled={!searchTeamName || isLoading}>
                      Keresés
                    </Button>
                    <Button onClick={clearFilters} variant="outline">
                      Törlés
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {data && (
              <>
                <MatchList 
                  data={data}
                  isLoading={isLoading} 
                />
                
                {data.total_matches > (data.page_size || 20) && (
                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      onClick={() => goToPage((data.page || 1) + 1)}
                      disabled={isLoading || !hasNextPage}
                      className="flex items-center gap-2"
                    >
                      <ChevronRight className="w-4 h-4" />
                      További Meccsek Betöltése
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            <TeamAnalysis data={data || { matches: [], total_matches: 0, page: 1, page_size: 20, teams: [] }} />
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            {data && <StatsDashboard data={data} />}
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardContent>
                <div className="flex flex-col space-y-4">
                  <h2 className="text-2xl font-bold">API Logok</h2>
                  <Button onClick={refetch}>Frissítés</Button>
                  <Button onClick={() => apiLogger.info('Test log', { test: 'test' }, 'dashboard')}>Teszt Log</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};
