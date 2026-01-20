import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  CalendarDays,
  RefreshCcw,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import Skeleton from "../components/Skeleton";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import { apiFetch } from "../services/api";

const OrderHistory = () => {
  /* =========================
     ALL HOOKS FIRST (CRITICAL)
  ========================= */
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [cancellingId, setCancellingId] = useState(null);
  const [error, setError] = useState(null);

  /* =========================
     FETCH ORDERS
  ========================= */
  const fetchOrders = async (type = "all") => {
    try {
      setError(null);
      const url =
        type === "all"
          ? `${import.meta.env.VITE_API_URL}/orders`
          : `${import.meta.env.VITE_API_URL}/orders?type=${type}`;

      const data = await apiFetch(url);
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     INITIAL LOAD + AUTH GUARD
  ========================= */
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchOrders(filter);
  }, [user, filter, navigate]);

  /* =========================
     CANCEL ORDER
  ========================= */
  const cancelOrder = async (orderId) => {
    if (cancellingId) return;

    setCancellingId(orderId);
    try {
      const data = await apiFetch(
        `${import.meta.env.VITE_API_URL}/orders/${orderId}/cancel`,
        { method: "POST" }
      );

      toast.success(
        data.refundAmount > 0
          ? `Order cancelled. Refund ₹${data.refundAmount}`
          : "Order cancelled"
      );

      fetchOrders(filter);
    } catch (err) {
      toast.error(err.message || "Cancellation failed");
    } finally {
      setCancellingId(null);
    }
  };

  /* =========================
     FILTERED ORDERS
  ========================= */
  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return true;
    if (filter === "meal") return order.type === "meal";
    if (filter === "subscription") return order.type === "subscription";
    if (filter === "refunded") return order.status === "refunded";
    return true;
  });

  /* =========================
     RENDER
  ========================= */
  return (
    <motion.div
      className="max-w-5xl mx-auto px-5 py-24"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* LOADING */}
      {loading && (
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-5 shadow space-y-4"
            >
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </div>
      )}

      {/* ERROR */}
      {!loading && error && (
        <ErrorState
          type={error.type}
          message={error.message}
          onRetry={() => {
            setLoading(true);
            fetchOrders(filter);
          }}
        />
      )}

      {/* CONTENT */}
      {!loading && !error && (
        <>
          <h1 className="text-3xl font-bold mb-6">Order History</h1>

          {/* FILTERS */}
          <div className="flex gap-3 mb-10 flex-wrap">
            {[
              { key: "all", label: "All" },
              { key: "meal", label: "Meals" },
              { key: "subscription", label: "Subscriptions" },
              { key: "refunded", label: "Refunded" },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-2 rounded-full border text-sm transition ${filter === f.key
                    ? "bg-green-600 text-white"
                    : "bg-white hover:bg-green-100"
                  }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {filteredOrders.length === 0 ? (
            <EmptyState
              icon="📦"
              title="No orders yet"
              description="Once you place your first meal order or subscription, it will appear here."
              actionLabel="Order Meals"
              actionTo="/discover-meals"
            />
          ) : (
            <div className="space-y-6">
              {filteredOrders.map((order, index) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                  whileHover={{ y: -4 }}
                  className="relative bg-white rounded-2xl shadow-md overflow-hidden"
                >
                  {/* LEFT ACCENT STRIP */}
                  <div
                    className={`absolute left-0 top-0 h-full w-1.5 ${order.type === "meal"
                        ? "bg-green-500"
                        : "bg-emerald-400"
                      }`}
                  />

                  {/* CARD CONTENT */}
                  <div className="p-5 pl-6">
                    {/* HEADER */}
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="p-2 rounded-full bg-green-100 text-green-700">
                          {order.type === "meal" ? (
                            <ShoppingBag size={14} />
                          ) : (
                            <CalendarDays size={14} />
                          )}
                        </div>
                        <span>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <span
                        className={`px-3 py-1 text-xs rounded-full ${order.status === "paid"
                            ? "bg-green-100 text-green-700"
                            : order.status === "refunded"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                      >
                        {order.status.toUpperCase()}
                      </span>
                    </div>

                    {/* BODY */}
                    {order.type === "meal" ? (
                      <div className="space-y-3">
                        {order.items?.map((item, idx) => (
                          <div key={idx}>
                            <p className="font-medium">
                              {item.name} × {item.quantity}
                            </p>
                            <p className="text-sm text-gray-500">
                              ₹{item.price * item.quantity}
                            </p>
                          </div>
                        ))}

                        <p className="font-semibold">
                          Total Paid: ₹{order.amountPaid}
                        </p>

                        {order.refundAmount > 0 && (
                          <p className="flex items-center gap-1 text-red-600 text-sm">
                            <RefreshCcw size={14} />
                            Refunded: ₹{order.refundAmount}
                          </p>
                        )}

                        {order.status === "paid" && (
                          <button
                            onClick={() => cancelOrder(order._id)}
                            disabled={cancellingId === order._id}
                            className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg disabled:opacity-60"
                          >
                            {cancellingId === order._id
                              ? "Cancelling..."
                              : "Cancel Order"}
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-700">
                        <p className="font-medium">Subscription Order</p>
                        <p>Amount Paid: ₹{order.amountPaid}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default OrderHistory;
