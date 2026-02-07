import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getFaisalabadTime, getFaisalabadDateString, getSessionWindows, PrayerTiming } from "@/lib/prayerUtils";

const SYSTEM_START_DATE = '2026-02-07';
const MAX_MISSED_IN_7_DAYS = 5;

export const useDisqualification = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["disqualification", userId],
    queryFn: async (): Promise<boolean> => {
      if (!userId) return false;

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

      const markedPrayers = new Set(
        (attendance || []).map(a => `${a.date}-${a.session_type}`)
      );

      // Build a list of all missed sessions with their dates
      const missedSessions: { date: string }[] = [];

      for (const timing of timings || []) {
        const dateStr = timing.date;
        const sessions = getSessionWindows(timing as PrayerTiming, currentFaisalabadTime);

        for (const [sessionType, window] of Object.entries(sessions)) {
          const key = `${dateStr}-${sessionType}`;
          const isToday = dateStr === todayDateString;
          const sessionHasPassed = isToday ? window.isPast : true;

          if (sessionHasPassed && !markedPrayers.has(key)) {
            if (isToday && !window.isPast) continue;
            missedSessions.push({ date: dateStr });
          }
        }
      }

      // Check rolling 7-day windows
      // Get all unique dates in range
      const allDates = (timings || []).map(t => t.date).sort();
      
      for (let i = 0; i < allDates.length; i++) {
        const windowStart = new Date(allDates[i]);
        const windowEnd = new Date(windowStart);
        windowEnd.setDate(windowEnd.getDate() + 6); // 7-day window
        
        const windowEndStr = windowEnd.toISOString().split('T')[0];
        
        // Count missed in this 7-day window
        const missedInWindow = missedSessions.filter(m => {
          return m.date >= allDates[i] && m.date <= windowEndStr;
        }).length;

        if (missedInWindow >= MAX_MISSED_IN_7_DAYS) {
          return true; // Disqualified
        }
      }

      return false;
    },
    enabled: !!userId,
    refetchInterval: 60000,
  });
};
