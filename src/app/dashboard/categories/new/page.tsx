"use client";
import { trpc } from "@/trpc/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function NewCategoryPage() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const createCategory = trpc.createCategory.useMutation({
    onSuccess: async () => {
      await utils.listCategories.invalidate();
      router.push("/dashboard");
    },
    onError: (error) => {
      alert(`Failed to create category: ${error.message}`);
    },
  });

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      alert("Category name is required");
      return;
    }
    createCategory.mutate({
      name,
      description: description || undefined,
    });
  };

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
          Create New Category
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
              A URL-friendly slug will be generated automatically
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
              disabled={createCategory.isPending || !name}
              className="rounded-lg bg-gray-900 px-8 py-3.5 text-white font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {createCategory.isPending ? "Creating..." : "Create Category"}
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

