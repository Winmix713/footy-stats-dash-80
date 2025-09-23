import React from 'react';
import { Match, Team, MatchStats, SortKey, SortDirection } from '../types/match';
import { addToast } from '@heroui/react';
import { mockMatches } from '../data/mock-data';
import { createClient } from '@supabase/supabase-js';

// Update Supabase constants to match documentation
const STORAGE_KEY = 'winmix_filters_v2';
const SUPABASE_URL = 'https://tssgzrzjxslvqmpxgsss.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzc2d6cnpqeHNsdnFtcHhnc3NzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4NDQ0NzksImV4cCI6MjA3MDQyMDQ3OX0.x3dwO-gt7bp4-uM-lMktVxFdu-RaRgN8N5DM8-mqofI';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const useMatchData = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [matches, setMatches] = React.useState<Match[]>([]);
  const [filteredMatches, setFilteredMatches] = React.useState<Match[]>([]);
  
  const [selectedHomeTeam, setSelectedHomeTeam] = React.useState<Team | null>(null);
  const [selectedAwayTeam, setSelectedAwayTeam] = React.useState<Team | null>(null);
  const [selectedBTTS, setSelectedBTTS] = React.useState<boolean | null>(null);
  const [selectedComeback, setSelectedComeback] = React.useState<boolean | null>(null);
  
  // Add date range filter state - MOVED TO TOP
  const [startDate, setStartDate] = React.useState<string>('');
  const [endDate, setEndDate] = React.useState<string>('');
  
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(50);
  
  const [sortKey, setSortKey] = React.useState<SortKey>('home');
  const [sortDirection, setSortDirection] = React.useState<SortDirection>('asc');
  
  const [stats, setStats] = React.useState<MatchStats>({
    total: 0,
    homeWins: 0,
    draws: 0,
    awayWins: 0,
    bttsCount: 0,
    comebackCount: 0,
    homeGoals: 0,
    awayGoals: 0,
    frequentResults: []
  });
  
  const [isExtendedStatsModalOpen, setIsExtendedStatsModalOpen] = React.useState(false);

  // Extract unique teams
  const homeTeams = React.useMemo(() => {
    const teams = new Map<string, Team>();
    matches.forEach(match => {
      if (!teams.has(match.home.id)) {
        teams.set(match.home.id, match.home);
      }
    });
    return Array.from(teams.values());
  }, [matches]);

  const awayTeams = React.useMemo(() => {
    const teams = new Map<string, Team>();
    matches.forEach(match => {
      if (!teams.has(match.away.id)) {
        teams.set(match.away.id, match.away);
      }
    });
    return Array.from(teams.values());
  }, [matches]);

  // Define saveFiltersToStorage before it's used
  const saveFiltersToStorage = React.useCallback(() => {
    try {
      const filters = {
        home: selectedHomeTeam,
        away: selectedAwayTeam,
        btts: selectedBTTS,
        comeback: selectedComeback,
        startDate,
        endDate
      };
      
      const data = {
        filters,
        itemsPerPage,
        sortKey,
        sortDirection
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Could not save filters to storage:', error);
    }
  }, [selectedHomeTeam, selectedAwayTeam, selectedBTTS, selectedComeback, startDate, endDate, itemsPerPage, sortKey, sortDirection]);

  // Define clearFiltersFromStorage before it's used
  const clearFiltersFromStorage = React.useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Could not clear filters from storage:', error);
    }
  }, []);

  // Load initial data with proper Supabase integration
  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Use Supabase client to fetch all matches from the database
        // Add pagination to improve performance
        const { data, error, count } = await supabase
          .from('matches')
          .select('*', { count: 'exact' })
          .range(0, 199); // Fetch first 200 matches for initial load
        
        if (error) {
          throw error;
        }
        
        if (!data || data.length === 0) {
          throw new Error('No matches found in the database');
        }
        
        console.log(`Loaded ${data.length} matches out of ${count} total`);
        
        // Transform the data to match our Match interface
        const transformedMatches: Match[] = data.map(match => ({
          id: match.id.toString(),
          match_time: match.match_time,
          home_team: match.home_team,
          away_team: match.away_team,
          half_time_home_goals: match.half_time_home_goals,
          half_time_away_goals: match.half_time_away_goals,
          full_time_home_goals: match.full_time_home_goals,
          full_time_away_goals: match.full_time_away_goals,
          match_status: match.match_status || 'completed',
          btts_computed: match.btts_computed,
          comeback_computed: match.comeback_computed,
          result_computed: match.result_computed,
          
          // Create compatible properties for existing components
          home: {
            id: `home-${match.id}`,
            name: match.home_team,
            logo: `https://img.heroui.chat/image/sports?w=100&h=100&u=${match.home_team.replace(/\s+/g, '')}`
          },
          away: {
            id: `away-${match.id}`,
            name: match.away_team,
            logo: `https://img.heroui.chat/image/sports?w=100&h=100&u=${match.away_team.replace(/\s+/g, '')}`
          },
          htScore: {
            home: match.half_time_home_goals || 0,
            away: match.half_time_away_goals || 0
          },
          ftScore: {
            home: match.full_time_home_goals,
            away: match.full_time_away_goals
          },
          btts: match.btts_computed,
          comeback: match.comeback_computed,
          // Add a date field for filtering
          date: match.match_time ? new Date(match.match_time) : new Date()
        }));
        
        setMatches(transformedMatches);
        setFilteredMatches(transformedMatches);
        calculateStats(transformedMatches);
        
        addToast({
          title: "Adatok betöltve",
          description: `${transformedMatches.length} mérkőzés betöltve sikeresen.`,
          severity: "success",
        });
      } catch (error) {
        console.error("Error fetching match data:", error);
        
        // Fallback to mock data if Supabase fetch fails
        setMatches(mockMatches);
        setFilteredMatches(mockMatches);
        calculateStats(mockMatches);
        
        addToast({
          title: "Hiba történt",
          description: "Az adatok betöltése a Supabase-ből sikertelen. Minta adatok betöltve.",
          severity: "warning",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Apply filters with updated implementation for database fields
  const applyFilters = React.useCallback(() => {
    setIsLoading(true);
    
    try {
      let filtered = [...matches];
      
      if (selectedHomeTeam) {
        filtered = filtered.filter(match => match.home_team === selectedHomeTeam.name);
      }
      
      if (selectedAwayTeam) {
        filtered = filtered.filter(match => match.away_team === selectedAwayTeam.name);
      }
      
      if (selectedBTTS !== null) {
        filtered = filtered.filter(match => match.btts_computed === selectedBTTS);
      }
      
      if (selectedComeback !== null) {
        filtered = filtered.filter(match => match.comeback_computed === selectedComeback);
      }
      
      // Apply date range filter - use the date field instead of match_time
      if (startDate) {
        const startDateObj = new Date(startDate);
        filtered = filtered.filter(match => {
          // Use the date field for filtering since match_time is just a time
          return match.date && match.date >= startDateObj;
        });
      }
      
      if (endDate) {
        const endDateObj = new Date(endDate);
        // Set to end of day
        endDateObj.setHours(23, 59, 59, 999);
        filtered = filtered.filter(match => {
          // Use the date field for filtering since match_time is just a time
          return match.date && match.date <= endDateObj;
        });
      }
      
      // Apply sorting
      filtered = sortMatches(filtered, sortKey, sortDirection);
      
      setFilteredMatches(filtered);
      calculateStats(filtered);
      setCurrentPage(1); // Reset to first page
      
      // Save filters to localStorage
      saveFiltersToStorage();
      
      addToast({
        title: "Szűrés alkalmazva",
        description: `${filtered.length} mérkőzés található a megadott feltételekkel.`,
        severity: "success",
      });
    } catch (error) {
      console.error("Error applying filters:", error);
      addToast({
        title: "Hiba történt",
        description: "A szűrés alkalmazása sikertelen.",
        severity: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  }, [matches, selectedHomeTeam, selectedAwayTeam, selectedBTTS, selectedComeback, startDate, endDate, sortKey, sortDirection, saveFiltersToStorage]);

  // Reset filters with updated implementation for date range
  const resetFilters = React.useCallback(() => {
    setSelectedHomeTeam(null);
    setSelectedAwayTeam(null);
    setSelectedBTTS(null);
    setSelectedComeback(null);
    setStartDate('');
    setEndDate('');
    
    setSortKey('home');
    setSortDirection('asc');
    setCurrentPage(1);
    
    // Clear filters from localStorage
    clearFiltersFromStorage();
    
    // Apply the reset filters
    setFilteredMatches(matches);
    calculateStats(matches);
    
    addToast({
      title: "Szűrők visszaállítva",
      description: "Az összes szűrő visszaállítva alapértelmezettre.",
      severity: "primary",
    });
  }, [matches, clearFiltersFromStorage]);

  // Export to CSV with updated implementation for database fields
  const exportToCSV = React.useCallback(() => {
    try {
      if (filteredMatches.length === 0) {
        addToast({
          title: "Figyelmeztetés",
          description: "Nincs exportálható adat.",
          severity: "warning",
        });
        return;
      }
      
      const headers = [
        "ID",
        "Dátum",
        "Hazai csapat",
        "Vendég csapat",
        "Félidő hazai gólok",
        "Félidő vendég gólok",
        "Végeredmény hazai gólok",
        "Végeredmény vendég gólok",
        "Mérkőzés státusz",
        "Mindkét csapat gólt szerzett",
        "Fordítás történt",
        "Eredmény"
      ];
      
      const csvRows = [
        headers.join(','),
        ...filteredMatches.map(match => {
          return [
            `"${match.id}"`,
            `"${match.match_time ? new Date(match.match_time).toISOString().split('T')[0] : ''}"`,
            `"${match.home_team}"`,
            `"${match.away_team}"`,
            match.half_time_home_goals !== null ? match.half_time_home_goals : '',
            match.half_time_away_goals !== null ? match.half_time_away_goals : '',
            match.full_time_home_goals,
            match.full_time_away_goals,
            `"${match.match_status || 'completed'}"`,
            match.btts_computed ? "Igen" : "Nem",
            match.comeback_computed ? "Igen" : "Nem",
            `"${match.result_computed}"`
          ].join(',');
        })
      ];
      
      // Add BOM for proper UTF-8 encoding in Excel
      const csvContent = '\ufeff' + csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `winmix-export-${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      addToast({
        title: "CSV exportálva",
        description: `${filteredMatches.length} mérkőzés exportálva sikeresen.`,
        severity: "success",
      });
    } catch (error) {
      console.error("Error exporting to CSV:", error);
      addToast({
        title: "Hiba történt",
        description: "A CSV exportálása sikertelen.",
        severity: "danger",
      });
    }
  }, [filteredMatches]);

  // Enhanced sort matches function
  const sortMatches = React.useCallback((matchesToSort: Match[], key: SortKey, direction: SortDirection): Match[] => {
    if (!key) return matchesToSort;
    
    return [...matchesToSort].sort((a, b) => {
      let result = 0;
      
      switch (key) {
        case 'home':
          result = a.home_team.localeCompare(b.home_team, 'hu');
          break;
        case 'away':
          result = a.away_team.localeCompare(b.away_team, 'hu');
          break;
        case 'ht':
          const aHtHome = a.half_time_home_goals || 0;
          const aHtAway = a.half_time_away_goals || 0;
          const bHtHome = b.half_time_home_goals || 0;
          const bHtAway = b.half_time_away_goals || 0;
          result = (aHtHome + aHtAway) - (bHtHome + bHtAway);
          if (result === 0) result = aHtHome - bHtHome;
          break;
        case 'ft':
          const aFtHome = a.full_time_home_goals;
          const aFtAway = a.full_time_away_goals;
          const bFtHome = b.full_time_home_goals;
          const bFtAway = b.full_time_away_goals;
          result = (aFtHome + aFtAway) - (bFtHome + bFtAway);
          if (result === 0) result = aFtHome - bFtHome;
          break;
        case 'btts':
          result = (a.btts_computed ? 1 : 0) - (b.btts_computed ? 1 : 0);
          break;
        case 'comeback':
          result = (a.comeback_computed ? 1 : 0) - (b.comeback_computed ? 1 : 0);
          break;
      }
      
      return direction === 'asc' ? result : -result;
    });
  }, []);

  // Calculate statistics based on filtered matches
  const calculateStats = (matchesToCalculate: Match[]) => {
    let homeWins = 0;
    let draws = 0;
    let awayWins = 0;
    let bttsCount = 0;
    let comebackCount = 0;
    let homeGoals = 0;
    let awayGoals = 0;
    
    // For frequent results
    const resultCounts: Record<string, number> = {};
    
    matchesToCalculate.forEach(match => {
      // Count match results using result_computed
      if (match.result_computed === 'H') {
        homeWins++;
      } else if (match.result_computed === 'D') {
        draws++;
      } else {
        awayWins++;
      }
      
      // Count BTTS and comebacks using computed fields
      if (match.btts_computed) bttsCount++;
      if (match.comeback_computed) comebackCount++;
      
      // Count goals
      homeGoals += match.full_time_home_goals;
      awayGoals += match.full_time_away_goals;
      
      // Count result frequencies
      const resultKey = `${match.full_time_home_goals}-${match.full_time_away_goals}`;
      resultCounts[resultKey] = (resultCounts[resultKey] || 0) + 1;
    });
    
    // Sort results by frequency
    const frequentResults = Object.entries(resultCounts)
      .map(([result, count]) => ({
        result,
        count,
        percentage: (count / matchesToCalculate.length) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    setStats({
      total: matchesToCalculate.length,
      homeWins,
      draws,
      awayWins,
      bttsCount,
      comebackCount,
      homeGoals,
      awayGoals,
      frequentResults
    });
  };

  // Load stored filters
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      
      const data = JSON.parse(stored);
      
      // Restore filters
      if (data.filters) {
        if (data.filters.home) setSelectedHomeTeam(data.filters.home);
        if (data.filters.away) setSelectedAwayTeam(data.filters.away);
        if (data.filters.btts !== null) setSelectedBTTS(data.filters.btts);
        if (data.filters.comeback !== null) setSelectedComeback(data.filters.comeback);
        if (data.filters.startDate) setStartDate(data.filters.startDate);
        if (data.filters.endDate) setEndDate(data.filters.endDate);
      }
      
      // Restore settings
      if (data.itemsPerPage) {
        setItemsPerPage(data.itemsPerPage);
      }
      
      if (data.sortKey) {
        setSortKey(data.sortKey);
        setSortDirection(data.sortDirection || 'asc');
      }
    } catch (error) {
      console.warn('Could not load stored filters:', error);
    }
  }, []);

  // Return the context value
  return {
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
    setEndDate
  };
};

// Create a context type
export type MatchDataContextType = ReturnType<typeof useMatchData>;

// Create the context
export const MatchDataContext = React.createContext<MatchDataContextType | null>(null);

// Create a provider component
interface MatchDataProviderProps {
  children: React.ReactNode;
}

export const MatchDataProvider: React.FC<MatchDataProviderProps> = ({ children }) => {
  const matchData = useMatchData();
  
  return React.createElement(
    MatchDataContext.Provider,
    { value: matchData },
    children
  );
};

// Create a hook to use the match data context
export const useMatchDataContext = () => {
  const context = React.useContext(MatchDataContext);
  if (!context) {
    throw new Error('useMatchDataContext must be used within a MatchDataProvider');
  }
  return context;
};