export { supabase } from '@/integrations/supabase/client'
import type { Database } from '@/integrations/supabase/types'
import { createClient } from '@supabase/supabase-js';
export type Match = Database['public']['Tables']['matches']['Row']

export type MatchFilters = {
  home_team?: string
  away_team?: string
  btts_computed?: boolean
  comeback_computed?: boolean
  result_computed?: string
  date_from?: string
  date_to?: string
}

export type MatchStats = {
  total_matches: number
  home_wins: number
  draws: number
  away_wins: number
  btts_count: number
  comeback_count: number
  avg_goals: number
  home_win_percentage: number
  draw_percentage: number
  away_win_percentage: number
  btts_percentage: number
  comeback_percentage: number
}

export type DetailedMatchStats = {
  basic: MatchStats
  goalStats: {
    home_goals_total: number
    away_goals_total: number
    home_goals_per_match: number
    away_goals_per_match: number
    home_clean_sheets: number
    away_clean_sheets: number
    home_clean_sheet_percentage: number
    away_clean_sheet_percentage: number
  }
  overUnder: {
    over_25_count: number
    under_25_count: number
    over_25_percentage: number
    under_25_percentage: number
    over_35_count: number
    over_35_percentage: number
  }
  frequentResults: {
    result: string
    count: number
    percentage: number
  }[]
  halfTimeAnalysis: {
    ht_home_leads: number
    ht_away_leads: number
    ht_draws: number
    ht_home_lead_to_win: number
    ht_home_lead_to_draw: number
    ht_home_lead_to_loss: number
    ht_away_lead_to_win: number
    ht_away_lead_to_draw: number
    ht_away_lead_to_loss: number
    home_lead_hold_percentage: number
    away_lead_hold_percentage: number
  }
}

// Helper function to fetch matches with pagination and filters
export const fetchMatches = async (
  filters: MatchFilters = {},
  page: number = 1,
  pageSize: number = 50,
  sortKey: string = 'match_time',
  sortDirection: 'asc' | 'desc' = 'desc'
): Promise<{ data: Match[], count: number, error: Error | null }> => {
  try {
    console.log('Fetching matches with filters:', filters);
    console.log('Pagination:', { page, pageSize });
    console.log('Sorting:', { sortKey, sortDirection });
    
    // Build the query
    let query = supabase
      .from('matches')
      .select('*', { count: 'exact' });
    
    // Apply filters
    if (filters.homeTeam) {
      query = query.eq('home_team_id', filters.homeTeam);
    }
    
    if (filters.awayTeam) {
      query = query.eq('away_team_id', filters.awayTeam);
    }
    
    if (filters.btts !== undefined) {
      query = query.eq('btts_computed', filters.btts);
    }
    
    if (filters.comeback !== undefined) {
      query = query.eq('comeback_computed', filters.comeback);
    }
    
    if (filters.startDate) {
      query = query.gte('match_time', filters.startDate);
    }
    
    if (filters.endDate) {
      query = query.lte('match_time', filters.endDate);
    }
    
    if (filters.league) {
      query = query.eq('league', filters.league);
    }
    
    if (filters.country) {
      query = query.eq('country', filters.country);
    }
    
    if (filters.season) {
      query = query.eq('season', filters.season);
    }
    
    if (filters.minHomeGoals !== undefined) {
      query = query.gte('full_time_home_goals', filters.minHomeGoals);
    }
    
    if (filters.maxHomeGoals !== undefined) {
      query = query.lte('full_time_home_goals', filters.maxHomeGoals);
    }
    
    if (filters.minAwayGoals !== undefined) {
      query = query.gte('full_time_away_goals', filters.minAwayGoals);
    }
    
    if (filters.maxAwayGoals !== undefined) {
      query = query.lte('full_time_away_goals', filters.maxAwayGoals);
    }
    
    if (filters.result) {
      query = query.eq('result_computed', filters.result);
    }
    
    // Apply sorting
    query = query.order(sortKey, { ascending: sortDirection === 'asc' });
    
    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);
    
    // Execute the query
    const { data, error, count } = await query;
    
    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }
    
    if (!data) {
      console.warn('No data returned from Supabase');
      return { data: [], count: 0, error: null };
    }
    
    console.log(`Fetched ${data.length} matches from Supabase`);
    
    // Transform data to match our Match interface
    const transformedMatches = await transformMatchData(data);
    
    return {
      data: transformedMatches,
      count: count || 0,
      error: null
    };
  } catch (error) {
    console.error('Error fetching matches:', error);
    return {
      data: [],
      count: 0,
      error: error instanceof Error ? error : new Error('Unknown error fetching matches')
    };
  }
};

// Add a helper function to transform match data and fetch teams
async function transformMatchData(matchesData: any[]): Promise<Match[]> {
  try {
    // Extract team IDs
    const teamIds = new Set<string>();
    matchesData.forEach(match => {
      if (match.home_team_id) teamIds.add(match.home_team_id);
      if (match.away_team_id) teamIds.add(match.away_team_id);
    });
    
    const teamIdsArray = Array.from(teamIds);
    let teamsData: Record<string, any> = {};
    
    if (teamIdsArray.length > 0) {
      // Fetch teams in batches to avoid query size limitations
      const BATCH_SIZE = 30;
      for (let i = 0; i < teamIdsArray.length; i += BATCH_SIZE) {
        const batchIds = teamIdsArray.slice(i, i + BATCH_SIZE);
        const { data: teamsResult, error: teamsError } = await supabase
          .from('teams')
          .select('*')
          .in('id', batchIds);
        
        if (teamsError) {
          console.error('Supabase teams query error:', teamsError);
          continue; // Continue with partial data
        }
        
        if (teamsResult) {
          teamsResult.forEach(team => {
            teamsData[team.id] = team;
          });
        }
      }
    }
    
    // Transform data to match our Match interface
    return matchesData.map(record => {
      // Get team data from our fetched teams
      const homeTeam = record.home_team_id ? teamsData[record.home_team_id] || {} : {};
      const awayTeam = record.away_team_id ? teamsData[record.away_team_id] || {} : {};
      
      return {
        id: record.id || `temp-${Date.now()}-${Math.random()}`,
        date: record.match_time || new Date().toISOString(),
        home: {
          id: homeTeam.id || record.home_team_id || 'unknown',
          name: homeTeam.name || record.home_team || 'Unknown Team',
          logo: homeTeam.logo || undefined
        },
        away: {
          id: awayTeam.id || record.away_team_id || 'unknown',
          name: awayTeam.name || record.away_team || 'Unknown Team',
          logo: awayTeam.logo || undefined
        },
        htScore: {
          home: record.half_time_home_goals || 0,
          away: record.half_time_away_goals || 0
        },
        ftScore: {
          home: record.full_time_home_goals || 0,
          away: record.full_time_away_goals || 0
        },
        btts: Boolean(record.btts_computed),
        comeback: Boolean(record.comeback_computed),
        league: record.league || 'Unknown League',
        country: record.country || undefined,
        season: record.season || undefined,
        stats: {
          odds: {
            home: record.odds_home,
            draw: record.odds_draw,
            away: record.odds_away
          },
          xg: {
            home: record.xg_home,
            away: record.xg_away
          },
          possession: {
            home: record.possession_home,
            away: record.possession_away
          },
          shots: {
            home: record.shots_home,
            away: record.shots_away
          },
          shotsOnTarget: {
            home: record.shots_on_target_home,
            away: record.shots_on_target_away
          },
          corners: {
            home: record.corners_home,
            away: record.corners_away
          },
          fouls: {
            home: record.fouls_home,
            away: record.fouls_away
          },
          cards: {
            yellow: {
              home: record.yellow_cards_home,
              away: record.yellow_cards_away
            },
            red: {
              home: record.red_cards_home,
              away: record.red_cards_away
            }
          }
        }
      };
    });
  } catch (error) {
    console.error('Error transforming match data:', error);
    return [];
  }
}