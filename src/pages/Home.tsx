import AppLayout from "@/components/layout/AppLayout";
import { Link } from "react-router-dom";
import { CheckCircle2, Phone, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import mosqueBanner from "@/assets/mosque-banner.png";

// Prayer times for Pakistan (Islamabad) - these would ideally come from an API
const PRAYER_TIMES = [
  { name: "Fajr", time: "05:15" },
  { name: "Dhuhr", time: "12:30" },
  { name: "Asr", time: "15:45" },
  { name: "Maghrib", time: "18:15" },
  { name: "Isha", time: "19:45" },
];

const getCurrentPrayer = () => {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  for (let i = PRAYER_TIMES.length - 1; i >= 0; i--) {
    const [hours, minutes] = PRAYER_TIMES[i].time.split(':').map(Number);
    const prayerTime = hours * 60 + minutes;
    if (currentTime >= prayerTime) {
      const nextPrayer = PRAYER_TIMES[(i + 1) % PRAYER_TIMES.length];
      return {
        current: PRAYER_TIMES[i],
        next: nextPrayer,
      };
    }
  }
  
  return {
    current: PRAYER_TIMES[PRAYER_TIMES.length - 1],
    next: PRAYER_TIMES[0],
  };
};

const Home = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [prayerInfo, setPrayerInfo] = useState(getCurrentPrayer());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setPrayerInfo(getCurrentPrayer());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  return (
    <AppLayout>
      <div className="animate-fade-in">
        {/* Mosque Banner Image */}
        <div className="relative w-full h-40 overflow-hidden">
          <img 
            src={mosqueBanner} 
            alt="Mosque Banner" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        </div>

        <div className="px-4 -mt-8 relative z-10">
          {/* Prayer Time Card */}
          <div 
            className="rounded-2xl p-5 mb-6 shadow-lg"
            style={{
              background: "linear-gradient(135deg, #145C43 0%, #1E7F5C 50%, #28A070 100%)"
            }}
          >
            <div className="flex items-center justify-between">
              <div className="text-white">
                <p className="text-white/70 text-sm mb-1">Next Prayer</p>
                <h2 className="text-3xl font-bold font-display">{prayerInfo.next.name}</h2>
              </div>
              <div className="text-right text-white">
                <p className="text-white/70 text-sm mb-1">Pakistan Standard Time</p>
                <p className="text-3xl font-bold font-display">{formatTime(prayerInfo.next.time)}</p>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/20">
              <Link to="/attendance" className="flex items-center justify-between text-white hover:text-white/90 transition-colors">
                <span className="font-medium">Track Your Daily Progress</span>
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Welcome Text */}
          <div className="text-center mb-6">
            <h1 className="text-xl font-display font-bold text-foreground mb-2">
              Welcome to RamzanOne
            </h1>
            <p className="text-muted-foreground text-sm">
              Your spiritual companion for the blessed month
            </p>
          </div>

          {/* Action Cards */}
          <div className="space-y-4 pb-6">
            {/* Mark Attendance - Large Card */}
            <Link to="/attendance" className="group block">
              <div 
                className="rounded-2xl p-6 shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, #145C43 0%, #1E7F5C 50%, #28A070 100%)"
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                    <CheckCircle2 className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">
                      Mark Attendance
                    </h3>
                    <p className="text-sm text-white/70 mt-1">
                      Track your daily prayers, Dua & Quran
                    </p>
                  </div>
                  <ChevronRight className="w-6 h-6 text-white/70" />
                </div>
              </div>
            </Link>

            {/* Contact Us - Smaller Card */}
            <Link to="/contact" className="group block">
              <div className="bg-card rounded-2xl p-4 prayer-card-shadow transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-foreground">
                      Contact Us
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Get support via WhatsApp
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Home;
