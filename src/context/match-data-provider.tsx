import React from 'react';
import { useMatchData, MatchDataContext } from '../hooks/use-match-data';

// Create a provider component
export const MatchDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const matchData = useMatchData();
  
  return (
    <MatchDataContext.Provider value={matchData}>
      {children}
    </MatchDataContext.Provider>
  );
};