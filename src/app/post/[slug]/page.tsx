"use client";
import { trpc } from "@/trpc/client";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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

export default function PostDetailPage() {
  const params = useParams<{ slug: string }>();
  const slugOrId = params.slug;
  
  // Try to parse as number (for backward compatibility with old posts using id)
  const id = Number(slugOrId);
  const isNumericId = !isNaN(id) && isFinite(id);
  
  // Try slug first, then id if it's numeric
  const { data: post, isLoading, isError, error } = trpc.getPost.useQuery(
    isNumericId ? { id } : { slug: slugOrId },
    { enabled: !!slugOrId }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-3 text-gray-600 text-lg">Loading post...</span>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-900 mb-2">Error Loading Post</h2>
            <p className="text-red-800 mb-4">
              {error?.message || "Failed to load post. Please try again."}
            </p>
            <Link
              href="/home"
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
              Back to posts
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Post Not Found</h2>
            <p className="text-gray-600 mb-6">
              The post you're looking for doesn't exist or has been removed.
            </p>
            <Link
              href="/home"
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
              Back to posts
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const tags = post.tags ? post.tags.split(",").map((t: string) => t.trim()) : [];
  const dateStr = formatDate(post.createdAt);
  const authorDate = post.author
    ? `${dateStr} • ${post.author}`
    : dateStr;

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="mb-12">
          <Link
            href="/home"
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
            Back to posts
          </Link>
        </div>

        <article className="space-y-10">
          {post.imageUrl && (
            <div className="w-full h-[500px] relative rounded-2xl overflow-hidden bg-gray-50 shadow-lg">
              <Image
                src={post.imageUrl}
                alt={post.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 896px"
              />
            </div>
          )}

          <div className="space-y-8">
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              {authorDate}
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight tracking-tight">
              {post.title}
            </h1>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-3 pt-4">
                {tags.map((tag: string, idx: number) => (
                  <span
                    key={idx}
                    className={`px-4 py-2 text-sm rounded-full font-semibold ${getTagColor(
                      idx
                    )}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <div className="prose prose-lg max-w-none pt-8">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ node, ...props }) => (
                    <p className="mb-4 text-gray-700 leading-relaxed" {...props} />
                  ),
                  h1: ({ node, ...props }) => (
                    <h1 className="text-3xl font-bold text-gray-900 mb-4 mt-8" {...props} />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2 className="text-2xl font-bold text-gray-900 mb-3 mt-6" {...props} />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3 className="text-xl font-bold text-gray-900 mb-2 mt-4" {...props} />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul className="list-disc list-inside mb-4 space-y-2 text-gray-700" {...props} />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-700" {...props} />
                  ),
                  li: ({ node, ...props }) => (
                    <li className="ml-4" {...props} />
                  ),
                  code: ({ node, className, ...props }: any) => {
                    const isInline = !className;
                    return isInline ? (
                      <code
                        className="bg-gray-100 text-gray-900 px-1.5 py-0.5 rounded text-sm font-mono"
                        {...props}
                      />
                    ) : (
                      <code
                        className="block bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono mb-4"
                        {...props}
                      />
                    );
                  },
                  blockquote: ({ node, ...props }) => (
                    <blockquote
                      className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4"
                      {...props}
                    />
                  ),
                  a: ({ node, ...props }: any) => (
                    <a
                      className="text-blue-600 hover:text-blue-700 underline"
                      target="_blank"
                      rel="noopener noreferrer"
                      {...props}
                    />
                  ),
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
