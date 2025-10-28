import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { io } from "socket.io-client";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const ENDPOINT = "https://campuscart-server.onrender.com";
const LAST_SEEN_KEY = "campuscart_lastSeenMessages";

const ChatList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [unread, setUnread] = useState({});
  const isDark = document.documentElement.classList.contains("dark");
  const socket = useRef(null);

  // 🧠 Load & Save last seen timestamps
  const loadLastSeen = () => {
    try {
      return JSON.parse(localStorage.getItem(LAST_SEEN_KEY)) || {};
    } catch {
      return {};
    }
  };

  const saveLastSeen = (map) => {
    localStorage.setItem(LAST_SEEN_KEY, JSON.stringify(map));
  };

  // 🧠 Fetch all existing chats
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const { data } = await api.get("/api/chats", {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        setChats(data);

        // Offline detection (compare last seen)
        const lastSeen = loadLastSeen();
        const offlineUnread = {};
        data.forEach((chat) => {
          const other = chat.users?.find((u) => u._id !== user._id);
          if (!other) return;
          const lastTime = new Date(chat.lastMessage?.createdAt || chat.updatedAt).getTime();
          const seenTime = lastSeen[other._id] || 0;
          if (lastTime > seenTime) {
            offlineUnread[other._id] = true;
          }
        });
        setUnread(offlineUnread);
      } catch (error) {
        console.error("❌ Failed to load chats:", error);
      } finally {
        setLoading(false);
      }
    };
    if (user?.token) fetchChats();
  }, [user]);

  // ⚡ Socket setup (real-time)
  useEffect(() => {
    if (!user?._id) return;

    socket.current = io(ENDPOINT);
    socket.current.emit("joinChat", user._id);

    socket.current.on("newMessage", (msg) => {
      if (msg.sender === user._id) return;

      // Update unread badge instantly
      setUnread((prev) => ({
        ...prev,
        [msg.sender]: true,
      }));

      // Update chat list instantly
      setChats((prevChats) => {
        let updated = [...prevChats];
        const chatIndex = updated.findIndex((c) =>
          c.users.some((u) => u._id === msg.sender)
        );

        if (chatIndex >= 0) {
          updated[chatIndex].lastMessage = msg;
          updated[chatIndex].updatedAt = msg.createdAt || new Date().toISOString();
          const [recent] = updated.splice(chatIndex, 1);
          updated.unshift(recent);
        } else {
          updated.unshift({
            users: [
              { _id: msg.sender, name: msg.senderName, profilePic: msg.senderPic },
              { _id: user._id },
            ],
            lastMessage: msg,
            updatedAt: msg.createdAt || new Date().toISOString(),
          });
        }
        return [...updated];
      });
    });

    return () => socket.current.disconnect();
  }, [user]);

  // 🔍 Search users
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    try {
      setIsSearching(true);
      const { data } = await api.get(`/api/users?search=${query}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setSearchResults(data);
    } catch (error) {
      console.error("❌ Search failed:", error);
    }
  };

  // 💬 Open chat
  const handleStartChat = async (userId) => {
    try {
      const { data } = await api.post(
        "/api/chats",
        { userId },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      // ✅ Mark chat as seen when opened
      const seenMap = loadLastSeen();
      seenMap[userId] = Date.now();
      saveLastSeen(seenMap);

      // remove unread badge
      setUnread((prev) => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });

      navigate(`/chat/${userId}`); // ✅ keep your working route
    } catch (error) {
      console.error("❌ Failed to access chat:", error);
    }
  };

  if (loading)
    return (
      <div className="pt-24 text-center text-gray-500 dark:text-gray-400">
        Loading chats...
      </div>
    );

  return (
    <main className="pt-24 min-h-screen px-4 bg-gray-50 dark:bg-[#0f0f0f] text-gray-900 dark:text-gray-100 transition-colors">
      <h2 className="text-xl font-semibold mb-4">Messages 💬</h2>

      {/* 🔍 Search Bar */}
      <form
        onSubmit={handleSearch}
        className={`flex items-center gap-2 w-full max-w-3xl mb-6
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

      {/* 🔎 Search Results */}
      {isSearching && searchResults.length > 0 && (
        <div className="mb-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Search Results:
          </p>
          <div className="flex flex-col gap-3">
            {searchResults.map((u) => (
              <motion.div
                key={u._id}
                whileHover={{ scale: 1.02 }}
                onClick={() => handleStartChat(u._id)}
                className="flex items-center gap-3 p-3 rounded-lg cursor-pointer border dark:border-gray-700 bg-white dark:bg-[#121212] hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <img
                  src={
                    u.profilePic ||
                    `https://ui-avatars.com/api/?name=${u.name}&background=random`
                  }
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover border"
                />
                <div>
                  <p className="font-semibold">{u.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {u.stream || "Student"}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* 🗨️ Chat List */}
      {!isSearching && (
        <div className="flex flex-col gap-3">
          {chats.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400">
              No messages yet 😶
            </p>
          ) : (
            chats.map((chat) => {
              const otherUser = chat.users?.find((u) => u._id !== user._id);
              if (!otherUser) return null;

              const lastMsg = chat.lastMessage?.content || "No messages yet";
              const hasNew = unread[otherUser._id];

              return (
                <motion.div
                  key={chat._id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => handleStartChat(otherUser._id)}
                  className={`flex items-center justify-between gap-3 p-3 rounded-lg cursor-pointer border dark:border-gray-700 bg-white dark:bg-[#121212] hover:bg-gray-100 dark:hover:bg-gray-800 transition ${
                    hasNew ? "border-blue-500" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        otherUser.profilePic ||
                        `https://ui-avatars.com/api/?name=${otherUser.name}&background=random`
                      }
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover border"
                    />
                    <div>
                      <p className="font-semibold flex items-center gap-2">
                        {otherUser.name}
                        {hasNew && (
                          <span className="text-[10px] bg-blue-600 text-white px-2 py-[2px] rounded-full">
                            NEW
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                        {lastMsg}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {new Date(chat.updatedAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </motion.div>
              );
            })
          )}
        </div>
      )}
    </main>
  );
};

export default ChatList;