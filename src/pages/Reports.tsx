import AppLayout from "@/components/layout/AppLayout";

interface StatItem {
  label: string;
  value: number;
  max: number;
  color: string;
}

const stats: StatItem[] = [
  { label: "Namaz Completed", value: 12, max: 15, color: "stroke-primary" },
  { label: "Duas Recited", value: 8, max: 15, color: "stroke-secondary" },
  { label: "Quran Sessions", value: 10, max: 15, color: "stroke-amber-500" },
];

const detailedStats = [
  { label: "Completed Namaz", value: 12, unit: "prayers" },
  { label: "Kaza Namaz", value: 3, unit: "pending" },
  { label: "Duas Count", value: 24, unit: "supplications" },
  { label: "Quran Verses", value: 156, unit: "verses" },
];

const CircularProgress = ({ value, max, color }: { value: number; max: number; color: string }) => {
  const percentage = (value / max) * 100;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-28 h-28">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="56"
          cy="56"
          r="45"
          strokeWidth="8"
          fill="none"
          className="stroke-muted"
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
        <span className="text-2xl font-bold text-foreground">{Math.round(percentage)}%</span>
      </div>
    </div>
  );
};

const Reports = () => {
  return (
    <AppLayout>
      <div className="px-4 py-6 animate-fade-in">
        <h1 className="text-2xl font-display font-bold text-foreground mb-2">
          Your Progress
        </h1>
        <p className="text-muted-foreground text-sm mb-6">
          Track your Ramadan journey
        </p>

        {/* Circular Progress Charts */}
        <div className="bg-card rounded-2xl p-6 prayer-card-shadow mb-6 animate-slide-up">
          <h2 className="text-lg font-semibold text-foreground mb-6 text-center">
            Overall Progress
          </h2>
          <div className="flex justify-around items-center flex-wrap gap-4">
            {stats.map((stat, index) => (
              <div key={stat.label} className="flex flex-col items-center" style={{ animationDelay: `${index * 200}ms` }}>
                <CircularProgress value={stat.value} max={stat.max} color={stat.color} />
                <p className="text-xs text-muted-foreground mt-2 text-center max-w-[80px]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="grid gap-3">
          {detailedStats.map((stat, index) => (
            <div 
              key={stat.label} 
              className="bg-card rounded-xl p-4 prayer-card-shadow flex justify-between items-center animate-slide-up"
              style={{ animationDelay: `${(index + 3) * 100}ms` }}
            >
              <span className="text-foreground font-medium">{stat.label}</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-primary">{stat.value}</span>
                <span className="text-sm text-muted-foreground">{stat.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Reports;
