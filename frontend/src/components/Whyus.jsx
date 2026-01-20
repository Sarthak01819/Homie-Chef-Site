import React, { memo } from "react";
import {
    CookingPot,
    Gem,
    IndianRupee,
    TruckElectric,
} from "lucide-react";
import { motion } from "framer-motion";

/* -------------------- DATA -------------------- */

const WHY_US = [
    {
        id: 1,
        Icon: CookingPot,
        title: "Serve Healthy Food",
        desc: "We serve healthy food here. You can choose any food you like.",
    },
    {
        id: 2,
        Icon: Gem,
        title: "Best Quality Ingredients",
        desc: "Our food quality is excellent. You will get exactly what you want.",
    },
    {
        id: 3,
        Icon: IndianRupee,
        title: "Affordable Pricing",
        desc: "Best quality food at an affordable price. You will not regret it.",
    },
    {
        id: 4,
        Icon: TruckElectric,
        title: "Fast & Reliable Delivery",
        desc: "Quick, safe and on-time delivery — every single day.",
    },
];

/* -------------------- MAIN COMPONENT -------------------- */

const Whyus = () => {
    return (
        <motion.section 
            className="w-full py-16 flex flex-col items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold uppercase mb-12 text-center">
                Why Choose Us
            </h2>

            <div className="max-w-7xl w-full px-6">
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 bg-linear-to-r from-[#119DA4]/10 to-[#4B0C37]/10 py-10 px-6 rounded-3xl border border-white/20 shadow-lg">
                    {WHY_US.map((item) => (
                        <WhyUsCard key={item.id} {...item} />
                    ))}
                </ul>
            </div>
        </motion.section>
    );
};

/* -------------------- CARD -------------------- */

const WhyUsCard = memo(({ Icon, title, desc }) => (
    <motion.li 
        className="flex flex-col items-center text-center gap-4 p-6 rounded-2xl shadow-md bg-white/80 backdrop-blur-md hover:shadow-xl transition-all"
        whileHover={{ scale: 1.05 }}
    >
        <Icon className="w-12 h-12 bg-linear-to-r from-[#119DA4] to-[#FDE789] bg-clip-text text-transparent" />
        <h3 className="text-lg md:text-xl font-semibold">{title}</h3>
        <p className="text-sm text-gray-600">{desc}</p>
    </motion.li>
));

export default Whyus;
