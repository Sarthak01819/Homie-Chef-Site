import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { emitAdminUpdate } from "../utils/adminEvents";

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAdmin = async () => {
            try {
                const res = await fetch(
                    `${import.meta.env.VITE_API_URL}/admin/me`,
                    { credentials: "include" }
                );

                if (!res.ok) {
                    setAdmin(null);
                    return;
                }

                const data = await res.json();

                if (data.role !== "admin") {
                    setAdmin(null);
                    return;
                }

                setAdmin(data);
            } catch {
                setAdmin(null);
            } finally {
                setLoading(false);
            }
        };

        checkAdmin();
    }, []);

    useEffect(() => {
        if (!admin) return;

        const evtSource = new EventSource(
            `${import.meta.env.VITE_API_URL}/admin/realtime/stream`,
            { withCredentials: true }
        );

        evtSource.addEventListener("MEAL_DELIVERED", (e) => {
            const data = JSON.parse(e.data);
            toast.success(`Meal delivered: ${data.user}`);
        });

        evtSource.addEventListener("SUB_CANCELLED", (e) => {
            const data = JSON.parse(e.data);
            toast.error(`Subscription cancelled: ${data.user}`);
        });

        evtSource.onerror = () => {
            evtSource.close();
        };

        evtSource.addEventListener("MEAL_DELIVERED", (e) => {
            const data = JSON.parse(e.data);
            emitAdminUpdate("MEAL_DELIVERED", data);
        });

        evtSource.addEventListener("SUB_PAUSED", (e) => {
            emitAdminUpdate("SUB_PAUSED", JSON.parse(e.data));
        });

        evtSource.addEventListener("SUB_CANCELLED", (e) => {
            emitAdminUpdate("SUB_CANCELLED", JSON.parse(e.data));
        });

        evtSource.addEventListener("CUSTOMIZATION_REQUEST", (e) => {
            emitAdminUpdate("CUSTOMIZATION_REQUEST", JSON.parse(e.data));
        });

        evtSource.addEventListener("FORCE_LOGOUT", (e) => {
            emitAdminUpdate("FORCE_LOGOUT", JSON.parse(e.data));
        });

        return () => evtSource.close();
    }, [admin]);

    return (
        <AdminAuthContext.Provider
            value={{ admin, setAdmin, loading }}
        >
            {children}
        </AdminAuthContext.Provider>
    );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
