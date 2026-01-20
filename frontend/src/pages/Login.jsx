import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  /* =========================
     VALIDATION
  ========================= */
  const validate = () => {
    if (!email || !password) {
      toast.error("Email and password are required");
      return false;
    }
    return true;
  };

  /* =========================
     LOGIN HANDLER (SAFE)
  ========================= */
  const handleLogin = async () => {
    if (!validate() || loading) return;

    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Invalid credentials");
        return;
      }

      // ✅ Sync auth state
      setUser(data);
      toast.success("Login successful");
      navigate("/");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     ENTER KEY SUPPORT
  ========================= */
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <motion.div 
      className="min-h-[70vh] flex items-center justify-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-full max-w-sm backdrop-blur-md p-6 rounded-2xl shadow-lg border" style={{ backgroundColor: '#ffffff', borderColor: 'rgba(0,0,0,0.25)' }}>
        <h1 className="text-2xl font-bold mb-4 text-center" style={{ color: '#000000' }}>
          Welcome Back
        </h1>

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full mb-3 px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 transition-colors"
          style={{ backgroundColor: '#ffffff', borderColor: 'rgba(0,0,0,0.25)', color: '#000000' }}
          onFocus={(e) => e.target.style.borderColor = '#000000'}
          onBlur={(e) => e.target.style.borderColor = 'rgba(0,0,0,0.25)'}
        />

        {/* Password */}
        <div className="relative mb-4">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-4 py-2 border rounded-xl pr-10 focus:outline-none focus:ring-2 transition-colors"
            style={{ backgroundColor: '#ffffff', borderColor: 'rgba(0,0,0,0.25)', color: '#000000' }}
            onFocus={(e) => e.target.style.borderColor = '#000000'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(0,0,0,0.25)'}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 cursor-pointer"
            style={{ color: '#000000' }}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* Login Button */}
        <motion.button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-2 rounded-xl bg-linear-to-r from-[#4B0C37] to-[#119DA4] text-white flex items-center justify-center gap-2 transition-all duration-300 hover:from-[#119DA4] hover:to-[#4B0C37] hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer font-medium"
          style={loading ? { backgroundColor: '#f0f0f0', color: '#999999' } : {}}
          whileHover={{ scale: 1.05 }}
        >
          {loading && <Loader2 className="animate-spin" size={18} />}
          {loading ? "Logging in..." : "Login"}
        </motion.button>

        {/* Register Link */}
        <p className="text-sm mt-4 text-center" style={{ color: '#000000' }}>
          Don't have an account?{" "}
          <Link to="/register" className="font-medium transition-colors duration-300" style={{ color: '#000000' }}>
            Register
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default Login;
