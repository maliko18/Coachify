import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import dashboardIcon from "../assets/dashboard-icon.svg";
import bookingsIcon from "../assets/booking-icon.svg";
import walletIcon from "../assets/wallet-icon.svg";
import profileIcon from "../assets/profile-icon.svg";
import programmesIcon from "../assets/programmes.svg";
import chatIcon from "../assets/chat-icon.svg";

export type ClientQuickNavKey =
  | "dashboard"
  | "bookings"
  | "wallet"
  | "messages"
  | "programmes"
  | "profile";

type ClientQuickNavBarProps = {
  activeKey?: ClientQuickNavKey;
  unreadMessagesCount?: number;
};

type NavItem = {
  key: ClientQuickNavKey;
  title: string;
  icon: string;
  to: string;
};

const NAV_ITEMS: NavItem[] = [
  { key: "dashboard", title: "Dashboard", icon: dashboardIcon, to: "/user/dashboard" },
  { key: "bookings", title: "My Bookings", icon: bookingsIcon, to: "/user/bookings" },
  { key: "wallet", title: "Wallet", icon: walletIcon, to: "/user/wallet" },
  { key: "messages", title: "Messages", icon: chatIcon, to: "/user/messages" },
  {
    key: "programmes",
    title: "My Programmes",
    icon: programmesIcon,
    to: "/client/programmes/reservations",
  },
  { key: "profile", title: "Profile Setting", icon: profileIcon, to: "/user/profile" },
];

function QuickNavButton({
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
        relative flex flex-col items-center justify-center gap-3 rounded-2xl p-6 transition
        ${
          active
            ? "bg-green-700 text-white shadow-sm"
            : "bg-white border border-gray-200 hover:bg-gray-50"
        }
      `}
    >
      {badge && (
        <span className="absolute right-3 top-3 inline-flex min-w-6 items-center justify-center rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-bold text-white">
          {badge}
        </span>
      )}
      <img
        src={icon}
        alt={title}
        className={`h-7 w-7 ${active ? "brightness-0 invert" : ""}`}
      />
      <span className={`font-semibold text-sm ${active ? "" : "text-gray-700"}`}>
        {title}
      </span>
    </button>
  );
}

export default function ClientQuickNavBar({
  activeKey,
  unreadMessagesCount,
}: ClientQuickNavBarProps) {
  const navigate = useNavigate();

  const unread = useMemo(() => {
    if (typeof unreadMessagesCount === "number") {
      return Math.max(0, unreadMessagesCount);
    }
    const raw = localStorage.getItem("USER_UNREAD_MESSAGES_COUNT") || "0";
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
  }, [unreadMessagesCount]);

  return (
    <div className="max-w-7xl mx-auto px-6 mt-10">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
        {NAV_ITEMS.map((item) => (
          <QuickNavButton
            key={item.key}
            title={item.title}
            icon={item.icon}
            active={activeKey === item.key}
            badge={item.key === "messages" && unread > 0 ? String(unread) : undefined}
            onClick={() => {
              if (item.key === "messages") {
                localStorage.setItem("USER_UNREAD_MESSAGES_COUNT", "0");
              }
              navigate(item.to);
            }}
          />
        ))}
      </div>
    </div>
  );
}
