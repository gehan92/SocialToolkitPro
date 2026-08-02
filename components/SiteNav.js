import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthUser } from "../lib/useAuthUser";
import { supabase } from "../lib/supabaseClient";

export default function SiteNav() {
  const { user, loading } = useAuthUser();
  const [username, setUsername] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user || !supabase) {
      if (typeof window !== "undefined") window.__stUserTier = "free";
      setUsername("");
      setIsAdmin(false);
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

    supabase.auth.getSession().then(({ data: { session } }) => {
      fetch("/api/admin/whoami", { headers: { Authorization: `Bearer ${session?.access_token}` } })
        .then((r) => r.json())
        .then((d) => setIsAdmin(!!d.isAdmin))
        .catch(() => setIsAdmin(false));
    });
  }, [user?.id]);

  async function handleLogout() {
    if (supabase) await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <nav>
      <div className="nav-wrap">
        <Link className="logo" href="/">
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
        </Link>
        <div className="nav-right">
          <Link className="nav-link" href="/#how">How it works</Link>
          <Link className="nav-link" href="/#tools">Tools</Link>
          <Link className="nav-link" href="/#faq">FAQ</Link>
          {loading ? null : user ? (
            <>
              <Link className="nav-link" href="/saved">Saved</Link>
              <Link className="nav-link" href="/calendar">Calendar</Link>
              <Link className="nav-link" href="/analytics">Analytics</Link>
              {isAdmin && <Link className="nav-link nav-link-admin" href="/admin">Admin</Link>}
              <Link
                className="nav-link"
                href="/account"
                title={user.email}
                style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
              >
                {username || user.email}
              </Link>
              <button className="nav-cta" onClick={handleLogout} style={{ border: "none", cursor: "pointer" }}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link className="nav-link" href="/login">Log in</Link>
              <Link className="nav-cta" href="/signup">Sign up free →</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
