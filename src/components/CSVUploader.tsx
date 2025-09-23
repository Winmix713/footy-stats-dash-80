
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, CheckCircle, AlertCircle, Calendar, Download, AlertTriangle, XCircle } from 'lucide-react';
import { supabaseService } from '@/services/supabaseService';
import { TeamSuggestionModal } from './TeamSuggestionModal';
import { findBestTeamMatch } from '@/utils/teamNameMatcher';
import { useLanguage } from '@/hooks/useLanguage';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface CSVUploaderProps {
  leagueId: string;
  leagueName: string;
  onUploadComplete: () => void;
}

interface ParsedMatch {
  match_time: string;
  home_team: string;
  away_team: string;
  half_time_home_goals: number;
  half_time_away_goals: number;
  full_time_home_goals: number;
  full_time_away_goals: number;
  hasError?: boolean;
  errorMessage?: string;
  errorType?: 'team_not_found' | 'invalid_time' | 'invalid_goals' | 'duplicate' | 'database_error';
  suggestions?: Array<{ name: string; confidence: number; reason: string }>;
  correctedHomeTeam?: string;
  correctedAwayTeam?: string;
}

interface ValidationError {
  type: 'team_not_found' | 'invalid_time' | 'invalid_goals' | 'duplicate' | 'database_error';
  message: string;
  suggestions?: Array<{ name: string; confidence: number; reason: string }>;
}

export const CSVUploader = ({ leagueId, leagueName, onUploadComplete }: CSVUploaderProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedMatch[]>([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [uploadDate, setUploadDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [availableTeams, setAvailableTeams] = useState<string[]>([]);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [currentSuggestion, setCurrentSuggestion] = useState<{
    matchIndex: number;
    field: 'home' | 'away';
    originalName: string;
    suggestions: Array<{ name: string; confidence: number; reason: string }>;
  } | null>(null);
  const { toast } = useToast();
  const { t, language } = useLanguage();
  
  // Load teams when component mounts
  useEffect(() => {
    const loadTeams = async () => {
      try {
        const teams = await supabaseService.getTeamsByLeague(leagueId);
        setAvailableTeams(teams.map(team => team.name));
      } catch (error) {
        console.error('Error loading teams:', error);
      }
    };
    loadTeams();
  }, [leagueId]);

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i += 2;
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
          i++;
        }
      } else if (char === ',' && !inQuotes) {
        // Field separator
        result.push(current.trim());
        current = '';
        i++;
      } else {
        current += char;
        i++;
      }
    }
    
    // Add the last field
    result.push(current.trim());
    return result;
  };

  const validateMatch = (match: ParsedMatch): ValidationError | null => {
    // Check for empty team names
    if (!match.home_team || !match.away_team) {
      return { 
        type: 'invalid_goals', 
        message: t('error.teamNotFound')
      };
    }

    // Check if goals are valid numbers
    if (isNaN(match.half_time_home_goals) || isNaN(match.half_time_away_goals) ||
        isNaN(match.full_time_home_goals) || isNaN(match.full_time_away_goals)) {
      return { 
        type: 'invalid_goals', 
        message: t('error.invalidGoals') 
      };
    }

    // Check if halftime goals are not greater than fulltime goals
    if (match.half_time_home_goals > match.full_time_home_goals ||
        match.half_time_away_goals > match.full_time_away_goals) {
      return { 
        type: 'invalid_goals', 
        message: language === 'en' ? 'Halftime goals cannot be greater than fulltime goals' : 'Félidei gólok nem lehetnek nagyobbak a végeredménynél'
      };
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(match.match_time)) {
      return { 
        type: 'invalid_time', 
        message: t('error.invalidTimeFormat') 
      };
    }

    return null;
  };

  // Enhanced team validation with fuzzy matching
  const validateTeams = (match: ParsedMatch): ValidationError[] => {
    const errors: ValidationError[] = [];
    
    // Check home team
    const homeMatch = findBestTeamMatch(match.home_team, availableTeams, 0.6);
    if (!homeMatch.exactMatch && homeMatch.suggestions.length === 0) {
      errors.push({
        type: 'team_not_found',
        message: `${t('error.teamNotFound')}: ${match.home_team}`,
        suggestions: []
      });
    } else if (!homeMatch.exactMatch && homeMatch.suggestions.length > 0) {
      match.suggestions = homeMatch.suggestions;
      errors.push({
        type: 'team_not_found', 
        message: `${t('error.teamNotFound')}: ${match.home_team}`,
        suggestions: homeMatch.suggestions
      });
    }

    // Check away team
    const awayMatch = findBestTeamMatch(match.away_team, availableTeams, 0.6);
    if (!awayMatch.exactMatch && awayMatch.suggestions.length === 0) {
      errors.push({
        type: 'team_not_found',
        message: `${t('error.teamNotFound')}: ${match.away_team}`,
        suggestions: []
      });
    } else if (!awayMatch.exactMatch && awayMatch.suggestions.length > 0) {
      if (!match.suggestions) match.suggestions = [];
      match.suggestions.push(...awayMatch.suggestions);
      errors.push({
        type: 'team_not_found',
        message: `${t('error.teamNotFound')}: ${match.away_team}`,
        suggestions: awayMatch.suggestions
      });
    }

    return errors;
  };

  const parseCSV = (csvText: string): ParsedMatch[] => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    // Skip header row
    const dataLines = lines.slice(1);
    const matches: ParsedMatch[] = [];

    dataLines.forEach((line, index) => {
      const columns = parseCSVLine(line);
      
      if (columns.length >= 7) {
        try {
          const match: ParsedMatch = {
            match_time: columns[0],
            home_team: columns[1],
            away_team: columns[2],
            half_time_home_goals: parseInt(columns[3]) || 0,
            half_time_away_goals: parseInt(columns[4]) || 0,
            full_time_home_goals: parseInt(columns[5]) || 0,
            full_time_away_goals: parseInt(columns[6]) || 0
          };

          // Validate basic match data
          const basicValidation = validateMatch(match);
          if (basicValidation) {
            match.hasError = true;
            match.errorMessage = basicValidation.message;
            match.errorType = basicValidation.type;
          }

          // Validate teams and get suggestions
          const teamValidation = validateTeams(match);
          if (teamValidation.length > 0) {
            match.hasError = true;
            if (!match.errorMessage) {
              match.errorMessage = teamValidation[0].message;
              match.errorType = teamValidation[0].type;
            }
          }

          matches.push(match);
        } catch (error) {
          console.warn(`${language === 'en' ? 'Error processing row' : 'Hiba a sor feldolgozásakor'} ${index + 2}:`, error);
          matches.push({
            match_time: columns[0] || '',
            home_team: columns[1] || '',
            away_team: columns[2] || '',
            half_time_home_goals: 0,
            half_time_away_goals: 0,
            full_time_home_goals: 0,
            full_time_away_goals: 0,
            hasError: true,
            errorMessage: language === 'en' ? 'Processing error' : 'Feldolgozási hiba',
            errorType: 'database_error'
          });
        }
      }
    });

    return matches;
  };

  // Export errors to CSV
  const exportErrors = () => {
    const errorMatches = parsedData.filter(m => m.hasError);
    if (errorMatches.length === 0) return;

    const csvHeader = 'match_time,home_team,away_team,half_time_home_goals,half_time_away_goals,full_time_home_goals,full_time_away_goals,error_message,suggestions\n';
    const csvContent = errorMatches.map(match => {
      const suggestions = match.suggestions?.map(s => `${s.name} (${s.confidence}%)`).join('; ') || '';
      return `"${match.match_time}","${match.home_team}","${match.away_team}",${match.half_time_home_goals},${match.half_time_away_goals},${match.full_time_home_goals},${match.full_time_away_goals},"${match.errorMessage}","${suggestions}"`;
    }).join('\n');

    const blob = new Blob([csvHeader + csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${leagueName}_errors_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle team suggestion selection
  const handleTeamSuggestionSelect = (teamName: string) => {
    if (!currentSuggestion) return;
    
    const newData = [...parsedData];
    const match = newData[currentSuggestion.matchIndex];
    
    if (currentSuggestion.field === 'home') {
      match.correctedHomeTeam = teamName;
      match.home_team = teamName;
    } else {
      match.correctedAwayTeam = teamName;
      match.away_team = teamName;
    }
    
    // Re-validate after correction
    const teamValidation = validateTeams(match);
    if (teamValidation.length === 0) {
      match.hasError = false;
      match.errorMessage = undefined;
      match.errorType = undefined;
    }
    
    setParsedData(newData);
    setShowSuggestionModal(false);
    setCurrentSuggestion(null);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: language === 'en' ? 'Invalid file format' : 'Hibás fájlformátum',
        description: language === 'en' ? 'Please upload a CSV file only.' : 'Kérjük, csak CSV fájlt töltsön fel.',
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
    
    try {
      const text = await selectedFile.text();
      const parsed = parseCSV(text);
      setParsedData(parsed);
      setPreviewMode(true);
      
      const validMatches = parsed.filter(m => !m.hasError).length;
      const errorMatches = parsed.filter(m => m.hasError).length;
      
      toast({
        title: language === 'en' ? 'CSV processed' : 'CSV feldolgozva',
        description: language === 'en' 
          ? `${validMatches} valid matches, ${errorMatches} error matches found.`
          : `${validMatches} érvényes meccs, ${errorMatches} hibás meccs találva.`,
        variant: errorMatches > 0 ? "destructive" : "default",
      });
    } catch (error) {
      toast({
        title: language === 'en' ? 'Error reading file' : 'Hiba a fájl olvasásakor',
        description: language === 'en' ? 'Could not process the CSV file.' : 'Nem sikerült feldolgozni a CSV fájlt.',
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    const validMatches = parsedData.filter(m => !m.hasError);
    
    if (!validMatches.length) {
      toast({
        title: language === 'en' ? 'No valid data' : 'Nincs érvényes adat',
        description: language === 'en' ? 'Please fix the errors or upload a valid CSV file.' : 'Kérjük, javítsa ki a hibákat vagy töltsön fel egy érvényes CSV fájlt.',
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Get teams for this league
      const teams = await supabaseService.getTeamsByLeague(leagueId);
      const teamMap = new Map(teams.map(team => [team.name.toLowerCase(), team.id]));

      let successCount = 0;
      let errorCount = 0;

      for (const match of validMatches) {
        try {
          // Find team IDs
          const homeTeamId = teamMap.get(match.home_team.toLowerCase());
          const awayTeamId = teamMap.get(match.away_team.toLowerCase());

          if (!homeTeamId || !awayTeamId) {
            console.warn(`Csapat nem található: ${match.home_team} vs ${match.away_team}`);
            errorCount++;
            continue;
          }

          // Create full datetime from upload date and match time
          const matchDateTime = new Date(`${uploadDate}T${match.match_time}:00`);
          
          if (isNaN(matchDateTime.getTime())) {
            console.warn(`Érvénytelen idő: ${match.match_time}`);
            errorCount++;
            continue;
          }

          // Insert match
          await supabaseService.insertMatch({
            league_id: leagueId,
            home_team_id: homeTeamId,
            away_team_id: awayTeamId,
            match_time: matchDateTime.toISOString(),
            half_time_home_goals: match.half_time_home_goals,
            half_time_away_goals: match.half_time_away_goals,
            full_time_home_goals: match.full_time_home_goals,
            full_time_away_goals: match.full_time_away_goals
          });

          successCount++;
        } catch (error) {
          console.error('Hiba meccs mentésekor:', error);
          errorCount++;
        }
      }

      toast({
        title: "Feltöltés befejezve",
        description: `${successCount} meccs sikeresen mentve. ${errorCount > 0 ? `${errorCount} hiba történt.` : ''}`,
        variant: successCount > 0 ? "default" : "destructive",
      });

      if (successCount > 0) {
        setFile(null);
        setParsedData([]);
        setPreviewMode(false);
        onUploadComplete();
      }

    } catch (error) {
      toast({
        title: "Hiba történt",
        description: "Nem sikerült menteni az adatokat.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const validCount = parsedData.filter(m => !m.hasError).length;
  const errorCount = parsedData.filter(m => m.hasError).length;

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            {t('csvUpload.title')} - {leagueName}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="upload-date" className="text-sm font-medium">
              {t('csvUpload.uploadDate')}
            </label>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <Input
                id="upload-date"
                type="date"
                value={uploadDate}
                onChange={(e) => setUploadDate(e.target.value)}
                disabled={isUploading}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {language === 'en' 
                ? 'This date will be combined with the time in the CSV'
                : 'Ez a dátum lesz kombinálva a CSV-ben található idővel'
              }
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="csv-upload" className="text-sm font-medium">
              {t('csvUpload.selectFile')}
            </label>
            <Input
              id="csv-upload"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={isUploading}
            />
            <p className="text-xs text-muted-foreground">
              {language === 'en' 
                ? 'Format: "match_time","home_team","away_team","half_time_home_goals","half_time_away_goals","full_time_home_goals","full_time_away_goals"'
                : 'Formátum: "match_time","home_team","away_team","half_time_home_goals","half_time_away_goals","full_time_home_goals","full_time_away_goals"'
              }
            </p>
          </div>

          {file && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="w-4 h-4" />
              {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </div>
          )}

          {previewMode && parsedData.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{t('csvUpload.preview')}</h4>
                <div className="flex gap-4 text-sm">
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="w-3 h-3" />
                    {validCount} {t('csvUpload.validMatches')}
                  </span>
                  {errorCount > 0 && (
                    <>
                      <span className="flex items-center gap-1 text-red-600">
                        <XCircle className="w-3 h-3" />
                        {errorCount} {t('csvUpload.errorMatches')}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={exportErrors}
                        className="flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        {t('csvUpload.exportErrors')}
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {errorCount > 0 && (
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    {language === 'en' 
                      ? 'Some matches have errors. Click on a match below to see suggestions for fixing team names.'
                      : 'Néhány meccsben hibák vannak. Kattintson egy meccsre alább a csapatnevek javítási javaslataiért.'
                    }
                  </AlertDescription>
                </Alert>
              )}

              <div className="max-h-80 overflow-y-auto border rounded-lg">
                <div className="space-y-1 p-3">
                  {parsedData.slice(0, 15).map((match, index) => (
                    <div 
                      key={index} 
                      className={`p-3 rounded-lg border transition-colors ${
                        match.hasError 
                          ? 'bg-red-50 border-red-200 hover:bg-red-100' 
                          : 'bg-green-50 border-green-200'
                      } ${match.hasError && match.suggestions?.length ? 'cursor-pointer' : ''}`}
                      onClick={() => {
                        if (match.hasError && match.suggestions?.length) {
                          setCurrentSuggestion({
                            matchIndex: index,
                            field: 'home', // Start with home team
                            originalName: match.home_team,
                            suggestions: match.suggestions
                          });
                          setShowSuggestionModal(true);
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-mono text-sm">
                          <span className="text-muted-foreground">{uploadDate} {match.match_time}</span>
                          <span className="mx-2">-</span>
                          <span className={match.correctedHomeTeam ? 'line-through text-muted-foreground' : ''}>
                            {match.home_team}
                          </span>
                          {match.correctedHomeTeam && (
                            <span className="text-green-600 font-medium"> → {match.correctedHomeTeam}</span>
                          )}
                          <span className="mx-1">vs</span>
                          <span className={match.correctedAwayTeam ? 'line-through text-muted-foreground' : ''}>
                            {match.away_team}
                          </span>
                          {match.correctedAwayTeam && (
                            <span className="text-green-600 font-medium"> → {match.correctedAwayTeam}</span>
                          )}
                          <span className="ml-2 text-muted-foreground">
                            ({match.half_time_home_goals}:{match.half_time_away_goals} → {match.full_time_home_goals}:{match.full_time_away_goals})
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {match.suggestions?.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {language === 'en' ? 'Has suggestions' : 'Van javaslat'}
                            </Badge>
                          )}
                          {match.hasError ? (
                            <XCircle className="w-4 h-4 text-red-500" />
                          ) : (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                      </div>
                      {match.errorMessage && (
                        <div className="mt-2 text-xs">
                          <Badge variant="destructive" className="text-xs">
                            {match.errorType === 'team_not_found' ? (language === 'en' ? 'Team not found' : 'Csapat nem található') :
                             match.errorType === 'invalid_time' ? (language === 'en' ? 'Invalid time' : 'Érvénytelen idő') :
                             match.errorType === 'invalid_goals' ? (language === 'en' ? 'Invalid goals' : 'Érvénytelen gólok') :
                             (language === 'en' ? 'Error' : 'Hiba')}
                          </Badge>
                          <p className="text-red-600 mt-1">{match.errorMessage}</p>
                        </div>
                      )}
                    </div>
                  ))}
                  {parsedData.length > 15 && (
                    <div className="py-2 text-muted-foreground text-center text-sm">
                      {language === 'en' 
                        ? `... and ${parsedData.length - 15} more matches`
                        : `... és még ${parsedData.length - 15} meccs`
                      }
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            <Button 
              onClick={handleSave}
              disabled={!previewMode || isUploading || validCount === 0}
              className="flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              {isUploading ? t('csvUpload.saving') : `${t('csvUpload.save')} (${validCount})`}
            </Button>
            
            {previewMode && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setPreviewMode(false);
                  setParsedData([]);
                  setFile(null);
                }}
              >
                {t('csvUpload.cancel')}
              </Button>
            )}

            {errorCount > 0 && (
              <Button
                variant="secondary"
                onClick={exportErrors}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                {t('csvUpload.exportErrors')}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <TeamSuggestionModal
        isOpen={showSuggestionModal}
        onClose={() => setShowSuggestionModal(false)}
        originalName={currentSuggestion?.originalName || ''}
        suggestions={currentSuggestion?.suggestions || []}
        onSelectTeam={handleTeamSuggestionSelect}
        onSkip={() => {
          setShowSuggestionModal(false);
          setCurrentSuggestion(null);
        }}
      />
    </>
  );
};
