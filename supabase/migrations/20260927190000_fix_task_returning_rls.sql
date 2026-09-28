CREATE OR REPLACE FUNCTION private.can_access_task_faculty(p_faculty_id integer)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT (SELECT private.is_admin()) OR EXISTS (
    SELECT 1
    FROM public.faculty AS owner_faculty
    WHERE owner_faculty.faculty_id = p_faculty_id
      AND (
        owner_faculty.faculty_id = (SELECT private.app_faculty_id())
        OR (
          (SELECT private.is_coordinator())
          AND owner_faculty.subject_id = (SELECT private.app_faculty_subject_id())
        )
        OR EXISTS (
          SELECT 1
          FROM public.student AS s
          JOIN public.team AS team ON team.team_id = s.team_id
          WHERE s.user_id = (SELECT private.app_user_id())
            AND team.subject_id = owner_faculty.subject_id
        )
      )
  )
$$;

REVOKE ALL ON FUNCTION private.can_access_task_faculty(integer)
  FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION private.can_access_task_faculty(integer)
  TO authenticated;

DROP POLICY IF EXISTS task_related_read ON public.task;

CREATE POLICY task_related_read ON public.task
  FOR SELECT TO authenticated
  USING ((SELECT private.can_access_task_faculty(faculty_id)));
