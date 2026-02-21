import { Users, BarChart3, LayoutDashboard, LogOut, FileText } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const AdminBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    toast.success("Logged out");
    navigate("/signin");
  };

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
    { icon: Users, label: "Users", path: "/admin/users" },
    { icon: BarChart3, label: "Stats", path: "/admin/stats" },
    { icon: FileText, label: "Reports", path: "/admin/reports" },
  ];

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] rounded-t-3xl"
      style={{
        background: "linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)",
      }}
    >
      <div className="flex items-center justify-around h-18 px-2 py-3">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center flex-1 h-full"
            >
              <div
                className={`flex flex-col items-center transition-colors rounded-xl px-3 py-2 ${
                  isActive ? "text-white bg-white/10" : "text-white/70"
                }`}
              >
                <item.icon className={`h-6 w-6 ${isActive ? "scale-110" : ""} transition-transform`} strokeWidth={2.5} />
                <span className="text-[10px] font-semibold mt-1">{item.label}</span>
              </div>
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center flex-1 h-full"
        >
          <div className="flex flex-col items-center transition-colors rounded-xl px-3 py-2 text-red-400">
            <LogOut className="h-6 w-6" strokeWidth={2.5} />
            <span className="text-[10px] font-semibold mt-1">Logout</span>
          </div>
        </button>
      </div>
    </nav>
  );
};

export default AdminBottomNav;
