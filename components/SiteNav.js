import { useEffect, useState } from "react";
import { useAuthUser } from "../lib/useAuthUser";
import { supabase } from "../lib/supabaseClient";

export default function SiteNav() {
  const { user, loading } = useAuthUser();
  const [username, setUsername] = useState("");

  useEffect(() => {
    if (!user || !supabase) {
      if (typeof window !== "undefined") window.__stUserTier = "free";
      setUsername("");
      return;
    }
    supabase
      .from("profiles")
      .select("subscription_tier, username")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        window.__stUserTier = data?.subscription_tier || "free";
        setUsername(data?.username || "");
      });
  }, [user]);

  async function handleLogout() {
    if (supabase) await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <nav>
      <div className="nav-wrap">
        <a className="logo" href="/">
          <div className="logo-mark">
            <svg width="36" height="36" viewBox="0 0 36 36" role="img" aria-label="SocialToolkit logo">
              <rect width="36" height="36" rx="9" fill="#0e0e16" />
              <rect x="7" y="21" width="5" height="9" rx="2" fill="#5b4fff" />
              <rect x="14" y="16" width="5" height="14" rx="2" fill="#7c6dff" />
              <rect x="21" y="10" width="5" height="20" rx="2" fill="#ff4f9b" />
              <circle cx="30" cy="8" r="5" fill="#00e5a0" />
              <text x="30" y="11" fontFamily="system-ui,sans-serif" fontSize="5" fontWeight="800" fill="#060610" textAnchor="middle">
                AI
              </text>
            </svg>
          </div>
          SocialToolkit
        </a>
        <div className="nav-right">
          <a className="nav-link" href="/#how">How it works</a>
          <a className="nav-link" href="/#tools">Tools</a>
          <a className="nav-link" href="/#faq">FAQ</a>
          {loading ? null : user ? (
            <>
              <a className="nav-link" href="/saved">Saved</a>
              <a className="nav-link" href="/calendar">Calendar</a>
              <a className="nav-link" href="/analytics">Analytics</a>
              <a
                className="nav-link"
                href="/account"
                title={user.email}
                style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
              >
                {username || user.email}
              </a>
              <button className="nav-cta" onClick={handleLogout} style={{ border: "none", cursor: "pointer" }}>
                Log out
              </button>
            </>
          ) : (
            <>
              <a className="nav-link" href="/login">Log in</a>
              <a className="nav-cta" href="/signup">Sign up free →</a>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
