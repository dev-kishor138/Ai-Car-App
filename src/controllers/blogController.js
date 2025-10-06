import DevBuildError from "../lib/DevBuildError.js";
import { generateUniqueSlug } from "../lib/utilityFunction.js";
import Blog from "../models/Blog.js";
import BlogTags from "../models/BlogTags.js";
import Notification from "../models/Notification.js";



// ✅ Create Blog
export const blogStore = async (req, res, next) => {
    try {
        const { categoryId, title, description, image, tagId } = req.body;
        const { id: userId } = req.user;


        if (!categoryId || !title) {
            throw new DevBuildError("User ID, Category, and Title are required", 400);
        }

        let slug = title ? await generateUniqueSlug(Blog, title) : null;
        if (!slug) throw new DevBuildError("Slug generation failed", 500);

        const blog = new Blog({
            userId,
            categoryId,
            slug,
            title,
            description: description || '',
            image: image || '',
        });

        await blog.save();

        // ট্যাগ থাকলে যোগ করো
        if (Array.isArray(tagId) && tagId.length > 0) {
            const blogTagsData = tagId.map((tag) => ({ blogId: blog._id, tagId: tag }));
            await BlogTags.insertMany(blogTagsData);
        } else if (tagId) {
            await BlogTags.create({ blogId: blog._id, tagId });
        }

        // ================================
        // 🟢 LIVE NOTIFICATION SECTION
        // ================================
        const io = req.app.get("io");

        // ধরো admin এর ID তুমি .env থেকে নিচ্ছো
        const adminId = process.env.ADMIN_ID;

        // ১️⃣ Notification DB তে সংরক্ষণ
        await Notification.create({
            senderId: userId,
            receiverId: adminId,
            type: "blog",
            blogId: blog._id,
            message: `New blog created: ${title}`,
        });

        // ২️⃣ Socket.IO দিয়ে admin কে পাঠাও (real-time)
        io.emit("newBlog", {
            blogTitle: title,
            createdBy: req.user.name || "Unknown User",
            blogId: blog._id,
        });
        // ================================

        res.status(201).json({ message: "Blog Created Successfully" });

    } catch (error) {
        console.error("Error in blogStore:", error);
        next(error);
    }
};


// ✅ Get All Blog
export const getAllBlog = async (req, res, next) => {
    try {
        const blogs = await Blog.find({ status: "active" })
            .populate("categoryId", "categoryName")
            .select("-userId -categoryId -status -isDeleted -__v")
            .sort({ createdAt: -1 })
            .limit(10);

        const blogsWithTags = await Promise.all(
            blogs.map(async (blog) => {
                const tags = await BlogTags.find({ blogId: blog._id })
                    .populate("tagId", "tag slug")
                    .select("-__v");

                return { ...blog.toObject(), tags: tags.map(t => t.tagId) };
            })
        );

        res.status(200).json(blogsWithTags);
    } catch (error) {
        next(error);
    }
};



// ✅ Get Single Blog
export const getSingleBlog = async (req, res, next) => {
    try {
        const { slug } = req.params;

        const blog = await Blog.findOne({ slug })
            .populate("categoryId", "categoryName")
            .select("-userId -categoryId -status -isDeleted -__v");

        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        const tags = await BlogTags.find({ blogId: blog._id })
            .populate("tagId", "tag slug")
            .select("-__v");

        res.status(200).json({ ...blog.toObject(), tags: tags.map(t => t.tagId) });

    } catch (error) {
        next(error);
    }
};



// ✅ Update Blog
export const updateBlog = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const { blogId, title, description, image, tagId } = req.body;

        const { id: userId } = req.user;

        // find Blog
        const blog = await Blog.findOne({ slug, userId });
        if (!blog) {
            throw new DevBuildError('Blog not found', 404);
        }

        // If title is changed, generate new Slug
        let newSlug = title ? await generateUniqueSlug(Blog, title) : blog.slug;

        // ready for update data
        const updateData = {};
        if (title && title !== blog.title) {
            updateData.title = title;
        }
        if (description && description !== blog.description) {
            updateData.description = description;
        }
        if (image && image !== blog.image) {
            updateData.image = image;
        }
        if (blogId && blogId !== blog.blogId) {
            updateData.blogId = blogId; // Ensure that you really need to update blogId
        }
        if (newSlug !== blog.slug) {
            updateData.slug = newSlug;
        }

        // when no changes
        if (Object.keys(updateData).length === 0) {
            return res.status(200).json({ message: 'Nothing to update' });
        }

        // Update The Blog (except blogId)
        await Blog.updateOne({ slug }, { $set: updateData });

        // Delete previous BlogTags for this blog
        await BlogTags.deleteMany({ blogId: blog._id });

        // Handle tags update - Create new BlogTags for each tagId
        if (Array.isArray(tagId)) {
            const blogTagsData = tagId.map((tag) => ({ blogId: blog._id, tagId: tag }));
            await BlogTags.insertMany(blogTagsData);
        } else {
            await BlogTags.insertOne({ blogId: blog._id, tagId });
        }

        res.status(200).json({ message: 'Blog Updated Successfully' });

    } catch (error) {
        console.log(error);
        next(error);
    }
}



// ✅ Delete Blog
export const deleteBlog = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const { id: userId } = req.user;
        const blog = await Blog.findOne({ slug, userId });

        if (!blog) {
            throw new DevBuildError('Blog not found', 404);
        }

        // Soft delete the Blog
        await blog.softDelete();
        res.status(200).json({ message: "Blog Deleted Successfully" });

    } catch (error) {
        next(error);
    }
}