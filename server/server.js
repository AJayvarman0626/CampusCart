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

// 🧩 Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// ✅ Health check (for uptime monitoring)
app.get("/ping", (req, res) => {
  res.status(200).send("pong 🧠");
});

// ✅ Root route
app.get("/", (req, res) => {
  res.send("CampusCart API running 🛒");
});

// ✅ Routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);

// ❌ Not found middleware
app.use(notFound);

// 🧠 Error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT} (CampusCart API Live)`)
);