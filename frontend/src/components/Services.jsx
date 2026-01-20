import React, { memo } from "react";
import {
    ClockFading,
    Library,
    Salad,
    Sprout,
} from "lucide-react";
import { motion } from "framer-motion";

/* -------------------- DATA -------------------- */

const SERVICES = [

    {
        id: 1,
        Icon: Salad,
        title: "Fresh Ingredients",
        desc: "Sourced from local farms and delivered to your doorstep.",
    },
    {
        id: 2,
        Icon: Library,
        title: "Recipe Ideas",
        desc: "Access to a library of delicious and healthy recipes.",
    },
    {
        id: 3,
        Icon: ClockFading,
        title: "24/7 Customer Support",
        desc: "We're here to help you anytime you need assistance.",
    },
    {
        id: 4,
        Icon: Sprout,
        title: "Eco-Friendly Packaging",
        desc: "Committed to sustainability and reducing waste.",
    },
];

/* -------------------- MAIN COMPONENT -------------------- */

const Services = () => {
    return (
        <motion.section 
            className="w-full py-16 flex flex-col items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold uppercase mb-12 text-center">
                Our Awesome Services
            </h2>

            <div className="max-w-7xl w-full px-6">
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 bg-linear-to-r from-[#119DA4]/10 to-[#FDE789]/10 py-10 px-6 rounded-3xl border border-white/20 shadow-lg">
                    {SERVICES.map((service) => (
                        <ServiceCard key={service.id} {...service} />
                    ))}
                </ul>
            </div>
        </motion.section>
    );
};

/* -------------------- SERVICE CARD -------------------- */

const ServiceCard = memo(({ Icon, title, desc }) => (
    <motion.li 
        className="flex items-start gap-4 p-6 rounded-2xl bg-white/80 backdrop-blur-md shadow-md hover:shadow-xl transition-all "
        whileHover={{ scale: 1.05 }}
    >
        <div className="shrink-0">
            <Icon className="w-10 h-10 bg-linear-to-r from-[#119DA4] to-[#FDE789] bg-clip-text text-transparent" />
        </div>

        <div>
            <h3 className="text-lg md:text-xl font-semibold">{title}</h3>
            <p className="text-sm text-gray-600 mt-1">{desc}</p>
        </div>
    </motion.li>
));

export default Services;
