import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { useAuthUser } from "../lib/useAuthUser";
import { supabase } from "../lib/supabaseClient";
import SiteNav from "../components/SiteNav";

const PLANS = [
  {
    id: "free",
    name: "Free Trial",
    price: "$0",
    period: "3-day trial",
    color: "var(--text2)",
    badge: "free",
    features: [
      "5 core AI tools",
      "3 generations day 1, 2 day 2, 1 day 3",
      "All platforms supported",
      "18 languages",
    ],
    missing: [
      "Save & export",
      "Templates",
      "Calendar & analytics",
      "Premium & Pro tools",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: "$9",
    period: "/ month",
    color: "#a097ff",
    accent: "var(--a1)",
    badge: "premium",
    popular: true,
    features: [
      "Everything in Free — unlimited",
      "SEO Blog Intro Writer",
      "Content Repurposer",
      "YouTube Description Writer",
      "Email Subject Line Writer",
      "CTA Generator",
      "Save & export (PDF / CSV)",
      "Templates",
      "Content Calendar",
      "Analytics dashboard",
    ],
    missing: ["Ad Copy, Viral Hooks, Tech Writing, Pitch Writer"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$29",
    period: "/ month",
    color: "#ffb347",
    accent: "linear-gradient(135deg,#f59e0b,#ef4444)",
    badge: "pro",
    features: [
      "Everything in Premium — unlimited",
      "Ad Copy Writer",
      "Viral Hook Generator",
      "Technical Writing Assistant",
      "Brand Pitch Writer",
      "Priority support",
    ],
    missing: [],
  },
];

const CSS = `
/* ── ACCOUNT WRAP ── */
.acct-wrap{max-width:760px;margin:0 auto;padding:48px 28px 100px;position:relative;z-index:1}
.acct-section-title{font-family:var(--fh);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:var(--text3);margin-bottom:14px;margin-top:36px}
.acct-title{font-family:var(--fh);font-size:clamp(28px,4vw,40px);font-weight:700;letter-spacing:-1.5px;margin-bottom:8px}
.acct-subtitle{font-size:14px;color:var(--text2);margin-bottom:36px}

/* ── PROFILE CARD ── */
.acct-card{background:var(--card);border:1px solid var(--border);border-radius:20px;padding:28px 32px;margin-bottom:20px}
.acct-row{display:flex;justify-content:space-between;align-items:center;padding:13px 0;border-bottom:1px solid var(--border)}
.acct-row:last-child{border-bottom:none}
.acct-label{font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:0.8px;font-weight:600}
.acct-value{font-size:14px;color:var(--text)}
.tier-badge{display:inline-block;padding:4px 12px;border-radius:100px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px}
.tier-free{background:rgba(153,152,176,0.15);color:var(--text2)}
.tier-premium{background:rgba(91,79,255,0.15);color:#a097ff}
.tier-pro{background:rgba(255,179,71,0.15);color:var(--a4)}
.tier-admin{background:rgba(255,179,71,0.15);color:var(--a4)}

/* ── USERNAME EDIT ── */
.acct-username-edit{display:flex;gap:8px;align-items:center}
.acct-username-edit input{background:rgba(255,255,255,0.04);border:1px solid var(--border2);border-radius:8px;color:var(--text);font-size:13px;padding:6px 10px;outline:none}
.acct-username-edit input:focus{border-color:var(--a1)}
.acct-username-edit .btn-save{background:var(--a1);color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:600;padding:7px 14px;cursor:pointer}
.acct-username-edit .btn-cancel{background:transparent;color:var(--text2);border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:600;padding:7px 12px;cursor:pointer}
.acct-edit-link{font-size:12px;color:var(--a1l);margin-left:10px;cursor:pointer;text-decoration:none}
.acct-edit-link:hover{text-decoration:underline}
.acct-msg{font-size:12px;margin-top:6px}
.acct-msg.error{color:#fca5a5}
.acct-msg.success{color:var(--a3)}

/* ── USAGE BAR ── */
.usage-bar-wrap{margin-top:6px}
.usage-bar-track{height:5px;background:rgba(255,255,255,0.07);border-radius:100px;overflow:hidden;margin-top:6px}
.usage-bar-fill{height:100%;border-radius:100px;transition:width 0.4s ease}
.usage-bar-label{font-size:11px;color:var(--text3);margin-top:4px}

/* ── PLAN CARDS ── */
.plan-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:4px}
@media(max-width:640px){.plan-grid{grid-template-columns:1fr}}
.plan-card{background:var(--card);border:1px solid var(--border);border-radius:20px;padding:24px;position:relative;transition:border-color 0.2s}
.plan-card.current{border-color:rgba(91,79,255,0.4)}
.plan-card.plan-pro.current{border-color:rgba(255,179,71,0.4)}
.plan-popular-tag{position:absolute;top:-11px;left:50%;transform:translateX(-50%);background:var(--a1);color:#fff;font-size:10px;font-weight:700;padding:3px 12px;border-radius:100px;letter-spacing:0.6px;white-space:nowrap;text-transform:uppercase}
.plan-name{font-family:var(--fh);font-size:14px;font-weight:700;margin-bottom:4px}
.plan-price{font-family:var(--fh);font-size:28px;font-weight:800;letter-spacing:-1px;line-height:1}
.plan-period{font-size:12px;color:var(--text3);margin-top:2px;margin-bottom:16px}
.plan-features{list-style:none;margin-bottom:20px}
.plan-features li{font-size:12px;color:var(--text2);padding:4px 0;display:flex;align-items:flex-start;gap:7px;line-height:1.4}
.plan-features li::before{content:"✓";color:var(--a3);font-weight:700;font-size:11px;flex-shrink:0;margin-top:1px}
.plan-features li.miss{color:var(--text3)}
.plan-features li.miss::before{content:"✕";color:rgba(255,255,255,0.15)}
.plan-btn{width:100%;padding:10px;border-radius:12px;font-size:13px;font-weight:700;border:none;cursor:pointer;transition:opacity 0.15s;font-family:var(--fh);letter-spacing:-0.2px}
.plan-btn:hover:not(:disabled){opacity:0.85}
.plan-btn:disabled{opacity:0.45;cursor:default}
.plan-btn.btn-current{background:rgba(255,255,255,0.06);color:var(--text2)}
.plan-btn.btn-upgrade-premium{background:var(--a1);color:#fff}
.plan-btn.btn-upgrade-pro{background:linear-gradient(135deg,#f59e0b,#ef4444);color:#fff}
.plan-btn.btn-downgrade{background:transparent;border:1px solid var(--border2);color:var(--text3);font-size:12px}

/* ── TOAST NOTIFICATION ── */
.acct-toast{position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:var(--card2);border:1px solid var(--border2);border-radius:12px;padding:12px 20px;font-size:13px;color:var(--text);z-index:999;display:flex;align-items:center;gap:10px;box-shadow:0 8px 32px rgba(0,0,0,0.4);animation:toastIn 0.25s ease}
@keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
.toast-icon{font-size:16px}
.toast-success{border-color:rgba(0,229,160,0.3)}
.toast-error{border-color:rgba(255,79,155,0.3)}

/* ── DANGER ZONE ── */
.danger-card{background:rgba(239,68,68,0.04);border:1px solid rgba(239,68,68,0.15);border-radius:16px;padding:20px 24px;display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap}
.danger-info{font-size:13px;color:var(--text2)}
.danger-info strong{display:block;color:var(--text);margin-bottom:2px;font-size:14px}
.btn-danger{background:transparent;border:1px solid rgba(239,68,68,0.4);color:#fca5a5;border-radius:10px;padding:8px 16px;font-size:12px;font-weight:600;cursor:pointer;transition:all 0.15s}
.btn-danger:hover{background:rgba(239,68,68,0.1)}

/* ── LOADING ── */
.acct-loading{color:var(--text2);text-align:center;padding:100px 0;font-size:14px}
.acct-loading-dot{display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--a1);margin:0 3px;animation:blink 1.2s ease infinite}
.acct-loading-dot:nth-child(2){animation-delay:0.2s}
.acct-loading-dot:nth-child(3){animation-delay:0.4s}
@keyframes blink{0%,80%,100%{opacity:0.2}40%{opacity:1}}

/* ── CHECKOUT SUCCESS BANNER ── */
.checkout-banner{background:rgba(0,229,160,0.08);border:1px solid rgba(0,229,160,0.25);border-radius:14px;padding:16px 20px;margin-bottom:24px;display:flex;align-items:center;gap:12px}
.checkout-banner-icon{font-size:20px}
.checkout-banner-text{font-size:13px;color:var(--a3)}
.checkout-banner-text strong{display:block;font-size:14px;margin-bottom:2px}
`;

export default function Account() {
  const router = useRouter();
  const { user, loading } = useAuthUser();
  const [profile, setProfile] = useState(null);
  const [usageToday, setUsageToday] = useState(0);
  const [usernameInput, setUsernameInput] = useState("");
  const [editingUsername, setEditingUsername] = useState(false);
  const [usernameMsg, setUsernameMsg] = useState("");
  const [usernameSaving, setUsernameSaving] = useState(false);
  const [upgrading, setUpgrading] = useState(null); // "premium" | "pro"
  const [cancelling, setCancelling] = useState(false);
  const [toast, setToast] = useState(null); // { msg, type }
  const [planConfig, setPlanConfig] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [billingCycle, setBillingCycle] = useState("annual"); // "monthly" | "annual" — default to annual, it's the better deal
  const [buyingCredits, setBuyingCredits] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  useEffect(() => {
    fetch("/api/plan-config").then((r) => r.json()).then((d) => { if (d.success) setPlanConfig(d.data); }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user || !supabase) return;
    supabase.from("profiles").select("*").eq("id", user.id).single()
      .then(({ data }) => { setProfile(data); setUsernameInput(data?.username || ""); });
    const today = new Date().toISOString().slice(0, 10);
    supabase.from("daily_usage").select("generations_count")
      .eq("user_id", user.id).eq("usage_date", today).maybeSingle()
      .then(({ data }) => setUsageToday(data?.generations_count ?? 0));

    supabase.auth.getSession().then(({ data: { session } }) => {
      fetch("/api/admin/whoami", { headers: { Authorization: `Bearer ${session?.access_token}` } })
        .then((r) => r.json())
        .then((d) => setIsAdmin(!!d.isAdmin))
        .catch(() => setIsAdmin(false));
    });
  }, [user?.id]);

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function handleLogout() {
    if (supabase) await supabase.auth.signOut();
    router.push("/");
  }

  async function saveUsername() {
    setUsernameMsg("");
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(usernameInput)) {
      setUsernameMsg("3–20 characters: letters, numbers, underscores only.");
      return;
    }
    setUsernameSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    const r = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
      body: JSON.stringify({ username: usernameInput }),
    });
    const d = await r.json();
    setUsernameSaving(false);
    if (!d.success) { setUsernameMsg(d.error); return; }
    setProfile((p) => ({ ...p, username: usernameInput }));
    setEditingUsername(false);
    showToast("Username updated successfully");
  }

  async function handleUpgrade(planId) {
    setUpgrading(planId);
    const { data: { session } } = await supabase.auth.getSession();
    try {
      const r = await fetch("/api/subscription/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ plan: planId, cycle: billingCycle }),
      });
      const d = await r.json();
      if (!d.success) { showToast(d.error, "error"); setUpgrading(null); return; }
      window.location.href = d.url;
    } catch (e) {
      showToast("Something went wrong. Please try again.", "error");
      setUpgrading(null);
    }
  }

  async function handleBuyCredits() {
    setBuyingCredits(true);
    const { data: { session } } = await supabase.auth.getSession();
    try {
      const r = await fetch("/api/credits/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
      });
      const d = await r.json();
      showToast(d.success ? "Credits purchased!" : (d.error || "Pay-as-you-go isn't available yet."), d.success ? "success" : "error");
    } catch (e) {
      showToast("Something went wrong. Please try again.", "error");
    }
    setBuyingCredits(false);
  }

  async function handleCancel() {
    if (!confirm("Are you sure you want to cancel your subscription? You'll keep access until the end of your billing period.")) return;
    setCancelling(true);
    const { data: { session } } = await supabase.auth.getSession();
    try {
      const r = await fetch("/api/subscription/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
      });
      const d = await r.json();
      if (!d.success) { showToast(d.error, "error"); } 
      else {
        setProfile((p) => ({ ...p, subscription_tier: "free" }));
        showToast("Subscription cancelled. You'll keep access until your billing period ends.");
      }
    } catch (e) {
      showToast("Something went wrong. Please try again.", "error");
    }
    setCancelling(false);
  }

  if (loading || !user) {
    return (
      <>
        <Head><title>Account — SocialToolkit</title><style dangerouslySetInnerHTML={{ __html: CSS }} /></Head>
        <div className="acct-loading">
          <span className="acct-loading-dot" /><span className="acct-loading-dot" /><span className="acct-loading-dot" />
        </div>
      </>
    );
  }

  const tier = profile?.subscription_tier ?? "free";
  const trialDayLimits = planConfig?.trialDayLimits || [3, 2, 1];
  const trialStartedAt = profile?.trial_started_at || user.created_at;
  const trialDay = Math.floor((Date.now() - new Date(trialStartedAt).getTime()) / 86400000) + 1;
  const trialExpired = tier === "free" && trialDay > trialDayLimits.length;
  const todayTrialLimit = trialDayLimits[Math.min(trialDay, trialDayLimits.length) - 1] || 0;
  const creditsBalance = profile?.credits_balance || 0;
  const freeLimit = todayTrialLimit;
  const usagePercent = tier === "free" && !trialExpired ? Math.min((usageToday / freeLimit) * 100, 100) : 0;
  const usageColor = usagePercent >= 90 ? "#ef4444" : usagePercent >= 60 ? "#f59e0b" : "var(--a3)";
  const checkoutStatus = router.query.checkout;

  return (
    <>
      <Head>
        <title>My Account — SocialToolkit</title>
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
      </Head>
      <SiteNav />

      <div className="acct-wrap">
        <h1 className="acct-title">My Account</h1>
        <p className="acct-subtitle">Manage your profile, plan, and billing.</p>

        {/* ── CHECKOUT SUCCESS BANNER ── */}
        {checkoutStatus === "success" && (
          <div className="checkout-banner">
            <span className="checkout-banner-icon">🎉</span>
            <div className="checkout-banner-text">
              <strong>Payment successful — welcome to {tier.charAt(0).toUpperCase() + tier.slice(1)}!</strong>
              Your account has been upgraded. All new features are now unlocked.
            </div>
          </div>
        )}
        {checkoutStatus === "canceled" && (
          <div className="checkout-banner" style={{ background: "rgba(255,79,155,0.06)", borderColor: "rgba(255,79,155,0.2)" }}>
            <span className="checkout-banner-icon">↩️</span>
            <div className="checkout-banner-text" style={{ color: "var(--a2)" }}>
              <strong>Checkout cancelled</strong>
              No payment was taken. You can upgrade any time below.
            </div>
          </div>
        )}

        {/* ── PROFILE ── */}
        <div className="acct-section-title">Profile</div>
        <div className="acct-card">
          {/* Username */}
          <div className="acct-row">
            <span className="acct-label">Username</span>
            {editingUsername ? (
              <div>
                <div className="acct-username-edit">
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    maxLength={20}
                    placeholder="e.g. alex_creates"
                    autoFocus
                  />
                  <button className="btn-save" onClick={saveUsername} disabled={usernameSaving}>
                    {usernameSaving ? "Saving…" : "Save"}
                  </button>
                  <button className="btn-cancel" onClick={() => { setEditingUsername(false); setUsernameInput(profile?.username || ""); setUsernameMsg(""); }}>
                    Cancel
                  </button>
                </div>
                {usernameMsg && <div className="acct-msg error">{usernameMsg}</div>}
              </div>
            ) : (
              <span className="acct-value">
                {profile?.username || <span style={{ color: "var(--text3)" }}>Not set</span>}
                <a className="acct-edit-link" href="#" onClick={(e) => { e.preventDefault(); setEditingUsername(true); }}>Edit</a>
              </span>
            )}
          </div>

          {/* Email */}
          <div className="acct-row">
            <span className="acct-label">Email</span>
            <span className="acct-value">{user.email}</span>
          </div>

          {/* Current Plan */}
          <div className="acct-row">
            <span className="acct-label">Current Plan</span>
            {isAdmin ? (
              <span className="tier-badge tier-admin">👑 Admin — Full Access</span>
            ) : (
              <span className={`tier-badge tier-${tier}`}>
                {tier === "free" ? "Free" : tier === "premium" ? "💎 Premium" : "👑 Pro"}
              </span>
            )}
          </div>

          {/* Usage today */}
          <div className="acct-row" style={{ flexDirection: "column", alignItems: "flex-start", gap: 6 }}>
            <span className="acct-label">{tier === "free" && !trialExpired ? "Trial usage" : "Generations today"}</span>
            {isAdmin ? (
              <span className="acct-value" style={{ color: "var(--a4)" }}>♾ Unlimited — Admin access</span>
            ) : tier === "free" && trialExpired ? (
              <div style={{ width: "100%" }}>
                <span className="acct-value">Your 3-day trial has ended.</span>{" "}
                {creditsBalance > 0 ? (
                  <span className="acct-value" style={{ color: "var(--a3)" }}>{creditsBalance} credit{creditsBalance === 1 ? "" : "s"} remaining</span>
                ) : (
                  <span className="acct-value" style={{ color: "var(--text3)" }}>Choose a plan or buy credits below to keep generating.</span>
                )}
              </div>
            ) : tier === "free" ? (
              <div className="usage-bar-wrap" style={{ width: "100%" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 14, color: "var(--text)" }}>Free trial</span>
                  <span style={{ fontSize: 12, color: usageColor, fontWeight: 600 }}>
                    {usagePercent >= 100 ? "Today's trial generations used" : `${Math.round(usagePercent)}% used`}
                  </span>
                </div>
                <div className="usage-bar-track">
                  <div className="usage-bar-fill" style={{ width: `${usagePercent}%`, background: usageColor }} />
                </div>
              </div>
            ) : (
              <span className="acct-value" style={{ color: "var(--a3)" }}>♾ Unlimited</span>
            )}
          </div>

          {/* Pay-as-you-go credit balance (only relevant once someone has bought/used credits) */}
          {!isAdmin && tier === "free" && creditsBalance > 0 && !trialExpired && (
            <div className="acct-row">
              <span className="acct-label">Credits balance</span>
              <span className="acct-value" style={{ color: "var(--a3)" }}>{creditsBalance}</span>
            </div>
          )}
        </div>

        {/* ── PLAN MANAGEMENT ── */}
        <div className="acct-section-title">Plan & Billing</div>

        {isAdmin && (
          <div className="checkout-banner" style={{ background: "rgba(255,179,71,0.08)", borderColor: "rgba(255,179,71,0.25)" }}>
            <span className="checkout-banner-icon">👑</span>
            <div className="checkout-banner-text" style={{ color: "var(--a4)" }}>
              <strong>Admin account — you already have full access to everything</strong>
              These plans are shown for reference only. You don't need to purchase or upgrade any of them.
            </div>
          </div>
        )}

        {!isAdmin && (
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 20 }}>
            <button
              onClick={() => setBillingCycle("monthly")}
              className="plan-btn"
              style={{ width: "auto", padding: "8px 18px", background: billingCycle === "monthly" ? "var(--a1)" : "rgba(255,255,255,0.06)", color: billingCycle === "monthly" ? "#fff" : "var(--text2)" }}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("annual")}
              className="plan-btn"
              style={{ width: "auto", padding: "8px 18px", background: billingCycle === "annual" ? "var(--a1)" : "rgba(255,255,255,0.06)", color: billingCycle === "annual" ? "#fff" : "var(--text2)" }}
            >
              Annual — save ~27%
            </button>
          </div>
        )}

        <div className="plan-grid">
          {PLANS.map((plan) => {
            const isCurrent = !isAdmin && tier === plan.id;
            const isDowngrade = !isAdmin && ((tier === "pro" && plan.id === "premium") || (tier !== "free" && plan.id === "free"));
            const isUpgrade = !isAdmin && !isCurrent && !isDowngrade;
            const isAnnual = billingCycle === "annual" && plan.id !== "free";
            const monthlyPrice = plan.id === "premium" ? planConfig?.premiumPrice : plan.id === "pro" ? planConfig?.proPrice : null;
            const annualPrice = plan.id === "premium" ? planConfig?.premiumAnnualPrice : plan.id === "pro" ? planConfig?.proAnnualPrice : null;
            const displayPrice = plan.id === "free" ? plan.price : `$${isAnnual ? (annualPrice ?? "…") : (monthlyPrice ?? "…")}`;
            const displayPeriod = plan.id === "free" ? plan.period : isAnnual ? "/ year" : "/ month";
            return (
              <div key={plan.id} className={`plan-card plan-${plan.id}${isCurrent ? " current" : ""}`}>
                {plan.popular && !isCurrent && !isAdmin && <div className="plan-popular-tag">Most Popular</div>}
                {isCurrent && <div className="plan-popular-tag" style={{ background: "var(--a3)", color: "#06060a" }}>Current Plan</div>}

                <div className="plan-name" style={{ color: plan.color }}>{plan.name}</div>
                <div className="plan-price" style={{ color: plan.color }}>{displayPrice}</div>
                <div className="plan-period">
                  {displayPeriod}
                  {isAnnual && monthlyPrice && annualPrice && (
                    <span style={{ display: "block", color: "var(--text3)", fontSize: 11, marginTop: 2 }}>
                      equivalent to ${(annualPrice / 12).toFixed(2)}/mo
                    </span>
                  )}
                </div>

                <ul className="plan-features">
                  {plan.features.map((f) => <li key={f}>{f}</li>)}
                  {plan.missing.map((f) => <li key={f} className="miss">{f}</li>)}
                </ul>

                {isAdmin ? (
                  <button className="plan-btn btn-current" disabled>✓ Included (Admin)</button>
                ) : isCurrent ? (
                  <button className="plan-btn btn-current" disabled>Current Plan</button>
                ) : isUpgrade ? (
                  <button
                    className={`plan-btn btn-upgrade-${plan.id}`}
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={!!upgrading}
                    style={plan.id === "pro" ? { background: "linear-gradient(135deg,#f59e0b,#ef4444)", color: "#fff" } : {}}
                  >
                    {upgrading === plan.id ? "Redirecting…" : `Upgrade to ${plan.name} →`}
                  </button>
                ) : (
                  <button className="plan-btn btn-downgrade" onClick={handleCancel} disabled={cancelling || plan.id !== "free" }>
                    Downgrade
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* ── PAY-AS-YOU-GO (only makes sense for free/trial accounts, not needed once subscribed) ── */}
        {!isAdmin && tier === "free" && planConfig && (
          <div className="acct-card" style={{ marginTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>Not ready to subscribe?</div>
              <div style={{ fontSize: 12, color: "var(--text2)" }}>
                Buy a one-time pack of {planConfig.creditPackSize} generations for ${planConfig.creditPackPrice} — no subscription, credits don't expire.
              </div>
            </div>
            <button className="plan-btn" style={{ width: "auto", padding: "10px 18px", background: "rgba(255,255,255,0.06)", color: "var(--text)" }} onClick={handleBuyCredits} disabled={buyingCredits}>
              {buyingCredits ? "Please wait…" : `Buy ${planConfig.creditPackSize} credits — $${planConfig.creditPackPrice}`}
            </button>
          </div>
        )}

        {/* ── CANCEL SUBSCRIPTION (only if paid, never for admin) ── */}
        {tier !== "free" && !isAdmin && (
          <>
            <div className="acct-section-title" style={{ marginTop: 40 }}>Danger Zone</div>
            <div className="danger-card">
              <div className="danger-info">
                <strong>Cancel subscription</strong>
                You'll keep {tier} access until the end of your current billing period. After that your account reverts to Free.
              </div>
              <button className="btn-danger" onClick={handleCancel} disabled={cancelling}>
                {cancelling ? "Cancelling…" : "Cancel subscription"}
              </button>
            </div>
          </>
        )}

        {/* ── LOG OUT ── */}
        <div style={{ marginTop: 48, paddingTop: 28, borderTop: "1px solid var(--border)" }}>
          <button
            onClick={handleLogout}
            style={{ background: "transparent", border: "1px solid var(--border2)", color: "var(--text2)", borderRadius: 12, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}
            onMouseEnter={(e) => e.target.style.borderColor = "var(--border3)"}
            onMouseLeave={(e) => e.target.style.borderColor = "var(--border2)"}
          >
            Log out
          </button>
        </div>
      </div>

      {/* ── TOAST ── */}
      {toast && (
        <div className={`acct-toast toast-${toast.type}`}>
          <span className="toast-icon">{toast.type === "success" ? "✅" : "❌"}</span>
          {toast.msg}
        </div>
      )}
    </>
  );
}
