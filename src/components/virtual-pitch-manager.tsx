import React from 'react';
import { Button, Card, Tooltip } from '@heroui/react';
import { Icon } from '@iconify/react';
import { toPng } from 'html-to-image';

// Split into smaller components for better maintainability
const PitchField: React.FC<{children: React.ReactNode}> = ({ children }) => {
  return (
    <div className="relative aspect-video bg-emerald-800 rounded-lg overflow-hidden">
      {/* Field markings */}
      <div className="absolute inset-0">
        <div className="border-2 border-white/30 absolute inset-[5%]"></div>
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/30 -translate-x-1/2"></div>
        <div className="absolute left-1/2 top-1/2 w-[60px] h-[60px] border-2 border-white/30 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        
        {/* Goal areas */}
        <div className="absolute left-[5%] top-1/2 w-[80px] h-[150px] border-2 border-white/30 -translate-y-1/2"></div>
        <div className="absolute right-[5%] top-1/2 w-[80px] h-[150px] border-2 border-white/30 -translate-y-1/2"></div>
      </div>
      
      {children}
    </div>
  );
};

const PlayerMarker: React.FC<{
  position: {x: number, y: number},
  color: string,
  number: number,
  name: string,
  isDragging?: boolean,
  onDragStart?: () => void,
  onDragEnd?: () => void
}> = ({ position, color, number, name, isDragging, onDragStart, onDragEnd }) => {
  return (
    <Tooltip content={name}>
      <div 
        className={`absolute w-8 h-8 rounded-full flex items-center justify-center text-white font-bold cursor-move ${
          isDragging ? 'ring-2 ring-white z-20' : ''
        }`}
        style={{
          backgroundColor: color,
          left: `${position.x}%`,
          top: `${position.y}%`,
          transform: 'translate(-50%, -50%)'
        }}
        onMouseDown={onDragStart}
        onMouseUp={onDragEnd}
        onTouchStart={onDragStart}
        onTouchEnd={onDragEnd}
      >
        {number}
      </div>
    </Tooltip>
  );
};

export const VirtualPitchManager: React.FC = () => {
  const pitchRef = React.useRef<HTMLDivElement>(null);
  const [formation, setFormation] = React.useState('4-4-2');
  const [isDraggingPlayer, setIsDraggingPlayer] = React.useState(false);
  const [currentPlayer, setCurrentPlayer] = React.useState<number | null>(null);
  
  // Default player positions based on formation
  const playerPositions = React.useMemo(() => {
    // Implementation would map formations to player positions
    return Array(11).fill(0).map((_, i) => ({
      x: 20 + (i % 4) * 20,
      y: 20 + Math.floor(i / 4) * 20
    }));
  }, [formation]);
  
  const handleDragStart = (playerIndex: number) => {
    setIsDraggingPlayer(true);
    setCurrentPlayer(playerIndex);
  };
  
  const handleDragEnd = () => {
    setIsDraggingPlayer(false);
    setCurrentPlayer(null);
  };
  
  const exportPitchAsPng = async () => {
    if (!pitchRef.current) return;
    
    try {
      const dataUrl = await toPng(pitchRef.current);
      
      // Create download link
      const link = document.createElement('a');
      link.download = `virtual-pitch-${formation}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error exporting pitch:', error);
    }
  };
  
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Virtuális pálya</h3>
        <div className="flex items-center gap-2">
          <select 
            value={formation}
            onChange={(e) => setFormation(e.target.value)}
            className="bg-white/10 border border-white/10 rounded-md px-3 py-2 text-sm"
          >
            <option value="4-4-2">4-4-2</option>
            <option value="4-3-3">4-3-3</option>
            <option value="3-5-2">3-5-2</option>
            <option value="5-3-2">5-3-2</option>
          </select>
          
          <Button
            variant="flat"
            color="default"
            size="sm"
            onPress={exportPitchAsPng}
            startContent={<Icon icon="lucide:download" width={16} height={16} />}
          >
            Exportálás
          </Button>
        </div>
      </div>
      
      <div ref={pitchRef}>
        <PitchField>
          {playerPositions.map((pos, index) => (
            <PlayerMarker
              key={index}
              position={pos}
              color={index === 0 ? '#f59e0b' : '#8b5cf6'}
              number={index}
              name={`Játékos ${index + 1}`}
              isDragging={isDraggingPlayer && currentPlayer === index}
              onDragStart={() => handleDragStart(index)}
              onDragEnd={handleDragEnd}
            />
          ))}
        </PitchField>
      </div>
      
      <div className="mt-4 text-xs text-zinc-400">
        <p>Húzd a játékosokat a pályán a pozíciók beállításához. Használd a formáció választót a felállás módosításához.</p>
      </div>
    </Card>
  );
};