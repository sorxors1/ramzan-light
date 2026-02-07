import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import kyfLogo from "@/assets/kyf-logo.png";

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    // TODO: Implement actual authentication
    setTimeout(() => {
      toast.error("Login functionality will be configured by administrator");
      setLoading(false);
    }, 1000);
  };

  const handleSkip = () => {
    navigate("/home");
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-between px-6 py-12"
      style={{
        background: "linear-gradient(135deg, #145C43 0%, #1E7F5C 50%, #28A070 100%)"
      }}
    >
      {/* Logo Section */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm">
        <img 
          src={kyfLogo} 
          alt="KYF Faisalabad" 
          className="w-48 h-auto object-contain mb-12 drop-shadow-lg"
        />
        
        {/* Login Form */}
        <form onSubmit={handleLogin} className="w-full space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">
              Username
            </label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="h-12 rounded-xl bg-white border-0 text-gray-800 placeholder:text-gray-400 shadow-lg focus:ring-2 focus:ring-white/50"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">
              Password
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="h-12 rounded-xl bg-white border-0 text-gray-800 placeholder:text-gray-400 shadow-lg focus:ring-2 focus:ring-white/50"
            />
          </div>
          
          <Button 
            type="submit"
            disabled={loading}
            className="w-full h-12 text-base font-semibold rounded-xl bg-white text-[#145C43] hover:bg-white/90 shadow-lg mt-6"
          >
            {loading ? "Signing In..." : "Sign In"}
          </Button>
          
          <Button 
            type="button"
            variant="ghost"
            onClick={handleSkip}
            className="w-full h-12 text-base font-medium rounded-xl text-white hover:bg-white/20 hover:text-white border border-white/30"
          >
            Skip for Now
          </Button>
        </form>
      </div>
      
      {/* Version Info */}
      <div className="text-center text-white/60 text-sm">
        <p>KYC Prayer Log</p>
        <p className="text-xs mt-1">Version 1.0.0</p>
        <Link to="/admin/login" className="block text-xs mt-3 text-white/40 underline underline-offset-4 hover:text-white/70">
          Login as Administrator
        </Link>
      </div>
    </div>
  );
};

export default Login;
