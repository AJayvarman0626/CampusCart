import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";
import cloudinary from "../config/cloudinary.js"; // ✅ make sure you import this

// ✅ Register a new user
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ name, email, password });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("❌ Register error:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ✅ Login user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      if (user.isBanned) {
        return res.status(403).json({ message: "Your account has been banned 🚫" });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        stream: user.stream,
        year: user.year,
        bio: user.bio,
        profilePic: user.profilePic,
        whatsappNumber: user.whatsappNumber,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("❌ Login error:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ✅ Get user profile (for logged-in user)
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    console.error("❌ Get profile error:", error.message);
    res.status(500).json({ message: "Failed to fetch profile", error: error.message });
  }
};

// ✅ Update user profile (clean validation)
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: "User not found" });

    // 🎓 Stream Short Mapping
    const streamShortMap = {
      "Computer Science and Engineering": "CSE",
      "Artificial Intelligence and Data Science": "AIDS",
      "Information Technology": "IT",
      "Electronics and Communication Engineering": "ECE",
      "Electrical and Electronics Engineering": "EEE",
      "Mechanical Engineering": "MECH",
      "Civil Engineering": "CIVIL",
    };

    const updatedStream = streamShortMap[req.body.stream] || req.body.stream;

    // ✅ Basic field updates
    user.name = req.body.name ?? user.name;
    user.stream = updatedStream ?? user.stream;
    user.year = req.body.year ?? user.year;
    user.bio = req.body.bio ?? user.bio;

    // ✅ WhatsApp number validation (no spaces)
    if (req.body.whatsappNumber) {
      const cleanNumber = req.body.whatsappNumber.replace(/\s/g, "");
      if (!/^(\+91)?\d{10}$/.test(cleanNumber)) {
        return res.status(400).json({
          message: "Invalid WhatsApp number format (+919876543210)",
        });
      }
      user.whatsappNumber = cleanNumber;
    }

    // ✅ Handle profilePic (if it's base64 or URL)
    if (req.body.profilePic) {
      const pic = req.body.profilePic;
      if (pic.startsWith("http")) {
        user.profilePic = pic;
      } else {
        try {
          const uploadRes = await cloudinary.uploader.upload(pic, {
            folder: "CampusCart/Profiles",
            resource_type: "image",
          });
          user.profilePic = uploadRes.secure_url;
        } catch (err) {
          console.error("❌ Cloudinary upload failed:", err.message);
        }
      }
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      stream: updatedUser.stream,
      year: updatedUser.year,
      bio: updatedUser.bio,
      profilePic: updatedUser.profilePic,
      whatsappNumber: updatedUser.whatsappNumber,
      token: generateToken(updatedUser._id),
    });
  } catch (error) {
    console.error("❌ Profile update failed:", error.message);
    res.status(500).json({ message: "Profile update failed", error: error.message });
  }
};

// ✅ Admin: Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    console.error("❌ Get all users failed:", error.message);
    res.status(500).json({ message: "Failed to fetch users", error: error.message });
  }
};

// ✅ Ban user
export const banUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isAdmin)
      return res.status(403).json({ message: "Cannot ban another admin" });

    user.isBanned = true;
    await user.save();

    res.status(200).json({
      message: `🚫 User ${user.name} has been banned.`,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("❌ Ban user failed:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ✅ Unban user
export const unbanUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isBanned = false;
    await user.save();

    res.status(200).json({
      message: `✅ User ${user.name} has been unbanned.`,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("❌ Unban user failed:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ✅ Google Register
export const googleRegister = async (req, res) => {
  const { name, email, profilePic } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already registered, please login" });
    }

    const user = await User.create({
      name,
      email,
      password: email + "_googleAuth",
      profilePic,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePic: user.profilePic,
      whatsappNumber: user.whatsappNumber,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("❌ Google register failed:", error.message);
    res.status(500).json({ message: "Google Register Failed", error: error.message });
  }
};

// ✅ Google Login
export const googleLogin = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found. Please register first." });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePic: user.profilePic,
      stream: user.stream,
      year: user.year,
      bio: user.bio,
      whatsappNumber: user.whatsappNumber,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("❌ Google login failed:", error.message);
    res.status(500).json({ message: "Google Login Failed", error: error.message });
  }
};

// ✅ Public Seller Profile by ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Seller not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("❌ Error fetching seller:", error.message);
    res.status(500).json({ message: "Server error fetching seller" });
  }
};