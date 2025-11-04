"use client";
import { trpc } from "@/trpc/client";
import { useRouter, useParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const postId = Number(params.id);
  const utils = trpc.useUtils();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const { data: post, isLoading: postLoading } = trpc.getPostWithCategories.useQuery(
    { id: postId },
    { enabled: Number.isFinite(postId) }
  );
  const { data: categories } = trpc.listCategories.useQuery();

  const updatePost = trpc.updatePost.useMutation({
    onSuccess: async () => {
      await utils.listPosts.invalidate();
      await utils.getRecentPosts.invalidate();
      await utils.getPost.invalidate();
      router.push("/dashboard");
    },
    onError: (error) => {
      alert(`Failed to update post: ${error.message}`);
    },
  });

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [description, setDescription] = useState("");
  const [author, setAuthor] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState<string>("");
  const [tags, setTags] = useState("");
  const [published, setPublished] = useState(false);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);

  // Load post data into form
  useEffect(() => {
    if (post) {
      setTitle(post.title || "");
      setContent(post.content || "");
      setDescription(post.description || "");
      setAuthor(post.author || "");
      setImageUrl(post.imageUrl || "");
      setImagePreview(post.imageUrl || "");
      setTags(post.tags || "");
      setPublished(post.published || false);
      setSelectedCategoryIds(post.categories?.map((c: any) => c.id) || []);
    }
  }, [post]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Image size must be less than 10MB");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.url) {
        setImageUrl(data.url);
        setImagePreview(data.url);
      } else {
        alert(data.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      alert("Title and content are required");
      return;
    }
    updatePost.mutate({
      id: postId,
      title,
      content,
      description: description || undefined,
      author: author || undefined,
      imageUrl: imageUrl || undefined,
      tags: tags || undefined,
      published,
      categoryIds: selectedCategoryIds,
    });
  };

  if (postLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-3 text-gray-600 text-lg">Loading post...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-900 mb-2">Post Not Found</h2>
            <p className="text-red-800 mb-4">
              The post you're trying to edit doesn't exist or has been removed.
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
      <div className="mx-auto max-w-3xl px-6 py-16">
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
          Edit Post
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Title *
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 px-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              placeholder="Enter post title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Author
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 px-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              placeholder="Author name"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Description
            </label>
            <textarea
              className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 px-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all resize-none"
              placeholder="Short description of the post"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Image Upload Section */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Post Image
            </label>
            <div className="space-y-4">
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400 cursor-pointer transition-all duration-200"
                >
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-base font-medium text-gray-700">
                    {uploading
                      ? "Uploading..."
                      : imagePreview
                      ? "Change Image"
                      : "Upload Image"}
                  </span>
                </label>
              </div>

              {imagePreview && (
                <div className="relative w-full h-64 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 768px"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview("");
                      setImageUrl("");
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-500 mb-2 text-center">OR</p>
                <input
                  type="url"
                  className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 px-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  placeholder="Enter image URL"
                  value={imageUrl && !imagePreview ? imageUrl : ""}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    if (e.target.value) {
                      setImagePreview(e.target.value);
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Categories
            </label>
            {categories && categories.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {categories.map((category: any) => (
                  <label
                    key={category.id}
                    className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategoryIds.includes(category.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCategoryIds([...selectedCategoryIds, category.id]);
                        } else {
                          setSelectedCategoryIds(
                            selectedCategoryIds.filter((id) => id !== category.id)
                          );
                        }
                      }}
                      className="h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-900">
                      {category.name}
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No categories available.{" "}
                <Link
                  href="/dashboard/categories/new"
                  className="text-blue-600 hover:underline"
                >
                  Create one
                </Link>
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Tags (comma separated)
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 px-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              placeholder="Design, Research, Presentation"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Content * (Markdown supported)
            </label>
            <textarea
              className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 px-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all resize-none font-mono"
              placeholder={`# Heading\n\nWrite your post content here using Markdown...\n\n**Bold**, *italic*, [links](url), and more!`}
              rows={14}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
            <p className="mt-2 text-xs text-gray-500">
              Supports Markdown: **bold**, *italic*, # headings, [links](url), `code`, lists, and more
            </p>
          </div>

          <div className="flex items-center pt-2">
            <input
              type="checkbox"
              id="published"
              className="h-5 w-5 text-gray-900 focus:ring-gray-900 border-gray-300 rounded cursor-pointer"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
            />
            <label
              htmlFor="published"
              className="ml-3 text-base font-medium text-gray-700 cursor-pointer"
            >
              Publish immediately
            </label>
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={updatePost.isPending || !title || !content || uploading}
              className="rounded-lg bg-gray-900 px-8 py-3.5 text-white font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {updatePost.isPending ? "Updating..." : "Update Post"}
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

