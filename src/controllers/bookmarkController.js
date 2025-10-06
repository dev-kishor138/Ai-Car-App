import DevBuildError from "../lib/DevBuildError.js";
import { generateUniqueSlug } from "../lib/utilityFunction.js";
import Bookmark from "../models/BookMark.js";



// ✅ Create Bookmark
export const bookmarkStore = async (req, res, next) => {
    try {
        const { blogId, folderId } = req.body;
        const { id: userId } = req.user;
        if (!folderId) {
            throw new DevBuildError("FolderName is required", 400);
        }
        if (!blogId) {
            throw new DevBuildError("BlogId is required", 400);
        }
        const bookmark = new Bookmark({
            blogId,
            folderId,
            userId
        });
        await bookmark.save();
        res.status(201).json({ message: "Bookmark Created Successfully" });

    } catch (error) {
        console.log(error);
        next(error);
    }
}

// ✅ Get All Bookmark
export const getAllBookmark = async (req, res, next) => {
    try {
        const { id: userId, role } = req.user;

        if (role !== "admin" && role !== "user") {
            throw new Error("Unauthorized access");
        }

        const filter = role === "admin" ? {} : { userId };
        const bookmarks = await Bookmark.find(filter);

        res.status(200).json(bookmarks);
    } catch (error) {
        next(error);
    }
};


// ✅ Get Single Bookmark
export const getSingleBookmark = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { id: userId, role } = req.user;

        const bookmark = await Bookmark.findOne({ _id: id })
            .populate('blogId')
            .populate('folderId');

        if (!bookmark) {
            throw new DevBuildError('Bookmark not found', 404);
        }

        if (role !== 'admin' && bookmark.userId.toString() !== userId) {
            throw new DevBuildError('Unauthorized access', 403);
        }

        res.status(200).json(bookmark);
    } catch (error) {
        next(error);
    }
};


// ✅ Remove Blog From Bookmark
export const deleteBookmark = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { id: userId, role } = req.user;

        const bookmark = await Bookmark.findOneAndUpdate(
            { _id: id, userId: role === 'admin' ? { $exists: true } : userId },
            { $set: { isDeleted: true } },
            { new: true }
        );

        if (!bookmark) {
            throw new DevBuildError('Bookmark not found or unauthorized access', 404);
        }
        res.status(204).json({ message: "Bookmark Deleted Successfully" });
    } catch (error) {
        next(error);
    }
};


