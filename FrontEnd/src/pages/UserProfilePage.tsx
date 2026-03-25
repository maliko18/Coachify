import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import heroBg from "../assets/breadcrumb-bg2.jpg";
import dashboardIcon from "../assets/dashboard-icon.svg";
import bookingsIcon from "../assets/booking-icon.svg";
import chatIcon from "../assets/chat-icon.svg";
import invoicesIcon from "../assets/invoice-icon.svg";
import walletIcon from "../assets/wallet-icon.svg";
import profileIcon from "../assets/profile-icon.svg";
import Header from "../components/Header";

type Tab = "profile" | "password" | "settings";

const countries = [
  "France", "Allemagne", "Espagne", "Italie", "Royaume-Uni",
  "Maroc", "Algérie", "Tunisie", "Belgique", "Suisse", "Canada", "États-Unis",
];

export default function UserProfilePage() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<Tab>("profile");

  // ── Profile state ──
  const [photo, setPhoto] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [about, setAbout] = useState("");
  const [address, setAddress] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [zipcode, setZipcode] = useState("");

  // ── Password state ──
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");

  // ── Other settings state ──
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [newsletter, setNewsletter] = useState(true);
  const [profileVisible, setProfileVisible] = useState(true);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPhoto(URL.createObjectURL(file));
  };

  const resetProfile = () => {
    setName(""); setEmail(""); setPhone(""); setAbout("");
    setAddress(""); setState(""); setCity(""); setCountry(""); setZipcode("");
    setPhoto(null);
  };

  const resetPassword = () => { setCurrentPwd(""); setNewPwd(""); setConfirmPwd(""); };

  const inputCls =
    "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 placeholder:text-gray-400";
  const labelCls = "block text-sm font-semibold text-gray-700 mb-2";

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* ── HERO BANNER ── */}
      <div
        className="relative w-full h-[260px] flex items-center"
        style={{ backgroundImage: `url(${heroBg})`, backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white">User Profile</h1>
          <p className="text-sm text-gray-200 mt-2">Home <span className="mx-1">›</span> User Profile</p>
        </div>
        <span className="absolute top-8 left-8 h-3 w-3 rounded-full bg-green-400 opacity-90" />
        <span className="absolute top-8 right-10 h-4 w-4 rounded-full bg-teal-300 opacity-80" />
        <span className="absolute bottom-10 right-6 h-3 w-3 rounded-full bg-green-500 opacity-90" />
        <div className="absolute bottom-0 right-24 h-40 w-40 rounded-full bg-teal-500/30 blur-2xl" />
      </div>

      {/* ── NAV TABS ── */}
      <div className="max-w-7xl mx-auto px-6 mt-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          <button onClick={() => navigate("/user/dashboard")} className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-white border border-gray-200 p-6 hover:bg-gray-50 transition">
            <img src={dashboardIcon} alt="Dashboard" className="h-7 w-7" />
            <span className="font-semibold text-sm text-gray-700">Dashboard</span>
          </button>
          <button onClick={() => navigate("/user/bookings")} className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-white border border-gray-200 p-6 hover:bg-gray-50 transition">
            <img src={bookingsIcon} alt="My Bookings" className="h-7 w-7" />
            <span className="font-semibold text-sm text-gray-700">My Bookings</span>
          </button>
          <button className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-white border border-gray-200 p-6 hover:bg-gray-50 transition">
            <img src={chatIcon} alt="Chat" className="h-7 w-7" />
            <span className="font-semibold text-sm text-gray-700">Chat</span>
          </button>
          <button className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-white border border-gray-200 p-6 hover:bg-gray-50 transition">
            <img src={invoicesIcon} alt="Invoices" className="h-7 w-7" />
            <span className="font-semibold text-sm text-gray-700">Invoices</span>
          </button>
          <button onClick={() => navigate("/user/wallet")} className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-white border border-gray-200 p-6 hover:bg-gray-50 transition">
            <img src={walletIcon} alt="Wallet" className="h-7 w-7" />
            <span className="font-semibold text-sm text-gray-700">Wallet</span>
          </button>
          {/* ACTIVE */}
          <button className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-green-700 text-white p-6 shadow-sm">
            <img src={profileIcon} alt="Profile Setting" className="h-7 w-7 brightness-0 invert" />
            <span className="font-semibold text-sm">Profile Setting</span>
          </button>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="max-w-7xl mx-auto px-6 mt-10 mb-16">

        {/* Sub-tabs */}
        <div className="flex items-center gap-1 mb-8">
          {(["profile", "password", "settings"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition ${
                tab === t
                  ? "bg-gray-900 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {t === "profile" ? "Profile" : t === "password" ? "Change Password" : "Other Settings"}
            </button>
          ))}
        </div>

        {/* ── TAB: PROFILE ── */}
        {tab === "profile" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-8">

            {/* Photo upload */}
            <div className="flex flex-col items-start gap-3">
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              <div
                onClick={() => fileRef.current?.click()}
                className="relative h-36 w-36 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:border-green-500 transition group"
              >
                {photo ? (
                  <img src={photo} alt="Profile" className="h-full w-full rounded-2xl object-cover" />
                ) : (
                  <span className="text-sm text-gray-400 group-hover:text-green-600 transition">Upload Photo</span>
                )}
                <span className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-green-600 flex items-center justify-center shadow">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6-6 3 3-6 6H9v-3z" />
                  </svg>
                </span>
              </div>
              <p className="text-xs text-gray-400">Upload a logo with a minimum size of 150 × 150 pixels (JPG, PNG, SVG).</p>
            </div>

            {/* Name / Email / Phone */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className={labelCls}>Name</label>
                <input type="text" placeholder="Enter Name" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Email</label>
                <input type="email" placeholder="Enter Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Phone Number</label>
                <input type="tel" placeholder="Enter Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} />
              </div>
            </div>

            {/* About */}
            <div>
              <label className={labelCls}>Information about You</label>
              <textarea
                rows={4}
                placeholder="About"
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                className={inputCls + " resize-none"}
              />
            </div>

            {/* Address section */}
            <div className="border-t border-gray-100 pt-8 space-y-6">
              <h3 className="text-lg font-extrabold text-gray-900">Address</h3>

              <div>
                <label className={labelCls}>Address</label>
                <input type="text" placeholder="Enter Address" value={address} onChange={(e) => setAddress(e.target.value)} className={inputCls} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className={labelCls}>State</label>
                  <input type="text" placeholder="Enter State" value={state} onChange={(e) => setState(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>City</label>
                  <input type="text" placeholder="Enter City" value={city} onChange={(e) => setCity(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Country</label>
                  <select value={country} onChange={(e) => setCountry(e.target.value)} className={inputCls}>
                    <option value="">Select</option>
                    {countries.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="md:w-1/3">
                <label className={labelCls}>Zipcode</label>
                <input type="text" placeholder="Enter Zipcode" value={zipcode} onChange={(e) => setZipcode(e.target.value)} className={inputCls} />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={resetProfile} className="px-6 py-2.5 rounded-xl bg-green-700 text-white text-sm font-semibold hover:bg-green-800 transition">Reset</button>
              <button className="px-6 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 transition">Save Change</button>
            </div>
          </div>
        )}

        {/* ── TAB: CHANGE PASSWORD ── */}
        {tab === "password" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6 max-w-xl">
            <div>
              <label className={labelCls}>Current Password</label>
              <input type="password" placeholder="Enter current password" value={currentPwd} onChange={(e) => setCurrentPwd(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>New Password</label>
              <input type="password" placeholder="Enter new password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Confirm New Password</label>
              <input type="password" placeholder="Confirm new password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} className={inputCls} />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={resetPassword} className="px-6 py-2.5 rounded-xl bg-green-700 text-white text-sm font-semibold hover:bg-green-800 transition">Reset</button>
              <button className="px-6 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 transition">Save Change</button>
            </div>
          </div>
        )}

        {/* ── TAB: OTHER SETTINGS ── */}
        {tab === "settings" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6 max-w-xl">
            <h3 className="text-lg font-extrabold text-gray-900">Notifications</h3>

            {[
              { label: "Email Notifications", desc: "Receive updates via email", value: emailNotif, set: setEmailNotif },
              { label: "SMS Notifications",   desc: "Receive updates via SMS",   value: smsNotif,   set: setSmsNotif   },
              { label: "Newsletter",          desc: "Subscribe to our newsletter", value: newsletter, set: setNewsletter },
            ].map(({ label, desc, value, set }) => (
              <div key={label} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                </div>
                <button
                  onClick={() => set(!value)}
                  className={`relative h-6 w-11 rounded-full transition-colors ${value ? "bg-green-600" : "bg-gray-300"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${value ? "translate-x-5" : "translate-x-0"}`} />
                </button>
              </div>
            ))}

            <h3 className="text-lg font-extrabold text-gray-900 pt-4">Privacy</h3>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="text-sm font-semibold text-gray-900">Public Profile</p>
                <p className="text-xs text-gray-400 mt-0.5">Make your profile visible to others</p>
              </div>
              <button
                onClick={() => setProfileVisible(!profileVisible)}
                className={`relative h-6 w-11 rounded-full transition-colors ${profileVisible ? "bg-green-600" : "bg-gray-300"}`}
              >
                <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${profileVisible ? "translate-x-5" : "translate-x-0"}`} />
              </button>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button className="px-6 py-2.5 rounded-xl bg-green-700 text-white text-sm font-semibold hover:bg-green-800 transition">Reset</button>
              <button className="px-6 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 transition">Save Change</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
