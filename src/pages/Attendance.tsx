import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import FaisalabadClock from "@/components/FaisalabadClock";
import { Sun, Sunset, Moon, ArrowLeft, Check, X, Lock } from "lucide-react";
import { useTodayTiming } from "@/hooks/usePrayerTimings";
import { useTodayAttendance } from "@/hooks/usePrayerAttendance";
import { useAuth } from "@/hooks/useAuth";
import {
  getFaisalabadTime,
  getSessionWindows,
  SessionWindow,
  sessionNames,
  statusLabels,
} from "@/lib/prayerUtils";
import fajrBg from "@/assets/fajr-background.jpg";
import zoharainBg from "@/assets/zoharain-background.jpg";
import magribainBg from "@/assets/magribain-background.jpg";

interface Prayer {
  id: string;
  name: string;
  nameUrdu: string;
  icon: typeof Sun;
  time: string;
  backgroundImage: string;
}

const prayers: Prayer[] = [
  { id: "fajr", name: "Fajr", nameUrdu: "فجر", icon: Sun, time: "Dawn Prayer", backgroundImage: fajrBg },
  { id: "zoharain", name: "Zoharain", nameUrdu: "ظہرین", icon: Sunset, time: "Noon & Afternoon", backgroundImage: zoharainBg },
  { id: "magribain", name: "Magribain", nameUrdu: "مغربین", icon: Moon, time: "Evening & Night", backgroundImage: magribainBg },
];

const Attendance = () => {
  const { user, isAuthenticated } = useAuth();
  const { data: todayTiming } = useTodayTiming();
  const { data: todayAttendance } = useTodayAttendance(user?.id);
  const [sessionWindows, setSessionWindows] = useState<Record<string, SessionWindow>>({});

  // Update session windows every second
  useEffect(() => {
    const updateWindows = () => {
      if (todayTiming) {
        const currentTime = getFaisalabadTime();
        setSessionWindows(getSessionWindows(todayTiming, currentTime));
      }
    };

    updateWindows();
    const interval = setInterval(updateWindows, 1000);
    return () => clearInterval(interval);
  }, [todayTiming]);

  const getAttendanceStatus = (prayerId: string) => {
    const attendance = todayAttendance?.find((a) => a.session_type === prayerId);
    return attendance?.status || "pending";
  };

  const isSessionLocked = (prayerId: string) => {
    const window = sessionWindows[prayerId];
    if (!window) return true; // Lock if no timing available
    return window.isLocked;
  };

  const isSessionActive = (prayerId: string) => {
    const window = sessionWindows[prayerId];
    return window?.isActive || false;
  };

  const hasMarkedAttendance = (prayerId: string) => {
    const attendance = todayAttendance?.find((a) => a.session_type === prayerId);
    return attendance?.namaz_marked || false;
  };

  return (
    <AppLayout>
      <div className="px-4 py-6 animate-fade-in">
        <div className="flex items-center gap-3 mb-4">
          <Link to="/home" className="p-2 rounded-lg hover:bg-accent transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Mark Your Prayer
          </h1>
        </div>

        {/* Faisalabad Clock */}
        <FaisalabadClock />

        {!todayTiming && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
            <p className="text-yellow-600 text-sm text-center">
              No prayer timings available for today. Please check back later.
            </p>
          </div>
        )}

        {!isAuthenticated && (
          <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 mb-6">
            <p className="text-primary text-sm text-center">
              <Link to="/signin" className="underline font-semibold">Sign in</Link> to save your prayer attendance
            </p>
          </div>
        )}

        <div className="grid gap-4">
          {prayers.map((prayer, index) => {
            const Icon = prayer.icon;
            const status = getAttendanceStatus(prayer.id);
            const locked = isSessionLocked(prayer.id);
            const active = isSessionActive(prayer.id);
            const marked = hasMarkedAttendance(prayer.id);
            const window = sessionWindows[prayer.id];
            
          // Determine if clickable - also lock if already marked
          const canClick = !locked && !marked && isAuthenticated && todayTiming;
            
            return (
              <div
                key={prayer.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {canClick ? (
                  <Link to={`/attendance/${prayer.id}`}>
                    <PrayerCard
                      prayer={prayer}
                      Icon={Icon}
                      status={status}
                      locked={locked}
                      active={active}
                      marked={marked}
                      window={window}
                    />
                  </Link>
                ) : (
                  <PrayerCard
                    prayer={prayer}
                    Icon={Icon}
                    status={status}
                    locked={locked}
                    active={active}
                    marked={marked}
                    window={window}
                    disabled
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 p-4 bg-card rounded-xl border border-border">
          <h3 className="text-sm font-semibold text-foreground mb-3 text-center">Status Legend</h3>
          <div className="flex justify-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
              <span className="text-foreground">{statusLabels.ada.en}</span>
              <span className="text-muted-foreground font-urdu">{statusLabels.ada.ur}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                <X className="w-3 h-3 text-white" />
              </div>
              <span className="text-foreground">{statusLabels.kaza.en}</span>
              <span className="text-muted-foreground font-urdu">{statusLabels.kaza.ur}</span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

interface PrayerCardProps {
  prayer: Prayer;
  Icon: typeof Sun;
  status: string;
  locked: boolean;
  active: boolean;
  marked: boolean;
  window?: SessionWindow;
  disabled?: boolean;
}

const PrayerCard = ({
  prayer,
  Icon,
  status,
  locked,
  active,
  marked,
  window,
  disabled,
}: PrayerCardProps) => {
  const formatTimeWindow = () => {
    if (!window) return "";
    const start = window.startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const end = window.endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return `${start} - ${end}`;
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl h-36 transition-all duration-300 shadow-lg ${
        disabled
          ? "opacity-60 cursor-not-allowed"
          : "hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
      } ${active ? "ring-2 ring-primary ring-offset-2" : ""}`}
    >
      {/* Background Image */}
      <img
        src={prayer.backgroundImage}
        alt={prayer.name}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Dark Overlay */}
      <div className={`absolute inset-0 ${locked ? "bg-black/70" : "bg-black/50"}`} />

      {/* Lock Overlay */}
      {(locked || (marked && !active)) && (
        <div className="absolute top-3 right-3 z-20">
          <div className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center">
            <Lock className="w-4 h-4 text-white/70" />
          </div>
        </div>
      )}

      {/* Status Badge */}
      {status !== "pending" && (
        <div className="absolute top-3 left-3 z-20">
          <div
            className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
              status === "ada"
                ? "bg-green-500/90 text-white"
                : "bg-red-500/90 text-white"
            }`}
          >
            {status === "ada" ? (
              <Check className="w-3 h-3" />
            ) : (
              <X className="w-3 h-3" />
            )}
            <span>{status === "ada" ? statusLabels.ada.en : statusLabels.kaza.en}</span>
          </div>
        </div>
      )}

      {/* Active Indicator */}
      {active && !marked && (
        <div className="absolute top-3 right-3 z-20">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-primary text-primary-foreground animate-pulse">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            <span>Active Now</span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-between p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-xl font-semibold text-white">{prayer.name}</h3>
              <span className="text-base text-white/80 font-urdu">{prayer.nameUrdu}</span>
            </div>
          </div>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-white/70">{prayer.time}</p>
            {window && (
              <p className="text-xs text-white/90 font-mono">{formatTimeWindow()}</p>
            )}
          </div>
          {!locked && !disabled && (
            <div className="text-white/70">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Attendance;
