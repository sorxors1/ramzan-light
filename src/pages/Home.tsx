import AppLayout from "@/components/layout/AppLayout";
import { Link } from "react-router-dom";
import { CheckCircle2, Phone } from "lucide-react";

const Home = () => {
  return (
    <AppLayout>
      <div className="px-4 py-6 animate-fade-in max-w-md mx-auto">
        {/* Heading */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-display font-bold text-foreground">
            Welcome to RamzanOne
          </h1>
        </div>

        {/* Description */}
        <div className="bg-card rounded-2xl p-5 mb-6 prayer-card-shadow text-center">
          <p className="text-foreground/90 text-sm leading-relaxed">
            Your spiritual companion for the blessed month of Ramadan. 
            Track your daily prayers, maintain your Dua routine, and monitor your Quran recitation progress. 
            Let this app help you make the most of this sacred time.
          </p>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-border mb-6" />

        {/* Action Cards - Inline */}
        <div className="grid grid-cols-2 gap-3">
          <Link to="/attendance" className="group">
            <div className="bg-card rounded-2xl p-4 prayer-card-shadow transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] h-full">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    Mark Attendance
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Track prayers
                  </p>
                </div>
              </div>
            </div>
          </Link>

          <Link to="/contact" className="group">
            <div className="bg-card rounded-2xl p-4 prayer-card-shadow transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] h-full">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    Contact Us
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Get support
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
};

export default Home;
