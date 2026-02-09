import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import kyfLogo from "@/assets/kyf-logo.png";

const SignIn = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Welcome back!");
        navigate("/home");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 animate-fade-in">
      <img 
        src={kyfLogo} 
        alt="KYF Faisalabad" 
        className="w-48 h-auto object-contain mb-8"
      />
      
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-display font-bold text-center text-foreground mb-2">
          Welcome Back
        </h1>
        <p className="text-center text-muted-foreground font-urdu mb-8">
          خوش آمدید
        </p>
        
        <form onSubmit={handleSignIn} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="h-12 rounded-xl bg-card border-border"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Password
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="h-12 rounded-xl bg-card border-border"
            />
          </div>
          
          <Button 
            type="submit"
            disabled={loading}
            className="w-full h-12 text-base font-semibold rounded-xl bg-secondary hover:bg-secondary/90 btn-shadow mt-6"
          >
            {loading ? "Signing In..." : "Sign In"}
          </Button>
        </form>
        
        <Link
          to="/admin/login"
          className="block text-center text-xs text-muted-foreground hover:text-foreground mt-8 underline underline-offset-4"
        >
          Login as Administrator
        </Link>
      </div>
    </div>
  );
};

export default SignIn;
