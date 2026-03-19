-- Harden leaderboard against obvious abuse / malformed inserts

ALTER TABLE public.leaderboard
  ADD CONSTRAINT leaderboard_player_name_length
    CHECK (char_length(player_name) BETWEEN 1 AND 24),
  ADD CONSTRAINT leaderboard_score_range
    CHECK (score BETWEEN 0 AND 1000000000),
  ADD CONSTRAINT leaderboard_wave_range
    CHECK (wave BETWEEN 0 AND 1000000),
  ADD CONSTRAINT leaderboard_map_id_length
    CHECK (char_length(map_id) BETWEEN 1 AND 64);
