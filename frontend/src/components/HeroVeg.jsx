import { motion, useScroll, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";

const HeroVeg = () => {
  const navigate = useNavigate();

  /* =========================
     PARALLAX SETUP
  ========================= */
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 600], ["0%", "20%"]);

  return (
    <section className="relative h-[70vh] md:h-[80vh] lg:h-[90vh] w-full overflow-hidden">
      {/* PARALLAX BACKGROUND */}
      <motion.div
        className="absolute inset-0 bg-cover bg-no-repeat"
        style={{
          backgroundImage: "url('/images/veg.png')",
          y: bgY,
          backgroundPosition: "top center",
        }}
        initial={{ scale: 1.12 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />

      {/* DARK OVERLAY */}
      <div className="absolute inset-0 bg-black/50" />

      {/* CONTENT */}
      <div className="relative z-10 h-full flex items-center justify-center px-6">
        <motion.div
          className="text-center text-white max-w-3xl"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight w-full">
            <span className="uppercase ml-4">The</span><br /><span className="text-[7vw] uppercase leading-18">Homie Chef</span>
          </h2>

          <p className="text-lg md:text-xl text-white/90 mb-8">
            Freshly cooked vegetarian meals,
            planned with care and delivered daily.
          </p>

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate("/subscription")}
            className="
              inline-flex items-center justify-center
              px-10 py-4 rounded-full
              bg-white text-black
              font-semibold text-lg
              shadow-2xl cursor-pointer
              hover:bg-white/80
            "
          >
            Start Eating Right
          </motion.button>
        </motion.div>
      </div>

      {/* SCROLL HINT */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-sm"
        animate={{ y: [0, -8, 0], opacity: [0.6, 1, 0.6] }}
        transition={{ repeat: Infinity, duration: 2.2 }}
      >
        ↓ Scroll to explore
      </motion.div>
    </section>
  );
};

export default HeroVeg;
