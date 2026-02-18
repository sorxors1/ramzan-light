import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import kaabaBannerGif from "@/assets/kaaba-banner.gif";
import kaabaBannerFallback from "@/assets/kaaba-banner-fallback.png";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import namazAttendanceIcon from "@/assets/namaz-attendance-icon.svg";
import kazaNamazIcon from "@/assets/kaza-namaz-icon.svg";
import reportsIcon from "@/assets/reports-icon.svg";
import duaIcon from "@/assets/dua-icon.svg";
import contactUsIcon from "@/assets/contact-us-icon.svg";
import settingsIcon from "@/assets/settings-icon.svg";
import { getFaisalabadTime, getSessionWindows, sessionNames } from "@/lib/prayerUtils";
import { useTodayTiming } from "@/hooks/usePrayerTimings";

// Faisalabad Ramadan 2026 Calendar Data
const RAMADAN_2026_FAISALABAD = [
  { day: 1, date: "19 Feb", sehri: "05:18", iftar: "06:10" },
  { day: 2, date: "20 Feb", sehri: "05:17", iftar: "06:11" },
  { day: 3, date: "21 Feb", sehri: "05:16", iftar: "06:12" },
  { day: 4, date: "22 Feb", sehri: "05:15", iftar: "06:13" },
  { day: 5, date: "23 Feb", sehri: "05:14", iftar: "06:14" },
  { day: 6, date: "24 Feb", sehri: "05:13", iftar: "06:14" },
  { day: 7, date: "25 Feb", sehri: "05:12", iftar: "06:15" },
  { day: 8, date: "26 Feb", sehri: "05:11", iftar: "06:16" },
  { day: 9, date: "27 Feb", sehri: "05:10", iftar: "06:17" },
  { day: 10, date: "28 Feb", sehri: "05:09", iftar: "06:17" },
  { day: 11, date: "01 Mar", sehri: "05:08", iftar: "06:18" },
  { day: 12, date: "02 Mar", sehri: "05:07", iftar: "06:19" },
  { day: 13, date: "03 Mar", sehri: "05:06", iftar: "06:20" },
  { day: 14, date: "04 Mar", sehri: "05:04", iftar: "06:20" },
  { day: 15, date: "05 Mar", sehri: "05:03", iftar: "06:21" },
  { day: 16, date: "06 Mar", sehri: "05:02", iftar: "06:22" },
  { day: 17, date: "07 Mar", sehri: "05:01", iftar: "06:23" },
  { day: 18, date: "08 Mar", sehri: "05:00", iftar: "06:23" },
  { day: 19, date: "09 Mar", sehri: "04:59", iftar: "06:24" },
  { day: 20, date: "10 Mar", sehri: "04:57", iftar: "06:25" },
  { day: 21, date: "11 Mar", sehri: "04:56", iftar: "06:25" },
  { day: 22, date: "12 Mar", sehri: "04:55", iftar: "06:26" },
  { day: 23, date: "13 Mar", sehri: "04:54", iftar: "06:27" },
  { day: 24, date: "14 Mar", sehri: "04:52", iftar: "06:27" },
  { day: 25, date: "15 Mar", sehri: "04:51", iftar: "06:28" },
  { day: 26, date: "16 Mar", sehri: "04:50", iftar: "06:29" },
  { day: 27, date: "17 Mar", sehri: "04:48", iftar: "06:30" },
  { day: 28, date: "18 Mar", sehri: "04:47", iftar: "06:30" },
  { day: 29, date: "19 Mar", sehri: "04:46", iftar: "06:31" },
  { day: 30, date: "20 Mar", sehri: "04:44", iftar: "06:32" },
];



const Home = () => {
  const [bannerLoading, setBannerLoading] = useState(true);
  const [bannerError, setBannerError] = useState(false);
  const [faisalabadTime, setFaisalabadTime] = useState(getFaisalabadTime());
  const [nextPrayerName, setNextPrayerName] = useState("...");
  const { data: todayTiming } = useTodayTiming();

  useEffect(() => {
    const updateNextPrayer = () => {
      const now = getFaisalabadTime();
      setFaisalabadTime(now);

      if (!todayTiming) {
        setNextPrayerName("...");
        return;
      }

      const windows = getSessionWindows(todayTiming, now);
      const sessions = ["fajr", "zoharain", "magribain"] as const;

      // Find the next upcoming or currently active session
      for (const s of sessions) {
        const w = windows[s];
        if (w && !w.isPast) {
          setNextPrayerName(sessionNames[s]?.en || s);
          return;
        }
      }
      // All sessions past - next is tomorrow's Fajr
      setNextPrayerName("Fajr (Tomorrow)");
    };

    updateNextPrayer();
    const timer = setInterval(updateNextPrayer, 1000);
    return () => clearInterval(timer);
  }, [todayTiming]);

  const formatFaisalabadTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="min-h-screen flex justify-center bg-muted">
      <div className="w-full max-w-md min-h-screen flex flex-col bg-background shadow-xl relative">
        {/* Banner Image - Behind Header */}
        <div className="absolute top-0 left-0 right-0 h-72 overflow-hidden z-0">
          {/* Loading spinner */}
          {bannerLoading && !bannerError && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          
          {/* GIF Banner (main) or Fallback PNG (only on error) */}
          <img 
            src={bannerError ? kaabaBannerFallback : kaabaBannerGif} 
            alt="Kaaba Banner" 
            className={`w-full h-full object-cover object-center transition-opacity duration-300 ${bannerLoading && !bannerError ? 'opacity-0' : 'opacity-100'}`}
            onLoad={() => setBannerLoading(false)}
            onError={() => {
              setBannerError(true);
              setBannerLoading(false);
            }}
          />
          {/* Fade effect at bottom only */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
        </div>

        {/* Header - On top of banner */}
        <Header />

        {/* Main Content */}
        <main className="flex-1 pb-20 relative z-10">
          <div className="animate-fade-in">
            {/* Spacer for banner */}
            <div className="h-44" />

            <div className="px-4 relative z-10">
              {/* Prayer Time Card */}
              <div 
                className="rounded-xl px-4 py-3 mb-5 shadow-lg"
                style={{
                  background: "linear-gradient(135deg, #145C43 0%, #1E7F5C 50%, #28A070 100%)"
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="text-white flex-1">
                    <p className="text-white/60 text-[10px] uppercase tracking-wide">Next Prayer</p>
                    <h2 className="text-xl font-bold font-display">{nextPrayerName}</h2>
                  </div>
                  
                  <div className="w-px h-10 bg-white/30 mx-4" />
                  
                   <div className="text-right text-white flex-1">
                     <p className="text-white/60 text-[10px] uppercase tracking-wide">Faisalabad Time</p>
                    <p className="text-xl font-bold font-display">{formatFaisalabadTime(faisalabadTime)}</p>
                  </div>
                </div>
              </div>

              {/* Welcome Text */}
              <div className="text-center mb-5">
              <h1 className="text-2xl font-arabic font-bold text-foreground mb-1">
                Welcome to KYF Prayer Log
              </h1>
                <p className="text-muted-foreground text-sm">
                  Your spiritual companion for the blessed month
                </p>
              </div>

              {/* Action Cards Grid - 6 cards with bright colors */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                {/* Namaz Attendance */}
                <Link to="/attendance" className="group block">
                  <div 
                    className="rounded-xl p-4 shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] h-28 flex flex-col items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, #1E7F5C 0%, #28A070 50%, #4ADE80 100%)"
                    }}
                  >
                    <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center mb-2">
                      <img src={namazAttendanceIcon} alt="Namaz Attendance" className="w-10 h-10" />
                    </div>
                    <h3 className="text-xs font-semibold text-white text-center">Namaz Attendance</h3>
                  </div>
                </Link>

                {/* Qaza Namaz */}
                <Link to="/kaza" className="group block">
                  <div 
                    className="rounded-xl p-4 shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] h-28 flex flex-col items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, #6366F1 0%, #818CF8 50%, #A5B4FC 100%)"
                    }}
                  >
                    <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center mb-2">
                      <img src={kazaNamazIcon} alt="Qaza Namaz" className="w-10 h-10" />
                    </div>
                    <h3 className="text-xs font-semibold text-white text-center">Qaza Namaz</h3>
                  </div>
                </Link>

                {/* Reports */}
                <Link to="/reports" className="group block">
                  <div 
                    className="rounded-xl p-4 shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] h-28 flex flex-col items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, #F59E0B 0%, #FBBF24 50%, #FCD34D 100%)"
                    }}
                  >
                    <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center mb-2">
                      <img src={reportsIcon} alt="Reports" className="w-10 h-10" />
                    </div>
                    <h3 className="text-xs font-semibold text-white text-center">Reports</h3>
                  </div>
                </Link>

                {/* Dua */}
                <Link to="/dua" className="group block">
                  <div 
                    className="rounded-xl p-4 shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] h-28 flex flex-col items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, #EC4899 0%, #F472B6 50%, #F9A8D4 100%)"
                    }}
                  >
                    <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center mb-2">
                      <img src={duaIcon} alt="Dua" className="w-10 h-10" />
                    </div>
                    <h3 className="text-xs font-semibold text-white text-center">Dua</h3>
                  </div>
                </Link>

                {/* Contact Us */}
                <Link to="/contact" className="group block">
                  <div 
                    className="rounded-xl p-4 shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] h-28 flex flex-col items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, #14B8A6 0%, #2DD4BF 50%, #5EEAD4 100%)"
                    }}
                  >
                    <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center mb-2">
                      <img src={contactUsIcon} alt="Contact Us" className="w-10 h-10" />
                    </div>
                    <h3 className="text-xs font-semibold text-white text-center">Contact Us</h3>
                  </div>
                </Link>

                {/* Profile Settings */}
                <Link to="/profile" className="group block">
                  <div 
                    className="rounded-xl p-4 shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] h-28 flex flex-col items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, #8B5CF6 0%, #A78BFA 50%, #C4B5FD 100%)"
                    }}
                  >
                    <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center mb-2">
                      <img src={settingsIcon} alt="Profile Settings" className="w-10 h-10" />
                    </div>
                    <h3 className="text-xs font-semibold text-white text-center">Profile Settings</h3>
                  </div>
                </Link>
              </div>

              {/* Ramadan 2026 Calendar - Faisalabad Only */}
              <div 
                className="rounded-xl p-4 mb-6 shadow-lg"
                style={{
                  background: "linear-gradient(135deg, #145C43 0%, #1E7F5C 50%, #28A070 100%)"
                }}
              >
                <h3 className="text-white font-display font-bold text-xl mb-1 text-center">
                  Ramadan 2026 Calendar
                </h3>
                <p className="text-white/70 text-xs text-center mb-2">Faisalabad Timings</p>
                
                {/* Arabic-style Decorative Divider */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="h-px w-12 bg-gradient-to-r from-transparent to-amber-400" />
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <div className="w-2 h-2 rounded-full bg-amber-300" />
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  </div>
                  <div className="h-px w-12 bg-gradient-to-l from-transparent to-amber-400" />
                </div>
                
                {/* Calendar Header */}
                <div className="grid grid-cols-4 gap-2 mb-2 text-[10px] font-semibold text-white/80 uppercase tracking-wide">
                  <div className="text-center">Day</div>
                  <div className="text-center">Date</div>
                  <div className="text-center">Sehri</div>
                  <div className="text-center">Iftar</div>
                </div>
                
                {/* Calendar Rows - Scrollable */}
                <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                  {RAMADAN_2026_FAISALABAD.map((day) => (
                    <div 
                      key={day.day} 
                      className="grid grid-cols-4 gap-2 py-2 px-1 rounded-lg bg-white/10 text-white text-xs"
                    >
                      <div className="text-center font-bold">{day.day}</div>
                      <div className="text-center text-white/80">{day.date}</div>
                      <div className="text-center font-medium">{day.sehri}</div>
                      <div className="text-center font-medium">{day.iftar}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
};

export default Home;
