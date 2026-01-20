import mongoose from "mongoose";
import dotenv from "dotenv";
import Meal from "../models/Meal.js";

dotenv.config();

/* =========================
   VEG MEALS ONLY
========================= */
const meals = [
  {
    name: "Paneer Butter Masala",
    type: "veg",
    price: 249,
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398",
    macros: { calories: 420, protein: 18, carbs: 32, fats: 22 },
  },
  {
    name: "Veg Biryani",
    type: "veg",
    price: 229,
    image: "https://images.unsplash.com/photo-1600628422019-6cbe6b59d9a9",
    macros: { calories: 390, protein: 10, carbs: 55, fats: 12 },
  },
  {
    name: "Dal Tadka",
    type: "veg",
    price: 199,
    image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46",
    macros: { calories: 280, protein: 14, carbs: 30, fats: 8 },
  },
  {
    name: "Chole Bhature",
    type: "veg",
    price: 219,
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950",
    macros: { calories: 450, protein: 16, carbs: 48, fats: 20 },
  },
  {
    name: "Rajma Rice",
    type: "veg",
    price: 209,
    image: "https://images.unsplash.com/photo-1626509653291-90cddf2b88a5",
    macros: { calories: 410, protein: 15, carbs: 52, fats: 10 },
  },
  {
    name: "Aloo Gobi",
    type: "veg",
    price: 189,
    image: "https://images.unsplash.com/photo-1604908554164-0c1c3fa2c52d",
    macros: { calories: 260, protein: 6, carbs: 28, fats: 12 },
  },
  {
    name: "Palak Paneer",
    type: "veg",
    price: 239,
    image: "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56",
    macros: { calories: 360, protein: 20, carbs: 24, fats: 18 },
  },
];

const seedMeals = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    await Meal.deleteMany({}); // clear existing meals
    await Meal.insertMany(meals);

    console.log("✅ Veg meals seeded successfully");
    process.exit();
  } catch (err) {
    console.error("❌ Meal seeding failed:", err.message);
    process.exit(1);
  }
};

seedMeals();
