import { useEffect, useState } from "react";
import { Users, ShoppingBag, IndianRupee, Calendar, TrendingUp, Activity, Zap, Award, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import StatCard from "../components/StatCard.jsx";
import { useAdminRealtime } from "../context/AdminRealtimeContext";
import AdminActivityFeed from "../components/AdminActivityFeed";


// const StatCard = ({ icon, label, value, trend, color, delay = 0 }) => (
//     <div className={`bg-linear-to-br ${color} rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden group hover:shadow-3xl hover:scale-105 transition-all duration-500 hover:-translate-y-2 animate-fade-in-up`} style={{ animationDelay: `${delay}ms` }}>
//         {/* Animated Background Shapes */}
//         <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700"></div>
//         <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12 group-hover:scale-125 transition-transform duration-700 delay-100"></div>

//         {/* Floating Particles */}
//         <div className="absolute top-4 right-4 w-2 h-2 bg-white/30 rounded-full animate-bounce delay-300"></div>
//         <div className="absolute top-8 right-8 w-1 h-1 bg-white/20 rounded-full animate-bounce delay-500"></div>
//         <div className="absolute bottom-6 left-6 w-1.5 h-1.5 bg-white/25 rounded-full animate-bounce delay-700"></div>

//         <div className="relative z-10">
//             <div className="flex items-center justify-between mb-6">
//                 <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-all duration-300 group-hover:scale-110">
//                     {icon}
//                 </div>
//                 {trend && (
//                     <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm ${trend > 0 ? 'bg-green-500/20 text-green-100 border border-green-400/30' : 'bg-red-500/20 text-red-100 border border-red-400/30'
//                         }`}>
//                         <TrendingUp className="w-3 h-3" />
//                         {trend > 0 ? '+' : ''}{trend}%
//                     </div>
//                 )}
//             </div>
//             <div>
//                 <p className="text-sm font-medium text-white/80 mb-2 uppercase tracking-wider">{label}</p>
//                 <p className="text-4xl font-black mb-1 group-hover:scale-110 transition-transform duration-300">{value}</p>
//                 <div className="w-12 h-1 bg-white/30 rounded-full group-hover:w-20 transition-all duration-500"></div>
//             </div>
//         </div>
//     </div>
// );

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState(null);
const { stats: liveStats } = useAdminRealtime();

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL}/admin/analytics`, {
            credentials: "include",
        })
            .then((r) => r.json())
            .then(setAnalytics)
            .catch(() => setAnalytics(null));
    }, []);

    const s = analytics?.summary;

    const fetchStats = async () => {
        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/admin/stats`,
                { credentials: "include" }
            );

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || "Failed to load stats");
                return;
            }

            setStats(data);
        } catch {
            toast.error("Failed to load dashboard stats");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#119DA4] mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-32 h-32 bg-linear-to-br from-[#119DA4]/20 to-[#FDE789]/20 rounded-full blur-xl animate-float"></div>
                <div className="absolute top-40 right-20 w-24 h-24 bg-linear-to-br from-[#4B0C37]/15 to-[#119DA4]/15 rounded-full blur-lg animate-float-delayed"></div>
                <div className="absolute bottom-40 left-1/4 w-20 h-20 bg-linear-to-br from-[#FDE789]/25 to-[#4B0C37]/25 rounded-full blur-md animate-float-slow"></div>
                <div className="absolute top-1/3 right-10 w-16 h-16 bg-linear-to-br from-[#119DA4]/30 to-[#FDE789]/30 rounded-full blur-sm animate-pulse"></div>
            </div>

            <div className="relative space-y-12">
                {/* Enhanced Welcome Header */}
                <div className="text-center py-12 relative">
                    <div className="absolute inset-0 bg-linear-to-br from-[#119DA4]/5 via-transparent to-[#FDE789]/5 rounded-3xl blur-3xl"></div>
                    <div className="relative">
                        <div className="inline-block">
                            <h1 className="text-5xl md:text-6xl font-bold bg-linear-to-br from-[#119DA4] via-[#4B0C37] to-[#FDE789] bg-clip-text text-transparent mb-4 animate-fade-in-up">
                                Welcome back, Admin!
                            </h1>
                            <div className="w-full h-1 bg-linear-to-br from-[#119DA4] to-[#FDE789] rounded-full animate-scale-in"></div>
                        </div>
                        <p className="text-xl text-gray-600 mt-6 animate-fade-in-up-delayed max-w-2xl mx-auto leading-relaxed">
                            Here's what's happening with your restaurant today. Stay on top of orders, users, and performance metrics.
                        </p>
                        <div className="flex justify-center mt-8 space-x-4">
                            <div className="w-3 h-3 bg-[#119DA4] rounded-full animate-bounce"></div>
                            <div className="w-3 h-3 bg-[#FDE789] rounded-full animate-bounce-delayed"></div>
                            <div className="w-3 h-3 bg-[#4B0C37] rounded-full animate-bounce-slow"></div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    <StatCard label="Total Users" value={s?.totalUsers ?? 0} />
                    <StatCard label="Active Subs" value={s?.activeSubscriptions ?? 0} />
                    <StatCard label="Orders Today" value={s?.ordersToday ?? 0} />
                    <StatCard label="Revenue Today" value={`₹${s?.revenueToday ?? 0}`} />

                    <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                        <StatCard
                            icon={<Calendar size={24} />}
                            label="Active Subscriptions"
                            value={stats?.activeSubscriptions ?? 0}
                            trend={-2}
                            color="from-orange-500 to-orange-600"   
                        />
                    </div>
                </div>

                {/* Enhanced Quick Actions */}
                <div className="relative">
                    <div className="absolute inset-0 bg-linear-to-br from-[#119DA4]/5 via-[#FDE789]/5 to-[#4B0C37]/5 rounded-3xl blur-2xl"></div>
                    <div className="relative bg-linear-to-br from-white/80 to-gray-50/80 backdrop-blur-sm rounded-3xl p-10 border border-white/20 shadow-xl">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold bg-linear-to-br from-[#119DA4] to-[#4B0C37] bg-clip-text text-transparent mb-2">Quick Actions</h2>
                            <p className="text-gray-600">Access frequently used features and manage your restaurant efficiently</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                                <a
                                    href="/orders"
                                    className="group relative flex items-center p-6 bg-white/90 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 border border-gray-100/50 hover:border-[#119DA4]/30 overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-linear-to-br from-[#4B0C37]/5 to-[#119DA4]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <div className="relative p-4 bg-linear-to-br from-[#4B0C37] to-[#119DA4] rounded-xl mr-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                                        <ShoppingBag className="h-7 w-7 text-white" />
                                    </div>
                                    <div className="relative flex-1">
                                        <h3 className="font-bold text-gray-900 mb-1 group-hover:text-[#119DA4] transition-colors">Manage Orders</h3>
                                        <p className="text-sm text-gray-600 leading-relaxed">View and process customer orders with real-time updates</p>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-[#119DA4] group-hover:translate-x-1 transition-all duration-300" />
                                </a>
                            </div>

                            <div className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                                <a
                                    href="/users"
                                    className="group relative flex items-center p-6 bg-white/90 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 border border-gray-100/50 hover:border-[#FDE789]/30 overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-linear-to-br from-[#119DA4]/5 to-[#FDE789]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <div className="relative p-4 bg-linear-to-br from-[#119DA4] to-[#FDE789] rounded-xl mr-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                                        <Users className="h-7 w-7 text-white" />
                                    </div>
                                    <div className="relative flex-1">
                                        <h3 className="font-bold text-gray-900 mb-1 group-hover:text-[#119DA4] transition-colors">User Management</h3>
                                        <p className="text-sm text-gray-600 leading-relaxed">Manage user accounts, profiles, and permissions</p>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-[#119DA4] group-hover:translate-x-1 transition-all duration-300" />
                                </a>
                            </div>

                            <div className="animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
                                <a
                                    href="/admin/audit-logs"
                                    className="group relative flex items-center p-6 bg-white/90 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 border border-gray-100/50 hover:border-[#4B0C37]/30 overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-linear-to-br from-[#4B0C37]/5 to-[#FDE789]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <div className="relative p-4 bg-linear-to-br from-[#4B0C37] to-[#FDE789] rounded-xl mr-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                                        <Calendar className="h-7 w-7 text-white" />
                                    </div>
                                    <div className="relative flex-1">
                                        <h3 className="font-bold text-gray-900 mb-1 group-hover:text-[#4B0C37] transition-colors">Audit Logs</h3>
                                        <p className="text-sm text-gray-600 leading-relaxed">View system activity, logs, and security events</p>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-[#4B0C37] group-hover:translate-x-1 transition-all duration-300" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Recent Activity */}
                <div className="relative animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
                    <div className="absolute inset-0 bg-linear-to-br from-[#FDE789]/5 via-[#119DA4]/5 to-[#4B0C37]/5 rounded-3xl blur-2xl"></div>
                    <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-10 shadow-xl border border-white/20">
                        <div className="flex items-center mb-8">
                            <div className="p-3 bg-linear-to-br from-[#119DA4] to-[#FDE789] rounded-xl mr-4 shadow-lg">
                                <Activity className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold bg-linear-to-br from-[#119DA4] to-[#4B0C37] bg-clip-text text-transparent">Recent Activity</h2>
                                <p className="text-gray-600">Latest updates and system events</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="group flex items-center p-6 bg-linear-to-br from-green-50 to-green-100/50 rounded-2xl border border-green-200/50 hover:shadow-lg transition-all duration-300 hover:scale-102">
                                <div className="w-3 h-3 bg-green-500 rounded-full mr-6 animate-pulse shadow-lg shadow-green-500/50"></div>
                                <div className="flex-1">
                                    <p className="text-base font-semibold text-gray-900 group-hover:text-green-800 transition-colors">New order received</p>
                                    <p className="text-sm text-gray-600 mt-1">Order #12345 • ₹299 • John Doe</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500">2 minutes ago</p>
                                    <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full mt-1">Processing</span>
                                </div>
                            </div>

                            <div className="group flex items-center p-6 bg-linear-to-br from-blue-50 to-blue-100/50 rounded-2xl border border-blue-200/50 hover:shadow-lg transition-all duration-300 hover:scale-102">
                                <div className="w-3 h-3 bg-blue-500 rounded-full mr-6 animate-pulse shadow-lg shadow-blue-500/50"></div>
                                <div className="flex-1">
                                    <p className="text-base font-semibold text-gray-900 group-hover:text-blue-800 transition-colors">New user registered</p>
                                    <p className="text-sm text-gray-600 mt-1">sarah.johnson@email.com • Premium Plan</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500">15 minutes ago</p>
                                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full mt-1">Verified</span>
                                </div>
                            </div>

                            <div className="group flex items-center p-6 bg-linear-to-br from-orange-50 to-orange-100/50 rounded-2xl border border-orange-200/50 hover:shadow-lg transition-all duration-300 hover:scale-102">
                                <div className="w-3 h-3 bg-orange-500 rounded-full mr-6 animate-pulse shadow-lg shadow-orange-500/50"></div>
                                <div className="flex-1">
                                    <p className="text-base font-semibold text-gray-900 group-hover:text-orange-800 transition-colors">Subscription renewed</p>
                                    <p className="text-sm text-gray-600 mt-1">Monthly Plan • Auto-renewal • ₹999</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500">1 hour ago</p>
                                    <span className="inline-block px-3 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full mt-1">Active</span>
                                </div>
                            </div>

                            <div className="group flex items-center p-6 bg-linear-to-br from-purple-50 to-purple-100/50 rounded-2xl border border-purple-200/50 hover:shadow-lg transition-all duration-300 hover:scale-102">
                                <div className="w-3 h-3 bg-purple-500 rounded-full mr-6 animate-pulse shadow-lg shadow-purple-500/50"></div>
                                <div className="flex-1">
                                    <p className="text-base font-semibold text-gray-900 group-hover:text-purple-800 transition-colors">Payment processed</p>
                                    <p className="text-sm text-gray-600 mt-1">Transaction ID: TXN_789456 • ₹1499</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500">2 hours ago</p>
                                    <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full mt-1">Completed</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
