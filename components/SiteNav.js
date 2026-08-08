import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthUser } from "../lib/useAuthUser";
import { supabase } from "../lib/supabaseClient";

export default function SiteNav() {
  const { user, loading } = useAuthUser();
  const [username, setUsername] = useState("");
  const [dbTier, setDbTier] = useState("free");
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!user || !supabase) {
      setDbTier("free");
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
        setDbTier(data?.subscription_tier || "free");
        setUsername(data?.username || "");
      });

    supabase.auth.getSession().then(({ data: { session } }) => {
      fetch("/api/admin/whoami", { headers: { Authorization: `Bearer ${session?.access_token}` } })
        .then((r) => r.json())
        .then((d) => setIsAdmin(!!d.isAdmin))
        .catch(() => setIsAdmin(false));
    });
  }, [user?.id]);

  // window.__stUserTier drives every Premium/Pro paywall gate in the legacy
  // site.js tool UI. Admins get treated as Pro here too, on top of the
  // already-admin-aware server-side checks - otherwise an admin would pass
  // the API's tier check but still see the "Upgrade to Pro" overlay in the
  // browser, since that overlay reads this value, not the real tier.
  // site.js's own updateAllTierGates() only re-runs on the "st-auth-ready"
  // event (fired once, as soon as the session resolves) or on page load -
  // neither of which happens again once this profile/admin fetch finishes
  // a moment later, so the gate banners would otherwise stay stuck showing
  // whatever they showed at that earlier point. Call it directly once we
  // have the real tier.
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.__stUserTier = isAdmin ? "pro" : dbTier;
    window.updateAllTierGates?.();
  }, [isAdmin, dbTier]);

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
        <button
          className="nav-toggle"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span /><span /><span />
        </button>
        <div className={`nav-right${menuOpen ? " open" : ""}`} onClick={() => setMenuOpen(false)}>
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
