import React, { memo } from "react";
import {
    CalendarCheck,
    ChefHat,
    ClockFading,
    Library,
    Salad,
    Sprout,
    Utensils,
} from "lucide-react";

/* -------------------- DATA -------------------- */

const SERVICES = [
    {
        id: 1,
        Icon: Utensils,
        title: "Personalized Meal Plans",
        desc: "Tailored to your dietary preferences and health goals.",
    },
    {
        id: 2,
        Icon: Salad,
        title: "Fresh Ingredients",
        desc: "Sourced from local farms and delivered to your doorstep.",
    },
    {
        id: 3,
        Icon: ChefHat,
        title: "Expert Nutritionists",
        desc: "Consultations to help you make informed food choices.",
    },
    {
        id: 4,
        Icon: CalendarCheck,
        title: "Flexible Subscriptions",
        desc: "Pause, skip, or cancel anytime with no hassle.",
    },
    {
        id: 5,
        Icon: Library,
        title: "Recipe Ideas",
        desc: "Access to a library of delicious and healthy recipes.",
    },
    {
        id: 6,
        Icon: ClockFading,
        title: "24/7 Customer Support",
        desc: "We're here to help you anytime you need assistance.",
    },
    {
        id: 7,
        Icon: Sprout,
        title: "Eco-Friendly Packaging",
        desc: "Committed to sustainability and reducing waste.",
    },
];

/* -------------------- MAIN COMPONENT -------------------- */

const Services = () => {
    return (
        <section className="w-full py-16 flex flex-col items-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold uppercase mb-12 text-center">
                Our Awesome Services
            </h2>

            <div className="max-w-7xl w-full px-6">
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {SERVICES.map((service) => (
                        <ServiceCard key={service.id} {...service} />
                    ))}
                </ul>
            </div>
        </section>
    );
};

/* -------------------- SERVICE CARD -------------------- */

const ServiceCard = memo(({ Icon, title, desc }) => (
    <li className="flex items-start gap-4 p-6 rounded-2xl bg-white/80 backdrop-blur-md shadow-md hover:shadow-xl transition-all">
        <div className="shrink-0">
            <Icon className="w-10 h-10 text-green-600" />
        </div>

        <div>
            <h3 className="text-lg md:text-xl font-semibold">{title}</h3>
            <p className="text-sm text-gray-600 mt-1">{desc}</p>
        </div>
    </li>
));

export default Services;
