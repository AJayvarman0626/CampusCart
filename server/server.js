import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();
connectDB();

const app = express();

// 🧩 Debug logs for import checks
console.log("🧩 userRoutes import:", typeof userRoutes);
console.log("🧩 productRoutes import:", typeof productRoutes);

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// ✅ Root route
app.get("/", (req, res) => {
  res.send("CampusCart API running 🛒");
});

// ✅ Mount your routes BEFORE error handlers
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);

console.log("✅ Mounted routes: /api/users, /api/products");

// ❌ If no route matches → trigger notFound
app.use(notFound);

// 🧩 Centralized error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
