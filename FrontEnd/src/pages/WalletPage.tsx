import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axios";
import heroBg from "../assets/breadcrumb-bg2.jpg";
import dashboardIcon from "../assets/dashboard-icon.svg";
import bookingsIcon from "../assets/booking-icon.svg";
import walletIcon from "../assets/wallet-icon.svg";
import profileIcon from "../assets/profile-icon.svg";
import avatar1 from "../assets/avatar-01.jpg";
import avatar2 from "../assets/avatar-02.jpg";
import avatar3 from "../assets/avatar-03.jpg";
import avatar4 from "../assets/avatar-04.jpg";
import avatar5 from "../assets/avatar-05.jpg";
import Header from "../components/Header";

type TransactionStatus = "paid" | "pending" | "failed";

type Transaction = {
  refId: string;
  name: string;
  avatar: string;
  date: string;
  time: string;
  payment: string;
  amount: number;
  createdAt: string;
  status: TransactionStatus;
};

const formatDate = (iso?: string) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit", month: "short" });
};

const formatTime = (iso?: string) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
};

function StatusBadge({ status }: { status: TransactionStatus }) {
  if (status === "paid")
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-green-100 text-green-700 font-semibold text-xs">
        <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none">
          <rect width="16" height="16" rx="3" fill="currentColor" opacity="0.2"/>
          <path d="M4 8l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Paid
      </span>
    );
  if (status === "pending")
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-100 text-purple-600 font-semibold text-xs">
        <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none">
          <rect width="16" height="16" rx="3" fill="currentColor" opacity="0.2"/>
          <path d="M8 4v4l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        Pending
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-100 text-red-500 font-semibold text-xs">
      <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none">
        <rect width="16" height="16" rx="3" fill="currentColor" opacity="0.2"/>
        <path d="M5 5l6 6M11 5l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
      Failed
    </span>
  );
}

const presetAmounts = [
  { label: "Add Value 1", value: 80 },
  { label: "Add Value 2", value: 60 },
  { label: "Add Value 3", value: 120 },
  { label: "Add Value 4", value: 120 },
];

function AddPaymentModal({ onClose, balance }: { onClose: () => void; balance: number }) {
  const [amount, setAmount] = useState("");
  const [selected, setSelected] = useState<number | null>(0);
  const [gateway, setGateway] = useState<"credit" | "paypal">("paypal");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2 className="text-lg font-extrabold text-gray-900">Add Payment to Wallet</h2>
          <button onClick={onClose} className="text-red-500 hover:text-red-700 text-xl font-bold leading-none">✕</button>
        </div>

        <div className="px-6 pb-6 space-y-5">
          {/* Mini balance card */}
          <div className="relative rounded-xl bg-green-700 p-5 overflow-hidden text-white">
            <div className="absolute -bottom-6 -left-6 h-28 w-28 rounded-full bg-green-600/50" />
            <div className="absolute -bottom-2 left-16 h-20 w-20 rounded-full bg-green-600/40" />
            <p className="text-xs font-semibold text-green-100 relative z-10">Your Wallet Balance</p>
            <p className="text-3xl font-extrabold mt-1 relative z-10">{balance.toFixed(2)} €</p>
          </div>

          {/* Manual amount */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Amount</label>
            <input
              type="number"
              placeholder="Enter Amount"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setSelected(null); }}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
            />
          </div>

          {/* OR divider */}
          <p className="text-sm font-bold text-gray-500">OR</p>

          {/* Preset amounts */}
          <div className="space-y-2">
            {presetAmounts.map((p, i) => (
              <label
                key={i}
                className={`flex items-center justify-between px-4 py-3 rounded-xl border cursor-pointer transition ${
                  selected === i ? "border-green-500 bg-green-50" : "border-gray-200 bg-gray-50 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selected === i}
                    onChange={() => { setSelected(i); setAmount(""); }}
                    className="h-4 w-4 rounded accent-green-600"
                  />
                  <span className="text-sm font-semibold text-gray-700">{p.label}</span>
                </div>
                <span className={`text-sm font-bold ${ selected === i ? "bg-blue-500 text-white px-3 py-1 rounded-lg" : "text-gray-400" }`}>
                  + ${p.value}
                </span>
              </label>
            ))}
          </div>

          {/* Payment gateway */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm font-bold text-gray-700 mb-3">Select Payment Gateway</p>
            <div className="space-y-2">
              {(["credit", "paypal"] as const).map((g) => (
                <label key={g} className="flex items-center gap-3 cursor-pointer px-2 py-1 rounded-lg hover:bg-gray-100 transition">
                  <input
                    type="radio"
                    name="gateway"
                    checked={gateway === g}
                    onChange={() => setGateway(g)}
                    className="h-4 w-4 accent-green-600"
                  />
                  <span className="text-sm text-gray-700 capitalize">{g === "credit" ? "Credit Card" : "Paypal"}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 transition">Reset</button>
            <button className="px-6 py-2.5 rounded-xl bg-green-700 text-white text-sm font-semibold hover:bg-green-800 transition">Submit</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddCardModal({ onClose }: { onClose: () => void }) {
  const [cardNumber, setCardNumber] = useState("43576777687998998");
  const [nameOnCard, setNameOnCard] = useState("Sport");
  const [expiry, setExpiry] = useState("06/2023");
  const [cvv, setCvv] = useState("099");
  const [save, setSave] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2 className="text-lg font-extrabold text-gray-900">Add New Card</h2>
          <button onClick={onClose} className="text-red-500 hover:text-red-700 text-xl font-bold leading-none">✕</button>
        </div>

        <div className="px-6 pb-6 space-y-4">
          {/* Card Number */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Card Number</label>
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
            />
          </div>

          {/* Name on Card */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Name On Card Number</label>
            <input
              type="text"
              value={nameOnCard}
              onChange={(e) => setNameOnCard(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
            />
          </div>

          {/* Expiry + CVV */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Expiry Date</label>
              <input
                type="text"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">CVV</label>
              <input
                type="text"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Save checkbox */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={save}
              onChange={(e) => setSave(e.target.checked)}
              className="h-4 w-4 rounded accent-green-600"
            />
            <span className="text-sm text-gray-600">Save for Next Payment</span>
          </label>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 transition">Reset</button>
            <button className="px-6 py-2.5 rounded-xl bg-green-700 text-white text-sm font-semibold hover:bg-green-800 transition">Submit</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WalletPage() {
  const navigate = useNavigate();
  const [txFilter, setTxFilter] = useState<"week" | "all">("week");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTx, setLoadingTx] = useState(true);
  const [errorTx, setErrorTx] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadTransactions = async () => {
      setLoadingTx(true);
      setErrorTx("");

      const avatarPool = [avatar1, avatar2, avatar3, avatar4, avatar5];

      const mapLocalInvoices = (email?: string) => {
        const raw = localStorage.getItem("CLIENT_INVOICES");
        const parsed: any[] = raw ? JSON.parse(raw) : [];
        const scoped = email
          ? parsed.filter((inv: any) => String(inv?.customer_email || "").toLowerCase() === email.toLowerCase())
          : parsed;

        return scoped.map((inv: any, idx: number): Transaction => ({
          refId: String(inv?.id || `INV-${idx + 1}`),
          name: String(inv?.coach_name || "Coach"),
          avatar: avatarPool[idx % avatarPool.length],
          date: formatDate(inv?.created_at),
          time: formatTime(inv?.created_at),
          payment: `${Number(inv?.amount || 0).toFixed(2)} €`,
          amount: Number(inv?.amount || 0),
          createdAt: String(inv?.created_at || new Date().toISOString()),
          status: "paid",
        }));
      };

      try {
        const [userRes, cmdRes] = await Promise.all([
          axiosClient.get("/user"),
          axiosClient.get("/commandes", { params: { per_page: 100 } }),
        ]);

        if (!isMounted) return;

        const user = userRes.data?.data ?? userRes.data;
        const email = String(user?.email || "");

        const payload = cmdRes.data?.data ?? cmdRes.data;
        const commandes: any[] = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
          ? payload.data
          : [];

        const fromCommandes: Transaction[] = commandes.map((c: any, idx: number) => {
          const coachUser = c?.coach?.user;
          const coachName = coachUser
            ? `${coachUser.first_name ?? ""} ${coachUser.last_name ?? ""}`.trim()
            : `Coach #${c?.coach_id ?? "-"}`;
          const statut = String(c?.statut || "").toLowerCase();
          const txStatus: TransactionStatus =
            statut === "annule" ? "failed" : statut === "attente" ? "pending" : "paid";
          const createdAt = String(c?.date_commande || c?.created_at || new Date().toISOString());

          return {
            refId: `CMD-${c?.id ?? idx + 1}`,
            name: coachName,
            avatar: avatarPool[idx % avatarPool.length],
            date: formatDate(createdAt),
            time: formatTime(createdAt),
            payment: `${Number(c?.total || 0).toFixed(2)} €`,
            amount: Number(c?.total || 0),
            createdAt,
            status: txStatus,
          };
        });

        const fromLocal = mapLocalInvoices(email);
        const merged = [...fromCommandes, ...fromLocal].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );

        setTransactions(merged);
      } catch (err: any) {
        if (!isMounted) return;
        const fromLocal = mapLocalInvoices();
        setTransactions(fromLocal);
        if (fromLocal.length === 0) {
          setErrorTx(err?.response?.data?.message || "Impossible de charger le wallet.");
        }
      } finally {
        if (isMounted) setLoadingTx(false);
      }
    };

    loadTransactions();

    return () => {
      isMounted = false;
    };
  }, []);

  const visibleTransactions = useMemo(() => {
    if (txFilter === "all") return transactions;
    const now = Date.now();
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    return transactions.filter((t) => now - new Date(t.createdAt).getTime() <= weekMs);
  }, [transactions, txFilter]);

  const totals = useMemo(() => {
    const totalCredit = transactions
      .filter((t) => t.status === "paid")
      .reduce((acc, t) => acc + t.amount, 0);
    const totalDebit = transactions
      .filter((t) => t.status === "failed")
      .reduce((acc, t) => acc + t.amount, 0);
    const totalTx = transactions.reduce((acc, t) => acc + t.amount, 0);
    const balance = totalCredit - totalDebit;

    return { totalCredit, totalDebit, totalTx, balance };
  }, [transactions]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* ── MODALS ── */}
      {showPaymentModal && <AddPaymentModal onClose={() => setShowPaymentModal(false)} balance={totals.balance} />}
      {showCardModal && <AddCardModal onClose={() => setShowCardModal(false)} />}

      {/* ── HERO BANNER ── */}
      <div
        className="relative w-full h-[260px] flex items-center"
        style={{ backgroundImage: `url(${heroBg})`, backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white">Wallet</h1>
          <p className="text-sm text-gray-200 mt-2">
            Home <span className="mx-1">›</span> Wallet
          </p>
        </div>
        {/* decorative blobs */}
        <span className="absolute top-8 left-8 h-3 w-3 rounded-full bg-green-400 opacity-90" />
        <span className="absolute top-8 right-10 h-4 w-4 rounded-full bg-teal-300 opacity-80" />
        <span className="absolute bottom-10 right-6 h-3 w-3 rounded-full bg-green-500 opacity-90" />
        <div className="absolute bottom-0 right-24 h-40 w-40 rounded-full bg-teal-500/30 blur-2xl" />
      </div>

      {/* ── NAV TABS ── */}
      <div className="max-w-7xl mx-auto px-6 mt-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          <button onClick={() => navigate("/user/dashboard")} className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-white border border-gray-200 p-6 hover:bg-gray-50 transition">
            <img src={dashboardIcon} alt="Dashboard" className="h-7 w-7" />
            <span className="font-semibold text-sm text-gray-700">Dashboard</span>
          </button>
          <button onClick={() => navigate("/user/bookings")} className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-white border border-gray-200 p-6 hover:bg-gray-50 transition">
            <img src={bookingsIcon} alt="My Bookings" className="h-7 w-7" />
            <span className="font-semibold text-sm text-gray-700">My Bookings</span>
          </button>
          {/* ACTIVE */}
          <button className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-green-700 text-white p-6 shadow-sm">
            <img src={walletIcon} alt="Wallet" className="h-7 w-7 brightness-0 invert" />
            <span className="font-semibold text-sm">Wallet</span>
          </button>
          <button onClick={() => navigate("/user/profile")} className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-white border border-gray-200 p-6 hover:bg-gray-50 transition">
            <img src={profileIcon} alt="Profile Setting" className="h-7 w-7" />
            <span className="font-semibold text-sm text-gray-700">Profile Setting</span>
          </button>
        </div>
      </div>

      {/* ── WALLET BALANCE + CARDS ── */}
      <div className="max-w-7xl mx-auto px-6 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Balance card */}
          <div className="relative rounded-2xl bg-green-700 p-8 overflow-hidden text-white">
            {/* decorative circles */}
            <div className="absolute -bottom-10 -left-10 h-44 w-44 rounded-full bg-green-600/50" />
            <div className="absolute -bottom-4 left-20 h-32 w-32 rounded-full bg-green-600/40" />

            <div className="relative z-10">
              <div className="flex items-start justify-between">
                <p className="text-sm font-semibold text-green-100">Your Wallet Balance</p>
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="border border-yellow-400 text-yellow-400 text-xs font-semibold px-4 py-2 rounded-lg hover:bg-yellow-400 hover:text-green-900 transition"
                >
                  Add Payment
                </button>
              </div>

              <p className="text-4xl font-extrabold mt-3">{totals.balance.toFixed(2)} €</p>

              <div className="border-t border-green-600 mt-6 pt-6 grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-green-200">Total Credit</p>
                  <p className="text-lg font-extrabold mt-1">{totals.totalCredit.toFixed(2)} €</p>
                </div>
                <div>
                  <p className="text-xs text-green-200">Total Debit</p>
                  <p className="text-lg font-extrabold mt-1">{totals.totalDebit.toFixed(2)} €</p>
                </div>
                <div>
                  <p className="text-xs text-green-200">Total transaction</p>
                  <p className="text-lg font-extrabold mt-1">{totals.totalTx.toFixed(2)} €</p>
                </div>
              </div>
            </div>
          </div>

          {/* Your Cards */}
          <div className="rounded-2xl bg-white border border-gray-100 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-extrabold text-gray-900">Your Cards</h3>
              <button
                onClick={() => setShowCardModal(true)}
                className="bg-gray-900 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-gray-700 transition"
              >
                Add New Card
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Visa */}
              <div className="rounded-xl border border-gray-200 p-5">
                <p className="text-xs text-gray-400 mb-1">Debit card</p>
                <p className="font-semibold text-gray-900 text-sm">Balance in card : 1,234</p>
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm font-semibold text-green-600 tracking-wider">123145546655</p>
                  <svg viewBox="0 0 750 471" className="h-7 w-12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="750" height="471" rx="40" fill="#1A1F71"/>
                    <path d="M309 333L338 138H384L355 333H309Z" fill="white"/>
                    <path d="M494 142c-18-7-46-14-81-14-89 0-152 47-152 115 0 50 45 77 79 94 35 17 47 28 47 43 0 23-28 33-54 33-36 0-55-5-84-17l-12-5-13 78c21 10 60 18 101 18 95 0 156-47 156-119 0-40-24-70-76-95-32-15-51-26-51-41 0-14 16-28 52-28 30 0 51 6 68 13l8 4 12-79z" fill="white"/>
                    <path d="M588 138h-52c-16 0-28 5-35 21L383 333h95s16-43 19-53h116c3 14 11 53 11 53h84L588 138zm-111 140c7-19 35-95 35-95s7-20 12-33l6 30s17 83 20 98h-73z" fill="white"/>
                    <path d="M254 138l-88 133-10-50c-16-54-67-113-123-142l81 254h96l143-195H254z" fill="white"/>
                    <path d="M120 138H3l-1 6c91 23 151 79 176 146l-25-125c-5-19-17-26-33-27z" fill="#F9A533"/>
                  </svg>
                </div>
              </div>

              {/* Mastercard */}
              <div className="rounded-xl border border-gray-200 p-5">
                <p className="text-xs text-gray-400 mb-1">Debit card</p>
                <p className="font-semibold text-gray-900 text-sm">Balance in card : 1,234</p>
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm font-semibold text-green-600 tracking-wider">314555884554</p>
                  <svg viewBox="0 0 38 24" className="h-7 w-12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="38" height="24" rx="4" fill="white"/>
                    <circle cx="15" cy="12" r="7" fill="#EB001B"/>
                    <circle cx="23" cy="12" r="7" fill="#F79E1B"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M19 17.196A6.978 6.978 0 0022 12a6.978 6.978 0 00-3-5.196A6.978 6.978 0 0016 12a6.978 6.978 0 003 5.196z" fill="#FF5F00"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── TRANSACTIONS TABLE ── */}
      <div className="max-w-7xl mx-auto px-6 mt-10 mb-16">
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">

          {/* Table header */}
          <div className="px-8 py-6 flex items-start justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-gray-900">Transaction</h3>
              <p className="text-sm text-gray-500 mt-1 max-w-xs">
                Reserve courts, buy equipment, and pay coaching fees with just a few taps.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTxFilter("week")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  txFilter === "week"
                    ? "bg-green-700 text-white"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                This Week
              </button>
              <button
                onClick={() => setTxFilter("all")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  txFilter === "all"
                    ? "bg-green-700 text-white"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                All Transactions
              </button>
            </div>
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-12 gap-4 px-8 py-3 bg-gray-50 border-y border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <div className="col-span-2">Ref ID</div>
            <div className="col-span-4">Transaction for</div>
            <div className="col-span-3">Date &amp; Time</div>
            <div className="col-span-1">Payment</div>
            <div className="col-span-2">Status</div>
          </div>

          {/* Rows */}
          {loadingTx && (
            <div className="px-8 py-6 text-gray-500">Chargement des transactions...</div>
          )}

          {!loadingTx && errorTx && (
            <div className="px-8 py-6 text-red-600">{errorTx}</div>
          )}

          {!loadingTx && !errorTx && visibleTransactions.length === 0 && (
            <div className="px-8 py-6 text-gray-500">Aucune transaction trouvée.</div>
          )}

          {visibleTransactions.map((tx, idx) => (
            <div
              key={`${tx.refId}-${idx}`}
              className="grid grid-cols-12 gap-4 px-8 py-4 items-center border-b border-gray-50 last:border-b-0 hover:bg-gray-50/50 transition"
            >
              {/* Ref ID */}
              <div className="col-span-2 text-sm font-semibold text-green-600">{tx.refId}</div>

              {/* Person */}
              <div className="col-span-4 flex items-center gap-3">
                <img src={tx.avatar} alt={tx.name} className="h-10 w-10 rounded-lg object-cover" />
                <span className="font-semibold text-sm text-gray-900">{tx.name}</span>
              </div>

              {/* Date & Time */}
              <div className="col-span-3 text-sm text-gray-500">
                <p>{tx.date}</p>
                <p>{tx.time}</p>
              </div>

              {/* Payment */}
              <div className="col-span-1 font-extrabold text-sm text-gray-900">{tx.payment}</div>

              {/* Status + action */}
              <div className="col-span-2 flex items-center gap-3">
                <StatusBadge status={tx.status} />
                <button className="h-8 w-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition text-base">
                  ···
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
