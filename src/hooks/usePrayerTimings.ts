import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PrayerTiming, getFaisalabadDateString } from "@/lib/prayerUtils";

export const usePrayerTimings = () => {
  return useQuery({
    queryKey: ["prayer-timings"],
    queryFn: async (): Promise<PrayerTiming[]> => {
      const { data, error } = await supabase
        .from("prayer_timings")
        .select("*")
        .order("date", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });
};

export const useTodayTiming = () => {
  const dateString = getFaisalabadDateString();
  
  return useQuery({
    queryKey: ["today-timing", dateString],
    queryFn: async (): Promise<PrayerTiming | null> => {
      const { data, error } = await supabase
        .from("prayer_timings")
        .select("*")
        .eq("date", dateString)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    refetchInterval: 60000, // Refetch every minute to check for date change
  });
};
