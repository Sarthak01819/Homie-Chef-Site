import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async () => {
        setLoading(true);
        setMessage("");

        const res = await fetch(
            `${import.meta.env.VITE_API_URL}/auth/reset-password/${token}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            }
        );

        const data = await res.json();
        setMessage(data.message);
        setLoading(false);

        if (res.ok) {
            setTimeout(() => navigate("/login"), 2000);
        }
    };

    return (
        <div className="min-h-[70vh] flex items-center justify-center">
            <div className="w-full max-w-sm bg-white p-6 rounded-xl shadow">
                <h1 className="text-xl font-bold mb-4">Reset Password</h1>

                {message && <p className="mb-3 text-sm">{message}</p>}

                <input
                    type="password"
                    placeholder="New password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full mb-4 px-4 py-2 border rounded-xl"
                />

                <button
                    onClick={submit}
                    disabled={loading}
                    className="w-full py-2 rounded-xl text-white transition-all duration-300 hover:opacity-90 hover:shadow-lg disabled:opacity-60 font-medium"
                    style={loading ? {} : { background: 'linear-gradient(135deg, #D63A25, #F4A024)' }}
                >
                    {loading ? "Updating..." : "Reset Password"}
                </button>
            </div>
        </div>
    );
};

export default ResetPassword;
