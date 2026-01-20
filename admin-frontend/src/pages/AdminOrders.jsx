import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const ordersPerPage = 10;

    /* =========================
       FETCH ALL ORDERS
    ========================= */
    const fetchOrders = async () => {
        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/admin/orders`,
                { credentials: "include" }
            );

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || "Failed to fetch orders");
                return;
            }

            setOrders(Array.isArray(data) ? data : []);
        } catch {
            toast.error("Failed to fetch orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    /* =========================
       FILTER & SEARCH LOGIC
    ========================= */
    const filteredOrders = orders.filter((order) => {
        const matchesFilter = filter === "all" ||
            (filter === "meal" && order.type === "meal") ||
            (filter === "subscription" && order.type === "subscription") ||
            (filter === "refunded" && order.status === "refunded");

        const matchesSearch = searchTerm === "" ||
            order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order._id?.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesFilter && matchesSearch;
    });

    // Pagination
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
    const startIndex = (currentPage - 1) * ordersPerPage;
    const paginatedOrders = filteredOrders.slice(startIndex, startIndex + ordersPerPage);

    /* =========================
       CANCEL MEAL ORDER (ADMIN)
    ========================= */
    const cancelOrder = async (orderId) => {
        const confirm = window.confirm(
            "Are you sure you want to cancel this order?"
        );
        if (!confirm) return;

        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/orders/${orderId}/cancel`,
                {
                    method: "POST",
                    credentials: "include",
                }
            );

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || "Cancellation failed");
                return;
            }

            toast.success(
                data.refundAmount
                    ? `Refunded ₹${data.refundAmount}`
                    : "Order cancelled"
            );

            fetchOrders();
        } catch {
            toast.error("Cancellation failed");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#119DA4] mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
                    <p className="text-gray-600 mt-1">Manage and track all customer orders</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>Total: {filteredOrders.length}</span>
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
                                placeholder="Search by name, email, or order ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#119DA4] focus:border-transparent"
                            />
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                🔍
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-2">
                        {[
                            { key: "all", label: "All Orders", count: orders.length },
                            { key: "meal", label: "Meals", count: orders.filter(o => o.type === "meal").length },
                            { key: "subscription", label: "Subscriptions", count: orders.filter(o => o.type === "subscription").length },
                            { key: "refunded", label: "Refunded", count: orders.filter(o => o.status === "refunded").length }
                        ].map((f) => (
                            <button
                                key={f.key}
                                onClick={() => setFilter(f.key)}
                                className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${filter === f.key
                                        ? "bg-linear-to-br from-[#4B0C37] to-[#119DA4] text-white shadow-lg"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                            >
                                {f.label}
                                <span className={`px-2 py-0.5 rounded-full text-xs ${filter === f.key ? 'bg-white/20' : 'bg-gray-200'
                                    }`}>
                                    {f.count}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            {paginatedOrders.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">📦</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
                    <p className="text-gray-600">Try adjusting your search or filter criteria</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-linear-to-br from-[#119DA4] to-[#FDE789] text-white">
                                <tr>
                                    <th className="px-6 py-4 text-left font-semibold">Order ID</th>
                                    <th className="px-6 py-4 text-left font-semibold">Customer</th>
                                    <th className="px-6 py-4 text-left font-semibold">Contact</th>
                                    <th className="px-6 py-4 text-left font-semibold">Type</th>
                                    <th className="px-6 py-4 text-left font-semibold">Amount</th>
                                    <th className="px-6 py-4 text-left font-semibold">Status</th>
                                    <th className="px-6 py-4 text-left font-semibold">Date</th>
                                    <th className="px-6 py-4 text-left font-semibold">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {paginatedOrders.map((order, index) => (
                                    <tr key={order._id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                                        }`}>
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-sm text-gray-600">#{order._id.slice(-8)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-gray-900">{order.user?.name}</p>
                                                <p className="text-sm text-gray-600">{order.user?.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {order.user?.phone ? `+91 ${order.user.phone}` : "—"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${order.type === 'meal' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                                                }`}>
                                                {order.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-semibold text-lg text-gray-900">₹{order.amountPaid}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${order.status === 'paid' ? 'bg-green-100 text-green-800' :
                                                    order.status === 'refunded' ? 'bg-red-100 text-red-800' :
                                                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-gray-100 text-gray-800'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                            <br />
                                            <span className="text-xs">{new Date(order.createdAt).toLocaleTimeString()}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {order.type === "meal" && order.status === "paid" && (
                                                <button
                                                    onClick={() => cancelOrder(order._id)}
                                                    className="px-4 py-2 bg-linear-to-br from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 text-sm font-medium shadow-sm hover:shadow-md"
                                                >
                                                    Cancel Order
                                                </button>
                                            )}
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
                                Showing {startIndex + 1} to {Math.min(startIndex + ordersPerPage, filteredOrders.length)} of {filteredOrders.length} orders
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

export default AdminOrders;
