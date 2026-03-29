import { useEffect, useState } from "react";
import Header from "../components/Header";
import adminApi, { type AdminUser } from "../api/admin";

const roleOptions = ["prospect", "client", "coach", "gym_manager"];

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error !== "object" || error === null) return fallback;
  const maybeError = error as {
    message?: string;
    response?: { data?: { message?: string } };
  };
  return maybeError.response?.data?.message || maybeError.message || fallback;
};

export default function AdminUsersPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "banned">(
    "all",
  );

  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const [selectedRoleByUser, setSelectedRoleByUser] = useState<
    Record<number, string>
  >({});

  const loadUsers = async (targetPage = page) => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await adminApi.users({
        page: targetPage,
        per_page: 20,
        search: search || undefined,
        role: roleFilter || undefined,
        status: statusFilter,
      });

      setUsers(response.data || []);
      setPage(response.current_page || targetPage);
      setLastPage(response.last_page || 1);

      const nextSelected: Record<number, string> = {};
      (response.data || []).forEach((user) => {
        nextSelected[user.id] = user.roles[0]?.name || "prospect";
      });
      setSelectedRoleByUser(nextSelected);
    } catch (e: unknown) {
      setError(
        getApiErrorMessage(e, "Impossible de charger les utilisateurs."),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter, statusFilter]);

  const applySearch = (event: React.FormEvent) => {
    event.preventDefault();
    loadUsers(1);
  };

  const updateRole = async (userId: number) => {
    const role = selectedRoleByUser[userId];
    if (!role) return;

    try {
      setError("");
      setSuccess("");
      await adminApi.updateRoles(userId, [role]);
      setSuccess("Role utilisateur mis a jour.");
      await loadUsers(page);
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, "Impossible de mettre a jour le role."));
    }
  };

  const toggleBan = async (user: AdminUser) => {
    try {
      setError("");
      setSuccess("");

      if (user.is_banned) {
        await adminApi.unban(user.id);
        setSuccess(`Utilisateur ${user.full_name} reactive.`);
      } else {
        await adminApi.ban(user.id);
        setSuccess(`Utilisateur ${user.full_name} banni.`);
      }

      await loadUsers(page);
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, "Action ban/unban impossible."));
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Header />

      <div className="mx-auto max-w-7xl p-8">
        <h1 className="text-3xl font-extrabold text-slate-900">
          Gestion des utilisateurs (Gym Manager)
        </h1>
        <p className="mt-1 text-slate-600">
          Recherche, role et activation/desactivation des comptes.
        </p>

        <form
          onSubmit={applySearch}
          className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-4"
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Recherche nom ou email"
            className="h-11 rounded-xl border border-slate-300 bg-white px-4"
          />

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-11 rounded-xl border border-slate-300 bg-white px-4"
          >
            <option value="">Tous les roles</option>
            {roleOptions.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "all" | "active" | "banned")
            }
            className="h-11 rounded-xl border border-slate-300 bg-white px-4"
          >
            <option value="all">Tous statuts</option>
            <option value="active">Actifs</option>
            <option value="banned">Bannis</option>
          </select>

          <button
            type="submit"
            className="h-11 rounded-xl bg-slate-900 px-5 font-semibold text-white"
          >
            Rechercher
          </button>
        </form>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        )}

        <div className="mt-6 overflow-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="px-4 py-3">Utilisateur</th>
                <th className="px-4 py-3">Role courant</th>
                <th className="px-4 py-3">Role cible</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-6 text-slate-600" colSpan={5}>
                    Chargement des utilisateurs...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-slate-600" colSpan={5}>
                    Aucun utilisateur trouve.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-100">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900">
                        {user.full_name}
                      </p>
                      <p className="text-slate-600">{user.email}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {user.roles.map((role) => role.name).join(", ") || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={selectedRoleByUser[user.id] || "prospect"}
                        onChange={(e) =>
                          setSelectedRoleByUser((prev) => ({
                            ...prev,
                            [user.id]: e.target.value,
                          }))
                        }
                        className="h-10 rounded-lg border border-slate-300 bg-white px-3"
                      >
                        {roleOptions.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                          user.is_banned
                            ? "bg-rose-100 text-rose-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {user.is_banned ? "Banni" : "Actif"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => updateRole(user.id)}
                          className="rounded-lg border border-slate-300 px-3 py-2 font-semibold text-slate-700"
                        >
                          Sauver role
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleBan(user)}
                          className={`rounded-lg px-3 py-2 font-semibold text-white ${
                            user.is_banned ? "bg-emerald-600" : "bg-rose-600"
                          }`}
                        >
                          {user.is_banned ? "Unban" : "Ban"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => loadUsers(page - 1)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm disabled:opacity-40"
          >
            Precedent
          </button>
          <span className="px-2 text-sm text-slate-600">
            Page {page} / {lastPage}
          </span>
          <button
            type="button"
            disabled={page >= lastPage}
            onClick={() => loadUsers(page + 1)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm disabled:opacity-40"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  );
}
