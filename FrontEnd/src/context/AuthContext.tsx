import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import type { ReactNode } from "react";
import axiosClient from "../api/axios";

interface User {
  id: number;
  first_name: string;
  last_name: string;
  name: string;
  email: string;
  roles: string[];
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

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const response = await axiosClient.post("/login", { email, password });
      const { token: accessToken, user: userData } = response.data;
      
      setToken(accessToken);
      setUserAndPersist(userData);
      return userData;
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

  // Vérifier le token au chargement
  useEffect(() => {
    if (token && !user) {
      setIsLoading(true);
      axiosClient
        .get("/user")
        .then(({ data }) => {
          setUserAndPersist(data);
        })
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
