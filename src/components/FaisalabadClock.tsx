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
    <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-3 mb-6 border border-primary/20">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <Clock className="w-4 h-4 text-primary" />
          </div>
          <p className="text-sm font-semibold text-foreground font-mono">
            {formatTime(time)}
          </p>
        </div>
        
        <div className="w-px h-6 bg-border" />
        
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-secondary" />
          </div>
          <div>
            <p className="text-xs font-medium text-foreground">{formatDate(time)}</p>
            <p className="text-xs text-muted-foreground font-urdu">{formatDateUrdu(time)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaisalabadClock;
