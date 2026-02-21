import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { LogOut, Moon } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RAMADAN_END_DATE = new Date("2026-03-21T00:00:00");

const RamadanEndedOverlay = () => {
  const { isAuthenticated, signOut } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const navigate = useNavigate();

  const now = new Date();
  const isRamadanOver = now >= RAMADAN_END_DATE;

  if (!isAuthenticated || adminLoading || isAdmin || !isRamadanOver) return null;

  const handleLogout = async () => {
    await signOut();
    navigate("/signin");
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-primary/30 rounded-2xl p-8 mx-6 max-w-sm w-full shadow-2xl text-center">
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
          <Moon className="w-8 h-8 text-primary" />
        </div>

        <h2 className="text-2xl font-display font-bold text-primary mb-2">
          Ramadan Kareem 2026 Has Ended
        </h2>
        <p className="text-lg font-urdu text-primary/80 mb-4">
          رمضان کریم ۲۰۲۶ ختم ہو گیا
        </p>

        <p className="text-sm text-muted-foreground mb-2">
          Thank you for your good deeds. May Allah accept your prayers and bless you abundantly.
        </p>
        <p className="text-sm font-urdu text-muted-foreground mb-6">
          آپ کی نیکیوں کا شکریہ۔ اللہ تعالیٰ آپ کی نمازیں قبول فرمائے اور آپ پر بے پناہ رحمتیں نازل فرمائے۔
        </p>

        <Button
          onClick={handleLogout}
          variant="default"
          className="w-full h-12 text-base font-semibold rounded-xl"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Log Out | لاگ آؤٹ
        </Button>
      </div>
    </div>
  );
};

export default RamadanEndedOverlay;
