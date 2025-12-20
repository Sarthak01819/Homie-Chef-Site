import {
  ArrowRight,
  CalendarFold,
  History,
  Home,
  Menu,
  ShoppingCart,
  X,
} from "lucide-react";
import React, { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/20 backdrop-blur-md border-b border-white/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-5 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link to="/">
          <img
            className="h-10 sm:h-12 w-auto"
            src="src/assets/removed-bg-logo.png"
            alt="Logo"
          />
        </Link>

        {/* Desktop Menu */}
        <ul className="hidden md:flex gap-4 text-black/80 font-medium">
          <NavItem to="/" icon={<Home className="w-5 h-5" />} text="Home" />
          <NavItem
            to="/history"
            icon={<History className="w-5 h-5" />}
            text="Meal History"
          />
          <NavItem
            to="/subscription"
            icon={<CalendarFold className="w-5 h-5" />}
            text="Subscription"
          />
          <NavItem
            to="/cart"
            icon={<ShoppingCart className="w-5 h-5" />}
            text="Cart"
          />
          <NavItem
            to="/login"
            icon={<ArrowRight className="w-5 h-5" />}
            text="Get Started"
            highlight
          />
        </ul>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-black/80"
        >
          {open ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {open && (
        <div className="md:hidden px-5 pb-4">
          <ul className="flex flex-col gap-3 text-black/80 font-medium">
            <MobileItem to="/" text="Home" />
            <MobileItem to="/history" text="Meal History" />
            <MobileItem to="/subscription" text="Subscription" />
            <MobileItem to="/cart" text="Cart" />
            <MobileItem to="/login" text="Get Started" highlight />
          </ul>
        </div>
      )}
    </nav>
  );
};

const NavItem = ({ to, icon, text, highlight }) => (
  <Link
    to={to}
    className={`px-4 py-2 rounded-xl flex items-center gap-2 border border-black/10 transition-all
      ${highlight
        ? "bg-black/85 text-white hover:bg-white hover:text-black"
        : "hover:bg-black/85 hover:text-white"
      }`}
  >
    {icon}
    {text}
  </Link>
);

const MobileItem = ({ to, text, highlight }) => (
  <Link
    to={to}
    className={`px-4 py-3 rounded-xl border border-black/10 transition-all
      ${highlight
        ? "bg-black/85 text-white"
        : "hover:bg-black/85 hover:text-white"
      }`}
  >
    {text}
  </Link>
);

export default Navbar;
