
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseService, type League } from '../services/supabaseService';
import { apiLogger } from '../utils/apiLogger';
import { useToast } from '../components/ui/use-toast';
import { type ApiResponse } from '../services/footballApi';

export interface SupabaseDataParams {
  league_id?: string;
  team?: string;
  home_team?: string;
  away_team?: string;
  date?: string;
  page?: number;
  page_size?: number;
}

export const useSupabaseData = (initialParams: SupabaseDataParams = {}) => {
  const [params, setParams] = useState<SupabaseDataParams>({
    page: 1,
    page_size: 20,
    ...initialParams
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get leagues query
  const {
    data: leagues,
    isLoading: leaguesLoading
  } = useQuery({
    queryKey: ['leagues'],
    queryFn: () => supabaseService.getLeagues(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Main data fetching query
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['supabaseMatches', params],
    queryFn: async () => {
      apiLogger.info('Fetching matches from Supabase', { params }, 'supabase-hook');
      return supabaseService.getMatches(params);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      if (error?.message?.includes('validation failed')) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Teams query for selected league
  const {
    data: teams,
    isLoading: teamsLoading
  } = useQuery({
    queryKey: ['teams', params.league_id],
    queryFn: () => params.league_id ? supabaseService.getTeamsByLeague(params.league_id) : Promise.resolve([]),
    enabled: !!params.league_id,
    staleTime: 10 * 60 * 1000,
  });

  const updateParams = useCallback((newParams: Partial<SupabaseDataParams>) => {
    const updatedParams = { 
      ...params, 
      ...newParams,
      ...(newParams.page === undefined ? { page: 1 } : {})
    };
    setParams(updatedParams);
  }, [params]);

  const goToPage = useCallback((page: number) => {
    const updatedParams = { ...params, page };
    setParams(updatedParams);
  }, [params]);

  const analyzeTeams = useCallback((homeTeam: string, awayTeam: string, leagueId?: string) => {
    if (!homeTeam || !awayTeam) {
      toast({
        title: "Hiányzó Csapatok",
        description: "Kérjük válasszon ki mind a hazai, mind a vendég csapatot",
        variant: "destructive",
      });
      return;
    }
    
    updateParams({ 
      home_team: homeTeam, 
      away_team: awayTeam,
      team: undefined,
      league_id: leagueId || params.league_id
    });
  }, [updateParams, toast, params.league_id]);

  const searchTeam = useCallback((team: string, leagueId?: string) => {
    if (!team) {
      toast({
        title: "Hiányzó Csapat",
        description: "Kérjük adjon meg egy csapatnevet",
        variant: "destructive",
      });
      return;
    }
    
    updateParams({ 
      team, 
      home_team: undefined, 
      away_team: undefined,
      league_id: leagueId || params.league_id
    });
  }, [updateParams, toast, params.league_id]);

  const selectLeague = useCallback((leagueId: string) => {
    updateParams({
      league_id: leagueId,
      team: undefined,
      home_team: undefined,
      away_team: undefined
    });
  }, [updateParams]);

  const clearFilters = useCallback(() => {
    const clearedParams = {
      page: 1,
      page_size: 20,
      league_id: params.league_id // Keep league selection
    };
    setParams(clearedParams);
  }, [params.league_id]);

  return {
    data,
    leagues,
    teams,
    isLoading: isLoading || leaguesLoading,
    teamsLoading,
    error,
    params,
    updateParams,
    goToPage,
    analyzeTeams,
    searchTeam,
    selectLeague,
    clearFilters,
    refetch
  };
};

export type UseSupabaseDataReturn = ReturnType<typeof useSupabaseData>;
