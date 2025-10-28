import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../utils/api";

const SellerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);

  // 🌗 Watch theme mode live
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

  // 🧠 Fetch Seller + Their Products
  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        // ✅ FIXED: added /api prefix for both routes
        const userRes = await api.get(`/api/users/${id}`);
        setSeller(userRes.data);

        const productRes = await api.get(`/api/products/seller/${id}`);
        setProducts(productRes.data || []);
      } catch (error) {
        console.error("❌ Error loading seller:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSellerData();
  }, [id]);

  // 🌀 Loading
  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDark ? "bg-[#171717]" : "bg-white"
        }`}
      >
        <div className="w-10 h-10 border-4 border-t-transparent border-gray-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  // 🚫 Seller not found
  if (!seller) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center text-lg ${
          isDark ? "text-gray-400 bg-[#0f0f0f]" : "text-gray-500 bg-white"
        }`}
      >
        Seller not found 🙈
      </div>
    );
  }

  return (
    <main
      className={`pt-24 min-h-screen px-4 transition-colors duration-500 ${
        isDark ? "bg-[#151515] text-gray-100" : "bg-white text-gray-900"
      }`}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        {/* 🧑 Seller Info */}
        <div
          className={`rounded-2xl border shadow-md flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 mb-10 transition-all ${
            isDark
              ? "bg-[#1a1a1a]/90 border-gray-700"
              : "bg-gray-50 border-gray-200"
          }`}
        >
          <img
            src={
              seller.profilePic ||
              `https://ui-avatars.com/api/?name=${seller.name}&background=random`
            }
            alt="Seller"
            className="w-28 h-28 rounded-2xl border-2 object-cover shadow-lg"
          />
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold">{seller.name}</h1>
            <p className="text-gray-500 dark:text-gray-400">
              {seller.stream
                ? `${seller.stream} • ${seller.year} Year`
                : "Student"}
            </p>
            <p className="mt-3 text-gray-600 dark:text-gray-300 italic">
              {seller.bio || "No bio available"}
            </p>
            <button
              onClick={() => navigate(-1)}
              className={`mt-5 px-6 py-2 rounded-full font-semibold transition-all ${
                isDark
                  ? "bg-white/90 text-black hover:bg-white"
                  : "bg-gray-900 text-white hover:bg-gray-800"
              }`}
            >
              ← Back
            </button>
          </div>
        </div>

        {/* 🛍️ Seller’s Products */}
        <h2 className="text-xl sm:text-2xl font-semibold mb-5">
          Products by {seller.name}
        </h2>

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <img
              src="https://cdn-icons-png.flaticon.com/512/4076/4076500.png"
              alt="Empty"
              className="w-28 h-28 mb-4 opacity-80"
            />
            <p
              className={`text-base ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              No products listed by this seller yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {products.map((product) => (
              <motion.div
                key={product._id}
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ duration: 0.25 }}
                onClick={() => navigate(`/product/${product._id}`)}
                className={`rounded-2xl overflow-hidden shadow-md cursor-pointer border relative group transition-all ${
                  isDark
                    ? "bg-[#1c1c1c] border-gray-700 hover:bg-[#232323]"
                    : "bg-white border-gray-200 hover:bg-gray-100"
                }`}
              >
                {/* Product Image */}
                <div className="relative w-full h-40 overflow-hidden">
                  <img
                    src={
                      product.image ||
                      "https://cdn-icons-png.flaticon.com/512/679/679720.png"
                    }
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {product.isSold && (
                    <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-lg shadow">
                      SOLD
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="p-4">
                  <h3 className="font-semibold text-sm sm:text-base truncate">
                    {product.name}
                  </h3>
                  <p
                    className={`text-sm mt-1 ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    ₹{product.price?.toFixed(2) || "N/A"}
                  </p>
                </div>

                {/* Hover View Button */}
                <div
                  className={`absolute bottom-0 left-0 right-0 opacity-0 group-hover:opacity-100 bg-black/60 text-white text-center py-2 text-sm transition-opacity duration-300`}
                >
                  View Product →
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </main>
  );
};

export default SellerProfile;