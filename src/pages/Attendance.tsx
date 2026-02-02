import { useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { Sun, Sunset, Moon, ArrowLeft } from "lucide-react";

interface Prayer {
  id: string;
  name: string;
  icon: typeof Sun;
  time: string;
  color: string;
}

const prayers: Prayer[] = [
  { id: "fajr", name: "Fajr", icon: Sun, time: "Dawn Prayer", color: "from-amber-400 to-orange-500" },
  { id: "zoharain", name: "Zoharain", icon: Sunset, time: "Noon & Afternoon", color: "from-orange-400 to-red-500" },
  { id: "magribain", name: "Magribain", icon: Moon, time: "Evening & Night", color: "from-indigo-400 to-purple-600" },
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
                <div className="relative overflow-hidden bg-card rounded-2xl p-6 prayer-card-shadow transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                  <div className={`absolute top-0 right-0 w-24 h-24 rounded-full bg-gradient-to-br ${prayer.color} opacity-10 -translate-y-8 translate-x-8`} />
                  
                  <div className="flex items-center gap-4 relative z-10">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${prayer.color} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                        {prayer.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {prayer.time}
                      </p>
                    </div>
                    <div className="text-muted-foreground/50 group-hover:text-primary transition-colors">
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
