CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA private TO authenticated;

CREATE OR REPLACE FUNCTION private.app_user_id()
RETURNS integer
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT u.user_id
  FROM public.users AS u
  WHERE u.auth_id = (SELECT auth.uid())
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION private.app_student_id()
RETURNS integer
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT s.student_id
  FROM public.student AS s
  WHERE s.user_id = (SELECT private.app_user_id())
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION private.app_faculty_id()
RETURNS integer
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT f.faculty_id
  FROM public.faculty AS f
  WHERE f.user_id = (SELECT private.app_user_id())
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION private.app_faculty_subject_id()
RETURNS integer
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT f.subject_id
  FROM public.faculty AS f
  WHERE f.user_id = (SELECT private.app_user_id())
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users AS u
    WHERE u.auth_id = (SELECT auth.uid())
      AND u.role = 'ADMIN'
  )
$$;

CREATE OR REPLACE FUNCTION private.is_coordinator()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.faculty AS f
    WHERE f.user_id = (SELECT private.app_user_id())
      AND f.is_coordinator
  )
$$;

CREATE OR REPLACE FUNCTION private.can_access_team(p_team_id integer)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT (SELECT private.is_admin()) OR EXISTS (
    SELECT 1
    FROM public.team AS t
    WHERE t.team_id = p_team_id
      AND (
        EXISTS (
          SELECT 1 FROM public.student AS s
          WHERE s.team_id = t.team_id
            AND s.user_id = (SELECT private.app_user_id())
        )
        OR t.guide_id = (SELECT private.app_faculty_id())
        OR (
          (SELECT private.is_coordinator())
          AND t.subject_id = (SELECT private.app_faculty_subject_id())
        )
      )
  )
$$;

CREATE OR REPLACE FUNCTION private.can_access_task(p_task_id integer)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT (SELECT private.is_admin()) OR EXISTS (
    SELECT 1
    FROM public.task AS t
    JOIN public.faculty AS owner_faculty ON owner_faculty.faculty_id = t.faculty_id
    WHERE t.task_id = p_task_id
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

CREATE OR REPLACE FUNCTION private.can_manage_task(p_task_id integer)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT (SELECT private.is_admin()) OR (
    (SELECT private.is_coordinator())
    AND EXISTS (
      SELECT 1
      FROM public.task AS t
      JOIN public.faculty AS f ON f.faculty_id = t.faculty_id
      WHERE t.task_id = p_task_id
        AND f.subject_id = (SELECT private.app_faculty_subject_id())
    )
  )
$$;

CREATE OR REPLACE FUNCTION private.can_access_student(p_student_id integer)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT (SELECT private.is_admin()) OR EXISTS (
    SELECT 1
    FROM public.student AS s
    WHERE s.student_id = p_student_id
      AND (
        s.user_id = (SELECT private.app_user_id())
        OR (SELECT private.can_access_team(s.team_id))
      )
  )
$$;

CREATE OR REPLACE FUNCTION private.can_access_contact(p_user_id integer)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT (SELECT private.is_admin())
    OR p_user_id = (SELECT private.app_user_id())
    OR EXISTS (
      SELECT 1 FROM public.student AS s
      WHERE s.user_id = p_user_id
        AND (SELECT private.can_access_student(s.student_id))
    )
    OR EXISTS (
      SELECT 1
      FROM public.faculty AS target_faculty
      WHERE target_faculty.user_id = p_user_id
        AND (
          target_faculty.faculty_id = (SELECT private.app_faculty_id())
          OR (
            (SELECT private.app_faculty_subject_id()) IS NOT NULL
            AND target_faculty.subject_id = (SELECT private.app_faculty_subject_id())
          )
          OR EXISTS (
            SELECT 1
            FROM public.student AS current_student
            JOIN public.team AS current_team ON current_team.team_id = current_student.team_id
            WHERE current_student.user_id = (SELECT private.app_user_id())
              AND (
                current_team.guide_id = target_faculty.faculty_id
                OR (
                  target_faculty.is_coordinator
                  AND current_team.subject_id = target_faculty.subject_id
                )
              )
          )
        )
    )
$$;

CREATE OR REPLACE FUNCTION private.can_message_user(p_user_id integer)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT (SELECT private.can_access_contact(p_user_id))
$$;

CREATE OR REPLACE FUNCTION private.can_submit_task(p_task_id integer)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.student AS s
    JOIN public.team AS team ON team.team_id = s.team_id
    JOIN public.task AS task ON task.task_id = p_task_id
    JOIN public.faculty AS task_faculty ON task_faculty.faculty_id = task.faculty_id
    WHERE s.user_id = (SELECT private.app_user_id())
      AND team.subject_id = task_faculty.subject_id
  )
$$;

CREATE OR REPLACE FUNCTION private.can_upload_submission_path(p_path text)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT CASE
    WHEN split_part(p_path, '/', 1) = (SELECT auth.uid())::text
      AND split_part(p_path, '/', 2) ~ '^[0-9]+$'
    THEN (SELECT private.can_submit_task(split_part(p_path, '/', 2)::integer))
    ELSE false
  END
$$;

CREATE OR REPLACE FUNCTION private.can_access_submission_object(p_path text)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT (SELECT private.is_admin())
    OR (SELECT private.can_upload_submission_path(p_path))
    OR EXISTS (
      SELECT 1 FROM public.submission AS s
      WHERE s.file_url = p_path
        AND (SELECT private.can_access_team(s.team_id))
    )
$$;

CREATE OR REPLACE FUNCTION private.can_write_evaluation(
  p_submission_id integer,
  p_student_id integer,
  p_criteria_id integer,
  p_evaluator_id integer
)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT p_evaluator_id = (SELECT private.app_faculty_id())
    AND EXISTS (
      SELECT 1
      FROM public.submission AS sub
      JOIN public.student AS evaluated_student
        ON evaluated_student.student_id = p_student_id
       AND evaluated_student.team_id = sub.team_id
      JOIN public.evaluation_criteria AS criteria
        ON criteria.criteria_id = p_criteria_id
       AND criteria.task_id = sub.task_id
      WHERE sub.submission_id = p_submission_id
        AND (SELECT private.can_access_team(sub.team_id))
        AND (SELECT private.can_access_task(sub.task_id))
    )
$$;

REVOKE ALL ON ALL FUNCTIONS IN SCHEMA private FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA private TO authenticated;

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.subject TO anon;
GRANT SELECT (faculty_id, name, is_coordinator, subject_id) ON public.faculty TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM PUBLIC, anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

ALTER TABLE public.admin ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluation_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subject ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS subjects_read_for_registration ON public.subject;
DROP POLICY IF EXISTS subjects_read_for_registration ON public.subject;
CREATE POLICY subjects_read_for_registration ON public.subject
  FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS subjects_admin_manage ON public.subject;
CREATE POLICY subjects_admin_manage ON public.subject
  FOR ALL TO authenticated
  USING ((SELECT private.is_admin()))
  WITH CHECK ((SELECT private.is_admin()));

DROP POLICY IF EXISTS faculty_read_for_registration ON public.faculty;
CREATE POLICY faculty_read_for_registration ON public.faculty
  FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS faculty_authenticated_read ON public.faculty;
CREATE POLICY faculty_authenticated_read ON public.faculty
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS faculty_admin_manage ON public.faculty;
CREATE POLICY faculty_admin_manage ON public.faculty
  FOR ALL TO authenticated
  USING ((SELECT private.is_admin()))
  WITH CHECK ((SELECT private.is_admin()));

DROP POLICY IF EXISTS users_read_related_profiles ON public.users;
CREATE POLICY users_read_related_profiles ON public.users
  FOR SELECT TO authenticated
  USING ((SELECT private.can_access_contact(user_id)));
DROP POLICY IF EXISTS users_admin_manage ON public.users;
CREATE POLICY users_admin_manage ON public.users
  FOR ALL TO authenticated
  USING ((SELECT private.is_admin()))
  WITH CHECK ((SELECT private.is_admin()));

DROP POLICY IF EXISTS admin_admin_manage ON public.admin;
CREATE POLICY admin_admin_manage ON public.admin
  FOR ALL TO authenticated
  USING ((SELECT private.is_admin()))
  WITH CHECK ((SELECT private.is_admin()));

DROP POLICY IF EXISTS audit_log_admin_read ON public.audit_log;
CREATE POLICY audit_log_admin_read ON public.audit_log
  FOR SELECT TO authenticated
  USING ((SELECT private.is_admin()));
DROP POLICY IF EXISTS audit_log_admin_manage ON public.audit_log;
CREATE POLICY audit_log_admin_manage ON public.audit_log
  FOR ALL TO authenticated
  USING ((SELECT private.is_admin()))
  WITH CHECK ((SELECT private.is_admin()));

DROP POLICY IF EXISTS student_related_read ON public.student;
CREATE POLICY student_related_read ON public.student
  FOR SELECT TO authenticated
  USING ((SELECT private.can_access_student(student_id)));
DROP POLICY IF EXISTS student_admin_manage ON public.student;
CREATE POLICY student_admin_manage ON public.student
  FOR ALL TO authenticated
  USING ((SELECT private.is_admin()))
  WITH CHECK ((SELECT private.is_admin()));

DROP POLICY IF EXISTS team_related_read ON public.team;
CREATE POLICY team_related_read ON public.team
  FOR SELECT TO authenticated
  USING ((SELECT private.can_access_team(team_id)));
DROP POLICY IF EXISTS team_admin_manage ON public.team;
CREATE POLICY team_admin_manage ON public.team
  FOR ALL TO authenticated
  USING ((SELECT private.is_admin()))
  WITH CHECK ((SELECT private.is_admin()));
DROP POLICY IF EXISTS team_coordinator_manage_subject ON public.team;
CREATE POLICY team_coordinator_manage_subject ON public.team
  FOR ALL TO authenticated
  USING (
    (SELECT private.is_coordinator())
    AND subject_id = (SELECT private.app_faculty_subject_id())
  )
  WITH CHECK (
    (SELECT private.is_coordinator())
    AND subject_id = (SELECT private.app_faculty_subject_id())
    AND EXISTS (
      SELECT 1 FROM public.faculty AS f
      WHERE f.faculty_id = team.guide_id
        AND f.subject_id = team.subject_id
    )
  );

DROP POLICY IF EXISTS task_related_read ON public.task;
CREATE POLICY task_related_read ON public.task
  FOR SELECT TO authenticated
  USING ((SELECT private.can_access_task(task_id)));
DROP POLICY IF EXISTS task_admin_manage ON public.task;
CREATE POLICY task_admin_manage ON public.task
  FOR ALL TO authenticated
  USING ((SELECT private.is_admin()))
  WITH CHECK ((SELECT private.is_admin()));
DROP POLICY IF EXISTS task_coordinator_insert_subject ON public.task;
CREATE POLICY task_coordinator_insert_subject ON public.task
  FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT private.is_coordinator())
    AND EXISTS (
      SELECT 1 FROM public.faculty AS f
      WHERE f.faculty_id = task.faculty_id
        AND f.subject_id = (SELECT private.app_faculty_subject_id())
    )
  );
DROP POLICY IF EXISTS task_coordinator_update_subject ON public.task;
CREATE POLICY task_coordinator_update_subject ON public.task
  FOR UPDATE TO authenticated
  USING ((SELECT private.can_manage_task(task_id)))
  WITH CHECK (
    (SELECT private.is_coordinator())
    AND EXISTS (
      SELECT 1 FROM public.faculty AS f
      WHERE f.faculty_id = task.faculty_id
        AND f.subject_id = (SELECT private.app_faculty_subject_id())
    )
  );
DROP POLICY IF EXISTS task_coordinator_delete_subject ON public.task;
CREATE POLICY task_coordinator_delete_subject ON public.task
  FOR DELETE TO authenticated
  USING ((SELECT private.can_manage_task(task_id)));

DROP POLICY IF EXISTS criteria_related_read ON public.evaluation_criteria;
CREATE POLICY criteria_related_read ON public.evaluation_criteria
  FOR SELECT TO authenticated
  USING ((SELECT private.can_access_task(task_id)));
DROP POLICY IF EXISTS criteria_admin_manage ON public.evaluation_criteria;
CREATE POLICY criteria_admin_manage ON public.evaluation_criteria
  FOR ALL TO authenticated
  USING ((SELECT private.is_admin()))
  WITH CHECK ((SELECT private.is_admin()));
DROP POLICY IF EXISTS criteria_coordinator_insert_subject ON public.evaluation_criteria;
CREATE POLICY criteria_coordinator_insert_subject ON public.evaluation_criteria
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT private.can_manage_task(task_id)));
DROP POLICY IF EXISTS criteria_coordinator_update_subject ON public.evaluation_criteria;
CREATE POLICY criteria_coordinator_update_subject ON public.evaluation_criteria
  FOR UPDATE TO authenticated
  USING ((SELECT private.can_manage_task(task_id)))
  WITH CHECK ((SELECT private.can_manage_task(task_id)));
DROP POLICY IF EXISTS criteria_coordinator_delete_subject ON public.evaluation_criteria;
CREATE POLICY criteria_coordinator_delete_subject ON public.evaluation_criteria
  FOR DELETE TO authenticated
  USING ((SELECT private.can_manage_task(task_id)));

DROP POLICY IF EXISTS submission_related_read ON public.submission;
CREATE POLICY submission_related_read ON public.submission
  FOR SELECT TO authenticated
  USING (
    (SELECT private.is_admin())
    OR (
      (SELECT private.can_access_team(team_id))
      AND (SELECT private.can_access_task(task_id))
    )
  );
DROP POLICY IF EXISTS submission_admin_manage ON public.submission;
CREATE POLICY submission_admin_manage ON public.submission
  FOR ALL TO authenticated
  USING ((SELECT private.is_admin()))
  WITH CHECK ((SELECT private.is_admin()));
DROP POLICY IF EXISTS submission_student_insert_own_team ON public.submission;
CREATE POLICY submission_student_insert_own_team ON public.submission
  FOR INSERT TO authenticated
  WITH CHECK (
    submitted_by_student_id = (SELECT private.app_student_id())
    AND EXISTS (
      SELECT 1 FROM public.student AS s
      WHERE s.student_id = submission.submitted_by_student_id
        AND s.team_id = submission.team_id
        AND s.user_id = (SELECT private.app_user_id())
    )
    AND (SELECT private.can_submit_task(task_id))
    AND (
      file_url LIKE 'http://%'
      OR file_url LIKE 'https://%'
      OR file_url LIKE 'data:%'
      OR split_part(file_url, '/', 1) = (SELECT auth.uid())::text
    )
  );

DROP POLICY IF EXISTS evaluation_related_read ON public.evaluation;
CREATE POLICY evaluation_related_read ON public.evaluation
  FOR SELECT TO authenticated
  USING (
    (SELECT private.is_admin())
    OR student_id = (SELECT private.app_student_id())
    OR EXISTS (
      SELECT 1 FROM public.submission AS sub
      WHERE sub.submission_id = evaluation.submission_id
        AND (SELECT private.can_access_team(sub.team_id))
    )
  );
DROP POLICY IF EXISTS evaluation_admin_manage ON public.evaluation;
CREATE POLICY evaluation_admin_manage ON public.evaluation
  FOR ALL TO authenticated
  USING ((SELECT private.is_admin()))
  WITH CHECK ((SELECT private.is_admin()));
DROP POLICY IF EXISTS evaluation_faculty_insert_assigned ON public.evaluation;
CREATE POLICY evaluation_faculty_insert_assigned ON public.evaluation
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT private.can_write_evaluation(submission_id, student_id, criteria_id, evaluator_id)));
DROP POLICY IF EXISTS evaluation_faculty_update_assigned ON public.evaluation;
CREATE POLICY evaluation_faculty_update_assigned ON public.evaluation
  FOR UPDATE TO authenticated
  USING ((SELECT private.can_write_evaluation(submission_id, student_id, criteria_id, evaluator_id)))
  WITH CHECK ((SELECT private.can_write_evaluation(submission_id, student_id, criteria_id, evaluator_id)));
DROP POLICY IF EXISTS evaluation_faculty_delete_assigned ON public.evaluation;
CREATE POLICY evaluation_faculty_delete_assigned ON public.evaluation
  FOR DELETE TO authenticated
  USING ((SELECT private.can_write_evaluation(submission_id, student_id, criteria_id, evaluator_id)));

DROP POLICY IF EXISTS message_participants_read ON public.message;
CREATE POLICY message_participants_read ON public.message
  FOR SELECT TO authenticated
  USING (
    (SELECT private.is_admin())
    OR sender_id = (SELECT private.app_user_id())
    OR receiver_id = (SELECT private.app_user_id())
  );
DROP POLICY IF EXISTS message_admin_manage ON public.message;
CREATE POLICY message_admin_manage ON public.message
  FOR ALL TO authenticated
  USING ((SELECT private.is_admin()))
  WITH CHECK ((SELECT private.is_admin()));
DROP POLICY IF EXISTS message_send_as_self ON public.message;
CREATE POLICY message_send_as_self ON public.message
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = (SELECT private.app_user_id())
    AND (SELECT private.can_message_user(receiver_id))
  );

DROP POLICY IF EXISTS notification_owner_read ON public.notification;
CREATE POLICY notification_owner_read ON public.notification
  FOR SELECT TO authenticated
  USING (user_id = (SELECT private.app_user_id()));
DROP POLICY IF EXISTS notification_owner_update ON public.notification;
CREATE POLICY notification_owner_update ON public.notification
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT private.app_user_id()))
  WITH CHECK (user_id = (SELECT private.app_user_id()));
DROP POLICY IF EXISTS notification_admin_manage ON public.notification;
CREATE POLICY notification_admin_manage ON public.notification
  FOR ALL TO authenticated
  USING ((SELECT private.is_admin()))
  WITH CHECK ((SELECT private.is_admin()));

UPDATE storage.buckets SET public = false WHERE id = 'submissions';

DROP POLICY IF EXISTS "Allow authenticated read" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated update" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow autheticated users to upload 7ypwy_0" ON storage.objects;
DROP POLICY IF EXISTS submissions_read_related ON storage.objects;
DROP POLICY IF EXISTS submissions_upload_own ON storage.objects;
DROP POLICY IF EXISTS support_attachments_upload_own ON storage.objects;

DROP POLICY IF EXISTS submissions_read_related ON storage.objects;
CREATE POLICY submissions_read_related ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'submissions'
    AND (SELECT private.can_access_submission_object(name))
  );
DROP POLICY IF EXISTS submissions_upload_own ON storage.objects;
CREATE POLICY submissions_upload_own ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'submissions'
    AND (SELECT private.can_upload_submission_path(name))
  );
DROP POLICY IF EXISTS support_attachments_upload_own ON storage.objects;
CREATE POLICY support_attachments_upload_own ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'support-attachments'
    AND split_part(name, '/', 1) = (SELECT auth.uid())::text
  );
