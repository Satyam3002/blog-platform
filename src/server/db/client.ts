import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  // In dev, it's helpful to fail fast if env is missing
  throw new Error("DATABASE_URL is not set. Please add it to your .env file.");
}

// Single connection for server runtime
const queryClient = postgres(databaseUrl, { prepare: true, max: 1 });

// Best-effort bootstrap to avoid separate migration setup for this exercise
let initialized = false;
async function ensureInitialized() {
  if (initialized) return;
  initialized = true;
  
  // Create posts table if it doesn't exist
  await queryClient`
    CREATE TABLE IF NOT EXISTS posts (
      id SERIAL PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      content TEXT NOT NULL,
      description TEXT,
      author VARCHAR(100),
      image_url VARCHAR(500),
      tags TEXT,
      published BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;
  
  // Create categories table
  await queryClient`
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      slug VARCHAR(150) NOT NULL UNIQUE,
      description TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;
  
  // Create post_categories junction table
  await queryClient`
    CREATE TABLE IF NOT EXISTS post_categories (
      id SERIAL PRIMARY KEY,
      post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      UNIQUE(post_id, category_id)
    );
  `;
  
  // Add missing columns to existing posts table if they don't exist
  try {
    await queryClient`
      DO $$
      BEGIN
        -- Add slug column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='slug') THEN
          ALTER TABLE posts ADD COLUMN slug VARCHAR(250);
          -- Generate slugs for existing posts
          UPDATE posts SET slug = LOWER(REGEXP_REPLACE(title, '[^a-zA-Z0-9]+', '-', 'g')) WHERE slug IS NULL;
          -- Make slug NOT NULL and unique after populating
          ALTER TABLE posts ALTER COLUMN slug SET NOT NULL;
          CREATE UNIQUE INDEX IF NOT EXISTS posts_slug_unique ON posts(slug);
        END IF;
        
        -- Add other missing columns
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='description') THEN
          ALTER TABLE posts ADD COLUMN description TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='author') THEN
          ALTER TABLE posts ADD COLUMN author VARCHAR(100);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='image_url') THEN
          ALTER TABLE posts ADD COLUMN image_url VARCHAR(500);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='tags') THEN
          ALTER TABLE posts ADD COLUMN tags TEXT;
        END IF;
      END $$;
    `;
  } catch (error) {
    // Ignore errors if columns already exist
    console.log("Migration check completed");
  }
  
  // Create indexes for better performance
  try {
    await queryClient`
      CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
      CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published);
      CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
      CREATE INDEX IF NOT EXISTS idx_post_categories_post_id ON post_categories(post_id);
      CREATE INDEX IF NOT EXISTS idx_post_categories_category_id ON post_categories(category_id);
    `;
  } catch (error) {
    console.log("Index creation completed");
  }
}
void ensureInitialized();

export const db = drizzle(queryClient, { schema });
export type DB = typeof db;
