import axios from 'axios';
import { apiClient } from '../utils/apiClient';
import { apiLogger } from '../utils/apiLogger';
import { getApiConfig, API_ENDPOINTS } from '../utils/apiConfig';
import { githubDataService } from './githubDataService';
import { 
  validateWinmixApiResponse, 
  validateApiResponse, 
  type Match, 
  type TeamAnalysis, 
  type Prediction, 
  type ApiResponse,
  type WinmixMatch,
  type WinmixApiResponse
} from '../schemas/footballSchemas';

// Re-export types for backward compatibility
export type { Match, TeamAnalysis, Prediction, ApiResponse };

class FootballApiService {
  private config = getApiConfig();

  async fetchData(params: Record<string, string> = {}): Promise<ApiResponse> {
    // Try data sources in priority order: github -> winmix -> mock
    for (const source of this.config.dataSources) {
      try {
        switch (source) {
          case 'github':
            apiLogger.info('Attempting to fetch from GitHub', { params }, 'service');
            return await githubDataService.fetchFromGitHub(params);
            
          case 'php':
            // TODO: Implement PHP API integration when ready
            apiLogger.info('PHP API not implemented yet, skipping', { params }, 'service');
            continue;
            
          case 'winmix':
            apiLogger.info('Attempting to fetch from Winmix API', { params }, 'service');
            return await this.fetchFromWinmix(params);
            
          case 'mock':
            apiLogger.info('Using mock data as fallback', { params }, 'service');
            return this.getMockData(params);
            
          default:
            continue;
        }
      } catch (error) {
        apiLogger.warn(`${source} data source failed, trying next`, {
          error: error instanceof Error ? error.message : 'Unknown error',
          source,
          params
        }, 'service');
        continue;
      }
    }

    // If all sources fail, return mock data
    apiLogger.error('All data sources failed, returning mock data', { params }, 'service');
    return this.getMockData(params);
  }

  private async fetchFromWinmix(params: Record<string, string> = {}): Promise<ApiResponse> {
    const winmixData = await this.fetchWinmixData();
    const convertedMatches = winmixData.matches.map(match => this.convertWinmixMatch(match));
    
    // Apply filters to converted matches
    let filteredMatches = this.applyFilters(convertedMatches, params);
    
    // Sort matches by date (newest first)
    filteredMatches.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Extract teams
    const teams = this.extractTeams(convertedMatches);
    
    // Generate team analysis if both teams are provided
    let teamAnalysis: TeamAnalysis | undefined;
    let prediction: Prediction | undefined;

    if (params.home_team && params.away_team) {
      const h2hMatches = filteredMatches.filter(m => 
        (m.home_team === params.home_team && m.away_team === params.away_team) ||
        (m.home_team === params.away_team && m.away_team === params.home_team)
      );
      
      if (h2hMatches.length > 0) {
        const stats = this.calculateStats(params.home_team, params.away_team, h2hMatches);
        
        teamAnalysis = {
          home_team: params.home_team,
          away_team: params.away_team,
          ...stats
        };

        prediction = this.generatePrediction(params.home_team, params.away_team, stats);
      }
    }

    // Pagination - handle large dataset properly
    const page = parseInt(params.page) || 1;
    const pageSize = Math.min(parseInt(params.page_size) || 20, 100);
    const startIndex = (page - 1) * pageSize;
    const paginatedMatches = filteredMatches.slice(startIndex, startIndex + pageSize);

    const response = {
      total_matches: filteredMatches.length,
      page,
      page_size: pageSize,
      matches: paginatedMatches,
      team_analysis: teamAnalysis,
      prediction,
      teams
    };

    return validateApiResponse(response);
  }

  private async fetchWinmixData(): Promise<WinmixApiResponse> {
    const response = await axios.get(API_ENDPOINTS.WINMIX_MATCHES, {
      timeout: this.config.timeout,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    return validateWinmixApiResponse(response.data);
  }

  private convertWinmixMatch(winmixMatch: WinmixMatch): Match {
    // Convert date from "3329-01-01 08:48" format to ISO date
    const dateStr = winmixMatch.date.split(' ')[0]; // Get just the date part
    // Handle the unusual year format (3329 -> 2024, etc.)
    const [year, month, day] = dateStr.split('-');
    const normalizedYear = parseInt(year) > 3000 ? '2024' : year;
    const normalizedDate = `${normalizedYear}-${month}-${day}`;
    
    return {
      id: winmixMatch.match_id.toString(),
      home_team: winmixMatch.home_team,
      away_team: winmixMatch.away_team,
      score: {
        home: winmixMatch.score.home,
        away: winmixMatch.score.away
      },
      date: normalizedDate
    };
  }

  private extractTeams(matches: Match[]): string[] {
    const teamSet = new Set<string>();
    matches.forEach(match => {
      teamSet.add(match.home_team);
      teamSet.add(match.away_team);
    });
    return Array.from(teamSet).sort();
  }

  private calculateStats(homeTeam: string, awayTeam: string, matches: Match[]) {
    const h2hMatches = matches.filter(m => 
      (m.home_team === homeTeam && m.away_team === awayTeam) ||
      (m.home_team === awayTeam && m.away_team === homeTeam)
    );

    const homeWins = h2hMatches.filter(m => 
      (m.home_team === homeTeam && m.score.home > m.score.away) ||
      (m.away_team === homeTeam && m.score.away > m.score.home)
    ).length;

    const awayWins = h2hMatches.filter(m => 
      (m.home_team === awayTeam && m.score.home > m.score.away) ||
      (m.away_team === awayTeam && m.score.away > m.score.home)
    ).length;

    const draws = h2hMatches.filter(m => m.score.home === m.score.away).length;
    const totalMatches = h2hMatches.length || 1;

    const totalGoals = h2hMatches.reduce((sum, m) => sum + m.score.home + m.score.away, 0);
    const bothTeamsScored = h2hMatches.filter(m => m.score.home > 0 && m.score.away > 0).length;

    // Calculate form indices based on recent matches
    const recentHomeMatches = matches
      .filter(m => m.home_team === homeTeam || m.away_team === homeTeam)
      .slice(-10);
    
    const recentAwayMatches = matches
      .filter(m => m.home_team === awayTeam || m.away_team === awayTeam)
      .slice(-10);

    const homeFormIndex = this.calculateFormIndex(homeTeam, recentHomeMatches);
    const awayFormIndex = this.calculateFormIndex(awayTeam, recentAwayMatches);

    return {
      matches_count: h2hMatches.length,
      both_teams_scored_percentage: Math.round((bothTeamsScored / totalMatches) * 100),
      average_goals: {
        average_total_goals: Number((totalGoals / totalMatches).toFixed(2)),
        average_home_goals: Number((h2hMatches.reduce((sum, m) => sum + m.score.home, 0) / totalMatches).toFixed(2)),
        average_away_goals: Number((h2hMatches.reduce((sum, m) => sum + m.score.away, 0) / totalMatches).toFixed(2))
      },
      home_form_index: homeFormIndex,
      away_form_index: awayFormIndex,
      head_to_head_stats: {
        home_wins: homeWins,
        away_wins: awayWins,
        draws: draws,
        home_win_percentage: Math.round((homeWins / totalMatches) * 100),
        away_win_percentage: Math.round((awayWins / totalMatches) * 100),
        draw_percentage: Math.round((draws / totalMatches) * 100)
      }
    };
  }

  private calculateFormIndex(team: string, recentMatches: Match[]): number {
    if (recentMatches.length === 0) return 50;
    
    let points = 0;
    recentMatches.forEach(match => {
      const isHome = match.home_team === team;
      const teamScore = isHome ? match.score.home : match.score.away;
      const opponentScore = isHome ? match.score.away : match.score.home;
      
      if (teamScore > opponentScore) points += 3; // Win
      else if (teamScore === opponentScore) points += 1; // Draw
    });
    
    const maxPoints = recentMatches.length * 3;
    return Math.round((points / maxPoints) * 100);
  }

  private applyFilters(matches: Match[], params: Record<string, string>): Match[] {
    let filteredMatches = [...matches];

    // Team filter
    if (params.team) {
      filteredMatches = filteredMatches.filter(m => 
        m.home_team.toLowerCase().includes(params.team.toLowerCase()) ||
        m.away_team.toLowerCase().includes(params.team.toLowerCase())
      );
    }

    // Home and away team filters
    if (params.home_team && params.away_team) {
      filteredMatches = filteredMatches.filter(m => 
        (m.home_team.toLowerCase().includes(params.home_team.toLowerCase()) &&
         m.away_team.toLowerCase().includes(params.away_team.toLowerCase())) ||
        (m.home_team.toLowerCase().includes(params.away_team.toLowerCase()) &&
         m.away_team.toLowerCase().includes(params.home_team.toLowerCase()))
      );
    } else if (params.home_team) {
      filteredMatches = filteredMatches.filter(m => 
        m.home_team.toLowerCase().includes(params.home_team.toLowerCase())
      );
    } else if (params.away_team) {
      filteredMatches = filteredMatches.filter(m => 
        m.away_team.toLowerCase().includes(params.away_team.toLowerCase())
      );
    }

    // Date filter
    if (params.date) {
      const filterDate = new Date(params.date);
      filteredMatches = filteredMatches.filter(m => 
        new Date(m.date) >= filterDate
      );
    }

    // Both teams scored filter
    if (params.both_teams_scored !== undefined) {
      const shouldBothScore = params.both_teams_scored === 'true';
      filteredMatches = filteredMatches.filter(m => 
        (m.score.home > 0 && m.score.away > 0) === shouldBothScore
      );
    }

    // Score filters
    if (params.score_home !== undefined) {
      filteredMatches = filteredMatches.filter(m => 
        m.score.home === parseInt(params.score_home)
      );
    }

    if (params.score_away !== undefined) {
      filteredMatches = filteredMatches.filter(m => 
        m.score.away === parseInt(params.score_away)
      );
    }

    return filteredMatches;
  }

  private generatePrediction(homeTeam: string, awayTeam: string, stats: any): Prediction {
    const homeExpected = 1 + Math.random() * 2;
    const awayExpected = 1 + Math.random() * 2;
    const winners: ('home' | 'away' | 'draw')[] = ['home', 'away', 'draw'];
    const predictedWinner = winners[Math.floor(Math.random() * winners.length)];

    return {
      homeExpectedGoals: Number(homeExpected.toFixed(2)),
      awayExpectedGoals: Number(awayExpected.toFixed(2)),
      bothTeamsToScoreProb: Math.round(60 + Math.random() * 30),
      predictedWinner,
      confidence: Number((0.4 + Math.random() * 0.4).toFixed(2)),
      modelPredictions: {
        randomForest: `${predictedWinner}_win`,
        poisson: {
          homeGoals: Math.round(homeExpected),
          awayGoals: Math.round(awayExpected)
        },
        elo: {
          homeWinProb: Number((0.2 + Math.random() * 0.4).toFixed(2)),
          drawProb: Number((0.2 + Math.random() * 0.3).toFixed(2)),
          awayWinProb: Number((0.2 + Math.random() * 0.4).toFixed(2))
        }
      }
    };
  }

  private getMockData(params: Record<string, string> = {}): ApiResponse {
    // Mock teams from GitHub data
    const mockTeams = [
      'Aston Villa', 'Brentford', 'Brighton', 'Chelsea', 'Crystal Palace',
      'Everton', 'Fulham', 'Liverpool', 'Arsenal', 'Manchester City',
      'Newcastle', 'Nottingham Forest', 'Tottenham', 'Manchester United', 'West Ham', 'Wolverhampton'
    ];

    const generateMockMatch = (homeTeam: string, awayTeam: string, daysAgo: number): Match => {
      const homeScore = Math.floor(Math.random() * 4);
      const awayScore = Math.floor(Math.random() * 4);
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      
      return {
        id: (Date.now() + Math.random()).toString(),
        home_team: homeTeam,
        away_team: awayTeam,
        score: { home: homeScore, away: awayScore },
        date: date.toISOString().split('T')[0]
      };
    };

    const mockMatches: Match[] = [];
    for (let i = 0; i < 100; i++) {
      const homeTeam = mockTeams[Math.floor(Math.random() * mockTeams.length)];
      let awayTeam = mockTeams[Math.floor(Math.random() * mockTeams.length)];
      while (awayTeam === homeTeam) {
        awayTeam = mockTeams[Math.floor(Math.random() * mockTeams.length)];
      }
      mockMatches.push(generateMockMatch(homeTeam, awayTeam, i));
    }

    let filteredMatches = this.applyFilters(mockMatches, params);

    // Generate team analysis and prediction for mock data
    let teamAnalysis: TeamAnalysis | undefined;
    let prediction: Prediction | undefined;

    if (params.home_team && params.away_team) {
      const stats = this.calculateStats(params.home_team, params.away_team, filteredMatches);
      teamAnalysis = {
        home_team: params.home_team,
        away_team: params.away_team,
        ...stats
      };
      prediction = this.generatePrediction(params.home_team, params.away_team, stats);
    }

    const page = parseInt(params.page) || 1;
    const pageSize = parseInt(params.page_size) || 100;
    const startIndex = (page - 1) * pageSize;
    const paginatedMatches = filteredMatches.slice(startIndex, startIndex + pageSize);

    const mockResponse = {
      total_matches: filteredMatches.length,
      page,
      page_size: pageSize,
      matches: paginatedMatches,
      team_analysis: teamAnalysis,
      prediction,
      teams: mockTeams
    };

    try {
      return validateApiResponse(mockResponse);
    } catch (error) {
      apiLogger.error('Mock data validation failed', error, 'mock');
      return {
        total_matches: 0,
        page: 1,
        page_size: pageSize,
        matches: [],
        teams: mockTeams,
        error: 'Mock data validation failed'
      };
    }
  }
}

export const footballApi = new FootballApiService();
