import express from "express";
import multer from "multer";
import {
  getProducts,
  getProductsBySeller,
  createProduct,
  getProductById,
  deleteProduct,
  updateProduct,
  uploadProductImage,
} from "../controllers/productController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🧠 In-memory multer (for Cloudinary buffer uploads)
const upload = multer({ storage: multer.memoryStorage() });

// ✅ Image Upload
router.post("/upload", protect, upload.single("image"), uploadProductImage);

// ✅ Product by Seller
router.get("/seller/:id", getProductsBySeller); // 👈 must come before :id route

// ✅ Product Routes
router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", protect, createProduct);
router.put("/:id", protect, updateProduct);
router.delete("/:id", protect, deleteProduct);

export default router;