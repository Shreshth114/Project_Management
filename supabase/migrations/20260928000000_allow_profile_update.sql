-- Migration: Allow users to update their own profiles
-- We are granting UPDATE access for users to update their own rows in `users`, `student`, and `faculty` tables.

-- 1. public.users
DROP POLICY IF EXISTS users_update_own_profile ON public.users;
CREATE POLICY users_update_own_profile ON public.users
  FOR UPDATE TO authenticated
  USING (auth_id = auth.uid())
  WITH CHECK (auth_id = auth.uid());

-- 2. public.student
DROP POLICY IF EXISTS student_update_own_profile ON public.student;
CREATE POLICY student_update_own_profile ON public.student
  FOR UPDATE TO authenticated
  USING (
    student_id = (SELECT private.app_student_id())
    OR user_id IN (SELECT user_id FROM public.users WHERE auth_id = auth.uid())
  )
  WITH CHECK (
    student_id = (SELECT private.app_student_id())
    OR user_id IN (SELECT user_id FROM public.users WHERE auth_id = auth.uid())
  );

-- 3. public.faculty
DROP POLICY IF EXISTS faculty_update_own_profile ON public.faculty;
CREATE POLICY faculty_update_own_profile ON public.faculty
  FOR UPDATE TO authenticated
  USING (
    faculty_id = (SELECT private.app_faculty_id())
    OR user_id IN (SELECT user_id FROM public.users WHERE auth_id = auth.uid())
  )
  WITH CHECK (
    faculty_id = (SELECT private.app_faculty_id())
    OR user_id IN (SELECT user_id FROM public.users WHERE auth_id = auth.uid())
  );
