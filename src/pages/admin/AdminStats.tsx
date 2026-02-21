import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { adminApi } from "@/hooks/useAdmin";
import { toast } from "sonner";
import { ChevronDown, ChevronUp } from "lucide-react";
import AttendanceDetailDialog from "@/components/admin/AttendanceDetailDialog";

interface UserStat {
  user_id: string;
  display_name: string;
  father_name: string | null;
  earlyNamazPoints: number;
  middleNamazPoints: number;
  lateNamazPoints: number;
  duaPoints: number;
  quranPoints: number;
  dhikrPoints: number;
  goodDeedPoints: number;
  qazaPoints: number;
  totalPoints: number;
}

interface DialogInfo {
  userId: string;
  userName: string;
  type: "dhikr" | "goodDeed";
}

const AdminStats = () => {
  const [userStats, setUserStats] = useState<UserStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [attendanceData, setAttendanceData] = useState<Record<string, any[]>>({});
  const [dialogInfo, setDialogInfo] = useState<DialogInfo | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminApi("get_stats");
        const profiles = data.profiles || [];
        const attendance = data.attendance || [];

        const statsMap = new Map<string, UserStat>();
        const attMap: Record<string, any[]> = {};

        profiles.forEach((p: any) => {
          statsMap.set(p.user_id, {
            user_id: p.user_id,
            display_name: p.display_name || "Unknown",
            father_name: p.father_name,
            earlyNamazPoints: 0,
            middleNamazPoints: 0,
            lateNamazPoints: 0,
            duaPoints: 0,
            quranPoints: 0,
            dhikrPoints: 0,
            goodDeedPoints: 0,
            qazaPoints: 0,
            totalPoints: 0,
          });
          attMap[p.user_id] = [];
        });

        attendance.forEach((a: any) => {
          const stat = statsMap.get(a.user_id);
          if (!stat) return;

          // Store raw record for dialog
          if (
            (a.extra_ziker && a.extra_ziker.trim()) ||
            (a.good_deed && a.good_deed.trim())
          ) {
            attMap[a.user_id]?.push(a);
          }

          if (a.namaz_marked) {
            const tp = a.time_percentage ?? 50;
            if (tp <= 33.33) {
              stat.earlyNamazPoints += 3;
            } else if (tp <= 66.66) {
              stat.middleNamazPoints += 2;
            } else {
              stat.lateNamazPoints += 1;
            }
          }

          if (a.dua_marked) stat.duaPoints += 1;
          if (a.quran_marked) stat.quranPoints += 1;
          if (a.extra_ziker && a.extra_ziker.trim()) stat.dhikrPoints += 0.5;
          if (a.good_deed && a.good_deed.trim()) stat.goodDeedPoints += 0.5;
        });

        const qazaRecords = data.qaza_records || [];
        qazaRecords.forEach((q: any) => {
          const stat = statsMap.get(q.user_id);
          if (stat) stat.qazaPoints += 0.5;
        });

        statsMap.forEach((stat) => {
          stat.totalPoints =
            stat.earlyNamazPoints +
            stat.middleNamazPoints +
            stat.lateNamazPoints +
            stat.duaPoints +
            stat.quranPoints +
            stat.dhikrPoints +
            stat.goodDeedPoints +
            stat.qazaPoints;
        });

        const sorted = Array.from(statsMap.values()).sort((a, b) => b.totalPoints - a.totalPoints);
        setUserStats(sorted);
        setAttendanceData(attMap);
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
        <p className="text-xs text-muted-foreground mb-4">Ranked by total points</p>

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
                        <p className="text-xs text-muted-foreground">Points: {stat.totalPoints}</p>
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
                          <span className="text-muted-foreground">Namaz (Awal Waqt)</span>
                          <p className="font-bold text-foreground">{stat.earlyNamazPoints} pts</p>
                        </div>
                        <div className="bg-muted rounded-lg p-2">
                          <span className="text-muted-foreground">Namaz (Middle)</span>
                          <p className="font-bold text-foreground">{stat.middleNamazPoints} pts</p>
                        </div>
                        <div className="bg-muted rounded-lg p-2">
                          <span className="text-muted-foreground">Namaz (Late)</span>
                          <p className="font-bold text-foreground">{stat.lateNamazPoints} pts</p>
                        </div>
                        <div className="bg-muted rounded-lg p-2">
                          <span className="text-muted-foreground">Dua</span>
                          <p className="font-bold text-foreground">{stat.duaPoints} pts</p>
                        </div>
                        <div className="bg-muted rounded-lg p-2">
                          <span className="text-muted-foreground">Quran</span>
                          <p className="font-bold text-foreground">{stat.quranPoints} pts</p>
                        </div>
                        {/* Clickable Dhikr card */}
                        <button
                          onClick={() =>
                            setDialogInfo({
                              userId: stat.user_id,
                              userName: stat.display_name,
                              type: "dhikr",
                            })
                          }
                          className="bg-muted rounded-lg p-2 text-left hover:ring-2 hover:ring-primary/50 transition-all"
                        >
                          <span className="text-muted-foreground">Extra Dhikr 🔍</span>
                          <p className="font-bold text-foreground">{stat.dhikrPoints} pts</p>
                        </button>
                        {/* Clickable Good Deeds card */}
                        <button
                          onClick={() =>
                            setDialogInfo({
                              userId: stat.user_id,
                              userName: stat.display_name,
                              type: "goodDeed",
                            })
                          }
                          className="bg-muted rounded-lg p-2 text-left hover:ring-2 hover:ring-primary/50 transition-all"
                        >
                          <span className="text-muted-foreground">Good Deeds 🔍</span>
                          <p className="font-bold text-foreground">{stat.goodDeedPoints} pts</p>
                        </button>
                        <div className="bg-muted rounded-lg p-2">
                          <span className="text-muted-foreground">Qaza Marked</span>
                          <p className="font-bold text-foreground">{stat.qazaPoints} pts</p>
                        </div>
                        <div className="bg-primary/10 rounded-lg p-2 col-span-2">
                          <span className="text-primary font-semibold">Total</span>
                          <p className="font-bold text-primary text-lg">{stat.totalPoints} pts</p>
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

      {/* Detail Dialog */}
      {dialogInfo && (
        <AttendanceDetailDialog
          open={!!dialogInfo}
          onOpenChange={(open) => !open && setDialogInfo(null)}
          userName={dialogInfo.userName}
          type={dialogInfo.type}
          records={attendanceData[dialogInfo.userId] || []}
        />
      )}
    </AdminLayout>
  );
};

export default AdminStats;
