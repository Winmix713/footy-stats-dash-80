import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Progress, Tooltip } from '@heroui/react';
import { Icon } from '@iconify/react';
import { Match } from '../types/match';

interface MatchDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: Match | null;
  onAddToFavorites?: (matchId: string) => void;
  isFavorite?: boolean;
}

export const MatchDetailsModal: React.FC<MatchDetailsModalProps> = ({
  isOpen,
  onClose,
  match,
  onAddToFavorites,
  isFavorite = false
}) => {
  if (!match) return null;
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('hu-HU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getResultClass = () => {
    if (match.ftScore.home > match.ftScore.away) {
      return 'text-emerald-400';
    } else if (match.ftScore.home < match.ftScore.away) {
      return 'text-sky-400';
    } else {
      return 'text-amber-400';
    }
  };
  
  const getResultText = () => {
    if (match.ftScore.home > match.ftScore.away) {
      return 'Hazai győzelem';
    } else if (match.ftScore.home < match.ftScore.away) {
      return 'Vendég győzelem';
    } else {
      return 'Döntetlen';
    }
  };
  
  const getHalfTimeResult = () => {
    if (match.htScore.home > match.htScore.away) {
      return 'H';
    } else if (match.htScore.home < match.htScore.away) {
      return 'A';
    } else {
      return 'D';
    }
  };
  
  const getFullTimeResult = () => {
    if (match.ftScore.home > match.ftScore.away) {
      return 'H';
    } else if (match.ftScore.home < match.ftScore.away) {
      return 'A';
    } else {
      return 'D';
    }
  };
  
  const getHtFtCombination = () => {
    return `${getHalfTimeResult()}/${getFullTimeResult()}`;
  };
  
  const renderStatBar = (homeValue?: number, awayValue?: number, label?: string) => {
    if (homeValue === undefined || awayValue === undefined) return null;
    
    const total = homeValue + awayValue;
    const homePercent = total > 0 ? (homeValue / total) * 100 : 50;
    
    return (
      <div className="mb-4">
        <div className="flex justify-between text-xs text-zinc-400 mb-1">
          <span>{homeValue}</span>
          <span className="text-zinc-300">{label}</span>
          <span>{awayValue}</span>
        </div>
        <div className="flex h-2 rounded-full overflow-hidden">
          <div 
            className="bg-emerald-500/50" 
            style={{ width: `${homePercent}%` }}
          />
          <div 
            className="bg-sky-500/50" 
            style={{ width: `${100 - homePercent}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="3xl"
      backdrop="blur"
      className="modal-animation"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="px-6 pt-6 pb-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:info" className="text-violet-300" width={20} height={20} />
                  <h3 className="text-2xl font-semibold tracking-tight">Mérkőzés részletek</h3>
                </div>
                {match.league && (
                  <span className="px-3 py-1 text-xs font-medium bg-white/10 text-zinc-300 rounded-full">
                    {match.league} {match.season && `• ${match.season}`}
                  </span>
                )}
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 items-center gap-4 rounded-xl bg-white/5 ring-1 ring-white/10 p-4">
                <div className="flex items-center gap-3">
                  {match.home.logo ? (
                    <img 
                      src={match.home.logo} 
                      alt="Hazai csapat logó" 
                      className="h-12 w-12 rounded-full ring-1 ring-white/10 object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center">
                      <Icon icon="lucide:shield" className="text-zinc-400" width={24} height={24} />
                    </div>
                  )}
                  <div>
                    <div className="font-medium text-white text-lg">{match.home.name}</div>
                    <div className="text-xs text-zinc-400">Hazai csapat</div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {match.ftScore.home} - {match.ftScore.away}
                  </div>
                  <div className="text-xs text-zinc-400 mt-1">
                    Félidő: {match.htScore.home} - {match.htScore.away}
                  </div>
                  <div className={`text-sm font-medium mt-1 ${getResultClass()}`}>
                    {getResultText()}
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3">
                  <div className="text-right">
                    <div className="font-medium text-white text-lg">{match.away.name}</div>
                    <div className="text-xs text-zinc-400">Vendég csapat</div>
                  </div>
                  {match.away.logo ? (
                    <img 
                      src={match.away.logo} 
                      alt="Vendég csapat logó" 
                      className="h-12 w-12 rounded-full ring-1 ring-white/10 object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center">
                      <Icon icon="lucide:shield" className="text-zinc-400" width={24} height={24} />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-4 text-center text-sm text-zinc-400">
                <Icon icon="lucide:calendar" className="inline-block mr-1" width={14} height={14} />
                {formatDate(match.date)}
                {match.country && (
                  <span className="ml-2">
                    <Icon icon="lucide:map-pin" className="inline-block mr-1" width={14} height={14} />
                    {match.country}
                  </span>
                )}
              </div>
            </ModalHeader>
            
            <ModalBody className="px-6 py-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="rounded-xl bg-white/5 ring-1 ring-white/10 p-4 text-center">
                  <div className="text-xs text-zinc-400 mb-1">HT/FT</div>
                  <div className="text-xl font-semibold tracking-tight text-white">{getHtFtCombination()}</div>
                </div>
                <div className={`rounded-xl ${match.btts ? 'bg-emerald-500/10 ring-1 ring-emerald-400/30' : 'bg-white/5 ring-1 ring-white/10'} p-4 text-center`}>
                  <div className="text-xs text-zinc-400 mb-1">BTTS</div>
                  <div className={`text-xl font-semibold tracking-tight ${match.btts ? 'text-emerald-300' : 'text-zinc-400'}`}>
                    {match.btts ? 'Igen' : 'Nem'}
                  </div>
                </div>
                <div className={`rounded-xl ${match.comeback ? 'bg-emerald-500/10 ring-1 ring-emerald-400/30' : 'bg-white/5 ring-1 ring-white/10'} p-4 text-center`}>
                  <div className="text-xs text-zinc-400 mb-1">Fordítás</div>
                  <div className={`text-xl font-semibold tracking-tight ${match.comeback ? 'text-emerald-300' : 'text-zinc-400'}`}>
                    {match.comeback ? 'Igen' : 'Nem'}
                  </div>
                </div>
                <div className="rounded-xl bg-white/5 ring-1 ring-white/10 p-4 text-center">
                  <div className="text-xs text-zinc-400 mb-1">Össz gól</div>
                  <div className="text-xl font-semibold tracking-tight text-white">
                    {match.ftScore.home + match.ftScore.away}
                  </div>
                </div>
              </div>

              {/* Match statistics */}
              {match.stats && (
                <div className="mt-6">
                  <h4 className="font-medium text-zinc-200 mb-4 inline-flex items-center gap-2">
                    <Icon icon="lucide:bar-chart-2" width={18} height={18} />
                    Mérkőzés statisztikák
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      {/* Expected goals */}
                      {match.stats.xg && (match.stats.xg.home !== undefined || match.stats.xg.away !== undefined) && (
                        <div className="mb-6">
                          <h5 className="text-sm text-zinc-300 mb-2">Várható gólok (xG)</h5>
                          <div className="flex items-center gap-4">
                            <div className="text-lg font-semibold text-emerald-300">
                              {match.stats.xg.home?.toFixed(2) || 'N/A'}
                            </div>
                            <div className="flex-grow h-2 bg-white/10 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-emerald-500 to-sky-500"
                                style={{ 
                                  width: `${match.stats.xg.home !== undefined && match.stats.xg.away !== undefined 
                                    ? (match.stats.xg.home / (match.stats.xg.home + match.stats.xg.away)) * 100 
                                    : 50}%` 
                                }}
                              />
                            </div>
                            <div className="text-lg font-semibold text-sky-300">
                              {match.stats.xg.away?.toFixed(2) || 'N/A'}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Possession */}
                      {renderStatBar(
                        match.stats.possession?.home, 
                        match.stats.possession?.away, 
                        "Labdabirtoklás (%)"
                      )}
                      
                      {/* Shots */}
                      {renderStatBar(
                        match.stats.shots?.home, 
                        match.stats.shots?.away, 
                        "Lövések"
                      )}
                      
                      {/* Shots on target */}
                      {renderStatBar(
                        match.stats.shotsOnTarget?.home, 
                        match.stats.shotsOnTarget?.away, 
                        "Kapura lövések"
                      )}
                    </div>
                    
                    <div>
                      {/* Corners */}
                      {renderStatBar(
                        match.stats.corners?.home, 
                        match.stats.corners?.away, 
                        "Szögletek"
                      )}
                      
                      {/* Fouls */}
                      {renderStatBar(
                        match.stats.fouls?.home, 
                        match.stats.fouls?.away, 
                        "Szabálytalanságok"
                      )}
                      
                      {/* Yellow cards */}
                      {renderStatBar(
                        match.stats.cards?.yellow?.home, 
                        match.stats.cards?.yellow?.away, 
                        "Sárga lapok"
                      )}
                      
                      {/* Red cards */}
                      {renderStatBar(
                        match.stats.cards?.red?.home, 
                        match.stats.cards?.red?.away, 
                        "Piros lapok"
                      )}
                    </div>
                  </div>
                  
                  {/* Odds */}
                  {match.stats.odds && (match.stats.odds.home !== undefined || match.stats.odds.draw !== undefined || match.stats.odds.away !== undefined) && (
                    <div className="mt-6">
                      <h5 className="text-sm text-zinc-300 mb-2">Odds</h5>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="rounded-lg bg-white/5 p-3 text-center">
                          <div className="text-xs text-zinc-400 mb-1">1</div>
                          <div className="text-lg font-semibold text-white">{match.stats.odds.home?.toFixed(2) || 'N/A'}</div>
                        </div>
                        <div className="rounded-lg bg-white/5 p-3 text-center">
                          <div className="text-xs text-zinc-400 mb-1">X</div>
                          <div className="text-lg font-semibold text-white">{match.stats.odds.draw?.toFixed(2) || 'N/A'}</div>
                        </div>
                        <div className="rounded-lg bg-white/5 p-3 text-center">
                          <div className="text-xs text-zinc-400 mb-1">2</div>
                          <div className="text-lg font-semibold text-white">{match.stats.odds.away?.toFixed(2) || 'N/A'}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ModalBody>
            
            <ModalFooter className="px-6 py-4 border-t border-white/10 flex justify-between">
              <div>
                {onAddToFavorites && (
                  <Button 
                    variant="flat" 
                    color={isFavorite ? "warning" : "default"}
                    className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm ${
                      isFavorite ? 'text-amber-300 border border-amber-500/30' : 'text-zinc-200 border border-white/10'
                    } hover:bg-white/5`}
                    onPress={() => onAddToFavorites(match.id)}
                  >
                    <Icon icon={isFavorite ? "lucide:star" : "lucide:star"} width={16} height={16} />
                    {isFavorite ? 'Eltávolítás a kedvencekből' : 'Hozzáadás a kedvencekhez'}
                  </Button>
                )}
              </div>
              <Button 
                variant="flat" 
                color="default"
                className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm text-zinc-200 border border-white/10 hover:bg-white/5"
                onPress={onClose}
              >
                <Icon icon="lucide:x" width={16} height={16} />
                Bezárás
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};