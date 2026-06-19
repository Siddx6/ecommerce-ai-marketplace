import User from "../models/User.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({ count: users.length, users });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const approveSeller = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "seller") {
      return res.status(400).json({ message: "This user is not a seller applicant" });
    }

    user.sellerProfile.approved = true;
    await user.save();

    res.status(200).json({
      message: "Seller approved",
      user: { id: user._id, name: user.name, email: user.email, sellerProfile: user.sellerProfile },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};