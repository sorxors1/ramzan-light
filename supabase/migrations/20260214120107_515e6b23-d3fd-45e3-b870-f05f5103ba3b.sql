
-- Add username column to profiles
ALTER TABLE public.profiles ADD COLUMN username text;

-- Create unique index on username (only for non-null values)
CREATE UNIQUE INDEX idx_profiles_username ON public.profiles (username) WHERE username IS NOT NULL;
