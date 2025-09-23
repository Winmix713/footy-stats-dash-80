
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Users } from 'lucide-react';
import { type League } from '@/services/supabaseService';

interface LeagueSelectorProps {
  leagues: League[];
  selectedLeagueId?: string;
  onSelectLeague: (leagueId: string) => void;
  isLoading?: boolean;
}

export const LeagueSelector = ({ 
  leagues, 
  selectedLeagueId, 
  onSelectLeague, 
  isLoading = false 
}: LeagueSelectorProps) => {
  if (isLoading) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-goal" />
            Bajnokságok Betöltése...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 bg-secondary rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-goal" />
          Válassz Bajnokságot
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {leagues.map((league) => (
            <Button
              key={league.id}
              variant={selectedLeagueId === league.id ? "default" : "outline"}
              className={`h-auto p-4 justify-start ${
                selectedLeagueId === league.id 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-secondary'
              }`}
              onClick={() => onSelectLeague(league.id)}
            >
              <div className="flex flex-col items-start gap-2 w-full">
                <div className="flex items-center gap-2 w-full">
                  <Users className="w-4 h-4" />
                  <span className="font-semibold">{league.display_name}</span>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {league.country}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {league.season}
                  </Badge>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
