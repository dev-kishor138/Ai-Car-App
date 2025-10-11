import Brand from "../models/Brand.js";



// Get all Brand
export const getBrands = async (req, res, next) => {
    try {
        const brands = await Brand.find({});  // Exclude password field from the result

        if (!brands) {
            throw new Error("No Brand found");
        }

        res.status(200).json({
            message: "Brand retrieved successfully",
            brands
        });
    } catch (error) {
        next(error);
    }
};