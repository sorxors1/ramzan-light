import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getFaisalabadTime, getFaisalabadDateString, getSessionWindows, PrayerTiming } from "@/lib/prayerUtils";

export interface MissedPrayer {
  date: string;
  sessionType: string;
  sessionName: { en: string; ur: string };
}

export interface MissedPrayersByDate {
  [date: string]: MissedPrayer[];
}

const sessionNames: Record<string, { en: string; ur: string }> = {
  fajr: { en: 'Fajr', ur: 'فجر' },
  zoharain: { en: 'Zoharain', ur: 'ظہرین' },
  magribain: { en: 'Magribain', ur: 'مغربین' },
};

export const useMissedPrayers = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["missed-prayers", userId],
    queryFn: async (): Promise<MissedPrayersByDate> => {
      if (!userId) return {};

      // Get user's first_login_at from profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("first_login_at")
        .eq("user_id", userId)
        .single();

      // If user has never logged in, no missed prayers
      if (!profile?.first_login_at) return {};

      const firstLoginDate = new Date(profile.first_login_at);
      const startDate = firstLoginDate.toISOString().split('T')[0];

      const currentFaisalabadTime = getFaisalabadTime();
      const todayDateString = getFaisalabadDateString();

      // Get all prayer timings from user's first login to today
      const { data: timings, error: timingsError } = await supabase
        .from("prayer_timings")
        .select("*")
        .gte("date", startDate)
        .lte("date", todayDateString)
        .order("date", { ascending: true });

      if (timingsError) throw timingsError;

      // Get all user attendance records
      const { data: attendance, error: attendanceError } = await supabase
        .from("prayer_attendance")
        .select("*")
        .eq("user_id", userId)
        .gte("date", startDate)
        .lte("date", todayDateString);

      if (attendanceError) throw attendanceError;

      // Get already-marked qaza records to exclude them
      const { data: qazaRecords, error: qazaError } = await supabase
        .from("qaza_records")
        .select("date, session_type")
        .eq("user_id", userId);

      if (qazaError) throw qazaError;

      // Create sets for quick lookup
      const markedPrayers = new Set(
        (attendance || []).map(a => `${a.date}-${a.session_type}`)
      );
      const markedQaza = new Set(
        (qazaRecords || []).map(q => `${q.date}-${q.session_type}`)
      );

      const missedByDate: MissedPrayersByDate = {};

      for (const timing of timings || []) {
        const dateStr = timing.date;
        const sessions = getSessionWindows(timing as PrayerTiming, currentFaisalabadTime);

        for (const [sessionType, window] of Object.entries(sessions)) {
          const key = `${dateStr}-${sessionType}`;
          
          const isToday = dateStr === todayDateString;
          const sessionHasPassed = isToday ? window.isPast : true;

          if (sessionHasPassed && !markedPrayers.has(key) && !markedQaza.has(key)) {
            if (isToday && !window.isPast) continue;

            if (!missedByDate[dateStr]) {
              missedByDate[dateStr] = [];
            }

            missedByDate[dateStr].push({
              date: dateStr,
              sessionType,
              sessionName: sessionNames[sessionType] || { en: sessionType, ur: sessionType },
            });
          }
        }
      }

      return missedByDate;
    },
    enabled: !!userId,
  });
};

// Get list of dates that have missed prayers
export const useMissedDates = (userId: string | undefined) => {
  const { data: missedByDate, isLoading, error } = useMissedPrayers(userId);

  const missedDates = missedByDate 
    ? Object.keys(missedByDate).filter(date => missedByDate[date].length > 0).sort().reverse()
    : [];

  return { missedDates, missedByDate, isLoading, error };
};
