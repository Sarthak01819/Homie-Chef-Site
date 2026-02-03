const StatCard = ({ label, value }) => (
    <div className="rounded-xl border p-4 bg-white shadow-sm">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
    </div>
);
export default StatCard;
