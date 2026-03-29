import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import type { ReactNode } from "react";
import axiosClient from "../api/axios";

interface Role {
  id: number;
  name: string;
  description?: string;
}

interface User {
  id: number;
  first_name: string;
  last_name: string;
  name?: string;
  email: string;
  roles: Role[];
  selectedRole?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function normalizeUser(raw: any): User {
  const userData = raw?.data ? raw.data : raw;

  return {
    id: userData.id,
    first_name: userData.first_name,
    last_name: userData.last_name,
    name:
      userData.name ||
      `${userData.first_name ?? ""} ${userData.last_name ?? ""}`.trim(),
    email: userData.email,
    roles: Array.isArray(userData.roles) ? userData.roles : [],
    selectedRole: userData.selectedRole,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("USER");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setTokenState] = useState<string | null>(() => {
    return localStorage.getItem("ACCESS_TOKEN");
  });

  const [isLoading, setIsLoading] = useState(false);

  const setToken = (newToken: string | null) => {
    setTokenState(newToken);
    if (newToken) {
      localStorage.setItem("ACCESS_TOKEN", newToken);
    } else {
      localStorage.removeItem("ACCESS_TOKEN");
    }
  };

  const setUserAndPersist = (newUser: User | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem("USER", JSON.stringify(newUser));
    } else {
      localStorage.removeItem("USER");
    }
  };

  const fetchCurrentUser = async (): Promise<User> => {
    const response = await axiosClient.get("/user");
    const normalizedUser = normalizeUser(response.data);
    setUserAndPersist(normalizedUser);
    return normalizedUser;
  };

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const response = await axiosClient.post("/login", { email, password });
      const accessToken = response.data.token;

      setToken(accessToken);

      const fullUser = await fetchCurrentUser();
      return fullUser;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await axiosClient.post("/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setToken(null);
      setUserAndPersist(null);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token && !user) {
      setIsLoading(true);
      fetchCurrentUser()
        .catch(() => {
          setToken(null);
          setUserAndPersist(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        setUser: setUserAndPersist,
        setToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}