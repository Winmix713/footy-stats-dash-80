// This file contains a component instead of a hook
// Replacing with a proper Supabase hook implementation

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useSupabase = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      setIsLoading(true);
      try {
        // Simple query to check if Supabase is connected
        const { data, error } = await supabase
          .from('matches')
          .select('id')
          .limit(1);
        
        if (error) throw error;
        
        setIsConnected(true);
        setError(null);
      } catch (err) {
        console.error('Supabase connection error:', err);
        setIsConnected(false);
        setError(err instanceof Error ? err : new Error('Unknown connection error'));
      } finally {
        setIsLoading(false);
      }
    };

    checkConnection();
  }, []);

  return { isConnected, isLoading, error };
};

// Helper function to check Supabase connection
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('matches')
      .select('id')
      .limit(1);
    
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Supabase connection error:', err);
    return false;
  }
};