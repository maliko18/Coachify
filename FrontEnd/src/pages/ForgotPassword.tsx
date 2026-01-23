import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow">
        <h1 className="text-2xl font-extrabold text-[color:var(--primary)]">
          Forgot Password
        </h1>
        <p className="text-gray-500 mt-2">
          Enter your email and we’ll send you a reset link.
        </p>

        <input
          className="mt-6 w-full rounded-xl bg-gray-50 border border-gray-100 px-5 py-4 outline-none focus:ring-2 focus:ring-green-200"
          placeholder="Email"
        />

        <button className="mt-4 w-full py-4 rounded-xl bg-[color:var(--primary)] text-white font-semibold">
          Send reset link
        </button>

        <button
          onClick={() => navigate("/login")}
          className="mt-4 w-full text-sm text-[color:var(--primary)] font-semibold"
        >
          Back to login
        </button>
      </div>
    </div>
  );
}
