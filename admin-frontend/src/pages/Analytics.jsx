import { useEffect, useState } from "react";

const Analytics = () => {
    const [data, setData] = useState(null);

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL}/admin/analytics`, {
            credentials: "include",
        })
            .then((r) => r.json())
            .then(setData);
    }, []);

    if (!data) return <div className="p-6">Loading analytics…</div>;

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">Analytics</h1>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {data.breakdowns.subsByPlan.map((p) => (
                    <div key={p._id} className="border rounded-xl p-4 bg-white">
                        <p className="text-sm text-gray-500">{p._id}-Day Plans</p>
                        <p className="text-xl font-bold">{p.count}</p>
                    </div>
                ))}
            </section>

            <section className="grid grid-cols-2 gap-4">
                {data.breakdowns.activeVsExpired.map((s) => (
                    <div key={s._id} className="border rounded-xl p-4 bg-white">
                        <p className="text-sm text-gray-500">{s._id}</p>
                        <p className="text-xl font-bold">{s.count}</p>
                    </div>
                ))}
            </section>

            <section className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="border rounded-xl p-4 bg-white">
                    <p className="text-sm text-gray-500">Deliveries Today</p>
                    <p className="text-xl font-bold">{data.ops.deliveriesToday}</p>
                </div>
                <div className="border rounded-xl p-4 bg-white">
                    <p className="text-sm text-gray-500">Open Customizations</p>
                    <p className="text-xl font-bold">{data.ops.openCustomizations}</p>
                </div>
            </section>
        </div>
    );
};

export default Analytics;
