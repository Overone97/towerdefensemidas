
-- Public leaderboard for endless mode scores (no auth required for reading)
CREATE TABLE public.leaderboard (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_name TEXT NOT NULL DEFAULT 'Anonymous',
  score INTEGER NOT NULL DEFAULT 0,
  wave INTEGER NOT NULL DEFAULT 0,
  map_id TEXT NOT NULL DEFAULT 'forest_path',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

-- Anyone can read leaderboard
CREATE POLICY "Leaderboard is publicly readable"
  ON public.leaderboard
  FOR SELECT
  USING (true);

-- Anyone can insert scores (no auth needed for a casual game)
CREATE POLICY "Anyone can submit scores"
  ON public.leaderboard
  FOR INSERT
  WITH CHECK (true);

-- Index for fast sorting
CREATE INDEX idx_leaderboard_score ON public.leaderboard (score DESC);
CREATE INDEX idx_leaderboard_map ON public.leaderboard (map_id, score DESC);
