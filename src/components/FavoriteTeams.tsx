
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, X, Star } from 'lucide-react';
import { useFavoriteTeams } from '@/hooks/useFavoriteTeams';

interface FavoriteTeamsProps {
  teams: string[];
  onTeamSelect?: (team: string) => void;
}

export const FavoriteTeams = ({ teams, onTeamSelect }: FavoriteTeamsProps) => {
  const { favoriteTeams, toggleFavorite, isFavorite, clearFavorites } = useFavoriteTeams();

  if (favoriteTeams.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-destructive" />
            Kedvenc Csapatok
          </CardTitle>
          <CardDescription>
            Válassz kedvenc csapatokat a gyorsabb hozzáféréshez
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {teams.slice(0, 6).map((team) => (
              <Button
                key={team}
                variant="outline"
                size="sm"
                onClick={() => toggleFavorite(team)}
                className="justify-start"
              >
                <Heart className="w-3 h-3 mr-2" />
                {team}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-goal" />
            Kedvenc Csapatok
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFavorites}
            className="text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <CardDescription>
          Kattints egy csapatra a gyors kiválasztáshoz
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {favoriteTeams.map((team) => (
            <Badge
              key={team}
              variant="secondary"
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors p-2 gap-1"
              onClick={() => onTeamSelect?.(team)}
            >
              <Heart className="w-3 h-3 fill-current" />
              {team}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1 hover:bg-transparent"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(team);
                }}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          ))}
        </div>
        
        {favoriteTeams.length < teams.length && (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground mb-2">További csapatok hozzáadása:</p>
            <div className="grid grid-cols-2 gap-2">
              {teams.filter(team => !isFavorite(team)).slice(0, 4).map((team) => (
                <Button
                  key={team}
                  variant="outline"
                  size="sm"
                  onClick={() => toggleFavorite(team)}
                  className="justify-start"
                >
                  <Heart className="w-3 h-3 mr-2" />
                  {team}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
