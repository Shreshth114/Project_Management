-- Add Profile fields to public.users table

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS gender text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS avatar_url text;
