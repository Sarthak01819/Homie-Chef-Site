export const apiFetch = async (url, options = {}) => {
    const res = await fetch(url, {
        credentials: "include",
        ...options,
    });

    if (res.status !== 401) {
        return res.json();
    }

    // Try silent refresh
    const refreshRes = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/refresh`,
        {
            method: "POST",
            credentials: "include",
        }
    );

    if (!refreshRes.ok) {
        throw { type: "AUTH", message: "Session expired" };
    }

    // Retry original request
    const retry = await fetch(url, {
        credentials: "include",
        ...options,
    });

    if (!retry.ok) {
        throw { type: "API", message: "Request failed" };
    }

    return retry.json();
};
