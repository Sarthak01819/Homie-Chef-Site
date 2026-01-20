import { useEffect, useState } from "react";
import { Trash2, Minus, Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import Skeleton from "../components/Skeleton";
import EmptyState from "../components/EmptyState";
import { apiFetch } from "../services/api";

const DELIVERY_CHARGE = 49;
const GST_RATE = 0.18;

const Cart = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [razorpayReady, setRazorpayReady] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState(null);

  /* =========================
     LOAD RAZORPAY SCRIPT
  ========================= */
  useEffect(() => {
    if (window.Razorpay) {
      setRazorpayReady(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => setRazorpayReady(true);
    script.onerror = () => toast.error("Failed to load payment gateway");

    document.body.appendChild(script);
  }, []);

  /* =========================
     AUTH GUARD
  ========================= */
  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  /* =========================
     FETCH CART
  ========================= */
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/meals/cart`,
          { credentials: "include" }
        );

        if (!res.ok) {
          setCartItems([]);
          return;
        }

        const data = await res.json();

        const withQty = (Array.isArray(data) ? data : []).map((item) => ({
          ...item,
          quantity: item.quantity ?? 1,
        }));

        setCartItems(withQty);
      } catch {
        setCartItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  /* =========================
     CART HELPERS
  ========================= */
  const updateQty = (id, delta) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item._id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const removeFromCart = async (mealId) => {
    await fetch(
      `${import.meta.env.VITE_API_URL}/meals/${mealId}/cart`,
      { method: "DELETE", credentials: "include" }
    );

    setCartItems((prev) => prev.filter((i) => i._id !== mealId));
    toast.success("Removed from cart");
  };

  /* =========================
     PRICE CALCULATION
  ========================= */
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const gst = Math.round(subtotal * GST_RATE);
  const total = subtotal + gst + DELIVERY_CHARGE;

  /* =========================
     PLACE ORDER
  ========================= */
  const handlePlaceOrder = async () => {
    if (!razorpayReady) {
      toast.error("Payment gateway loading, please wait");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    if (paying) return;
    setPaying(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/payments/create-meal-order`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ items: cartItems }),
        }
      );

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        toast.error("Payment service unavailable");
        setPaying(false);
        return;
      }

      const orderData = await res.json();

      if (!res.ok) {
        toast.error(orderData.message || "Payment initiation failed");
        setPaying(false);
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: "INR",
        name: "Homie Chef",
        description: "Meal Order Payment",
        order_id: orderData.orderId,

        prefill: {
          name: user?.name || "Customer",
          email: user?.email || "",
        },

        handler: async (response) => {
          try {
            const verifyRes = await fetch(
              `${import.meta.env.VITE_API_URL}/payments/verify-meal`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(response),
              }
            );

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok) {
              throw new Error(verifyData.message);
            }

            toast.success("Meal order placed successfully 🎉");
            setCartItems([]);
            setUser({ ...user, cart: [] });
            navigate("/orders");
          } catch {
            toast.error("Payment verification failed");
          } finally {
            setPaying(false);
          }
        },

        modal: {
          ondismiss: () => {
            setPaying(false);
            toast.error("Payment cancelled");
          },
        },

        theme: { color: "#16a34a" },
      };

      new window.Razorpay(options).open();
    } catch {
      toast.error("Payment error");
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-5 py-24 space-y-6">
        <h1 className="text-3xl font-bold mb-6">
          <Skeleton className="h-8 w-40" />
        </h1>

        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex gap-4 p-4 rounded-xl border shadow"
          >
            <Skeleton className="h-20 w-20 rounded-lg" />

            <div className="flex-1 space-y-3">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-24" />
            </div>

            <Skeleton className="h-6 w-16" />
          </div>
        ))}

        <div className="mt-8 p-5 rounded-xl border shadow space-y-3">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-full mt-4" />
        </div>
      </div>
    );
  }



  if (cartItems.length === 0) {
    return (
      <EmptyState
        icon="🛒"
        title="Your cart is empty"
        description="Looks like you haven’t added any meals yet. Explore our fresh vegetarian dishes."
        actionLabel="Discover Meals"
        actionTo="/discover-meals"
      />
    );
  }

  const fetchPlans = async () => {
    try {
      setError(null);
      const data = await apiFetch(
        `${import.meta.env.VITE_API_URL}/meals/cart`,
      );
      setPlans(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <ErrorState
        type={error.type}
        message={error.message}
        onRetry={() => {
          setLoading(true);
          fetchPlans();
        }}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto px-5 py-24"
    >
      <h1 className="text-3xl font-bold mb-6 text-black">Your Cart</h1>

      <div className="space-y-4">
        <AnimatePresence>
          {cartItems.map((item) => (
            <motion.div
              key={item._id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="flex gap-4 p-4 rounded-xl shadow border text-black"
            >
              <img
                src={item.image}
                className="h-20 w-20 rounded-lg object-cover"
              />

              <div className="flex-1">
                <h2 className="font-semibold">{item.name}</h2>

                <div className="flex items-center gap-2 mt-2">
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => updateQty(item._id, -1)}>
                    <Minus size={16} />
                  </motion.button>

                  <motion.span
                    key={item.quantity}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                  >
                    {item.quantity}
                  </motion.span>

                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => updateQty(item._id, 1)}>
                    <Plus size={16} />
                  </motion.button>
                </div>
              </div>

              <div className="text-right">
                <motion.p
                  key={item.price * item.quantity}
                  initial={{ opacity: 0.6 }}
                  animate={{ opacity: 1 }}
                  className="font-bold"
                >
                  ₹{item.price * item.quantity}
                </motion.p>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={() => removeFromCart(item._id)}
                >
                  <Trash2 style={{ color: "#E84141" }} size={18} />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <motion.div layout className="mt-8 p-5 rounded-xl shadow space-y-2 border text-black">
        <p>Subtotal: ₹{subtotal}</p>
        <p>GST (18%): ₹{gst}</p>
        <p>Delivery: ₹{DELIVERY_CHARGE}</p>
        <hr style={{ borderColor: "rgba(0,0,0,0.25)" }} />
        <p className="font-bold text-lg">Total: ₹{total}</p>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handlePlaceOrder}
          disabled={!razorpayReady || paying}
          className="w-full mt-4 py-3 rounded-xl bg-linear-to-r from-[#4B0C37] to-[#119DA4] text-white font-medium transition-all duration-300 hover:from-[#119DA4] hover:to-[#4B0C37] disabled:opacity-60"
        >
          {paying ? "Processing..." : "Place Order"}
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default Cart;
