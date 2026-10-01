# Blogify SSR

A server-side rendered blogging platform built with **Express 5**, **EJS**, and **MongoDB**. Users can sign up, publish blogs with cover images, and comment on posts — authenticated via JWT stored in an httpOnly cookie.

## Features

- **SSR pages** — all views rendered server-side with EJS (no client-side JS)
- **JWT cookie auth** — httpOnly `accessToken` cookie, 1-day expiry, graceful logout on expiry
- **Password hashing** — argon2id via Mongoose pre-save hook
- **Route guards** — `requiredAuth` redirects anonymous users to signin
- **Image uploads** — cover images stored per-user under `public/uploads/<userId>/`
- **Comments** — authenticated users can comment on any blog

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Server     | Express 5                           |
| Templating | EJS                                 |
| Database   | MongoDB (Mongoose)                  |
| Auth       | jsonwebtoken, cookie-parser, argon2 |
| Uploads    | multer                              |

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB running locally (default: `mongodb://127.0.0.1:27017/blogify`)

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Then edit .env and set a strong secret:
#   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"

# 3. Run
npm run dev     # development (auto-restart on changes)
# or
npm start       # production
```

The app listens on **http://localhost:3000**.

## Project Structure

```
├── index.js                  # App entry: middleware order, routes, home page
├── connection.js             # MongoDB connection helper
├── controllers/              # Request handler logic
│   ├── user.js               # signin, signup, logout handlers
│   └── blog.js               # create blog, comments, blog page handlers
├── middlewares/              # Express middleware
│   ├── authentication.js     # checkAuthentication (global), requiredAuth (guard)
│   ├── errorHandler.js       # 500 & 404 handlers
│   └── upload.js             # multer storage config for cover images
├── routes/                   # Thin routers — wiring only
│   ├── user.js               # /user/* routes
│   └── blog.js               # /blog/* routes
├── services/
│   └── authentication.js     # JWT sign/verify (1-day expiry)
├── models/                   # Mongoose schemas
│   ├── user.js               # argon2 hashing + verifyPassword
│   ├── blog.js               # blog post schema
│   └── comment.js            # comment schema
├── views/                    # EJS templates
│   ├── home.ejs, signin.ejs, signup.ejs, addBlog.ejs, blog.ejs
│   └── partials/             # head, nav, error, script
└── public/                   # Static assets (css, images, uploads/)
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
| POST   | `/blog`                   | Create blog (multipart)  |
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

## Scripts

| Command     | Description                          |
|-------------|--------------------------------------|
| `npm run dev`  | Start with auto-restart (`node --watch`) |
| `npm start`    | Start server                        |

## License

ISC
