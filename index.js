import express from "express";
import cookieParser from "cookie-parser";
import "dotenv/config";
import { connectDB } from "./connection.js";
import {
  errorHandler,
  notFoundErrorHandler,
} from "./middlewares/errorHandler.js";
import userRouter from "./routes/user.js";
import blogRouter from "./routes/blog.js";
import { checkAuthentication } from "./middlewares/authentication.js";
import Blog from "./models/blog.js";

const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.set("views", "./views");

app.use(express.static("public"));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(cookieParser());
app.use(checkAuthentication);

app.use("/user", userRouter);
app.use("/blog", blogRouter);

app.get("/", async (req, res) => {
  const allBlogs = await Blog.find({}).sort({
    createdAt: -1,
  });
  res.render("home", {
    user: req?.user,
    blogs: allBlogs,
  });
});

// 404 handler & default error handler
app.use(notFoundErrorHandler);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  connectDB("mongodb://127.0.0.1:27017/blogify");
});
