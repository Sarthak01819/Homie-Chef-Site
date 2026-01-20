import { Link } from "react-router-dom";

const EmptyState = ({
  title,
  description,
  actionLabel,
  actionTo,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-4">
      <div className="text-6xl mb-4">{icon}</div>

      <h2 className="text-2xl font-semibold mb-2">
        {title}
      </h2>

      <p className="text-gray-600 max-w-md mb-6">
        {description}
      </p>

      {actionLabel && actionTo && (
        <Link
          to={actionTo}
          className="px-6 py-3 rounded-xl font-medium text-white transition hover:scale-[1.03] hover:shadow-lg"
          style={{ backgroundColor: "#2ECC71" }}
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
};

export default EmptyState;
