import { useAuth } from "@/hooks/useAuth";
import { useDisqualification } from "@/hooks/useDisqualification";
import { useAdmin } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { LogOut, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DisqualificationOverlay = () => {
  const { user, isAuthenticated, signOut } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { data: isDisqualified } = useDisqualification(user?.id);
  const navigate = useNavigate();

  if (!isAuthenticated || adminLoading || isAdmin || !isDisqualified) return null;

  const handleLogout = async () => {
    await signOut();
    navigate("/signin");
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-destructive/50 rounded-2xl p-8 mx-6 max-w-sm w-full shadow-2xl text-center">
        <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8 text-destructive" />
        </div>
        
        <h2 className="text-2xl font-display font-bold text-destructive mb-2">
          Disqualified
        </h2>
        <p className="text-lg font-urdu text-destructive/80 mb-4">
          نااہل
        </p>
        
        <p className="text-sm text-muted-foreground mb-2">
          You have missed 5 or more prayers within a 7-day period, which does not meet the criteria for continuation in this program.
        </p>
        <p className="text-sm font-urdu text-muted-foreground mb-6">
          آپ نے 7 دنوں میں 5 یا اس سے زیادہ نمازیں چھوڑ دی ہیں، جو اس پروگرام میں جاری رہنے کے معیار پر پورا نہیں اترتا۔
        </p>

        <Button
          onClick={handleLogout}
          variant="destructive"
          className="w-full h-12 text-base font-semibold rounded-xl"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Log Out | لاگ آؤٹ
        </Button>
      </div>
    </div>
  );
};

export default DisqualificationOverlay;
