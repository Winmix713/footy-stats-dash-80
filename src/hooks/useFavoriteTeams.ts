
import { useLocalStorage } from './useLocalStorage';
import { useToast } from '@/hooks/use-toast';

export const useFavoriteTeams = () => {
  const [favoriteTeams, setFavoriteTeams] = useLocalStorage<string[]>('favoriteTeams', []);
  const { toast } = useToast();

  const addFavorite = (teamName: string) => {
    if (favoriteTeams.includes(teamName)) {
      toast({
        title: "Már a kedvencek között",
        description: `${teamName} már szerepel a kedvenc csapatok listájában.`,
        variant: "destructive",
      });
      return;
    }

    setFavoriteTeams([...favoriteTeams, teamName]);
    toast({
      title: "Kedvenc hozzáadva",
      description: `${teamName} hozzáadva a kedvenc csapatokhoz.`,
    });
  };

  const removeFavorite = (teamName: string) => {
    setFavoriteTeams(favoriteTeams.filter(team => team !== teamName));
    toast({
      title: "Kedvenc eltávolítva",
      description: `${teamName} eltávolítva a kedvenc csapatokból.`,
    });
  };

  const toggleFavorite = (teamName: string) => {
    if (favoriteTeams.includes(teamName)) {
      removeFavorite(teamName);
    } else {
      addFavorite(teamName);
    }
  };

  const isFavorite = (teamName: string) => favoriteTeams.includes(teamName);

  return {
    favoriteTeams,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    clearFavorites: () => setFavoriteTeams([])
  };
};
