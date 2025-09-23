interface TeamMapping {
  [key: string]: string[];
}

// Common team name variations and mappings
const TEAM_MAPPINGS: TeamMapping = {
  // Real Madrid variations
  "Real Madrid": ["Madrid Fehér", "Madrid White", "Real Madrid CF", "Real", "RM"],
  
  // Atletico Madrid variations  
  "Atletico Madrid": ["Madrid Piros", "Madrid Red", "Atlético Madrid", "Atletico", "ATM"],
  
  // Sevilla variations
  "Sevilla": ["Sevilla Piros", "Sevilla Red", "Sevilla FC", "SFC"],
  "Real Betis": ["Sevilla Zöld", "Sevilla Green", "Betis", "Real Betis Balompié"],
  
  // Barcelona variations
  "Barcelona": ["Barcelona", "Barça", "FC Barcelona", "FCB", "Barca"],
  
  // Athletic Bilbao variations
  "Athletic Bilbao": ["Bilbao", "Athletic Club", "Athletic", "Bilbao Athletic"],
  
  // Valencia variations
  "Valencia": ["Valencia CF", "Valencia", "VCF"],
  
  // Villarreal variations
  "Villarreal": ["Villarreal CF", "Yellow Submarine", "VCF"],
  
  // Real Sociedad variations
  "Real Sociedad": ["San Sebastian", "Real Sociedad de Fútbol", "Sociedad"],
  
  // Other La Liga teams
  "Deportivo Alaves": ["Alaves", "Alavés", "Deportivo Alavés"],
  "RC Celta": ["Vigo", "Celta Vigo", "RC Celta de Vigo"],
  "Getafe": ["Getafe CF", "Getafe"],
  "Girona": ["Girona FC", "Girona"],
  "Las Palmas": ["UD Las Palmas", "Las Palmas", "UDLP"],
  "RCD Mallorca": ["Mallorca", "RCD Mallorca"],
  "CA Osasuna": ["Osasuna", "CA Osasuna"],
};

// Calculate Levenshtein distance for fuzzy matching
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

// Normalize team name for comparison
function normalizeTeamName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\\w\\s]/g, '')
    .replace(/\\s+/g, ' ');
}

// Find best matching team name
export function findBestTeamMatch(
  inputName: string, 
  availableTeams: string[], 
  threshold: number = 0.7
): {
  exactMatch: string | null;
  suggestions: Array<{ name: string; confidence: number; reason: string }>;
} {
  const normalizedInput = normalizeTeamName(inputName);
  
  // Check for exact matches first
  for (const team of availableTeams) {
    if (normalizeTeamName(team) === normalizedInput) {
      return {
        exactMatch: team,
        suggestions: []
      };
    }
  }
  
  // Check mappings
  for (const [canonicalName, variations] of Object.entries(TEAM_MAPPINGS)) {
    for (const variation of variations) {
      if (normalizeTeamName(variation) === normalizedInput) {
        // Find the canonical name in available teams
        const match = availableTeams.find(team => 
          normalizeTeamName(team) === normalizeTeamName(canonicalName)
        );
        if (match) {
          return {
            exactMatch: match,
            suggestions: []
          };
        }
      }
    }
  }
  
  // Fuzzy matching
  const suggestions: Array<{ name: string; confidence: number; reason: string }> = [];
  
  for (const team of availableTeams) {
    const normalizedTeam = normalizeTeamName(team);
    const distance = levenshteinDistance(normalizedInput, normalizedTeam);
    const maxLength = Math.max(normalizedInput.length, normalizedTeam.length);
    const similarity = 1 - (distance / maxLength);
    
    if (similarity >= threshold) {
      suggestions.push({
        name: team,
        confidence: Math.round(similarity * 100),
        reason: similarity > 0.9 ? 'Very close match' : 
                similarity > 0.8 ? 'Close match' : 'Possible match'
      });
    }
    
    // Also check if input is contained in team name or vice versa
    if (normalizedTeam.includes(normalizedInput) || normalizedInput.includes(normalizedTeam)) {
      if (!suggestions.find(s => s.name === team)) {
        suggestions.push({
          name: team,
          confidence: 85,
          reason: 'Contains match'
        });
      }
    }
  }
  
  // Sort by confidence
  suggestions.sort((a, b) => b.confidence - a.confidence);
  
  return {
    exactMatch: null,
    suggestions: suggestions.slice(0, 5) // Top 5 suggestions
  };
}

// Get all possible variations for a team
export function getTeamVariations(teamName: string): string[] {
  const normalizedInput = normalizeTeamName(teamName);
  
  for (const [canonicalName, variations] of Object.entries(TEAM_MAPPINGS)) {
    if (normalizeTeamName(canonicalName) === normalizedInput || 
        variations.some(v => normalizeTeamName(v) === normalizedInput)) {
      return [canonicalName, ...variations];
    }
  }
  
  return [teamName];
}

// Export the mappings for external use
export { TEAM_MAPPINGS };
