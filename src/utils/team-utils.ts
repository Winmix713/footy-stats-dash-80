import { Match, Team } from '../types/match';

/**
 * Calculate power ranking for a team based on match results
 */
export const calculateTeamPowerRanking = (team: Team, matches: Match[]): number => {
  try {
    if (!matches || !Array.isArray(matches) || matches.length === 0) {
      return 0;
    }
    
    // Extract team name from team object
    const teamName = team.name;
    if (!teamName) return 0;
    
    // Filter matches by team name instead of ID
    const homeMatches = matches.filter(match => match.home_team === teamName);
    const awayMatches = matches.filter(match => match.away_team === teamName);
    const allMatches = [...homeMatches, ...awayMatches];
    
    if (allMatches.length === 0) return 0;
    
    // Calculate win percentage (40% of ranking)
    const homeWins = homeMatches.filter(match => match.result_computed === 'H').length;
    const awayWins = awayMatches.filter(match => match.result_computed === 'A').length;
    const totalWins = homeWins + awayWins;
    const winPercentage = (totalWins / allMatches.length) * 100;
    const winScore = winPercentage * 0.4;
    
    // Calculate goal difference (30% of ranking)
    const homeGoalsScored = homeMatches.reduce((sum, match) => sum + (match.full_time_home_goals || 0), 0);
    const homeGoalsConceded = homeMatches.reduce((sum, match) => sum + (match.full_time_away_goals || 0), 0);
    const awayGoalsScored = awayMatches.reduce((sum, match) => sum + (match.full_time_away_goals || 0), 0);
    const awayGoalsConceded = awayMatches.reduce((sum, match) => sum + (match.full_time_home_goals || 0), 0);
    
    const totalGoalsScored = homeGoalsScored + awayGoalsScored;
    const totalGoalsConceded = homeGoalsConceded + awayGoalsConceded;
    const goalDifference = totalGoalsScored - totalGoalsConceded;
    const goalDifferenceScore = goalDifference * 0.3;
    
    // Calculate recent form (20% of ranking)
    const recentMatches = [...allMatches]
      .sort((a, b) => {
        const dateA = a.match_time ? new Date(a.match_time).getTime() : 0;
        const dateB = b.match_time ? new Date(b.match_time).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 5);
    
    let formPoints = 0;
    recentMatches.forEach(match => {
      const isHome = match.home_team === teamName;
      if (match.result_computed === 'D') {
        formPoints += 1;
      } else if (
        (isHome && match.result_computed === 'H') || 
        (!isHome && match.result_computed === 'A')
      ) {
        formPoints += 3;
      }
    });
    
    const maxFormPoints = recentMatches.length * 3;
    const formScore = maxFormPoints > 0 ? (formPoints / maxFormPoints) * 100 * 0.2 : 0;
    
    // Calculate home/away performance (10% of ranking)
    const homeWinRate = homeMatches.length > 0 ? homeWins / homeMatches.length : 0;
    const awayWinRate = awayMatches.length > 0 ? awayWins / awayMatches.length : 0;
    const homeAwayScore = (homeWinRate + awayWinRate) * 50 * 0.1;
    
    // Calculate final power ranking
    return winScore + goalDifferenceScore + formScore + homeAwayScore;
  } catch (error) {
    console.error("Error calculating power ranking:", error);
    return 0;
  }
};