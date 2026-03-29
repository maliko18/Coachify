import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import heroBg from "../assets/breadcrumb-bg2.jpg";
import service1 from "../assets/booking-01.jpg";
import service2 from "../assets/booking-02.jpg";
import service3 from "../assets/booking-03.jpg";

type ServiceCategory = "all" | "coaching" | "lessons" | "coaches";

interface Service {
  id: number;
  category: ServiceCategory;
  image: string;
  title: string;
  description: string;
}

const services: Service[] = [
  {
    id: 1,
    category: "coaching",
    image: service1,
    title: "Court Rent",
    description: "Rent a premium court for your sports activities. Check availability, reserve easily, and enjoy state-of-the-art facilities at competitive rates.",
  },
  {
    id: 2,
    category: "lessons",
    image: service2,
    title: "Group Lesson",
    description: "Discover the thrill of group lessons in badminton, where you can enhance your skills, connect with others, and enjoy the sport to the fullest.",
  },
  {
    id: 3,
    category: "coaching",
    image: service3,
    title: "Training Program",
    description: "Our badminton training program provides a holistic approach to promote your performance and maximize your potential on the court.",
  },
];

const ServicesPage = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<ServiceCategory>("all");

  const filteredServices = activeFilter === "all" ? services : services.filter((s) => s.category === activeFilter);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* ── HERO BANNER ── */}
      <div
        className="relative w-full h-[260px] flex items-center"
        style={{ backgroundImage: `url(${heroBg})`, backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white">Services</h1>
          <div className="flex items-center gap-2 text-gray-200 mt-2">
            <button onClick={() => navigate("/")} className="hover:text-white transition">Home</button>
            <span className="mx-2">›</span>
            <span>Services</span>
          </div>
        </div>
        {/* decorative blobs */}
        <span className="absolute top-8 left-8 h-3 w-3 rounded-full bg-green-400 opacity-90" />
        <span className="absolute top-8 right-10 h-4 w-4 rounded-full bg-teal-300 opacity-80" />
        <span className="absolute bottom-10 right-6 h-3 w-3 rounded-full bg-green-500 opacity-90" />
        <div className="absolute bottom-0 right-24 h-40 w-40 rounded-full bg-teal-500/30 blur-2xl" />
      </div>

      {/* ── FILTERS ── */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-6 py-3 rounded-xl font-semibold transition ${
              activeFilter === "all"
                ? "bg-[color:var(--navbar)] text-white"
                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            All Services
          </button>
          <button
            onClick={() => setActiveFilter("coaching")}
            className={`px-6 py-3 rounded-xl font-semibold transition ${
              activeFilter === "coaching"
                ? "bg-[color:var(--navbar)] text-white"
                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            Coaching
          </button>
          <button
            onClick={() => setActiveFilter("lessons")}
            className={`px-6 py-3 rounded-xl font-semibold transition ${
              activeFilter === "lessons"
                ? "bg-[color:var(--navbar)] text-white"
                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            Lessons
          </button>
          <button
            onClick={() => setActiveFilter("coaches")}
            className={`px-6 py-3 rounded-xl font-semibold transition ${
              activeFilter === "coaches"
                ? "bg-[color:var(--navbar)] text-white"
                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            Coaches
          </button>
        </div>
      </div>

      {/* ── SERVICES GRID ── */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="group rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm transition hover:-translate-y-2 hover:shadow-xl"
            >
              <div className="h-64 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="h-full w-full object-cover transition group-hover:scale-105 duration-300"
                />
              </div>

              <div className="p-8">
                <h3 className="text-2xl font-extrabold text-[color:var(--primary)] mb-4">
                  {service.title}
                </h3>
                <p className="text-[color:var(--textMuted)] leading-relaxed mb-8">
                  {service.description}
                </p>
                <button
                  onClick={() => navigate("/coaches")}
                  className="rounded-xl bg-[color:var(--navbar)] px-7 py-3 font-semibold text-white transition hover:bg-opacity-90"
                >
                  Read More
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
