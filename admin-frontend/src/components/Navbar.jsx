import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
    BarChart3,
    ShoppingBag,
    Users,
    LogOut,
    Menu,
    X,
} from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext";

const Navbar = () => {
    const { setAdmin } = useAdminAuth();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
                method: "POST",
                credentials: "include",
            });
        } catch (err) {
            console.error("Logout failed", err);
        } finally {
            setAdmin(null);
            navigate("/login");
        }
    };

    const closeMenu = () => setOpen(false);

    return (
        <nav className="bg-linear-to-br from-[#119DA4] via-[#FDE789] to-[#4B0C37] shadow-xl border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20">
                    <div className="flex items-center">
                        <div className="shrink-0 flex items-center space-x-3">
                            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                <BarChart3 className="h-6 w-6 text-white" />
                            </div>
                            <h1 className="text-white text-2xl font-bold tracking-tight">Homie Chef</h1>
                            <span className="text-white/80 text-sm font-medium">Admin</span>
                        </div>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-2">
                        <NavLink
                            to="/"
                            className={({ isActive }) =>
                                `flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive
                                    ? "bg-white/25 text-white shadow-lg backdrop-blur-sm"
                                    : "text-white/90 hover:bg-white/15 hover:text-white hover:shadow-md"
                                }`
                            }
                        >
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Dashboard
                        </NavLink>

                        <NavLink
                            to="/orders"
                            className={({ isActive }) =>
                                `flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive
                                    ? "bg-white/25 text-white shadow-lg backdrop-blur-sm"
                                    : "text-white/90 hover:bg-white/15 hover:text-white hover:shadow-md"
                                }`
                            }
                        >
                            <ShoppingBag className="h-4 w-4 mr-2" />
                            Orders
                        </NavLink>

                        <NavLink
                            to="/users"
                            className={({ isActive }) =>
                                `flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive
                                    ? "bg-white/25 text-white shadow-lg backdrop-blur-sm"
                                    : "text-white/90 hover:bg-white/15 hover:text-white hover:shadow-md"
                                }`
                            }
                        >
                            <Users className="h-4 w-4 mr-2" />
                            Users
                        </NavLink>

                        <div className="h-6 w-px bg-white/30 mx-2"></div>

                        <button
                            onClick={handleLogout}
                            className="flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold text-white/90 hover:bg-red-500/20 hover:text-red-100 transition-all duration-200 hover:shadow-md"
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                        </button>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setOpen(!open)}
                            className="text-white hover:bg-white/15 p-3 rounded-xl transition-all duration-200 hover:shadow-md"
                        >
                            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {open && (
                <div className="md:hidden bg-linear-to-br from-[#119DA4]/95 via-[#FDE789]/95 to-[#4B0C37]/95 backdrop-blur-xl border-t border-white/10">
                    <div className="px-4 pt-4 pb-6 space-y-2">
                        <NavLink
                            to="/"
                            onClick={closeMenu}
                            className={({ isActive }) =>
                                `flex items-center px-4 py-3 rounded-xl text-base font-semibold transition-all duration-200 ${isActive
                                    ? "bg-white/25 text-white shadow-lg"
                                    : "text-white/90 hover:bg-white/15 hover:text-white"
                                }`
                            }
                        >
                            <BarChart3 className="h-5 w-5 mr-3" />
                            Dashboard
                        </NavLink>

                        <NavLink
                            to="/orders"
                            onClick={closeMenu}
                            className={({ isActive }) =>
                                `flex items-center px-4 py-3 rounded-xl text-base font-semibold transition-all duration-200 ${isActive
                                    ? "bg-white/25 text-white shadow-lg"
                                    : "text-white/90 hover:bg-white/15 hover:text-white"
                                }`
                            }
                        >
                            <ShoppingBag className="h-5 w-5 mr-3" />
                            Orders
                        </NavLink>

                        <NavLink
                            to="/users"
                            onClick={closeMenu}
                            className={({ isActive }) =>
                                `flex items-center px-4 py-3 rounded-xl text-base font-semibold transition-all duration-200 ${isActive
                                    ? "bg-white/25 text-white shadow-lg"
                                    : "text-white/90 hover:bg-white/15 hover:text-white"
                                }`
                            }
                        >
                            <Users className="h-5 w-5 mr-3" />
                            Users
                        </NavLink>

                        <div className="h-px bg-white/20 my-3"></div>

                        <button
                            onClick={() => {
                                handleLogout();
                                closeMenu();
                            }}
                            className="flex items-center w-full text-left px-4 py-3 rounded-xl text-base font-semibold text-red-100 hover:bg-red-500/20 hover:text-red-50 transition-all duration-200"
                        >
                            <LogOut className="h-5 w-5 mr-3" />
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;