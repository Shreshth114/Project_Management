-- Add bio, linkedin_url, and github_url fields to public.users table

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS linkedin_url text,
ADD COLUMN IF NOT EXISTS github_url text;
