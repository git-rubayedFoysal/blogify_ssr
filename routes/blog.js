import express from "express";
import multer from "multer";
import path from "node:path";
import { mkdirSync } from "node:fs";
import Blog from "../models/blog.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.resolve("public", "uploads", req.user.id.toString());

    mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);

    const fileName = `${crypto.randomUUID()}${ext}`;

    cb(null, fileName);
  },
});

const upload = multer({
  storage,
});

router.get("/add-blog", (req, res) => {
  res.render("addBlog", {
    user: req.user,
  });
});

router.post("/", upload.single("coverImage"), async (req, res) => {
  const { title, body } = req.body;
  if (!title || !body)
    return res.status(400).render("addBlog", {
      error: "Invalid request, all fields are required!",
    });

  const blog = await Blog.create({
    title,
    body,
    coverImageURL: `/uploads/${req.user.id}/${req.file?.filename}`,
    createdBy: req.user.id,
  });

  res.redirect(`/blog/${blog._id}`);
});

router.get("/:id", async (req, res) => {
  const blog = await Blog.findById(req.params.id).populate({
    path: "createdBy",
    select: "fullName email avatarURL role",
  });

  if (!blog) {
    return res.status(404).send("Blog not found.");
  }

  return res.render("blog", {
    user: req.user,
    blog,
  });
});

export default router;
