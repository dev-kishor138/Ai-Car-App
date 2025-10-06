import DevBuildError from "../lib/DevBuildError.js";
import Comment from "../models/Comment.js";


// ✅ Create Comment
export const createComment = async (req, res, next) => {
    try {
        const { blogId, parentCommentId, message } = req.body;
        const { id: userId } = req.user;

        if (!blogId) {
            throw new DevBuildError("Blog is required", 400);
        }
        if (!message) {
            throw new DevBuildError("Message is required", 400);
        }

        if (parentCommentId) {
            // Parent Comment থাকলে সেটি reply হিসেবে ধরবে
            const parentComment = await Comment.findById(parentCommentId);
            if (!parentComment) {
                throw new DevBuildError("Parent comment not found", 404);
            }
        }

        // Create a new comment or reply
        await Comment.create({ userId, blogId, message, parentCommentId });

        res.status(201).json({ message: "Comment added successfully" });

    } catch (error) {
        next(error);
    }
};

// ✅ Update Comments
export const updateComment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { message } = req.body;
        const { id: userId, role } = req.user;

        if (!message) {
            throw new DevBuildError("Message is required", 400);
        }

        // Check if comment exists
        const comment = await Comment.findOne({ _id: id });
        if (!comment) {
            throw new DevBuildError("Comment not found", 404);
        }

        // Check if the user is authorized to update the comment
        if (role !== "admin" && comment.userId.toString() !== userId) {
            throw new DevBuildError("Unauthorized: You can only update your own comments", 403);
        }

        // Update the comment
        comment.message = message;
        await comment.save();

        res.status(200).json({ message: "Comment updated successfully" });

    } catch (error) {
        next(error);
    }
};


// ✅ Delete Comments
export const deleteComment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { id: userId, role } = req.user;

        // 1️⃣ Check if comment exists
        const comment = await Comment.findOne({ _id: id });
        if (!comment) {
            throw new DevBuildError("Comment not found", 404);
        }

        // 2️⃣ Check if the user is the owner or an admin
        if (role !== "admin" && comment.userId.toString() !== userId) {
            throw new DevBuildError("Unauthorized: You can only delete your own comments", 403);
        }

        // 3️⃣ Soft delete the comment
        await comment.softDelete();

        // 4️⃣ Optional: Soft delete all replies of this comment
        await Comment.updateMany({ parentCommentId: id }, { deletedAt: new Date() }, { isDeleted: true });

        res.status(200).json({ message: "Comment deleted successfully" });

    } catch (error) {
        next(error);
    }
};



// export const createComment = async (req, res, next) => {
//     const session = await mongoose.startSession();
//     session.startTransaction();
//     try {
//         const { blogId, parentCommentId, message, image, video } = req.body;
//         const { id: userId, role } = req.user;

//         // Validation
//         if (!blogId) throw new DevBuildError("Blog is required", 400);
//         if (!message) throw new DevBuildError("Message is required", 400);
//         if (message.length > 500) throw new DevBuildError("Comment cannot exceed 500 characters", 400);
//         if (message.length < 2) throw new DevBuildError("Comment must be at least 2 characters long", 400);

//         // Check if blog exists
//         const blog = await Blog.findById(blogId).session(session);
//         if (!blog) throw new DevBuildError("Blog not found", 404);

//         // Check if parent comment exists and belongs to the same blog
//         if (parentCommentId) {
//             const parentComment = await Comment.findById(parentCommentId).session(session);
//             if (!parentComment) throw new DevBuildError("Parent comment not found", 404);
//             if (parentComment.blogId.toString() !== blogId) throw new DevBuildError("Parent comment does not belong to this blog", 400);
//         }

//         // Check for duplicate comments
//         const existingComment = await Comment.findOne({ userId, blogId, message }).session(session);
//         if (existingComment) throw new DevBuildError("Duplicate comment detected", 400);

//         // Create comment
//         const comment = await Comment.create([{
//             userId,
//             blogId,
//             message,
//             parentCommentId,
//             image: image || null,
//             video: video || null,
//             status: "pending",
//             likes: 0,
//             dislikes: 0,
//             createdAt: new Date(),
//         }], { session });

//         // Send notification to blog author
//         if (blog.userId.toString() !== userId) {
//             await Notification.create([{
//                 userId: blog.userId,
//                 message: `New comment on your blog: ${message}`,
//             }], { session });
//         }

//         await session.commitTransaction();
//         session.endSession();

//         res.status(201).json({
//             message: "Comment added successfully",
//             commentId: comment[0]._id,
//             link: `/comments/${comment[0]._id}`,
//         });

//     } catch (error) {
//         await session.abortTransaction();
//         session.endSession();
//         next(error);
//     }
// };