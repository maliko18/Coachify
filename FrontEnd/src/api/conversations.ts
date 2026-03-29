import axiosClient from "./axios";

export interface ConversationUser {
  id: number;
  first_name?: string;
  last_name?: string;
  email?: string;
}

export interface Conversation {
  id: number;
  user_id: number;
  coach_id: number;
  last_message_at?: string | null;
  messages_count?: number;
  user?: ConversationUser;
  coach?: ConversationUser;
}

export interface Message {
  id: number;
  conversation_id: number;
  from_id: number;
  contenu: string;
  sent_at?: string | null;
  created_at?: string;
  sender?: ConversationUser;
}

const extractArray = <T>(payload: unknown): T[] => {
  if (Array.isArray(payload)) return payload as T[];
  if (
    typeof payload === "object" &&
    payload !== null &&
    Array.isArray((payload as { data?: unknown }).data)
  ) {
    return (payload as { data: T[] }).data;
  }
  return [];
};

const conversationsApi = {
  /** GET /api/conversations */
  list: async (params?: { per_page?: number }) => {
    const res = await axiosClient.get("/conversations", { params });
    return extractArray<Conversation>(res.data?.data ?? res.data);
  },

  /** GET /api/conversations/:id/messages */
  messages: async (conversationId: number, params?: { per_page?: number }) => {
    const res = await axiosClient.get(
      `/conversations/${conversationId}/messages`,
      { params },
    );
    return extractArray<Message>(res.data?.data ?? res.data);
  },

  /** POST /api/conversations/:id/messages */
  sendMessage: async (conversationId: number, contenu: string) => {
    const res = await axiosClient.post(
      `/conversations/${conversationId}/messages`,
      { contenu },
    );
    return (res.data?.data ?? res.data) as Message;
  },

  /** GET /api/groups/:id/messages */
  groupMessages: async (groupId: number, params?: { per_page?: number }) => {
    const res = await axiosClient.get(`/groups/${groupId}/messages`, {
      params,
    });
    return extractArray<Message>(res.data?.data ?? res.data);
  },

  /** POST /api/groups/:id/messages */
  sendGroupMessage: async (groupId: number, contenu: string) => {
    const res = await axiosClient.post(`/groups/${groupId}/messages`, {
      contenu,
    });
    return (res.data?.data ?? res.data) as Message;
  },
};

export default conversationsApi;
