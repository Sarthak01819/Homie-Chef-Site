import React, { memo } from "react";
import {
    CookingPot,
    Gem,
    IndianRupee,
    TruckElectric,
} from "lucide-react";

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
        <section className="w-full py-16 flex flex-col items-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold uppercase mb-12 text-center">
                Why Choose Us
            </h2>

            <div className="max-w-7xl w-full px-6">
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {WHY_US.map((item) => (
                        <WhyUsCard key={item.id} {...item} />
                    ))}
                </ul>
            </div>
        </section>
    );
};

/* -------------------- CARD -------------------- */

const WhyUsCard = memo(({ Icon, title, desc }) => (
    <li className="flex flex-col items-center text-center gap-4 p-6 rounded-2xl shadow-md bg-white/80 backdrop-blur-md hover:shadow-xl transition-all">
        <Icon className="w-12 h-12 text-green-600" />
        <h3 className="text-lg md:text-xl font-semibold">{title}</h3>
        <p className="text-sm text-gray-600">{desc}</p>
    </li>
));

export default Whyus;
