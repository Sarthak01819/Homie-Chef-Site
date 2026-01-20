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
           CLEAR EXISTING PLANS
        ========================= */
        await SubscriptionPlan.deleteMany();

        /* =========================
           FETCH VEG MEALS
        ========================= */
        const vegMeals = await Meal.find({ type: "veg" });

        if (vegMeals.length === 0) {
            throw new Error("No veg meals found. Seed meals first.");
        }

        /* =========================
           HELPER: BUILD DAY MAP
        ========================= */
        const buildMealsByDay = (days) =>
            Array.from({ length: days }).map((_, index) => ({
                day: `Day ${index + 1}`,
                meal: vegMeals[index % vegMeals.length]._id,
            }));

        /* =========================
           SUBSCRIPTION PLANS (PURE VEG)
        ========================= */
        const plans = [
            {
                name: "7 Days Veg Plan",
                durationDays: 7,
                category: "pure-veg", // ✅ VALID ENUM
                basePrice: 3499,
                mealsByDay: buildMealsByDay(7),
            },
            {
                name: "15 Days Veg Plan",
                durationDays: 15,
                category: "pure-veg", // ✅ VALID ENUM
                basePrice: 7999,
                mealsByDay: buildMealsByDay(15),
            },
            {
                name: "30 Days Veg Plan",
                durationDays: 30,
                category: "pure-veg", // ✅ VALID ENUM
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
