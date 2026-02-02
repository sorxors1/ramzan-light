import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { ArrowLeft, Check, BookOpen, Heart, BookMarked } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const prayerNames: Record<string, string> = {
  fajr: "Fajr",
  zoharain: "Zoharain",
  magribain: "Magribain",
};

interface CheckItem {
  id: string;
  name: string;
  icon: typeof BookOpen;
  description: string;
}

const checkItems: CheckItem[] = [
  { id: "namaz", name: "Namaz", icon: Heart, description: "Offered prayer with congregation" },
  { id: "dua", name: "Dua", icon: BookMarked, description: "Made supplications after prayer" },
  { id: "quran", name: "Quran", icon: BookOpen, description: "Recited Quran today" },
];

const PrayerDetail = () => {
  const { prayerId } = useParams();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string[]>([]);

  const prayerName = prayerNames[prayerId || ""] || "Prayer";

  const toggleItem = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    if (selected.length === 0) {
      toast.error("Please select at least one item");
      return;
    }
    
    toast.success(`${prayerName} attendance marked successfully!`, {
      description: `Recorded: ${selected.map(s => checkItems.find(c => c.id === s)?.name).join(", ")}`,
    });
    
    setTimeout(() => {
      navigate("/home");
    }, 1500);
  };

  return (
    <AppLayout>
      <div className="px-4 py-6 animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/attendance" className="p-2 rounded-lg hover:bg-accent transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <h1 className="text-2xl font-display font-bold text-foreground">
            {prayerName}
          </h1>
        </div>

        <p className="text-muted-foreground text-sm mb-6">
          Select what you completed during {prayerName}
        </p>

        <div className="grid gap-4 mb-8">
          {checkItems.map((item, index) => {
            const Icon = item.icon;
            const isSelected = selected.includes(item.id);
            
            return (
              <button
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className="w-full animate-slide-up text-left"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`relative overflow-hidden rounded-2xl p-5 transition-all duration-300 ${
                  isSelected 
                    ? "bg-primary/10 border-2 border-primary" 
                    : "bg-card border-2 border-transparent prayer-card-shadow"
                }`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors ${
                      isSelected ? "bg-primary" : "bg-accent"
                    }`}>
                      <Icon className={`w-7 h-7 ${isSelected ? "text-primary-foreground" : "text-primary"}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold ${isSelected ? "text-primary" : "text-foreground"}`}>
                        {item.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected 
                        ? "bg-primary border-primary" 
                        : "border-muted-foreground/30"
                    }`}>
                      {isSelected && <Check className="w-4 h-4 text-primary-foreground" />}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <Button 
          onClick={handleSubmit}
          className="w-full h-14 text-lg font-semibold rounded-xl bg-secondary hover:bg-secondary/90 btn-shadow"
        >
          Submit Attendance
        </Button>
      </div>
    </AppLayout>
  );
};

export default PrayerDetail;
