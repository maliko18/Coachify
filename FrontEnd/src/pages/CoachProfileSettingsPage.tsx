import { useEffect, useRef, useState } from "react";
import axiosClient from "../api/axios";
import heroBg from "../assets/breadcrumb-bg2.jpg";
import Header from "../components/Header";
import CoachQuickNavBar from "../components/CoachQuickNavBar";

type Tab = "profile" | "password" | "settings";

const countries = [
  "France",
  "Allemagne",
  "Espagne",
  "Italie",
  "Royaume-Uni",
  "Maroc",
  "Algérie",
  "Tunisie",
  "Belgique",
  "Suisse",
  "Canada",
  "États-Unis",
];

export default function CoachProfileSettingsPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<Tab>("profile");

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

  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");

  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [newsletter, setNewsletter] = useState(true);
  const [profileVisible, setProfileVisible] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPhoto(URL.createObjectURL(file));
  };

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      setLoadingProfile(true);
      setProfileError("");

      try {
        const res = await axiosClient.get("/user");
        const user = res.data?.data ?? res.data;

        if (!isMounted || !user) return;

        setName(`${user.first_name ?? ""} ${user.last_name ?? ""}`.trim());
        setEmail(user.email ?? "");
        setPhone(user.phone ?? "");
        setAddress(user.address ?? "");
        setCity(user.city ?? "");
        setZipcode(user.postal_code ?? "");
        setPhoto(user.avatar ?? null);
      } catch (err: any) {
        if (!isMounted) return;
        setProfileError(
          err?.response?.data?.message || "Impossible de charger le profil.",
        );
      } finally {
        if (isMounted) setLoadingProfile(false);
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const saveProfile = async () => {
    setProfileMessage("");
    setProfileError("");

    const trimmedName = name.trim();
    if (!trimmedName) {
      setProfileError("Le nom est obligatoire.");
      return;
    }

    const parts = trimmedName.split(/\s+/);
    const firstName = parts.shift() || "";
    const lastName = parts.join(" ") || firstName;

    setSavingProfile(true);
    try {
      const payload = {
        first_name: firstName,
        last_name: lastName,
        email,
        phone: phone || null,
        address: address || null,
        city: city || null,
        postal_code: zipcode || null,
      };

      const res = await axiosClient.put("/user", payload);
      const updated = res.data?.data ?? res.data;
      if (updated) {
        setName(
          `${updated.first_name ?? ""} ${updated.last_name ?? ""}`.trim(),
        );
        setEmail(updated.email ?? "");
        setPhone(updated.phone ?? "");
        setAddress(updated.address ?? "");
        setCity(updated.city ?? "");
        setZipcode(updated.postal_code ?? "");
      }

      setProfileMessage("Profil mis a jour avec succes.");
    } catch (err: any) {
      setProfileError(
        err?.response?.data?.message || "Echec de la mise a jour du profil.",
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async () => {
    setProfileMessage("");
    setProfileError("");

    if (!currentPwd || !newPwd || !confirmPwd) {
      setProfileError("Tous les champs mot de passe sont obligatoires.");
      return;
    }

    if (newPwd !== confirmPwd) {
      setProfileError("La confirmation du mot de passe ne correspond pas.");
      return;
    }

    setSavingPassword(true);
    try {
      const res = await axiosClient.put("/user/password", {
        current_password: currentPwd,
        password: newPwd,
        password_confirmation: confirmPwd,
      });
      setProfileMessage(
        res.data?.message || "Mot de passe mis a jour avec succes.",
      );
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
    } catch (err: any) {
      setProfileError(
        err?.response?.data?.message || "Echec de mise a jour du mot de passe.",
      );
    } finally {
      setSavingPassword(false);
    }
  };

  const resetProfile = () => {
    setName("");
    setEmail("");
    setPhone("");
    setAbout("");
    setAddress("");
    setState("");
    setCity("");
    setCountry("");
    setZipcode("");
    setPhoto(null);
  };

  const resetPassword = () => {
    setCurrentPwd("");
    setNewPwd("");
    setConfirmPwd("");
  };

  const inputCls =
    "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 placeholder:text-gray-400";
  const labelCls = "block text-sm font-semibold text-gray-700 mb-2";

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div
        className="relative w-full h-65 flex items-center"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/60 to-black/40" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white">
            Coach Profile Settings
          </h1>
          <p className="text-sm text-gray-200 mt-2">
            Home <span className="mx-1">›</span> Coach Profile Settings
          </p>
        </div>
      </div>

      <CoachQuickNavBar activeKey="profile" />

      <div className="max-w-7xl mx-auto px-6 mt-10 mb-16">
        {loadingProfile && (
          <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-600">
            Chargement du profil...
          </div>
        )}
        {profileError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {profileError}
          </div>
        )}
        {profileMessage && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            {profileMessage}
          </div>
        )}

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
              {t === "profile"
                ? "Profile"
                : t === "password"
                  ? "Change Password"
                  : "Other Settings"}
            </button>
          ))}
        </div>

        {tab === "profile" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-8">
            <div className="flex flex-col items-start gap-3">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
              <div
                onClick={() => fileRef.current?.click()}
                className="relative h-36 w-36 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:border-green-500 transition group"
              >
                {photo ? (
                  <img
                    src={photo}
                    alt="Profile"
                    className="h-full w-full rounded-2xl object-cover"
                  />
                ) : (
                  <span className="text-sm text-gray-400 group-hover:text-green-600 transition">
                    Upload Photo
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className={labelCls}>Name</label>
                <input
                  type="text"
                  placeholder="Enter Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Email</label>
                <input
                  type="email"
                  placeholder="Enter Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Phone Number</label>
                <input
                  type="tel"
                  placeholder="Enter Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>

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

            <div className="border-t border-gray-100 pt-8 space-y-6">
              <h3 className="text-lg font-extrabold text-gray-900">Address</h3>
              <div>
                <label className={labelCls}>Address</label>
                <input
                  type="text"
                  placeholder="Enter Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className={labelCls}>State</label>
                  <input
                    type="text"
                    placeholder="Enter State"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>City</label>
                  <input
                    type="text"
                    placeholder="Enter City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Country</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className={inputCls}
                  >
                    <option value="">Select</option>
                    {countries.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="md:w-1/3">
                <label className={labelCls}>Zipcode</label>
                <input
                  type="text"
                  placeholder="Enter Zipcode"
                  value={zipcode}
                  onChange={(e) => setZipcode(e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={resetProfile}
                className="px-6 py-2.5 rounded-xl bg-green-700 text-white text-sm font-semibold hover:bg-green-800 transition"
              >
                Reset
              </button>
              <button
                onClick={saveProfile}
                disabled={savingProfile || loadingProfile}
                className="px-6 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 transition disabled:opacity-50"
              >
                {savingProfile ? "Saving..." : "Save Change"}
              </button>
            </div>
          </div>
        )}

        {tab === "password" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6 max-w-xl">
            <div>
              <label className={labelCls}>Current Password</label>
              <input
                type="password"
                placeholder="Enter current password"
                value={currentPwd}
                onChange={(e) => setCurrentPwd(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>New Password</label>
              <input
                type="password"
                placeholder="Enter new password"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Confirm New Password</label>
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={resetPassword}
                className="px-6 py-2.5 rounded-xl bg-green-700 text-white text-sm font-semibold hover:bg-green-800 transition"
              >
                Reset
              </button>
              <button
                onClick={savePassword}
                disabled={savingPassword || loadingProfile}
                className="px-6 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 transition disabled:opacity-50"
              >
                {savingPassword ? "Saving..." : "Save Change"}
              </button>
            </div>
          </div>
        )}

        {tab === "settings" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6 max-w-xl">
            <h3 className="text-lg font-extrabold text-gray-900">
              Notifications
            </h3>
            {[
              {
                label: "Email Notifications",
                desc: "Receive updates via email",
                value: emailNotif,
                set: setEmailNotif,
              },
              {
                label: "SMS Notifications",
                desc: "Receive updates via SMS",
                value: smsNotif,
                set: setSmsNotif,
              },
              {
                label: "Newsletter",
                desc: "Subscribe to our newsletter",
                value: newsletter,
                set: setNewsletter,
              },
            ].map(({ label, desc, value, set }) => (
              <div
                key={label}
                className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900">{label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                </div>
                <button
                  onClick={() => set(!value)}
                  className={`relative h-6 w-11 rounded-full transition-colors ${value ? "bg-green-600" : "bg-gray-300"}`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${value ? "translate-x-5" : "translate-x-0"}`}
                  />
                </button>
              </div>
            ))}

            <h3 className="text-lg font-extrabold text-gray-900 pt-4">
              Privacy
            </h3>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Public Profile
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Make your profile visible to others
                </p>
              </div>
              <button
                onClick={() => setProfileVisible(!profileVisible)}
                className={`relative h-6 w-11 rounded-full transition-colors ${profileVisible ? "bg-green-600" : "bg-gray-300"}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${profileVisible ? "translate-x-5" : "translate-x-0"}`}
                />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
