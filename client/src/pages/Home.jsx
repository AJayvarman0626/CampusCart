// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Categories data — simple and easy to extend.
 * Keep enums synced with backend categories if you add more.
 */
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
];

/** tiny inline SVG search icon component */
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
    aria-hidden="true"
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

  // Observe <html class="dark"> changes so the page reacts when nav toggles theme
  useEffect(() => {
    const updateTheme = () => setIsDark(document.documentElement.classList.contains("dark"));
    updateTheme();

    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  // Submit search -> go to explore page with keyword query
  const handleSearch = (e) => {
    e.preventDefault();
    const cleaned = query.trim();
    if (cleaned.length === 0) {
      // nothing — we can optionally show toast, but keep it simple
      return;
    }
    navigate(`/explore?keyword=${encodeURIComponent(cleaned)}`);
  };

  // Choose category -> navigate to explore page with category query
  const goCategory = (categoryName) => {
    navigate(`/explore?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <main
      className={`pt-28 min-h-screen flex flex-col items-center transition-colors duration-300 px-4 sm:px-6 ${
        // Dark background tuned ~30% lighter than pure black for readability
        isDark ? "bg-[#171717] text-gray-100" : "bg-white text-gray-900"
      }`}
    >
      {/* SEARCH BAR */}
      <form
        onSubmit={handleSearch}
        className={`flex items-center gap-2 w-full max-w-3xl mb-8
          ${isDark ? "bg-white/6" : "bg-white/90"} backdrop-blur-md
          border ${isDark ? "border-gray-700" : "border-gray-200"}
          rounded-full px-4 py-2 shadow-sm sm:shadow-md transition-all`}
        role="search"
        aria-label="Search CampusCart"
      >
        <div
          className={`flex items-center shrink-0 ${isDark ? "text-gray-300" : "text-gray-600"}`}
        >
          <SearchIcon />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search books, notes, gadgets..."
          className={`flex-1 bg-transparent outline-none text-sm sm:text-base
            ${isDark ? "text-gray-100 placeholder:text-gray-400" : "text-gray-800 placeholder:text-gray-500"}`}
          aria-label="Search for items"
        />

        <button
          type="submit"
          className={`ml-2 rounded-full px-4 py-1.5 text-sm font-medium
            ${isDark ? "bg-gray-100 text-black" : "bg-gray-900 text-white"}
            hover:opacity-95 transition-all`}
          aria-label="Start search"
        >
          Go
        </button>
      </form>

      {/* HERO */}
      <motion.section
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8 px-2"
        aria-hidden={false}
      >
        <h1
          className={`text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight ${
            isDark ? "text-gray-50" : "text-gray-900"
          }`}
        >
          Welcome to <span className="font-black">CampusCart</span>
        </h1>

        <p
          className={`mt-3 max-w-2xl mx-auto text-sm sm:text-base ${
            isDark ? "text-gray-300" : "text-gray-600"
          }`}
        >
          Buy, sell or share your campus essentials — quick, local, and simple.
        </p>
      </motion.section>

      {/* CATEGORIES GRID */}
      <section className="w-full max-w-6xl px-4 md:px-6 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, i) => (
            <motion.article
              key={cat.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => goCategory(cat.name)}
              className={`relative group cursor-pointer rounded-2xl overflow-hidden border ${
                isDark ? "border-gray-700" : "border-gray-200"
              } shadow-sm hover:shadow-lg transition-all`}
              role="link"
              aria-label={`Explore ${cat.name}`}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") goCategory(cat.name);
              }}
            >
              <div
                className={`p-8 md:p-10 h-full flex flex-col items-start justify-center gap-4 bg-gradient-to-br ${cat.color}`}
              >
                <div className="text-4xl md:text-5xl">{cat.icon}</div>

                <div className="w-full">
                  <h3 className="text-xl md:text-2xl font-semibold leading-tight">
                    {cat.name}
                  </h3>
                  <p className="text-sm md:text-base opacity-90 mt-1">
                    Browse listings for {cat.name.toLowerCase()} in your campus.
                  </p>
                </div>
              </div>

              {/* subtle overlay for readability in dark mode */}
              <div
                className={`pointer-events-none absolute inset-0 ${
                  isDark ? "bg-black/20" : "bg-white/0"
                }`}
                aria-hidden="true"
              />
            </motion.article>
          ))}
        </div>
      </section>

      {/* CTA (hidden when user logged in) */}
      {!user && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="mt-6 text-center px-4"
        >
          <p className={`${isDark ? "text-gray-300" : "text-gray-600"} text-sm sm:text-base`}>
            Want to sell something?{" "}
            <button
              onClick={() => navigate("/register")}
              className={`ml-1 underline font-medium focus:outline-none ${
                isDark ? "text-gray-100" : "text-gray-900"
              }`}
            >
              Register now
            </button>
          </p>
        </motion.div>
      )}

      {/* FOOTER */}
      <footer
        className={`mt-14 mb-8 text-xs sm:text-sm ${
          isDark ? "text-gray-500" : "text-gray-500"
        }`}
      >
        © {new Date().getFullYear()} CampusCart - Your Campus Marketplace
      </footer>
    </main>
  );
};

export default Home;