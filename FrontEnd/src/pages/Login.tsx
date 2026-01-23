import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type Role = "user" | "coach";

export default function Login() {
  const navigate = useNavigate();

  const [role, setRole] = useState<Role>("user");
  const [emailOrUsername, setEmailOrUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [remember, setRemember] = useState<boolean>(true);

  const roleLabel = useMemo(
    () => (role === "user" ? "User" : "Coach"),
    [role]
  );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Ici tu brancheras ton API (axios/fetch)
    console.log("LOGIN SUBMIT", {
      role,
      emailOrUsername,
      password,
      remember,
    });

    // exemple navigation après login
    navigate("/");
  };

  const onGoogleSignIn = () => {
    // ✅ Ici tu branches OAuth Google (Firebase, NextAuth, etc.)
    console.log("GOOGLE SIGN IN", { role });
    alert(`Google sign-in for: ${roleLabel}`);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* LEFT – color background */}
      <div className="hidden lg:flex items-center justify-center relative
                      bg-gradient-to-br from-[#0b6f72] via-[#1c8788] to-[#63b07a]">
        <div className="absolute -top-32 -left-32 w-[420px] h-[420px] rounded-full bg-white/10" />
        <div className="absolute bottom-20 left-40 w-[320px] h-[320px] rounded-full bg-black/10" />

        <div className="relative z-10 w-[520px] max-w-[80%] rounded-2xl
                        bg-white/25 backdrop-blur-md border border-white/30 p-10">
          <div className="inline-flex items-center gap-3
                          bg-[color:var(--accent)] px-8 py-4 rounded-xl
                          font-extrabold text-[color:var(--primary)] text-2xl">
            👍 Login {roleLabel}
          </div>

          <p className="mt-8 text-white text-lg leading-relaxed">
            Log in right away for our advanced sports software solutions, created to
            address issues in regular sporting events and activities.
          </p>
        </div>
      </div>

      {/* RIGHT – form */}
      <div className="flex items-center justify-center px-6 py-10 bg-white">
        <div className="w-full max-w-xl">
          {/* Logo */}
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

            {/* Role toggle */}
            <div className="mt-6 flex gap-4 items-center">
              <button
                type="button"
                onClick={() => setRole("user")}
                className={`px-6 py-3 rounded-xl font-semibold border-2 transition
                  ${
                    role === "user"
                      ? "border-green-600 text-green-700 bg-green-50"
                      : "border-transparent text-gray-500 bg-gray-100 hover:bg-gray-200"
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
                      : "border-transparent text-gray-500 bg-gray-100 hover:bg-gray-200"
                  }`}
              >
                ● I am a Coach
              </button>
            </div>

            {/* Form */}
            <form onSubmit={onSubmit} className="mt-8 space-y-4">
              <input
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                className="w-full rounded-xl bg-gray-50 border border-gray-100 px-5 py-4 outline-none focus:ring-2 focus:ring-green-200"
                placeholder="Email / Username"
                required
              />

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl bg-gray-50 border border-gray-100 px-5 py-4 outline-none focus:ring-2 focus:ring-green-200"
                placeholder="Password"
                required
              />

              {/* Remember + forgot */}
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

              {/* Sign In */}
              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-[color:var(--primary)] hover:bg-[color:var(--accent)] duration-800 text-white font-semibold"
              >
                Sign In →
              </button>
            </form>

            {/* Divider */}
            <div className="mt-8 flex items-center gap-4 text-gray-400">
              <div className="h-px bg-gray-200 flex-1" />
              <span className="text-sm">or continue with</span>
              <div className="h-px bg-gray-200 flex-1" />
            </div>

            {/* Google only */}
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
