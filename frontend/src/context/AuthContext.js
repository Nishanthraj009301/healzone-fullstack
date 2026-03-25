import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.REACT_APP_API_URL;

  /* ================= CHECK AUTH ================= */

  useEffect(() => {

    const checkAuth = async () => {

      /* 1️⃣ CHECK LOCAL STORAGE (Vendor login) */

      const savedUser = localStorage.getItem("user");

if (savedUser) {
  const parsedUser = JSON.parse(savedUser);

  /* If vendor, do NOT call /api/auth/me */

  if (parsedUser.role === "vendor") {
    setUser(parsedUser);
    setLoading(false);
    return;
  }
}

      /* 2️⃣ CHECK SESSION LOGIN (Normal user login) */

      if (!API_URL) {
        console.error("REACT_APP_API_URL is not defined");
        setLoading(false);
        return;
      }

      try {

        const res = await fetch(`${API_URL}/api/auth/me`, {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          setUser(null);
        } else {

          const data = await res.json();

          console.log("Auth /me response:", data);

          if (data.user) {

            const normalizedUser = {
              ...data.user,
              mobileNumber:
                data.user.mobileNumber ||
                data.user.phone ||
                data.user.mobile ||
                "",
            };

            setUser(normalizedUser);

          } else {
            setUser(null);
          }

        }

      } catch (error) {

        console.log("Auth check failed:", error.message);
        setUser(null);

      } finally {

        setLoading(false);

      }

    };

    checkAuth();

  }, [API_URL]);

  /* ================= LOGOUT ================= */

  const logout = async () => {

    try {

      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

    } catch (error) {

      console.log("Logout failed:", error.message);

    } finally {

      localStorage.removeItem("user"); // remove vendor login
      setUser(null);

    }

  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}