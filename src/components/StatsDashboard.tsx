
import { StatsCard } from './StatsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { ApiResponse } from '@/services/footballApi';

interface StatsDashboardProps {
  data: ApiResponse;
}

export const StatsDashboard = ({ data }: StatsDashboardProps) => {
  const { matches, team_analysis } = data;

  // Calculate basic statistics
  const totalMatches = matches.length;
  const totalGoals = matches.reduce((sum, match) => sum + match.score.home + match.score.away, 0);
  const avgGoalsPerMatch = totalMatches > 0 ? (totalGoals / totalMatches).toFixed(2) : '0';
  const bothTeamsScored = matches.filter(m => m.score.home > 0 && m.score.away > 0).length;
  const bothTeamsScoredPercentage = totalMatches > 0 ? Math.round((bothTeamsScored / totalMatches) * 100) : 0;

  // Goals distribution for chart
  const goalsDistribution = Array.from({ length: 6 }, (_, i) => ({
    goals: i.toString(),
    count: matches.filter(m => m.score.home + m.score.away === i).length
  }));

  // Team performance data
  const teamStats = data.teams?.slice(0, 6).map(team => {
    const teamMatches = matches.filter(m => m.home_team === team || m.away_team === team);
    const wins = teamMatches.filter(m => 
      (m.home_team === team && m.score.home > m.score.away) ||
      (m.away_team === team && m.score.away > m.score.home)
    ).length;
    return {
      team: team.length > 10 ? team.substring(0, 10) + '...' : team,
      wins,
      matches: teamMatches.length
    };
  }) || [];

  const chartConfig = {
    count: {
      label: "Meccsek száma",
      color: "hsl(var(--primary))",
    },
    wins: {
      label: "Győzelmek",
      color: "hsl(var(--primary))",
    },
  };

  const pieColors = [
    "hsl(var(--primary))",
    "hsl(var(--secondary))",
    "hsl(var(--accent))",
    "hsl(var(--muted))",
    "hsl(var(--destructive))",
    "hsl(var(--success))"
  ];

  return (
    <div className="space-y-6">
      {/* Key Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Összes Meccs"
          value={totalMatches}
          description="Elemzett mérkőzések"
          type="default"
          change={12}
        />
        <StatsCard
          title="Átlag Gólok"
          value={avgGoalsPerMatch}
          description="Meccsenkénti átlag"
          type="goals"
          progress={parseFloat(avgGoalsPerMatch) * 20}
        />
        <StatsCard
          title="BTTS Arány"
          value={`${bothTeamsScoredPercentage}%`}
          description="Mindkét csapat lőtt gólt"
          type="performance"
          change={bothTeamsScoredPercentage > 50 ? 8 : -3}
          progress={bothTeamsScoredPercentage}
        />
        <StatsCard
          title="Összes Gól"
          value={totalGoals}
          description="Az összes mérkőzésen"
          type="wins"
          change={5}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Goals Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Gólok Eloszlása</CardTitle>
            <CardDescription>
              Meccsenkénti gólszám megoszlása
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <BarChart data={goalsDistribution}>
                <XAxis 
                  dataKey="goals" 
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis 
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar 
                  dataKey="count" 
                  fill="var(--color-count)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Team Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Csapat Teljesítmény</CardTitle>
            <CardDescription>
              Győzelmek száma csapatonként
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <LineChart data={teamStats}>
                <XAxis 
                  dataKey="team" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis 
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="wins" 
                  stroke="var(--color-wins)" 
                  strokeWidth={2}
                  dot={{ fill: "var(--color-wins)", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Team Analysis Enhanced View */}
      {team_analysis && (
        <Card>
          <CardHeader>
            <CardTitle>Részletes Csapat Analízis</CardTitle>
            <CardDescription>
              {team_analysis.home_team} vs {team_analysis.away_team}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatsCard
                title="Hazai Forma"
                value={team_analysis.home_form_index}
                description="Forma index"
                type="performance"
                progress={team_analysis.home_form_index}
              />
              <StatsCard
                title="Vendég Forma"
                value={team_analysis.away_form_index}
                description="Forma index"
                type="performance"
                progress={team_analysis.away_form_index}
              />
              <StatsCard
                title="H2H Meccsek"
                value={team_analysis.matches_count}
                description="Egymás elleni mérkőzések"
                type="default"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
