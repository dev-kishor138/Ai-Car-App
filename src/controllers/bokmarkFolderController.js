import DevBuildError from "../lib/DevBuildError.js";
import { generateUniqueSlug } from "../lib/utilityFunction.js";
import BookmarkFolder from "../models/BookmarkFolder.js";



// ✅ Create BookmarkFolder
export const bookmarkFolderStore = async (req, res, next) => {
    try {
        const { folderName } = req.body;
        const { id: userId } = req.user;

        if (!folderName) {
            throw new DevBuildError("FolderName is required", 400);
        }
        let slug = await generateUniqueSlug(BookmarkFolder, folderName);

        const bookmarkFolder = new BookmarkFolder({
            userId,
            folderName,
            slug,
        });
        await bookmarkFolder.save();
        res.status(201).json({ message: "BookmarkFolder Created Successfully" });

    } catch (error) {
        next(error);
    }
}

// ✅ Get All BookmarkFolder
export const getAllBookmarkFolder = async (req, res, next) => {
    try {
        const { id: userId, role } = req.user;

        let filter = { status: "active" };

        if (role !== "admin") {
            filter.userId = userId;
        }

        const bookmarkFolders = await BookmarkFolder.find(filter);
        res.status(200).json(bookmarkFolders);

    } catch (error) {
        next(error);
    }
};



// ✅ Get Single BookmarkFolder
// export const getSingleBookmarkFolder = async (req, res, next) => {
//     try {
//         const { slug } = req.params;
//         const bookmarkFolder = await BookmarkFolder.findOne({ slug }).populate('parent_bookmarkFolder_id');
//         if (!bookmarkFolder) {
//             throw new DevBuildError('BookmarkFolder not found', 404);
//         }
//         // Find subcategories
//         const subcategories = await BookmarkFolder.find({ parent_bookmarkFolder_id: bookmarkFolder._id });
//         bookmarkFolder.subcategories = subcategories;
//         res.status(200).json(bookmarkFolder);
//     } catch (error) {
//         next(error);
//     }
// }


// ✅ Update BookmarkFolder
export const updateBookmarkFolder = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const { folderName } = req.body;
        const { id: userId, role } = req.user;

        const filter = role === "admin" ? { slug } : { slug, userId };

        const bookmarkFolder = await BookmarkFolder.findOne(filter);
        if (!bookmarkFolder) throw new DevBuildError('BookmarkFolder Not Found', 404);

        const updateData = {
            ...(folderName && folderName !== bookmarkFolder.folderName && {
                folderName,
                slug: await generateUniqueSlug(BookmarkFolder, folderName)
            })
        };

        if (Object.keys(updateData).length > 0) {
            await BookmarkFolder.updateOne({ slug }, { $set: updateData });
            return res.status(200).json({ message: 'BookmarkFolder Updated Successfully' });
        }

        res.status(200).json({ message: 'Nothing to update' });

    } catch (error) {
        next(error);
    }
};


// ✅ Delete BookmarkFolder
export const deleteBookmarkFolder = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const { id: userId, role } = req.user;

        const filter = role === "admin" ? { slug } : { slug, userId };

        const bookmarkFolder = await BookmarkFolder.findOne(filter);
        if (!bookmarkFolder) throw new DevBuildError('BookmarkFolder not found', 404);

        await bookmarkFolder.softDelete();
        res.status(200).json({ message: "BookmarkFolder Deleted Successfully" });

    } catch (error) {
        next(error);
    }
};



