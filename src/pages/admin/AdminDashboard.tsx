import { useEffect, useState, useCallback } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { adminApi } from "@/hooks/useAdmin";
import { getFaisalabadDateString } from "@/lib/prayerUtils";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { RotateCcw, Download } from "lucide-react";
import { generateReportCSV } from "@/lib/generateReportCSV";

const AdminDashboard = () => {
  const [stats, setStats] = useState<{
    totalUsers: number;
    markedToday: number;
    notMarkedToday: number;
    daysRemaining: number;
  }>({ totalUsers: 0, markedToday: 0, notMarkedToday: 0, daysRemaining: 0 });
  const [loading, setLoading] = useState(true);

  // Reset flow states
  const [showConfirm, setShowConfirm] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [resetting, setResetting] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const data = await adminApi("get_stats");
      const today = getFaisalabadDateString();
      const profiles = data.profiles || [];
      const attendance = data.attendance || [];

      const todayAttendance = attendance.filter((a: any) => a.date === today);
      const usersMarkedToday = new Set(todayAttendance.map((a: any) => a.user_id));

      const endDate = new Date("2026-03-20");
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
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Countdown timer effect
  useEffect(() => {
    if (!showCountdown) return;
    if (countdown <= 0) {
      // Time's up — perform reset
      performReset();
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [showCountdown, countdown]);

  const handleResetClick = () => setShowConfirm(true);

  const handleFirstConfirm = () => {
    setShowConfirm(false);
    setCountdown(5);
    setShowCountdown(true);
  };

  const handleCancelCountdown = () => {
    setShowCountdown(false);
    setCountdown(5);
    toast.info("Reset cancelled");
  };

  const performReset = async () => {
    setShowCountdown(false);
    setResetting(true);
    try {
      await adminApi("reset_all_data");
      toast.success("All data has been reset successfully!");
      fetchStats();
    } catch (err: any) {
      toast.error("Reset failed: " + (err.message || "Unknown error"));
    } finally {
      setResetting(false);
    }
  };

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

        {/* Download Report Button */}
        <div className="mt-6">
          <Button
            className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white"
            onClick={async () => {
              setDownloading(true);
              try {
                const data = await adminApi("get_stats");
                const csv = generateReportCSV(data.profiles || [], data.attendance || [], data.qaza_records || []);
                const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `KYF_Prayer_Report_${new Date().toISOString().slice(0, 10)}.csv`;
                a.click();
                URL.revokeObjectURL(url);
                toast.success("Report downloaded!");
              } catch (err: any) {
                toast.error("Failed to download: " + (err.message || "Unknown error"));
              } finally {
                setDownloading(false);
              }
            }}
            disabled={downloading || loading}
          >
            <Download className="h-4 w-4" />
            {downloading ? "Generating..." : "Download Report"}
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Downloads a CSV with all student points, prayer counts & detail entries
          </p>
        </div>

        {/* Reset Button */}
        <div className="mt-4">
          <Button
            variant="destructive"
            className="w-full gap-2"
            onClick={handleResetClick}
            disabled={resetting || loading}
          >
            <RotateCcw className="h-4 w-4" />
            {resetting ? "Resetting..." : "Reset All Data"}
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Clears all attendance, qaza records & resets first-login timestamps. Users & credentials are kept.
          </p>
        </div>
      </div>

      {/* First Confirmation Dialog */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>⚠️ Reset All Data?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all prayer attendance, qaza records, and reset every user's first-login timestamp.
              Users and their credentials will NOT be affected. Are you sure?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button variant="destructive" onClick={handleFirstConfirm}>
              Yes, Reset Everything
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Second Confirmation: 5-second countdown */}
      <AlertDialog open={showCountdown} onOpenChange={() => {}}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>🔴 Final Warning</AlertDialogTitle>
            <AlertDialogDescription className="text-center space-y-3">
              <span className="block">Data will be reset in</span>
              <span className="block text-4xl font-bold text-destructive">{countdown}</span>
              <span className="block">seconds. Press Cancel to abort.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="justify-center">
            <Button variant="outline" size="lg" className="w-full" onClick={handleCancelCountdown}>
              Cancel Reset
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminDashboard;
