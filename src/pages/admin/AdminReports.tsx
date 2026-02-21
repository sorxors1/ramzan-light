import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { adminApi } from "@/hooks/useAdmin";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, BookOpen, Heart, Star, Hand, RotateCcw } from "lucide-react";

interface StudentCount {
  display_name: string;
  father_name: string | null;
  count: number;
}

const LeaderboardList = ({ items, label }: { items: StudentCount[]; label: string }) => {
  if (items.length === 0) return <p className="text-center text-muted-foreground text-sm py-8">No data yet</p>;
  return (
    <div className="space-y-2">
      {items.map((s, i) => (
        <div key={i} className="flex items-center gap-3 rounded-xl bg-card border border-border p-3">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ background: i === 0 ? "#FFD700" : i === 1 ? "#C0C0C0" : i === 2 ? "#CD7F32" : "#94A3B8" }}
          >
            {i + 1}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{s.display_name}</p>
            {s.father_name && <p className="text-xs text-muted-foreground truncate">s/o {s.father_name}</p>}
          </div>
          <span className="text-sm font-bold text-primary">{s.count} {label}</span>
        </div>
      ))}
    </div>
  );
};

const AdminReports = () => {
  const [loading, setLoading] = useState(true);
  const [earlyNamaz, setEarlyNamaz] = useState<StudentCount[]>([]);
  const [middleNamaz, setMiddleNamaz] = useState<StudentCount[]>([]);
  const [lateNamaz, setLateNamaz] = useState<StudentCount[]>([]);
  const [duaLeaders, setDuaLeaders] = useState<StudentCount[]>([]);
  const [quranLeaders, setQuranLeaders] = useState<StudentCount[]>([]);
  const [dhikrLeaders, setDhikrLeaders] = useState<StudentCount[]>([]);
  const [goodDeedLeaders, setGoodDeedLeaders] = useState<StudentCount[]>([]);
  const [qazaLeaders, setQazaLeaders] = useState<StudentCount[]>([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await adminApi("get_stats");
        const profiles = data.profiles || [];
        const attendance = data.attendance || [];
        const qazaRecords = data.qaza_records || [];

        const map = new Map<string, { display_name: string; father_name: string | null; early: number; middle: number; late: number; dua: number; quran: number; dhikr: number; goodDeed: number; qaza: number }>();

        profiles.forEach((p: any) => {
          map.set(p.user_id, { display_name: p.display_name || "Unknown", father_name: p.father_name, early: 0, middle: 0, late: 0, dua: 0, quran: 0, dhikr: 0, goodDeed: 0, qaza: 0 });
        });

        attendance.forEach((a: any) => {
          const s = map.get(a.user_id);
          if (!s) return;
          if (a.namaz_marked) {
            const tp = a.time_percentage ?? 50;
            if (tp <= 33.33) s.early++;
            else if (tp <= 66.66) s.middle++;
            else s.late++;
          }
          if (a.dua_marked) s.dua++;
          if (a.quran_marked) s.quran++;
          if (a.extra_ziker?.trim()) s.dhikr++;
          if (a.good_deed?.trim()) s.goodDeed++;
        });

        qazaRecords.forEach((q: any) => {
          const s = map.get(q.user_id);
          if (s) s.qaza++;
        });

        const toList = (key: string) =>
          Array.from(map.values())
            .map((s) => ({ display_name: s.display_name, father_name: s.father_name, count: (s as any)[key] as number }))
            .filter((s) => s.count > 0)
            .sort((a, b) => b.count - a.count);

        setEarlyNamaz(toList("early"));
        setMiddleNamaz(toList("middle"));
        setLateNamaz(toList("late"));
        setDuaLeaders(toList("dua"));
        setQuranLeaders(toList("quran"));
        setDhikrLeaders(toList("dhikr"));
        setGoodDeedLeaders(toList("goodDeed"));
        setQazaLeaders(toList("qaza"));
      } catch (err: any) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading)
    return (
      <AdminLayout title="Reports">
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );

  return (
    <AdminLayout title="Reports">
      <div className="animate-fade-in">
        <h1 className="text-xl font-bold text-foreground mb-1">Student Reports</h1>
        <p className="text-xs text-muted-foreground mb-4">Category-wise leaderboards</p>

        <Tabs defaultValue="early" className="w-full">
          <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-muted p-1 rounded-xl">
            <TabsTrigger value="early" className="text-[10px] flex-1 min-w-[70px]"><Clock className="w-3 h-3 mr-1" />Early</TabsTrigger>
            <TabsTrigger value="middle" className="text-[10px] flex-1 min-w-[70px]"><Clock className="w-3 h-3 mr-1" />Middle</TabsTrigger>
            <TabsTrigger value="late" className="text-[10px] flex-1 min-w-[70px]"><Clock className="w-3 h-3 mr-1" />Late</TabsTrigger>
            <TabsTrigger value="dua" className="text-[10px] flex-1 min-w-[70px]"><Hand className="w-3 h-3 mr-1" />Dua</TabsTrigger>
            <TabsTrigger value="quran" className="text-[10px] flex-1 min-w-[70px]"><BookOpen className="w-3 h-3 mr-1" />Quran</TabsTrigger>
            <TabsTrigger value="dhikr" className="text-[10px] flex-1 min-w-[70px]"><Star className="w-3 h-3 mr-1" />Dhikr</TabsTrigger>
            <TabsTrigger value="deeds" className="text-[10px] flex-1 min-w-[70px]"><Heart className="w-3 h-3 mr-1" />Deeds</TabsTrigger>
            <TabsTrigger value="qaza" className="text-[10px] flex-1 min-w-[70px]"><RotateCcw className="w-3 h-3 mr-1" />Qaza</TabsTrigger>
          </TabsList>

          <TabsContent value="early"><LeaderboardList items={earlyNamaz} label="times" /></TabsContent>
          <TabsContent value="middle"><LeaderboardList items={middleNamaz} label="times" /></TabsContent>
          <TabsContent value="late"><LeaderboardList items={lateNamaz} label="times" /></TabsContent>
          <TabsContent value="dua"><LeaderboardList items={duaLeaders} label="duas" /></TabsContent>
          <TabsContent value="quran"><LeaderboardList items={quranLeaders} label="readings" /></TabsContent>
          <TabsContent value="dhikr"><LeaderboardList items={dhikrLeaders} label="entries" /></TabsContent>
          <TabsContent value="deeds"><LeaderboardList items={goodDeedLeaders} label="deeds" /></TabsContent>
          <TabsContent value="qaza"><LeaderboardList items={qazaLeaders} label="prayers" /></TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminReports;
