import { useState, useEffect } from "react";
import { getFaisalabadTime, formatTime, formatDate, formatDateUrdu } from "@/lib/prayerUtils";
import { Clock, Calendar } from "lucide-react";

const FaisalabadClock = () => {
  const [time, setTime] = useState(getFaisalabadTime());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getFaisalabadTime());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-4 mb-6 border border-primary/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Faisalabad Time</p>
            <p className="text-xl font-bold text-foreground font-mono">
              {formatTime(time)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">{formatDate(time)}</p>
            <p className="text-sm text-muted-foreground font-urdu">{formatDateUrdu(time)}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-secondary" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaisalabadClock;
