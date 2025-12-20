import { ArrowRight } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
const Hero = () => {
    return (
        <section
            className="relative w-full min-h-screen bg-cover bg-center"
            style={{
                backgroundImage: `url(/images/veg.png)`,
            }}
        >
            {/* Optional overlay for readability */}
            <div className="absolute inset-0 bg-white/10"></div>

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
                        <button className="mt-8 inline-flex items-center gap-2 bg-black/85 text-white px-6 py-3 rounded-full text-base md:text-lg font-medium hover:bg-white hover:text-black transition-all shadow-lg">
                            Get Started <ArrowRight className="h-5 w-5" />
                        </button>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default Hero;
