import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type Advogado = { id: string; nome: string; oab: string | null; user_id: string | null };

type AuthValue = {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  advogado: Advogado | null;
  loading: boolean;
  nome: string;
};

const AuthContext = createContext<AuthValue>({
  session: null,
  user: null,
  isAdmin: false,
  advogado: null,
  loading: true,
  nome: "",
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [advogado, setAdvogado] = useState<Advogado | null>(null);
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadExtras = async (userId: string | undefined) => {
      if (!userId) {
        setIsAdmin(false);
        setAdvogado(null);
        setNome("");
        return;
      }
      const [roles, adv, profile] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", userId),
        supabase.from("advogados").select("id, nome, oab, user_id").eq("user_id", userId).maybeSingle(),
        supabase.from("profiles").select("nome").eq("id", userId).maybeSingle(),
      ]);
      if (!active) return;
      setIsAdmin((roles.data ?? []).some((r) => r.role === "admin"));
      setAdvogado((adv.data as Advogado | null) ?? null);
      setNome(profile.data?.nome ?? "");
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      void loadExtras(newSession?.user?.id);
    });

    void supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      setSession(data.session);
      await loadExtras(data.session?.user?.id);
      if (active) setLoading(false);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{ session, user: session?.user ?? null, isAdmin, advogado, loading, nome }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
