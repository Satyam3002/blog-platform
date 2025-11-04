# Blog Platform

A modern, full-stack blogging platform built with Next.js 15, TypeScript, tRPC, PostgreSQL, and Drizzle ORM. Features include category management, markdown support, image uploads via Cloudinary, and a clean, responsive UI.

## 🚀 Features

### Core Features
- ✅ **Post CRUD Operations** - Create, read, update, and delete blog posts
- ✅ **Category Management** - Create and manage categories with many-to-many relationships
- ✅ **Markdown Editor** - Write posts in Markdown with syntax highlighting
- ✅ **Image Upload** - Upload images to Cloudinary CDN with automatic optimization
- ✅ **Slug Generation** - Automatic URL-friendly slugs for posts and categories
- ✅ **Draft/Published Status** - Save drafts and publish when ready
- ✅ **Category Filtering** - Filter posts by category on the blog listing page
- ✅ **Pagination** - Navigate through posts with pagination
- ✅ **Responsive Design** - Mobile-friendly UI built with Tailwind CSS

### UI Features
- 🎨 **Landing Page** - Professional landing page with hero, features, and footer sections
- 📊 **Dashboard** - Manage all posts and categories from a central dashboard
- 📝 **Rich Content Editor** - Markdown editor with preview support
- 🏷️ **Tag System** - Add tags to posts for better organization
- 🖼️ **Image Preview** - Preview images before publishing

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **API**: tRPC (type-safe API layer)
- **Validation**: Zod
- **State Management**: Zustand
- **Data Fetching**: TanStack React Query (via tRPC)
- **Styling**: Tailwind CSS
- **Markdown**: react-markdown with remark-gfm
- **Image Upload**: Cloudinary CDN

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (local or hosted)
- Cloudinary account (for image uploads - optional but recommended)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd blog-platform
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/blog_db

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 4. Set Up PostgreSQL Database

#### Option A: Using psql

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database and user
CREATE DATABASE blog_db;
CREATE USER blog_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE blog_db TO blog_user;
```

#### Option B: Using a Hosted Database

You can use services like:
- [Supabase](https://supabase.com) (free tier available)
- [Neon](https://neon.tech) (free tier available)
- [Railway](https://railway.app)

### 5. Set Up Cloudinary (Optional but Recommended)

1. Sign up at [Cloudinary](https://cloudinary.com/) (free tier available)
2. Get your credentials from the dashboard
3. Add them to `.env.local` as shown above

See [CLOUDINARY_SETUP.md](./CLOUDINARY_SETUP.md) for detailed setup instructions.

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The database tables will be created automatically on first run.

## 📁 Project Structure

```
blog-platform/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/                # API routes
│   │   │   ├── trpc/           # tRPC API handler
│   │   │   └── upload/         # Image upload endpoint
│   │   ├── dashboard/          # Dashboard pages
│   │   │   └── categories/     # Category management
│   │   ├── edit/               # Edit post page
│   │   ├── home/               # Blog listing page
│   │   ├── new/                # Create post page
│   │   ├── post/               # Post detail pages
│   │   └── page.tsx            # Landing page
│   ├── server/
│   │   ├── db/                 # Database configuration
│   │   │   ├── client.ts       # Drizzle client
│   │   │   └── schema.ts       # Database schema
│   │   ├── trpc/               # tRPC setup
│   │   │   ├── context.ts      # tRPC context
│   │   │   └── router.ts       # API routes
│   │   └── utils/
│   │       └── slug.ts          # Slug generation utility
│   └── trpc/
│       └── client.ts            # tRPC client setup
├── public/                     # Static assets
└── package.json
```

## 🎯 Available Routes

- `/` - Landing page
- `/home` - Blog listing with pagination and category filtering
- `/dashboard` - Manage posts and categories
- `/new` - Create a new post
- `/edit/[id]` - Edit an existing post
- `/post/[slug]` - View individual post
- `/dashboard/categories/new` - Create a new category
- `/dashboard/categories/edit/[id]` - Edit a category

## 📝 Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start
```

## 🗄️ Database Schema

### Posts Table
- `id` - Serial primary key
- `title` - Post title (VARCHAR 200)
- `slug` - URL-friendly slug (VARCHAR 250, unique)
- `content` - Post content in Markdown (TEXT)
- `description` - Short description (TEXT, optional)
- `author` - Author name (VARCHAR 100, optional)
- `image_url` - Image URL (VARCHAR 500, optional)
- `tags` - Comma-separated tags (TEXT, optional)
- `published` - Published status (BOOLEAN, default: false)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### Categories Table
- `id` - Serial primary key
- `name` - Category name (VARCHAR 100)
- `slug` - URL-friendly slug (VARCHAR 150, unique)
- `description` - Category description (TEXT, optional)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### Post Categories Table (Junction)
- `id` - Serial primary key
- `post_id` - Foreign key to posts
- `category_id` - Foreign key to categories
- `created_at` - Creation timestamp

## 🔧 API Endpoints (tRPC)

All API endpoints are type-safe via tRPC:

### Posts
- `listPosts` - List posts with pagination and category filtering
- `getRecentPosts` - Get 3 most recent published posts
- `getPost` - Get single post by ID or slug
- `getPostWithCategories` - Get post with associated categories
- `createPost` - Create a new post
- `updatePost` - Update an existing post
- `deletePost` - Delete a post

### Categories
- `listCategories` - List all categories
- `getCategory` - Get single category by ID or slug
- `createCategory` - Create a new category
- `updateCategory` - Update a category
- `deleteCategory` - Delete a category

## 🎨 Markdown Support

The platform supports full Markdown syntax:

- **Headings**: `# H1`, `## H2`, `### H3`
- **Bold**: `**bold text**`
- **Italic**: `*italic text*`
- **Links**: `[link text](url)`
- **Code**: `` `inline code` `` or code blocks
- **Lists**: Ordered and unordered lists
- **Blockquotes**: `> quote`
- **Tables**: GitHub Flavored Markdown tables

## 🖼️ Image Upload

Images are uploaded to Cloudinary CDN with automatic:
- Format optimization (WebP when supported)
- Quality optimization
- Resizing (max 1200x630 for blog posts)
- Fast CDN delivery

## 📱 Features in Detail

### Dashboard
- View all posts (published and drafts)
- Edit posts directly
- Delete posts with confirmation
- Manage categories (create, edit, delete)
- See post status (Published/Draft)

### Category Management
- Create categories with automatic slug generation
- Edit category names and descriptions
- Delete categories (cascade deletes post relationships)
- Assign multiple categories to posts

### Post Editor
- Markdown editor with syntax hints
- Image upload or URL input
- Category selection (multi-select)
- Tag input (comma-separated)
- Draft/Published toggle
- Real-time preview

## 🐛 Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct in `.env.local`
- Ensure PostgreSQL is running
- Check database credentials

### Image Upload Fails
- Verify Cloudinary credentials in `.env.local`
- Check file size (max 10MB)
- Ensure file is a valid image format

### Posts Not Showing
- Check if posts are marked as "Published"
- Verify category filters if using them
- Check browser console for errors

## 📄 License

This project is private and for assessment purposes.

## 👨‍💻 Development

Built with modern web technologies focusing on:
- Type safety with TypeScript and tRPC
- Clean architecture and code organization
- User-friendly UI/UX
- Performance optimization
- Best practices and patterns

---

**Note**: Make sure to set up your `.env.local` file with the required environment variables before running the application.
