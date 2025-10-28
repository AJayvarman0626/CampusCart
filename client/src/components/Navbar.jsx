import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Moon, Sun, ShoppingCart, MessageCircle } from "lucide-react";

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  // 🌗 Load and apply theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") === "dark";
    setDarkMode(savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme);
  }, []);

  // 🌗 Toggle dark mode
  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
    document.documentElement.classList.toggle("dark", newMode);
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-white/80 dark:bg-[#111]/80 border-b border-gray-200 dark:border-gray-800 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
        {/* ---------- Logo ---------- */}
        <Link
          to="/"
          onClick={() => setMenuOpen(false)}
          className="flex items-center gap-2 group transition-all"
        >
          <img
            src="/nav-icon.png"
            alt="CampusCart Logo"
            className="w-8 h-8 rounded"
          />
          <span className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            CampusCart
          </span>
        </Link>

        {/* ---------- Desktop Links ---------- */}
        <div className="hidden md:flex items-center gap-5 font-semibold text-gray-800 dark:text-gray-200">
          {/* 💬 Messages */}
          {user && (
            <button
              onClick={() => navigate("/messages")}
              className="p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              aria-label="Messages"
            >
              <MessageCircle size={22} />
            </button>
          )}

          {/* 🛒 Cart */}
          <button
            onClick={() => navigate("/cart")}
            className="p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            aria-label="Cart"
          >
            <ShoppingCart size={22} />
          </button>

          {/* 🌗 Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            aria-label="Toggle Theme"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* 👤 Profile or Login */}
          {user ? (
            <img
              src={
                user.profilePic ||
                `https://ui-avatars.com/api/?name=${user.name}&background=111&color=fff`
              }
              alt="avatar"
              onClick={() => navigate("/dashboard")}
              title="Go to Dashboard"
              className="w-10 h-10 rounded-full border-2 border-gray-300 dark:border-gray-700 object-cover cursor-pointer hover:scale-105 transition-all"
            />
          ) : (
            <Link
              to="/login"
              className="bg-gray-900 text-white px-5 py-2 rounded-lg shadow-md hover:bg-gray-800 transition-all duration-200 dark:bg-white dark:text-black"
            >
              Login
            </Link>
          )}
        </div>

        {/* ---------- Mobile Menu Button ---------- */}
        <button
          onClick={toggleMenu}
          className="md:hidden text-gray-800 dark:text-gray-200 focus:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`w-7 h-7 transition-transform duration-300 ${
              menuOpen ? "rotate-90 text-gray-900 dark:text-gray-100" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8h16M4 16h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* ---------- Mobile Menu ---------- */}
      {menuOpen && (
        <div className="md:hidden bg-white/95 dark:bg-[#111]/95 border-t border-gray-200 dark:border-gray-800 shadow-lg animate-fadeIn">
          <div className="flex flex-col items-center py-5 gap-4 font-semibold text-gray-800 dark:text-gray-200">
            {/* 💬 Messages + 🛒 Cart + 🌗 Theme */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              {user && (
                <button
                  onClick={() => {
                    navigate("/messages");
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                >
                  <MessageCircle size={18} />
                  <span>Messages</span>
                </button>
              )}

              <button
                onClick={() => {
                  navigate("/cart");
                  setMenuOpen(false);
                }}
                className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                <ShoppingCart size={18} />
                <span>Cart</span>
              </button>

              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                <span>{darkMode ? "Light" : "Dark"}</span>
              </button>
            </div>

            {/* 👤 Login or Profile */}
            {user ? (
              <img
                src={
                  user.profilePic ||
                  `https://ui-avatars.com/api/?name=${user.name}&background=111&color=fff`
                }
                alt="avatar"
                onClick={() => {
                  navigate("/dashboard");
                  setMenuOpen(false);
                }}
                title="Go to Dashboard"
                className="w-16 h-16 rounded-full border-2 border-gray-300 dark:border-gray-700 object-cover cursor-pointer hover:scale-105 transition-all"
              />
            ) : (
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="bg-gray-900 text-white px-5 py-2 rounded-lg shadow-md hover:bg-gray-800 transition-all duration-200 dark:bg-white dark:text-black"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}