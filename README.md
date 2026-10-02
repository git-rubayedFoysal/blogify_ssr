# Blogify SSR

A server-side rendered blogging platform built with **Express 5**, **EJS**, and **MongoDB**. Users can sign up, publish blogs with cover images, and comment on posts — authenticated via JWT stored in an httpOnly cookie.

## Features

- **SSR pages** — all views rendered server-side with EJS (no client-side JS)
- **JWT cookie auth** — httpOnly `accessToken` cookie, 1-day expiry, graceful logout on expiry
- **Password hashing** — argon2id via Mongoose pre-save hook
- **Route guards** — `requiredAuth` redirects anonymous users to signin
- **Image uploads** — cover images uploaded to **Cloudinary** via multer memory buffers (no local disk dependency, works on ephemeral filesystems like Render)
- **Comments** — authenticated users can comment on any blog

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Server     | Express 5                           |
| Templating | EJS                                 |
| Database   | MongoDB (Mongoose)                  |
| Auth       | jsonwebtoken, cookie-parser, argon2 |
| Image CDN  | Cloudinary (multer + upload_stream) |

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or managed — e.g., Render MongoDB, Atlas)
- **Cloudinary account** (for image uploads — free tier works)

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Then edit .env and set all required values:
#   - SECRET_KEY_FOR_ACCESS_TOKEN (generate: node -e "console.log(require('crypto').randomBytes(48).toString('hex'))")
#   - MONGO_URI (local or managed MongoDB connection string)
#   - CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET (from Cloudinary dashboard)
#   - NODE_ENV=production (for secure cookies in production)

# 3. Run
npm run dev     # development (auto-restart on changes)
# or
npm start       # production
```

The app listens on **http://localhost:3000** (or `PORT` from env).

### Cloudinary Setup

1. Create a free account at [cloudinary.com](https://cloudinary.com)
2. Copy **Cloud Name**, **API Key**, **API Secret** from the dashboard
3. Add them to your `.env` (or Render environment variables)

No local upload folder is needed — images are streamed directly to Cloudinary via multer memory storage.

## Project Structure

```
├── index.js                      # App entry: middleware order, routes, home page
├── connection.js                 # MongoDB connection helper
├── controllers/                  # Request handler logic
│   ├── user.js                   # signin, signup, logout handlers
│   └── blog.js                   # create blog, comments, blog page handlers
├── middlewares/                  # Express middleware
│   ├── authentication.js         # checkAuthentication (global), requiredAuth (guard)
│   ├── errorHandler.js           # 500 & 404 handlers
│   └── upload.js                 # multer config (memoryStorage, 5MB, image-only)
├── routes/                       # Thin routers — wiring only
│   ├── user.js                   # /user/* routes
│   └── blog.js                   # /blog/* routes
├── services/
│   ├── authentication.js         # JWT sign/verify (1-day expiry)
│   └── uploadToCloudinary.js     # Streams multer buffer to Cloudinary
├── config/
│   └── cloudinary.js             # Cloudinary SDK init (reads env vars)
├── models/                       # Mongoose schemas
│   ├── user.js                   # argon2 hashing + verifyPassword
│   ├── blog.js                   # blog post schema (includes coverImageURL, coverImagePublicId)
│   └── comment.js                # comment schema
├── views/                        # EJS templates
│   ├── home.ejs, signin.ejs, signup.ejs, addBlog.ejs, blog.ejs
│   └── partials/                 # head, nav, error, script
└── public/                       # Static assets (css, images)
```

## Routes

### Public

| Method | Path                  | Description              |
|--------|-----------------------|--------------------------|
| GET    | `/`                   | Home — list all blogs    |
| GET    | `/user/signin`        | Signin form              |
| GET    | `/user/signup`        | Signup form              |
| POST   | `/user/signin`        | Authenticate, set cookie  |
| POST   | `/user/signup`        | Create account, set cookie|
| GET    | `/blog/:id`           | Single blog + comments   |
| GET    | `/user/logout`        | Clear cookie, show signin|

### Auth required (`requiredAuth` guard)

| Method | Path                      | Description              |
|--------|---------------------------|--------------------------|
| GET    | `/blog/add-blog`          | New blog form            |
| POST   | `/blog`                   | Create blog (multipart, image → Cloudinary)  |
| POST   | `/blog/comment/:blogId`   | Add comment              |

## Auth Flow

```
SIGNIN/SIGNUP
  → createTokenForUser() signs JWT (expiresIn: "1d")
  → Set-Cookie: accessToken (httpOnly, 24h, sameSite=lax)

EVERY REQUEST
  → cookie-parser → checkAuthentication
      ├─ no cookie        → anonymous (nav shows "Sign In")
      ├─ valid token      → req.user set (nav shows user)
      └─ expired/invalid  → cookie cleared → anonymous

PROTECTED ROUTES
  → requiredAuth: no req.user → 302 redirect to /user/signin
```

> **Note:** JWT expiry matches cookie `maxAge` (both 1 day). Logout only clears the cookie — there is no server-side token revocation.

## Image Upload Flow (Cloudinary)

```
POST /blog (multipart/form-data)
  → multer (memoryStorage, 5MB, image-only)
  → upload.single("coverImage") populates req.file.buffer
  → createBlog handler:
      if (req.file) {
        uploadToCloudinary(req.file.buffer, `blogify/users/${userId}`)
        → Cloudinary upload_stream
        → returns { secure_url, public_id, ... }
      }
  → Blog.create({ ..., coverImageURL, coverImagePublicId })
  → redirect to new blog page
```

- **No local disk writes** — works on Render, Heroku, serverless, etc.
- **5 MB limit**, **images only** (enforced by multer `fileFilter`)
- **Folder structure**: `blogify/users/<userId>/` for organization
- Stores both `secure_url` (HTTPS delivery) and `public_id` (for future deletion/transformations)

## Scripts

| Command     | Description                          |
|-------------|--------------------------------------|
| `npm run dev`  | Start with auto-restart (`node --watch`) |
| `npm start`    | Start server                         |
| `npm run build`| No-op (required by Render)           |

## Deploying to Render

1. Push to GitHub
2. Create Render **Web Service** → connect repo
3. Create Render **Managed MongoDB** → copy connection string
4. Set environment variables in Render dashboard:
   - `SECRET_KEY_FOR_ACCESS_TOKEN` (generate: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`)
   - `MONGO_URI` (from Render MongoDB)
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` (from Cloudinary)
   - `NODE_ENV=production`
5. Build Command: `npm install`
6. Start Command: `npm start`
7. Health Check Path: `/health`
7. Node Version: 24 (from `engines` in package.json)

**No persistent disk needed** — Cloudinary handles all image storage.

## License

ISC