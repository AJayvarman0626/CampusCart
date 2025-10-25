import express from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  banUser,
  unbanUser,
  googleRegister,
  googleLogin,
  getUserById, // 👈 added
} from "../controllers/userController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

// ✅ Cloudinary setup
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "CampusCart/Profiles",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});
const upload = multer({ storage });

// ✅ Auth routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// ✅ Google Auth
router.post("/google/register", googleRegister);
router.post("/google/login", googleLogin);
router.post("/google-register", googleRegister); // alias
router.post("/google-login", googleLogin);       // alias

// ✅ Profile routes (Protected)
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);
router.post("/upload", protect, upload.single("profilePic"), (req, res) => {
  if (!req.file || !req.file.path) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  res.status(200).json({ imageUrl: req.file.path });
});

// ✅ Admin routes
router.get("/", protect, admin, getAllUsers);
router.put("/ban/:id", protect, admin, banUser);
router.put("/unban/:id", protect, admin, unbanUser);

// ✅ Public route — Seller Profile
router.get("/:id", getUserById);

export default router;