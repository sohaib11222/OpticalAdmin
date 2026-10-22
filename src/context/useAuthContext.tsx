/* eslint-disable react-refresh/only-export-components -- Shared context module exports its provider and hook; edits use a full reload. */
import {
  useRef,
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  ApiError,
  createApi,
  type SessionUser,
  type ApiEnvelope,
} from "../../../contracts/session";
export const adminApi = createApi("admin");
type State = {
  user: SessionUser | undefined;
  isAuthenticated: boolean;
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
  saveSession: (user: SessionUser) => void;
  removeSession: () => Promise<void>;
};
const Context = createContext<State | undefined>(undefined);
export function AuthProvider({ children }: { children: ReactNode }) {
  const generation = useRef(0);
  const [user, setUser] = useState<SessionUser>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const refresh = useCallback(async () => {
    const version = ++generation.current;
    try {
      const result = await adminApi.auth<ApiEnvelope<SessionUser>>("/me");
      if (version !== generation.current) return;
      setUser(result.data);
      setError("");
    } catch (e) {
      if (version !== generation.current) return;
      if (e instanceof ApiError && [401, 403].includes(e.status))
        setUser(undefined);
      setError(
        e instanceof ApiError && [401, 403].includes(e.status)
          ? ""
          : // A dictionary key rather than wording, so the message follows the
            // language toggle instead of freezing in the one active on load.
            "errors.cannotConnect",
      );
    } finally {
      if (version === generation.current) setLoading(false);
    }
  }, []);
  useEffect(() => {
    void refresh();
    const clear = () => {
      void refresh();
    };
    const focus = () => {
      void refresh();
    };
    window.addEventListener("optical:unauthenticated", clear);
    window.addEventListener("focus", focus);
    return () => {
      window.removeEventListener("optical:unauthenticated", clear);
      window.removeEventListener("focus", focus);
    };
  }, [refresh]);
  const removeSession = async () => {
    await adminApi.auth("/logout", {});
    generation.current++;
    setUser(undefined);
  };
  return (
    <Context.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        error,
        refresh,
        saveSession: (next) => {
          generation.current++;
          setUser(next);
          setLoading(false);
          setError("");
        },
        removeSession,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useAuthContext() {
  const value = useContext(Context);
  if (!value) throw new Error("AuthProvider required");
  return value;
}
