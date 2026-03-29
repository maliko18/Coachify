import { useNavigate } from "react-router-dom";
import { howItWorksSteps } from "../data/howItWorks";

const HowItWorks = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-white">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-extrabold text-[color:var(--primary)]">
          How It <span className="text-[color:var(--navbar)]">Works</span>
        </h2>
        <p className="text-[color:var(--textMuted)] mt-4">
          Simplifying the booking process for coaches, venues, and athletes.
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10 px-6">
        {howItWorksSteps.map((step) => (
          <div
            key={step.id}
            className="
              group relative rounded-2xl border border-[#E6EDF3] bg-white p-10 text-center
              transition-all duration-300
              hover:-translate-y-3 hover:shadow-2xl hover:scale-105
            "
          >
            <div
              className="
                mx-auto mb-6 w-16 h-16 flex items-center justify-center rounded-xl rotate-45
                bg-gray-100 transition-all duration-300
                group-hover:bg-[color:var(--accent)]
              "
            >
              <span className="-rotate-45 text-xl text-[color:var(--primary)] group-hover:text-white">
                🏸
              </span>
            </div>

            <h3 className="text-xl font-bold text-[color:var(--primary)] mb-4">
              {step.title}
            </h3>

            <p className="text-[color:var(--textMuted)] mb-8">
              {step.description}
            </p>

            <button
              type="button"
              onClick={() => navigate(step.to)}
              className="
                w-full py-3 rounded-xl font-semibold transition-all duration-300
                border border-[color:var(--primary)] text-[color:var(--primary)]
                group-hover:bg-[color:var(--primary)] group-hover:text-white
              "
            >
              {step.cta} →
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;
