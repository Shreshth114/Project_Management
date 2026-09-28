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

  INSERT INTO public.users (auth_id, email, role)
  VALUES (p_auth_id, v_email, v_role)
  RETURNING user_id INTO v_user_id;

  IF v_role = 'STUDENT' THEN
    IF trim(coalesce(p_usn, '')) = '' OR trim(coalesce(p_subject_code, '')) = '' OR p_guide_id IS NULL OR v_team_code = '' THEN
      RAISE EXCEPTION 'Student registration requires USN, subject, guide, and team name.';
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

    -- Batch ID Logic: Automatically find existing or create new
    SELECT t.team_id, t.guide_id
      INTO v_team_id, v_team_guide_id
    FROM public.team t
    WHERE upper(trim(t.team_code)) = v_team_code
    ORDER BY t.team_id
    LIMIT 1
    FOR UPDATE;

    IF v_team_id IS NULL THEN
      -- If the Batch ID does not exist, create the corresponding group automatically
      INSERT INTO public.team (team_code, subject_id, guide_id)
      VALUES (v_team_code, v_subject_id, p_guide_id)
      RETURNING team_id INTO v_team_id;
    ELSE
      -- If it does exist, update the guide to ensure the student's selected guide is applied 
      -- in case the group was previously created with a different default or test guide.
      IF v_team_guide_id <> p_guide_id THEN
        UPDATE public.team SET guide_id = p_guide_id WHERE team_id = v_team_id;
      END IF;
    END IF;

    INSERT INTO public.student (user_id, team_id, usn, name)
    VALUES (v_user_id, v_team_id, upper(trim(p_usn)), trim(p_name));
    
  ELSE
    IF trim(coalesce(p_subject_code, '')) = '' THEN
      RAISE EXCEPTION 'Faculty registration requires an existing subject.';
    END IF;

    SELECT s.subject_id INTO v_subject_id
    FROM public.subject s
    WHERE upper(trim(s.subject_code)) = upper(trim(p_subject_code))
    LIMIT 1;
    IF v_subject_id IS NULL THEN
      RAISE EXCEPTION 'The selected subject does not exist.';
    END IF;

    INSERT INTO public.faculty (user_id, subject_id, name)
    VALUES (v_user_id, v_subject_id, trim(p_name));
  END IF;
END;
$function$;
