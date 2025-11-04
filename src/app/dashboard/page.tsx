"use client";
import { trpc } from "@/trpc/client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

function formatDate(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function DashboardPage() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [activeTab, setActiveTab] = useState<"posts" | "categories">("posts");

  // Posts
  const { data: postsData, isLoading: postsLoading, isError: postsError } = trpc.listPosts.useQuery({
    published: undefined, // Get all posts (published and draft)
    limit: 100,
  });
  const deletePost = trpc.deletePost.useMutation({
    onSuccess: async () => {
      await utils.listPosts.invalidate();
      await utils.getRecentPosts.invalidate();
    },
    onError: (error) => {
      alert(`Failed to delete post: ${error.message}`);
    },
  });

  // Categories
  const { data: categories, isLoading: categoriesLoading, isError: categoriesError } =
    trpc.listCategories.useQuery();
  const deleteCategory = trpc.deleteCategory.useMutation({
    onSuccess: async () => {
      await utils.listCategories.invalidate();
      await utils.listPosts.invalidate();
    },
    onError: (error) => {
      alert(`Failed to delete category: ${error.message}`);
    },
  });

  const posts = postsData?.posts || [];

  const handleDeletePost = async (id: number) => {
    if (confirm("Are you sure you want to delete this post?")) {
      deletePost.mutate({ id });
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (confirm("Are you sure you want to delete this category?")) {
      deleteCategory.mutate({ id });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-6 py-16">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-2">
              Dashboard
            </h1>
            <p className="text-gray-600">Manage your posts and categories</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/"
              className="rounded-lg bg-gray-100 text-gray-900 px-5 py-2.5 text-sm font-semibold hover:bg-gray-200 transition-all duration-200"
            >
              View Blog
            </Link>
            <Link
              href="/new"
              className="rounded-lg bg-gray-900 text-white px-6 py-3 text-sm font-semibold hover:bg-gray-800 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              + New Post
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab("posts")}
              className={`pb-4 px-1 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === "posts"
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Posts ({posts.length})
            </button>
            <button
              onClick={() => setActiveTab("categories")}
              className={`pb-4 px-1 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === "categories"
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Categories ({categories?.length || 0})
            </button>
          </nav>
        </div>

        {/* Posts Tab */}
        {activeTab === "posts" && (
          <div>
            {postsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <span className="ml-3 text-gray-600">Loading posts...</span>
              </div>
            ) : postsError ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">Failed to load posts. Please try again.</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">No posts yet.</p>
                <Link
                  href="/new"
                  className="inline-block rounded-lg bg-gray-900 text-white px-6 py-3 text-sm font-semibold hover:bg-gray-800 transition-all"
                >
                  Create Your First Post
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                        Title
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                        Author
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                        Created
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map((post: any) => (
                      <tr
                        key={post.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <Link
                            href={`/post/${post.slug || post.id}`}
                            className="text-base font-medium text-gray-900 hover:text-gray-700"
                          >
                            {post.title}
                          </Link>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                              post.published
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {post.published ? "Published" : "Draft"}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          {post.author || "—"}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          {formatDate(post.createdAt)}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex justify-end gap-2">
                            <Link
                              href={`/edit/${post.id}`}
                              className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              disabled={deletePost.isPending}
                              className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === "categories" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Categories</h2>
              <Link
                href="/dashboard/categories/new"
                className="rounded-lg bg-gray-900 text-white px-5 py-2.5 text-sm font-semibold hover:bg-gray-800 transition-all"
              >
                + New Category
              </Link>
            </div>

            {categoriesLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <span className="ml-3 text-gray-600">Loading categories...</span>
              </div>
            ) : categoriesError ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">Failed to load categories. Please try again.</p>
              </div>
            ) : !categories || categories.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">No categories yet.</p>
                <Link
                  href="/dashboard/categories/new"
                  className="inline-block rounded-lg bg-gray-900 text-white px-6 py-3 text-sm font-semibold hover:bg-gray-800 transition-all"
                >
                  Create Your First Category
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category: any) => (
                  <div
                    key={category.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-bold text-gray-900">
                        {category.name}
                      </h3>
                      <div className="flex gap-2">
                        <Link
                          href={`/dashboard/categories/edit/${category.id}`}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          disabled={deleteCategory.isPending}
                          className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    {category.description && (
                      <p className="text-sm text-gray-600 mb-2">
                        {category.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      Slug: {category.slug}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

