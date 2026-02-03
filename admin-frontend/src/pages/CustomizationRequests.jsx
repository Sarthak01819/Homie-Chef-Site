import { useEffect, useState } from "react";

const CustomizationRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState(null);
    const [newRequests, setNewRequests] = useState(0);

    const fetchRequests = async () => {
        const res = await fetch(
            `${import.meta.env.VITE_API_URL}/admin/customizations`,
            { credentials: "include" }
        );
        const data = await res.json();
        setRequests(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const updateStatus = async (id, status, adminNote) => {
        setSavingId(id);

        await fetch(
            `${import.meta.env.VITE_API_URL}/admin/customizations/${id}`,
            {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ status, adminNote }),
            }
        );

        await fetchRequests();
        setSavingId(null);
    };
    useEffect(() => {
        const handler = (e) => {
            if (e.detail.type === "CUSTOMIZATION_REQUEST") {
                setNewRequests((n) => n + 1);
                fetchRequests();
            }
        };

        window.addEventListener("ADMIN_UPDATE", handler);
        return () =>
            window.removeEventListener("ADMIN_UPDATE", handler);
    }, []);

    if (loading) return <div className="p-6">Loading…</div>;

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">Customization Requests</h1>

            {requests.length === 0 && (
                <p className="text-gray-500">No requests.</p>
            )}

            {requests.map((req) => (
                <div
                    key={req._id}
                    className="border rounded-xl p-4 bg-white space-y-3"
                >
                    <div className="flex justify-between">
                        <div>
                            <p className="font-medium">
                                {req.performedBy?.name || "User"}
                            </p>
                            <p className="text-sm text-gray-600">
                                {req.performedBy?.email}
                            </p>
                        </div>

                        <span className="text-sm px-3 py-1 rounded-full bg-gray-100 capitalize">
                            {req.metadata.status}
                        </span>
                    </div>

                    <p className="text-sm">
                        <strong>User request:</strong>{" "}
                        {req.metadata.userMessage}
                    </p>

                    <textarea
                        defaultValue={req.metadata.adminNote || ""}
                        placeholder="Admin note (optional)"
                        className="w-full border rounded-lg p-2 text-sm"
                        onBlur={(e) =>
                            updateStatus(
                                req._id,
                                req.metadata.status,
                                e.target.value
                            )
                        }
                    />

                    <div className="flex gap-3">
                        {["approved", "rejected", "resolved"].map((s) => (
                            <button
                                key={s}
                                disabled={savingId === req._id}
                                onClick={() =>
                                    updateStatus(req._id, s, req.metadata.adminNote)
                                }
                                className={`px-4 py-1.5 rounded-lg text-sm font-medium
                  ${s === "approved"
                                        ? "bg-green-600 text-white"
                                        : s === "rejected"
                                            ? "bg-red-600 text-white"
                                            : "bg-black text-white"
                                    }
                `}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                    {newRequests > 0 && (
                        <span className="ml-2 px-2 py-1 text-xs bg-red-600 text-white rounded-full">
                            {newRequests} new
                        </span>
                    )}

                </div>
            ))}
        </div>
    );
};

export default CustomizationRequests;
