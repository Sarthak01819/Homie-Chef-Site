import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 10;

    /* =========================
       FETCH ALL USERS
    ========================= */
    const fetchUsers = async () => {
        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/admin/users`,
                { credentials: "include" }
            );

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || "Failed to fetch users");
                return;
            }

            setUsers(Array.isArray(data) ? data : []);
        } catch {
            toast.error("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    /* =========================
       FILTER & SEARCH LOGIC
    ========================= */
    const filteredUsers = users.filter((user) => {
        const matchesSearch = searchTerm === "" ||
            user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesRole = roleFilter === "all" || user.role === roleFilter;

        return matchesSearch && matchesRole;
    });

    // Pagination
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    const startIndex = (currentPage - 1) * usersPerPage;
    const paginatedUsers = filteredUsers.slice(startIndex, startIndex + usersPerPage);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#119DA4] mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading users...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                    <p className="text-gray-600 mt-1">Manage user accounts and permissions</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>Total: {filteredUsers.length}</span>
                    <span>•</span>
                    <span>Page {currentPage} of {totalPages}</span>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#119DA4] focus:border-transparent"
                            />
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                🔍
                            </div>
                        </div>
                    </div>

                    {/* Role Filter */}
                    <div className="flex gap-2">
                        {[
                            { key: "all", label: "All Users", count: users.length },
                            { key: "user", label: "Customers", count: users.filter(u => u.role === "user").length },
                            { key: "admin", label: "Admins", count: users.filter(u => u.role === "admin").length }
                        ].map((f) => (
                            <button
                                key={f.key}
                                onClick={() => setRoleFilter(f.key)}
                                className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${roleFilter === f.key
                                        ? "bg-linear-to-br from-[#4B0C37] to-[#119DA4] text-white shadow-lg"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                            >
                                {f.label}
                                <span className={`px-2 py-0.5 rounded-full text-xs ${roleFilter === f.key ? 'bg-white/20' : 'bg-gray-200'
                                    }`}>
                                    {f.count}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Users Table */}
            {paginatedUsers.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">👥</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No users found</h3>
                    <p className="text-gray-600">Try adjusting your search or filter criteria</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-linear-to-br from-[#119DA4] to-[#FDE789] text-white">
                                <tr>
                                    <th className="px-6 py-4 text-left font-semibold">User</th>
                                    <th className="px-6 py-4 text-left font-semibold">Contact</th>
                                    <th className="px-6 py-4 text-left font-semibold">Role</th>
                                    <th className="px-6 py-4 text-left font-semibold">Status</th>
                                    <th className="px-6 py-4 text-left font-semibold">Joined</th>
                                    <th className="px-6 py-4 text-left font-semibold">Last Active</th>
                                </tr>
                            </thead>

                            <tbody>
                                {paginatedUsers.map((user, index) => (
                                    <tr key={user._id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                                        }`}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-linear-to-br from-[#119DA4] to-[#FDE789] rounded-full flex items-center justify-center text-white font-semibold">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{user.name}</p>
                                                    <p className="text-sm text-gray-600">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.phone ? (
                                                <span className="text-sm">+91 {user.phone}</span>
                                            ) : (
                                                <span className="text-sm text-gray-400">No phone</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.role === 'admin'
                                                    ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                                                }`}>
                                                {user.role === "admin" ? "Administrator" : "Customer"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                                Active
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                            <br />
                                            <span className="text-xs">{new Date(user.createdAt).toLocaleTimeString()}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(user.updatedAt || user.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                Showing {startIndex + 1} to {Math.min(startIndex + usersPerPage, filteredUsers.length)} of {filteredUsers.length} users
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <span className="px-3 py-1 text-sm font-medium text-gray-700">
                                    {currentPage} / {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
