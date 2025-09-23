import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, TrendingUp } from 'lucide-react';
import { type ApiResponse } from '@/services/footballApi';

interface TeamAnalysisProps {
  data: ApiResponse;
}

export const TeamAnalysis = ({ data }: TeamAnalysisProps) => {
  if (!data.team_analysis) {
    return null;
  }

  const { team_analysis, prediction } = data;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-center text-pitch">
        {team_analysis.home_team} vs {team_analysis.away_team}
      </h2>
      
      {/* Match Prediction */}
      {prediction && (
        <Card className="shadow-glow border-goal/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-goal" />
              Meccs Előrejelzés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {prediction.homeExpectedGoals}
                </div>
                <div className="text-sm text-muted-foreground">
                  {team_analysis.home_team} Várható Gólok
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-goal">
                  {prediction.predictedWinner === 'home' ? team_analysis.home_team :
                   prediction.predictedWinner === 'away' ? team_analysis.away_team : 'Döntetlen'}
                </div>
                <div className="text-sm text-muted-foreground">
                  Várható Győztes ({Math.round(prediction.confidence * 100)}% bizonyosság)
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {prediction.awayExpectedGoals}
                </div>
                <div className="text-sm text-muted-foreground">
                  {team_analysis.away_team} Várható Gólok
                </div>
              </div>
            </div>
            <div className="mt-6 text-center">
              <Badge variant="secondary" className="text-base px-4 py-2">
                Mindkét Csapat Lő Gólt: {prediction.bothTeamsToScoreProb}%
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team Stats with Progress Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Forma Index</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">{team_analysis.home_team}</span>
                  <span className="font-bold text-primary">
                    {team_analysis.home_form_index}%
                  </span>
                </div>
                <Progress 
                  value={team_analysis.home_form_index} 
                  className="h-2 bg-secondary"
                />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">{team_analysis.away_team}</span>
                  <span className="font-bold text-primary">
                    {team_analysis.away_form_index}%
                  </span>
                </div>
                <Progress 
                  value={team_analysis.away_form_index} 
                  className="h-2 bg-secondary"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Átlagos Gólok</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-2xl font-bold text-goal">
                {team_analysis.average_goals.average_total_goals}
              </div>
              <div className="text-xs text-muted-foreground">meccsenként</div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">BTTS%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-2xl font-bold text-pitch">
                {team_analysis.both_teams_scored_percentage}%
              </div>
              <div className="text-xs text-muted-foreground">mindkét csapat lő</div>
              <Progress 
                value={team_analysis.both_teams_scored_percentage} 
                className="h-2 mt-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">H2H Meccsek</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">
                {team_analysis.matches_count}
              </div>
              <div className="text-xs text-muted-foreground">egymás ellen</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Head to Head Stats with Visual Progress */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-goal" />
            Egymás Elleni Statisztikák
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center mb-6">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">
                {team_analysis.head_to_head_stats.home_wins}
              </div>
              <div className="text-sm text-muted-foreground mb-2">
                {team_analysis.home_team} Győzelmek
              </div>
              <Progress 
                value={team_analysis.head_to_head_stats.home_win_percentage} 
                className="h-3"
              />
              <div className="text-xs text-pitch mt-1">
                {team_analysis.head_to_head_stats.home_win_percentage}%
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-muted-foreground mb-2">
                {team_analysis.head_to_head_stats.draws}
              </div>
              <div className="text-sm text-muted-foreground mb-2">Döntetlenek</div>
              <Progress 
                value={team_analysis.head_to_head_stats.draw_percentage} 
                className="h-3"
              />
              <div className="text-xs text-pitch mt-1">
                {team_analysis.head_to_head_stats.draw_percentage}%
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">
                {team_analysis.head_to_head_stats.away_wins}
              </div>
              <div className="text-sm text-muted-foreground mb-2">
                {team_analysis.away_team} Győzelmek
              </div>
              <Progress 
                value={team_analysis.head_to_head_stats.away_win_percentage} 
                className="h-3"
              />
              <div className="text-xs text-pitch mt-1">
                {team_analysis.head_to_head_stats.away_win_percentage}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};