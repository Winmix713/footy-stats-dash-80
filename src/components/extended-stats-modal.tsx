import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@heroui/react';
import { Icon } from '@iconify/react';

// Types
interface Team {
  id: string;
  name: string;
  logo?: string;
}

interface FrequentResult {
  result: string;
  count: number;
  percentage: number;
}

interface MatchStats {
  total: number;
  homeWins: number;
  draws: number;
  awayWins: number;
  homeGoals: number;
  awayGoals: number;
  bttsCount: number;
  comebackCount: number;
  frequentResults?: FrequentResult[];
}

interface ColorScheme {
  total: string;
  homeWins: string;
  draws: string;
  awayWins: string;
  homeGoalAvg: string;
  awayGoalAvg: string;
}

interface ExtendedStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedHomeTeam: Team | null;
  selectedAwayTeam: Team | null;
  stats: MatchStats;
  colorScheme?: ColorScheme;
  locale?: string;
}

// Default color scheme
const defaultColorScheme: ColorScheme = {
  total: 'emerald',
  homeWins: 'emerald', 
  draws: 'amber',
  awayWins: 'sky',
  homeGoalAvg: 'violet',
  awayGoalAvg: 'indigo'
};

// Translations
const translations = {
  'hu-HU': {
    title: 'Bővített statisztika',
    homeTeam: 'Hazai csapat',
    awayTeam: 'Vendég csapat',
    allHomeTeams: 'Összes hazai csapat',
    allAwayTeams: 'Összes vendég csapat',
    matchCount: 'Mérkőzések száma',
    homeWins: 'Hazai győzelmek (H)',
    draws: 'Döntetlenek (D)',
    awayWins: 'Vendég győzelmek (A)',
    homeGoalAvg: 'Hazai gól átlag',
    awayGoalAvg: 'Vendég gól átlag',
    bttsInfo: 'Összes mérkőzésből hány mérkőzésen szerzett mind a két csapat gólt (btts_computed):',
    comebackInfo: 'Fordítások aránya az összes mérkőzéshez képest (comeback_computed):',
    frequentResults: 'Leggyakoribb eredmények',
    matches: 'mérkőzés',
    noData: 'Nincs elegendő adat',
    databaseInfo: 'Adatbázis információ',
    databaseDesc: 'A statisztikák a PostgreSQL adatbázisban tárolt matches tábla alapján készültek.',
    computedFields: 'A tábla automatikusan számított mezőket használ:',
    close: 'Bezárás',
    closeAriaLabel: 'Modal bezárása'
  },
  'en-US': {
    title: 'Extended Statistics',
    homeTeam: 'Home Team',
    awayTeam: 'Away Team',
    allHomeTeams: 'All Home Teams',
    allAwayTeams: 'All Away Teams',
    matchCount: 'Number of Matches',
    homeWins: 'Home Wins (H)',
    draws: 'Draws (D)',
    awayWins: 'Away Wins (A)',
    homeGoalAvg: 'Home Goal Average',
    awayGoalAvg: 'Away Goal Average',
    bttsInfo: 'Percentage of matches where both teams scored (btts_computed):',
    comebackInfo: 'Comeback ratio compared to all matches (comeback_computed):',
    frequentResults: 'Most Frequent Results',
    matches: 'matches',
    noData: 'Insufficient data',
    databaseInfo: 'Database Information',
    databaseDesc: 'Statistics are based on the matches table stored in PostgreSQL database.',
    computedFields: 'The table uses automatically computed fields:',
    close: 'Close',
    closeAriaLabel: 'Close modal'
  }
};

export const ExtendedStatsModal: React.FC<ExtendedStatsModalProps> = ({
  isOpen,
  onClose,
  selectedHomeTeam,
  selectedAwayTeam,
  stats,
  colorScheme = defaultColorScheme,
  locale = 'hu-HU'
}) => {
  // Get translations
  const t = translations[locale as keyof typeof translations] || translations['hu-HU'];
  
  // Memoized calculations for better performance
  const statsData = React.useMemo(() => {
    const safeTotal = Math.max(stats.total, 1); // Avoid division by zero
    return {
      homeGoalAvg: stats.total > 0 ? (stats.homeGoals / stats.total).toFixed(2) : '0.0',
      awayGoalAvg: stats.total > 0 ? (stats.awayGoals / stats.total).toFixed(2) : '0.0',
      bttsPercentage: stats.total > 0 ? ((stats.bttsCount / stats.total) * 100).toFixed(1) : '0',
      comebackPercentage: stats.total > 0 ? ((stats.comebackCount / stats.total) * 100).toFixed(1) : '0'
    };
  }, [stats]);

  // Safe frequent results with fallback
  const frequentResults = stats.frequentResults || [];

  // Default logo fallback
  const defaultLogo = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM0Yjc2ODgiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyem0wIDE4Yy00LjQyIDAtOC0zLjU4LTgtOHMzLjU4LTggOC04IDggMy41OCA4IDgtMy41OCA4LTggOHoiIGZpbGw9IndoaXRlIi8+CjwvcGF0aD4KPC9zdmc+Cjwvc3ZnPgo=';

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = defaultLogo;
  };

  const getStatCardClasses = (color: string) => {
    return `rounded-xl bg-${color}-500/10 ring-1 ring-${color}-400/30 p-4 text-center`;
  };

  const getStatTextClasses = (color: string) => {
    return `text-2xl font-semibold tracking-tight text-${color}-300`;
  };

  const getStatSubtextClasses = (color: string) => {
    return `text-xs text-${color}-200 mt-1`;
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="3xl"
      backdrop="blur"
      className="modal-animation"
      role="dialog"
      aria-labelledby="stats-modal-title"
      aria-describedby="stats-modal-description"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="px-6 pt-6 pb-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:chart-line" className="text-violet-300" width={20} height={20} />
                  <h3 id="stats-modal-title" className="text-2xl font-semibold tracking-tight">
                    {t.title}
                  </h3>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 items-center gap-4 rounded-xl bg-white/5 ring-1 ring-white/10 p-4">
                <div className="flex items-center gap-3">
                  {selectedHomeTeam ? (
                    <>
                      {selectedHomeTeam.logo && (
                        <img 
                          src={selectedHomeTeam.logo} 
                          alt={`${selectedHomeTeam.name} logo`}
                          className="h-10 w-10 rounded-full ring-1 ring-white/10 object-cover"
                          loading="lazy"
                          onError={handleImageError}
                        />
                      )}
                      <div>
                        <div className="font-medium text-white">{selectedHomeTeam.name}</div>
                        <div className="text-xs text-zinc-400">{t.homeTeam}</div>
                      </div>
                    </>
                  ) : (
                    <div className="font-medium text-white">{t.allHomeTeams}</div>
                  )}
                </div>
                <div className="text-center">
                  <span className="inline-flex items-center gap-2 text-zinc-300">
                    <Icon icon="lucide:circle-dot" width={16} height={16} />
                    vs
                    <Icon icon="lucide:circle" width={16} height={16} />
                  </span>
                </div>
                <div className="flex items-center justify-end gap-3">
                  <div className="text-right">
                    {selectedAwayTeam ? (
                      <>
                        <div className="font-medium text-white">{selectedAwayTeam.name}</div>
                        <div className="text-xs text-zinc-400">{t.awayTeam}</div>
                      </>
                    ) : (
                      <div className="font-medium text-white">{t.allAwayTeams}</div>
                    )}
                  </div>
                  {selectedAwayTeam?.logo && (
                    <img 
                      src={selectedAwayTeam.logo} 
                      alt={`${selectedAwayTeam.name} logo`}
                      className="h-10 w-10 rounded-full ring-1 ring-white/10 object-cover"
                      loading="lazy"
                      onError={handleImageError}
                    />
                  )}
                </div>
              </div>
            </ModalHeader>
            
            <ModalBody className="px-6 py-6" id="stats-modal-description">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4" role="group" aria-label="Match statistics">
                <div className={getStatCardClasses(colorScheme.total)}>
                  <div className={getStatTextClasses(colorScheme.total)}>{stats.total}</div>
                  <div className={getStatSubtextClasses(colorScheme.total)}>{t.matchCount}</div>
                </div>
                <div className={getStatCardClasses(colorScheme.homeWins)}>
                  <div className={getStatTextClasses(colorScheme.homeWins)}>{stats.homeWins}</div>
                  <div className={getStatSubtextClasses(colorScheme.homeWins)}>{t.homeWins}</div>
                </div>
                <div className={getStatCardClasses(colorScheme.draws)}>
                  <div className={getStatTextClasses(colorScheme.draws)}>{stats.draws}</div>
                  <div className={getStatSubtextClasses(colorScheme.draws)}>{t.draws}</div>
                </div>
                <div className={getStatCardClasses(colorScheme.awayWins)}>
                  <div className={getStatTextClasses(colorScheme.awayWins)}>{stats.awayWins}</div>
                  <div className={getStatSubtextClasses(colorScheme.awayWins)}>{t.awayWins}</div>
                </div>
                <div className={getStatCardClasses(colorScheme.homeGoalAvg)}>
                  <div className={getStatTextClasses(colorScheme.homeGoalAvg)}>{statsData.homeGoalAvg}</div>
                  <div className={getStatSubtextClasses(colorScheme.homeGoalAvg)}>{t.homeGoalAvg}</div>
                </div>
                <div className={getStatCardClasses(colorScheme.awayGoalAvg)}>
                  <div className={getStatTextClasses(colorScheme.awayGoalAvg)}>{statsData.awayGoalAvg}</div>
                  <div className={getStatSubtextClasses(colorScheme.awayGoalAvg)}>{t.awayGoalAvg}</div>
                </div>
              </div>

              <div className="mt-6 rounded-xl bg-white/5 ring-1 ring-white/10 p-4" role="region" aria-label="Additional statistics">
                <div className="text-sm text-zinc-300 mb-2">
                  {t.bttsInfo}
                  <span className="font-semibold"> {statsData.bttsPercentage}%</span>
                </div>
                <div className="text-sm text-zinc-300">
                  {t.comebackInfo}
                  <span className="font-semibold"> {statsData.comebackPercentage}%</span>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-medium text-zinc-200 mb-2 inline-flex items-center gap-2">
                  <Icon icon="lucide:trophy" width={16} height={16} />
                  {t.frequentResults}
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-zinc-300" role="list">
                  {frequentResults.map((result, index) => (
                    <li key={`${result.result}-${index}`} role="listitem">
                      {result.result} ({result.count} {t.matches}, {result.percentage.toFixed(1)}%)
                    </li>
                  ))}
                  {frequentResults.length === 0 && (
                    <li className="text-zinc-400" role="listitem">{t.noData}</li>
                  )}
                </ol>
              </div>

              <div className="mt-6">
                <h4 className="font-medium text-zinc-200 mb-2 inline-flex items-center gap-2">
                  <Icon icon="lucide:info" width={16} height={16} />
                  {t.databaseInfo}
                </h4>
                <div className="rounded-xl bg-white/5 ring-1 ring-white/10 p-4 text-xs text-zinc-400">
                  <p className="mb-1">{t.databaseDesc}</p>
                  <p className="mb-1">{t.computedFields}</p>
                  <ul className="list-disc list-inside space-y-1 pl-2">
                    <li><code className="bg-white/10 px-1 py-0.5 rounded">btts_computed</code>: Both teams scored</li>
                    <li><code className="bg-white/10 px-1 py-0.5 rounded">comeback_computed</code>: Comeback occurred</li>
                    <li><code className="bg-white/10 px-1 py-0.5 rounded">result_computed</code>: Match result (H/D/A)</li>
                  </ul>
                </div>
              </div>
            </ModalBody>
            
            <ModalFooter className="px-6 py-4 border-t border-white/10 flex justify-end">
              <Button 
                variant="flat" 
                color="default"
                className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm text-zinc-200 border border-white/10 hover:bg-white/5 focus:ring-2 focus:ring-violet-500 focus:outline-none"
                onPress={onClose}
                aria-label={t.closeAriaLabel}
              >
                <Icon icon="lucide:x" width={16} height={16} />
                {t.close}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};