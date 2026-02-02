import { BookOpenText, ChartColumnBig, InfoIcon, PhoneCall } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import homeIcon from "@/assets/home-icon.png";

const BottomNav = () => {
  const location = useLocation();
  
  const navItems = [
    { icon: BookOpenText, label: "Kaza", path: "/kaza" },
    { icon: ChartColumnBig, label: "Reports", path: "/reports" },
    { label: "Home", path: "/home", isCenter: true },
    { icon: InfoIcon, label: "About", path: "/about" },
    { icon: PhoneCall, label: "Contact", path: "/contact" },
  ];

  return (
    <nav 
      className="absolute bottom-0 left-0 right-0 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] rounded-t-3xl"
      style={{
        background: "linear-gradient(135deg, #145C43 0%, #1E7F5C 50%, #28A070 100%)"
      }}
    >
      <div className="flex items-center justify-around h-18 px-2 py-3">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path === "/home" && location.pathname === "/");
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${
                item.isCenter ? "relative" : ""
              }`}
            >
              {item.isCenter ? (
                <div 
                  className={`flex items-center justify-center -mt-8 w-16 h-16 rounded-full shadow-xl transition-transform border-4 border-background ${
                    isActive ? "scale-110" : "hover:scale-105"
                  }`}
                  style={{
                    background: "linear-gradient(135deg, #F5D76E 0%, #D4A017 50%, #C4961A 100%)"
                  }}
                >
                  <img src={homeIcon} alt="Home" className="w-10 h-10 object-contain" />
                </div>
              ) : (
              <div className={`flex flex-col items-center transition-colors rounded-xl px-3 py-2 ${
                  isActive ? "text-primary-foreground bg-primary-foreground/10" : "text-primary-foreground/70"
                }`}>
                  {Icon && <Icon className={`h-6 w-6 ${isActive ? "scale-110" : ""} transition-transform`} strokeWidth={2.5} />}
                  <span className="text-[10px] font-semibold mt-1">{item.label}</span>
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
