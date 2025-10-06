import express from "express";
import { authenticateUser } from "../middleware/authMiddleware.js";
import { blogStore, deleteBlog, updateBlog } from "../controllers/blogController.js";
import { deleteTags, tagStore, updateTags } from "../controllers/tagController.js";
import { reactBlog } from "../controllers/reactController.js";
import { createComment, deleteComment, updateComment } from "../controllers/commentController.js";
import { bookmarkFolderStore, deleteBookmarkFolder, getAllBookmarkFolder, updateBookmarkFolder } from "../controllers/bokmarkFolderController.js";
import { bookmarkStore, deleteBookmark, getAllBookmark, getSingleBookmark } from "../controllers/bookmarkController.js";

const userRoutes = express.Router();

// 🔒 Protected Route
userRoutes.get("/profile", authenticateUser, (req, res) => {
    console.log(req.user);
    res.json({ message: "Welcome to your profile", user: req.user });
});

// Blog related Routes 
userRoutes.post('/blog-store', authenticateUser, blogStore);
userRoutes.put('/blog-update/:slug', authenticateUser, updateBlog);
userRoutes.delete('/blog-delete/:slug', authenticateUser, deleteBlog);

// Tag Related Route 
userRoutes.post('/tag-store', authenticateUser, tagStore);
userRoutes.put('/tag-update/:slug', authenticateUser, updateTags);
userRoutes.delete('/tag-delete/:slug', authenticateUser, deleteTags);
// React Blog 
userRoutes.post('/blog-react', authenticateUser, reactBlog);
// comments 
userRoutes.post('/blog/comment', authenticateUser, createComment);
userRoutes.put('/blog/comment-update', authenticateUser, updateComment);
userRoutes.delete('/blog/comment-delete/:id', authenticateUser, deleteComment);

// bookmark folder 
userRoutes.get('/bookmark-folder', authenticateUser, getAllBookmarkFolder);
userRoutes.post('/bookmark-folder/store', authenticateUser, bookmarkFolderStore);
userRoutes.put('/bookmark-folder/update/:slug', authenticateUser, updateBookmarkFolder);
userRoutes.delete('/bookmark-folder/delete/:id', authenticateUser, deleteBookmarkFolder);

// bookmark related Routes 
userRoutes.get('/bookmark/store', authenticateUser, bookmarkStore);
userRoutes.post('/bookmarks', authenticateUser, getAllBookmark);
userRoutes.put('/bookmark/:id', authenticateUser, getSingleBookmark);
userRoutes.delete('/bookmark/delete/:id', authenticateUser, deleteBookmark);




export default userRoutes;