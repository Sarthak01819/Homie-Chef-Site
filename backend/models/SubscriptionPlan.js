import mongoose from "mongoose";

const dailyMealSchema = new mongoose.Schema(
    {
        day: {
            type: String,
            required: true, // Monday, Tuesday, etc.
        },
        meal: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Meal",
            required: true,
        },
    },
    { _id: false }
);

const subscriptionPlanSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true, // Weekly / Monthly
        },

        category: {
            type: String,
            enum: ["pure-veg", "non-veg", "mixed"],
            required: true,
        },

        durationDays: {
            type: Number,
            required: true, // 7 or 30
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
