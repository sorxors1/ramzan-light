import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import kyfLogo from "@/assets/kyf-logo.png";

const Splash = () => {
  const navigate = useNavigate();
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        navigate("/home");
      }, 500);
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center bg-background transition-opacity duration-500 ${fadeOut ? "opacity-0" : "opacity-100"}`}>
      <div className="animate-scale-in">
        <img 
          src={kycLogo} 
          alt="KYC Prayer Log" 
          className="w-64 h-auto object-contain"
        />
      </div>
      
      <div className="mt-12 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse-soft" style={{ animationDelay: "0ms" }} />
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse-soft" style={{ animationDelay: "200ms" }} />
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse-soft" style={{ animationDelay: "400ms" }} />
      </div>
      
      <p className="mt-6 text-muted-foreground text-sm font-medium animate-fade-in">
        Loading your spiritual journey...
      </p>
    </div>
  );
};

export default Splash;
