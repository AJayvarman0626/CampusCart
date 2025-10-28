import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Send, ArrowLeft, MoreVertical, Trash2 } from "lucide-react";
import { io } from "socket.io-client";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const ENDPOINT = "https://campuscart-server.onrender.com"; // backend URL

const ChatPage = () => {
  const { user } = useAuth();
  const { id } = useParams(); // receiver ID
  const navigate = useNavigate();
  const [receiver, setReceiver] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [isDark, setIsDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const socket = useRef(null);
  const chatEndRef = useRef(null);

  // 🌗 Theme
  useEffect(() => {
    const updateTheme = () =>
      setIsDark(document.documentElement.classList.contains("dark"));
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // 🧠 Fetch receiver & messages
  useEffect(() => {
    const fetchChat = async () => {
      try {
        const { data: receiverData } = await api.get(`/api/users/${id}`);
        setReceiver(receiverData);

        const { data: messagesData } = await api.get(`/api/chats/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setMessages(messagesData);
      } catch (error) {
        console.error("Chat load failed", error);
      }
    };
    fetchChat();
  }, [id, user]);

  // ⚡ Socket setup
  useEffect(() => {
    socket.current = io(ENDPOINT);
    socket.current.emit("joinChat", user._id);

    socket.current.on("newMessage", (msg) => {
      if (msg.sender === id || msg.receiver === id) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      socket.current.disconnect();
    };
  }, [id, user]);

  // 🧹 Scroll down on message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✉️ Send message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.trim()) return;

    const message = {
      sender: user._id,
      receiver: id,
      content: newMsg,
      createdAt: new Date().toISOString(),
    };

    setMessages([...messages, message]);
    setNewMsg("");

    socket.current.emit("sendMessage", message);

    try {
      await api.post(`/api/chats/${id}`, message, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  // 🧨 Clear chat
  const clearChat = async () => {
    if (!window.confirm("Clear entire chat?")) return;
    try {
      await api.delete(`/api/chats/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setMessages([]);
    } catch (err) {
      console.error("Failed to clear chat", err);
    }
  };

  return (
    <main
      className={`pt-24 min-h-screen flex flex-col transition-colors duration-500 ${
        isDark ? "bg-[#0f0f0f] text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* 🔝 Header */}
      <div
        className={`flex items-center justify-between px-4 py-3 border-b ${
          isDark ? "border-gray-700 bg-[#121212]" : "border-gray-300 bg-white"
        }`}
      >
        <div className="flex items-center gap-3">
          <ArrowLeft
            className="cursor-pointer"
            onClick={() => navigate("/messages")}
          />
          <img
            src={
              receiver?.profilePic ||
              `https://ui-avatars.com/api/?name=${receiver?.name}&background=random`
            }
            alt="receiver"
            className="w-10 h-10 rounded-full object-cover border"
          />
          <div>
            <p className="font-semibold">{receiver?.name || "User"}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {receiver?.stream || "Student"}
            </p>
          </div>
        </div>
        <div className="relative">
          <MoreVertical
            className="cursor-pointer"
            onClick={() => setMenuOpen(!menuOpen)}
          />
          {menuOpen && (
            <div
              className={`absolute right-0 mt-2 rounded-lg shadow-lg border text-sm ${
                isDark
                  ? "bg-[#1a1a1a] border-gray-700 text-gray-100"
                  : "bg-white border-gray-300 text-gray-800"
              }`}
            >
              <button
                onClick={clearChat}
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left"
              >
                <Trash2 size={14} /> Clear Chat
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 💬 Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.sender === user._id ? "justify-end" : "justify-start"
            }`}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`max-w-xs sm:max-w-sm px-3 py-2 rounded-2xl shadow ${
                msg.sender === user._id
                  ? "bg-blue-600 text-white"
                  : isDark
                  ? "bg-gray-800 text-gray-100"
                  : "bg-gray-200 text-gray-900"
              }`}
            >
              {msg.content}
            </motion.div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* 📝 Input */}
      <form
        onSubmit={sendMessage}
        className={`flex items-center gap-3 px-4 py-3 border-t ${
          isDark ? "border-gray-700 bg-[#121212]" : "border-gray-300 bg-white"
        }`}
      >
        <input
          type="text"
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          placeholder="Type your message..."
          className={`flex-1 rounded-full px-4 py-2 outline-none ${
            isDark
              ? "bg-gray-800 border border-gray-700 text-gray-100"
              : "bg-gray-100 border border-gray-300 text-gray-900"
          }`}
        />
        <button
          type="submit"
          className={`p-3 rounded-full ${
            isDark
              ? "bg-blue-500 hover:bg-blue-600"
              : "bg-blue-600 hover:bg-blue-700"
          } text-white`}
        >
          <Send size={18} />
        </button>
      </form>
    </main>
  );
};

export default ChatPage;