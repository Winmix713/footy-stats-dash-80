import { createClient } from '@supabase/supabase-js';
import { Match } from '../types/match';

// Simple Supabase client setup (will be null if not configured)
export const supabase = null; // Set to null for now since we don't have Supabase configured

export interface MatchFilters {
  home_team?: string;
  away_team?: string;
  btts?: boolean;
  comeback?: boolean;
  startDate?: string;
  endDate?: string;
  league?: string;
  country?: string;
  season?: string;
  minHomeGoals?: number;
  maxHomeGoals?: number;
  minAwayGoals?: number;
  maxAwayGoals?: number;
  result?: string;
}

// Mock function for now
export const fetchMatches = async (
  filters: MatchFilters = {},
  page: number = 1,
  pageSize: number = 10,
  sortKey: string = 'match_time',
  sortDirection: 'asc' | 'desc' = 'desc'
): Promise<{ data: any[], count: number }> => {
  // Return empty result since we don't have Supabase configured
  return { data: [], count: 0 };
};

export const transformSupabaseMatch = (supabaseMatch: any): Match => {
  return {
    id: supabaseMatch.id || Math.random().toString(),
    date: supabaseMatch.match_time || new Date().toISOString(),
    home: {
      id: supabaseMatch.home_team_id || 'home',
      name: supabaseMatch.home_team || 'Home Team',
      logo: ''
    },
    away: {
      id: supabaseMatch.away_team_id || 'away', 
      name: supabaseMatch.away_team || 'Away Team',
      logo: ''
    },
    htScore: {
      home: supabaseMatch.half_time_home_goals || 0,
      away: supabaseMatch.half_time_away_goals || 0
    },
    ftScore: {
      home: supabaseMatch.full_time_home_goals || 0,
      away: supabaseMatch.full_time_away_goals || 0
    },
    btts: supabaseMatch.btts_computed || false,
    comeback: supabaseMatch.comeback_computed || false,
    league: supabaseMatch.league,
    country: supabaseMatch.country,
    season: supabaseMatch.season,
    match_status: supabaseMatch.match_status,
    result_computed: supabaseMatch.result_computed,
    // Include original fields for compatibility
    home_team: supabaseMatch.home_team,
    away_team: supabaseMatch.away_team,
    home_team_id: supabaseMatch.home_team_id,
    away_team_id: supabaseMatch.away_team_id,
    half_time_home_goals: supabaseMatch.half_time_home_goals,
    half_time_away_goals: supabaseMatch.half_time_away_goals,
    full_time_home_goals: supabaseMatch.full_time_home_goals,
    full_time_away_goals: supabaseMatch.full_time_away_goals,
    btts_computed: supabaseMatch.btts_computed,
    comeback_computed: supabaseMatch.comeback_computed
  };
};