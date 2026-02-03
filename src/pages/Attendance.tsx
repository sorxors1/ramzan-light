import { Link } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { Sun, Sunset, Moon, ArrowLeft } from "lucide-react";
import fajrBg from "@/assets/fajr-background.jpg";
import zoharainBg from "@/assets/zoharain-background.jpg";
import magribainBg from "@/assets/magribain-background.jpg";

interface Prayer {
  id: string;
  name: string;
  icon: typeof Sun;
  time: string;
  backgroundImage: string;
}

const prayers: Prayer[] = [
  { id: "fajr", name: "Fajr", icon: Sun, time: "Dawn Prayer", backgroundImage: fajrBg },
  { id: "zoharain", name: "Zoharain", icon: Sunset, time: "Noon & Afternoon", backgroundImage: zoharainBg },
  { id: "magribain", name: "Magribain", icon: Moon, time: "Evening & Night", backgroundImage: magribainBg },
];

const Attendance = () => {
  return (
    <AppLayout>
      <div className="px-4 py-6 animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/home" className="p-2 rounded-lg hover:bg-accent transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Mark Your Prayer
          </h1>
        </div>

        <p className="text-muted-foreground text-sm mb-6">
          Select a prayer time to mark your attendance
        </p>

        <div className="grid gap-4">
          {prayers.map((prayer, index) => {
            const Icon = prayer.icon;
            return (
              <Link 
                key={prayer.id} 
                to={`/attendance/${prayer.id}`}
                className="group animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div 
                  className="relative overflow-hidden rounded-2xl h-32 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                >
                  {/* Background Image */}
                  <img 
                    src={prayer.backgroundImage} 
                    alt={prayer.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  
                  {/* Dark Overlay */}
                  <div className="absolute inset-0 bg-black/50" />
                  
                  {/* Content */}
                  <div className="relative z-10 h-full flex items-center justify-between px-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white">
                          {prayer.name}
                        </h3>
                        <p className="text-sm text-white/80">
                          {prayer.time}
                        </p>
                      </div>
                    </div>
                    <div className="text-white/70 group-hover:text-white transition-colors">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
};

export default Attendance;
