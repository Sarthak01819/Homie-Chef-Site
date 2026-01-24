import { createContext, useContext, useEffect, useState } from "react";

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

    return (
        <AdminAuthContext.Provider
            value={{ admin, setAdmin, loading }}
        >
            {children}
        </AdminAuthContext.Provider>
    );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
