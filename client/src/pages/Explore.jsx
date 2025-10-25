import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const Explore = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);

  const category = searchParams.get("category");
  const keyword = searchParams.get("keyword");

  // 🌗 Watch for dark/light mode toggle
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

  // 🧠 Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const query = category
          ? `?keyword=${encodeURIComponent(category)}`
          : keyword
          ? `?keyword=${encodeURIComponent(keyword)}`
          : "";
        const { data } = await api.get(`/products${query}`);
        setProducts(Array.isArray(data) ? data : data.products || []);
      } catch (err) {
        console.error("Failed to load products", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [category, keyword]);

  // 💤 Empty state message
  const renderEmpty = () => (
    <div className="flex flex-col items-center justify-center text-center py-16">
      <p className={`text-base sm:text-lg ${isDark ? "text-gray-400" : "text-gray-600"}`}>
        {keyword || category
          ? "No products found for your search 🔍"
          : "No products listed yet. Be the first to post!"}
      </p>
      {!user && (
        <button
          onClick={() => navigate("/register")}
          className={`mt-4 px-5 py-2 rounded-lg font-semibold transition-all ${
            isDark
              ? "bg-gray-100 text-black hover:bg-gray-200"
              : "bg-gray-900 text-white hover:bg-gray-800"
          }`}
        >
          Register & List Your Item
        </button>
      )}
    </div>
  );

  return (
    <main
      className={`pt-28 min-h-screen transition-colors duration-500 px-3 sm:px-4 ${
        isDark ? "bg-[#171717] text-gray-100" : "bg-white text-gray-900"
      }`}
    >
      {/* 🔍 Header */}
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {category
            ? `Explore ${category}`
            : keyword
            ? `Results for “${keyword}”`
            : "Explore All Products"}
        </h1>
        <p
          className={`mt-1 text-sm sm:text-base ${
            isDark ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Discover used books, notes, and gadgets from your campus.
        </p>
      </div>

      {/* 🌀 Loader */}
      {loading && (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-t-transparent border-gray-400 rounded-full animate-spin"></div>
        </div>
      )}

      {/* 🧱 Product Grid */}
      {!loading && (
        <section className="w-full max-w-7xl mx-auto mb-10">
          {products.length === 0 ? (
            renderEmpty()
          ) : (
            <div
              className="
                grid
                grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4
                gap-2 sm:gap-3 md:gap-4
                place-items-center
              "
            >
              {products.map((product, i) => (
                <motion.div
                  key={product._id || i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  whileHover={{ scale: 1.03 }}
                  onClick={() => navigate(`/product/${product._id}`)}
                  className={`
                    rounded-xl border overflow-hidden
                    ${isDark ? "border-gray-700 bg-[#1d1d1d]" : "border-gray-200 bg-white"}
                    shadow-md hover:shadow-lg transition-all cursor-pointer
                    w-[92%] sm:w-[85%] md:w-[80%] lg:w-[75%]
                  `}
                >
                  {/* 🖼️ Product Image */}
                  <div className="w-full h-32 sm:h-40 md:h-48 overflow-hidden">
                    <img
                      src={
                        product.image ||
                        "https://cdn-icons-png.flaticon.com/512/679/679720.png"
                      }
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    />
                  </div>

                  {/* 📄 Product Info */}
                  <div className="p-2 sm:p-3 text-center">
                    <h3 className="text-sm sm:text-base font-semibold truncate">
                      {product.name}
                    </h3>
                    <p
                      className={`text-xs sm:text-sm mt-1 line-clamp-2 ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {product.description}
                    </p>

                    <div className="mt-2 flex flex-col items-center">
                      <p
                        className={`text-sm sm:text-base font-bold ${
                          isDark ? "text-gray-200" : "text-gray-900"
                        }`}
                      >
                        ₹{product.price?.toFixed(2) || "N/A"}
                      </p>
                      {product.isSold && (
                        <p className="mt-1 text-xs sm:text-sm text-red-500 font-semibold">
                          🔒 Sold Out
                        </p>
                      )}
                    </div>

                    <button
                      className={`mt-3 text-xs sm:text-sm px-4 py-1.5 rounded-lg font-medium transition-all ${
                        isDark
                          ? "bg-gray-100 text-black hover:bg-gray-200"
                          : "bg-gray-900 text-white hover:bg-gray-800"
                      }`}
                    >
                      View
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* 🧾 Footer */}
      
    </main>
  );
};

export default Explore;