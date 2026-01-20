import { ArrowRight } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Hero = () => {
    return (
        <motion.section
            className="relative w-full min-h-screen bg-cover bg-center"
            style={{
                backgroundImage: `url(/images/veg.png)`,
            }}
            initial={{ opacity: 0 }}
            animate={{ 
                opacity: 1,
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
            }}
            transition={{ 
                opacity: { duration: 0.5 },
                backgroundPosition: { duration: 20, repeat: Infinity, ease: "linear" }
            }}
        >
            {/* Optional overlay for readability */}
            <div className="absolute inset-0 bg-linear-to-r from-[#119DA4]/20 to-[#4B0C37]/20"></div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 flex items-center min-h-screen">
                <div className="max-w-xl text-black/85 drop-shadow-2xl">
                    <span className="block text-2xl sm:text-3xl md:text-4xl font-semibold leading-0">
                        Welcome to
                    </span>

                    <span className="block text-4xl sm:text-5xl md:text-7xl font-extrabold uppercase leading-tight">
                        Homie Chef
                    </span>

                    <p className="mt-4 text-sm sm:text-base md:text-lg text-black/80">
                        Delicious meals delivered to your doorstep.
                        <br />
                        Freshly prepared by local chefs, made with love and quality
                        ingredients. Enjoy a variety of cuisines and experience home-cooked
                        goodness every day.
                    </p>

                    <Link to="/login">
                        <motion.button 
                            className="cursor-pointer mt-8 inline-flex items-center gap-2 bg-linear-to-r from-[#4B0C37] to-[#119DA4] text-white px-6 py-3 rounded-full text-base md:text-lg font-medium hover:from-[#119DA4] hover:to-[#4B0C37] transition-all duration-300 shadow-lg hover:shadow-xl"
                            whileHover={{ scale: 1.05 }}
                        >
                            Get Started <ArrowRight className="h-5 w-5" />
                        </motion.button>
                    </Link>
                </div>
            </div>
        </motion.section>
    );
};

export default Hero;
