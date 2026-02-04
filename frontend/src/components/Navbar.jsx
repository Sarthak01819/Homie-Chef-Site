import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CalendarFold,
  Home,
  Menu,
  Salad,
  ShoppingCart,
  X,
  User,
  LogOut,
  History,
  BadgeCheck,
  Heart,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

const Navbar = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const closeAll = () => {
    setOpen(false);
    setDropdown(false);
  };

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      setUser(null);
      closeAll();
      navigate("/");
      setLoggingOut(false);
    }
  };

  const cartCount = user?.cart?.length || 0;
  const favouriteCount = user?.favourites?.length || 0;

  return (
    <motion.nav
      className="fixed top-0 left-0 w-full z-50 backdrop-blur-2xl border-b shadow-xl"
      style={{
        background: "var(--brand-wood-gradient)",
        borderColor: "rgba(15,23,42,0.08)",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* ================= DESKTOP BAR ================= */}
      <div className="max-w-7xl mx-auto w-full px-5 py-3 flex items-center">

        {/* ---------- LEFT : LOGO ---------- */}
        <div className="w-1/3 flex justify-start">
          <NavLink to="/" onClick={closeAll}>
            <img
              className="h-10 sm:h-12 w-auto"
              src="/images/logo3.png"
              alt="Homie Chef Logo"
            />
          </NavLink>
        </div>

        {/* ---------- CENTER : MAIN NAV ---------- */}
        <div className="hidden md:flex w-1/3 justify-center">
          <div className="flex gap-6 font-medium">
            <NavItem to="/" icon={<Home size={18} />} text="Home" />
            <NavItem to="/discover-meals" icon={<Salad size={18} />} text="Discover" />
            <NavItem to="/subscription" icon={<CalendarFold size={18} />} text="Subscription" />
            <NavItem to="/tracker" icon={<BadgeCheck size={18} />} text="Track" />
          </div>
        </div>

        {/* ---------- RIGHT : ACTIONS ---------- */}
        <div className="hidden md:flex w-1/3 justify-end items-center gap-4">

          {/* Cart */}
          <NavItem
            to="/cart"
            icon={
              <div className="relative">
                <ShoppingCart size={18} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 text-[10px] px-1.5 rounded-full font-semibold bg-green-500 text-white">
                    {cartCount}
                  </span>
                )}
              </div>
            }
            text=""
          />

          {/* Favourites */}
          {user && (
            <NavItem
              to="/favourites"
              icon={
                <div className="relative">
                  <Heart size={18} />
                  {favouriteCount > 0 && (
                    <span className="absolute -top-2 -right-2 text-[10px] px-1.5 rounded-full font-semibold bg-green-500 text-white">
                      {favouriteCount}
                    </span>
                  )}
                </div>
              }
              text=""
            />
          )}

          {/* Profile / Login */}
          {!user ? (
            <NavItem
              to="/login"
              icon={<ArrowRight size={18} />}
              text="Get Started"
              highlight
            />
          ) : (
            <div className="relative">
              <motion.button
                onClick={() => setDropdown((p) => !p)}
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 px-4 py-3 rounded-full text-white bg-white/20 hover:bg-white/30"
              >
                <User size={20} />
              </motion.button>

              {dropdown && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-xl border bg-white overflow-hidden">
                  <DropdownItem to="/profile" icon={<User size={16} />} text="Profile" onClick={closeAll} />
                  <DropdownItem to="/active-subscription" icon={<BadgeCheck size={16} />} text="My Subscription" onClick={closeAll} />
                  <DropdownItem to="/orders" icon={<History size={16} />} text="Order History" onClick={closeAll} />

                  <motion.button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    whileHover={{ scale: 1.04 }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 disabled:opacity-60"
                  >
                    <LogOut size={16} />
                    {loggingOut ? "Logging out..." : "Logout"}
                  </motion.button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ---------- MOBILE TOGGLE ---------- */}
        <motion.button
          onClick={() => setOpen((p) => !p)}
          whileHover={{ scale: 1.05 }}
          className="md:hidden ml-auto text-slate-900"
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </motion.button>
      </div>

      {/* ================= MOBILE MENU ================= */}
      {open && (
        <div className="md:hidden px-5 pb-4">
          <ul className="flex flex-col gap-3">
            <MobileItem to="/" text="Home" onClick={closeAll} />
            <MobileItem to="/discover-meals" text="Discover Meals" onClick={closeAll} />
            <MobileItem to="/subscription" text="Subscription" onClick={closeAll} />
            <MobileItem to="/cart" text={cartCount ? `Cart (${cartCount})` : "Cart"} onClick={closeAll} />

            {!user ? (
              <MobileItem to="/login" text="Get Started" highlight onClick={closeAll} />
            ) : (
              <>
                <MobileItem to="/profile" text="Profile" onClick={closeAll} />
                <MobileItem to="/active-subscription" text="My Subscription" onClick={closeAll} />
                <MobileItem to="/orders" text="Order History" onClick={closeAll} />
                <MobileItem to="/tracker" text="Track" onClick={closeAll} />
                <motion.button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  whileHover={{ scale: 1.04 }}
                  className="px-4 py-3 rounded-xl text-white font-medium disabled:opacity-60 bg-red-600 w-full mt-6"
                >
                  {loggingOut ? "Logging out..." : "Logout"}
                </motion.button>
              </>
            )}
          </ul>
        </div>
      )}
    </motion.nav>
  );
};

/* ---------- NAV ITEM ---------- */
const NavItem = ({ to, icon, text, highlight }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `relative px-4 py-2 rounded-xl shadow-xl bg-[#916743] flex items-center gap-2 transition-all cursor-pointer ${isActive || highlight ? "text-white" : "text-white/90"}`
    }
    style={({ isActive }) => (isActive || highlight ? { backgroundColor: "#000000" } : {})}
  >
    <span className="pointer-events-auto">{icon}</span>
    {text && <span className="pointer-events-auto">{text}</span>}
  </NavLink>
);

/* ---------- DROPDOWN ITEM ---------- */
const DropdownItem = ({ to, icon, text, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className="flex items-center gap-2 px-4 py-3 hover:bg-green-50 transition"
  >
    <span className="pointer-events-auto">{icon}</span>
    <span className="pointer-events-auto">{text}</span>
  </NavLink>
);

/* ---------- MOBILE ITEM ---------- */
const MobileItem = ({ to, text, highlight, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `px-4 py-3 rounded-xl transition shadow-xl ${isActive || highlight ? "text-white" : "text-white/90"}`
    }
    style={({ isActive }) => (isActive || highlight ? { backgroundColor: "#000000" } : {})}
  >
    <span className="pointer-events-auto">{text}</span>
  </NavLink>
);

export default Navbar;
