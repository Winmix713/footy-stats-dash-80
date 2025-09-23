
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { footballApi, type ApiResponse } from '../services/footballApi';
import { apiLogger } from '../utils/apiLogger';
import { useToast } from '../components/ui/use-toast';

export interface FootballDataParams {
  team?: string;
  home_team?: string;
  away_team?: string;
  date?: string;
  both_teams_scored?: boolean;
  score_home?: number;
  score_away?: number;
  page?: number;
  page_size?: number;
}

export const useFootballData = (initialParams: FootballDataParams = {}) => {
  const [params, setParams] = useState<FootballDataParams>({
    page: 1,
    page_size: 20,
    ...initialParams
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Main data fetching query
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['footballData', params],
    queryFn: async () => {
      const stringParams = Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>);

      return footballApi.fetchData(stringParams);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: (failureCount, error) => {
      // Don't retry validation errors
      if (error?.message?.includes('validation failed')) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Mutation for manual data updates
  const updateDataMutation = useMutation({
    mutationFn: async (newParams: FootballDataParams) => {
      const stringParams = Object.entries(newParams).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>);

      return footballApi.fetchData(stringParams);
    },
    onSuccess: (data, variables) => {
      // Update cache with new data
      queryClient.setQueryData(['footballData', variables], data);
      setParams(variables);
      
      apiLogger.info('Football data updated successfully', { 
        params: variables,
        matchCount: data.matches.length,
        totalMatches: data.total_matches
      }, 'hook');
    },
    onError: (error) => {
      apiLogger.error('Failed to update football data', error, 'hook');
      toast({
        title: "Hiba",
        description: "Nem sikerült frissíteni az adatokat",
        variant: "destructive",
      });
    }
  });

  const updateParams = useCallback((newParams: Partial<FootballDataParams>) => {
    // Reset to page 1 when filters change (except for page changes)
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

  const analyzeTeams = useCallback((homeTeam: string, awayTeam: string) => {
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
      team: undefined
    });
  }, [updateParams, toast]);

  const searchTeam = useCallback((team: string) => {
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
      away_team: undefined 
    });
  }, [updateParams, toast]);

  const clearFilters = useCallback(() => {
    const clearedParams = {
      page: 1,
      page_size: 20
    };
    setParams(clearedParams);
  }, []);

  return {
    data,
    isLoading: isLoading || updateDataMutation.isPending,
    error,
    params,
    updateParams,
    goToPage,
    analyzeTeams,
    searchTeam,
    clearFilters,
    refetch,
    isUpdating: updateDataMutation.isPending
  };
};

export type UseFootballDataReturn = ReturnType<typeof useFootballData>;
