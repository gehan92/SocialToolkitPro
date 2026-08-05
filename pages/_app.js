import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";

export default function App({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    if (!supabase) return;
    // A password-reset email link should land on /reset-password, but if
    // Supabase's dashboard "Redirect URLs" allow-list hasn't been updated to
    // include it, Supabase silently falls back to the bare Site URL instead
    // - stranding the user on whatever page that is with no way to actually
    // set a new password. Catch the recovery session globally here and send
    // it to the one page that knows what to do with it.
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" && router.pathname !== "/reset-password") {
        router.replace("/reset-password");
      }
    });
    return () => listener.subscription.unsubscribe();
  }, [router]);

  return <Component {...pageProps} />;
}
