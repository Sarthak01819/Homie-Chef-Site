import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="min-h-[90vh] flex items-center px-6 bg-white">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">

        {/* LEFT: TEXT */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight text-gray-900 mb-6">
            Healthy Meals.
            <br />
            Delivered Daily.
          </h1>

          <p className="text-lg text-gray-600 mb-8 max-w-xl">
            Homely, nutritious vegetarian meals delivered to your door.
            No daily ordering. No compromise on health.
          </p>

          <div className="flex gap-4">
            <button
              onClick={() => navigate("/subscription")}
              className="px-8 py-4 rounded-full bg-black text-white font-semibold hover:scale-105 transition"
            >
              View Subscription Plans
            </button>

            <button
              onClick={() => navigate("/discover-meals")}
              className="px-8 py-4 rounded-full border border-gray-300 font-semibold hover:bg-gray-100 transition"
            >
              Explore Meals
            </button>
          </div>
        </motion.div>

        {/* RIGHT: IMAGE */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <img
            src="/images/veg.png"
            alt="Healthy food"
            className="rounded-3xl shadow-2xl w-full"
          />
        </motion.div>

      </div>
    </section>
  );
};

export default Hero;
