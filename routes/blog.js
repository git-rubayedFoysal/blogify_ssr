import express from "express";
import { requiredAuth } from "../middlewares/authentication.js";
import { upload } from "../middlewares/upload.js";
import {
  renderAddBlogForm,
  createBlog,
  createComment,
  renderBlogPage,
} from "../controllers/blog.js";

// Thin router: all handler logic lives in controllers/blog.js
// Cover image upload lives in middlewares/upload.js
const router = express.Router();

// Blog pages
router.get("/add-blog", requiredAuth, renderAddBlogForm);
router.get("/:id", renderBlogPage);

// Blog actions (auth required; cover image uploaded before createBlog runs)
router.post("/", requiredAuth, upload.single("coverImage"), createBlog);
router.post("/comment/:blogId", requiredAuth, createComment);

export default router;
