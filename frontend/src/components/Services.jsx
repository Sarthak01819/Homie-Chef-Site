import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
    Utensils,
    Truck,
    CalendarCheck,
    Leaf
} from "lucide-react";

const services = [
    {
        id: 1,
        Icon: Utensils,
        title: "Freshly Cooked Meals",
        desc: "Meals are prepared fresh every day with quality ingredients.",
        delay: 0
    },
    {
        id: 2,
        Icon: Truck,
        title: "Daily Doorstep Delivery",
        desc: "Hot meals delivered to your doorstep, right on time.",
        delay: 0.1
    },
    {
        id: 3,
        Icon: CalendarCheck,
        title: "Flexible Subscription",
        desc: "Choose 7, 15 or 30 day plans as per your lifestyle.",
        delay: 0.2
    },
    {
        id: 4,
        Icon: Leaf,
        title: "100% Pure Veg",
        desc: "Healthy vegetarian meals designed for daily nutrition.",
        delay: 0.3
    }
];

const ServiceCard = ({ Icon, title, desc, delay, index }) => {
    const ref = useRef(null);
    const { scrollY } = useScroll();
    const y = useTransform(scrollY, [0, 1000], [0, index % 2 === 0 ? 50 : -50]);

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay }}
            style={{ y }}
            className="relative group"
        >
            <motion.div
                whileHover={{ scale: 1.08, rotateZ: 2 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="h-full p-6 rounded-2xl border border-gray-200 bg-gray-50 cursor-pointer overflow-hidden"
            >
                {/* Background glow effect */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-[#119DA4]/0 to-[#119DA4]/0 group-hover:from-[#119DA4]/5 group-hover:to-[#119DA4]/10 rounded-2xl"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                />

                <div className="relative z-10">
                    {/* Animated Icon */}
                    <motion.div
                        whileHover={{ rotate: 360, scale: 1.2 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className="mb-4 inline-block"
                    >
                        <Icon size={32} className="text-[#119DA4]" />
                    </motion.div>

                    <h3 className="text-lg font-semibold mb-2">
                        {title}
                    </h3>
                    <p className="text-sm text-gray-600">
                        {desc}
                    </p>
                </div>

                {/* Animated border on hover */}
                <motion.div
                    className="absolute inset-0 rounded-2xl border-2 border-[#119DA4]"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                />
            </motion.div>
        </motion.div>
    );
};

const Services = () => {
    return (
        <section className="pt-20 pb-12 bg-white">
            <div className="max-w-6xl mx-auto px-6">
                <motion.h2
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-3xl md:text-4xl font-bold text-center mb-12"
                >
                    Our Services
                </motion.h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {services.map((service, index) => (
                        <ServiceCard
                            key={service.id}
                            {...service}
                            index={index}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Services;
