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
    <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-2.5 mb-6 border border-primary/20">
      <div className="flex items-center justify-center gap-2">
        <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
          <Clock className="w-3.5 h-3.5 text-primary" />
        </div>
        <p className="text-xs font-semibold text-foreground font-mono whitespace-nowrap">
          {formatTime(time)}
        </p>
        
        <div className="w-px h-5 bg-border shrink-0" />
        
        <div className="w-7 h-7 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
          <Calendar className="w-3.5 h-3.5 text-secondary" />
        </div>
        <p className="text-[11px] font-medium text-foreground whitespace-nowrap">{formatDate(time)}</p>
      </div>
    </div>
  );
};

export default FaisalabadClock;
