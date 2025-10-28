// server.js (replace your current file)
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

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// --- make root & health-check robust for GET + HEAD ---
// GET root (friendly)
app.get("/", (req, res) => {
  res.status(200).send("CampusCart API running 🛒");
});
// HEAD root (health checks / proxies may use HEAD)
app.head("/", (req, res) => {
  res.sendStatus(200);
});

// Health check (GET + HEAD)
app.get("/ping", (req, res) => res.status(200).send("pong 🧠"));
app.head("/ping", (req, res) => res.sendStatus(200));

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/chats", chatRoutes);

// If you ever serve static frontend from the same server, you can mount it here.
// app.use(express.static(path.join(__dirname, "client", "dist")));

// Not found middleware (must be after routes)
app.use(notFound);

// Error handler (last)
app.use(errorHandler);

// SOCKET.IO SETUP 🚀
const io = new Server(server, {
  cors: {
    origin: [
      "https://campus-cart-lilac.vercel.app",
      "http://localhost:5173",
      // add your front-end domain(s) here
    ],
    methods: ["GET", "POST", "DELETE"],
  },
});

io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  socket.on("joinChat", (userId) => {
    socket.join(userId);
    console.log(`👤 User joined room: ${userId}`);
  });

  socket.on("sendMessage", (msg) => {
    // deliver to receiver and sender rooms
    if (msg?.receiver) io.to(msg.receiver).emit("newMessage", msg);
    if (msg?.sender) io.to(msg.sender).emit("newMessage", msg);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT} (CampusCart Chat Live)`)
);