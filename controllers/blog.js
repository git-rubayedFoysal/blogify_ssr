import Blog from "../models/blog.js";
import Comment from "../models/comment.js";
import { uploadToCloudinary } from "../services/uploadToCloudinary.js";

// module scaffolding
const blog = {};

/**
 * GET /blog/add-blog - renders the new blog form (auth required).
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
blog.renderAddBlogForm = (req, res) => {
  res.render("addBlog", {
    user: req.user,
  });
};

/**
 * POST /blog - creates a blog post (auth required).
 * Cover image (optional) is uploaded to Cloudinary via multer memory buffer.
 * Title and body are required. On success stores Cloudinary secure_url + public_id
 * in the blog document and redirects to the new blog page.
 * @param {Object} req - Express request (title, body in body; coverImage in file.buffer).
 * @param {Object} res - Express response.
 */
blog.createBlog = async (req, res) => {
  const { title, body } = req.body;
  if (!title || !body)
    return res.status(400).render("addBlog", {
      error: "Invalid request, all fields are required!",
    });

  try {
    let coverImageURL;
    let coverImagePublicId;

    if (req.file) {
      const result = await uploadToCloudinary(
        req.file.buffer,
        `blogify/users/${req.user.id}`,
      );

      coverImageURL = result.secure_url;
      coverImagePublicId = result.public_id;
    }

    const newBlog = await Blog.create({
      title,
      body,
      coverImageURL,
      coverImagePublicId,
      createdBy: req.user.id,
    });

    res.redirect(`/blog/${newBlog._id}`);
  } catch (error) {
    console.error("Create blog failed:", error.message);
    res.status(500).render("addBlog", {
      error: "Something went wrong while creating the blog. Please try again.",
    });
  }
};

/**
 * POST /blog/comment/:blogId - adds a comment to a blog (auth required).
 * @param {Object} req - Express request object (content in body, blogId in params).
 * @param {Object} res - Express response object.
 */
blog.createComment = async (req, res) => {
  const { content } = req.body;
  if (!content) {
    return res.status(400).render("blog", {
      error: "Invalid comment, content are required!",
    });
  }

  const comment = await Comment.create({
    content,
    blogId: req.params.blogId,
    createdBy: req.user.id,
  });

  res.redirect(`/blog/${comment.blogId}`);
};

/**
 * GET /blog/:id - single blog view with comments (public).
 * Returns 404 if the blog doesn't exist.
 * @param {Object} req - Express request object (id in params).
 * @param {Object} res - Express response object.
 */
blog.renderBlogPage = async (req, res) => {
  const targetBlog = await Blog.findById(req.params.id).populate({
    path: "createdBy",
    select: "fullName email avatarURL role",
  });

  const comments = await Comment.find({ blogId: req.params.id })
    .populate({
      path: "createdBy",
      select: "fullName email avatarURL role",
    })
    .sort({ createdAt: -1 });

  if (!targetBlog) {
    return res.status(404).send("Blog not found.");
  }

  return res.render("blog", {
    user: req.user,
    blog: targetBlog,
    comments,
  });
};

// Named exports so routes/blog.js can import individual handlers
export const { renderAddBlogForm, createBlog, createComment, renderBlogPage } =
  blog;
