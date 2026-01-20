export async function apiFetch(url, options = {}) {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const res = await fetch(url, {
            ...options,
            credentials: "include",
            signal: controller.signal,
        });

        clearTimeout(timeout);

        if (res.status === 401) {
            window.location.href = "/login";
            return;
        }

        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw {
                type: "api",
                status: res.status,
                message: data.message || "Server error",
            };
        }

        return await res.json();
    } catch (err) {
        if (err.name === "AbortError") {
            throw { type: "timeout", message: "Request timed out" };
        }

        if (!navigator.onLine) {
            throw { type: "offline", message: "No internet connection" };
        }

        throw err;
    }
}
