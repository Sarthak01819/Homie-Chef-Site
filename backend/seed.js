import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

import User from "./models/User.js";
import Order from "./models/Order.js";

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected for seeding ✅");

    // Clear old data
    await User.deleteMany();
    await Order.deleteMany();

    // Create user
    const hashedPassword = await bcrypt.hash("1234", 10);

    const user = await User.create({
      name: "Sarthak",
      email: "user@homiechef.com",
      password: hashedPassword,
    });

    // Create orders
    await Order.insertMany([
      {
        userId: user._id,
        items: ["Paneer Bowl", "Salad"],
        total: "₹385",
        status: "Delivered",
        date: "2026-01-04",
      },
      {
        userId: user._id,
        items: ["Veg Sushi", "Pasta"],
        total: "₹475",
        status: "Delivered",
        date: "2026-01-07",
      },
    ]);

    console.log("Database seeded successfully 🌱");
    process.exit();
  } catch (error) {
    console.error("Seeding failed ❌", error);
    process.exit(1);
  }
};

seedDatabase();
