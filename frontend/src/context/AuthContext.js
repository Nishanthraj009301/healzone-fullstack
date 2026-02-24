import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔥 Runs when app loads (important for cookie login)
  useEffect(() => {
  const checkAuth = async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/auth/me`,
        {
          credentials: "include", // 🔥 important for cookies
        }
      );

      if (!res.ok) {
        setLoading(false);
        return;
      }

      const data = await res.json();
      setUser(data.user || null);
    } catch (error) {
      console.log("Auth check failed");
    } finally {
      setLoading(false);
    }
  };

  checkAuth();
}, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}