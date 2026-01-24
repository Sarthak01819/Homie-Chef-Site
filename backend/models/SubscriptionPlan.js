import mongoose from "mongoose";

const dailyMealSchema = new mongoose.Schema(
    {
        day: {
            type: Number, // 1 → 30
            required: true,
        },

        lunch: {
            meal: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Meal",
                required: true,
            },
        },

        dinner: {
            meal: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Meal",
                required: true,
            },
        },
    },
    { _id: false }
);

const subscriptionPlanSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },

        category: {
            type: String,
            enum: ["pure-veg", "non-veg", "mixed"],
            required: true,
        },

        durationDays: {
            type: Number,
            enum: [7, 15, 30],
            required: true,
        },

        basePrice: {
            type: Number,
            required: true,
        },

        mealsByDay: {
            type: [dailyMealSchema],
            required: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model("SubscriptionPlan", subscriptionPlanSchema);
