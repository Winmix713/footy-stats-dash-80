import React from 'react';
import { TeamsSection } from '../components/teams-section';
import { Match } from '../types/match';

interface TeamsPageProps {
  matches: Match[];
}

const TeamsPage: React.FC<TeamsPageProps> = ({ matches }) => {
  return (
    <div className="page-content">
      <div className="text-center space-y-3 mb-10">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white">
          Csapatok
        </h1>
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-zinc-300">
          Tekintsd meg a csapatok részletes statisztikáit, power ranking besorolását és mérkőzés történetét.
        </p>
      </div>
      
      <TeamsSection matches={matches} />
    </div>
  );
};

export default TeamsPage;