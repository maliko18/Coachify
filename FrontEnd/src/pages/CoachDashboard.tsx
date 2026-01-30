import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

type Client = {
  id: string;
  name: string;
  group?: string;
  active: boolean;
};

type Session = {
  id: string;
  title: string;
  date: string;
  time: string;
  type: "individual" | "group";
  capacity?: number;
  booked?: number;
};

type RevenueStat = {
  label: string;
  value: string;
  hint: string;
};

export default function CoachDashboard() {
  const navigate = useNavigate();

  // Mock data (UI only)
  const clients: Client[] = useMemo(
    () => [
      { id: "c1", name: "Alice Martin", active: true },
      { id: "c2", name: "Yassine El Amrani", active: true, group: "HIIT Group" },
      { id: "c3", name: "Lina Dupont", active: false },
      { id: "c4", name: "Group – Leg Day", active: true, group: "Leg Day" },
    ],
    []
  );

  const sessions: Session[] = useMemo(
    () => [
      {
        id: "s1",
        title: "1-to-1 Strength Session",
        date: "2026-01-28",
        time: "18:30",
        type: "individual",
      },
      {
        id: "s2",
        title: "Group HIIT",
        date: "2026-01-30",
        time: "19:00",
        type: "group",
        capacity: 12,
        booked: 9,
      },
    ],
    []
  );

  const revenueStats: RevenueStat[] = useMemo(
    () => [
      { label: "Monthly Revenue", value: "€2,450", hint: "Subscriptions + packs" },
      { label: "Active Clients", value: "18", hint: "All contracts combined" },
      { label: "Fill Rate", value: "82%", hint: "Group sessions" },
      { label: "Retention", value: "91%", hint: "Last 3 months" },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-[color:var(--primary)]">
              Coach 
            </h1>
            <p className="text-gray-500 mt-1">
              Clients • Agenda • Content • Revenue • Partnerships
            </p>
          </div>

          <div className="flex gap-3">
            <button
              className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold hover:bg-gray-50"
              onClick={() => navigate("/")}
            >
              Home
            </button>
            <button
              className="px-4 py-2 rounded-xl bg-[color:var(--primary)] text-white font-semibold hover:bg-[color:var(--accent)]"
              onClick={() => alert("Create session / offer (UI)")}
            >
              + New
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">

        {/* KPIs */}
        <div className="grid gap-6 md:grid-cols-4">
          {revenueStats.map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6"
            >
              <p className="text-sm text-gray-500">{kpi.label}</p>
              <p className="text-3xl font-extrabold text-gray-900 mt-1">
                {kpi.value}
              </p>
              <p className="text-xs text-gray-400 mt-2">{kpi.hint}</p>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid gap-6 lg:grid-cols-3">

          {/* Clients */}
          <div className="lg:col-span-2 rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-[color:var(--primary)]">
                  Clients & Groups
                </h2>
                <p className="text-gray-500 mt-1">
                  CRM overview (clients, groups, contracts)
                </p>
              </div>

              <button
                className="px-4 py-2 rounded-xl bg-[color:var(--primary)] text-white font-semibold hover:bg-[color:var(--accent)]"
                onClick={() => alert("Add client (UI)")}
              >
                Add client
              </button>
            </div>

            <div className="mt-6 divide-y divide-gray-100">
              {clients.map((c) => (
                <div key={c.id} className="py-4 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-900">{c.name}</p>
                    <p className="text-sm text-gray-500">
                      {c.group ? `Group: ${c.group}` : "Individual client"}
                    </p>
                  </div>

                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-lg ${
                      c.active
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {c.active ? "ACTIVE" : "ARCHIVED"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Agenda */}
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-[color:var(--primary)]">
                  Agenda
                </h2>
                <p className="text-gray-500 mt-1">
                  Sessions (day / week / month)
                </p>
              </div>

              <button
                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50"
                onClick={() => alert("Open calendar view (UI)")}
              >
                Calendar
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className="rounded-xl border border-gray-100 bg-gray-50 p-4"
                >
                  <p className="font-bold text-gray-900">{s.title}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {s.date} • {s.time}
                  </p>
                  {s.type === "group" && (
                    <p className="text-sm text-gray-600 mt-1">
                      {s.booked}/{s.capacity} booked
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content & Partnerships */}
        <div className="grid gap-6 lg:grid-cols-3">

          {/* Content */}
          <div className="lg:col-span-2 rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
            <h2 className="text-xl font-extrabold text-[color:var(--primary)]">
              Content & Programs
            </h2>
            <p className="text-gray-500 mt-1">
              Exercises, sessions, programs, nutrition plans
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <ActionCard title="Exercises Library" />
              <ActionCard title="Training Programs" />
              <ActionCard title="Nutrition Plans" />
              <ActionCard title="Digital Products" />
            </div>
          </div>

          {/* Partnerships */}
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
            <h2 className="text-xl font-extrabold text-[color:var(--primary)]">
              Partnerships
            </h2>
            <p className="text-gray-500 mt-1">
              Gyms, companies, other coaches
            </p>

            <div className="mt-6 space-y-3">
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="font-bold text-gray-900">City Gym</p>
                <p className="text-sm text-gray-500">
                  Commission-based partnership
                </p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="font-bold text-gray-900">Coach Partner – Alex</p>
                <p className="text-sm text-gray-500">
                  Co-training / revenue sharing
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer hint */}
        
      </div>
    </div>
  );
}

function ActionCard({ title }: { title: string }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 flex items-center justify-between">
      <p className="font-bold text-gray-900">{title}</p>
      <button
        className="px-4 py-2 rounded-xl bg-[color:var(--primary)] text-white font-semibold hover:bg-[color:var(--accent)]"
        onClick={() => alert(`${title} (UI)`)}
      >
        Open
      </button>
    </div>
  );
}
