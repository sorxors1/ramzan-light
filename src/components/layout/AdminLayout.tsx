import { ReactNode } from "react";
import AdminBottomNav from "./AdminBottomNav";
import kycLogo from "@/assets/kyc-logo.png";
import { Link } from "react-router-dom";

const AdminLayout = ({ children, title }: { children: ReactNode; title: string }) => {
  return (
    <div className="min-h-screen flex justify-center bg-muted">
      <div className="w-full max-w-md min-h-screen flex flex-col bg-background shadow-xl relative">
        {/* Admin Header */}
        <header
          className="sticky top-0 z-50 w-full shadow-md rounded-b-2xl"
          style={{
            background: "linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)",
          }}
        >
          <div className="flex h-16 items-center justify-between px-4">
            <Link to="/admin" className="flex items-center">
              <img src={kycLogo} alt="KYC" className="h-10 object-contain" />
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-amber-400 bg-amber-400/10 px-2 py-1 rounded-full">
                ADMIN
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 pb-24 px-4 pt-4">{children}</main>
        <AdminBottomNav />
      </div>
    </div>
  );
};

export default AdminLayout;
