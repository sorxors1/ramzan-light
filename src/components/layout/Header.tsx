import { Menu, User } from "lucide-react";
import { Link } from "react-router-dom";
import kyfHeaderLogo from "@/assets/kyf-header-logo.png";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

const Header = () => {
  const [open, setOpen] = useState(false);

  const menuItems = [
    { label: "Home", path: "/" },
    { label: "Mark Attendance", path: "/attendance" },
    { label: "Qaza", path: "/kaza" },
    { label: "Reports", path: "/reports" },
    { label: "About Us", path: "/about" },
    { label: "Contact Us", path: "/contact" },
  ];

  return (
    <header 
      className="sticky top-0 z-50 w-full shadow-md rounded-b-2xl"
      style={{
        background: "linear-gradient(135deg, #145C43 0%, #1E7F5C 50%, #28A070 100%)"
      }}
    >
      <div className="flex h-16 items-center justify-between px-4">
        {/* Hamburger Menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button className="p-2 text-primary-foreground hover:bg-primary/80 rounded-lg transition-colors">
              <Menu className="h-6 w-6" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 bg-background p-0">
            <div className="flex flex-col h-full">
              <div className="p-6 bg-primary">
                <img src={kyfHeaderLogo} alt="KYF Faisalabad" className="h-12 object-contain" />
              </div>
              <nav className="flex-1 py-4">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setOpen(false)}
                    className="flex items-center px-6 py-3 text-foreground hover:bg-accent transition-colors font-medium"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </SheetContent>
        </Sheet>

        {/* Center Logo */}
        <Link to="/home" className="flex items-center">
          <img src={kyfHeaderLogo} alt="KYF Faisalabad" className="h-12 object-contain" />
        </Link>

        {/* Profile Icon */}
        <Link 
          to="/profile" 
          className="p-2 text-primary-foreground hover:bg-primary/80 rounded-lg transition-colors"
        >
          <User className="h-6 w-6" />
        </Link>
      </div>
    </header>
  );
};

export default Header;
