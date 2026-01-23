import heroImg from "../assets/hero-badminton.jpg";

const Hero: React.FC = () => {
  return (
    <section className="relative overflow-hidden text-white">
      <div className="absolute inset-0 bg-gradient-to-r from-[#0b6f72] via-[#1c8788] to-[#63b07a]" />

      <div className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-black/10 blur-0" />
      <div className="absolute left-40 top-20 h-[420px] w-[420px] rounded-full bg-black/10 blur-0" />
      <div className="absolute -right-40 -bottom-40 h-[560px] w-[560px] rounded-full bg-white/10 blur-0" />

      <span className="absolute left-16 top-20 h-5 w-5 rounded-full bg-[color:var(--accent)]" />
      <span className="absolute right-24 bottom-20 h-3 w-3 rounded-full bg-white/60" />

      <div className="relative mx-auto max-w-7xl px-8 py-20">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <p className="text-[color:var(--accent)] font-semibold tracking-wide mb-4">
              World Class  Coaching & Premium Courts
            </p>

            <h1 className="text-5xl md:text-6xl font-extrabold leading-[1.05]">
              Choose Your{" "}
              <span className="text-[color:var(--accent)]">Coaches</span>
              <br />
              And Start Your Training
            </h1>

            <p className="mt-6 text-white/90 text-lg leading-relaxed max-w-xl">
              Unleash Your Athletic Potential with Expert Coaching, State-of-the-Art
              Facilities, and Personalized Training Programs.
            </p>

            
            <div className="mt-10 rounded-2xl bg-white shadow-xl overflow-hidden">
              <div className="flex items-stretch">
                <div className="flex-1 px-7 py-5">
                  <p className="text-gray-900 font-semibold mb-2">Search for</p>
                  <button
                    type="button"
                    className="w-full flex items-center justify-between text-left text-gray-600"
                  >
                    <span>Courts</span>
                    <span className="text-gray-400 text-xs"></span>
                  </button>
                </div>

                <div className="w-px bg-  gray-200 my-5" />

                <div className="flex-1 px-7 py-5">
                  <p className="text-gray-900 font-semibold mb-2 text-center md:text-left">
                    Where
                  </p>
                  <button
                    type="button"
                    className="w-full flex items-center justify-between text-left text-gray-600"
                  >
                    <span>Choose Location</span>
                    <span className="text-gray-400 text-xs"></span>
                  </button>
                </div>

                <div className="px-5 py-5 flex items-center">
                  <button
                    aria-label="Search"
                    className="h-14 w-14 rounded-2xl text-white text-xl flex items-center justify-center
                              bg-gradient-to-b from-[#2aa6a0] to-[#0b6f72]"
                  >
                    ⌕
                  </button>
                </div>
              </div>
            </div>

          </div>

          <div className="relative flex justify-center md:justify-end">
            <div className="absolute right-10 top-10 h-[380px] w-[280px] rounded-[140px] bg-white/95 rotate-[8deg]" />

            <div className="relative h-[520px] w-[360px]">
              <div
                className="absolute inset-0 overflow-hidden shadow-2xl"
                style={{
                  borderRadius: "180px 180px 180px 180px / 240px 240px 140px 140px",
                }}
              >
                <img
                  src={heroImg}
                  alt="Badminton"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute left-8 bottom-6 text-[color:var(--accent)] text-5xl opacity-90">
        🏸
      </div>
    </section>
  );
};

export default Hero;
