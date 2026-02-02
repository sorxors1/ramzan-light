import { Home, BookOpen, BarChart3, Info, Phone } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const BottomNav = () => {
  const location = useLocation();
  
  const navItems = [
    { icon: BookOpen, label: "Kaza", path: "/kaza" },
    { icon: BarChart3, label: "Reports", path: "/reports" },
    { icon: Home, label: "Home", path: "/", isCenter: true },
    { icon: Info, label: "About", path: "/about" },
    { icon: Phone, label: "Contact", path: "/contact" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-primary shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
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
                <div className={`flex flex-col items-center justify-center -mt-6 w-16 h-16 rounded-full bg-secondary shadow-lg transition-transform ${
                  isActive ? "scale-110" : "hover:scale-105"
                }`}>
                  <Icon className="h-6 w-6 text-secondary-foreground" />
                  <span className="text-[10px] font-medium text-secondary-foreground mt-0.5">
                    {item.label}
                  </span>
                </div>
              ) : (
                <div className={`flex flex-col items-center transition-colors ${
                  isActive ? "text-secondary-foreground" : "text-primary-foreground/70"
                }`}>
                  <Icon className={`h-5 w-5 ${isActive ? "scale-110" : ""} transition-transform`} />
                  <span className="text-[10px] font-medium mt-1">{item.label}</span>
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
