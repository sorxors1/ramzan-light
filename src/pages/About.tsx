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
              Khawajagan Youth Forum (KYF) is a youth development platform working for the moral and spiritual upbringing of youngsters. It is a project of Markaz Umoor-e-Islami (regd) Fsd and is dedicated to promote Islamic values and character building of our community youngsters.
            </p>
            
            <p>
              This Ramadan Prayer Log App has been created to help children
            </p>

            <ul className="list-disc list-inside pl-2 space-y-1">
              <li>Girls (6–12 years) and</li>
              <li>Boys (9–14 years)</li>
            </ul>

            <p>
              develop the habit of offering all prayers on time and track their progress throughout the blessed month.
            </p>
            
            <p>
              After Ramadan, a Prize Distribution Ceremony will be organised to recognize and reward those children who successfully complete their prayer log with punctuality and dedication, encouraging them to continue this beautiful habit for life.
            </p>
            
            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground italic">
                "The best of deeds is the prayer at its proper time." - Prophet Muhammad (PBUH)
              </p>
            </div>
          </div>
        </div>

        {/* Branding */}
        <p className="text-center text-xs text-muted-foreground/50 mt-6 pb-2">
          Created with ❤️ by Team WhiteQ
        </p>
      </div>
    </AppLayout>
  );
};

export default About;
