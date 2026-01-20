import { useState } from "react";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async () => {
        setLoading(true);
        setMessage("");

        const res = await fetch(
            `${import.meta.env.VITE_API_URL}/auth/forgot-password`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            }
        );

        const data = await res.json();
        setMessage(data.message);
        setLoading(false);
    };

    return (
        <div className="min-h-[70vh] flex items-center justify-center">
            <div className="w-full max-w-sm bg-white p-6 rounded-xl shadow">
                <h1 className="text-xl font-bold mb-4">Forgot Password</h1>

                {message && <p className="mb-3 text-sm">{message}</p>}

                <input
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full mb-4 px-4 py-2 border rounded-xl"
                />

                <button
                    onClick={submit}
                    disabled={loading}
                    className="w-full py-2 rounded-xl text-white transition-all duration-300 hover:opacity-90 hover:shadow-lg disabled:opacity-60 font-medium"
                    style={loading ? {} : { background: 'linear-gradient(135deg, #D63A25, #F4A024)' }}
                >
                    {loading ? "Sending..." : "Send Reset Link"}
                </button>
            </div>
        </div>
    );
};

export default ForgotPassword;
