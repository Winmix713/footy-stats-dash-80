import React from 'react';
import { Icon } from '@iconify/react';
import { Link, useLocation } from 'react-router-dom';

export const MobileNav: React.FC = () => {
  const location = useLocation();
  
  // Helper function to check if a link is active
  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-background/80 backdrop-blur-xl border-t border-white/10">
      <div className="flex items-center justify-around py-2">
        <Link to="/" className="flex flex-col items-center gap-1 px-4 py-2">
          <Icon 
            icon="lucide:home" 
            width={20} 
            height={20} 
            className={isActive('/') ? "text-violet-400" : "text-zinc-400"} 
          />
          <span className={`text-xs ${isActive('/') ? "text-white" : "text-zinc-300"}`}>Főoldal</span>
        </Link>
        <Link to="/teams" className="flex flex-col items-center gap-1 px-4 py-2">
          <Icon 
            icon="lucide:shield" 
            width={20} 
            height={20} 
            className={isActive('/teams') ? "text-violet-400" : "text-zinc-400"} 
          />
          <span className={`text-xs ${isActive('/teams') ? "text-white" : "text-zinc-300"}`}>Csapatok</span>
        </Link>
        <Link to="/stats" className="flex flex-col items-center gap-1 px-4 py-2">
          <Icon 
            icon="lucide:bar-chart-2" 
            width={20} 
            height={20} 
            className={isActive('/stats') ? "text-violet-400" : "text-zinc-400"} 
          />
          <span className={`text-xs ${isActive('/stats') ? "text-white" : "text-zinc-300"}`}>Statisztikák</span>
        </Link>
        <Link to="/results" className="flex flex-col items-center gap-1 px-4 py-2">
          <Icon 
            icon="lucide:list" 
            width={20} 
            height={20} 
            className={isActive('/results') ? "text-violet-400" : "text-zinc-400"} 
          />
          <span className={`text-xs ${isActive('/results') ? "text-white" : "text-zinc-300"}`}>Eredmények</span>
        </Link>
      </div>
    </div>
  );
};