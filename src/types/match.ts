export interface Team {
  id: string;
  name: string;
  logo?: string;
}

export interface Match {
  id: string;
  // Update match_time to be a time string instead of Date to match SQL schema
  match_time: string; // Changed from Date to string since SQL uses "time without time zone"
  home_team: string;
  away_team: string;
  half_time_home_goals: number | null;
  half_time_away_goals: number | null;
  full_time_home_goals: number;
  full_time_away_goals: number;
  match_status?: 'completed' | 'scheduled' | 'cancelled' | 'postponed';
  btts_computed: boolean;
  comeback_computed: boolean;
  result_computed: 'H' | 'A' | 'D';
  
  // Keep these for compatibility with existing components
  home: Team;
  away: Team;
  htScore: {
    home: number;
    away: number;
  };
  ftScore: {
    home: number;
    away: number;
  };
  btts: boolean;
  comeback: boolean;
  date?: Date; // Keep this for backward compatibility
}

export interface MatchStats {
  total: number;
  homeWins: number;
  draws: number;
  awayWins: number;
  bttsCount: number;
  comebackCount: number;
  homeGoals: number;
  awayGoals: number;
  frequentResults: Array<{
    result: string;
    count: number;
    percentage: number;
  }>;
}

export type SortKey = 'home' | 'away' | 'ht' | 'ft' | 'btts' | 'comeback';
export type SortDirection = 'asc' | 'desc';

export interface FilterOptions {
  homeTeam: Team | null;
  awayTeam: Team | null;
  btts: boolean | null;
  comeback: boolean | null;
}

export interface ResultsSectionProps {
  matches: Match[];
  currentPage: number;
  itemsPerPage: number;
  totalItems: number; // This now represents the total in the database, not just filtered
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  sortKey: SortKey;
  sortDirection: SortDirection;
  onSortChange: (key: SortKey) => void;
  isLoadingPage?: boolean; // Add loading state for pagination
}
