import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const Register = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  /* =========================
     VALIDATION
  ========================= */
  const validate = () => {
    if (!name || !email || !password) {
      toast.error("Name, email and password are required");
      return false;
    }

    if (phone && !/^[6-9]\d{9}$/.test(phone)) {
      toast.error("Enter valid Indian phone number");
      return false;
    }

    return true;
  };

  /* =========================
     REGISTER HANDLER
  ========================= */
  const handleRegister = async () => {
    if (!validate() || loading) return;

    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            password,
            phone: phone || undefined,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Registration failed");
        return;
      }

      toast.success("Registration successful");
      navigate("/login");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
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
          Create Account
        </h1>

        <input
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mb-3 px-4 py-2 border rounded-xl transition-colors"
          style={{ backgroundColor: '#ffffff', borderColor: 'rgba(0,0,0,0.25)', color: '#000000' }}
          onFocus={(e) => e.target.style.borderColor = '#000000'}
          onBlur={(e) => e.target.style.borderColor = 'rgba(0,0,0,0.25)'}
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-3 px-4 py-2 border rounded-xl transition-colors"
          style={{ backgroundColor: '#ffffff', borderColor: 'rgba(0,0,0,0.25)', color: '#000000' }}
          onFocus={(e) => e.target.style.borderColor = '#000000'}
          onBlur={(e) => e.target.style.borderColor = 'rgba(0,0,0,0.25)'}
        />

        {/* Phone Number */}
        <div className="flex mb-3">
          <span className="px-3 py-2 border border-r-0 rounded-l-xl" style={{ backgroundColor: '#ffffff', borderColor: 'rgba(0,0,0,0.25)', color: '#000000' }}>
            +91
          </span>
          <input
            type="tel"
            placeholder="XXXXXXXXXX"
            value={phone}
            maxLength={10}
            onChange={(e) =>
              setPhone(e.target.value.replace(/\D/g, ""))
            }
            className="w-full px-4 py-2 border rounded-r-xl transition-colors"
            style={{ backgroundColor: '#ffffff', borderColor: 'rgba(0,0,0,0.25)', color: '#000000' }}
            onFocus={(e) => e.target.style.borderColor = '#000000'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(0,0,0,0.25)'}
          />
        </div>

        {/* Password */}
        <div className="relative mb-4">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-xl pr-10 transition-colors"
            style={{ backgroundColor: '#ffffff', borderColor: 'rgba(0,0,0,0.25)', color: '#000000' }}
            onFocus={(e) => e.target.style.borderColor = '#000000'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(0,0,0,0.25)'}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5"
            style={{ color: '#000000' }}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <motion.button
          onClick={handleRegister}
          disabled={loading}
          className="w-full py-2 rounded-xl bg-linear-to-r from-[#4B0C37] to-[#119DA4] text-white flex items-center justify-center gap-2 transition-all duration-300 hover:from-[#119DA4] hover:to-[#4B0C37] hover:shadow-lg disabled:opacity-60 font-medium"
          style={loading ? { backgroundColor: '#f0f0f0', color: '#999999' } : {}}
          whileHover={{ scale: 1.05 }}
        >
          {loading && <Loader2 className="animate-spin" size={18} />}
          Register
        </motion.button>

        <p className="text-sm mt-4 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-green-600 font-medium">
            Login
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default Register;
