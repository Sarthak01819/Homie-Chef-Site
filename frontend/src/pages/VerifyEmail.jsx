import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

const VerifyEmail = () => {
    const { token } = useParams();
    const [message, setMessage] = useState("Verifying...");

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL}/auth/verify-email/${token}`)
            .then(res => res.json())
            .then(data => setMessage(data.message))
            .catch(() => setMessage("Verification failed"));
    }, [token]);

    return (
        <div className="min-h-[60vh] flex items-center justify-center text-xl font-semibold">
            {message}
        </div>
    );
};

export default VerifyEmail;
