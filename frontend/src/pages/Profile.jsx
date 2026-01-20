import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import {
  Loader2,
  User,
  Laptop,
  Smartphone,
  ShieldCheck,
  Lock,
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const Profile = () => {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [sessions, setSessions] = useState([]);
  const [revoking, setRevoking] = useState(false);

  /* =========================
     CHANGE PASSWORD STATES
  ========================= */
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  /* 🔐 Protect route + init fields */
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    setName(user.name || "");
    setPhone(user.phone || "");
    fetchSessions();
  }, [user, navigate]);

  /* =========================
     FETCH ACTIVE SESSIONS
  ========================= */
  const fetchSessions = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/sessions`,
        { credentials: "include" }
      );
      if (!res.ok) return;
      const data = await res.json();
      setSessions(Array.isArray(data) ? data : []);
    } catch { }
  };

  /* =========================
     SAVE PROFILE
  ========================= */
  const saveProfile = async () => {
    if (!name.trim()) {
      setMessage("Name cannot be empty");
      return;
    }

    if (phone && !/^[6-9]\d{9}$/.test(phone)) {
      setMessage("Enter a valid Indian phone number");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/profile`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, phone: phone || undefined }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        setMessage(data.message || "Failed to update profile");
        return;
      }

      setUser(data);
      setMessage("Profile updated successfully ✅");
    } catch {
      setMessage("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  /* =========================
     LOG OUT OTHER DEVICES
  ========================= */
  const logoutOtherDevices = async () => {
    if (revoking) return;
    setRevoking(true);

    try {
      await fetch(
        `${import.meta.env.VITE_API_URL}/auth/logout-others`,
        { method: "POST", credentials: "include" }
      );
      await fetchSessions();
    } catch { } finally {
      setRevoking(false);
    }
  };

  /* =========================
     CHANGE PASSWORD
  ========================= */
  const changePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast.error("All password fields are required");
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/change-password`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ currentPassword, newPassword }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Password change failed");
        return;
      }

      toast.success("Password changed. Please log in again.");
      logout();
      navigate("/login");
    } catch {
      toast.error("Password change failed");
    } finally {
      setChangingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
    }
  };

  if (!user) return null;

  return (
    <motion.div
      className="max-w-4xl mx-auto px-5 py-24 space-y-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h1 className="text-3xl font-bold">My Profile</h1>

      {/* =========================
          PROFILE DETAILS
      ========================= */}
      <div className="rounded-3xl border bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-16 w-16 rounded-full bg-green-600 flex items-center justify-center">
            <User size={30} className="text-white" />
          </div>

          <div>
            <p className="font-semibold text-lg">{user.name}</p>
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <ShieldCheck size={14} />
              {user.isVerified ? "Verified account" : "Unverified account"}
            </p>
          </div>
        </div>

        <div className="grid gap-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full Name"
            className="w-full px-4 py-2 border rounded-xl"
          />

          {message && (
            <p className="text-sm text-green-600">{message}</p>
          )}

          <button
            onClick={saveProfile}
            disabled={saving}
            className="self-start px-6 py-2 rounded-xl bg-linear-to-r from-[#4B0C37] to-[#119DA4] text-white hover:from-[#119DA4] hover:to-[#4B0C37] disabled:opacity-60 flex items-center gap-2 transition-all duration-300"
          >
            {saving && <Loader2 size={18} className="animate-spin" />}
            Save Changes
          </button>
        </div>
      </div>

      {/* =========================
          CHANGE PASSWORD
      ========================= */}
      <div className="rounded-3xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Lock size={18} /> Security
        </h2>

        <div className="grid gap-3">
          <input
            type="password"
            placeholder="Current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-xl"
          />

          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-xl"
          />

          <button
            onClick={changePassword}
            disabled={changingPassword}
            className="self-start px-5 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
          >
            {changingPassword ? "Updating..." : "Change Password"}
          </button>
        </div>
      </div>

      {/* =========================
          ACTIVE DEVICES
      ========================= */}
      <div className="rounded-3xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Active Devices</h2>

        <div className="space-y-3">
          {sessions.map((s, i) => {
            const isMobile = /mobile/i.test(s.userAgent || "");
            return (
              <div
                key={i}
                className="flex items-center justify-between border rounded-xl px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  {isMobile ? <Smartphone size={18} /> : <Laptop size={18} />}
                  <div>
                    <p className="text-sm font-medium">
                      {isMobile ? "Mobile device" : "Desktop device"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {s.ip} • {new Date(s.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {i === 0 && (
                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                    Current
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {sessions.length > 1 && (
          <button
            onClick={logoutOtherDevices}
            disabled={revoking}
            className="mt-4 px-5 py-2 rounded-xl border text-red-600 hover:bg-red-50 disabled:opacity-60"
          >
            {revoking ? "Revoking..." : "Log out other devices"}
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default Profile;
