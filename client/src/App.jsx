import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Explore from "./pages/Explore";
import SellerDashboard from "./pages/SellerDashboard";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import SellerProfile from "./pages/SellerProfile";
import Loader from "./components/Loader"; 
import ChatList from "./pages/ChatList";
import ChatPage from "./pages/ChatPage";

function App() {
  return (
    <>
      {/* 🛒 Smooth entrance animation */}
      <Loader />

      <BrowserRouter>
        <Navbar />
        <Toaster position="top-right" reverseOrder={false} />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/seller-dashboard" element={<SellerDashboard />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/seller/:id" element={<SellerProfile />} />
          <Route path="/messages" element={<ChatList />} />
          <Route path="/chat/:id" element={<ChatPage />} />
          <Route path="/chat/new" element={<ChatPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;