import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getFaisalabadTime, getFaisalabadDateString, getSessionWindows, PrayerTiming } from "@/lib/prayerUtils";

const MAX_MISSED_IN_7_DAYS = 5;

export const useDisqualification = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["disqualification", userId],
    queryFn: async (): Promise<boolean> => {
      if (!userId) return false;

      // Get user's first_login_at from profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("first_login_at")
        .eq("user_id", userId)
        .single();

      // If user has never logged in, they can't be disqualified
      if (!profile?.first_login_at) return false;

      const firstLoginDate = new Date(profile.first_login_at);
      const startDate = firstLoginDate.toISOString().split('T')[0];

      const currentFaisalabadTime = getFaisalabadTime();
      const todayDateString = getFaisalabadDateString();

      // Only check from user's first login date
      const { data: timings, error: timingsError } = await supabase
        .from("prayer_timings")
        .select("*")
        .gte("date", startDate)
        .lte("date", todayDateString)
        .order("date", { ascending: true });

      if (timingsError) throw timingsError;

      const { data: attendance, error: attendanceError } = await supabase
        .from("prayer_attendance")
        .select("*")
        .eq("user_id", userId)
        .gte("date", startDate)
        .lte("date", todayDateString);

      if (attendanceError) throw attendanceError;

      const markedPrayers = new Set(
        (attendance || []).map(a => `${a.date}-${a.session_type}`)
      );

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
      const allDates = (timings || []).map(t => t.date).sort();
      
      for (let i = 0; i < allDates.length; i++) {
        const windowStart = new Date(allDates[i]);
        const windowEnd = new Date(windowStart);
        windowEnd.setDate(windowEnd.getDate() + 6);
        
        const windowEndStr = windowEnd.toISOString().split('T')[0];
        
        const missedInWindow = missedSessions.filter(m => {
          return m.date >= allDates[i] && m.date <= windowEndStr;
        }).length;

        if (missedInWindow >= MAX_MISSED_IN_7_DAYS) {
          return true;
        }
      }

      return false;
    },
    enabled: !!userId,
    refetchInterval: 60000,
  });
};
