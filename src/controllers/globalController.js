// ✅ Get User favorites
export const getUserFavorites = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const userWithFavorites = await User.findById(userId).populate("favorites");
    if (!userWithFavorites) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ success: true, data: userWithFavorites });
  } catch (err) {
    next(err);
  }
};
