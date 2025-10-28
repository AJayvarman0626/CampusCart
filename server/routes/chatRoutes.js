import express from "express";
import { getChats, accessChat, sendMessage } from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all chats for logged-in user / create new
router.route("/").get(protect, getChats).post(protect, accessChat);

// Send a message
router.route("/message").post(protect, sendMessage);

export default router;