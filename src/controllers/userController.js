import User from "../models/User.js";
import bcrypt from "bcrypt";
import DevBuildError from "../lib/DevBuildError.js";



// ✅ User Registration
export const createUser = async (req, res, next) => {
    try {
        const { name, email, password, phone, image } = req.body;
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            // return res.status(400).json({ message: "Email already exists" });
            throw new DevBuildError("Email already exists", 400);
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        // console.log("hashedPassword", hashedPassword);
        const user = new User({ name, email, password: hashedPassword, phone, image });

        await user.save();
        res.status(201).json({ message: "User registered successfully" });

    } catch (error) {
        console.error('Error creating category:', error);
        // res.status(400).json({ error: error.message });
        next(error);
    }
};


// Get all users
export const getAllUser = async (req, res, next) => {
    try {
        // const users = await User.find({}, '-password');  // Exclude password field from the result
        const users = await User.find({});  // Exclude password field from the result

        if (!users) {
            throw new Error("No users found");
        }

        res.status(200).json({
            message: "Users retrieved successfully",
            users
        });
    } catch (error) {
        next(error);
    }
};


// ✅ User Edit (Update)
export const editUser = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { name, email, phone, image, status } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            throw new DevBuildError("User not found", 404);
        }

        user.name = name || user.name;
        user.email = email || user.email;
        user.phone = phone || user.phone;
        user.image = image || user.image;
        user.status = status || user.status;

        await user.save();

        res.status(200).json({ message: "User updated successfully", user });
    } catch (error) {
        next(error);
    }
};


// ✅ User Soft Delete
export const deleteUser = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            throw new DevBuildError("User not found", 404);
        }

        await user.softDelete();  // Soft delete
        res.status(200).json({ message: "User deleted successfully", user });
    } catch (error) {
        next(error);
    }
};


// ✅ User Hard Delete
export const confirmDeleteUser = async (req, res, next) => {
    try {
        const { userId } = req.params;

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            throw new DevBuildError("User not found", 404);
        }

        // Hard delete the user by removing from the database
        await user.remove();

        res.status(200).json({ message: "User confirm deleted successfully" });
    } catch (error) {
        next(error);
    }
};


// ✅ approved user 
export const approvedUser = async (req, res, next) => {
    try {
        const { userId } = req.params;

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            throw new DevBuildError("User not found", 404);
        }

        user.status = 'active';
        await user.save();

        res.status(200).json({ message: "User Successfully Aproved" });
    } catch (error) {
        next(error);
    }
};
