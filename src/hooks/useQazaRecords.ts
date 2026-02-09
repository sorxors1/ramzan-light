import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface QazaRecord {
  id: string;
  user_id: string;
  date: string;
  session_type: string;
  reason: string;
  marked_at: string;
  created_at: string;
}

export const useQazaRecords = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["qaza-records", userId],
    queryFn: async (): Promise<QazaRecord[]> => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("qaza_records")
        .select("*")
        .eq("user_id", userId)
        .order("marked_at", { ascending: false });

      if (error) throw error;
      return (data || []) as QazaRecord[];
    },
    enabled: !!userId,
  });
};

interface SaveQazaInput {
  userId: string;
  date: string;
  sessionType: string;
  reason: string;
}

export const useSaveQazaRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SaveQazaInput) => {
      const { data, error } = await supabase
        .from("qaza_records")
        .insert({
          user_id: input.userId,
          date: input.date,
          session_type: input.sessionType,
          reason: input.reason,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qaza-records"] });
      queryClient.invalidateQueries({ queryKey: ["missed-prayers"] });
    },
  });
};
