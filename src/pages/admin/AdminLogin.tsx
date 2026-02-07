import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import kyfLogo from "@/assets/kyf-logo.png";
import { ArrowLeft } from "lucide-react";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await signIn(email, password);
      if (error) {
        toast.error(error.message);
        return;
      }

      // Check if user is admin
      const userId = data.user?.id;
      if (!userId) {
        toast.error("Authentication failed");
        return;
      }

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();

      if (!roleData) {
        // Not an admin - sign out
        await supabase.auth.signOut();
        toast.error("Access denied. Admin privileges required.");
        return;
      }

      toast.success("Welcome, Admin!");
      navigate("/admin");
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-between px-6 py-12"
      style={{
        background: "linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)",
      }}
    >
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm">
        <button
          onClick={() => navigate("/signin")}
          className="self-start mb-6 flex items-center gap-1 text-white/70 hover:text-white text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Sign In
        </button>

        <img
          src={kyfLogo}
          alt="KYF Faisalabad"
          className="w-40 h-auto object-contain mb-4 drop-shadow-lg"
        />

        <div className="bg-amber-400/10 border border-amber-400/30 rounded-xl px-4 py-2 mb-8">
          <span className="text-amber-400 text-xs font-bold">ADMINISTRATOR LOGIN</span>
        </div>

        <form onSubmit={handleLogin} className="w-full space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="h-12 rounded-xl bg-white border-0 text-gray-800 placeholder:text-gray-400 shadow-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="h-12 rounded-xl bg-white border-0 text-gray-800 placeholder:text-gray-400 shadow-lg"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 text-base font-semibold rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-lg mt-6"
          >
            {loading ? "Verifying..." : "Login as Admin"}
          </Button>
        </form>
      </div>

      <div className="text-center text-white/40 text-sm">
        <p>KYC Prayer Log — Admin Panel</p>
      </div>
    </div>
  );
};

export default AdminLogin;
