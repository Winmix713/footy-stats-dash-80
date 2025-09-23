import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/hooks/useLanguage';

interface TeamSuggestion {
  name: string;
  confidence: number;
  reason: string;
}

interface TeamSuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalName: string;
  suggestions: TeamSuggestion[];
  onSelectTeam: (teamName: string) => void;
  onSkip: () => void;
}

export function TeamSuggestionModal({
  isOpen,
  onClose,
  originalName,
  suggestions,
  onSelectTeam,
  onSkip
}: TeamSuggestionModalProps) {
  const { t } = useLanguage();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('csvUpload.fixSuggestion')}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              {t('error.teamNotFound')}: <strong>{originalName}</strong>
            </p>
            
            {suggestions.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm font-medium">Suggested matches:</p>
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => onSelectTeam(suggestion.name)}
                  >
                    <div className="flex-1">
                      <p className="font-medium">{suggestion.name}</p>
                      <p className="text-xs text-muted-foreground">{suggestion.reason}</p>
                    </div>
                    <Badge variant="secondary">
                      {suggestion.confidence}%
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No similar teams found. You may need to add this team to the database first.
              </p>
            )}
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onSkip} size="sm">
              Skip
            </Button>
            <Button variant="outline" onClick={onClose} size="sm">
              {t('csvUpload.cancel')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}