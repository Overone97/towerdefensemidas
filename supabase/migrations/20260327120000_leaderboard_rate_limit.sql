-- Rate-limit: max 1 insert par joueur toutes les 10 secondes
CREATE OR REPLACE FUNCTION public.check_leaderboard_rate_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.leaderboard
    WHERE created_at > now() - interval '10 seconds'
    AND player_name = NEW.player_name
  ) THEN
    RAISE EXCEPTION 'Rate limit exceeded: please wait before submitting another score';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS leaderboard_rate_limit ON public.leaderboard;
CREATE TRIGGER leaderboard_rate_limit
  BEFORE INSERT ON public.leaderboard
  FOR EACH ROW EXECUTE FUNCTION public.check_leaderboard_rate_limit();
