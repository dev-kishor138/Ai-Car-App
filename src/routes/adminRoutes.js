import express from "express";
import { authenticateAdmin } from "../middleware/authMiddleware.js";
import { categryStore, deleteCategory, getAllCategory, getSingleCategory, updateCategory } from "../controllers/categoryController.js";
import { blogStore, deleteBlog, getAllBlog, getSingleBlog, updateBlog } from "../controllers/blogController.js";
import { deleteTags, getAllTags, getSingleTags, tagStore, updateTags } from "../controllers/tagController.js";
import { reactBlog } from "../controllers/reactController.js";
import { createComment, deleteComment, updateComment } from "../controllers/commentController.js";
import { bookmarkFolderStore, deleteBookmarkFolder, getAllBookmarkFolder, updateBookmarkFolder } from "../controllers/bokmarkFolderController.js";
import { bookmarkStore, deleteBookmark, getAllBookmark, getSingleBookmark } from "../controllers/bookmarkController.js";


const adminRoutes = express.Router();

// 🔒 Admin Only Route
adminRoutes.get("/profile", authenticateAdmin, (req, res) => {
    res.json({ message: "Welcome Admin!", user: req.user });
});

// category related routes 
adminRoutes.post('/category-store', authenticateAdmin, categryStore);
adminRoutes.get('/category-list', authenticateAdmin, getAllCategory);
adminRoutes.get('/category/:slug', authenticateAdmin, getSingleCategory);
adminRoutes.put('/category/update/:slug', authenticateAdmin, updateCategory);
adminRoutes.delete('/category/delete/:slug', authenticateAdmin, deleteCategory);
// Blog related Routes 
adminRoutes.post('/blog-store', authenticateAdmin, blogStore);
adminRoutes.post('/blogs', authenticateAdmin, getAllBlog);
adminRoutes.post('/blog/:slug', authenticateAdmin, getSingleBlog);
adminRoutes.put('/blog-update/:slug', authenticateAdmin, updateBlog);
adminRoutes.delete('/blog-delete/:slug', authenticateAdmin, deleteBlog);
//Tags Related Routes
adminRoutes.post('/tag-store', authenticateAdmin, tagStore);
adminRoutes.get('/tags', authenticateAdmin, getAllTags);
adminRoutes.get('/tag/:slug', authenticateAdmin, getSingleTags);
adminRoutes.put('/tag-update/:slug', authenticateAdmin, updateTags);
adminRoutes.delete('/tag-delete/:slug', authenticateAdmin, deleteTags);
// React 
adminRoutes.post('/blog-react', authenticateAdmin, reactBlog);
// comments 
adminRoutes.post('/blog/comment', authenticateAdmin, createComment);
adminRoutes.put('/blog/comment-update/:id', authenticateAdmin, updateComment);
adminRoutes.delete('/blog/comment-delete/:id', authenticateAdmin, deleteComment);

// Bookmark categories Routes
adminRoutes.post('/bookmark-folder/store', authenticateAdmin, bookmarkFolderStore);
adminRoutes.get('/bookmark-folder', authenticateAdmin, getAllBookmarkFolder);
// adminRoutes.get('/tag/:slug', authenticateAdmin, getSingleTags);
adminRoutes.put('/bookmark-folder/update/:slug', authenticateAdmin, updateBookmarkFolder);
adminRoutes.delete('/bookmark-folder/delete/:slug', authenticateAdmin, deleteBookmarkFolder);

// bookmark related routes 
adminRoutes.post('/bookmark/store', authenticateAdmin, bookmarkStore);
adminRoutes.get('/bookmarks', authenticateAdmin, getAllBookmark);
adminRoutes.get('/bookmark/:id', authenticateAdmin, getSingleBookmark);
adminRoutes.delete('/bookmark/delete/:id', authenticateAdmin, deleteBookmark);

export default adminRoutes;