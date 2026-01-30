import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [remember, setRemember] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const user = await login(email, password);
      
      // Redirect based on role
      if (user.roles.includes("coach")) {
        navigate("/coach/dashboard");
      } else {
        navigate("/user/dashboard");
      }
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        setError(axiosError.response?.data?.message || "Email ou mot de passe incorrect");
      } else {
        setError("Une erreur est survenue. Veuillez réessayer.");
      }
    }
  };

  const onGoogleSignIn = () => {
    console.log("GOOGLE SIGN IN");
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
             Login 
          </div>

          <p className="mt-8 text-white text-lg leading-relaxed">
            Log in right away for our advanced sports software solutions, created to
            address issues in regular sporting events and activities.
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
              Welcome Back
            </h1>
            <p className="text-gray-500 mt-2">Login into your account</p>

            {error && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={onSubmit} className="mt-8 space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl bg-gray-50 border border-gray-100 px-5 py-4 outline-none focus:ring-2 focus:ring-green-200"
                placeholder="Email"
                required
                disabled={isLoading}
              />

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl bg-gray-50 border border-gray-100 px-5 py-4 outline-none focus:ring-2 focus:ring-green-200"
                placeholder="Password"
                required
                disabled={isLoading}
              />

              <div className="flex items-center justify-between text-sm pt-2">
                <label className="flex items-center gap-3 text-gray-600">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4"
                  />
                  Remember Password
                </label>

                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-orange-700 hover:text-gray-800 duration-800 font-semibold"
                >
                  Forgot Password
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-xl bg-[color:var(--primary)] hover:bg-[color:var(--accent)] duration-800 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Connexion..." : "Sign In →"}
              </button>
            </form>

            <div className="mt-8 flex items-center gap-4 text-gray-400">
              <div className="h-px bg-gray-200 flex-1" />
              <span className="text-sm">or continue with</span>
              <div className="h-px bg-gray-200 flex-1" />
            </div>

            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={onGoogleSignIn}
                className="w-44 py-3 rounded-xl border border-gray-200 font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                 Google
              </button>
            </div>

            <p className="mt-8 text-center text-gray-500">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="text-[color:var(--accent)] hover:text-[color:var(--primary)] duration-800 font-semibold"
              >
                Sign up!
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
