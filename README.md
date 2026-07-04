# MassavuSports Backend API

This is the backend API for MassavuSports, providing administrative management for posts, tags, comments, and metrics.

## Tech Stack
- Node.js & Express
- Prisma ORM (SQLite)
- BCrypt & JWT for Authentication
- Multer for Image Uploads

## Scripts
Inside the `backend` directory, you can run:

- `npm run dev`: Starts the server with Nodemon (if configured in package.json) or run `node src/server.js` directly.
- `npx prisma db push`: Pushes Prisma schema to the database.
- `npx prisma studio`: Opens Prisma GUI to manage database visually.

## Database & Setup
1. Clone / Create the project.
2. Ensure you have Node.js installed.
3. Run `npm install` in the `backend` folder.
4. Copy `.env.example` to `.env` and fill the variables.
5. Run `npx prisma db push` to initialize the SQLite database.
6. Run `node src/seed.js` to create the default admin user:
   - **Username**: `admin`
   - **Password**: `password123`
7. Start server with `node src/server.js`.

## API Endpoints Overview

### Auth (Admin)
- `POST /api/auth/login` (Body: username, password) -> Returns JWT token.
- `POST /api/auth/logout` 
- `GET /api/auth/me` (Needs Bearer Token)

### Posts
- `GET /api/posts` -> Get all posts (supports `page` and `limit` query params)
- `GET /api/posts/:id` -> Get a post & increment views automatically
- `POST /api/posts` (Auth Required) -> Create post. Supports `multipart/form-data` with `featuredImage` as image, `title`, `content`, `status`, `tags` (JSON array of tag IDs).
- `PUT /api/posts/:id` (Auth Required)
- `DELETE /api/posts/:id` (Auth Required)

### Tags
- `GET /api/tags`
- `POST /api/tags` (Auth Required) -> Body: `name`
- `PUT /api/tags/:id` (Auth Required)
- `DELETE /api/tags/:id` (Auth Required)

### Comments
- `GET /api/posts/:postId/comments` -> Get comments for a post
- `POST /api/posts/:postId/comments` -> Add comment. Body: `name`, `content`
- `PUT /api/comments/:id/approve` (Auth Required) -> Approve comment
- `DELETE /api/comments/:id` (Auth Required) -> Delete comment

### Dashboard
- `GET /api/dashboard/stats` (Auth Required) -> Returns total posts, views, tags, comments

## File Uploads
Image uploads are saved inside `public/uploads` and are statically served at `/public/uploads`.
