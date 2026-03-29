import heroBg from "../assets/breadcrumb-bg2.jpg";

type DashboardHeroBannerProps = {
  title: string;
  breadcrumb: string;
};

export default function DashboardHeroBanner({
  title,
  breadcrumb,
}: DashboardHeroBannerProps) {
  return (
    <div
      className="relative w-full h-55 flex items-center"
      style={{
        backgroundImage: `url(${heroBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-linear-to-r from-black/75 via-black/55 to-black/30" />
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white">
          {title}
        </h1>
        <p className="text-sm text-gray-200 mt-2">{breadcrumb}</p>
      </div>
      <span className="absolute top-8 left-8 h-3 w-3 rounded-full bg-green-400 opacity-90" />
      <span className="absolute top-8 right-10 h-4 w-4 rounded-full bg-teal-300 opacity-80" />
      <span className="absolute bottom-10 right-6 h-3 w-3 rounded-full bg-green-500 opacity-90" />
      <div className="absolute bottom-0 right-24 h-40 w-40 rounded-full bg-teal-500/30 blur-2xl" />
    </div>
  );
}
