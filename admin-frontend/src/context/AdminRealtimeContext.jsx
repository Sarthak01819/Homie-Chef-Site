import { createContext, useContext, useEffect, useState } from "react";

const AdminRealtimeContext = createContext(null);

export const AdminRealtimeProvider = ({ children }) => {
    const [stats, setStats] = useState({
        activeSubs: 0,
        deliveriesToday: 0,
        pendingCustomizations: 0,
    });

    const [activity, setActivity] = useState([]);

    useEffect(() => {
        const handler = (e) => {
            const { type, payload } = e.detail;

            // 📜 Activity feed (max 20)
            setActivity((prev) => [
                {
                    id: Date.now(),
                    type,
                    payload,
                    time: new Date(),
                },
                ...prev.slice(0, 19),
            ]);

            // 🔢 Counters
            setStats((prev) => {
                const next = { ...prev };

                if (type === "MEAL_DELIVERED") next.deliveriesToday++;
                if (type === "CUSTOMIZATION_REQUEST")
                    next.pendingCustomizations++;
                if (type === "SUB_CANCELLED")
                    next.activeSubs = Math.max(0, prev.activeSubs - 1);
                if (type === "SUB_RESUMED")
                    next.activeSubs++;

                return next;
            });
        };

        window.addEventListener("ADMIN_UPDATE", handler);
        return () =>
            window.removeEventListener("ADMIN_UPDATE", handler);
    }, []);

    return (
        <AdminRealtimeContext.Provider
            value={{ stats, activity }}
        >
            {children}
        </AdminRealtimeContext.Provider>
    );
};

export const useAdminRealtime = () =>
    useContext(AdminRealtimeContext);
