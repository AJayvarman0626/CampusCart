import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    // 🏷️ Product Name
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
    },

    // 🧾 Description
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },

    // 💰 Price
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be greater than 0"],
    },

    // 📚 Category
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["Books", "Notes", "Gadgets"],
    },

    // 🖼️ Product Image (Cloudinary URL)
    image: {
      type: String,
      default: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
    },

    // 🧑‍💼 Seller Reference
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ✅ Status Flag
    isSold: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
    versionKey: false, // hides "__v"
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// 🌐 Virtual: Shortened description
productSchema.virtual("shortDescription").get(function () {
  return this.description.length > 80
    ? this.description.substring(0, 80) + "..."
    : this.description;
});

// 🧮 Virtual: Formatted price display (e.g., ₹500)
productSchema.virtual("formattedPrice").get(function () {
  return `₹${this.price.toLocaleString("en-IN")}`;
});

const Product = mongoose.model("Product", productSchema);
export default Product;