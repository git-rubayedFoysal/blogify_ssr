import mongoose from "mongoose";

// Comment collection; each comment belongs to a user and a blog post.
const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    blogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "blog",
    },
  },
  { timestamps: true },
);

const Comment = mongoose.model("comment", commentSchema);

export default Comment;
