import { supabase } from '@/integrations/supabase/client';

export interface CloudLeaderboardEntry {
  id: string;
  player_name: string;
  score: number;
  wave: number;
  map_id: string;
  created_at: string;
}

const SCORE_MIN = 0;
const SCORE_MAX = 1_000_000_000;
const WAVE_MIN = 0;
const WAVE_MAX = 1_000_000;
const PLAYER_NAME_MAX = 24;
const MAP_ID_MAX = 64;
const QUERY_TIMEOUT_MS = 8000;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function normalizePlayerName(name: string): string {
  const normalized = name.trim().slice(0, PLAYER_NAME_MAX);
  return normalized.length > 0 ? normalized : 'Anonymous';
}

function normalizeMapId(mapId: string): string {
  const normalized = mapId.trim().slice(0, MAP_ID_MAX);
  return normalized.length > 0 ? normalized : 'forest_path';
}

function withTimeoutSignal(timeoutMs: number): AbortSignal {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeoutMs);
  return controller.signal;
}

export async function submitScore(playerName: string, score: number, wave: number, mapId: string): Promise<boolean> {
  const safePlayerName = normalizePlayerName(playerName);
  const safeScore = clamp(Math.floor(score), SCORE_MIN, SCORE_MAX);
  const safeWave = clamp(Math.floor(wave), WAVE_MIN, WAVE_MAX);
  const safeMapId = normalizeMapId(mapId);

  try {
    const { error } = await supabase
      .from('leaderboard')
      .insert({
        player_name: safePlayerName,
        score: safeScore,
        wave: safeWave,
        map_id: safeMapId,
      })
      .abortSignal(withTimeoutSignal(QUERY_TIMEOUT_MS));

    return !error;
  } catch {
    return false;
  }
}

export async function fetchLeaderboard(mapId?: string, limit = 10): Promise<CloudLeaderboardEntry[]> {
  const safeLimit = clamp(Math.floor(limit || 10), 1, 100);

  try {
    let query = supabase
      .from('leaderboard')
      .select('*')
      .order('score', { ascending: false })
      .limit(safeLimit)
      .abortSignal(withTimeoutSignal(QUERY_TIMEOUT_MS));

    if (mapId) {
      query = query.eq('map_id', normalizeMapId(mapId));
    }

    const { data, error } = await query;
    if (error || !data) return [];
    return data as CloudLeaderboardEntry[];
  } catch {
    return [];
  }
}
