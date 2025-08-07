-- Create table for public like/dislike counters per card title
CREATE TABLE IF NOT EXISTS public.capivara (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL UNIQUE,
  up_count integer NOT NULL DEFAULT 0,
  down_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.capivara ENABLE ROW LEVEL SECURITY;

-- Anyone (including anon) can read the counters
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'capivara' AND policyname = 'Anyone can select capivara'
  ) THEN
    CREATE POLICY "Anyone can select capivara"
    ON public.capivara
    FOR SELECT
    USING (true);
  END IF;
END $$;

-- Trigger to keep updated_at fresh
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_capivara_updated_at'
  ) THEN
    CREATE TRIGGER update_capivara_updated_at
    BEFORE UPDATE ON public.capivara
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Increment helpers (run as definer to bypass RLS for safe, scoped updates)
CREATE OR REPLACE FUNCTION public.capivara_increment_up(p_title text)
RETURNS TABLE (up_count integer, down_count integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  INSERT INTO public.capivara(title) VALUES (p_title)
  ON CONFLICT (title) DO NOTHING;

  UPDATE public.capivara
  SET up_count = up_count + 1
  WHERE title = p_title;

  RETURN QUERY
  SELECT up_count, down_count
  FROM public.capivara
  WHERE title = p_title;
END;
$$;

CREATE OR REPLACE FUNCTION public.capivara_increment_down(p_title text)
RETURNS TABLE (up_count integer, down_count integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  INSERT INTO public.capivara(title) VALUES (p_title)
  ON CONFLICT (title) DO NOTHING;

  UPDATE public.capivara
  SET down_count = down_count + 1
  WHERE title = p_title;

  RETURN QUERY
  SELECT up_count, down_count
  FROM public.capivara
  WHERE title = p_title;
END;
$$;