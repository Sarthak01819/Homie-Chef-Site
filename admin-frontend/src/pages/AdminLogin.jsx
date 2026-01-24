import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAdminAuth } from "../context/AdminAuthContext";
import { Shield, Mail, Lock, Eye, EyeOff } from "lucide-react";

const AdminLogin = () => {
    const { setAdmin } = useAdminAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const login = async () => {
        if (!email || !password || loading) return;

        setLoading(true);
        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/auth/admin/login`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ email, password }),
                }
            );

            const data = await res.json();

            if (!res.ok || data.role !== "admin") {
                toast.error("Admin access only");
                return;
            }

            setAdmin(data);
            toast.success("Admin login successful");
            navigate("/");
        } catch {
            toast.error("Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo/Brand Section */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-linear-to-br from-[#119DA4] to-[#4B0C37] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Shield className="h-10 w-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Homie Chef</h1>
                    <p className="text-gray-600">Admin Portal</p>
                </div>

                {/* Login Card */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                        <p className="text-gray-600">Sign in to access your admin dashboard</p>
                    </div>

                    <form onSubmit={(e) => { e.preventDefault(); login(); }} className="space-y-6">
                        {/* Email Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    placeholder="admin@homiechef.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#119DA4] focus:border-transparent transition-all duration-300 bg-gray-50/50"
                                    required
                                />
                                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#119DA4] focus:border-transparent transition-all duration-300 bg-gray-50/50"
                                    required
                                />
                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-linear-to-br from-[#4B0C37] to-[#119DA4] text-white rounded-xl hover:from-[#119DA4] hover:to-[#4B0C37] transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Signing In...
                                </>
                            ) : (
                                <>
                                    <Shield className="h-5 w-5" />
                                    Sign In
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                        <p className="text-sm text-gray-600">
                            Secure admin access only.
                            <br />
                            Contact support if you need assistance.
                        </p>
                    </div>
                </div>

                {/* Background Pattern */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-linear-to-br from-[#119DA4]/10 to-[#4B0C37]/10 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-linear-to-br from-[#FDE789]/10 to-[#119DA4]/10 rounded-full blur-3xl"></div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
