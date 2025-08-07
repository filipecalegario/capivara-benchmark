-- Fix ambiguous column references by qualifying table columns with aliases
CREATE OR REPLACE FUNCTION public.capivara_increment_up(p_title text)
RETURNS TABLE(up_count integer, down_count integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.capivara(title) VALUES (p_title)
  ON CONFLICT (title) DO NOTHING;

  UPDATE public.capivara AS c
  SET up_count = c.up_count + 1
  WHERE c.title = p_title;

  RETURN QUERY
  SELECT c.up_count, c.down_count
  FROM public.capivara AS c
  WHERE c.title = p_title;
END;
$function$;

CREATE OR REPLACE FUNCTION public.capivara_increment_down(p_title text)
RETURNS TABLE(up_count integer, down_count integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.capivara(title) VALUES (p_title)
  ON CONFLICT (title) DO NOTHING;

  UPDATE public.capivara AS c
  SET down_count = c.down_count + 1
  WHERE c.title = p_title;

  RETURN QUERY
  SELECT c.up_count, c.down_count
  FROM public.capivara AS c
  WHERE c.title = p_title;
END;
$function$;
