
import axios from 'axios';
import { apiLogger } from '../utils/apiLogger';
import { getApiConfig, API_ENDPOINTS } from '../utils/apiConfig';
import { 
  validateApiResponse, 
  type Match, 
  type TeamAnalysis, 
  type Prediction, 
  type ApiResponse
} from '../schemas/footballSchemas';

interface GitHubMatch {
  match_id: number;
  league_id: number;
  date: string;
  home_team: string;
  away_team: string;
  score: {
    home: number;
    away: number;
  };
  both_teams_scored: boolean;
}

interface GitHubApiResponse {
  matches: GitHubMatch[];
}

class GitHubDataService {
  private config = getApiConfig();

  // Convert GitHub match format to our internal format
  private convertGitHubMatch(githubMatch: GitHubMatch): Match {
    // Normalize date format
    const dateStr = githubMatch.date.split(' ')[0]; // Get just the date part
    const [year, month, day] = dateStr.split('-');
    // Handle unusual year formats if needed
    const normalizedYear = parseInt(year) > 3000 ? '2024' : year;
    const normalizedDate = `${normalizedYear}-${month}-${day}`;
    
    return {
      id: githubMatch.match_id.toString(),
      home_team: githubMatch.home_team,
      away_team: githubMatch.away_team,
      score: {
        home: githubMatch.score.home,
        away: githubMatch.score.away
      },
      date: normalizedDate
    };
  }

  // Extract unique teams from matches
  private extractTeams(matches: Match[]): string[] {
    const teamSet = new Set<string>();
    matches.forEach(match => {
      teamSet.add(match.home_team);
      teamSet.add(match.away_team);
    });
    return Array.from(teamSet).sort();
  }

  // Apply filters to matches
  private applyFilters(matches: Match[], params: Record<string, string>): Match[] {
    let filteredMatches = [...matches];

    // Team filter
    if (params.team) {
      filteredMatches = filteredMatches.filter(m => 
        m.home_team.toLowerCase().includes(params.team.toLowerCase()) ||
        m.away_team.toLowerCase().includes(params.away_team.toLowerCase())
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

  // Calculate statistics for team analysis
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

  async fetchFromGitHub(params: Record<string, string> = {}): Promise<ApiResponse> {
    try {
      apiLogger.info('Fetching data from GitHub repository', { params }, 'github-service');
      
      const response = await axios.get(API_ENDPOINTS.GITHUB_MATCHES, {
        timeout: this.config.timeout,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      const githubData: GitHubApiResponse = response.data;
      
      if (!githubData.matches || !Array.isArray(githubData.matches)) {
        throw new Error('Invalid GitHub data structure');
      }

      // Convert matches to internal format
      const convertedMatches = githubData.matches.map(match => this.convertGitHubMatch(match));
      
      // Apply filters
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

      // Pagination
      const page = parseInt(params.page) || 1;
      const pageSize = Math.min(parseInt(params.page_size) || 20, 100);
      const startIndex = (page - 1) * pageSize;
      const paginatedMatches = filteredMatches.slice(startIndex, startIndex + pageSize);

      const response_data = {
        total_matches: filteredMatches.length,
        page,
        page_size: pageSize,
        matches: paginatedMatches,
        team_analysis: teamAnalysis,
        prediction,
        teams
      };

      apiLogger.info('GitHub data processed successfully', { 
        totalMatches: convertedMatches.length,
        filteredMatches: filteredMatches.length,
        paginatedMatches: paginatedMatches.length,
        teams: teams.length,
        page,
        pageSize
      }, 'github-service');

      return validateApiResponse(response_data);
    } catch (error) {
      apiLogger.error('GitHub data fetch failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        params
      }, 'github-service');
      
      throw error;
    }
  }
}

export const githubDataService = new GitHubDataService();
