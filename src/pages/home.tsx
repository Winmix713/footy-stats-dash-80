import React from 'react';
import { Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import { FilterSection } from '../components/filter-section';
import { useMatchData } from '../hooks/use-match-data';

const HomePage: React.FC = () => {
  const {
    homeTeams,
    awayTeams,
    selectedHomeTeam,
    selectedAwayTeam,
    selectedBTTS,
    selectedComeback,
    setSelectedHomeTeam,
    setSelectedAwayTeam,
    setSelectedBTTS,
    setSelectedComeback,
    applyFilters,
    resetFilters,
    exportToCSV,
    startDate,
    endDate,
    setStartDate,
    setEndDate
  } = useMatchData();

  return (
    <div className="page-content">
      <div className="text-center space-y-3">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-white">
          Mérkőzés szűrő és statisztikák
        </h1>
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-zinc-300">
          Szűrd a meccseket csapatokra és eseményekre, elemezd a kimeneteleket, és exportáld CSV-be.
        </p>
      </div>

      <FilterSection 
        homeTeams={homeTeams}
        awayTeams={awayTeams}
        selectedHomeTeam={selectedHomeTeam}
        selectedAwayTeam={selectedAwayTeam}
        selectedBTTS={selectedBTTS}
        selectedComeback={selectedComeback}
        onHomeTeamChange={setSelectedHomeTeam}
        onAwayTeamChange={setSelectedAwayTeam}
        onBTTSChange={setSelectedBTTS}
        onComebackChange={setSelectedComeback}
        onApplyFilters={applyFilters}
        onResetFilters={resetFilters}
        onExportCSV={exportToCSV}
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
      />

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to="/teams" className="block">
          <div className="rounded-xl ring-1 ring-white/10 bg-white/5 p-6 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-600/20 ring-1 ring-violet-400/30">
                <Icon icon="lucide:shield" className="text-violet-400" width={24} height={24} />
              </div>
              <Icon icon="lucide:chevron-right" className="text-zinc-400" width={20} height={20} />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Csapatok</h2>
            <p className="text-sm text-zinc-400">
              Tekintsd meg a csapatok részletes statisztikáit, power ranking besorolását és mérkőzés történetét.
            </p>
          </div>
        </Link>
        
        <Link to="/stats" className="block">
          <div className="rounded-xl ring-1 ring-white/10 bg-white/5 p-6 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-600/20 ring-1 ring-emerald-400/30">
                <Icon icon="lucide:bar-chart-2" className="text-emerald-400" width={24} height={24} />
              </div>
              <Icon icon="lucide:chevron-right" className="text-zinc-400" width={20} height={20} />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Statisztikák</h2>
            <p className="text-sm text-zinc-400">
              Elemezd a mérkőzések eredményeit, góleloszlását és egyéb statisztikai mutatókat.
            </p>
          </div>
        </Link>
        
        <Link to="/results" className="block">
          <div className="rounded-xl ring-1 ring-white/10 bg-white/5 p-6 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 ring-1 ring-amber-400/30">
                <Icon icon="lucide:list" className="text-amber-400" width={24} height={24} />
              </div>
              <Icon icon="lucide:chevron-right" className="text-zinc-400" width={20} height={20} />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Eredmények</h2>
            <p className="text-sm text-zinc-400">
              Böngészd a mérkőzések eredményeit, rendezd és szűrd őket különböző szempontok szerint.
            </p>
          </div>
        </Link>
        
        <div className="rounded-xl ring-1 ring-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-600/20 ring-1 ring-sky-400/30">
              <Icon icon="lucide:layout" className="text-sky-400" width={24} height={24} />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Taktikai tábla</h2>
          <p className="text-sm text-zinc-400 mb-4">
            Tervezz taktikai formációkat és elemezd a mérkőzéseket interaktív táblán.
          </p>
          <Button
            variant="flat"
            color="primary"
            className="w-full"
            onPress={() => {
              // Navigate to results page with pitch manager focus
              window.location.href = '/results#virtual-pitch';
            }}
          >
            <Icon icon="lucide:layout" width={16} height={16} className="mr-2" />
            Megnyitás
          </Button>
        </div>
      </div>
      
      <div className="mt-12 rounded-xl ring-1 ring-white/10 bg-white/5 p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-600/20 ring-1 ring-violet-400/30">
            <Icon icon="lucide:info" className="text-violet-400" width={24} height={24} />
          </div>
          <h2 className="text-xl font-semibold text-white">WinMix alkalmazásról</h2>
        </div>
        <p className="text-sm text-zinc-400 mb-4">
          A WinMix egy komplex mérkőzés elemző és statisztikai alkalmazás, amely segít a futball mérkőzések adatainak elemzésében, 
          a csapatok teljesítményének értékelésében és a különböző statisztikai mutatók vizualizálásában.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Icon icon="lucide:check" className="text-emerald-400" width={16} height={16} />
            <span className="text-zinc-300">Mérkőzés szűrés és rendezés</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon icon="lucide:check" className="text-emerald-400" width={16} height={16} />
            <span className="text-zinc-300">Csapat statisztikák és power ranking</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon icon="lucide:check" className="text-emerald-400" width={16} height={16} />
            <span className="text-zinc-300">Interaktív taktikai tábla</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon icon="lucide:check" className="text-emerald-400" width={16} height={16} />
            <span className="text-zinc-300">Vizuális statisztikai elemzések</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon icon="lucide:check" className="text-emerald-400" width={16} height={16} />
            <span className="text-zinc-300">CSV exportálás</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon icon="lucide:check" className="text-emerald-400" width={16} height={16} />
            <span className="text-zinc-300">Világos és sötét téma</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;