import { useNavigate } from "react-router-dom";
import dashboardIcon from "../assets/dashboard-icon.svg";
import courtsIcon from "../assets/court-icon.svg";
import requestsIcon from "../assets/request-icon.svg";
import bookingsIcon from "../assets/booking-icon.svg";
import chatIcon from "../assets/chat-icon.svg";
import earningsIcon from "../assets/invoice-icon.svg";
import walletIcon from "../assets/wallet-icon.svg";
import profileIcon from "../assets/profile-icon.svg";
import programmesIcon from "../assets/programmes.svg";

export type CoachQuickNavKey =
  | "dashboard"
  | "courts"
  | "requests"
  | "offers"
  | "bookings"
  | "seances"
  | "chat"
  | "earnings"
  | "wallet"
  | "profile"
  | "programmes"
  | "exercices";

type CoachQuickNavBarProps = {
  activeKey?: CoachQuickNavKey;
  requestsCount?: number;
};

type NavItem = {
  key: CoachQuickNavKey;
  title: string;
  icon: string;
  to: string;
};

const NAV_ITEMS: NavItem[] = [
  { key: "dashboard", title: "Dashboard", icon: dashboardIcon, to: "/coach/dashboard" },
  { key: "courts", title: "Courts", icon: courtsIcon, to: "/coach/analytics" },
  { key: "requests", title: "Requests", icon: requestsIcon, to: "/coach/dashboard#booking-requests-section" },
  { key: "offers", title: "Offers", icon: requestsIcon, to: "/coach/offres" },
  { key: "bookings", title: "Bookings", icon: bookingsIcon, to: "/coach/dashboard#bookings-section" },
  { key: "seances", title: "Seances", icon: bookingsIcon, to: "/coach/seances" },
  { key: "chat", title: "Chat", icon: chatIcon, to: "/coach/messages" },
  { key: "earnings", title: "Earnings", icon: earningsIcon, to: "/coach/dashboard#earnings-section" },
  { key: "wallet", title: "Wallet", icon: walletIcon, to: "/coach/dashboard#wallet-section" },
  { key: "profile", title: "Profile Setting", icon: profileIcon, to: "/coach/profile" },
  { key: "programmes", title: "Programmes", icon: programmesIcon, to: "/coach/programmes" },
  { key: "exercices", title: "Exercices", icon: requestsIcon, to: "/coach/exercices" },
];

function QuickNavCard({
  title,
  icon,
  active,
  badge,
  onClick,
}: {
  title: string;
  icon: string;
  active: boolean;
  badge?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative rounded-2xl border p-6
        flex flex-col items-center justify-center gap-3
        transition-all duration-200
        ${
          active
            ? "bg-green-700 text-white border-green-700"
            : "bg-white border-gray-200 text-gray-800 hover:bg-green-700 hover:text-white"
        }
      `}
    >
      {badge && (
        <span className="absolute top-3 right-4 text-xs font-bold bg-red-500 text-white rounded-full px-2 py-0.5">
          {badge}
        </span>
      )}

      <img src={icon} alt={title} className={`w-7 h-7 ${active ? "invert" : ""}`} />
      <p className="font-semibold text-sm">{title}</p>
    </button>
  );
}

export default function CoachQuickNavBar({
  activeKey,
  requestsCount = 0,
}: CoachQuickNavBarProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-50">
      <div className="px-6 lg:px-24 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {NAV_ITEMS.map((item) => (
            <QuickNavCard
              key={item.key}
              title={item.title}
              icon={item.icon}
              active={activeKey === item.key}
              badge={
                item.key === "requests" ? String(Math.max(0, requestsCount)) : undefined
              }
              onClick={() => navigate(item.to)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
