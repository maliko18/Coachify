import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import heroBg from "../assets/breadcrumb-bg2.jpg";

const ContactPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "",
    comments: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    alert("Thank you for your inquiry! We'll get back to you soon.");
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      subject: "",
      comments: "",
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* HERO BANNER */}
      <div
        className="relative w-full h-[260px] flex items-center"
        style={{ backgroundImage: `url(${heroBg})`, backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white">Contact US</h1>
          <div className="flex items-center gap-2 text-gray-200 mt-2">
            <button onClick={() => navigate("/")} className="hover:text-white transition">Home</button>
            <span className="mx-2">›</span>
            <span>Contact US</span>
          </div>
        </div>
        <span className="absolute top-8 left-8 h-3 w-3 rounded-full bg-green-400 opacity-90" />
        <span className="absolute top-8 right-10 h-4 w-4 rounded-full bg-teal-300 opacity-80" />
        <span className="absolute bottom-10 right-6 h-3 w-3 rounded-full bg-green-500 opacity-90" />
        <div className="absolute bottom-0 right-24 h-40 w-40 rounded-full bg-teal-500/30 blur-2xl" />
      </div>

      {/* CONTACT INFORMATION */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-extrabold text-[color:var(--primary)] text-center mb-16">
            Contact Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Email */}
            <div className="flex items-start gap-6">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-[color:var(--primary)] mb-2">Email Address</h3>
                <p className="text-[color:var(--textMuted)]">info@example.com</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-6">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-[color:var(--primary)] mb-2">Phone Number</h3>
                <p className="text-[color:var(--textMuted)]">+1 8164 164654</p>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-6">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-[color:var(--primary)] mb-2">Location</h3>
                <p className="text-[color:var(--textMuted)]">3365 Central Avenue Teterboro, NJ 07608</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT FORM */}
      <section className="py-20 bg-[#f4f5f7]">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-extrabold text-[color:var(--primary)] text-center mb-16">
            Reach out to us and let&apos;s smash your inquiries
          </h2>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-10 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <label className="block text-sm font-semibold text-[color:var(--primary)] mb-3">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter First Name"
                  className="w-full rounded-xl bg-gray-50 px-6 py-4 text-sm text-gray-900 placeholder:text-gray-400 border border-gray-200 outline-none focus:border-[color:var(--accent)] transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[color:var(--primary)] mb-3">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Enter Last Name"
                  className="w-full rounded-xl bg-gray-50 px-6 py-4 text-sm text-gray-900 placeholder:text-gray-400 border border-gray-200 outline-none focus:border-[color:var(--accent)] transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <label className="block text-sm font-semibold text-[color:var(--primary)] mb-3">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter Email Address"
                  className="w-full rounded-xl bg-gray-50 px-6 py-4 text-sm text-gray-900 placeholder:text-gray-400 border border-gray-200 outline-none focus:border-[color:var(--accent)] transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[color:var(--primary)] mb-3">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter Phone Number"
                  className="w-full rounded-xl bg-gray-50 px-6 py-4 text-sm text-gray-900 placeholder:text-gray-400 border border-gray-200 outline-none focus:border-[color:var(--accent)] transition"
                />
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-semibold text-[color:var(--primary)] mb-3">Subject</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Enter Subject"
                className="w-full rounded-xl bg-gray-50 px-6 py-4 text-sm text-gray-900 placeholder:text-gray-400 border border-gray-200 outline-none focus:border-[color:var(--accent)] transition"
              />
            </div>

            <div className="mb-10">
              <label className="block text-sm font-semibold text-[color:var(--primary)] mb-3">Comments</label>
              <textarea
                name="comments"
                value={formData.comments}
                onChange={handleChange}
                placeholder="Enter Comments"
                rows={6}
                className="w-full rounded-xl bg-gray-50 px-6 py-4 text-sm text-gray-900 placeholder:text-gray-400 border border-gray-200 outline-none focus:border-[color:var(--accent)] transition resize-none"
              />
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                className="rounded-xl bg-[color:var(--navbar)] px-10 py-4 font-semibold text-white transition hover:bg-opacity-90 inline-flex items-center gap-2"
              >
                <span>Submit</span>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="bg-[#071d4a] py-20 text-center text-white">
        <h3 className="text-4xl md:text-5xl font-extrabold mb-4">
          We Welcome Your Passion And Expertise
        </h3>
        <p className="mx-auto max-w-2xl text-lg text-white/60 mb-8">
          Join our empowering sports community today and grow with us.
        </p>
        <button
          onClick={() => navigate("/signup")}
          className="rounded-xl bg-emerald-600 px-9 py-4 text-lg font-bold text-white transition hover:bg-emerald-500 inline-flex items-center gap-2"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Join With Us
        </button>
      </section>
    </div>
  );
};

export default ContactPage;
