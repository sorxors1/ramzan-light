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

// System start date - Feb 5, 2026 for testing
const SYSTEM_START_DATE = '2026-02-05';

export const useMissedPrayers = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["missed-prayers", userId],
    queryFn: async (): Promise<MissedPrayersByDate> => {
      if (!userId) return {};

      const currentFaisalabadTime = getFaisalabadTime();
      const todayDateString = getFaisalabadDateString();

      // Get all prayer timings from system start to today
      const { data: timings, error: timingsError } = await supabase
        .from("prayer_timings")
        .select("*")
        .gte("date", SYSTEM_START_DATE)
        .lte("date", todayDateString)
        .order("date", { ascending: true });

      if (timingsError) throw timingsError;

      // Get all user attendance records
      const { data: attendance, error: attendanceError } = await supabase
        .from("prayer_attendance")
        .select("*")
        .eq("user_id", userId)
        .gte("date", SYSTEM_START_DATE)
        .lte("date", todayDateString);

      if (attendanceError) throw attendanceError;

      // Create a set of marked prayers for quick lookup
      const markedPrayers = new Set(
        (attendance || []).map(a => `${a.date}-${a.session_type}`)
      );

      const missedByDate: MissedPrayersByDate = {};

      // Check each day's prayer timings
      for (const timing of timings || []) {
        const dateStr = timing.date;
        const sessions = getSessionWindows(timing as PrayerTiming, currentFaisalabadTime);

        for (const [sessionType, window] of Object.entries(sessions)) {
          const key = `${dateStr}-${sessionType}`;
          
          // Check if this session's window has passed and was not marked
          const isToday = dateStr === todayDateString;
          const sessionHasPassed = isToday ? window.isPast : true;

          if (sessionHasPassed && !markedPrayers.has(key)) {
            // For today, only include sessions that have actually ended
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
