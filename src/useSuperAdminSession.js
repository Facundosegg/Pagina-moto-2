import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "./supabaseClient.js";

export function useSuperAdminSession() {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (active) {
        setSession(data.session);
        setChecking(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function logout() {
    if (!isSupabaseConfigured) return;
    await supabase.auth.signOut();
  }

  const isSuperAdmin = Boolean(session) && session.user?.user_metadata?.is_superadmin === true;

  return { session, isSuperAdmin, checking, logout };
}
