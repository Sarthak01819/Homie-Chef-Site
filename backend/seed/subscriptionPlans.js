import mongoose from "mongoose";
import dotenv from "dotenv";

import Meal from "../models/Meal.js";
import SubscriptionPlan from "../models/SubscriptionPlan.js";

dotenv.config();

const seedSubscriptions = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected");

        /* =========================
           ENRICH VEG MEALS WITH ITEMS
        ========================= */
        const vegMeals = await Meal.find({ category: "veg" });

        if (vegMeals.length === 0) {
            throw new Error("No veg meals found. Seed meals first.");
        }

        const defaultItems = [
            { name: "Roti", quantity: "3 pcs" },
            { name: "Rice", quantity: "1 bowl" },
            { name: "Salad", quantity: "1 serving" },
            { name: "Pickle", quantity: "1 tbsp" },
            { name: "Gulab Jamun", quantity: "2 pcs" },
            { name: "Raita / Dahi", quantity: "1 bowl" },
        ];

        for (const meal of vegMeals) {
            if (!meal.items || meal.items.length === 0) {
                meal.items = defaultItems;
                await meal.save();
            }
        }

        console.log("✅ Veg meals enriched with included items");

        /* =========================
           CLEAR EXISTING PLANS
        ========================= */
        await SubscriptionPlan.deleteMany();

        /* =========================
           HELPER: BUILD DAY MAP
        ========================= */
        const buildMealsByDay = (days) =>
            Array.from({ length: days }).map((_, index) => ({
                day: index + 1,
                lunch: {
                    meal: vegMeals[index % vegMeals.length]._id,
                },
                dinner: {
                    meal: vegMeals[(index + 1) % vegMeals.length]._id,
                },
            }));

        /* =========================
           SUBSCRIPTION PLANS (PURE VEG)
        ========================= */
        const plans = [
            {
                name: "7 Days Veg Plan",
                durationDays: 7,
                category: "pure-veg",
                basePrice: 3499,
                mealsByDay: buildMealsByDay(7),
            },
            {
                name: "15 Days Veg Plan",
                durationDays: 15,
                category: "pure-veg",
                basePrice: 7999,
                mealsByDay: buildMealsByDay(15),
            },
            {
                name: "30 Days Veg Plan",
                durationDays: 30,
                category: "pure-veg",
                basePrice: 9999,
                mealsByDay: buildMealsByDay(30),
            },
        ];

        await SubscriptionPlan.insertMany(plans);

        console.log("✅ Veg subscription plans (7 / 15 / 30 days) seeded successfully");
        process.exit();
    } catch (error) {
        console.error("❌ Subscription seeding failed:", error.message);
        process.exit(1);
    }
};

seedSubscriptions();
