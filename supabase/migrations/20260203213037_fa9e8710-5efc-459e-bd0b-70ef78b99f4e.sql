-- Prayer timings table for Ramadan schedule
CREATE TABLE public.prayer_timings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  day_name TEXT NOT NULL,
  fajr_start TIME NOT NULL,
  sunrise TIME NOT NULL,
  dhuhr_start TIME NOT NULL,
  asr_end TIME NOT NULL,
  maghrib_start TIME NOT NULL,
  isha_end TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Make prayer timings publicly readable (no auth needed for timings)
ALTER TABLE public.prayer_timings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read prayer timings"
ON public.prayer_timings
FOR SELECT
USING (true);

-- User profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Prayer attendance records
CREATE TABLE public.prayer_attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  session_type TEXT NOT NULL CHECK (session_type IN ('fajr', 'zoharain', 'magribain')),
  namaz_marked BOOLEAN NOT NULL DEFAULT false,
  dua_marked BOOLEAN NOT NULL DEFAULT false,
  quran_marked BOOLEAN NOT NULL DEFAULT false,
  extra_ziker TEXT,
  good_deed TEXT,
  marked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  time_percentage INTEGER CHECK (time_percentage >= 0 AND time_percentage <= 100),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'ada', 'kaza')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date, session_type)
);

ALTER TABLE public.prayer_attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own attendance"
ON public.prayer_attendance FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own attendance"
ON public.prayer_attendance FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own attendance"
ON public.prayer_attendance FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own attendance"
ON public.prayer_attendance FOR DELETE
USING (auth.uid() = user_id);

-- Function to update timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_prayer_attendance_updated_at
  BEFORE UPDATE ON public.prayer_attendance
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();