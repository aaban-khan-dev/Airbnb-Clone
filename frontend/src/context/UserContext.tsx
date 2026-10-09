"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

import { api } from "@/lib/api";
import { getStoredUserId, setStoredUserId } from "@/lib/session";
import type { User } from "@/lib/types";

type UserContextValue = {
  users: User[];
  currentUser: User | null;
  loading: boolean;
  switchUser: (userId: number) => void;
};

const UserContext = createContext<UserContextValue | null>(null);

// Wraps the whole app (see layout.tsx) so any component can read the current user
export function UserProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load all users once, then restore whoever was logged in last time
  useEffect(() => {
    api
      .get<User[]>("/api/users")
      .then((allUsers) => {
        setUsers(allUsers);
        const storedId = getStoredUserId();
        const user =
          allUsers.find((u) => u.id === storedId) ??
          allUsers.find((u) => !u.is_host) ?? // default: log in as a guest
          allUsers[0] ??
          null;
        if (user) {
          setStoredUserId(user.id);
          setCurrentUser(user);
        }
      })
      .catch(() => toast.error("Couldn't reach the server. Is the backend running?"))
      .finally(() => setLoading(false));
  }, []);

  const switchUser = useCallback(
    (userId: number) => {
      const user = users.find((u) => u.id === userId);
      if (!user) return;
      setStoredUserId(user.id);
      setCurrentUser(user);
      toast.success(`Logged in as ${user.name}`);
    },
    [users],
  );

  return (
    <UserContext.Provider value={{ users, currentUser, loading, switchUser }}>
      {children}
    </UserContext.Provider>
  );
}

// Hook used by components: const { currentUser } = useCurrentUser();
export function useCurrentUser(): UserContextValue {
  const context = useContext(UserContext);
  if (!context) throw new Error("useCurrentUser must be used inside <UserProvider>");
  return context;
}
