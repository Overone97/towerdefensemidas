import { supabase } from '@/integrations/supabase/client';

export interface CloudLeaderboardEntry {
  id: string;
  player_name: string;
  score: number;
  wave: number;
  map_id: string;
  created_at: string;
}

export async function submitScore(playerName: string, score: number, wave: number, mapId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('leaderboard')
      .insert({ player_name: playerName, score, wave, map_id: mapId });
    return !error;
  } catch {
    return false;
  }
}

export async function fetchLeaderboard(mapId?: string, limit = 10): Promise<CloudLeaderboardEntry[]> {
  try {
    let query = supabase
      .from('leaderboard')
      .select('*')
      .order('score', { ascending: false })
      .limit(limit);

    if (mapId) {
      query = query.eq('map_id', mapId);
    }

    const { data, error } = await query;
    if (error || !data) return [];
    return data as CloudLeaderboardEntry[];
  } catch {
    return [];
  }
}
