import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { adminApi } from "@/hooks/useAdmin";
import { getFaisalabadDateString } from "@/lib/prayerUtils";

const AdminDashboard = () => {
  const [stats, setStats] = useState<{
    totalUsers: number;
    markedToday: number;
    notMarkedToday: number;
    daysRemaining: number;
  }>({ totalUsers: 0, markedToday: 0, notMarkedToday: 0, daysRemaining: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminApi("get_stats");
        const today = getFaisalabadDateString();
        const profiles = data.profiles || [];
        const attendance = data.attendance || [];

        const todayAttendance = attendance.filter((a: any) => a.date === today);
        const usersMarkedToday = new Set(todayAttendance.map((a: any) => a.user_id));

        // Days remaining until March 19
        const endDate = new Date("2026-03-19");
        const now = new Date();
        const diffMs = endDate.getTime() - now.getTime();
        const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

        setStats({
          totalUsers: profiles.length,
          markedToday: usersMarkedToday.size,
          notMarkedToday: profiles.length - usersMarkedToday.size,
          daysRemaining,
        });
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { label: "Total Students", value: stats.totalUsers, color: "#3B82F6", icon: "👥" },
    { label: "Marked Today", value: stats.markedToday, color: "#22C55E", icon: "✅" },
    { label: "Not Marked Today", value: stats.notMarkedToday, color: "#EF4444", icon: "❌" },
    { label: "Days Remaining", value: stats.daysRemaining, color: "#F59E0B", icon: "📅" },
  ];

  return (
    <AdminLayout title="Dashboard">
      <div className="animate-fade-in">
        <h1 className="text-xl font-bold text-foreground mb-1">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mb-5">Overview of student progress</p>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {statCards.map((card) => (
              <div
                key={card.label}
                className="rounded-xl p-4 shadow-lg text-white"
                style={{ background: card.color }}
              >
                <div className="text-2xl mb-1">{card.icon}</div>
                <div className="text-2xl font-bold">{card.value}</div>
                <div className="text-xs text-white/80 font-medium">{card.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Progress Chart */}
        {!loading && stats.totalUsers > 0 && (
          <div className="mt-5 rounded-xl p-4 bg-card shadow-lg">
            <h3 className="text-sm font-bold text-foreground mb-3">Today's Attendance</h3>
            <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(stats.markedToday / stats.totalUsers) * 100}%`,
                  background: "linear-gradient(90deg, #22C55E, #4ADE80)",
                }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>{stats.markedToday} marked</span>
              <span>{Math.round((stats.markedToday / stats.totalUsers) * 100)}%</span>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
