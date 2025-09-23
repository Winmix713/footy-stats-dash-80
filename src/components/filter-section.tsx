import React, { useCallback, useMemo } from 'react';
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Autocomplete, AutocompleteItem } from '@heroui/react';
import { Icon } from '@iconify/react';
import { spanishTeams } from '../data/spanish-teams';

interface ColorScheme {
  primary: string;
  secondary: string;
  border: string;
  background: string;
}

interface FilterSectionProps {
  selectedHomeTeam: { id: string; name: string } | null;
  selectedAwayTeam: { id: string; name: string } | null;
  selectedBTTS: boolean | null;
  selectedComeback: boolean | null;
  onHomeTeamChange: (team: { id: string; name: string } | null) => void;
  onAwayTeamChange: (team: { id: string; name: string } | null) => void;
  onBTTSChange: (value: boolean | null) => void;
  onComebackChange: (value: boolean | null) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
  onExportCSV: () => void;
  
  // New enhancement props
  colorScheme?: ColorScheme;
  disabled?: boolean;
  loading?: boolean;
  onError?: (error: string) => void;
  
  // i18n support
  labels?: {
    filters: string;
    apply: string;
    reset: string;
    export: string;
    homeTeam: string;
    awayTeam: string;
    btts: string;
    comeback: string;
    startDate: string;
    endDate: string;
    search: string;
    selectAny: string;
    yes: string;
    no: string;
    bttsDescription: string;
    comebackDescription: string;
  };
}

const defaultLabels = {
  filters: 'Szűrők',
  apply: 'Szűrés',
  reset: 'Visszaállítás',
  export: 'CSV Export',
  homeTeam: 'Hazai csapat',
  awayTeam: 'Vendég csapat',
  btts: 'Mindkét csapat gólt szerzett',
  comeback: 'Fordítás történt',
  search: 'Keresés...',
  selectAny: '-- Bármelyik --',
  yes: 'Igen',
  no: 'Nem',
  bttsDescription: 'btts_computed mező alapján',
  comebackDescription: 'comeback_computed mező alapján'
};

const defaultColorScheme: ColorScheme = {
  primary: 'from-violet-500 to-indigo-600',
  secondary: 'from-fuchsia-500 to-violet-600',
  border: 'ring-white/10 border-white/10',
  background: 'bg-white/5'
};

export const FilterSection: React.FC<FilterSectionProps> = ({
  selectedHomeTeam,
  selectedAwayTeam,
  selectedBTTS,
  selectedComeback,
  onHomeTeamChange,
  onAwayTeamChange,
  onBTTSChange,
  onComebackChange,
  onApplyFilters,
  onResetFilters,
  onExportCSV,
  colorScheme = defaultColorScheme,
  disabled = false,
  loading = false,
  onError,
  labels = defaultLabels
}) => {
  // Enhanced filter application
  const handleApplyFilters = useCallback(() => {
    try {
      onApplyFilters();
    } catch (error) {
      onError?.('Hiba történt a szűrők alkalmazásakor');
      console.error('Filter application error:', error);
    }
  }, [onApplyFilters, onError]);

  // Enhanced reset with confirmation
  const handleResetFilters = useCallback(() => {
    try {
      onResetFilters();
    } catch (error) {
      onError?.('Hiba történt a szűrők visszaállításakor');
      console.error('Filter reset error:', error);
    }
  }, [onResetFilters, onError]);

  // Enhanced export with error handling
  const handleExportCSV = useCallback(() => {
    try {
      onExportCSV();
    } catch (error) {
      onError?.('Hiba történt az exportálás során');
      console.error('Export error:', error);
    }
  }, [onExportCSV, onError]);

  // Improved team selection handlers with validation
  const handleHomeTeamChange = useCallback((key: React.Key | null) => {
    try {
      if (key === null) {
        onHomeTeamChange(null);
      } else {
        const team = spanishTeams.find(t => t.id === key);
        if (team) {
          onHomeTeamChange(team);
        } else {
          onError?.('A kiválasztott hazai csapat nem található');
        }
      }
    } catch (error) {
      onError?.('Hiba történt a hazai csapat kiválasztásakor');
      console.error('Home team selection error:', error);
    }
  }, [onHomeTeamChange, onError]);

  const handleAwayTeamChange = useCallback((key: React.Key | null) => {
    try {
      if (key === null) {
        onAwayTeamChange(null);
      } else {
        const team = spanishTeams.find(t => t.id === key);
        if (team) {
          onAwayTeamChange(team);
        } else {
          onError?.('A kiválasztott vendég csapat nem található');
        }
      }
    } catch (error) {
      onError?.('Hiba történt a vendég csapat kiválasztásakor');
      console.error('Away team selection error:', error);
    }
  }, [onAwayTeamChange, onError]);

  return (
    <div className={`mt-8 ring-1 ${colorScheme.border} ${colorScheme.background} rounded-2xl backdrop-blur ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className={`px-4 sm:px-6 py-4 sm:py-5 border-b ${colorScheme.border} flex items-center justify-between`}>
        <div className="flex items-center gap-2 text-zinc-300">
          <Icon icon="lucide:filter" width={18} height={18} />
          <span className="text-sm font-medium">{labels.filters}</span>
          {loading && (
            <Icon icon="lucide:loader-2" width={16} height={16} className="animate-spin text-zinc-400" />
          )}
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <Button
            color="primary"
            className={`inline-flex items-center gap-2 text-sm font-semibold tracking-tight text-white bg-gradient-to-br ${colorScheme.primary} rounded-full px-4 py-2.5 shadow-lg hover:shadow-[0_12px_24px_-6px_rgba(139,92,246,0.4)] hover:-translate-y-0.5 transform-gpu transition disabled:opacity-50 disabled:cursor-not-allowed`}
            onPress={handleApplyFilters}
            isDisabled={disabled || loading}
            aria-label={`${labels.apply} - Apply selected filters`}
          >
            <Icon icon="lucide:sliders-horizontal" width={18} height={18} />
            {labels.apply}
          </Button>
          <Button
            variant="flat"
            color="default"
            className={`inline-flex items-center gap-2 text-sm font-medium text-zinc-200 border ${colorScheme.border} rounded-full px-4 py-2.5 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed`}
            onPress={handleResetFilters}
            isDisabled={disabled || loading}
            aria-label={`${labels.reset} - Clear all filters`}
          >
            <Icon icon="lucide:rotate-ccw" width={18} height={18} />
            {labels.reset}
          </Button>
          <Button
            variant="flat"
            color="default"
            className={`inline-flex items-center gap-2 text-sm font-medium text-zinc-200 border ${colorScheme.border} rounded-full px-4 py-2.5 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed`}
            onPress={handleExportCSV}
            isDisabled={disabled || loading}
            aria-label={`${labels.export} - Export filtered data as CSV`}
          >
            <Icon icon="lucide:download" width={18} height={18} />
            {labels.export}
          </Button>
        </div>
      </div>
      
      <div className="px-4 sm:px-6 py-5">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Home Team Autocomplete */}
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5" id="home-team-label">
              {labels.homeTeam}
            </label>
            <Autocomplete
              aria-labelledby="home-team-label"
              aria-describedby="home-team-description"
              className={`w-full rounded-xl ${colorScheme.background} ring-1 ${colorScheme.border} hover:bg-white/10`}
              defaultItems={spanishTeams}
              placeholder={labels.search}
              selectedKey={selectedHomeTeam?.id}
              onSelectionChange={handleHomeTeamChange}
              isDisabled={disabled || loading}
              startContent={
                <span className={`inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br ${colorScheme.primary} ring-1 ring-white/20`}>
                  <Icon icon="lucide:home" className="text-white" width={16} height={16} />
                </span>
              }
              isClearable
              classNames={{
                base: "bg-transparent",
                listbox: "bg-[#0c0f16] text-zinc-200",
                popoverContent: `bg-[#0c0f16] border ${colorScheme.border}`
              }}
            >
              {(team) => (
                <AutocompleteItem key={team.id} textValue={team.name}>
                  <div className="flex items-center gap-2">
                    {team.logo && (
                      <img 
                        src={team.logo} 
                        alt={`${team.name} logo`} 
                        className="h-6 w-6 rounded-full ring-1 ring-white/10 object-cover"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                    <span>{team.name}</span>
                  </div>
                </AutocompleteItem>
              )}
            </Autocomplete>
            <div id="home-team-description" className="sr-only">
              Select a home team to filter matches
            </div>
          </div>

          {/* Away Team Autocomplete */}
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5" id="away-team-label">
              {labels.awayTeam}
            </label>
            <Autocomplete
              aria-labelledby="away-team-label"
              aria-describedby="away-team-description"
              className={`w-full rounded-xl ${colorScheme.background} ring-1 ${colorScheme.border} hover:bg-white/10`}
              defaultItems={spanishTeams}
              placeholder={labels.search}
              selectedKey={selectedAwayTeam?.id}
              onSelectionChange={handleAwayTeamChange}
              isDisabled={disabled || loading}
              startContent={
                <span className={`inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br ${colorScheme.secondary} ring-1 ring-white/20`}>
                  <Icon icon="lucide:flag" className="text-white" width={16} height={16} />
                </span>
              }
              isClearable
              classNames={{
                base: "bg-transparent",
                listbox: "bg-[#0c0f16] text-zinc-200",
                popoverContent: `bg-[#0c0f16] border ${colorScheme.border}`
              }}
            >
              {(team) => (
                <AutocompleteItem key={team.id} textValue={team.name}>
                  <div className="flex items-center gap-2">
                    {team.logo && (
                      <img 
                        src={team.logo} 
                        alt={`${team.name} logo`} 
                        className="h-6 w-6 rounded-full ring-1 ring-white/10 object-cover"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                    <span>{team.name}</span>
                  </div>
                </AutocompleteItem>
              )}
            </Autocomplete>
            <div id="away-team-description" className="sr-only">
              Select an away team to filter matches
            </div>
          </div>

          {/* BTTS Dropdown */}
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5" id="btts-label">
              {labels.btts}
            </label>
            <Dropdown>
              <DropdownTrigger>
                <Button
                  variant="flat"
                  className={`w-full flex items-center justify-between rounded-xl ${colorScheme.background} ring-1 ${colorScheme.border} px-3 py-2.5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed`}
                  isDisabled={disabled || loading}
                  aria-labelledby="btts-label"
                  aria-describedby="btts-description"
                >
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 ring-1 ring-white/10">
                      <Icon icon="lucide:target" className="text-zinc-200" width={16} height={16} />
                    </span>
                    <span className="text-sm text-zinc-200 font-medium">
                      {selectedBTTS === null ? `${labels.selectAny}` : selectedBTTS ? labels.yes : labels.no}
                    </span>
                  </div>
                  <Icon icon="lucide:chevron-down" className="text-zinc-300" width={18} height={18} />
                </Button>
              </DropdownTrigger>
              <DropdownMenu 
                aria-label="BTTS options" 
                onAction={(key) => {
                  if (key === "clear") {
                    onBTTSChange(null);
                  } else if (key === "yes") {
                    onBTTSChange(true);
                  } else {
                    onBTTSChange(false);
                  }
                }}
              >
                <DropdownItem key="clear" className="text-zinc-400">
                  {labels.selectAny}
                </DropdownItem>
                <DropdownItem key="yes" className="text-zinc-200">
                  {labels.yes}
                </DropdownItem>
                <DropdownItem key="no" className="text-zinc-200">
                  {labels.no}
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <div id="btts-description" className="mt-1 text-xs text-zinc-500">
              <span>{labels.bttsDescription}</span>
            </div>
          </div>

          {/* Comeback Dropdown */}
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5" id="comeback-label">
              {labels.comeback}
            </label>
            <Dropdown>
              <DropdownTrigger>
                <Button
                  variant="flat"
                  className={`w-full flex items-center justify-between rounded-xl ${colorScheme.background} ring-1 ${colorScheme.border} px-3 py-2.5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed`}
                  isDisabled={disabled || loading}
                  aria-labelledby="comeback-label"
                  aria-describedby="comeback-description"
                >
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 ring-1 ring-white/10">
                      <Icon icon="lucide:shuffle" className="text-zinc-200" width={16} height={16} />
                    </span>
                    <span className="text-sm text-zinc-200 font-medium">
                      {selectedComeback === null ? `${labels.selectAny}` : selectedComeback ? labels.yes : labels.no}
                    </span>
                  </div>
                  <Icon icon="lucide:chevron-down" className="text-zinc-300" width={18} height={18} />
                </Button>
              </DropdownTrigger>
              <DropdownMenu 
                aria-label="Comeback options" 
                onAction={(key) => {
                  if (key === "clear") {
                    onComebackChange(null);
                  } else if (key === "yes") {
                    onComebackChange(true);
                  } else {
                    onComebackChange(false);
                  }
                }}
              >
                <DropdownItem key="clear" className="text-zinc-400">
                  {labels.selectAny}
                </DropdownItem>
                <DropdownItem key="yes" className="text-zinc-200">
                  {labels.yes}
                </DropdownItem>
                <DropdownItem key="no" className="text-zinc-200">
                  {labels.no}
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <div id="comeback-description" className="mt-1 text-xs text-zinc-500">
              <span>{labels.comebackDescription}</span>
            </div>
          </div>
        </div>


        {/* Mobile buttons */}
        <div className="mt-4 flex sm:hidden items-center gap-3">
          <Button
            color="primary"
            className={`inline-flex items-center gap-2 text-sm font-semibold tracking-tight text-white bg-gradient-to-br ${colorScheme.primary} rounded-full px-4 py-2.5 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
            onPress={handleApplyFilters}
            isDisabled={disabled || loading}
            aria-label={`${labels.apply} - Apply selected filters`}
          >
            <Icon icon="lucide:sliders-horizontal" width={18} height={18} />
            {labels.apply}
          </Button>
          <Button
            variant="flat"
            color="default"
            className={`inline-flex items-center gap-2 text-sm font-medium text-zinc-200 border ${colorScheme.border} rounded-full px-4 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed`}
            onPress={handleResetFilters}
            isDisabled={disabled || loading}
            aria-label={`${labels.reset} - Clear all filters`}
          >
            <Icon icon="lucide:rotate-ccw" width={18} height={18} />
            {labels.reset}
          </Button>
          <Button
            variant="flat"
            color="default"
            className={`inline-flex items-center gap-2 text-sm font-medium text-zinc-200 border ${colorScheme.border} rounded-full px-4 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed`}
            onPress={handleExportCSV}
            isDisabled={disabled || loading}
            aria-label={`${labels.export} - Export filtered data as CSV`}
          >
            <Icon icon="lucide:download" width={18} height={18} />
            {labels.export}
          </Button>
        </div>
      </div>
    </div>
  );
};