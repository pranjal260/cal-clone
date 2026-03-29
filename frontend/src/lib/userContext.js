"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { getDefaultUser } from "./api";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchUser = async () => {
      try {
        const res = await getDefaultUser();
        if (isMounted) {
          setUser(res.data);
          setError(null);
        }
      } catch (err) {
        console.error("Failed to fetch default user:", err);
        if (isMounted) {
          setError(err.message);
          // Set a dummy user for the app to work
          setUser({
            id: "demo-user",
            name: "Demo User",
            email: "demo@example.com",
            timezone: "Asia/Kolkata",
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUser();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, setUser, error }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside UserProvider");
  return ctx;
}
