import mongoose from "mongoose";

const macroSchema = new mongoose.Schema(
  {
    calories: Number,
    protein: Number,
    carbs: Number,
    fats: Number,
  },
  { _id: false }
);

const mealItemSchema = new mongoose.Schema(
  {
    name: String,          // roti, rice, salad
    quantity: String,      // 2 pcs, 1 bowl
  },
  { _id: false }
);

const mealSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    image: String,

    price: Number,

    items: {
      type: [mealItemSchema],
      default: [],
    },

    macros: {
      type: macroSchema,
      required: true,
    },

    category: {
      type: String,
      enum: ["veg", "non-veg"],
      default: "veg",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Meal", mealSchema);
