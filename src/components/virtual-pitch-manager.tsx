import React from 'react';
import { Card, Button, Tooltip, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react';
import { Icon } from '@iconify/react';
import { Match } from '../types/match';
import { toast } from '@/hooks/use-toast';

interface VirtualPitchManagerProps {
  match?: Match;
}

export const VirtualPitchManager: React.FC<VirtualPitchManagerProps> = ({ match }) => {
  const [players, setPlayers] = React.useState<Array<{
    id: string;
    name: string;
    position: { x: number; y: number };
    team: 'home' | 'away';
    number: number;
    isSelected: boolean;
  }>>([]);
  
  const [formation, setFormation] = React.useState({
    home: '4-4-2',
    away: '4-3-3'
  });
  
  const [activeTool, setActiveTool] = React.useState<'select' | 'move' | 'draw' | 'text'>('select');
  const [annotations, setAnnotations] = React.useState<Array<{
    id: string;
    type: 'arrow' | 'circle' | 'text';
    points: Array<{x: number, y: number}>;
    color: string;
    text?: string;
  }>>([]);
  
  const canvasRef = React.useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = React.useState(false);
  const [currentAnnotation, setCurrentAnnotation] = React.useState<{
    type: 'arrow' | 'circle' | 'text';
    points: Array<{x: number, y: number}>;
    color: string;
    text?: string;
  } | null>(null);
  
  // Add state for selected match and history
  const [selectedMatch, setSelectedMatch] = React.useState<Match | undefined>(match);
  const [savedFormations, setSavedFormations] = React.useState<Array<{
    id: string;
    name: string;
    home: string;
    away: string;
    players: typeof players;
    annotations: typeof annotations;
  }>>([]);
  
  // Add function to save current formation
  const saveCurrentFormation = () => {
    const name = prompt("Adja meg a mentés nevét:");
    if (!name) return;
    
    setSavedFormations(prev => [
      ...prev,
      {
        id: `formation-${Date.now()}`,
        name,
        home: formation.home,
        away: formation.away,
        players: [...players],
        annotations: [...annotations]
      }
    ]);
    
    toast({
      title: "Formáció mentve",
      description: `A "${name}" formáció sikeresen mentve.`,
    });
  };
  
  // Add function to load saved formation
  const loadFormation = (id: string) => {
    const saved = savedFormations.find(f => f.id === id);
    if (!saved) return;
    
    setFormation({
      home: saved.home,
      away: saved.away
    });
    setPlayers(saved.players);
    setAnnotations(saved.annotations);
    
    toast({
      title: "Formáció betöltve",
      description: `A "${saved.name}" formáció sikeresen betöltve.`,
    });
  };

  // Generate players based on formation
  React.useEffect(() => {
    generatePlayers();
  }, [formation]);
  
  const generatePlayers = () => {
    const newPlayers = [];
    
    // Parse formations
    const homeFormation = formation.home.split('-').map(Number);
    const awayFormation = formation.away.split('-').map(Number);
    
    // Generate home team players
    let playerCount = 1;
    
    // Add goalkeeper
    newPlayers.push({
      id: `home-gk`,
      name: 'GK',
      position: { x: 50, y: 90 },
      team: 'home' as const,
      number: 1,
      isSelected: false
    });
    
    // Add outfield players based on formation
    let rowPosition = 75;
    for (let i = 0; i < homeFormation.length; i++) {
      const playersInRow = homeFormation[i];
      const spacing = 100 / (playersInRow + 1);
      
      for (let j = 0; j < playersInRow; j++) {
        playerCount++;
        newPlayers.push({
          id: `home-${playerCount}`,
          name: `P${playerCount}`,
          position: { x: spacing * (j + 1), y: rowPosition },
          team: 'home' as const,
          number: playerCount,
          isSelected: false
        });
      }
      rowPosition -= 15;
    }
    
    // Generate away team players
    playerCount = 1;
    
    // Add goalkeeper
    newPlayers.push({
      id: `away-gk`,
      name: 'GK',
      position: { x: 50, y: 10 },
      team: 'away' as const,
      number: 1,
      isSelected: false
    });
    
    // Add outfield players based on formation
    rowPosition = 25;
    for (let i = 0; i < awayFormation.length; i++) {
      const playersInRow = awayFormation[i];
      const spacing = 100 / (playersInRow + 1);
      
      for (let j = 0; j < playersInRow; j++) {
        playerCount++;
        newPlayers.push({
          id: `away-${playerCount}`,
          name: `P${playerCount}`,
          position: { x: spacing * (j + 1), y: rowPosition },
          team: 'away' as const,
          number: playerCount,
          isSelected: false
        });
      }
      rowPosition += 15;
    }
    
    setPlayers(newPlayers);
  };
  
  const handlePlayerDrag = (id: string, newPosition: { x: number; y: number }) => {
    setPlayers(prev => 
      prev.map(player => 
        player.id === id 
          ? { ...player, position: newPosition } 
          : player
      )
    );
  };
  
  const handlePlayerClick = (id: string) => {
    if (activeTool === 'select') {
      setPlayers(prev => 
        prev.map(player => ({
          ...player,
          isSelected: player.id === id ? !player.isSelected : false
        }))
      );
    }
  };
  
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (activeTool === 'draw' || activeTool === 'text') {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      setIsDrawing(true);
      setCurrentAnnotation({
        type: activeTool === 'draw' ? 'arrow' : 'text',
        points: [{ x, y }],
        color: '#ffffff',
        text: activeTool === 'text' ? 'Text' : undefined
      });
    }
  };
  
  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isDrawing && currentAnnotation && activeTool === 'draw') {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      setCurrentAnnotation(prev => {
        if (!prev) return null;
        return {
          ...prev,
          points: [prev.points[0], { x, y }]
        };
      });
    }
  };
  
  const handleCanvasMouseUp = () => {
    if (isDrawing && currentAnnotation) {
      setAnnotations(prev => [
        ...prev,
        {
          ...currentAnnotation,
          id: `annotation-${Date.now()}`
        }
      ]);
      setIsDrawing(false);
      setCurrentAnnotation(null);
    }
  };
  
  const clearAnnotations = () => {
    setAnnotations([]);
  };
  
  const exportImage = () => {
    // Implementation for exporting the pitch as an image
    alert('Export functionality will be implemented');
  };
  
  const renderPlayer = (player: typeof players[0]) => {
    const teamColor = player.team === 'home' ? 'bg-emerald-500' : 'bg-sky-500';
    const selectedClass = player.isSelected ? 'ring-2 ring-yellow-400' : '';
    
    return (
      <Tooltip content={player.name} key={player.id}>
        <div 
          className={`absolute w-6 h-6 ${teamColor} ${selectedClass} rounded-full flex items-center justify-center text-xs font-bold cursor-pointer transform transition-transform hover:scale-110`}
          style={{ 
            left: `${player.position.x}%`, 
            top: `${player.position.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
          onClick={() => handlePlayerClick(player.id)}
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData('text/plain', player.id);
          }}
        >
          {player.number}
        </div>
      </Tooltip>
    );
  };
  
  const renderAnnotation = (annotation: typeof annotations[0]) => {
    if (annotation.type === 'arrow' && annotation.points.length === 2) {
      const [start, end] = annotation.points;
      
      // Calculate the angle for the arrow
      const angle = Math.atan2(end.y - start.y, end.x - start.x) * 180 / Math.PI;
      
      // Calculate the length of the line
      const length = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
      
      return (
        <div 
          key={annotation.id}
          className="absolute"
          style={{
            left: `${start.x}%`,
            top: `${start.y}%`,
            width: `${length}%`,
            height: '2px',
            backgroundColor: annotation.color,
            transform: `rotate(${angle}deg)`,
            transformOrigin: 'left center'
          }}
        >
          <div 
            className="absolute"
            style={{
              right: '-4px',
              top: '-4px',
              width: '0',
              height: '0',
              borderTop: '4px solid transparent',
              borderBottom: '4px solid transparent',
              borderLeft: `8px solid ${annotation.color}`
            }}
          />
        </div>
      );
    }
    
    if (annotation.type === 'text' && annotation.points.length === 1) {
      const [position] = annotation.points;
      
      return (
        <div
          key={annotation.id}
          className="absolute px-2 py-1 bg-black/50 text-white text-xs rounded"
          style={{
            left: `${position.x}%`,
            top: `${position.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          {annotation.text || 'Text'}
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <Card id="virtual-pitch" className="mt-10 ring-1 ring-white/10 bg-white/5 rounded-2xl p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
          Virtuális taktikai tábla
        </h2>
        <div className="flex items-center gap-2">
          {/* Add save/load buttons */}
          <Button
            variant="flat"
            color="default"
            size="sm"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-zinc-200 border border-white/10 rounded-md px-3 py-1.5 hover:bg-white/5"
            onPress={saveCurrentFormation}
          >
            <Icon icon="lucide:save" width={16} height={16} />
            Mentés
          </Button>
          <Dropdown>
            <DropdownTrigger>
              <Button
                variant="flat"
                color="default"
                size="sm"
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-zinc-200 border border-white/10 rounded-md px-3 py-1.5 hover:bg-white/5"
              >
                <Icon icon="lucide:folder-open" width={16} height={16} />
                Betöltés
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Mentett formációk">
              {savedFormations.length === 0 ? (
                <DropdownItem key="empty" isDisabled>Nincs mentett formáció</DropdownItem>
              ) : (
                savedFormations.map(formation => (
                  <DropdownItem key={formation.id} onPress={() => loadFormation(formation.id)}>
                    {formation.name}
                  </DropdownItem>
                ))
              )}
            </DropdownMenu>
          </Dropdown>
          <Button
            variant="flat"
            color="default"
            size="sm"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-zinc-200 border border-white/10 rounded-md px-3 py-1.5 hover:bg-white/5"
            onPress={exportImage}
          >
            <Icon icon="lucide:download" width={16} height={16} />
            Exportálás
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          <div 
            ref={canvasRef}
            className="relative w-full aspect-[3/2] bg-emerald-900 rounded-xl overflow-hidden"
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
          >
            {/* Pitch markings */}
            <div className="absolute inset-0 border-2 border-white/30"></div>
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/30 -translate-x-1/2"></div>
            <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-white/30 -translate-y-1/2"></div>
            <div className="absolute left-1/2 top-1/2 w-20 h-20 border-2 border-white/30 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            
            {/* Penalty areas */}
            <div className="absolute left-1/2 bottom-0 w-44 h-16 border-2 border-white/30 -translate-x-1/2"></div>
            <div className="absolute left-1/2 top-0 w-44 h-16 border-2 border-white/30 -translate-x-1/2"></div>
            
            {/* Goal areas */}
            <div className="absolute left-1/2 bottom-0 w-20 h-6 border-2 border-white/30 -translate-x-1/2"></div>
            <div className="absolute left-1/2 top-0 w-20 h-6 border-2 border-white/30 -translate-x-1/2"></div>
            
            {/* Goals */}
            <div className="absolute left-1/2 bottom-0 w-12 h-1 bg-white/50 -translate-x-1/2 -translate-y-0.5"></div>
            <div className="absolute left-1/2 top-0 w-12 h-1 bg-white/50 -translate-x-1/2 translate-y-0.5"></div>
            
            {/* Penalty spots */}
            <div className="absolute left-1/2 bottom-12 w-1 h-1 bg-white/50 rounded-full -translate-x-1/2"></div>
            <div className="absolute left-1/2 top-12 w-1 h-1 bg-white/50 rounded-full -translate-x-1/2"></div>
            
            {/* Corner arcs */}
            <div className="absolute left-0 bottom-0 w-4 h-4 border-t-2 border-r-2 border-white/30 rounded-tr-full"></div>
            <div className="absolute right-0 bottom-0 w-4 h-4 border-t-2 border-l-2 border-white/30 rounded-tl-full"></div>
            <div className="absolute left-0 top-0 w-4 h-4 border-b-2 border-r-2 border-white/30 rounded-br-full"></div>
            <div className="absolute right-0 top-0 w-4 h-4 border-b-2 border-l-2 border-white/30 rounded-bl-full"></div>
            
            {/* Players */}
            {players.map(renderPlayer)}
            
            {/* Annotations */}
            {annotations.map(renderAnnotation)}
            
            {/* Current annotation being drawn */}
            {currentAnnotation && renderAnnotation({...currentAnnotation, id: 'current'})}
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <Card className="rounded-xl ring-1 ring-white/10 bg-white/5 p-4">
            <h3 className="text-lg font-semibold mb-4">Eszközök</h3>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <Button
                size="sm"
                variant={activeTool === 'select' ? 'solid' : 'flat'}
                color={activeTool === 'select' ? 'primary' : 'default'}
                onPress={() => setActiveTool('select')}
                isIconOnly
              >
                <Icon icon="lucide:pointer" width={16} height={16} />
              </Button>
              <Button
                size="sm"
                variant={activeTool === 'move' ? 'solid' : 'flat'}
                color={activeTool === 'move' ? 'primary' : 'default'}
                onPress={() => setActiveTool('move')}
                isIconOnly
              >
                <Icon icon="lucide:move" width={16} height={16} />
              </Button>
              <Button
                size="sm"
                variant={activeTool === 'draw' ? 'solid' : 'flat'}
                color={activeTool === 'draw' ? 'primary' : 'default'}
                onPress={() => setActiveTool('draw')}
                isIconOnly
              >
                <Icon icon="lucide:pen-line" width={16} height={16} />
              </Button>
              <Button
                size="sm"
                variant={activeTool === 'text' ? 'solid' : 'flat'}
                color={activeTool === 'text' ? 'primary' : 'default'}
                onPress={() => setActiveTool('text')}
                isIconOnly
              >
                <Icon icon="lucide:text" width={16} height={16} />
              </Button>
              <Button
                size="sm"
                variant="flat"
                color="danger"
                onPress={clearAnnotations}
                isIconOnly
              >
                <Icon icon="lucide:trash-2" width={16} height={16} />
              </Button>
            </div>
            
            <h3 className="text-lg font-semibold mb-2">Formációk</h3>
            
            <div className="space-y-2 mb-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Hazai csapat</label>
                <Dropdown>
                  <DropdownTrigger>
                    <Button
                      variant="flat"
                      className="w-full flex items-center justify-between rounded-lg bg-white/5 ring-1 ring-white/10 px-3 py-2 hover:bg-white/10"
                    >
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 ring-1 ring-emerald-400/30">
                          <Icon icon="lucide:layout" className="text-emerald-300" width={14} height={14} />
                        </span>
                        <span className="text-sm text-zinc-200 font-medium">
                          {formation.home}
                        </span>
                      </div>
                      <Icon icon="lucide:chevron-down" className="text-zinc-300" width={16} height={16} />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu 
                    aria-label="Hazai formációk" 
                    onAction={(key) => setFormation(prev => ({ ...prev, home: key as string }))}
                  >
                    <DropdownItem key="4-4-2" className="text-zinc-200">4-4-2</DropdownItem>
                    <DropdownItem key="4-3-3" className="text-zinc-200">4-3-3</DropdownItem>
                    <DropdownItem key="3-5-2" className="text-zinc-200">3-5-2</DropdownItem>
                    <DropdownItem key="5-3-2" className="text-zinc-200">5-3-2</DropdownItem>
                    <DropdownItem key="4-2-3-1" className="text-zinc-200">4-2-3-1</DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
              
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Vendég csapat</label>
                <Dropdown>
                  <DropdownTrigger>
                    <Button
                      variant="flat"
                      className="w-full flex items-center justify-between rounded-lg bg-white/5 ring-1 ring-white/10 px-3 py-2 hover:bg-white/10"
                    >
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-sky-500/20 ring-1 ring-sky-400/30">
                          <Icon icon="lucide:layout" className="text-sky-300" width={14} height={14} />
                        </span>
                        <span className="text-sm text-zinc-200 font-medium">
                          {formation.away}
                        </span>
                      </div>
                      <Icon icon="lucide:chevron-down" className="text-zinc-300" width={16} height={16} />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu 
                    aria-label="Vendég formációk" 
                    onAction={(key) => setFormation(prev => ({ ...prev, away: key as string }))}
                  >
                    <DropdownItem key="4-4-2" className="text-zinc-200">4-4-2</DropdownItem>
                    <DropdownItem key="4-3-3" className="text-zinc-200">4-3-3</DropdownItem>
                    <DropdownItem key="3-5-2" className="text-zinc-200">3-5-2</DropdownItem>
                    <DropdownItem key="5-3-2" className="text-zinc-200">5-3-2</DropdownItem>
                    <DropdownItem key="4-2-3-1" className="text-zinc-200">4-2-3-1</DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>
            
            {match && (
              <div className="mt-4 p-3 rounded-lg bg-white/5 ring-1 ring-white/10">
                <h4 className="text-sm font-medium mb-2">Mérkőzés információ</h4>
                <div className="flex items-center justify-between text-xs text-zinc-300">
                  <div>{match.home_team}</div>
                  <div className="font-semibold">{match.full_time_home_goals} - {match.full_time_away_goals}</div>
                  <div>{match.away_team}</div>
                </div>
              </div>
            )}
            
            <div className="mt-4 text-xs text-zinc-500">
              <p>Használd az eszközöket a játékosok mozgatásához és a taktikai elemek rajzolásához.</p>
            </div>
          </Card>
        </div>
      </div>
    </Card>
  );
};