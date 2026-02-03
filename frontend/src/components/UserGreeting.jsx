import { motion } from "framer-motion";
import { Sun, Sunset, Moon, Coffee } from "lucide-react";

const getGreetingConfig = () => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
        return {
            text: "Good Morning",
            icon: <Sun size={26} />,
            bg: "bg-linear-to-br from-[#6EC1E4] to-[#BFE6FF] text-[#0F2A44]",
            accent: "text-[#0F2A44]",
        };
    }

    if (hour >= 12 && hour < 17) {
        return {
            text: "Good Afternoon",
            icon: <Coffee size={26} />,
            bg: "bg-linear-to-br from-[#F5C84C] to-[#FFE9A8]",
            accent: "text-[#5A3A00]",
        };
    }

    if (hour >= 17 && hour < 21) {
        return {
            text: "Good Evening",
            icon: <Sunset size={26} />,
            bg: "bg-linear-to-br from-[#E68A3A] to-[#8B5A2B]",
            accent: "text-white",
        };
    }

    return {
        text: "Good Night",
        icon: <Moon size={26} />,
        bg: "bg-linear-to-br from-[#1F1C2C] to-[#27497C]",
        accent: "text-white",
    };
};

const UserGreeting = ({ name }) => {
    const { text, icon, bg, accent } = getGreetingConfig();

    // ✅ SAFE NAME RESOLUTION
    const displayName =
        typeof name === "string" && name.trim().length > 0
            ? name.trim()
            : "User";

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={`
        rounded-3xl p-6 md:p-8 
        shadow-2xl backdrop-blur-xl mt-10 mx-12
        ${bg}
      `}
        >
            <div className="flex items-center gap-4">
                <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 6 }}
                    className={`p-3 rounded-2xl bg-white/30 ${accent}`}
                >
                    {icon}
                </motion.div>

                <div className="flex justify-between items-center w-full">
                    <h2 className={`text-2xl md:text-3xl font-bold ${accent}`}>
                        {text}, {displayName} 👋
                    </h2>
                    <p className={`text-sm md:text-base mt-1 ${accent}/80`}>
                        Hope you’re having a great day with Homie Chef
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default UserGreeting;
