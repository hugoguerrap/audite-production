import React, { createContext, useState, useContext, useEffect } from "react";
import { authService } from "@/lib/authService";
import { toast } from "@/components/ui/sonner";

interface User {
  email: string;
  nombre?: string;
  empresa?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: { email: string; password: string; nombre: string; empresa: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("audite_token");
      const userData = localStorage.getItem("audite_user");
      
      if (token && userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (err) {
          localStorage.removeItem("audite_token");
          localStorage.removeItem("audite_user");
        }
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authService.login(email, password);
      
      // Save token
      localStorage.setItem("audite_token", response.access_token);
      
      // Get user data from the token or response
      const userData = {
        email,
        token: response.access_token,
        isAuthenticated: true
      };
      
      localStorage.setItem("audite_user", JSON.stringify(userData));
      setUser(userData);
      
      // Ensure we update the authentication state immediately
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("Login error:", error);
      setIsLoading(false);
      throw error;
    }
  };

  const register = async (userData: { email: string; password: string; nombre: string; empresa: string }) => {
    try {
      setIsLoading(true);
      await authService.register(userData);
      toast.success("Registro exitoso. Por favor inicie sesión.");
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("audite_token");
    localStorage.removeItem("audite_user");
    setUser(null);
    toast.info("Sesión cerrada");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
