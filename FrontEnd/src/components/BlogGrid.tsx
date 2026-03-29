import { useNavigate } from "react-router-dom";
import blogImg1 from "../assets/booking-01.jpg";
import blogImg2 from "../assets/booking-02.jpg";
import blogImg3 from "../assets/booking-03.jpg";
import blogImg4 from "../assets/booking-04.jpg";
import blogImg5 from "../assets/booking-05.jpg";
import blogImg6 from "../assets/booking-06.jpg";
import avatar1 from "../assets/avatar-01.jpg";
import avatar2 from "../assets/avatar-02.jpg";
import avatar3 from "../assets/avatar-03.jpg";
import avatar4 from "../assets/avatar-04.jpg";
import avatar5 from "../assets/avatar-05.jpg";
import avatar6 from "../assets/avatar-06.jpg";

type BlogPost = {
  id: number;
  category: string;
  image: string;
  author: string;
  authorAvatar: string;
  date: string;
  title: string;
  likes: number;
  comments: number;
  readTime: string;
};

const posts: BlogPost[] = [
  {
    id: 1,
    category: "Badminton",
    image: blogImg1,
    author: "Orlando Waters",
    authorAvatar: avatar1,
    date: "15 May 2023",
    title: "Mastering the Badminton Basics: A Guide for Beginners",
    likes: 45,
    comments: 40,
    readTime: "10 Min To Read",
  },
  {
    id: 2,
    category: "Sports Activites",
    image: blogImg2,
    author: "Claire Nichols",
    authorAvatar: avatar2,
    date: "16 Jun 2023",
    title: "Unleashing Your Badminton Potential: Tips for Skill Growth",
    likes: 32,
    comments: 21,
    readTime: "5 Min To Read",
  },
  {
    id: 3,
    category: "Rules of Game",
    image: blogImg3,
    author: "Joanna Le",
    authorAvatar: avatar3,
    date: "17 May 2023",
    title: "The Art of Footwork: Enhancing Agility in Badminton",
    likes: 55,
    comments: 32,
    readTime: "4 Min To Read",
  },
  {
    id: 4,
    category: "Badminton",
    image: blogImg4,
    author: "Andrew",
    authorAvatar: avatar4,
    date: "17 May 2023",
    title: "How to Build Match Stamina with Smarter Weekly Drills",
    likes: 55,
    comments: 32,
    readTime: "4 Min To Read",
  },
  {
    id: 5,
    category: "Rules of Game",
    image: blogImg5,
    author: "Mart Sublin",
    authorAvatar: avatar5,
    date: "16 Jun 2023",
    title: "Common Faults Explained: Serve, Foot Fault, and Net Touch",
    likes: 32,
    comments: 21,
    readTime: "5 Min To Read",
  },
  {
    id: 6,
    category: "Sports Activites",
    image: blogImg6,
    author: "Rebecca",
    authorAvatar: avatar6,
    date: "15 May 2023",
    title: "From Practice to Performance: Structuring Better Sessions",
    likes: 45,
    comments: 40,
    readTime: "10 Min To Read",
  },
];

const BlogGrid = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-[#f4f5f7] py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post.id}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative">
                <img
                  src={post.image}
                  alt={post.title}
                  className="h-60 w-full object-cover"
                />
                <span className="absolute left-6 top-6 rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white">
                  {post.category}
                </span>
                <button
                  type="button"
                  aria-label="Add to favorites"
                  className="absolute right-6 top-6 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-700 shadow-sm"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12.1 20.3l-1.1-1C6.1 15 3 12.2 3 8.8 3 6 5.2 4 8 4c1.6 0 3.1.8 4 2.1C12.9 4.8 14.4 4 16 4c2.8 0 5 2 5 4.8 0 3.4-3.1 6.2-8 10.5l-0.9 1z" />
                  </svg>
                </button>
              </div>

              <div className="p-6">
                <div className="mb-5 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-3">
                    <img src={post.authorAvatar} alt={post.author} className="h-11 w-11 rounded-full object-cover" />
                    <span className="font-medium text-[#3b4861]">{post.author}</span>
                  </div>
                  <span className="inline-flex items-center gap-2">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <path d="M16 2v4M8 2v4M3 10h18" />
                    </svg>
                    {post.date}
                  </span>
                </div>

                <h3 className="min-h-[88px] text-4xl font-extrabold leading-[1.15] text-[color:var(--primary)] [font-size:clamp(1.65rem,2.6vw,2.35rem)]">
                  {post.title}
                </h3>

                <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-6 text-[color:var(--textMuted)]">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2">
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12.1 20.3l-1.1-1C6.1 15 3 12.2 3 8.8 3 6 5.2 4 8 4c1.6 0 3.1.8 4 2.1C12.9 4.8 14.4 4 16 4c2.8 0 5 2 5 4.8 0 3.4-3.1 6.2-8 10.5l-0.9 1z" />
                      </svg>
                      {post.likes}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2">
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
                      </svg>
                      {post.comments}
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-2 text-base">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 7v6l4 2" />
                    </svg>
                    {post.readTime}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-16 bg-[#071d4a] py-16 text-center text-white">
        <h3 className="text-3xl font-extrabold md:text-5xl">
          We Welcome Your Passion And Expertise
        </h3>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-white/60">
          Join our empowering sports community today and grow with us.
        </p>
        <button
          type="button"
          onClick={() => navigate("/signup")}
          className="mt-8 rounded-xl bg-emerald-600 px-9 py-4 text-2xl font-bold text-white transition hover:bg-emerald-500"
        >
          Join With Us
        </button>
      </div>
    </section>
  );
};

export default BlogGrid;
