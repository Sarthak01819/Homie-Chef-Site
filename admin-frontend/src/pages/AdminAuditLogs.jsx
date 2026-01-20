import { useEffect, useState, useCallback } from "react";
import { ShieldAlert, ShieldCheck } from "lucide-react";

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [severity, setSeverity] = useState("");

  const fetchLogs = useCallback(async () => {
    const query = severity ? `?severity=${severity}` : "";
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/admin/audit-logs${query}`,
      { credentials: "include" }
    );
    const data = await res.json();
    setLogs(Array.isArray(data) ? data : []);
  }, [severity]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="p-8 min-h-screen bg-linear-to-br from-[#119DA4]/10 to-[#4B0C37]/10">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Audit Logs</h1>

      {/* Filters */}
      <div className="mb-6">
        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
          className="border border-gray-300 px-4 py-2 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#119DA4] focus:border-transparent"
        >
          <option value="">All</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      {/* Logs */}
      <div className="space-y-4">
        {logs.map((log) => (
          <div
            key={log._id}
            className="bg-white rounded-xl p-6 shadow-lg flex justify-between items-center hover:shadow-xl transition-shadow duration-300"
          >
            <div>
              <p className="font-semibold text-gray-800">{log.event}</p>
              <p className="text-sm text-gray-500 mt-1">
                {log.ip} • {new Date(log.createdAt).toLocaleString()}
              </p>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${log.severity === "critical"
                  ? "bg-linear-to-r from-red-400 to-red-600 text-white"
                  : log.severity === "warning"
                    ? "bg-linear-to-r from-yellow-400 to-yellow-600 text-white"
                    : "bg-linear-to-r from-gray-400 to-gray-600 text-white"
                }`}
            >
              {log.severity}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminAuditLogs;
