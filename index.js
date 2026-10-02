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
const PORT = process.env.PORT || 3000;

// Trust Render's reverse proxy
app.set("trust proxy", 1);

// Configure EJS as the view engine
app.set("view engine", "ejs");
app.set("views", "./views");

// Serve static assets (css, images, uploaded blog covers)
app.use(express.static("public"));

// Parse form submissions (signin/signup/blog create) and JSON bodies
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Parse cookies so req.cookies.accessToken is available
app.use(cookieParser());

// Runs on every request: verifies the accessToken cookie and attaches
// req.user when valid. Expired/invalid tokens are cleared gracefully.
app.use(checkAuthentication);

// Route modules
app.use("/user", userRouter); // signin, signup, logout
app.use("/blog", blogRouter); // blogs, comments

/**
 * Home page - lists all blogs newest first.
 * Passes req.user so the nav can render login state.
 */
app.get("/", async (req, res) => {
  const allBlogs = await Blog.find({}).sort({
    createdAt: -1,
  });
  res.render("home", {
    user: req.user,
    blogs: allBlogs,
  });
});

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// 404 handler & default error handler (must be registered last)
app.use(notFoundErrorHandler);
app.use(errorHandler);

// Start server and database
try {
  await connectDB(process.env.MONGO_URI);

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
  });
} catch (error) {
  console.error("Failed to start application:", error);
  process.exit(1);
}
