"use client";
import { trpc } from "@/trpc/client";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const categoryId = Number(params.id);
  const utils = trpc.useUtils();

  const { data: category, isLoading, isError, error } = trpc.getCategory.useQuery(
    { id: categoryId },
    { enabled: Number.isFinite(categoryId) }
  );

  const updateCategory = trpc.updateCategory.useMutation({
    onSuccess: async () => {
      await utils.listCategories.invalidate();
      router.push("/dashboard");
    },
    onError: (error) => {
      alert(`Failed to update category: ${error.message}`);
    },
  });

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (category) {
      setName(category.name || "");
      setDescription(category.description || "");
    }
  }, [category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      alert("Category name is required");
      return;
    }
    updateCategory.mutate({
      id: categoryId,
      name,
      description: description || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-2xl px-6 py-16">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-3 text-gray-600 text-lg">Loading category...</span>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !category) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-2xl px-6 py-16">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-900 mb-2">
              {isError ? "Error Loading Category" : "Category Not Found"}
            </h2>
            <p className="text-red-800 mb-4">
              {isError
                ? error?.message || "Failed to load category. Please try again."
                : "The category you're looking for doesn't exist or has been removed."}
            </p>
            <Link
              href="/dashboard"
              className="text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-2 text-base font-medium"
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
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <div className="mb-10">
          <Link
            href="/dashboard"
            className="text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-2 text-base font-medium"
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
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to dashboard
          </Link>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-10 tracking-tight">
          Edit Category
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Category Name *
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 px-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              placeholder="e.g., Technology, Design, Marketing"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <p className="mt-2 text-sm text-gray-500">
              Slug: {category.slug} (will update automatically)
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Description
            </label>
            <textarea
              className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 px-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all resize-none"
              placeholder="Optional description for this category"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={updateCategory.isPending || !name}
              className="rounded-lg bg-gray-900 px-8 py-3.5 text-white font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {updateCategory.isPending ? "Updating..." : "Update Category"}
            </button>
            <Link
              href="/dashboard"
              className="rounded-lg border-2 border-gray-300 bg-white px-8 py-3.5 text-gray-700 font-semibold text-base hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

