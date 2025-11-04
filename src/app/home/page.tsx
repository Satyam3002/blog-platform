"use client";
import Link from "next/link";
import Image from "next/image";
import { trpc } from "@/trpc/client";
import { useState } from "react";

function formatDate(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Professional tag colors
const tagColors = [
  "bg-purple-50 text-purple-700 border border-purple-200",
  "bg-blue-50 text-blue-700 border border-blue-200",
  "bg-orange-50 text-orange-700 border border-orange-200",
  "bg-green-50 text-green-700 border border-green-200",
  "bg-pink-50 text-pink-700 border border-pink-200",
  "bg-indigo-50 text-indigo-700 border border-indigo-200",
  "bg-teal-50 text-teal-700 border border-teal-200",
  "bg-amber-50 text-amber-700 border border-amber-200",
];

function getTagColor(index: number) {
  return tagColors[index % tagColors.length];
}

function PostCard({ post }: { post: any }) {
  const tags = post.tags
    ? post.tags.split(",").map((t: string) => t.trim())
    : [];
  const dateStr = formatDate(post.createdAt);
  const authorDate = post.author ? `${dateStr} • ${post.author}` : dateStr;

  return (
    <Link href={`/post/${post.slug || post.id}`} className="block group">
      <div className="rounded-xl border border-gray-200 overflow-hidden bg-white hover:shadow-xl hover:border-gray-300 transition-all duration-300">
        {post.imageUrl && (
          <div className="w-full h-52 relative bg-gray-50 overflow-hidden">
            <Image
              src={post.imageUrl}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}
        <div className="p-6 space-y-4 relative">
          <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center">
              <svg
                className="w-4 h-4 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </div>
          </div>

          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {authorDate}
          </div>
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors pr-10 leading-tight">
            {post.title}
          </h3>
          {post.description && (
            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
              {post.description}
            </p>
          )}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {tags.map((tag: string, idx: number) => (
                <span
                  key={idx}
                  className={`px-3 py-1 text-xs rounded-full font-semibold ${getTagColor(
                    idx
                  )}`}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

function LargePostCard({ post }: { post: any }) {
  const tags = post.tags
    ? post.tags.split(",").map((t: string) => t.trim())
    : [];
  const dateStr = formatDate(post.createdAt);
  const authorDate = post.author ? `${dateStr} • ${post.author}` : dateStr;

  return (
    <Link href={`/post/${post.slug || post.id}`} className="block group">
      <div className="rounded-xl border border-gray-200 overflow-hidden bg-white hover:shadow-xl hover:border-gray-300 transition-all duration-300">
        {post.imageUrl && (
          <div className="w-full h-72 relative bg-gray-50 overflow-hidden">
            <Image
              src={post.imageUrl}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 66vw"
            />
          </div>
        )}
        <div className="p-8 space-y-5 relative">
          <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center">
              <svg
                className="w-4 h-4 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </div>
          </div>

          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {authorDate}
          </div>
          <h3 className="text-2xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors pr-10 leading-tight">
            {post.title}
          </h3>
          {post.description && (
            <p className="text-base text-gray-600 line-clamp-2 leading-relaxed">
              {post.description}
            </p>
          )}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {tags.map((tag: string, idx: number) => (
                <span
                  key={idx}
                  className={`px-3 py-1 text-xs rounded-full font-semibold ${getTagColor(
                    idx
                  )}`}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>();

  const { data: recentData, isLoading: recentLoading, isError: recentError } =
    trpc.getRecentPosts.useQuery();
  const { data: allData, isLoading: allLoading, isError: allError } = trpc.listPosts.useQuery({
    page: currentPage,
    limit: 6,
    categoryId: selectedCategoryId,
  });
  const { data: categoriesData, isLoading: categoriesLoading } =
    trpc.listCategories.useQuery();

  const recentPosts = recentData || [];
  const allPosts = allData?.posts || [];
  const pagination = allData?.pagination;
  const categories = categoriesData || [];

  const handleCategoryChange = (categoryId: number | undefined) => {
    setSelectedCategoryId(categoryId);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen w-full bg-white">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-16">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-2">
              Blog Platform
            </h1>
            <p className="text-gray-600">Discover amazing articles and insights</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/dashboard"
              className="rounded-lg bg-gray-100 text-gray-900 px-5 py-2.5 text-sm font-semibold hover:bg-gray-200 transition-all duration-200"
            >
              Dashboard
            </Link>
            <Link
              href="/new"
              className="rounded-lg bg-gray-900 text-white px-6 py-3 text-sm font-semibold hover:bg-gray-800 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              + New Post
            </Link>
          </div>
        </div>

        {/* Recent blog posts section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-10 tracking-tight">
            Recent blog posts
          </h2>
          {recentLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <span className="ml-3 text-gray-600">Loading recent posts...</span>
            </div>
          )}
          {recentError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">Failed to load recent posts. Please try again.</p>
            </div>
          )}
          {!recentLoading && !recentError && recentPosts.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <LargePostCard post={recentPosts[0]} />
              </div>
              <div className="space-y-8">
                {recentPosts.slice(1, 3).map((post: any) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </div>
          )}
          {!recentLoading && !recentError && recentPosts.length === 0 && (
            <p className="text-gray-600 text-lg">No recent posts available.</p>
          )}
        </section>

        {/* All blog posts section */}
        <section>
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
              All blog posts
            </h2>
            {!categoriesLoading && categories.length > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">Filter by:</span>
                <select
                  value={selectedCategoryId || ""}
                  onChange={(e) =>
                    handleCategoryChange(
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                >
                  <option value="">All Categories</option>
                  {categories.map((category: any) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {allLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <span className="ml-3 text-gray-600">Loading posts...</span>
            </div>
          )}
          {allError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
              <p className="text-red-800">Failed to load posts. Please try again.</p>
            </div>
          )}
          {!allLoading && !allError && (
            <>
              {allPosts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                  {allPosts.map((post: any) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-lg mb-12">
                  {selectedCategoryId
                    ? "No posts found in this category."
                    : "No posts available."}
                </p>
              )}

              {/* Pagination */}
              {pagination && (
                <div className="border-t border-b border-gray-200 py-6 mt-12">
                  <div className="flex items-center justify-center gap-6">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={
                        currentPage === 1 ||
                        pagination.totalPages === 0 ||
                        allPosts.length === 0
                      }
                      className="flex items-center gap-2 text-sm font-medium text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:text-gray-900 transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                      Previous
                    </button>

                    {pagination.totalPages > 0 ? (
                      <div className="flex items-center gap-1">
                        {Array.from(
                          { length: Math.min(pagination.totalPages, 10) },
                          (_, i) => {
                            let pageNum;
                            if (pagination.totalPages <= 10) {
                              pageNum = i + 1;
                            } else if (currentPage <= 5) {
                              pageNum = i + 1;
                            } else if (
                              currentPage >=
                              pagination.totalPages - 4
                            ) {
                              pageNum = pagination.totalPages - 9 + i;
                            } else {
                              pageNum = currentPage - 4 + i;
                            }
                            return (
                              <button
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                disabled={allPosts.length === 0}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                                  currentPage === pageNum
                                    ? "bg-gray-100 text-gray-900"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          }
                        )}
                        {pagination.totalPages > 10 && (
                          <>
                            <span className="px-3 text-sm text-gray-400">...</span>
                            <button
                              onClick={() =>
                                setCurrentPage(pagination.totalPages)
                              }
                              disabled={allPosts.length === 0}
                              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-all"
                            >
                              {pagination.totalPages}
                            </button>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <button
                          disabled
                          className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-900 opacity-40 cursor-not-allowed"
                        >
                          1
                        </button>
                      </div>
                    )}

                    <button
                      onClick={() =>
                        setCurrentPage((p) =>
                          Math.min(pagination.totalPages, p + 1)
                        )
                      }
                      disabled={
                        currentPage === pagination.totalPages ||
                        pagination.totalPages === 0 ||
                        allPosts.length === 0
                      }
                      className="flex items-center gap-2 text-sm font-medium text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:text-gray-900 transition-colors"
                    >
                      Next
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

