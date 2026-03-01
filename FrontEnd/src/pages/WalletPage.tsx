import { useState } from "react";
import { useNavigate } from "react-router-dom";
import heroBg from "../assets/breadcrumb-bg2.jpg";
import dashboardIcon from "../assets/dashboard-icon.svg";
import bookingsIcon from "../assets/booking-icon.svg";
import chatIcon from "../assets/chat-icon.svg";
import invoicesIcon from "../assets/invoice-icon.svg";
import walletIcon from "../assets/wallet-icon.svg";
import profileIcon from "../assets/profile-icon.svg";
import avatar1 from "../assets/avatar-01.jpg";
import avatar2 from "../assets/avatar-02.jpg";
import avatar3 from "../assets/avatar-03.jpg";
import avatar4 from "../assets/avatar-04.jpg";
import avatar5 from "../assets/avatar-05.jpg";

type TransactionStatus = "paid" | "pending" | "failed";

type Transaction = {
  refId: string;
  name: string;
  avatar: string;
  date: string;
  time: string;
  payment: string;
  status: TransactionStatus;
};

const allTransactions: Transaction[] = [
  { refId: "#CO14", name: "Kevin Anderson",      avatar: avatar1, date: "Mon, Jul 11", time: "04:00 PM - 06:00 PM", payment: "$150", status: "paid"    },
  { refId: "#CO15", name: "Angela Roudrigez",    avatar: avatar2, date: "Mon, Jul 11", time: "01:00 PM - 04:00 PM", payment: "$200", status: "pending" },
  { refId: "#CO16", name: "Wing Sports Academy", avatar: avatar3, date: "Mon, Jul 11", time: "05:00 PM - 08:00 PM", payment: "$150", status: "failed"  },
  { refId: "#CO17", name: "Feather Badminton",   avatar: avatar4, date: "Mon, Jul 11", time: "01:00 PM - 04:00 PM", payment: "$90",  status: "paid"    },
  { refId: "#CO18", name: "Pete Hill",            avatar: avatar5, date: "Mon, Jul 11", time: "03:00 PM - 08:00 PM", payment: "$180", status: "paid"    },
  { refId: "#CO11", name: "Kevin Anderson",      avatar: avatar1, date: "Mon, Jul 4",  time: "04:00 PM - 06:00 PM", payment: "$150", status: "paid"    },
  { refId: "#CO12", name: "Angela Roudrigez",    avatar: avatar2, date: "Mon, Jul 4",  time: "01:00 PM - 04:00 PM", payment: "$200", status: "paid"    },
  { refId: "#CO13", name: "Wing Sports Academy", avatar: avatar3, date: "Mon, Jul 4",  time: "05:00 PM - 08:00 PM", payment: "$90",  status: "failed"  },
];

const thisWeekTransactions = allTransactions.slice(0, 5);

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

export default function WalletPage() {
  const navigate = useNavigate();
  const [txFilter, setTxFilter] = useState<"week" | "all">("week");

  const transactions = txFilter === "week" ? thisWeekTransactions : allTransactions;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── TOP NAVBAR ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏋️‍♀️</span>
            <span className="text-2xl font-extrabold tracking-wide text-gray-900">Coachify</span>
          </div>

          <nav className="flex-1 flex justify-center items-center gap-8 text-sm font-semibold text-gray-600">
            <button onClick={() => navigate("/")} className="hover:text-gray-900 transition">Home</button>
            <button className="hover:text-gray-900 transition">Coaches</button>
            <button className="font-extrabold text-lime-500">User</button>
            <button className="hover:text-gray-900 transition">Pages</button>
            <button className="hover:text-gray-900 transition">Blog</button>
            <button className="hover:text-gray-900 transition">Contact Us</button>
          </nav>

          <div className="flex items-center gap-4">
            <button className="h-10 w-10 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition flex items-center justify-center text-lg" title="Search">🔍</button>
            <button className="relative h-10 w-10 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition flex items-center justify-center text-lg" title="Notifications">
              🔔
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">1</span>
            </button>
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-700" title="Profile">U</div>
          </div>
        </div>
      </div>

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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          <button onClick={() => navigate("/user/dashboard")} className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-white border border-gray-200 p-6 hover:bg-gray-50 transition">
            <img src={dashboardIcon} alt="Dashboard" className="h-7 w-7" />
            <span className="font-semibold text-sm text-gray-700">Dashboard</span>
          </button>
          <button onClick={() => navigate("/user/dashboard")} className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-white border border-gray-200 p-6 hover:bg-gray-50 transition">
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
          {/* ACTIVE */}
          <button className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-green-700 text-white p-6 shadow-sm">
            <img src={walletIcon} alt="Wallet" className="h-7 w-7 brightness-0 invert" />
            <span className="font-semibold text-sm">Wallet</span>
          </button>
          <button className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-white border border-gray-200 p-6 hover:bg-gray-50 transition">
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
                <button className="border border-yellow-400 text-yellow-400 text-xs font-semibold px-4 py-2 rounded-lg hover:bg-yellow-400 hover:text-green-900 transition">
                  Add Payment
                </button>
              </div>

              <p className="text-4xl font-extrabold mt-3">$4,544</p>

              <div className="border-t border-green-600 mt-6 pt-6 grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-green-200">Total Credit</p>
                  <p className="text-lg font-extrabold mt-1">$350.40</p>
                </div>
                <div>
                  <p className="text-xs text-green-200">Total Debit</p>
                  <p className="text-lg font-extrabold mt-1">$50.40</p>
                </div>
                <div>
                  <p className="text-xs text-green-200">Total transaction</p>
                  <p className="text-lg font-extrabold mt-1">$480.40</p>
                </div>
              </div>
            </div>
          </div>

          {/* Your Cards */}
          <div className="rounded-2xl bg-white border border-gray-100 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-extrabold text-gray-900">Your Cards</h3>
              <button className="bg-gray-900 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-gray-700 transition">
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
          {transactions.map((tx) => (
            <div
              key={tx.refId}
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
