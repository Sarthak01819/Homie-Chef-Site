import express from "express";
import Meal from "../models/Meal.js";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

/* =========================
   GET ALL MEALS
========================= */
router.get("/", async (req, res) => {
  try {
    const meals = await Meal.find();
    res.json(meals);
  } catch {
    res.status(500).json({ message: "Failed to fetch meals" });
  }
});

/* =========================
   GET FAVOURITES  ✅ MUST BE ON TOP
========================= */
router.get("/favourites", protect, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate("favourites");
    res.json(user.favourites || []);
  } catch (err) {
    console.error("FETCH FAVOURITES ERROR:", err);
    res.status(500).json({ message: "Failed to fetch favourites" });
  }
});


/* =========================
   ADD TO CART (WITH QUANTITY)
========================= */
router.post("/:mealId/cart", protect, async (req, res) => {
  try {
    const { mealId } = req.params;
    const user = await User.findById(req.userId);

    const item = user.cart.find(
      (i) => i.meal.toString() === mealId
    );

    if (item) {
      item.quantity += 1; // ✅ increment
    } else {
      user.cart.push({ meal: mealId, quantity: 1 });
    }

    await user.save();
    res.json({ cart: user.cart });
  } catch (err) {
    console.error("ADD TO CART ERROR:", err);
    res.status(500).json({ message: "Failed to add to cart" });
  }
});

/* =========================
   UPDATE CART QUANTITY
========================= */
router.patch("/:mealId/cart", protect, async (req, res) => {
  try {
    const { mealId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Quantity must be ≥ 1" });
    }

    const user = await User.findById(req.userId);
    const item = user.cart.find(
      (i) => i.meal.toString() === mealId
    );

    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    item.quantity = quantity;
    await user.save();

    res.json({ cart: user.cart });
  } catch (err) {
    console.error("UPDATE QTY ERROR:", err);
    res.status(500).json({ message: "Failed to update quantity" });
  }
});

/* =========================
   GET CART (WITH QUANTITY)
========================= */
router.get("/cart", protect, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate("cart.meal");

    // 🔥 Normalize cart safely
    const fixedCart = [];

    for (const item of user.cart) {
      // CASE 1: Proper format
      if (item.meal && item.quantity) {
        fixedCart.push({
          ...item.meal.toObject(),
          quantity: item.quantity,
        });
        continue;
      }

      // CASE 2: Legacy ObjectId-only cart item
      if (item instanceof Object && item._id && !item.meal) {
        const meal = await Meal.findById(item._id);
        if (meal) {
          fixedCart.push({
            ...meal.toObject(),
            quantity: 1,
          });
        }
      }
    }

    // 🔁 Auto-migrate DB cart (one-time silent fix)
    user.cart = fixedCart.map((i) => ({
      meal: i._id,
      quantity: i.quantity,
    }));
    await user.save();

    res.json(fixedCart);
  } catch (err) {
    console.error("FETCH CART ERROR:", err);
    res.status(500).json({ message: "Failed to fetch cart" });
  }
});

/* =========================
   REMOVE FROM CART
========================= */
router.delete("/:mealId/cart", protect, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    user.cart = user.cart.filter(
      (i) => i.meal.toString() !== req.params.mealId
    );

    await user.save();
    res.json({ cart: user.cart });
  } catch {
    res.status(500).json({ message: "Failed to remove item" });
  }
});

router.post("/:mealId/favourite", protect, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const { mealId } = req.params;

    const index = user.favourites.findIndex(
      (id) => id.toString() === mealId
    );

    if (index > -1) {
      user.favourites.splice(index, 1);
    } else {
      user.favourites.push(mealId);
    }

    await user.save();

    res.json({ favourites: user.favourites });
  } catch (err) {
    console.error("FAVOURITE ERROR:", err);
    res.status(500).json({ message: "Failed to toggle favourite" });
  }
});

export default router;
