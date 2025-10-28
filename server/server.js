import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// 🧩 Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// ✅ Health check
app.get("/ping", (req, res) => {
  res.status(200).send("pong 🧠");
});

// ✅ Root route
app.get("/", (req, res) => {
  res.send("CampusCart API running 🛒");
});

// ✅ API Routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/chats", chatRoutes); // 💬 Chat system routes

// ❌ Not found middleware
app.use(notFound);

// 🧠 Error handler middleware
app.use(errorHandler);

// ⚡ Socket.io setup
const io = new Server(server, {
  cors: {
    origin: [
      "https://campus-cart-lilac.vercel.app",
      "http://localhost:5173",
    ],
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("🟢 New user connected");

  socket.on("joinChat", (userId) => {
    socket.join(userId);
    console.log(`👤 User joined room: ${userId}`);
  });

  socket.on("sendMessage", (msg) => {
    // Deliver message to both sender & receiver
    io.to(msg.receiver).emit("newMessage", msg);
    io.to(msg.sender).emit("newMessage", msg);
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected");
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT} (CampusCart Chat Live)`)
);