import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import cartLogo from "../assets/cart.png"; // logo only for mobile view

// ✅ Categories (with Lab Coat matching backend)
const categories = [
  {
    id: 1,
    name: "Books",
    icon: "📚",
    color: "from-gray-100 to-gray-300 dark:from-gray-700 dark:to-gray-600",
  },
  {
    id: 2,
    name: "Notes",
    icon: "🧾",
    color: "from-gray-200 to-gray-400 dark:from-gray-600 dark:to-gray-500",
  },
  {
    id: 3,
    name: "Gadgets",
    icon: "⚙️",
    color: "from-gray-300 to-gray-500 dark:from-gray-500 dark:to-gray-400",
  },
  {
    id: 4,
    name: "Lab Coat",
    icon: "🥼",
    color: "from-gray-100 to-gray-300 dark:from-gray-700 dark:to-gray-600",
  },
];

const SearchIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isDark, setIsDark] = useState(false);
  const [query, setQuery] = useState("");

  // 🌗 Watch for theme mode
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

  // 🔍 Search handler
  const handleSearch = (e) => {
    e.preventDefault();
    const cleaned = query.trim();
    if (!cleaned) return;
    navigate(`/explore?keyword=${encodeURIComponent(cleaned)}`);
  };

  // 🧱 Category click handler
  const goCategory = (categoryName) => {
    navigate(`/explore?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <main
      className={`pt-12 pb-24 min-h-screen flex flex-col items-center transition-colors duration-300 px-4 sm:px-6 ${
        isDark ? "bg-[#171717] text-gray-100" : "bg-white text-gray-900"
      }`}
    >
      {/* 🌟 Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10 px-2 flex flex-col items-center justify-center"
      >
        {/* 📱 Mobile */}
        <div className="sm:hidden flex flex-col items-center justify-center mb-4">
          <h2 className="text-3xl font-extrabold mb-1">Welcome to</h2>
          <div className="flex items-center gap-2">
            <img
              src={cartLogo}
              alt="CampusCart Logo"
              className="w-14 h-14 drop-shadow-md"
            />
            <h1 className="text-3xl font-black">CampusCart</h1>
          </div>
        </div>

        {/* 💻 Desktop */}
        <div className="hidden sm:block mb-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Welcome to <span className="font-black">CampusCart</span>
          </h1>
        </div>

        {/* 🔍 Search bar */}
        <form
          onSubmit={handleSearch}
          className={`flex items-center gap-2 w-full max-w-3xl mt-2 mb-4 ${
            isDark ? "bg-white/10" : "bg-white/90"
          } backdrop-blur-md border ${
            isDark ? "border-gray-700" : "border-gray-200"
          } rounded-full px-4 py-2 shadow-sm sm:shadow-md transition-all`}
          role="search"
        >
          <div
            className={`flex items-center shrink-0 ${
              isDark ? "text-gray-300" : "text-gray-600"
            }`}
          >
            <SearchIcon />
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search books, notes, gadgets, lab coats..."
            className={`flex-1 bg-transparent outline-none text-sm sm:text-base ${
              isDark
                ? "text-gray-100 placeholder:text-gray-400"
                : "text-gray-800 placeholder:text-gray-500"
            }`}
          />

          <button
            type="submit"
            className={`ml-2 rounded-full px-4 py-1.5 text-sm font-medium ${
              isDark ? "bg-gray-100 text-black" : "bg-gray-900 text-white"
            } hover:opacity-95 transition-all`}
          >
            Go
          </button>
        </form>

        <p
          className={`mt-1 text-sm sm:text-base max-w-xl mx-auto ${
            isDark ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Buy, sell or share your campus essentials — quick, local, and simple.
        </p>
      </motion.section>

      {/* 🧱 Categories */}
      <section className="w-full max-w-6xl px-4 md:px-6 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, i) => (
            <motion.article
              key={cat.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              whileHover={{ scale: 1.03 }}
              onClick={() => goCategory(cat.name)}
              className={`relative group cursor-pointer rounded-2xl overflow-hidden border ${
                isDark ? "border-gray-700" : "border-gray-200"
              } shadow-sm hover:shadow-lg transition-all bg-gradient-to-br ${cat.color}`}
            >
              <div className="p-8 md:p-10 h-full flex flex-col items-start justify-center gap-4">
                <div className="text-4xl md:text-5xl">{cat.icon}</div>
                <div>
                  <h3 className="text-xl md:text-2xl font-semibold group-hover:scale-105 transition-transform">
                    {cat.name}
                  </h3>
                  <p className="text-sm opacity-90 mt-1">
                    Browse listings for {cat.name.toLowerCase()} in your campus.
                  </p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer
        className={`mt-14 mb-6 text-xs sm:text-sm ${
          isDark ? "text-gray-500" : "text-gray-600"
        }`}
      >
        © {new Date().getFullYear()} CampusCart — Your Campus Marketplace
      </footer>
    </main>
  );
};

export default Home;