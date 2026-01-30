import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type SessionStatus = "upcoming" | "completed" | "cancelled";

type Session = {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  type: "individual" | "group";
  location?: string;
  coachName: string;
  status: SessionStatus;
};

type Program = {
  id: string;
  name: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  progressPct: number; // 0-100
  nextWorkout?: string;
  access: "owned" | "trial";
};

type Payment = {
  id: string;
  date: string; // YYYY-MM-DD
  label: string;
  amountEUR: number;
  status: "paid" | "pending" | "failed";
};

type Message = {
  id: string;
  from: string;
  channel: "Coach" | "Group";
  preview: string;
  date: string; // YYYY-MM-DD
  unread: boolean;
};

export default function UserDashboard() {
  const navigate = useNavigate();

 
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: "s1",
      title: "Lower Body Strength",
      date: "2026-01-28",
      time: "18:30",
      type: "individual",
      location: "Coachify Studio",
      coachName: "Coach Sarah",
      status: "upcoming",
    },
    {
      id: "s2",
      title: "Group HIIT (8 spots)",
      date: "2026-01-30",
      time: "19:00",
      type: "group",
      location: "City Gym",
      coachName: "Coach Sarah",
      status: "upcoming",
    },
    {
      id: "s3",
      title: "Mobility & Recovery",
      date: "2026-01-22",
      time: "18:00",
      type: "individual",
      location: "Online",
      coachName: "Coach Sarah",
      status: "completed",
    },
  ]);

  const programs: Program[] = useMemo(
    () => [
      {
        id: "p1",
        name: "Glutes & Quads Builder",
        level: "Intermediate",
        progressPct: 42,
        nextWorkout: "Day 3 — Quads Focus",
        access: "owned",
      },
      {
        id: "p2",
        name: "Core & Posture Fix",
        level: "Beginner",
        progressPct: 65,
        nextWorkout: "Session — Plank Variations",
        access: "owned",
      },
      {
        id: "p3",
        name: "Fat Loss Starter Pack",
        level: "Beginner",
        progressPct: 20,
        nextWorkout: "Day 2 — Full Body",
        access: "trial",
      },
    ],
    []
  );

  const payments: Payment[] = useMemo(
    () => [
      { id: "pay1", date: "2026-01-10", label: "Monthly Subscription", amountEUR: 39.99, status: "paid" },
      { id: "pay2", date: "2025-12-18", label: "Pack 5 sessions", amountEUR: 75.0, status: "paid" },
      { id: "pay3", date: "2026-01-25", label: "Group Session Ticket", amountEUR: 8.0, status: "pending" },
    ],
    []
  );

  const messages: Message[] = useMemo(
    () => [
      {
        id: "m1",
        from: "Coach Sarah",
        channel: "Coach",
        preview: "Nice work last session. For next time, increase squat depth slightly.",
        date: "2026-01-26",
        unread: true,
      },
      {
        id: "m2",
        from: "Leg Day Group",
        channel: "Group",
        preview: "Reminder: Group HIIT Friday 19:00. Bring water + towel.",
        date: "2026-01-25",
        unread: false,
      },
    ],
    []
  );

  
  const progress = useMemo(
    () => ({
      weeklyWorkouts: 4,
      caloriesWeek: 1870,
      stepsAvg: 8200,
      streakDays: 11,
      chart: [3, 4, 2, 5, 4, 3, 4], 
    }),
    []
  );

  const upcoming = useMemo(
    () => sessions.filter((s) => s.status === "upcoming").slice(0, 4),
    [sessions]
  );

  const unreadCount = useMemo(() => messages.filter((m) => m.unread).length, [messages]);

  const totalSpent = useMemo(() => payments.filter(p => p.status === "paid").reduce((acc, p) => acc + p.amountEUR, 0), [payments]);

  const cancelSession = (id: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "cancelled" } : s))
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-[color:var(--primary)]">
              User 
            </h1>
            <p className="text-gray-500 mt-1">
              Planning • Programs • Progress • Messages • Payments
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition"
              onClick={() => navigate("/")}
            >
              Home
            </button>

            <button
              className="px-4 py-2 rounded-xl bg-[color:var(--primary)] text-white font-semibold hover:bg-[color:var(--accent)] transition"
              onClick={() => alert("Open notifications (UI)")}
            >
              Notifications {unreadCount > 0 ? `(${unreadCount})` : ""}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">

        {/* KPI cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <KpiCard title="Workouts (week)" value={`${progress.weeklyWorkouts}`} hint="From activity tracking (mock)" />
          <KpiCard title="Calories (week)" value={`${progress.caloriesWeek}`} hint="Estimated burned (mock)" />
          <KpiCard title="Avg steps/day" value={`${progress.stepsAvg}`} hint="Wearable sync (mock)" />
          <KpiCard title="Streak" value={`${progress.streakDays} days`} hint="Consistency indicator" />
        </div>

        {/* Main grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Planning */}
          <div className="lg:col-span-2 rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-[color:var(--primary)]">
                  My Planning
                </h2>
                <p className="text-gray-500 mt-1">
                  Upcoming sessions + quick actions (reserve/cancel)
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
                  onClick={() => alert("Open calendar view (UI)")}
                >
                  Calendar
                </button>
                <button
                  className="px-4 py-2 rounded-xl bg-[color:var(--primary)] text-white font-semibold hover:bg-[color:var(--accent)] transition"
                  onClick={() => alert("Reserve a group session (UI)")}
                >
                  Reserve
                </button>
              </div>
            </div>

            <div className="mt-6 divide-y divide-gray-100">
              {upcoming.length === 0 ? (
                <p className="text-gray-500 py-6">No upcoming sessions.</p>
              ) : (
                upcoming.map((s) => (
                  <div key={s.id} className="py-5 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${s.type === "group" ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700"}`}>
                          {s.type === "group" ? "GROUP" : "1-TO-1"}
                        </span>
                        <span className="text-sm text-gray-500">
                          {s.date} • {s.time}
                        </span>
                      </div>
                      <p className="mt-2 font-bold text-gray-900 truncate">{s.title}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Coach: {s.coachName} {s.location ? `• ${s.location}` : ""}
                      </p>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <button
                        className="px-3 py-2 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition"
                        onClick={() => alert("Open session details (UI)")}
                      >
                        Details
                      </button>
                      <button
                        className="px-3 py-2 rounded-xl bg-red-50 text-red-700 font-semibold hover:bg-red-100 transition"
                        onClick={() => cancelSession(s.id)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 text-sm text-gray-500">
              Reminders: email/push notifications can be wired later (backend).
            </div>
          </div>

          {/* Messages */}
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-[color:var(--primary)]">
                  Messages
                </h2>
                <p className="text-gray-500 mt-1">
                  Coach & group chat (preview)
                </p>
              </div>

              <button
                className="px-4 py-2 rounded-xl bg-[color:var(--primary)] text-white font-semibold hover:bg-[color:var(--accent)] transition"
                onClick={() => alert("Open messaging module (UI)")}
              >
                Open
              </button>
            </div>

            <div className="mt-6 space-y-3">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`rounded-xl border p-4 transition ${
                    m.unread ? "border-green-200 bg-green-50/40" : "border-gray-100 bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold text-gray-900 truncate">{m.from}</p>
                    <span className="text-xs text-gray-500">{m.date}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-1 rounded-lg bg-white border border-gray-200 text-gray-700">
                      {m.channel}
                    </span>
                    {m.unread && (
                      <span className="text-xs font-bold px-2 py-1 rounded-lg bg-[color:var(--primary)] text-white">
                        NEW
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {m.preview}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Programs + Progress */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Programs */}
          <div className="lg:col-span-2 rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-[color:var(--primary)]">
                  My Programs & Content
                </h2>
                <p className="text-gray-500 mt-1">
                  Access purchased programs, progressive release & next workout
                </p>
              </div>

              <button
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
                onClick={() => alert("Open content library (UI)")}
              >
                Library
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {programs.map((p) => (
                <div key={p.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-extrabold text-gray-900 truncate">{p.name}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Level: {p.level} • Access:{" "}
                        <span className={p.access === "owned" ? "text-green-700 font-semibold" : "text-gray-700 font-semibold"}>
                          {p.access.toUpperCase()}
                        </span>
                      </p>
                    </div>
                    <button
                      className="px-3 py-2 rounded-xl bg-[color:var(--primary)] text-white font-semibold hover:bg-[color:var(--accent)] transition"
                      onClick={() => alert("Open program details (UI)")}
                    >
                      Open
                    </button>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Progress</span>
                      <span className="font-semibold text-gray-700">{p.progressPct}%</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-white border border-gray-200 overflow-hidden">
                      <div
                        className="h-full bg-[color:var(--primary)]"
                        style={{ width: `${p.progressPct}%` }}
                      />
                    </div>
                    {p.nextWorkout && (
                      <p className="text-sm text-gray-600 mt-3">
                        Next: <span className="font-semibold text-gray-800">{p.nextWorkout}</span>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition"
                onClick={() => alert("Book/Cancel group sessions (UI)")}
              >
                Group Sessions
              </button>
              <button
                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition"
                onClick={() => alert("Leave a review (UI)")}
              >
                Leave a review
              </button>
            </div>
          </div>

          {/* Progress */}
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-[color:var(--primary)]">
                  Progress
                </h2>
                <p className="text-gray-500 mt-1">
                  Insights from tracking data (mock)
                </p>
              </div>

              <button
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
                onClick={() => alert("Connect Garmin/Strava (mock UI)")}
              >
                Connect
              </button>
            </div>

            <div className="mt-6">
              <MiniBarChart values={progress.chart} />
              <p className="text-xs text-gray-400 mt-2">
                Example: workouts per day (UI-only)
              </p>
            </div>

            <div className="mt-6 grid gap-3">
              <StatRow label="Workout consistency" value="Good" />
              <StatRow label="Recovery" value="Needs focus" />
              <StatRow label="Cardio" value="Stable" />
            </div>
          </div>
        </div>

        {/* Payments */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-[color:var(--primary)]">
                Payments & History
              </h2>
              <p className="text-gray-500 mt-1">
                Online payments + invoices history (UI)
              </p>
            </div>

            <div className="flex gap-2">
              <button
                className="px-4 py-2 rounded-xl bg-[color:var(--primary)] text-white font-semibold hover:bg-[color:var(--accent)] transition"
                onClick={() => alert("Pay online (UI)")}
              >
                Pay now
              </button>
              <button
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
                onClick={() => alert("Export invoices (UI)")}
              >
                Export
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl bg-gray-50 border border-gray-100 p-5">
              <p className="text-sm text-gray-500">Total spent</p>
              <p className="text-3xl font-extrabold text-gray-900 mt-1">
                €{totalSpent.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Paid transactions (mock)
              </p>
            </div>

            <div className="lg:col-span-2 overflow-hidden rounded-2xl border border-gray-100">
              <div className="grid grid-cols-4 bg-gray-50 text-sm font-bold text-gray-600 px-5 py-3">
                <div>Date</div>
                <div className="col-span-2">Label</div>
                <div className="text-right">Amount</div>
              </div>

              <div className="divide-y divide-gray-100">
                {payments.map((p) => (
                  <div key={p.id} className="grid grid-cols-4 px-5 py-4 text-sm items-center">
                    <div className="text-gray-600">{p.date}</div>
                    <div className="col-span-2">
                      <p className="font-semibold text-gray-900">{p.label}</p>
                      <span className={`text-xs font-bold px-2 py-1 rounded-lg inline-flex mt-2 ${
                        p.status === "paid"
                          ? "bg-green-50 text-green-700"
                          : p.status === "pending"
                          ? "bg-yellow-50 text-yellow-700"
                          : "bg-red-50 text-red-700"
                      }`}>
                        {p.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-right font-extrabold text-gray-900">
                      €{p.amountEUR.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

       
      </div>
    </div>
  );
}



function KpiCard({ title, value, hint }: { title: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-3xl font-extrabold text-gray-900 mt-1">{value}</p>
      <p className="text-xs text-gray-400 mt-2">{hint}</p>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-extrabold text-gray-900">{value}</span>
    </div>
  );
}

function MiniBarChart({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  return (
    <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
      <div className="flex items-end gap-2 h-28">
        {values.map((v, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            <div
              className="w-full rounded-lg bg-[color:var(--primary)]"
              style={{ height: `${Math.round((v / max) * 100)}%` }}
              title={`${v}`}
            />
            <span className="text-[10px] text-gray-400">{i + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
