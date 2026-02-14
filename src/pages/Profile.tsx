import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { useSavedAccounts, SavedAccount } from "@/hooks/useSavedAccounts";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogOut, User, Mail, Calendar, X, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const Profile = () => {
  const { user, isAuthenticated, signOut, switchToAccount } = useAuth();
  const { getOtherAccounts, removeAccount, saveAccount } = useSavedAccounts();
  const navigate = useNavigate();
  const [switchingTo, setSwitchingTo] = useState<string | null>(null);

  const otherAccounts: SavedAccount[] = user ? getOtherAccounts(user.id) : [];

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error("Failed to sign out");
    } else {
      toast.success("Signed out successfully");
      navigate("/signin");
    }
  };

  if (!isAuthenticated) {
    return (
      <AppLayout>
        <div className="px-4 py-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <Link to="/home" className="p-2 rounded-lg hover:bg-accent transition-colors">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </Link>
            <h1 className="text-2xl font-display font-bold text-foreground">
              Profile
            </h1>
          </div>

          <div className="bg-primary/10 border border-primary/30 rounded-xl p-6 text-center">
            <User className="w-16 h-16 mx-auto text-primary/50 mb-4" />
            <p className="text-foreground mb-4">
              Sign in to view your profile
            </p>
            <p className="text-muted-foreground font-urdu mb-4">
              اپنا پروفائل دیکھنے کے لیے سائن ان کریں
            </p>
            <Link 
              to="/signin" 
              className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded-xl font-medium"
            >
              Sign In
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="px-4 py-6 animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/home" className="p-2 rounded-lg hover:bg-accent transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              Profile
            </h1>
            <p className="text-sm font-urdu text-muted-foreground">پروفائل</p>
          </div>
        </div>

        {/* User Info Card */}
        <div className="bg-card rounded-2xl p-6 prayer-card-shadow mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Ramadan Tracker
              </h2>
              <p className="text-sm text-muted-foreground">Your spiritual journey</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-accent rounded-xl">
              <Mail className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium text-foreground">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-accent rounded-xl">
              <Calendar className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Member Since</p>
                <p className="text-sm font-medium text-foreground">
                  {user?.created_at 
                    ? new Date(user.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Switch Account Section */}
        {otherAccounts.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Switch Account
            </h3>
            <div className="space-y-2">
              {otherAccounts.map((account) => (
                <div
                  key={account.userId}
                  className="flex items-center justify-between bg-card rounded-xl p-4 prayer-card-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-medium text-foreground">{account.username}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={switchingTo === account.userId}
                      onClick={async () => {
                        setSwitchingTo(account.userId);
                        const { error } = await switchToAccount(account.accessToken, account.refreshToken);
                        if (error) {
                          toast.error("Session expired. Please log in again.");
                          removeAccount(account.userId);
                        } else {
                          toast.success(`Switched to ${account.username}`);
                          navigate("/home");
                        }
                        setSwitchingTo(null);
                      }}
                    >
                      {switchingTo === account.userId ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : (
                        "Switch"
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => {
                        removeAccount(account.userId);
                        toast.success(`Removed ${account.username}`);
                        // Force re-render
                        navigate("/profile", { replace: true });
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="space-y-3 mb-6">
          <Link 
            to="/reports" 
            className="block bg-card rounded-xl p-4 prayer-card-shadow hover:bg-accent transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-foreground">View Statistics</span>
              <span className="text-muted-foreground">→</span>
            </div>
          </Link>
          
          <Link 
            to="/attendance" 
            className="block bg-card rounded-xl p-4 prayer-card-shadow hover:bg-accent transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-foreground">Mark Attendance</span>
              <span className="text-muted-foreground">→</span>
            </div>
          </Link>
        </div>

        {/* Sign Out Button */}
        <Button
          onClick={handleSignOut}
          variant="outline"
          className="w-full h-12 rounded-xl border-destructive text-destructive hover:bg-destructive/10"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </AppLayout>
  );
};

export default Profile;
