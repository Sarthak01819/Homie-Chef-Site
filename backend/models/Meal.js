import mongoose from "mongoose";

const mealSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        type: {
            type: String,
            enum: ["veg", "non-veg"],
            required: true,
        },

        price: {
            type: Number,
            required: true,
        },

        image: {
            type: String, // Cloudinary image URL
            required: true,
        },

        macros: {
            protein: {
                type: Number,
                required: true,
            },
            carbs: {
                type: Number,
                required: true,
            },
            fats: {
                type: Number,
                required: true,
            },
            calories: {
                type: Number,
                required: true,
            },
        },

        avgRating: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Meal", mealSchema);
