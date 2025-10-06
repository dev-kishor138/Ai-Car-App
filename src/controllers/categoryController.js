import DevBuildError from "../lib/DevBuildError.js";
import { generateUniqueSlug } from "../lib/utilityFunction.js";
import Category from "../models/Category.js";



// ✅ Create Category
export const categryStore = async (req, res, next) => {
    console.log("Incoming Body:", req.body);
    try {
        const { categoryName, description, image, parent_category_id } = req.body;
        const { role } = req.user;

        // Role check
        if (role !== "admin") {
            throw new DevBuildError('Access denied. Admins only.', 403);
        }

        let slug = await generateUniqueSlug(Category, categoryName);

        if (parent_category_id) {
            const parentCategory = await Category.findById(parent_category_id);
            if (!parentCategory) {
                throw new DevBuildError('Invalid parent category ID', 400);
            }
        }

        const category = new Category({
            categoryName,
            slug,
            description: description || '',
            image: image || '',
            parent_category_id: parent_category_id || null,
        });
        await category.save();
        res.status(201).json({ message: "Category Created Successfully" });

    } catch (error) {
        next(error);
    }
}

// ✅ Get All Category
export const getAllCategory = async (req, res, next) => {
    try {
        const categories = await Category.find({ status: "active" });
        res.status(200).json(categories);
    } catch (error) {
        next(error);
    }
}


// ✅ Get Single Category
export const getSingleCategory = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const category = await Category.findOne({ slug }).populate('parent_category_id');
        if (!category) {
            throw new DevBuildError('Category not found', 404);
        }
        // Find subcategories
        const subcategories = await Category.find({ parent_category_id: category._id });
        category.subcategories = subcategories;
        res.status(200).json(category);
    } catch (error) {
        next(error);
    }
}


// ✅ Update Category
export const updateCategory = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const { categoryName, description, image, parent_category_id } = req.body;

        const { role } = req.user;

        // Role check
        if (role !== "admin") {
            throw new DevBuildError('Access denied. Admins only.', 403);
        }

        // find Category
        const category = await Category.findOne({ slug });
        if (!category) {
            throw new DevBuildError('Category not found', 404);
        }

        // If categoryName is change then generate new Slug
        let newSlug = categoryName ? await generateUniqueSlug(Category, categoryName) : category.slug;

        // parent_category_id checked
        if (parent_category_id) {
            const parentCategory = await Category.findById(parent_category_id);
            if (!parentCategory) {
                throw new DevBuildError('Invalid parent category ID', 400);
            }
        }

        // ready for update data
        const updateData = {};
        if (categoryName && categoryName !== category.categoryName) {
            updateData.categoryName = categoryName;
        }
        if (description && description !== category.description) {
            updateData.description = description;
        }
        if (image && image !== category.image) {
            updateData.image = image;
        }
        if (parent_category_id && parent_category_id !== category.parent_category_id) {
            updateData.parent_category_id = parent_category_id;
        }
        if (newSlug !== category.slug) {
            updateData.slug = newSlug;
        }

        // when no changes
        if (Object.keys(updateData).length === 0) {
            return res.status(200).json({ message: 'Nothing to update' });
        }

        // Update The Category
        await Category.updateOne({ slug }, { $set: updateData });

        res.status(200).json({ message: 'Category Updated Successfully' });
    } catch (error) {
        next(error);
    }
};



// ✅ Delete Category
export const deleteCategory = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const category = await Category.findOne({ slug });

        const { role } = req.user;

        // Role check
        if (role !== "admin") {
            throw new DevBuildError('Access denied. Admins only.', 403);
        }

        if (!category) {
            throw new DevBuildError('Category not found', 404);
        }

        // Soft delete the category
        await category.softDelete();
        res.status(200).json({ message: "Category Deleted Successfully" });

    } catch (error) {
        next(error);
    }
}


