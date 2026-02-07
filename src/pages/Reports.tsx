import { Link } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { useAllAttendance } from "@/hooks/usePrayerAttendance";
import { usePrayerTimings } from "@/hooks/usePrayerTimings";
import { ArrowLeft, CheckCircle, XCircle, Clock, BookOpen, Heart, Sparkles } from "lucide-react";

const Reports = () => {
  const { user, isAuthenticated } = useAuth();
  const { data: attendance = [] } = useAllAttendance(user?.id);
  const { data: timings = [] } = usePrayerTimings();

  // Calculate statistics
  const totalPossiblePrayers = timings.length * 3; // 3 sessions per day
  const completedPrayers = attendance.filter((a) => a.status === "ada" && a.namaz_marked).length;
  const kazaPrayers = attendance.filter((a) => a.status === "kaza").length;
  
  const namazCount = attendance.filter((a) => a.namaz_marked).length;
  const duaCount = attendance.filter((a) => a.dua_marked).length;
  const quranCount = attendance.filter((a) => a.quran_marked).length;
  const extraZikerCount = attendance.filter((a) => a.extra_ziker && a.extra_ziker.trim() !== "").length;
  const goodDeedCount = attendance.filter((a) => a.good_deed && a.good_deed.trim() !== "").length;
  
  // On-time percentages
  const earlyPrayers = attendance.filter((a) => a.time_percentage && a.time_percentage <= 33).length;
  const middlePrayers = attendance.filter((a) => a.time_percentage && a.time_percentage > 33 && a.time_percentage <= 66).length;
  const latePrayers = attendance.filter((a) => a.time_percentage && a.time_percentage > 66).length;

  // Streak calculation
  const calculateStreak = () => {
    if (!attendance.length) return 0;
    
    // Group by date
    const dateMap = new Map<string, boolean>();
    attendance.forEach((a) => {
      if (a.namaz_marked) {
        dateMap.set(a.date, true);
      }
    });
    
    // Sort dates
    const dates = Array.from(dateMap.keys()).sort().reverse();
    let streak = 0;
    
    for (const date of dates) {
      if (dateMap.get(date)) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const streak = calculateStreak();

  const stats = [
    { 
      label: "Namaz Completed", 
      labelUrdu: "مکمل نمازیں",
      value: namazCount, 
      max: totalPossiblePrayers || 1, 
      color: "stroke-primary",
      icon: Heart
    },
    { 
      label: "Dua Recited", 
      labelUrdu: "دعائیں",
      value: duaCount, 
      max: totalPossiblePrayers || 1, 
      color: "stroke-secondary",
      icon: Sparkles
    },
    { 
      label: "Quran Sessions", 
      labelUrdu: "قرآن تلاوت",
      value: quranCount, 
      max: totalPossiblePrayers || 1, 
      color: "stroke-amber-500",
      icon: BookOpen
    },
  ];

  const detailedStats = [
    { label: "Completed On Time", labelUrdu: "وقت پر مکمل", value: completedPrayers, unit: "prayers", icon: CheckCircle, color: "text-primary" },
    { label: "Qaza Prayers", labelUrdu: "قضا نمازیں", value: kazaPrayers, unit: "missed", icon: XCircle, color: "text-destructive" },
    { label: "Current Streak", labelUrdu: "موجودہ سلسلہ", value: streak, unit: "days", icon: Clock, color: "text-secondary" },
  ];

  const timeDistribution = [
    { label: "Early (First 33%)", labelUrdu: "ابتدائی وقت", value: earlyPrayers, color: "bg-primary" },
    { label: "Middle (33-66%)", labelUrdu: "درمیانی وقت", value: middlePrayers, color: "bg-secondary" },
    { label: "Late (Last 33%)", labelUrdu: "آخری وقت", value: latePrayers, color: "bg-amber-500" },
  ];

  const CircularProgress = ({ value, max, color }: { value: number; max: number; color: string }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative w-20 h-20">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 112 112">
          <circle
            cx="56"
            cy="56"
            r="45"
            strokeWidth="8"
            fill="none"
            stroke="#d1d5db"
          />
          <circle
            cx="56"
            cy="56"
            r="45"
            strokeWidth="8"
            fill="none"
            className={color}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: "stroke-dashoffset 1s ease-out" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-foreground">{Math.round(percentage)}%</span>
        </div>
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <AppLayout>
        <div className="px-4 py-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <Link to="/home" className="p-2 rounded-lg hover:bg-accent transition-colors">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </Link>
            <h1 className="text-2xl font-display font-bold text-foreground">
              Your Progress
            </h1>
          </div>

          <div className="bg-primary/10 border border-primary/30 rounded-xl p-6 text-center">
            <p className="text-foreground mb-4">
              Sign in to view your prayer statistics
            </p>
            <p className="text-muted-foreground font-urdu mb-4">
              اپنی نماز کی اعداد و شمار دیکھنے کے لیے سائن ان کریں
            </p>
            <Link 
              to="/signin" 
              className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded-xl font-medium"
            >
              Sign In
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="px-4 py-6 animate-fade-in">
        <div className="flex items-center gap-3 mb-4">
          <Link to="/home" className="p-2 rounded-lg hover:bg-accent transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <div className="flex-1 text-center pr-10">
            <h1 className="text-2xl font-display font-bold text-foreground">
              Your Progress
            </h1>
            <p className="text-sm font-urdu text-muted-foreground mt-0.5">آپ کی پیش رفت</p>
          </div>
        </div>

        <p className="text-muted-foreground text-sm mb-6 text-center">
          Track your Ramadan journey
          <span className="block text-xs font-urdu mt-0.5">اپنے رمضان کے سفر کو ٹریک کریں</span>
        </p>

        {/* Circular Progress Charts */}
        <div className="bg-card rounded-2xl p-6 prayer-card-shadow mb-6 animate-slide-up">
          <h2 className="text-lg font-semibold text-foreground mb-6 text-center">
            Overall Progress
            <span className="block text-sm font-urdu text-muted-foreground mt-1">مجموعی پیش رفت</span>
          </h2>
          <div className="flex justify-between items-center gap-1">
            {stats.map((stat, index) => (
              <div 
                key={stat.label} 
                className="flex flex-col items-center animate-slide-up" 
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <CircularProgress value={stat.value} max={stat.max} color={stat.color} />
                <p className="text-xs text-foreground mt-2 text-center font-medium">
                  {stat.label}
                </p>
                <p className="text-xs text-muted-foreground font-urdu">
                  {stat.labelUrdu}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="grid gap-3 mb-6">
          {detailedStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div 
                key={stat.label} 
                className="bg-card rounded-xl p-4 prayer-card-shadow flex justify-between items-center animate-slide-up"
                style={{ animationDelay: `${(index + 3) * 100}ms` }}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                  <div>
                    <span className="text-foreground font-medium">{stat.label}</span>
                    <span className="block text-xs text-muted-foreground font-urdu">{stat.labelUrdu}</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-primary">{stat.value}</span>
                  <span className="text-sm text-muted-foreground">{stat.unit}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Time Distribution */}
        <div className="bg-card rounded-2xl p-6 prayer-card-shadow animate-slide-up">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Prayer Time Distribution
            <span className="block text-sm font-urdu text-muted-foreground mt-1">نماز کے اوقات کی تقسیم</span>
          </h2>
          <div className="space-y-3">
            {timeDistribution.map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-foreground">{item.label}</span>
                  <span className="block text-xs text-muted-foreground font-urdu">{item.labelUrdu}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="font-bold text-foreground">{item.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Worship Activities Detail */}
        <div className="bg-card rounded-2xl p-6 prayer-card-shadow animate-slide-up mt-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Worship Activities
            <span className="block text-sm font-urdu text-muted-foreground mt-1">عبادات کی تفصیل</span>
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-primary/10 rounded-xl p-4 text-center">
              <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-primary/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <p className="text-2xl font-bold text-primary">{duaCount}</p>
              <p className="text-xs text-foreground font-medium">Dua Recited</p>
              <p className="text-xs text-muted-foreground font-urdu">دعائیں</p>
            </div>
            <div className="bg-amber-500/10 rounded-xl p-4 text-center">
              <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-amber-500/20 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-amber-600" />
              </div>
              <p className="text-2xl font-bold text-amber-600">{quranCount}</p>
              <p className="text-xs text-foreground font-medium">Quran Sessions</p>
              <p className="text-xs text-muted-foreground font-urdu">قرآن تلاوت</p>
            </div>
            <div className="bg-secondary/10 rounded-xl p-4 text-center">
              <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-secondary/20 flex items-center justify-center">
                <Heart className="w-5 h-5 text-secondary" />
              </div>
              <p className="text-2xl font-bold text-secondary">{extraZikerCount}</p>
              <p className="text-xs text-foreground font-medium">Extra Dhikr</p>
              <p className="text-xs text-muted-foreground font-urdu">اضافی ذکر</p>
            </div>
            <div className="bg-emerald-500/10 rounded-xl p-4 text-center">
              <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-2xl font-bold text-emerald-600">{goodDeedCount}</p>
              <p className="text-xs text-foreground font-medium">Good Deeds</p>
              <p className="text-xs text-muted-foreground font-urdu">نیک اعمال</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Reports;
