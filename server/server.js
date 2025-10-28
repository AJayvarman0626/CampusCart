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

// Routes
app.get("/ping", (req, res) => res.send("pong 🧠"));
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/chats", chatRoutes);
app.use(notFound);
app.use(errorHandler);

// ⚡ SOCKET.IO
const io = new Server(server, {
  cors: {
    origin: ["https://campus-cart-lilac.vercel.app", "http://localhost:5173"],
    methods: ["GET", "POST", "DELETE"],
  },
});

const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  // 🧠 When user joins
  socket.on("joinUser", (userId) => {
    if (!userId) return;
    onlineUsers.set(userId, socket.id);
    console.log(`👤 ${userId} online`);
    io.emit("userStatusUpdate", { userId, status: "online" });
  });

  // 💬 Message send
  socket.on("sendMessage", (msg) => {
    const { sender, receiver } = msg;
    console.log(`✉️ Message from ${sender} to ${receiver}`);
    io.to(onlineUsers.get(receiver)).emit("newMessage", msg);
    io.to(onlineUsers.get(sender)).emit("messageSentAck", msg);
  });

  // 🧠 When chat opened -> mark seen
  socket.on("markSeen", ({ chatWith, userId }) => {
    io.to(onlineUsers.get(chatWith)).emit("messageSeenAck", { seenBy: userId });
  });

  // 🔴 On disconnect
  socket.on("disconnect", () => {
    const offlineUser = [...onlineUsers.entries()].find(([_, sid]) => sid === socket.id);
    if (offlineUser) {
      const [userId] = offlineUser;
      onlineUsers.delete(userId);
      io.emit("userStatusUpdate", { userId, status: "offline" });
      console.log(`🔴 ${userId} offline`);
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));