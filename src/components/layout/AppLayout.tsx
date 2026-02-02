import { ReactNode } from "react";
import Header from "./Header";
import BottomNav from "./BottomNav";

interface AppLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showNav?: boolean;
}

const AppLayout = ({ children, showHeader = true, showNav = true }: AppLayoutProps) => {
  return (
    <div className="min-h-screen flex justify-center bg-muted">
      <div className="w-full max-w-md min-h-screen flex flex-col bg-background shadow-xl relative">
        {showHeader && <Header />}
        <main className={`flex-1 ${showNav ? "pb-20" : ""}`}>
          {children}
        </main>
        {showNav && <BottomNav />}
      </div>
    </div>
  );
};

export default AppLayout;
