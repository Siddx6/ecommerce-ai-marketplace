import mongoose from "mongoose";

const pageViewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    viewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // null = anonymous/logged-out visitor
    },
  },
  { timestamps: true }
);

const PageView = mongoose.model("PageView", pageViewSchema);

export default PageView;