import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { useAuthUser } from "../lib/useAuthUser";
import { supabase } from "../lib/supabaseClient";
import SiteNav from "../components/SiteNav";

const CSS = `
/* ── LAYOUT ── */
.ad-wrap{max-width:1100px;margin:0 auto;padding:48px 28px 100px;position:relative;z-index:1}
.ad-title{font-family:var(--fh);font-size:clamp(28px,4vw,40px);font-weight:700;letter-spacing:-1.5px;margin-bottom:4px}
.ad-sub{color:var(--text2);margin-bottom:36px;font-size:14px}
.ad-section-label{font-family:var(--fh);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:var(--text3);margin:36px 0 14px}

/* ── STAT GRID ── */
.ad-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:14px;margin-bottom:4px}
.ad-card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:22px 20px}
.ad-num{font-family:var(--fh);font-size:30px;font-weight:700;letter-spacing:-1px;margin-bottom:4px}
.ad-label{font-size:11px;color:var(--text3);font-weight:600;text-transform:uppercase;letter-spacing:0.5px}
.ad-trend{font-size:11px;margin-top:4px;font-weight:600}
.ad-trend.up{color:var(--a3)}
.ad-trend.down{color:#ef4444}

/* ── REVENUE CARDS ── */
.rev-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px;margin-bottom:4px}
.rev-card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:22px 20px;position:relative;overflow:hidden}
.rev-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;border-radius:16px 16px 0 0}
.rev-card.gross::before{background:var(--a1)}
.rev-card.net::before{background:var(--a3)}
.rev-card.cost::before{background:#f59e0b}
.rev-card.stripe::before{background:var(--a2)}
.rev-num{font-family:var(--fh);font-size:28px;font-weight:800;letter-spacing:-1px;margin-bottom:4px}
.rev-label{font-size:11px;color:var(--text3);font-weight:600;text-transform:uppercase;letter-spacing:0.5px}
.rev-sub{font-size:11px;color:var(--text3);margin-top:4px}

/* ── SECTION CARD ── */
.ad-section{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:24px;margin-bottom:20px}
.ad-section-title{font-family:var(--fh);font-size:15px;font-weight:700;margin-bottom:18px;display:flex;align-items:center;justify-content:space-between}

/* ── TABLE ── */
.ad-table{width:100%;border-collapse:collapse;font-size:13px}
.ad-table th{text-align:left;color:var(--text3);font-weight:600;text-transform:uppercase;font-size:11px;letter-spacing:0.5px;padding:8px 10px;border-bottom:1px solid var(--border)}
.ad-table td{padding:10px;border-bottom:1px solid var(--border);vertical-align:middle}
.ad-table tr:last-child td{border-bottom:none}
.ad-table tr:hover td{background:rgba(255,255,255,0.015)}
.ad-tier-select{background:rgba(255,255,255,0.04);border:1px solid var(--border2);border-radius:8px;color:var(--text);font-size:12px;padding:6px 8px;cursor:pointer}
.ad-msg-body{max-width:300px;white-space:pre-wrap;color:var(--text2);font-size:12px}
.ad-del-btn{background:transparent;border:1px solid var(--border2);color:var(--text3);border-radius:8px;padding:5px 10px;font-size:12px;cursor:pointer;transition:all 0.15s}
.ad-del-btn:hover{color:#fca5a5;border-color:rgba(239,68,68,0.4)}
.ad-empty{color:var(--text3);font-size:13px;padding:16px 0}
.ad-denied{background:linear-gradient(135deg,rgba(91,79,255,0.1),rgba(255,79,155,0.06));border:1px solid rgba(91,79,255,0.2);border-radius:16px;padding:32px;text-align:center;color:var(--text2)}

/* ── TIER PILL ── */
.tier-pill{display:inline-block;padding:3px 10px;border-radius:100px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px}
.tier-pill.free{background:rgba(153,152,176,0.15);color:var(--text2)}
.tier-pill.premium{background:rgba(91,79,255,0.15);color:#a097ff}
.tier-pill.pro{background:rgba(255,179,71,0.15);color:var(--a4)}

/* ── PROGRESS BAR ── */
.prog-bar{height:6px;background:rgba(255,255,255,0.06);border-radius:100px;overflow:hidden;margin-top:6px}
.prog-fill{height:100%;border-radius:100px}

/* ── TOOL USAGE LIST ── */
.tool-row{display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid var(--border)}
.tool-row:last-child{border-bottom:none}
.tool-name{font-size:13px;flex:1}
.tool-count{font-size:12px;color:var(--text2);min-width:40px;text-align:right}

/* ── CHART (CSS bar chart) ── */
.chart-wrap{display:flex;align-items:flex-end;gap:3px;height:80px;padding:0 4px}
.chart-bar{flex:1;border-radius:3px 3px 0 0;min-height:2px;transition:opacity 0.15s;cursor:default}
.chart-bar:hover{opacity:0.7}

/* ── TABS ── */
.ad-tabs{display:flex;gap:4px;margin-bottom:24px;background:var(--card);border:1px solid var(--border);border-radius:14px;padding:5px;width:fit-content}
.ad-tab{font-family:var(--fh);font-size:12px;font-weight:600;padding:8px 16px;border-radius:10px;border:none;cursor:pointer;background:transparent;color:var(--text2);transition:all 0.2s;letter-spacing:-0.2px}
.ad-tab.active{background:var(--a1);color:#fff}

/* ── PROFIT MARGIN ── */
.margin-badge{display:inline-block;padding:4px 12px;border-radius:100px;font-size:12px;font-weight:700;background:rgba(0,229,160,0.12);color:var(--a3)}

/* ── STATUS PILL (subscriptions) ── */
.status-pill{display:inline-block;padding:3px 10px;border-radius:100px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px}
.status-pill.active{background:rgba(0,229,160,0.15);color:var(--a3)}
.status-pill.past_due{background:rgba(245,158,11,0.15);color:#f59e0b}
.status-pill.canceled{background:rgba(239,68,68,0.15);color:#ef4444}
.status-pill.trialing{background:rgba(91,79,255,0.15);color:#a097ff}

/* ── SETTINGS FORM (fixed costs) ── */
.settings-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:14px;margin-bottom:14px}
.settings-field label{display:block;font-size:11px;color:var(--text3);font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px}
.settings-input{width:100%;background:rgba(255,255,255,0.04);border:1px solid var(--border2);border-radius:8px;color:var(--text);font-size:13px;padding:8px 10px;box-sizing:border-box}
.settings-save-btn{font-family:var(--fh);font-size:12px;font-weight:600;padding:8px 16px;border-radius:10px;border:none;cursor:pointer;background:var(--a1);color:#fff}
.settings-save-btn:disabled{opacity:0.6;cursor:default}

/* ── GROWTH PERIOD TOGGLE ── */
.growth-toggle{display:flex;gap:4px;margin-bottom:20px;background:var(--card);border:1px solid var(--border);border-radius:12px;padding:4px;width:fit-content}
.growth-toggle button{font-family:var(--fh);font-size:11px;font-weight:600;padding:6px 14px;border-radius:8px;border:none;cursor:pointer;background:transparent;color:var(--text2);transition:all 0.15s}
.growth-toggle button.active{background:var(--a1);color:#fff}
.growth-total{color:var(--text3);font-weight:500;font-size:12px}
`;

const TABS = ["Overview", "Revenue", "Plans", "Growth", "Payments", "Users", "Analytics", "Messages"];
const GROWTH_PERIODS = ["daily", "weekly", "monthly", "yearly"];

export default function Admin() {
  const router = useRouter();
  const { user, loading } = useAuthUser();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState(null);
  const [messages, setMessages] = useState(null);
  const [subscriptions, setSubscriptions] = useState(null);
  const [subSummary, setSubSummary] = useState(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("Overview");
  const [savingTier, setSavingTier] = useState(null);
  const [costsForm, setCostsForm] = useState({ vercel: "", supabase: "", other: "" });
  const [savingCosts, setSavingCosts] = useState(false);
  const [growthPeriod, setGrowthPeriod] = useState("weekly");
  const [planForm, setPlanForm] = useState({ premiumPrice: "", proPrice: "", freeDailyLimit: "" });
  const [savingPlan, setSavingPlan] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  async function loadAll() {
    if (!supabase) return;
    setError("");
    const { data: { session } } = await supabase.auth.getSession();
    const headers = { Authorization: `Bearer ${session?.access_token}` };
    const [statsRes, usersRes, messagesRes, subsRes] = await Promise.all([
      fetch("/api/admin/stats", { headers }).then((r) => r.json()),
      fetch("/api/admin/users", { headers }).then((r) => r.json()),
      fetch("/api/admin/messages", { headers }).then((r) => r.json()),
      fetch("/api/admin/subscriptions", { headers }).then((r) => r.json()),
    ]);
    if (!statsRes.success) { setError(statsRes.error); return; }
    setStats(statsRes.data);
    setUsers(usersRes.data || []);
    setMessages(messagesRes.data || []);
    setSubscriptions(subsRes.data || []);
    setSubSummary(subsRes.summary || null);
    const fc = statsRes.data?.revenue?.fixedCosts || { vercel: 0, supabase: 0, other: 0 };
    setCostsForm({ vercel: String(fc.vercel || ""), supabase: String(fc.supabase || ""), other: String(fc.other || "") });
    const pc = statsRes.data?.planConfig || { premiumPrice: 9, proPrice: 29, freeDailyLimit: 10 };
    setPlanForm({ premiumPrice: String(pc.premiumPrice), proPrice: String(pc.proPrice), freeDailyLimit: String(pc.freeDailyLimit) });
  }

  useEffect(() => { if (user) loadAll(); }, [user?.id]);

  async function changeTier(userId, tier) {
    setSavingTier(userId);
    const { data: { session } } = await supabase.auth.getSession();
    const r = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
      body: JSON.stringify({ userId, tier }),
    });
    const d = await r.json();
    setSavingTier(null);
    if (!d.success) { alert(d.error); return; }
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, subscription_tier: tier } : u));
  }

  async function saveFixedCosts() {
    setSavingCosts(true);
    const { data: { session } } = await supabase.auth.getSession();
    const r = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
      body: JSON.stringify(costsForm),
    });
    const d = await r.json();
    setSavingCosts(false);
    if (!d.success) { alert(d.error); return; }
    loadAll();
  }

  async function savePlanConfig() {
    setSavingPlan(true);
    const { data: { session } } = await supabase.auth.getSession();
    const r = await fetch("/api/admin/settings?key=plan_config", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
      body: JSON.stringify(planForm),
    });
    const d = await r.json();
    setSavingPlan(false);
    if (!d.success) { alert(d.error); return; }
    loadAll();
  }

  async function deleteMessage(id) {
    if (!confirm("Delete this message?")) return;
    const { data: { session } } = await supabase.auth.getSession();
    await fetch(`/api/admin/messages/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${session?.access_token}` } });
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }

  if (loading || !user) return null;

  if (error) {
    return (
      <>
        <Head><title>Admin — SocialToolkit</title><style dangerouslySetInnerHTML={{ __html: CSS }} /></Head>
        <SiteNav />
        <div className="ad-wrap"><div className="ad-denied"><p style={{ fontSize: 18, marginBottom: 8 }}>🔒 Access Denied</p><p>{error}</p></div></div>
      </>
    );
  }

  const rev = stats?.revenue || {};
  const plan = stats?.planConfig || { premiumPrice: 9, proPrice: 29, freeDailyLimit: 10 };
  const margin = rev.gross > 0 ? Math.round((rev.net / rev.gross) * 100) : 0;
  const maxBar = stats?.last30Days ? Math.max(...stats.last30Days.map((d) => d.count), 1) : 1;
  const topTools = stats?.toolCounts
    ? Object.entries(stats.toolCounts).sort((a, b) => b[1] - a[1]).slice(0, 8)
    : [];
  const totalToolUses = topTools.reduce((s, [, c]) => s + c, 0);

  function renderGrowthChart(title, series, key, { color = "var(--a1)", money = false } = {}) {
    if (!series || series.length === 0) return null;
    const max = Math.max(...series.map((d) => d[key]), 1);
    const total = series.reduce((s, d) => s + d[key], 0);
    return (
      <div className="ad-section">
        <div className="ad-section-title">
          <span>{title}</span>
          <span className="growth-total">{money ? `$${total.toFixed(2)}` : total.toLocaleString()} total</span>
        </div>
        <div className="chart-wrap">
          {series.map((d, i) => (
            <div
              key={i}
              className="chart-bar"
              title={`${d.label}: ${money ? "$" + d[key].toFixed(2) : d[key]}`}
              style={{
                height: `${(Math.max(d[key], 0) / max) * 100}%`,
                background: d[key] < 0 ? "#ef4444" : d[key] > 0 ? color : "rgba(255,255,255,0.06)",
                opacity: d[key] > 0 ? 0.7 + (d[key] / max) * 0.3 : 1,
              }}
            />
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text3)", marginTop: 6 }}>
          <span>{series[0].label}</span><span>{series[series.length - 1].label}</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Admin — SocialToolkit</title>
        <meta name="robots" content="noindex, nofollow" />
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
      </Head>
      <SiteNav />

      <div className="ad-wrap">
        <h1 className="ad-title">Admin Dashboard</h1>
        <p className="ad-sub">Revenue, payments, analytics, users and messages — all in one place.</p>

        {/* TABS */}
        <div className="ad-tabs">
          {TABS.map((t) => (
            <button key={t} className={`ad-tab${activeTab === t ? " active" : ""}`} onClick={() => setActiveTab(t)}>{t}</button>
          ))}
        </div>

        {!stats && <p style={{ color: "var(--text3)", fontSize: 14 }}>Loading...</p>}

        {stats && (
          <>
            {/* ── OVERVIEW TAB ── */}
            {activeTab === "Overview" && (
              <>
                <div className="ad-section-label">Key metrics</div>
                <div className="ad-grid">
                  <div className="ad-card">
                    <div className="ad-num" style={{ color: "var(--a1l)" }}>{stats.totalUsers}</div>
                    <div className="ad-label">Total users</div>
                    <div className="ad-trend up">+{stats.newUsersThisWeek} this week</div>
                  </div>
                  <div className="ad-card">
                    <div className="ad-num" style={{ color: "#a097ff" }}>{stats.tierBreakdown.premium}</div>
                    <div className="ad-label">Premium users</div>
                    <div className="ad-trend up">${(stats.tierBreakdown.premium * plan.premiumPrice).toLocaleString()}/mo</div>
                  </div>
                  <div className="ad-card">
                    <div className="ad-num" style={{ color: "var(--a4)" }}>{stats.tierBreakdown.pro}</div>
                    <div className="ad-label">Pro users</div>
                    <div className="ad-trend up">${(stats.tierBreakdown.pro * plan.proPrice).toLocaleString()}/mo</div>
                  </div>
                  <div className="ad-card">
                    <div className="ad-num" style={{ color: "var(--a3)" }}>${rev.net?.toFixed(0) || "0"}</div>
                    <div className="ad-label">Net profit / mo</div>
                    <div className="ad-trend up">{margin}% margin</div>
                  </div>
                  <div className="ad-card">
                    <div className="ad-num" style={{ color: "var(--a2)" }}>{stats.totalGenerations.toLocaleString()}</div>
                    <div className="ad-label">Total generations</div>
                    <div className="ad-trend up">+{stats.generationsThisWeek} this week</div>
                  </div>
                  <div className="ad-card">
                    <div className="ad-num" style={{ color: "var(--text2)" }}>{stats.messageCount}</div>
                    <div className="ad-label">Contact messages</div>
                  </div>
                </div>

                <div className="ad-section-label">Tier breakdown</div>
                <div className="ad-section">
                  {[
                    { label: "Free", count: stats.tierBreakdown.free, color: "var(--text3)", cls: "free" },
                    { label: "Premium", count: stats.tierBreakdown.premium, color: "#a097ff", cls: "premium" },
                    { label: "Pro", count: stats.tierBreakdown.pro, color: "var(--a4)", cls: "pro" },
                  ].map(({ label, count, color, cls }) => (
                    <div key={label} style={{ marginBottom: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 13 }}><span className={`tier-pill ${cls}`}>{label}</span></span>
                        <span style={{ fontSize: 13, color: "var(--text2)" }}>{count} users ({stats.totalUsers ? Math.round((count / stats.totalUsers) * 100) : 0}%)</span>
                      </div>
                      <div className="prog-bar">
                        <div className="prog-fill" style={{ width: `${stats.totalUsers ? (count / stats.totalUsers) * 100 : 0}%`, background: color }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="ad-section-label">Growth &amp; engagement</div>
                <div className="ad-grid">
                  <div className="ad-card">
                    <div className="ad-num" style={{ color: "var(--a1l)" }}>{stats.newUsersThisMonth}</div>
                    <div className="ad-label">New users this month</div>
                  </div>
                  <div className="ad-card">
                    <div className="ad-num" style={{ color: "var(--a3)" }}>{stats.activeUsers}</div>
                    <div className="ad-label">Active users (30d)</div>
                  </div>
                  <div className="ad-card">
                    <div className="ad-num" style={{ color: "var(--text2)" }}>{stats.inactiveUsers}</div>
                    <div className="ad-label">Inactive users</div>
                  </div>
                  <div className="ad-card">
                    <div className="ad-num" style={{ color: "#f59e0b" }}>{stats.rateLimitHits?.thisWeek ?? 0}</div>
                    <div className="ad-label">Rate-limit hits (7d)</div>
                    <div className="ad-trend" style={{ color: "var(--text3)" }}>Free users maxing out — upgrade signal</div>
                  </div>
                  <div className="ad-card">
                    <div className="ad-num" style={{ color: "#a097ff" }}>{stats.planChanges?.newPaidSubsThisMonth ?? 0}</div>
                    <div className="ad-label">New paid subs this month</div>
                  </div>
                  <div className="ad-card">
                    <div className="ad-num" style={{ color: "var(--a4)" }}>{stats.planChanges?.conversionRate ?? 0}%</div>
                    <div className="ad-label">Signup → paid conversion</div>
                    <div className="ad-trend down">{stats.planChanges?.canceledThisMonth ?? 0} canceled this month</div>
                  </div>
                </div>
              </>
            )}

            {/* ── REVENUE TAB ── */}
            {activeTab === "Revenue" && (
              <>
                <div className="ad-section-label">This month's revenue</div>
                <div className="rev-grid">
                  <div className="rev-card gross">
                    <div className="rev-num" style={{ color: "var(--a1l)" }}>${rev.gross?.toFixed(2) || "0.00"}</div>
                    <div className="rev-label">Gross revenue</div>
                    <div className="rev-sub">Before fees &amp; costs</div>
                  </div>
                  <div className="rev-card stripe">
                    <div className="rev-num" style={{ color: "var(--a2)" }}>-${rev.stripeFees?.toFixed(2) || "0.00"}</div>
                    <div className="rev-label">Stripe fees</div>
                    <div className="rev-sub">2.9% + $0.30 per charge</div>
                  </div>
                  <div className="rev-card cost">
                    <div className="rev-num" style={{ color: "#f59e0b" }}>-${rev.geminiCost?.toFixed(2) || "0.00"}</div>
                    <div className="rev-label">Gemini AI cost</div>
                    <div className="rev-sub">{stats.generationsThisMonth} generations × $0.001</div>
                  </div>
                  <div className="rev-card net">
                    <div className="rev-num" style={{ color: "var(--a3)" }}>${rev.net?.toFixed(2) || "0.00"}</div>
                    <div className="rev-label">Gross margin</div>
                    <div className="rev-sub"><span className="margin-badge">{margin}% margin</span></div>
                  </div>
                  <div className="rev-card">
                    <div className="rev-num" style={{ color: rev.trueNet >= 0 ? "var(--a3)" : "#ef4444" }}>${rev.trueNet?.toFixed(2) ?? "0.00"}</div>
                    <div className="rev-label">True net profit</div>
                    <div className="rev-sub">After ${rev.fixedCostsTotal?.toFixed(2) || "0.00"} fixed hosting costs</div>
                  </div>
                </div>

                <div className="ad-section-label">Fixed monthly costs</div>
                <div className="ad-section">
                  <p style={{ fontSize: 12, color: "var(--text3)", marginBottom: 16 }}>
                    Vercel/Supabase plan costs aren't available from any API — enter what you're actually paying so "True net profit" above is accurate.
                  </p>
                  <div className="settings-grid">
                    <div className="settings-field">
                      <label>Vercel ($/mo)</label>
                      <input
                        type="number"
                        className="settings-input"
                        value={costsForm.vercel}
                        onChange={(e) => setCostsForm((f) => ({ ...f, vercel: e.target.value }))}
                      />
                    </div>
                    <div className="settings-field">
                      <label>Supabase ($/mo)</label>
                      <input
                        type="number"
                        className="settings-input"
                        value={costsForm.supabase}
                        onChange={(e) => setCostsForm((f) => ({ ...f, supabase: e.target.value }))}
                      />
                    </div>
                    <div className="settings-field">
                      <label>Other ($/mo)</label>
                      <input
                        type="number"
                        className="settings-input"
                        value={costsForm.other}
                        onChange={(e) => setCostsForm((f) => ({ ...f, other: e.target.value }))}
                      />
                    </div>
                  </div>
                  <button className="settings-save-btn" disabled={savingCosts} onClick={saveFixedCosts}>
                    {savingCosts ? "Saving..." : "Save costs"}
                  </button>
                </div>

                <div className="ad-section-label">Revenue breakdown</div>
                <div className="ad-section">
                  <table className="ad-table">
                    <thead><tr><th>Plan</th><th>Users</th><th>Price</th><th>Gross</th><th>After Stripe fee</th></tr></thead>
                    <tbody>
                      <tr>
                        <td><span className="tier-pill premium">Premium</span></td>
                        <td>{stats.tierBreakdown.premium}</td>
                        <td>${plan.premiumPrice}/mo</td>
                        <td>${rev.premium?.toFixed(2) || "0.00"}</td>
                        <td>${(stats.tierBreakdown.premium * (plan.premiumPrice - (plan.premiumPrice * 0.029 + 0.30))).toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td><span className="tier-pill pro">Pro</span></td>
                        <td>{stats.tierBreakdown.pro}</td>
                        <td>${plan.proPrice}/mo</td>
                        <td>${rev.pro?.toFixed(2) || "0.00"}</td>
                        <td>${(stats.tierBreakdown.pro * (plan.proPrice - (plan.proPrice * 0.029 + 0.30))).toFixed(2)}</td>
                      </tr>
                      <tr style={{ fontWeight: 700 }}>
                        <td>Total</td>
                        <td>{stats.tierBreakdown.premium + stats.tierBreakdown.pro}</td>
                        <td>—</td>
                        <td>${rev.gross?.toFixed(2) || "0.00"}</td>
                        <td style={{ color: "var(--a3)" }}>${rev.net?.toFixed(2) || "0.00"}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="ad-section-label">Growth projection (estimates)</div>
                <div className="ad-section">
                  <table className="ad-table">
                    <thead><tr><th>Paid users</th><th>Mix</th><th>Gross/mo</th><th>Net profit/mo</th></tr></thead>
                    <tbody>
                      {[
                        { paid: 50, p: 40, pro: 10 },
                        { paid: 100, p: 75, pro: 25 },
                        { paid: 250, p: 190, pro: 60 },
                        { paid: 500, p: 375, pro: 125 },
                        { paid: 1000, p: 750, pro: 250 },
                      ].map(({ paid, p, pro }) => {
                        const g = p * plan.premiumPrice + pro * plan.proPrice;
                        const fees = (p * (plan.premiumPrice * 0.029 + 0.30)) + (pro * (plan.proPrice * 0.029 + 0.30));
                        const ai = paid * 50 * 0.001;
                        return (
                          <tr key={paid}>
                            <td style={{ fontWeight: 600 }}>{paid}</td>
                            <td style={{ color: "var(--text3)" }}>{p} Premium + {pro} Pro</td>
                            <td>${g.toLocaleString()}</td>
                            <td style={{ color: "var(--a3)", fontWeight: 700 }}>${(g - fees - ai).toFixed(0)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* ── PLANS TAB ── */}
            {activeTab === "Plans" && (
              <>
                <div className="ad-section-label">Plan pricing &amp; limits</div>
                <div className="ad-section">
                  <p style={{ fontSize: 12, color: "var(--text3)", marginBottom: 16 }}>
                    These values drive the revenue/profit math and the free-tier daily generation cap across the app.
                    They do <strong>not</strong> change what Stripe actually charges — updating the Premium/Pro price here
                    is for internal reporting only. To change real billing, create a new Price in Stripe and update the
                    <code style={{ margin: "0 4px" }}>STRIPE_PRICE_PREMIUM</code> / <code style={{ margin: "0 4px" }}>STRIPE_PRICE_PRO</code> env vars.
                  </p>
                  <div className="settings-grid">
                    <div className="settings-field">
                      <label>Premium price ($/mo)</label>
                      <input
                        type="number"
                        className="settings-input"
                        value={planForm.premiumPrice}
                        onChange={(e) => setPlanForm((f) => ({ ...f, premiumPrice: e.target.value }))}
                      />
                    </div>
                    <div className="settings-field">
                      <label>Pro price ($/mo)</label>
                      <input
                        type="number"
                        className="settings-input"
                        value={planForm.proPrice}
                        onChange={(e) => setPlanForm((f) => ({ ...f, proPrice: e.target.value }))}
                      />
                    </div>
                    <div className="settings-field">
                      <label>Free daily generation limit</label>
                      <input
                        type="number"
                        className="settings-input"
                        value={planForm.freeDailyLimit}
                        onChange={(e) => setPlanForm((f) => ({ ...f, freeDailyLimit: e.target.value }))}
                      />
                    </div>
                  </div>
                  <button className="settings-save-btn" disabled={savingPlan} onClick={savePlanConfig}>
                    {savingPlan ? "Saving..." : "Save plan settings"}
                  </button>
                </div>

                <div className="ad-section-label">Current plans</div>
                <div className="ad-section" style={{ padding: 0, overflow: "hidden" }}>
                  <table className="ad-table">
                    <thead><tr><th style={{ paddingLeft: 20 }}>Plan</th><th>Price</th><th>Subscribers</th><th>Daily generation limit</th></tr></thead>
                    <tbody>
                      <tr>
                        <td style={{ paddingLeft: 20 }}><span className="tier-pill free">Free</span></td>
                        <td>$0/mo</td>
                        <td>{stats.tierBreakdown.free}</td>
                        <td>{plan.freeDailyLimit}/day</td>
                      </tr>
                      <tr>
                        <td style={{ paddingLeft: 20 }}><span className="tier-pill premium">Premium</span></td>
                        <td>${plan.premiumPrice}/mo</td>
                        <td>{stats.tierBreakdown.premium}</td>
                        <td>Unlimited</td>
                      </tr>
                      <tr>
                        <td style={{ paddingLeft: 20 }}><span className="tier-pill pro">Pro</span></td>
                        <td>${plan.proPrice}/mo</td>
                        <td>{stats.tierBreakdown.pro}</td>
                        <td>Unlimited</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* ── GROWTH TAB ── */}
            {activeTab === "Growth" && (
              <>
                <div className="ad-section-label">New users, usage &amp; revenue over time</div>
                <div className="growth-toggle">
                  {GROWTH_PERIODS.map((p) => (
                    <button key={p} className={growthPeriod === p ? "active" : ""} onClick={() => setGrowthPeriod(p)}>
                      {p[0].toUpperCase() + p.slice(1)}
                    </button>
                  ))}
                </div>

                {!stats.revenueTrackingSince && (
                  <p style={{ color: "var(--text3)", fontSize: 12, marginBottom: 16 }}>
                    Revenue history started tracking today — the revenue and profit charts below will fill in as new payments come in through Stripe.
                  </p>
                )}

                {renderGrowthChart("New users", stats.growth?.newUsers?.[growthPeriod], "count", { color: "var(--a1)" })}
                {renderGrowthChart("Usage (generations)", stats.growth?.usage?.[growthPeriod], "count", { color: "var(--a2)" })}
                {renderGrowthChart("Gross revenue", stats.growth?.revenue?.[growthPeriod], "gross", { color: "var(--a1l)", money: true })}
                {renderGrowthChart("True net profit", stats.growth?.revenue?.[growthPeriod], "trueNet", { color: "var(--a3)", money: true })}
              </>
            )}

            {/* ── PAYMENTS TAB ── */}
            {activeTab === "Payments" && (
              <>
                <div className="ad-section-label">Subscription status</div>
                <div className="ad-grid">
                  <div className="ad-card">
                    <div className="ad-num" style={{ color: "var(--a3)" }}>{subSummary?.active ?? 0}</div>
                    <div className="ad-label">Active</div>
                  </div>
                  <div className="ad-card">
                    <div className="ad-num" style={{ color: "#f59e0b" }}>{subSummary?.pastDue ?? 0}</div>
                    <div className="ad-label">Past due</div>
                  </div>
                  <div className="ad-card">
                    <div className="ad-num" style={{ color: "#ef4444" }}>{subSummary?.canceled ?? 0}</div>
                    <div className="ad-label">Canceled</div>
                  </div>
                  <div className="ad-card">
                    <div className="ad-num" style={{ color: "var(--text2)" }}>{subSummary?.total ?? 0}</div>
                    <div className="ad-label">Total subscriptions</div>
                  </div>
                </div>

                <div className="ad-section-label">All subscriptions ({subscriptions?.length || 0})</div>
                <div className="ad-section" style={{ padding: 0, overflow: "hidden" }}>
                  {!subscriptions || subscriptions.length === 0 ? (
                    <div className="ad-empty" style={{ padding: 24 }}>No subscriptions yet.</div>
                  ) : (
                    <table className="ad-table">
                      <thead><tr><th style={{ paddingLeft: 20 }}>Email</th><th>Plan</th><th>Status</th><th>Started</th><th>Last updated</th></tr></thead>
                      <tbody>
                        {subscriptions.map((s) => (
                          <tr key={s.id}>
                            <td style={{ paddingLeft: 20 }}>{s.email}</td>
                            <td><span className={`tier-pill ${s.tier}`}>{s.tier}</span></td>
                            <td><span className={`status-pill ${s.status}`}>{s.status?.replace("_", " ")}</span></td>
                            <td style={{ color: "var(--text3)" }}>{new Date(s.created_at).toLocaleDateString()}</td>
                            <td style={{ color: "var(--text3)" }}>{s.updated_at ? new Date(s.updated_at).toLocaleDateString() : "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </>
            )}

            {/* ── USERS TAB ── */}
            {activeTab === "Users" && (
              <>
                <div className="ad-section-label">All users ({users?.length || 0})</div>
                <div className="ad-section" style={{ padding: 0, overflow: "hidden" }}>
                  {!users || users.length === 0 ? (
                    <div className="ad-empty" style={{ padding: 24 }}>No users yet.</div>
                  ) : (
                    <table className="ad-table">
                      <thead><tr><th style={{ paddingLeft: 20 }}>Email</th><th>Signed up</th><th>Plan</th><th>Change plan</th></tr></thead>
                      <tbody>
                        {users.map((u) => (
                          <tr key={u.id}>
                            <td style={{ paddingLeft: 20 }}>{u.email}</td>
                            <td style={{ color: "var(--text3)" }}>{new Date(u.created_at).toLocaleDateString()}</td>
                            <td><span className={`tier-pill ${u.subscription_tier}`}>{u.subscription_tier}</span></td>
                            <td>
                              <select
                                className="ad-tier-select"
                                value={u.subscription_tier}
                                disabled={savingTier === u.id}
                                onChange={(e) => changeTier(u.id, e.target.value)}
                              >
                                <option value="free">free</option>
                                <option value="premium">premium</option>
                                <option value="pro">pro</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </>
            )}

            {/* ── ANALYTICS TAB ── */}
            {activeTab === "Analytics" && (
              <>
                <div className="ad-section-label">Generations — last 30 days</div>
                <div className="ad-section">
                  <div style={{ marginBottom: 8, fontSize: 13, color: "var(--text2)" }}>
                    Total this month: <strong style={{ color: "var(--text)" }}>{stats.generationsThisMonth.toLocaleString()}</strong>
                    &nbsp;·&nbsp; This week: <strong style={{ color: "var(--text)" }}>{stats.generationsThisWeek.toLocaleString()}</strong>
                  </div>
                  <div className="chart-wrap">
                    {(stats.last30Days || []).map((d, i) => (
                      <div
                        key={i}
                        className="chart-bar"
                        title={`${d.date}: ${d.count} generations`}
                        style={{
                          height: `${(d.count / maxBar) * 100}%`,
                          background: d.count > 0 ? "var(--a1)" : "rgba(255,255,255,0.06)",
                          opacity: d.count > 0 ? 0.7 + (d.count / maxBar) * 0.3 : 1,
                        }}
                      />
                    ))}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text3)", marginTop: 6 }}>
                    <span>30 days ago</span><span>Today</span>
                  </div>
                </div>

                <div className="ad-section-label">Tool usage breakdown</div>
                <div className="ad-section">
                  {topTools.length === 0 ? (
                    <div className="ad-empty">No usage data yet.</div>
                  ) : topTools.map(([tool, count]) => (
                    <div key={tool} className="tool-row">
                      <div className="tool-name">{tool}</div>
                      <div style={{ flex: 3 }}>
                        <div className="prog-bar">
                          <div className="prog-fill" style={{ width: `${(count / totalToolUses) * 100}%`, background: "var(--a1)" }} />
                        </div>
                      </div>
                      <div className="tool-count">{count.toLocaleString()}</div>
                      <div style={{ fontSize: 11, color: "var(--text3)", minWidth: 36, textAlign: "right" }}>
                        {Math.round((count / totalToolUses) * 100)}%
                      </div>
                    </div>
                  ))}
                </div>

                <div className="ad-section-label">New users — last 8 weeks</div>
                <div className="ad-section">
                  <table className="ad-table">
                    <thead><tr><th>Week starting</th><th>New signups</th></tr></thead>
                    <tbody>
                      {(stats.usersByWeek || []).map((w) => (
                        <tr key={w.week}>
                          <td>{w.week}</td>
                          <td style={{ color: w.count > 0 ? "var(--a3)" : "var(--text3)", fontWeight: w.count > 0 ? 600 : 400 }}>
                            {w.count > 0 ? `+${w.count}` : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="ad-section-label">New users — last 6 months</div>
                <div className="ad-section">
                  <table className="ad-table">
                    <thead><tr><th>Month</th><th>New signups</th></tr></thead>
                    <tbody>
                      {(stats.usersByMonth || []).map((m) => (
                        <tr key={m.month}>
                          <td>{m.month}</td>
                          <td style={{ color: m.count > 0 ? "var(--a3)" : "var(--text3)", fontWeight: m.count > 0 ? 600 : 400 }}>
                            {m.count > 0 ? `+${m.count}` : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="ad-section-label">Rate-limit hits — free users maxing out (upgrade signal)</div>
                <div className="ad-section">
                  <div style={{ marginBottom: 12, fontSize: 13, color: "var(--text2)" }}>
                    This week: <strong style={{ color: "var(--text)" }}>{stats.rateLimitHits?.thisWeek ?? 0}</strong>
                    &nbsp;·&nbsp; This month: <strong style={{ color: "var(--text)" }}>{stats.rateLimitHits?.thisMonth ?? 0}</strong>
                  </div>
                  {!stats.rateLimitHits?.topUsers || stats.rateLimitHits.topUsers.length === 0 ? (
                    <div className="ad-empty">No one has hit the free daily limit recently.</div>
                  ) : (
                    <table className="ad-table">
                      <thead><tr><th>Email</th><th>Times hit limit</th></tr></thead>
                      <tbody>
                        {stats.rateLimitHits.topUsers.map((h) => (
                          <tr key={h.userId}>
                            <td>{users?.find((u) => u.id === h.userId)?.email || h.userId}</td>
                            <td style={{ fontWeight: 600, color: "#f59e0b" }}>{h.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </>
            )}

            {/* ── MESSAGES TAB ── */}
            {activeTab === "Messages" && (
              <>
                <div className="ad-section-label">Contact messages ({messages?.length || 0})</div>
                <div className="ad-section" style={{ padding: 0, overflow: "hidden" }}>
                  {!messages || messages.length === 0 ? (
                    <div className="ad-empty" style={{ padding: 24 }}>No messages yet.</div>
                  ) : (
                    <table className="ad-table">
                      <thead><tr><th style={{ paddingLeft: 20 }}>From</th><th>Subject</th><th>Message</th><th>Sent</th><th></th></tr></thead>
                      <tbody>
                        {messages.map((m) => (
                          <tr key={m.id}>
                            <td style={{ paddingLeft: 20 }}>
                              <div style={{ fontWeight: 600 }}>{m.name}</div>
                              <div style={{ color: "var(--text3)", fontSize: 12 }}>{m.email}</div>
                            </td>
                            <td style={{ fontWeight: 500 }}>{m.subject}</td>
                            <td className="ad-msg-body">{m.message}</td>
                            <td style={{ color: "var(--text3)", fontSize: 12, whiteSpace: "nowrap" }}>{new Date(m.created_at).toLocaleString()}</td>
                            <td><button className="ad-del-btn" onClick={() => deleteMessage(m.id)}>Delete</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}
