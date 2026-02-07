import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { adminApi } from "@/hooks/useAdmin";
import { toast } from "sonner";
import { ChevronDown, ChevronUp } from "lucide-react";

interface UserStat {
  user_id: string;
  display_name: string;
  father_name: string | null;
  totalAttendance: number;
  totalNamaz: number;
  totalDua: number;
  totalQuran: number;
  totalExtraZiker: number;
  totalGoodDeed: number;
  score: number;
}

const AdminStats = () => {
  const [userStats, setUserStats] = useState<UserStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminApi("get_stats");
        const profiles = data.profiles || [];
        const attendance = data.attendance || [];

        const statsMap = new Map<string, UserStat>();

        profiles.forEach((p: any) => {
          statsMap.set(p.user_id, {
            user_id: p.user_id,
            display_name: p.display_name || "Unknown",
            father_name: p.father_name,
            totalAttendance: 0,
            totalNamaz: 0,
            totalDua: 0,
            totalQuran: 0,
            totalExtraZiker: 0,
            totalGoodDeed: 0,
            score: 0,
          });
        });

        attendance.forEach((a: any) => {
          const stat = statsMap.get(a.user_id);
          if (!stat) return;
          stat.totalAttendance++;
          if (a.namaz_marked) stat.totalNamaz++;
          if (a.dua_marked) stat.totalDua++;
          if (a.quran_marked) stat.totalQuran++;
          if (a.extra_ziker && a.extra_ziker.trim()) stat.totalExtraZiker++;
          if (a.good_deed && a.good_deed.trim()) stat.totalGoodDeed++;
        });

        // Calculate score: weighted sum
        statsMap.forEach((stat) => {
          stat.score =
            stat.totalNamaz * 3 +
            stat.totalDua * 2 +
            stat.totalQuran * 2 +
            stat.totalExtraZiker * 1 +
            stat.totalGoodDeed * 1;
        });

        const sorted = Array.from(statsMap.values()).sort((a, b) => b.score - a.score);
        setUserStats(sorted);
      } catch (err: any) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const getRankColor = (index: number) => {
    if (index === 0) return "#FFD700";
    if (index === 1) return "#C0C0C0";
    if (index === 2) return "#CD7F32";
    return undefined;
  };

  return (
    <AdminLayout title="Stats">
      <div className="animate-fade-in">
        <h1 className="text-xl font-bold text-foreground mb-1">Student Rankings</h1>
        <p className="text-xs text-muted-foreground mb-4">Ranked by overall engagement score</p>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : userStats.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-12">No data yet</p>
        ) : (
          <div className="space-y-2">
            {userStats.map((stat, index) => {
              const rankColor = getRankColor(index);
              const isExpanded = expandedUser === stat.user_id;
              return (
                <div key={stat.user_id} className="rounded-xl bg-card shadow border border-border overflow-hidden">
                  <button
                    onClick={() => setExpandedUser(isExpanded ? null : stat.user_id)}
                    className="w-full p-3 flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                        style={{ background: rankColor || "#94A3B8" }}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{stat.display_name}</p>
                        <p className="text-xs text-muted-foreground">Score: {stat.score}</p>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="px-3 pb-3 border-t border-border pt-2">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-muted rounded-lg p-2">
                          <span className="text-muted-foreground">Namaz</span>
                          <p className="font-bold text-foreground">{stat.totalNamaz}</p>
                        </div>
                        <div className="bg-muted rounded-lg p-2">
                          <span className="text-muted-foreground">Dua</span>
                          <p className="font-bold text-foreground">{stat.totalDua}</p>
                        </div>
                        <div className="bg-muted rounded-lg p-2">
                          <span className="text-muted-foreground">Quran</span>
                          <p className="font-bold text-foreground">{stat.totalQuran}</p>
                        </div>
                        <div className="bg-muted rounded-lg p-2">
                          <span className="text-muted-foreground">Extra Dhikr</span>
                          <p className="font-bold text-foreground">{stat.totalExtraZiker}</p>
                        </div>
                        <div className="bg-muted rounded-lg p-2">
                          <span className="text-muted-foreground">Good Deeds</span>
                          <p className="font-bold text-foreground">{stat.totalGoodDeed}</p>
                        </div>
                        <div className="bg-muted rounded-lg p-2">
                          <span className="text-muted-foreground">Total Sessions</span>
                          <p className="font-bold text-foreground">{stat.totalAttendance}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminStats;
