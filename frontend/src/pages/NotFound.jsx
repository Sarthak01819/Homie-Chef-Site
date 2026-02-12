import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
      <h1 className="text-7xl font-bold text-gray-900 mb-4">404</h1>

      <h2 className="text-2xl font-semibold text-gray-700 mb-3">
        Page Not Found
      </h2>

      <p className="text-gray-500 max-w-md mb-8">
        The page you’re looking for doesn’t exist or may have been moved.
      </p>

      <div className="flex gap-4">
        <Link
          to="/"
          className="px-6 py-3 rounded-xl bg-black text-white hover:bg-gray-800 transition"
        >
          Go Home
        </Link>

        <Link
          to="/discover-meals"
          className="px-6 py-3 rounded-xl border border-gray-300 hover:bg-gray-100 transition"
        >
          Discover Meals
        </Link>
      </div>
    </div>
  );
}
