import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import kaabaBannerGif from "@/assets/kaaba-banner.gif";
import kaabaBannerFallback from "@/assets/kaaba-banner-fallback.png";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import namazAttendanceIcon from "@/assets/namaz-attendance-icon.svg";
import kazaNamazIcon from "@/assets/kaza-namaz-icon.svg";
import reportsIcon from "@/assets/reports-icon.svg";
import aboutUsIcon from "@/assets/about-us-icon.svg";
import contactUsIcon from "@/assets/contact-us-icon.svg";
import settingsIcon from "@/assets/settings-icon.svg";
import { getFaisalabadTime } from "@/lib/prayerUtils";

// Prayer times for Pakistan (Faisalabad) - these would ideally come from an API
const PRAYER_TIMES = [
  { name: "Fajr", time: "05:15" },
  { name: "Dhuhr", time: "12:30" },
  { name: "Asr", time: "15:45" },
  { name: "Maghrib", time: "18:15" },
  { name: "Isha", time: "19:45" },
];

// Faisalabad Ramadan 2026 Calendar Data
const RAMADAN_2026_FAISALABAD = [
  { day: 1, date: "17 Feb", sehri: "05:40", iftar: "18:00" },
  { day: 2, date: "18 Feb", sehri: "05:39", iftar: "18:01" },
  { day: 3, date: "19 Feb", sehri: "05:38", iftar: "18:02" },
  { day: 4, date: "20 Feb", sehri: "05:37", iftar: "18:03" },
  { day: 5, date: "21 Feb", sehri: "05:36", iftar: "18:04" },
  { day: 6, date: "22 Feb", sehri: "05:35", iftar: "18:05" },
  { day: 7, date: "23 Feb", sehri: "05:34", iftar: "18:06" },
  { day: 8, date: "24 Feb", sehri: "05:33", iftar: "18:07" },
  { day: 9, date: "25 Feb", sehri: "05:32", iftar: "18:08" },
  { day: 10, date: "26 Feb", sehri: "05:31", iftar: "18:09" },
  { day: 11, date: "27 Feb", sehri: "05:30", iftar: "18:10" },
  { day: 12, date: "28 Feb", sehri: "05:29", iftar: "18:11" },
  { day: 13, date: "1 Mar", sehri: "05:27", iftar: "18:12" },
  { day: 14, date: "2 Mar", sehri: "05:26", iftar: "18:13" },
  { day: 15, date: "3 Mar", sehri: "05:25", iftar: "18:14" },
  { day: 16, date: "4 Mar", sehri: "05:23", iftar: "18:15" },
  { day: 17, date: "5 Mar", sehri: "05:22", iftar: "18:16" },
  { day: 18, date: "6 Mar", sehri: "05:20", iftar: "18:17" },
  { day: 19, date: "7 Mar", sehri: "05:19", iftar: "18:18" },
  { day: 20, date: "8 Mar", sehri: "05:17", iftar: "18:19" },
  { day: 21, date: "9 Mar", sehri: "05:16", iftar: "18:20" },
  { day: 22, date: "10 Mar", sehri: "05:14", iftar: "18:21" },
  { day: 23, date: "11 Mar", sehri: "05:13", iftar: "18:22" },
  { day: 24, date: "12 Mar", sehri: "05:11", iftar: "18:23" },
  { day: 25, date: "13 Mar", sehri: "05:09", iftar: "18:24" },
  { day: 26, date: "14 Mar", sehri: "05:08", iftar: "18:25" },
  { day: 27, date: "15 Mar", sehri: "05:06", iftar: "18:26" },
  { day: 28, date: "16 Mar", sehri: "05:04", iftar: "18:27" },
  { day: 29, date: "17 Mar", sehri: "05:03", iftar: "18:28" },
  { day: 30, date: "18 Mar", sehri: "05:01", iftar: "18:29" },
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
  const [bannerLoading, setBannerLoading] = useState(true);
  const [bannerError, setBannerError] = useState(false);
  const [faisalabadTime, setFaisalabadTime] = useState(getFaisalabadTime());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setPrayerInfo(getCurrentPrayer());
      setFaisalabadTime(getFaisalabadTime());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

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
                    <h2 className="text-xl font-bold font-display">{prayerInfo.next.name}</h2>
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

                {/* Kaza Namaz */}
                <Link to="/kaza" className="group block">
                  <div 
                    className="rounded-xl p-4 shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] h-28 flex flex-col items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, #6366F1 0%, #818CF8 50%, #A5B4FC 100%)"
                    }}
                  >
                    <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center mb-2">
                      <img src={kazaNamazIcon} alt="Kaza Namaz" className="w-10 h-10" />
                    </div>
                    <h3 className="text-xs font-semibold text-white text-center">Kaza Namaz</h3>
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
                    <img src={reportsIcon} alt="Reports" className="w-16 h-16 mb-2" />
                    <h3 className="text-xs font-semibold text-white text-center">Reports</h3>
                  </div>
                </Link>

                {/* About Us */}
                <Link to="/about" className="group block">
                  <div 
                    className="rounded-xl p-4 shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] h-28 flex flex-col items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, #EC4899 0%, #F472B6 50%, #F9A8D4 100%)"
                    }}
                  >
                    <img src={aboutUsIcon} alt="About Us" className="w-16 h-16 mb-2" />
                    <h3 className="text-xs font-semibold text-white text-center">About Us</h3>
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
                    <img src={contactUsIcon} alt="Contact Us" className="w-16 h-16 mb-2" />
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
                    <img src={settingsIcon} alt="Profile Settings" className="w-16 h-16 mb-2" />
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
