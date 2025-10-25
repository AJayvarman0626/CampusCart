import Product from "../models/productModel.js";
import cloudinary from "../config/cloudinary.js";

/**
 * ✅ Upload Product Image
 * @route POST /api/products/upload
 * @access Private
 */
export const uploadProductImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const base64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${base64}`;

    const uploadResult = await cloudinary.uploader.upload(dataURI, {
      folder: "CampusCart/Products",
      resource_type: "auto",
    });

    res.status(200).json({ url: uploadResult.secure_url });
  } catch (error) {
    console.error("❌ Product image upload failed:", error);
    res.status(500).json({ message: "Cloudinary upload failed" });
  }
};

/**
 * ✅ Get all products (search, sort, pagination)
 * @route GET /api/products
 * @access Public
 */
export const getProducts = async (req, res, next) => {
  try {
    const pageSize = 9;
    const page = Number(req.query.pageNumber) || 1;

    const keyword = req.query.keyword
      ? {
          $or: [
            { name: { $regex: req.query.keyword, $options: "i" } },
            { category: { $regex: req.query.keyword, $options: "i" } },
          ],
        }
      : {};

    let sortOption = { createdAt: -1 };
    const { sort } = req.query;
    if (sort === "price_asc") sortOption = { price: 1 };
    if (sort === "price_desc") sortOption = { price: -1 };
    if (sort === "name_asc") sortOption = { name: 1 };
    if (sort === "name_desc") sortOption = { name: -1 };

    const count = await Product.countDocuments({ ...keyword });

    const products = await Product.find({ ...keyword })
      .populate("seller", "name email whatsappNumber profilePic")
      .sort(sortOption)
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.status(200).json({
      products,
      page,
      pages: Math.ceil(count / pageSize),
      total: count,
    });
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    next(error);
  }
};

/**
 * ✅ Get products by specific seller
 * @route GET /api/products/seller/:id
 * @access Public
 */
export const getProductsBySeller = async (req, res, next) => {
  try {
    const sellerId = req.params.id;

    const products = await Product.find({ seller: sellerId })
      .populate("seller", "name email whatsappNumber profilePic stream year bio")
      .sort({ createdAt: -1 });

    res.status(200).json(products);
  } catch (error) {
    console.error("❌ Error fetching seller products:", error);
    next(error);
  }
};

/**
 * ✅ Create a new product
 * @route POST /api/products
 * @access Private
 */
export const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, category, image } = req.body;

    if (!name || !description || !price || !category) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const seller = req.user._id;
    let uploadedImageUrl = "";

    if (image) {
      const uploadResult = await cloudinary.uploader.upload(image, {
        folder: "CampusCart/Products",
        resource_type: "auto",
      });
      uploadedImageUrl = uploadResult.secure_url;
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      image: uploadedImageUrl,
      seller,
    });

    const populatedProduct = await product.populate(
      "seller",
      "name email whatsappNumber profilePic"
    );

    res.status(201).json({
      message: "✅ Product created successfully",
      product: populatedProduct,
    });
  } catch (error) {
    console.error("❌ Error creating product:", error);
    next(error);
  }
};

/**
 * ✅ Get single product
 * @route GET /api/products/:id
 * @access Public
 */
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "seller",
      "name email whatsappNumber profilePic stream year bio"
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("❌ Error fetching product:", error);
    next(error);
  }
};

/**
 * ✅ Update product
 * @route PUT /api/products/:id
 * @access Private
 */
export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ message: "Product not found" });

    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { name, description, price, category, image, isSold } = req.body;

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.category = category || product.category;
    product.isSold = isSold ?? product.isSold;

    if (image && image !== product.image) {
      if (product.image && product.image.includes("res.cloudinary.com")) {
        const publicId = product.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`CampusCart/Products/${publicId}`);
      }

      const uploadResult = await cloudinary.uploader.upload(image, {
        folder: "CampusCart/Products",
        resource_type: "auto",
      });
      product.image = uploadResult.secure_url;
    }

    const updatedProduct = await product.save();
    const populated = await updatedProduct.populate(
      "seller",
      "name email whatsappNumber profilePic"
    );

    res.status(200).json(populated);
  } catch (error) {
    console.error("❌ Error updating product:", error);
    next(error);
  }
};

/**
 * ✅ Delete product
 * @route DELETE /api/products/:id
 * @access Private
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ message: "Product not found" });

    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (product.image && product.image.includes("res.cloudinary.com")) {
      const publicId = product.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`CampusCart/Products/${publicId}`);
    }

    await product.deleteOne();
    res.status(200).json({ message: "🗑️ Product deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting product:", error);
    next(error);
  }
};