import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
    ShieldCheck,
    Heart,
    BadgeCheck
} from "lucide-react";

const reasons = [
    {
        id: 1,
        Icon: ShieldCheck,
        title: "Hygienic & Safe",
        desc: "Prepared in hygienic kitchens following safety standards.",
        delay: 0
    },
    {
        id: 2,
        Icon: Heart,
        title: "Nutrition First",
        desc: "Balanced meals crafted to support a healthy lifestyle.",
        delay: 0.1
    },
    {
        id: 3,
        Icon: BadgeCheck,
        title: "Trusted by Customers",
        desc: "Loved by hundreds of customers for taste & consistency.",
        delay: 0.2
    }
];

const WhyUsCard = ({ Icon, title, desc, delay, index }) => {
    const ref = useRef(null);
    const { scrollY } = useScroll();
    const y = useTransform(scrollY, [0, 1000], [0, index === 1 ? 0 : index === 0 ? 40 : -40]);

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
            style={{ y }}
            className="relative group"
        >
            <motion.div
                whileHover={{
                    scale: 1.06,
                    rotateY: 5,
                    boxShadow: "0 20px 40px rgba(17, 157, 164, 0.2)"
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative bg-white p-8 rounded-3xl shadow-md text-center overflow-hidden h-full"
            >
                {/* Animated background gradient */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-[#119DA4]/0 via-transparent to-[#119DA4]/0 group-hover:from-[#119DA4]/5 group-hover:to-[#119DA4]/10"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                />

                <div className="relative z-10">
                    {/* Animated Icon Container */}
                    <motion.div
                        className="mb-4 mx-auto w-fit"
                        whileHover={{ rotate: -15, scale: 1.3 }}
                        transition={{ type: "spring", stiffness: 250, damping: 15 }}
                    >
                        <motion.div
                            className="inline-block"
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <Icon size={34} className="text-[#119DA4]" />
                        </motion.div>
                    </motion.div>

                    <h3 className="text-xl font-semibold mb-3">
                        {title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                        {desc}
                    </p>
                </div>

                {/* Animated bottom accent line */}
                <motion.div
                    className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#119DA4] to-transparent"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                />
            </motion.div>
        </motion.div>
    );
};

const Whyus = () => {
    const containerRef = useRef(null);
    const { scrollY } = useScroll();
    const opacity = useTransform(scrollY, [0, 500], [0.5, 1]);

    return (
        <section ref={containerRef} className="py-20 bg-gray-50">
            <div className="max-w-6xl mx-auto px-6">
                <motion.h2
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-3xl md:text-4xl font-bold text-center mb-12"
                >
                    Why Choose Homie Chef?
                </motion.h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {reasons.map((reason, index) => (
                        <WhyUsCard
                            key={reason.id}
                            {...reason}
                            index={index}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Whyus;
