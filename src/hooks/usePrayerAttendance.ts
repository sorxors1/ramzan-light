import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getFaisalabadDateString } from "@/lib/prayerUtils";

export interface PrayerAttendance {
  id: string;
  user_id: string;
  date: string;
  session_type: string;
  namaz_marked: boolean;
  dua_marked: boolean;
  quran_marked: boolean;
  extra_ziker: string | null;
  good_deed: string | null;
  marked_at: string;
  time_percentage: number | null;
  status: "pending" | "ada" | "kaza";
}

export const useTodayAttendance = (userId: string | undefined) => {
  const dateString = getFaisalabadDateString();
  
  return useQuery({
    queryKey: ["today-attendance", userId, dateString],
    queryFn: async (): Promise<PrayerAttendance[]> => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from("prayer_attendance")
        .select("*")
        .eq("user_id", userId)
        .eq("date", dateString);

      if (error) throw error;
      return (data || []) as PrayerAttendance[];
    },
    enabled: !!userId,
  });
};

export const useSessionAttendance = (userId: string | undefined, sessionType: string) => {
  const dateString = getFaisalabadDateString();
  
  return useQuery({
    queryKey: ["session-attendance", userId, dateString, sessionType],
    queryFn: async (): Promise<PrayerAttendance | null> => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from("prayer_attendance")
        .select("*")
        .eq("user_id", userId)
        .eq("date", dateString)
        .eq("session_type", sessionType)
        .maybeSingle();

      if (error) throw error;
      return data as PrayerAttendance | null;
    },
    enabled: !!userId,
  });
};

interface SaveAttendanceInput {
  userId: string;
  sessionType: string;
  namazMarked: boolean;
  duaMarked: boolean;
  quranMarked: boolean;
  extraZiker?: string;
  goodDeed?: string;
  timePercentage: number;
}

export const useSaveAttendance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: SaveAttendanceInput) => {
      const dateString = getFaisalabadDateString();
      
      const { data, error } = await supabase
        .from("prayer_attendance")
        .upsert({
          user_id: input.userId,
          date: dateString,
          session_type: input.sessionType,
          namaz_marked: input.namazMarked,
          dua_marked: input.duaMarked,
          quran_marked: input.quranMarked,
          extra_ziker: input.extraZiker || null,
          good_deed: input.goodDeed || null,
          time_percentage: Math.round(input.timePercentage),
          status: "ada",
          marked_at: new Date().toISOString(),
        }, {
          onConflict: "user_id,date,session_type",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["today-attendance"] });
      queryClient.invalidateQueries({ queryKey: ["session-attendance"] });
      queryClient.invalidateQueries({ queryKey: ["all-attendance"] });
    },
  });
};

// Get all attendance for statistics
export const useAllAttendance = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["all-attendance", userId],
    queryFn: async (): Promise<PrayerAttendance[]> => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from("prayer_attendance")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false });

      if (error) throw error;
      return (data || []) as PrayerAttendance[];
    },
    enabled: !!userId,
  });
};
