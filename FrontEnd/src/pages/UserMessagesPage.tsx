import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import ClientQuickNavBar from "../components/ClientQuickNavBar";
import DashboardHeroBanner from "../components/DashboardHeroBanner";
import conversationsApi, {
  type Conversation,
  type Message,
} from "../api/conversations";
import { useAuth } from "../context/AuthContext";

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error !== "object" || error === null) return fallback;
  const maybeError = error as {
    message?: string;
    response?: { data?: { message?: string } };
  };
  return maybeError.response?.data?.message || maybeError.message || fallback;
};

export default function UserMessagesPage() {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<"direct" | "group">("direct");
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<
    number | null
  >(null);

  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [groupIdInput, setGroupIdInput] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

  const getConversationDisplayName = useCallback(
    (conversation: Conversation) => {
      const currentUserId = Number(user?.id ?? 0);
      const isCurrentUserClient =
        Number(conversation.user_id) === currentUserId;
      const otherParticipant = isCurrentUserClient
        ? conversation.coach
        : conversation.user;

      const fullName =
        `${otherParticipant?.first_name ?? ""} ${otherParticipant?.last_name ?? ""}`.trim();
      return fullName || `Conversation #${conversation.id}`;
    },
    [user?.id],
  );

  const loadConversations = async () => {
    try {
      setLoading(true);
      setError("");
      const list = await conversationsApi.list({ per_page: 50 });
      setConversations(list);
      const queryConversationId = Number(searchParams.get("conversationId"));

      if (
        Number.isFinite(queryConversationId) &&
        queryConversationId > 0 &&
        list.some((conversation) => conversation.id === queryConversationId)
      ) {
        setSelectedConversationId(queryConversationId);
      } else if (!selectedConversationId && list.length > 0) {
        setSelectedConversationId(list[0].id);
      }
    } catch (e: unknown) {
      setError(
        getApiErrorMessage(e, "Impossible de charger les conversations."),
      );
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: number) => {
    try {
      setLoadingMessages(true);
      const list = await conversationsApi.messages(conversationId, {
        per_page: 100,
      });
      setMessages(list);
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, "Impossible de charger les messages."));
    } finally {
      setLoadingMessages(false);
    }
  };

  const loadGroupMessages = async (groupId: number) => {
    try {
      setLoadingMessages(true);
      const list = await conversationsApi.groupMessages(groupId, {
        per_page: 100,
      });
      setMessages(list);
    } catch (e: unknown) {
      setError(
        getApiErrorMessage(e, "Impossible de charger les messages du groupe."),
      );
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    if (mode === "direct" && selectedConversationId) {
      loadMessages(selectedConversationId);
    } else if (mode === "group" && selectedGroupId) {
      loadGroupMessages(selectedGroupId);
    } else {
      setMessages([]);
    }
  }, [selectedConversationId, mode, selectedGroupId]);

  const selectedConversation = useMemo(
    () => conversations.find((c) => c.id === selectedConversationId) ?? null,
    [conversations, selectedConversationId],
  );

  const filteredConversations = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return conversations;

    return conversations.filter((conversation) =>
      getConversationDisplayName(conversation).toLowerCase().includes(keyword),
    );
  }, [conversations, searchTerm, getConversationDisplayName]);

  const conversationTitle = useMemo(() => {
    if (!selectedConversation) return "Conversation";

    return getConversationDisplayName(selectedConversation);
  }, [selectedConversation, getConversationDisplayName]);

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      let sent: Message;
      if (mode === "group") {
        if (!selectedGroupId) {
          setError("Saisis un identifiant de groupe valide.");
          return;
        }
        sent = await conversationsApi.sendGroupMessage(
          selectedGroupId,
          newMessage.trim(),
        );
      } else {
        if (!selectedConversationId) {
          setError("Selectionne une conversation.");
          return;
        }
        sent = await conversationsApi.sendMessage(
          selectedConversationId,
          newMessage.trim(),
        );
      }
      setMessages((prev) => [...prev, sent]);
      setNewMessage("");
      if (mode === "direct") {
        await loadConversations();
      }
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, "Impossible d'envoyer le message."));
    } finally {
      setSending(false);
    }
  };

  const openGroup = () => {
    const parsed = Number(groupIdInput);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError("Identifiant de groupe invalide.");
      return;
    }
    setError("");
    setSelectedGroupId(parsed);
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Header />
      <DashboardHeroBanner
        title="Messagerie Client"
        breadcrumb="Home › User Dashboard › Messages"
      />
      <ClientQuickNavBar activeKey="messages" />

      <div className="mx-auto max-w-7xl p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-slate-900">
            Messagerie Client
          </h1>
          <p className="mt-1 text-slate-600">
            Conversations et messages en temps reel
          </p>
        </div>

        <div className="mb-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMode("direct")}
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${
              mode === "direct"
                ? "bg-emerald-600 text-white"
                : "bg-white border border-slate-300 text-slate-700"
            }`}
          >
            Direct
          </button>
          <button
            type="button"
            onClick={() => setMode("group")}
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${
              mode === "group"
                ? "bg-emerald-600 text-white"
                : "bg-white border border-slate-300 text-slate-700"
            }`}
          >
            Groupes
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {mode === "direct" ? (
            <div className="rounded-2xl border border-slate-200 bg-white lg:col-span-1">
              <div className="border-b border-slate-100 px-4 py-3">
                <h2 className="font-bold text-slate-900">Conversations</h2>
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher (ex: Sarah Boxe)"
                  className="mt-3 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm"
                />
              </div>

              <div className="max-h-150 overflow-auto p-2">
                {loading ? (
                  <p className="px-2 py-4 text-sm text-slate-500">
                    Chargement...
                  </p>
                ) : filteredConversations.length === 0 ? (
                  <p className="px-2 py-4 text-sm text-slate-500">
                    Aucune conversation trouvee.
                  </p>
                ) : (
                  filteredConversations.map((c) => {
                    const selected = c.id === selectedConversationId;
                    const name = getConversationDisplayName(c);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedConversationId(c.id)}
                        className={`mb-2 w-full rounded-xl px-3 py-3 text-left ${
                          selected
                            ? "bg-emerald-50 border border-emerald-200"
                            : "bg-slate-50 border border-transparent"
                        }`}
                      >
                        <p className="font-semibold text-slate-900">{name}</p>
                        <p className="text-xs text-slate-500">
                          {Number(c.messages_count ?? 0)} messages •{" "}
                          {formatDateTime(c.last_message_at)}
                        </p>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 lg:col-span-1">
              <h2 className="font-bold text-slate-900">Groupe</h2>
              <p className="mt-1 text-xs text-slate-500">
                Saisis l'identifiant du groupe pour charger les messages.
              </p>
              <div className="mt-4 flex gap-2">
                <input
                  value={groupIdInput}
                  onChange={(e) => setGroupIdInput(e.target.value)}
                  placeholder="ID groupe"
                  className="h-10 flex-1 rounded-xl border border-slate-200 px-3"
                />
                <button
                  type="button"
                  onClick={openGroup}
                  className="h-10 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white"
                >
                  Ouvrir
                </button>
              </div>
              <p className="mt-3 text-xs text-slate-500">
                Groupe actif: {selectedGroupId ?? "-"}
              </p>
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-white lg:col-span-2">
            <div className="border-b border-slate-100 px-4 py-3">
              <h2 className="font-bold text-slate-900">
                {mode === "group"
                  ? `Groupe #${selectedGroupId ?? "-"}`
                  : conversationTitle}
              </h2>
            </div>

            <div className="h-115 overflow-auto p-4">
              {mode === "direct" && !selectedConversationId ? (
                <p className="text-sm text-slate-500">
                  Selectionne une conversation.
                </p>
              ) : mode === "group" && !selectedGroupId ? (
                <p className="text-sm text-slate-500">
                  Entre un identifiant de groupe.
                </p>
              ) : loadingMessages ? (
                <p className="text-sm text-slate-500">
                  Chargement des messages...
                </p>
              ) : messages.length === 0 ? (
                <p className="text-sm text-slate-500">Aucun message.</p>
              ) : (
                messages.map((message) => {
                  const isMine = user
                    ? Number(message.from_id) === Number(user.id)
                    : false;
                  return (
                    <div
                      key={message.id}
                      className={`mb-3 flex ${isMine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2 ${isMine ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-900"}`}
                      >
                        <p className="text-sm">{message.contenu}</p>
                        <p
                          className={`mt-1 text-[11px] ${isMine ? "text-emerald-100" : "text-slate-500"}`}
                        >
                          {formatDateTime(
                            message.sent_at || message.created_at,
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="border-t border-slate-100 p-4">
              <div className="flex gap-2">
                <input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Ecrire un message..."
                  className="h-11 flex-1 rounded-xl border border-slate-200 px-4"
                />
                <button
                  type="button"
                  onClick={sendMessage}
                  disabled={
                    sending ||
                    !newMessage.trim() ||
                    (mode === "direct"
                      ? !selectedConversationId
                      : !selectedGroupId)
                  }
                  className="h-11 rounded-xl bg-emerald-600 px-5 font-semibold text-white disabled:opacity-50"
                >
                  {sending ? "Envoi..." : "Envoyer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
