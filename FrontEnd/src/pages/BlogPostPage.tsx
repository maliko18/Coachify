import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import heroBg from "../assets/breadcrumb-bg2.jpg";
import { blogPosts } from "../data/blogPosts";

export default function BlogPostPage() {
  const navigate = useNavigate();
  const { postId } = useParams();

  const post = useMemo(() => {
    const id = Number(postId);
    if (!Number.isFinite(id)) return null;
    return blogPosts.find((item) => item.id === id) ?? null;
  }, [postId]);

  const postIndex = useMemo(() => {
    if (!post) return -1;
    return blogPosts.findIndex((item) => item.id === post.id);
  }, [post]);

  const previousPost = postIndex > 0 ? blogPosts[postIndex - 1] : null;
  const nextPost =
    postIndex >= 0 && postIndex < blogPosts.length - 1
      ? blogPosts[postIndex + 1]
      : null;

  if (!post) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="mx-auto max-w-4xl px-6 py-16">
          <h1 className="text-3xl font-extrabold text-slate-900">
            Article introuvable
          </h1>
          <button
            type="button"
            onClick={() => navigate("/blog")}
            className="mt-6 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white"
          >
            Retour au blog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div
        className="relative flex h-56 w-full items-center"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/60 to-black/40" />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-6">
          <h1 className="text-3xl font-extrabold text-white md:text-4xl">
            {post.title}
          </h1>
          <div className="mt-2 flex items-center gap-2 text-sm text-gray-200">
            <button onClick={() => navigate("/")} className="hover:text-white">
              Home
            </button>
            <span>›</span>
            <button
              onClick={() => navigate("/blog")}
              className="hover:text-white"
            >
              Blog
            </button>
            <span>›</span>
            <span>{post.category}</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-12">
        <img
          src={post.image}
          alt={post.title}
          className="h-88 w-full rounded-2xl object-cover"
        />

        <div className="mt-6 flex items-center gap-3 text-sm text-gray-500">
          <img
            src={post.authorAvatar}
            alt={post.author}
            className="h-10 w-10 rounded-full object-cover"
          />
          <span className="font-semibold text-gray-700">{post.author}</span>
          <span>•</span>
          <span>{post.date}</span>
          <span>•</span>
          <span>{post.readTime}</span>
        </div>

        <p className="mt-8 text-xl font-bold text-slate-800">{post.excerpt}</p>
        <p className="mt-4 text-base leading-8 text-slate-600">
          {post.content}
        </p>

        <div className="mt-10 flex flex-col gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => navigate("/blog")}
            className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            Back to all blog posts
          </button>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={!previousPost}
              onClick={() =>
                previousPost && navigate(`/blog/${previousPost.id}`)
              }
              className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-50"
            >
              ← Previous
            </button>
            <button
              type="button"
              disabled={!nextPost}
              onClick={() => nextPost && navigate(`/blog/${nextPost.id}`)}
              className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40 hover:bg-emerald-500"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
