import AppLayout from "@/components/layout/AppLayout";
import kyfLogo from "@/assets/kyf-logo.png";

const About = () => {
  return (
    <AppLayout>
      <div className="px-4 py-6 animate-fade-in">
        <h1 className="text-2xl font-display font-bold text-foreground mb-6 text-center">
          About Us
        </h1>

        {/* Logo */}
        <div className="flex justify-center items-center gap-6 mb-8 animate-slide-up">
          <img 
            src={kyfLogo} 
            alt="KYF Faisalabad Logo" 
            className="h-24 object-contain"
          />
        </div>

        {/* Description */}
        <div className="bg-card rounded-2xl p-6 prayer-card-shadow animate-slide-up" style={{ animationDelay: "100ms" }}>
          <h2 className="text-xl font-display font-semibold text-foreground mb-4 text-center">
            KYF Prayer Log
          </h2>
          
          <div className="space-y-4 text-foreground/85 leading-relaxed">
            <p>
              KYF Prayer Log is your dedicated spiritual companion designed to help you make the most 
              of the blessed month of Ramadan. Our mission is to support every Muslim in 
              maintaining their prayer obligations and spiritual practices during this sacred time.
            </p>
            
            <p>
              We understand the importance of consistency in worship. That's why we've created 
              an intuitive, easy-to-use application that helps you track your daily prayers, 
              supplications (Dua), and Quran recitation with minimal effort.
            </p>
            
            <p>
              Developed by KYF Faisalabad, this app is designed with love and care by a team of 
              dedicated Muslims who understand the challenges of maintaining spiritual routines 
              in today's busy world. We believe technology can be a powerful tool for spiritual 
              growth when used mindfully.
            </p>
            
            <p>
              Whether you're trying to improve your prayer consistency, track your Kaza prayers, 
              or simply want a gentle reminder to stay connected with your faith, KYF Prayer Log 
              is here to support you every step of the way.
            </p>
            
            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground italic">
                "The best of deeds is the prayer at its proper time." - Prophet Muhammad (PBUH)
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default About;
