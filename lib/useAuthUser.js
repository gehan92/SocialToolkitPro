import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

function syncTokenToWindow(session) {
  if (typeof window !== "undefined") {
    window.__stAccessToken = session?.access_token ?? null;
    window.dispatchEvent(new CustomEvent("st-auth-ready"));
  }
}

export function useAuthUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      syncTokenToWindow(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      syncTokenToWindow(session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return { user, loading };
}
