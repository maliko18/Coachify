import { useState } from "react";
import { useNavigate } from "react-router-dom";

type Role = "user" | "coach";

export default function Signup() {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("user");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    console.log("SIGN UP", { role, ...form });

    navigate("/login");
  };

  const onGoogleSignup = () => {
    console.log("GOOGLE SIGN UP", role);
    alert(`Google sign up as ${role}`);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex items-center justify-center relative
                      bg-gradient-to-br from-[#0b6f72] via-[#1c8788] to-[#63b07a]">
        <div className="absolute -top-32 -left-32 w-[420px] h-[420px] rounded-full bg-white/10" />
        <div className="absolute bottom-20 left-40 w-[320px] h-[320px] rounded-full bg-black/10" />

        <div className="relative z-10 w-[520px] max-w-[80%] rounded-2xl
                        bg-white/25 backdrop-blur-md border border-white/30 p-10">
          <div className="inline-flex items-center gap-3
                          bg-[color:var(--accent)] px-8 py-4 rounded-xl
                          font-extrabold text-[color:var(--primary)] text-2xl">
            🚀 Create Account
          </div>

          <p className="mt-8 text-white text-lg leading-relaxed">
            Join our coaching platform and start managing your training,
            sessions, and performance in one place.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-10 bg-white">
        <div className="w-full max-w-xl">
          <div className="flex items-center justify-center gap-2 mb-10">
            <span className="text-2xl">🏸</span>
            <span className="text-2xl font-extrabold text-[color:var(--primary)]">
              Coachify
            </span>
            
          </div>

          <div className="rounded-2xl border border-gray-100 shadow-sm p-10">
            <h1 className="text-3xl font-extrabold text-[color:var(--primary)]">
              Create your account
            </h1>
            <p className="text-gray-500 mt-2">
              Sign up as a user or a coach
            </p>

            <div className="mt-6 flex gap-4">
              <button
                type="button"
                onClick={() => setRole("user")}
                className={`px-6 py-3 rounded-xl font-semibold border-2 transition
                  ${
                    role === "user"
                      ? "border-green-600 text-green-700 bg-green-50"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
              >
                ● I am a User
              </button>

              <button
                type="button"
                onClick={() => setRole("coach")}
                className={`px-6 py-3 rounded-xl font-semibold border-2 transition
                  ${
                    role === "coach"
                      ? "border-green-600 text-green-700 bg-green-50"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
              >
                ● I am a Coach
              </button>
            </div>

            <form onSubmit={onSubmit} className="mt-8 space-y-4">
              <input
                className="w-full rounded-xl bg-gray-50 border border-gray-100 px-5 py-4 outline-none focus:ring-2 focus:ring-green-200"
                placeholder="Full Name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />

              <input
                type="email"
                className="w-full rounded-xl bg-gray-50 border border-gray-100 px-5 py-4 outline-none focus:ring-2 focus:ring-green-200"
                placeholder="Email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />

              <input
                type="password"
                className="w-full rounded-xl bg-gray-50 border border-gray-100 px-5 py-4 outline-none focus:ring-2 focus:ring-green-200"
                placeholder="Password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />

              <input
                type="password"
                className="w-full rounded-xl bg-gray-50 border border-gray-100 px-5 py-4 outline-none focus:ring-2 focus:ring-green-200"
                placeholder="Confirm Password"
                required
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm({ ...form, confirmPassword: e.target.value })
                }
              />

              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-[color:var(--primary)] hover:bg-[color:var(--accent)] duration-800 text-white font-semibold"

              >
                Create Account →
              </button>
            </form>

            <div className="mt-8 flex items-center gap-4 text-gray-400">
              <div className="h-px bg-gray-200 flex-1" />
              <span className="text-sm">or sign up with</span>
              <div className="h-px bg-gray-200 flex-1" />
            </div>

            <div className="mt-6 flex justify-center">
              <button
                onClick={onGoogleSignup}
                className="w-44 py-3 rounded-xl border border-gray-200
                           font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                 Google
              </button>
            </div>

            <p className="mt-8 text-center text-gray-500">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-[color:var(--accent)] hover:text-[color:var(--primary)] duration-800 font-semibold"
              >
                Login
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
