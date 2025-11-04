import { initTRPC } from "@trpc/server";
import { z } from "zod";
import { createContext, Context } from "./context";
import { posts, categories, postCategories } from "@/server/db/schema";
import { desc, eq, sql, and, inArray } from "drizzle-orm";
import { generateSlug, generateUniqueSlug } from "@/server/utils/slug";

const t = initTRPC.context<Context>().create();

export const appRouter = t.router({
  // ========== POSTS ==========
  
  listPosts: t.procedure
    .input(
      z
        .object({
          page: z.number().min(1).default(1),
          limit: z.number().min(1).max(100).default(6),
          categoryId: z.number().optional(),
          published: z.boolean().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const page = input?.page ?? 1;
      const limit = input?.limit ?? 6;
      const offset = (page - 1) * limit;
      const categoryId = input?.categoryId;
      const published = input?.published ?? true;

      let query = ctx.db.select().from(posts);

      // Build where conditions
      const conditions = [];
      if (published !== undefined) {
        conditions.push(eq(posts.published, published));
      }

      // If filtering by category, join with post_categories
      if (categoryId) {
        const postIds = await ctx.db
          .select({ postId: postCategories.postId })
          .from(postCategories)
          .where(eq(postCategories.categoryId, categoryId));

        if (postIds.length === 0) {
          return {
            posts: [],
            pagination: {
              page,
              limit,
              total: 0,
              totalPages: 0,
            },
          };
        }

        const ids = postIds.map((p) => p.postId);
        conditions.push(inArray(posts.id, ids));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const data = await ctx.db
        .select()
        .from(posts)
        .where(whereClause)
        .orderBy(desc(posts.createdAt))
        .limit(limit)
        .offset(offset);

      const [totalResult] = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(posts)
        .where(whereClause);

      const total = Number(totalResult?.count ?? 0);
      const totalPages = Math.ceil(total / limit);

      return {
        posts: data,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      };
    }),

  getRecentPosts: t.procedure.query(async ({ ctx }) => {
    const data = await ctx.db
      .select()
      .from(posts)
      .where(eq(posts.published, true))
      .orderBy(desc(posts.createdAt))
      .limit(3);
    return data;
  }),

  getPost: t.procedure
    .input(z.object({ id: z.number().optional(), slug: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      if (input.id) {
        const [post] = await ctx.db
          .select()
          .from(posts)
          .where(eq(posts.id, input.id));
        return post ?? null;
      }
      if (input.slug) {
        const [post] = await ctx.db
          .select()
          .from(posts)
          .where(eq(posts.slug, input.slug));
        return post ?? null;
      }
      return null;
    }),

  getPostWithCategories: t.procedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const [post] = await ctx.db
        .select()
        .from(posts)
        .where(eq(posts.id, input.id));

      if (!post) return null;

      const postCats = await ctx.db
        .select({
          category: categories,
        })
        .from(postCategories)
        .innerJoin(categories, eq(postCategories.categoryId, categories.id))
        .where(eq(postCategories.postId, input.id));

      return {
        ...post,
        categories: postCats.map((pc) => pc.category),
      };
    }),

  createPost: t.procedure
    .input(
      z.object({
        title: z.string().min(1),
        content: z.string().min(1),
        description: z.string().optional(),
        author: z.string().optional(),
        imageUrl: z.string().optional(),
        tags: z.string().optional(),
        published: z.boolean().default(false),
        categoryIds: z.array(z.number()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Generate unique slug
        const baseSlug = generateSlug(input.title);
        const slug = await generateUniqueSlug(
          baseSlug,
          async (slug) => {
            const [existing] = await ctx.db
              .select()
              .from(posts)
              .where(eq(posts.slug, slug))
              .limit(1);
            return !existing;
          }
        );

        const [row] = await ctx.db
          .insert(posts)
          .values({
            title: input.title,
            slug,
            content: input.content,
            description: input.description || null,
            author: input.author || null,
            imageUrl: input.imageUrl || null,
            tags: input.tags || null,
            published: input.published,
          })
          .returning();

        // Assign categories if provided
        if (input.categoryIds && input.categoryIds.length > 0) {
          await ctx.db.insert(postCategories).values(
            input.categoryIds.map((categoryId) => ({
              postId: row.id,
              categoryId,
            }))
          );
        }

        return row;
      } catch (error: any) {
        console.error("Error creating post:", error);
        throw new Error(`Failed to create post: ${error.message || "Unknown error"}`);
      }
    }),

  updatePost: t.procedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).optional(),
        content: z.string().min(1).optional(),
        description: z.string().optional(),
        author: z.string().optional(),
        imageUrl: z.string().optional(),
        tags: z.string().optional(),
        published: z.boolean().optional(),
        categoryIds: z.array(z.number()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, categoryIds, ...updateData } = input;

        // Generate new slug if title changed
        if (updateData.title) {
          const baseSlug = generateSlug(updateData.title);
          const slug = await generateUniqueSlug(
            baseSlug,
            async (slug) => {
              const [existing] = await ctx.db
                .select()
                .from(posts)
                .where(eq(posts.slug, slug))
                .limit(1);
              return !existing || existing.id === id;
            }
          );
          updateData.slug = slug;
        }

        const [row] = await ctx.db
          .update(posts)
          .set({
            ...updateData,
            updatedAt: new Date(),
          })
          .where(eq(posts.id, id))
          .returning();

        if (!row) {
          throw new Error("Post not found");
        }

        // Update categories if provided
        if (categoryIds !== undefined) {
          // Delete existing relationships
          await ctx.db
            .delete(postCategories)
            .where(eq(postCategories.postId, id));

          // Insert new relationships
          if (categoryIds.length > 0) {
            await ctx.db.insert(postCategories).values(
              categoryIds.map((categoryId) => ({
                postId: id,
                categoryId,
              }))
            );
          }
        }

        return row;
      } catch (error: any) {
        console.error("Error updating post:", error);
        throw new Error(`Failed to update post: ${error.message || "Unknown error"}`);
      }
    }),

  deletePost: t.procedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const [deleted] = await ctx.db
          .delete(posts)
          .where(eq(posts.id, input.id))
          .returning();

        if (!deleted) {
          throw new Error("Post not found");
        }

        return { success: true };
      } catch (error: any) {
        console.error("Error deleting post:", error);
        throw new Error(`Failed to delete post: ${error.message || "Unknown error"}`);
      }
    }),

  // ========== CATEGORIES ==========

  listCategories: t.procedure.query(async ({ ctx }) => {
    const data = await ctx.db
      .select()
      .from(categories)
      .orderBy(desc(categories.createdAt));
    return data;
  }),

  getCategory: t.procedure
    .input(z.object({ id: z.number().optional(), slug: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      if (input.id) {
        const [category] = await ctx.db
          .select()
          .from(categories)
          .where(eq(categories.id, input.id));
        return category ?? null;
      }
      if (input.slug) {
        const [category] = await ctx.db
          .select()
          .from(categories)
          .where(eq(categories.slug, input.slug));
        return category ?? null;
      }
      return null;
    }),

  createCategory: t.procedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Generate unique slug
        const baseSlug = generateSlug(input.name);
        const slug = await generateUniqueSlug(
          baseSlug,
          async (slug) => {
            const [existing] = await ctx.db
              .select()
              .from(categories)
              .where(eq(categories.slug, slug))
              .limit(1);
            return !existing;
          }
        );

        const [row] = await ctx.db
          .insert(categories)
          .values({
            name: input.name,
            slug,
            description: input.description || null,
          })
          .returning();

        return row;
      } catch (error: any) {
        console.error("Error creating category:", error);
        throw new Error(
          `Failed to create category: ${error.message || "Unknown error"}`
        );
      }
    }),

  updateCategory: t.procedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, name, ...updateData } = input;

        // Generate new slug if name changed
        if (name) {
          const baseSlug = generateSlug(name);
          const slug = await generateUniqueSlug(
            baseSlug,
            async (slug) => {
              const [existing] = await ctx.db
                .select()
                .from(categories)
                .where(eq(categories.slug, slug))
                .limit(1);
              return !existing || existing.id === id;
            }
          );
          updateData.slug = slug;
          updateData.name = name;
        }

        const [row] = await ctx.db
          .update(categories)
          .set({
            ...updateData,
            updatedAt: new Date(),
          })
          .where(eq(categories.id, id))
          .returning();

        if (!row) {
          throw new Error("Category not found");
        }

        return row;
      } catch (error: any) {
        console.error("Error updating category:", error);
        throw new Error(
          `Failed to update category: ${error.message || "Unknown error"}`
        );
      }
    }),

  deleteCategory: t.procedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const [deleted] = await ctx.db
          .delete(categories)
          .where(eq(categories.id, input.id))
          .returning();

        if (!deleted) {
          throw new Error("Category not found");
        }

        return { success: true };
      } catch (error: any) {
        console.error("Error deleting category:", error);
        throw new Error(
          `Failed to delete category: ${error.message || "Unknown error"}`
        );
      }
    }),
});

export type AppRouter = typeof appRouter;
