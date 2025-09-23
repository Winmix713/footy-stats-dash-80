
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar, Target } from 'lucide-react';
import { type ApiResponse } from '@/services/footballApi';

interface MatchListProps {
  data: ApiResponse;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
}

export const MatchList = ({ data, onPageChange, isLoading }: MatchListProps) => {
  // Handle undefined data.matches safely
  const matches = data?.matches || [];
  const totalMatches = data?.total_matches || 0;
  const currentPage = data?.page || 1;
  const pageSize = data?.page_size || 20;
  
  const totalPages = Math.ceil(totalMatches / pageSize);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      onPageChange?.(newPage);
    }
  };

  const bothTeamsScored = (match: { score: { home: number; away: number } }) => {
    return match.score?.home > 0 && match.score?.away > 0;
  };

  const getPageNumbers = () => {
    const pages = [];
    const showPages = 5;
    
    if (totalPages <= showPages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= showPages; i++) {
          pages.push(i);
        }
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - showPages + 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pages.push(i);
        }
      }
    }
    
    return pages;
  };

  if (isLoading) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-goal" />
            Meccsek betöltése...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-goal" />
          Meccs Eredmények
        </CardTitle>
        <CardDescription>
          {matches.length} meccs megjelenítve a {totalMatches.toLocaleString('hu-HU')} találatból
          {totalPages > 1 && ` • ${currentPage}. oldal ${totalPages}-ból`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {matches.map((match, index) => (
            <div 
              key={match.id || `${match.home_team}-${match.away_team}-${index}`}
              className="flex items-center justify-between p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors border border-border/50"
            >
              <div className="flex items-center space-x-4 flex-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-[100px]">
                  <Calendar className="w-4 h-4" />
                  {new Date(match.date).toLocaleDateString('hu-HU')}
                </div>
                
                <div className="flex items-center space-x-4 flex-1 justify-center">
                  <div className="text-sm font-medium text-right min-w-[140px] truncate">
                    {match.home_team}
                  </div>
                  <div className="flex items-center gap-2 min-w-[120px] justify-center">
                    <div className="text-xl font-bold text-pitch bg-background px-3 py-1 rounded border">
                      {match.score.home} - {match.score.away}
                    </div>
                    {bothTeamsScored(match) && (
                      <Badge variant="secondary" className="text-xs">
                        <Target className="w-3 h-3 mr-1" />
                        BTTS
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm font-medium text-left min-w-[140px] truncate">
                    {match.away_team}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
            >
              Első
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              Előző
            </Button>
            
            <div className="flex space-x-1">
              {getPageNumbers().map((pageNum) => (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                  className="w-10 h-8 p-0"
                >
                  {pageNum}
                </Button>
              ))}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Következő
              <ChevronRight className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
            >
              Utolsó
            </Button>
          </div>
        )}
        
        <div className="text-center text-sm text-muted-foreground mt-4">
          {totalMatches > 0 && (
            <>
              {((currentPage - 1) * pageSize + 1).toLocaleString('hu-HU')} - {Math.min(currentPage * pageSize, totalMatches).toLocaleString('hu-HU')} / {totalMatches.toLocaleString('hu-HU')} meccs
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
