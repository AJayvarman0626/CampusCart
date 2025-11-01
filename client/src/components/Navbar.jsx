import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Moon,
  Sun,
  MessageCircle,
  Home,
  Search,
  User,
  Upload,
} from "lucide-react";

const LAST_SEEN_KEY = "campuscart_lastSeenMessages";

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [darkMode, setDarkMode] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);

  // 🌗 Theme setup
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") === "dark";
    setDarkMode(savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme);
  }, []);

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
    document.documentElement.classList.toggle("dark", newMode);
  };

  // 💬 Unread message detection
  useEffect(() => {
    if (!user?._id) return;

    const checkUnread = async () => {
      try {
        const stored = JSON.parse(localStorage.getItem(LAST_SEEN_KEY)) || {};

        const res = await fetch(
          `https://campuscart-server.onrender.com/api/chats`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );
        const chats = await res.json();

        let unreadExist = false;
        chats.forEach((chat) => {
          const other = chat.users?.find((u) => u._id !== user._id);
          if (!other) return;
          const lastMsgTime = new Date(
            chat.lastMessage?.createdAt || chat.updatedAt
          ).getTime();
          const seenTime = stored[other._id] || 0;
          if (lastMsgTime > seenTime) unreadExist = true;
        });

        setHasUnread(unreadExist);
        if (unreadExist) setIsBlinking(true);
      } catch (err) {
        console.error("Unread check failed:", err);
      }
    };

    checkUnread();
    const interval = setInterval(checkUnread, 5000);
    return () => clearInterval(interval);
  }, [user]);

  // Stop blinking after 3s
  useEffect(() => {
    if (isBlinking) {
      const timeout = setTimeout(() => setIsBlinking(false), 3000);
      return () => clearTimeout(timeout);
    }
  }, [isBlinking]);

  return (
    <>
      {/* 💻 Desktop Navbar */}
      <nav className="hidden md:flex fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-white/90 border-b border-gray-200 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-8 py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/nav-icon.png"
              alt="CampusCart Logo"
              className="w-8 h-8 rounded"
            />
            <span className="text-2xl font-extrabold text-gray-900 tracking-tight">
              CampusCart
            </span>
          </Link>

          {/* Right Icons */}
          <div className="flex items-center gap-6 text-gray-800">
            {/* Chat */}
            {user && (
              <button
                onClick={() => navigate("/messages")}
                className="relative p-2.5 rounded-lg hover:bg-gray-100 transition"
              >
                <MessageCircle size={22} />
                {hasUnread && (
                  <span
                    className={`absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-white ${
                      isBlinking ? "animate-ping" : ""
                    }`}
                  />
                )}
              </button>
            )}

            {/* Theme */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-lg hover:bg-gray-100 transition"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Profile */}
            {user ? (
              <img
                src={
                  user.profilePic ||
                  `https://ui-avatars.com/api/?name=${user.name}&background=111&color=fff`
                }
                alt="avatar"
                onClick={() => navigate("/dashboard")}
                className="w-10 h-10 rounded-full border-2 border-gray-300 object-cover cursor-pointer hover:scale-105 transition-all"
              />
            ) : (
              <Link
                to="/login"
                className="bg-gray-900 text-white px-5 py-2 rounded-lg shadow-md hover:bg-gray-800 transition-all duration-200"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* 📱 Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-md flex justify-around items-center py-2 z-50">
        <button
          onClick={() => navigate("/")}
          className={`flex flex-col items-center text-xs ${
            location.pathname === "/" ? "text-black" : "text-gray-500"
          }`}
        >
          <Home size={22} />
          <span>Home</span>
        </button>

        <button
          onClick={() => navigate("/explore")}
          className={`flex flex-col items-center text-xs ${
            location.pathname === "/explore" ? "text-black" : "text-gray-500"
          }`}
        >
          <Search size={22} />
          <span>Explore</span>
        </button>

        {/* 🛍 SELL BUTTON (✅ FIXED) */}
        <button
          onClick={() => {
            if (user) navigate("/seller-dashboard"); // ✅ Now goes to SellerDashboard.jsx
            else navigate("/login"); // 🚪 Goes to login if not logged in
          }}
          className="flex flex-col items-center text-xs bg-black text-white rounded-full px-4 py-2 shadow-md hover:opacity-90 transition"
        >
          <Upload size={20} />
          <span>Sell</span>
        </button>

        <button
          onClick={toggleTheme}
          className="flex flex-col items-center text-xs text-gray-500"
        >
          {darkMode ? <Sun size={22} /> : <Moon size={22} />}
          <span>{darkMode ? "Light" : "Dark"}</span>
        </button>

        <button
          onClick={() => (user ? navigate("/dashboard") : navigate("/login"))}
          className="flex flex-col items-center text-xs text-gray-500"
        >
          <User size={22} />
          <span>Profile</span>
        </button>
      </nav>
    </>
  );
}