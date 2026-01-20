import React, {
    useRef,
    useCallback,
    memo,
    useState,
} from "react";
import {
    ChevronLeft,
    ChevronRight,
    ShoppingCart,
} from "lucide-react";
import { motion } from "framer-motion";

/* -------------------- DATA -------------------- */

const dishes = [
    {
        id: 1,
        name: "Grilled Veg Bowl",
        price: "₹185",
        img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
    },
    {
        id: 2,
        name: "Paneer Steak",
        price: "₹220",
        img: "/images/paneer-steak.png",
    },
    {
        id: 3,
        name: "Healthy Salad",
        price: "₹160",
        img: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1",
    },
    {
        id: 4,
        name: "Italian Pasta",
        price: "₹199",
        img: "https://images.unsplash.com/photo-1525755662778-989d0524087e",
    },
    {
        id: 5,
        name: "Veggie Pizza",
        price: "₹249",
        img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=781&auto=format&fit=crop",
    },
    {
        id: 6,
        name: "Avocado Toast",
        price: "₹145",
        img: "https://images.unsplash.com/photo-1551183053-bf91a1d81141",
    },
    {
        id: 7,
        name: "Mexican Burrito Bowl",
        price: "₹210",
        img: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092",
    },
    {
        id: 8,
        name: "Veg Sushi Platter",
        price: "₹275",
        img: "https://images.unsplash.com/photo-1553621042-f6e147245754",
    },
    {
        id: 9,
        name: "Mediterranean Falafel",
        price: "₹195",
        img: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe",
    },
];

/* -------------------- MAIN COMPONENT -------------------- */

const Food = () => {
    const sliderRef = useRef(null);

    const scroll = useCallback((direction) => {
        if (!sliderRef.current) return;

        const card = sliderRef.current.querySelector(".dish-card");
        if (!card) return;

        const gap = 24; // same as gap-6
        const scrollAmount = card.offsetWidth + gap;

        sliderRef.current.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth",
        });
    }, []);

    return (
        <motion.section 
            className="w-full py-20 flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className="relative max-w-7xl w-full px-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-10">
                    <h2 className="text-3xl sm:text-4xl font-bold">
                        Popular Dishes
                    </h2>
                </div>

                {/* Slider Wrapper */}
                <div className="relative">
                    {/* Left Arrow */}
                    <button
                        onClick={() => scroll("left")}
                        className="
              hidden md:flex
              absolute left-2 top-1/2 -translate-y-1/2 z-20
              p-3 rounded-full
              bg-white/70 backdrop-blur-lg shadow-lg
              hover:bg-linear-to-r hover:from-[#4B0C37] hover:to-[#119DA4] hover:text-white
              transition-all duration-300
            "
                    >
                        <ChevronLeft />
                    </button>

                    {/* Slider */}
                    <div
                        ref={sliderRef}
                        className="
              flex gap-6
              overflow-x-auto
              px-6 md:px-16 py-4
              scroll-smooth
              snap-x snap-mandatory
              scrollbar-hide
            "
                    >
                        {dishes.map((dish) => (
                            <DishCard key={dish.id} dish={dish} />
                        ))}
                    </div>

                    {/* Right Arrow */}
                    <button
                        onClick={() => scroll("right")}
                        className="
              hidden md:flex
              absolute right-2 top-1/2 -translate-y-1/2 z-20
              p-3 rounded-full
              bg-white/70 backdrop-blur-lg shadow-lg
              hover:bg-linear-to-r hover:from-[#4B0C37] hover:to-[#119DA4] hover:text-white
              transition-all duration-300
            "
                    >
                        <ChevronRight />
                    </button>
                </div>
            </div>
        </motion.section>
    );
};

/* -------------------- DISH CARD -------------------- */

const DishCard = memo(({ dish }) => {
    const [loaded, setLoaded] = useState(false);

    return (
        <motion.div
            className="
        dish-card
        snap-start shrink-0
        w-65 sm:w-75
        rounded-3xl
        bg-white/30 backdrop-blur-xl
        border border-white/30
        shadow-lg hover:shadow-2xl
        transition
      "
            whileHover={{ scale: 1.05 }}
        >
            {/* Image */}
            <div className="relative h-52 overflow-hidden rounded-t-3xl">
                {!loaded && (
                    <div className="absolute inset-0 animate-pulse bg-linear-to-r from-gray-200/60 via-gray-300/60 to-gray-200/60" />
                )}

                <img
                    src={dish.img}
                    alt={dish.name}
                    loading="lazy"
                    decoding="async"
                    onLoad={() => setLoaded(true)}
                    onError={() => setLoaded(true)}
                    className={`h-full w-full object-cover transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"
                        }`}
                />

                <span className="absolute top-4 right-4 text-white text-sm px-3 py-1 rounded-full font-medium shadow-md" style={{ backgroundColor: '#2ECC71', color: '#FFFFFF' }}>
                    {dish.price}
                </span>
            </div>

            {/* Content */}
            <div className="p-5 flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold">{dish.name}</h3>
                    <p className="text-sm text-gray-600">Fresh & Healthy</p>
                </div>

                <button className="p-3 rounded-full bg-linear-to-r from-[#4B0C37] to-[#119DA4] text-white hover:from-[#119DA4] hover:to-[#4B0C37] transition-all duration-300 shadow-lg">
                    <ShoppingCart size={18} />
                </button>
            </div>
        </motion.div>
    );
});

export default Food;
