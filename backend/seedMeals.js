import mongoose from "mongoose";
import dotenv from "dotenv";
import Meal from "./models/Meal.js";

dotenv.config();

const meals = [
    // 🟢 VEG MEALS
    {
        name: "Paneer Protein Bowl",
        type: "veg",
        price: 249,
        image:
            "https://res.cloudinary.com/demo/image/upload/paneer-bowl.jpg",
        macros: {
            protein: 28,
            carbs: 32,
            fats: 12,
            calories: 380,
        },
    },
    {
        name: "Veggie Salad Supreme",
        type: "veg",
        price: 199,
        image:
            "https://res.cloudinary.com/demo/image/upload/veggie-salad.jpg",
        macros: {
            protein: 12,
            carbs: 20,
            fats: 8,
            calories: 210,
        },
    },

    // 🔴 NON-VEG MEALS
    {
        name: "Grilled Chicken Meal",
        type: "non-veg",
        price: 299,
        image:
            "https://res.cloudinary.com/demo/image/upload/grilled-chicken.jpg",
        macros: {
            protein: 35,
            carbs: 18,
            fats: 10,
            calories: 420,
        },
    },
    {
        name: "Chicken Rice Bowl",
        type: "non-veg",
        price: 279,
        image:
            "https://res.cloudinary.com/demo/image/upload/chicken-rice.jpg",
        macros: {
            protein: 32,
            carbs: 40,
            fats: 9,
            calories: 460,
        },
    },
];

const seedMeals = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected ✅");

        await Meal.deleteMany();
        await Meal.insertMany(meals);

        console.log("Meals seeded successfully 🍽️");
        process.exit();
    } catch (error) {
        console.error("Seeding failed ❌", error);
        process.exit(1);
    }
};

seedMeals();
