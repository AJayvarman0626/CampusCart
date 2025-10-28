import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function ChatList() {
  const { user, authReady } = useAuth();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(false);
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true); // 👈 prevent premature render

  // 🌗 Sync Theme
  useEffect(() => {
    const updateTheme = () =>
      setIsDark(document.documentElement.classList.contains("dark"));
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  // 🧠 Load chats when auth is ready
  useEffect(() => {
    if (!authReady) return; // wait for auth check
    if (!user?.token) {
      console.warn("⚠️ User not logged in — skipping chat fetch");
      setLoading(false);
      return;
    }

    const fetchChats = async () => {
      try {
        console.log("🧩 Fetching chats with token:", user.token.slice(0, 20) + "...");
        const { data } = await api.get("/api/chats", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setChats(data);
      } catch (error) {
        console.error("❌ Failed to load chats", error);
        if (error.response?.status === 403) {
          toast.error("Session expired. Please log in again.");
          navigate("/login");
        } else {
          toast.error("Unable to load chats 💔");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [user, authReady, navigate]);

  // 🔍 Search users
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      const { data } = await api.get(`/api/users?search=${query}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setUsers(data);
    } catch (error) {
      console.error("❌ User search failed:", error);
      toast.error("User search failed");
    }
  };

  // 🌀 Loading / Auth states
  if (!authReady || loading) {
    return (
      <main
        className={`flex justify-center items-center h-screen ${
          isDark ? "bg-[#0f0f0f] text-gray-400" : "bg-gray-100 text-gray-700"
        }`}
      >
        <p>Loading your messages...</p>
      </main>
    );
  }

  // 🚫 Not logged in
  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <main
      className={`pt-24 min-h-screen px-4 flex flex-col items-center transition-all duration-500 ${
        isDark ? "bg-[#0f0f0f] text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* 🔍 Search Bar */}
      <form
        onSubmit={handleSearch}
        className={`flex items-center gap-2 w-full max-w-3xl mb-8
          ${isDark ? "bg-white/10" : "bg-white/90"} backdrop-blur-md
          border ${isDark ? "border-gray-700" : "border-gray-200"}
          rounded-full px-4 py-2 shadow-sm sm:shadow-md transition-all`}
      >
        <div
          className={`flex items-center shrink-0 ${
            isDark ? "text-gray-300" : "text-gray-600"
          }`}
        >
          <Search size={18} />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search users to chat..."
          className={`flex-1 bg-transparent outline-none text-sm sm:text-base
            ${
              isDark
                ? "text-gray-100 placeholder:text-gray-400"
                : "text-gray-800 placeholder:text-gray-500"
            }`}
        />

        <button
          type="submit"
          className={`ml-2 rounded-full px-4 py-1.5 text-sm font-medium
            ${isDark ? "bg-gray-100 text-black" : "bg-gray-900 text-white"}
            hover:opacity-95 transition-all`}
        >
          Go
        </button>
      </form>

      {/* 💬 Recent Chats */}
      <div className="w-full max-w-3xl space-y-4">
        {chats.length === 0 ? (
          <p className="text-center text-gray-500">
            No chats yet. Start messaging someone!
          </p>
        ) : (
          chats.map((chat) => (
            <motion.div
              key={chat._id}
              onClick={() => navigate(`/chat/${chat.otherUser._id}`)}
              whileHover={{ scale: 1.02 }}
              className={`p-4 rounded-xl cursor-pointer border shadow-sm transition ${
                isDark
                  ? "bg-[#1a1a1a] border-gray-700 hover:bg-[#222]"
                  : "bg-white border-gray-200 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center gap-4">
                <img
                  src={
                    chat.otherUser.profilePic ||
                    `https://ui-avatars.com/api/?name=${chat.otherUser.name}`
                  }
                  alt={chat.otherUser.name}
                  className="w-12 h-12 rounded-full border border-gray-300 object-cover"
                />
                <div>
                  <h3 className="font-semibold text-lg">
                    {chat.otherUser.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                    {chat.lastMessage?.content || "Tap to start chatting..."}
                  </p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* 👥 Searched Users */}
      {users.length > 0 && (
        <div className="w-full max-w-3xl mt-8">
          <h2 className="text-lg font-semibold mb-3">Search Results</h2>
          {users.map((u) => (
            <motion.div
              key={u._id}
              whileHover={{ scale: 1.02 }}
              onClick={() => navigate(`/chat/${u._id}`)}
              className={`p-4 rounded-xl cursor-pointer border shadow-sm transition ${
                isDark
                  ? "bg-[#1a1a1a] border-gray-700 hover:bg-[#222]"
                  : "bg-white border-gray-200 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center gap-4">
                <img
                  src={
                    u.profilePic ||
                    `https://ui-avatars.com/api/?name=${u.name}`
                  }
                  alt={u.name}
                  className="w-12 h-12 rounded-full border border-gray-300 object-cover"
                />
                <div>
                  <h3 className="font-semibold">{u.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {u.stream || "Student"}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </main>
  );
}