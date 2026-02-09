
-- Create qaza_records table to store marked Qaza prayers
CREATE TABLE public.qaza_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  session_type TEXT NOT NULL,
  reason TEXT NOT NULL,
  marked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, date, session_type)
);

-- Enable RLS
ALTER TABLE public.qaza_records ENABLE ROW LEVEL SECURITY;

-- Users can view their own records
CREATE POLICY "Users can view their own qaza records"
  ON public.qaza_records FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own records
CREATE POLICY "Users can insert their own qaza records"
  ON public.qaza_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own records
CREATE POLICY "Users can delete their own qaza records"
  ON public.qaza_records FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can view all
CREATE POLICY "Admins can view all qaza records"
  ON public.qaza_records FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));
