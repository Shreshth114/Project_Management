CREATE OR REPLACE FUNCTION public.register_app_profile(
  p_auth_id uuid,
  p_email text,
  p_role text,
  p_name text,
  p_usn text,
  p_subject_code text,
  p_guide_id integer,
  p_team_code text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_user_id integer;
  v_subject_id integer;
  v_guide_subject_id integer;
  v_team_id integer;
  v_team_subject_id integer;
  v_team_guide_id integer;
  v_role text := upper(trim(p_role));
  v_email text := lower(trim(p_email));
  v_team_code text := upper(trim(p_team_code));
BEGIN
  IF p_auth_id IS NULL OR v_email = '' OR trim(p_name) = '' THEN
    RAISE EXCEPTION 'Required registration details are missing.';
  END IF;

  IF v_role NOT IN ('STUDENT', 'TEACHER', 'FACULTY') THEN
    RAISE EXCEPTION 'This registration role is not permitted.';
  END IF;

  IF v_role = 'FACULTY' THEN
    v_role := 'TEACHER';
  END IF;

  IF v_role = 'STUDENT' THEN
    IF trim(coalesce(p_usn, '')) = '' OR trim(coalesce(p_subject_code, '')) = ''
      OR p_guide_id IS NULL OR v_team_code = '' THEN
      RAISE EXCEPTION 'Student registration requires a USN, subject, guide, and team name.';
    END IF;

    IF EXISTS (
      SELECT 1 FROM public.student s
      WHERE upper(trim(s.usn)) = upper(trim(p_usn))
    ) THEN
      RAISE EXCEPTION 'A student with this USN is already registered.';
    END IF;

    SELECT s.subject_id INTO v_subject_id
    FROM public.subject s
    WHERE upper(trim(s.subject_code)) = upper(trim(p_subject_code))
    LIMIT 1;
    IF v_subject_id IS NULL THEN
      RAISE EXCEPTION 'The selected subject does not exist.';
    END IF;

    SELECT f.subject_id INTO v_guide_subject_id
    FROM public.faculty f
    WHERE f.faculty_id = p_guide_id;
    IF v_guide_subject_id IS NULL OR v_guide_subject_id <> v_subject_id THEN
      RAISE EXCEPTION 'The selected guide is not assigned to this subject.';
    END IF;

    SELECT t.team_id, t.subject_id, t.guide_id
      INTO v_team_id, v_team_subject_id, v_team_guide_id
    FROM public.team t
    WHERE upper(trim(t.team_code)) = v_team_code
    ORDER BY t.team_id
    LIMIT 1
    FOR UPDATE;

    IF v_team_id IS NOT NULL THEN
      IF v_team_subject_id <> v_subject_id OR v_team_guide_id <> p_guide_id THEN
        RAISE EXCEPTION 'This team name is already assigned to a different subject or guide.';
      END IF;
    ELSE
      INSERT INTO public.team (team_code, subject_id, guide_id)
      VALUES (v_team_code, v_subject_id, p_guide_id)
      RETURNING team_id INTO v_team_id;
    END IF;
  ELSE
    IF trim(coalesce(p_subject_code, '')) = '' THEN
      RAISE EXCEPTION 'Faculty registration requires an existing subject.';
    END IF;

    SELECT s.subject_id INTO v_subject_id
    FROM public.subject s
    WHERE upper(trim(s.subject_code)) = upper(trim(p_subject_code))
    LIMIT 1;
    IF v_subject_id IS NULL THEN
      RAISE EXCEPTION 'The selected subject does not exist. Ask an admin to add it first.';
    END IF;
  END IF;

  INSERT INTO public.users (auth_id, email, password_hash, role)
  VALUES (p_auth_id, v_email, 'managed_by_supabase_auth', v_role)
  RETURNING user_id INTO v_user_id;

  IF v_role = 'STUDENT' THEN
    INSERT INTO public.student (user_id, team_id, usn, name)
    VALUES (v_user_id, v_team_id, upper(trim(p_usn)), trim(p_name));
  ELSE
    INSERT INTO public.faculty (user_id, subject_id, name, is_coordinator)
    VALUES (v_user_id, v_subject_id, trim(p_name), false);
  END IF;
END;
$function$;

REVOKE ALL ON FUNCTION public.register_app_profile(uuid, text, text, text, text, text, integer, text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.register_app_profile(uuid, text, text, text, text, text, integer, text)
  TO service_role;
