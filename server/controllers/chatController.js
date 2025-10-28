import asyncHandler from "express-async-handler";
import Chat from "../models/chatModel.js";
import Message from "../models/messageModel.js";
import User from "../models/userModel.js";

// 📩 Get all chats for logged-in user
export const getChats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const chats = await Chat.find({ users: { $in: [userId] } })
    .populate("users", "name profilePic email")
    .populate({
      path: "lastMessage",
      populate: { path: "sender receiver", select: "name profilePic" },
    })
    .sort({ updatedAt: -1 });

  res.json(chats);
});

// 💬 Create or get chat between two users
export const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).send("User ID required");

  let chat = await Chat.findOne({
    users: { $all: [req.user._id, userId] },
  })
    .populate("users", "name profilePic email")
    .populate("lastMessage");

  if (!chat) {
    chat = await Chat.create({ users: [req.user._id, userId] });
    chat = await Chat.findById(chat._id).populate("users", "name profilePic");
  }

  res.json(chat);
});

// 📨 Send a message
export const sendMessage = asyncHandler(async (req, res) => {
  const { content, receiver } = req.body;
  if (!content || !receiver)
    return res.status(400).send("Missing content or receiver");

  const message = await Message.create({
    sender: req.user._id,
    receiver,
    content,
  });

  let chat = await Chat.findOne({
    users: { $all: [req.user._id, receiver] },
  });

  if (!chat) {
    chat = await Chat.create({ users: [req.user._id, receiver] });
  }

  chat.lastMessage = message._id;
  await chat.save();

  res.json(message);
});