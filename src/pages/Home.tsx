import AppLayout from "@/components/layout/AppLayout";
import logo from "@/assets/logo.png";
import { Link } from "react-router-dom";
import { CheckCircle2, Phone } from "lucide-react";

const Home = () => {
  return (
    <AppLayout>
      <div className="px-4 py-6 animate-fade-in">
        {/* Logo & Organization Info */}
        <div className="flex flex-col items-center text-center mb-8">
          <img 
            src={logo} 
            alt="RamzanOne" 
            className="w-48 h-auto object-contain mb-4"
          />
          <h1 className="text-2xl font-display font-bold text-foreground">
            RamzanOne
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            The Prayer Tracker
          </p>
        </div>

        {/* Description */}
        <div className="bg-card rounded-xl p-5 mb-6 prayer-card-shadow">
          <p className="text-foreground/90 text-sm leading-relaxed">
            Welcome to RamzanOne - your spiritual companion for the blessed month of Ramadan. 
            Track your daily prayers, maintain your Dua routine, and monitor your Quran recitation progress. 
            Let this app help you make the most of this sacred time.
          </p>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-border mb-6" />

        {/* Action Cards */}
        <div className="grid gap-4">
          <Link to="/attendance" className="group">
            <div className="bg-card rounded-xl p-6 prayer-card-shadow transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    Mark Attendance
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Track your daily prayers
                  </p>
                </div>
              </div>
            </div>
          </Link>

          <Link to="/contact" className="group">
            <div className="bg-card rounded-xl p-6 prayer-card-shadow transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <Phone className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    Contact Us
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Get in touch for support
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
