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
`;

const TABS = ["Overview", "Revenue", "Users", "Analytics", "Messages"];

export default function Admin() {
  const router = useRouter();
  const { user, loading } = useAuthUser();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState(null);
  const [messages, setMessages] = useState(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("Overview");
  const [savingTier, setSavingTier] = useState(null);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  async function loadAll() {
    if (!supabase) return;
    const { data: { session } } = await supabase.auth.getSession();
    const headers = { Authorization: `Bearer ${session?.access_token}` };
    const [statsRes, usersRes, messagesRes] = await Promise.all([
      fetch("/api/admin/stats", { headers }).then((r) => r.json()),
      fetch("/api/admin/users", { headers }).then((r) => r.json()),
      fetch("/api/admin/messages", { headers }).then((r) => r.json()),
    ]);
    if (!statsRes.success) { setError(statsRes.error); return; }
    setStats(statsRes.data);
    setUsers(usersRes.data || []);
    setMessages(messagesRes.data || []);
  }

  useEffect(() => { if (user) loadAll(); }, [user]);

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
        <Head><title>Admin — SocialToolkit</title><link rel="stylesheet" href="/css/site.css" /><style dangerouslySetInnerHTML={{ __html: CSS }} /></Head>
        <SiteNav />
        <div className="ad-wrap"><div className="ad-denied"><p style={{ fontSize: 18, marginBottom: 8 }}>🔒 Access Denied</p><p>{error}</p></div></div>
      </>
    );
  }

  const rev = stats?.revenue || {};
  const margin = rev.gross > 0 ? Math.round((rev.net / rev.gross) * 100) : 0;
  const maxBar = stats?.last30Days ? Math.max(...stats.last30Days.map((d) => d.count), 1) : 1;
  const topTools = stats?.toolCounts
    ? Object.entries(stats.toolCounts).sort((a, b) => b[1] - a[1]).slice(0, 8)
    : [];
  const totalToolUses = topTools.reduce((s, [, c]) => s + c, 0);

  return (
    <>
      <Head>
        <title>Admin — SocialToolkit</title>
        <meta name="robots" content="noindex, nofollow" />
        <link rel="stylesheet" href="/css/site.css" />
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
      </Head>
      <SiteNav />

      <div className="ad-wrap">
        <h1 className="ad-title">Admin Dashboard</h1>
        <p className="ad-sub">Revenue, analytics, users and messages — all in one place.</p>

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
                    <div className="ad-trend up">${(stats.tierBreakdown.premium * 9).toLocaleString()}/mo</div>
                  </div>
                  <div className="ad-card">
                    <div className="ad-num" style={{ color: "var(--a4)" }}>{stats.tierBreakdown.pro}</div>
                    <div className="ad-label">Pro users</div>
                    <div className="ad-trend up">${(stats.tierBreakdown.pro * 29).toLocaleString()}/mo</div>
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
                    <div className="rev-label">Net profit</div>
                    <div className="rev-sub"><span className="margin-badge">{margin}% margin</span></div>
                  </div>
                </div>

                <div className="ad-section-label">Revenue breakdown</div>
                <div className="ad-section">
                  <table className="ad-table">
                    <thead><tr><th>Plan</th><th>Users</th><th>Price</th><th>Gross</th><th>After Stripe fee</th></tr></thead>
                    <tbody>
                      <tr>
                        <td><span className="tier-pill premium">Premium</span></td>
                        <td>{stats.tierBreakdown.premium}</td>
                        <td>$9/mo</td>
                        <td>${rev.premium?.toFixed(2) || "0.00"}</td>
                        <td>${(stats.tierBreakdown.premium * (9 - (9 * 0.029 + 0.30))).toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td><span className="tier-pill pro">Pro</span></td>
                        <td>{stats.tierBreakdown.pro}</td>
                        <td>$29/mo</td>
                        <td>${rev.pro?.toFixed(2) || "0.00"}</td>
                        <td>${(stats.tierBreakdown.pro * (29 - (29 * 0.029 + 0.30))).toFixed(2)}</td>
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
                        const g = p * 9 + pro * 29;
                        const fees = (p * (9 * 0.029 + 0.30)) + (pro * (29 * 0.029 + 0.30));
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


export default function Admin() {
  const router = useRouter();
  const { user, loading } = useAuthUser();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState(null);
  const [messages, setMessages] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  async function loadAll() {
    if (!supabase) return;
    const { data: { session } } = await supabase.auth.getSession();
    const headers = { Authorization: `Bearer ${session?.access_token}` };

    const [statsRes, usersRes, messagesRes] = await Promise.all([
      fetch("/api/admin/stats", { headers }).then((r) => r.json()),
      fetch("/api/admin/users", { headers }).then((r) => r.json()),
      fetch("/api/admin/messages", { headers }).then((r) => r.json()),
    ]);

    if (!statsRes.success) {
      setError(statsRes.error);
      return;
    }
    setStats(statsRes.data);
    setUsers(usersRes.data || []);
    setMessages(messagesRes.data || []);
  }

  useEffect(() => {
    if (user) loadAll();
  }, [user]);

  async function changeTier(userId, tier) {
    const { data: { session } } = await supabase.auth.getSession();
    const r = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
      body: JSON.stringify({ userId, tier }),
    });
    const d = await r.json();
    if (!d.success) {
      alert(d.error);
      return;
    }
    loadAll();
  }

  async function deleteMessage(id) {
    if (!confirm("Delete this message?")) return;
    const { data: { session } } = await supabase.auth.getSession();
    await fetch(`/api/admin/messages/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
    loadAll();
  }

  if (loading || !user) return null;

  return (
    <>
      <Head>
        <title>Admin — SocialToolkit</title>
        <meta name="robots" content="noindex, nofollow" />
        <link rel="stylesheet" href="/css/site.css" />
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
      </Head>
      <SiteNav />

      <div className="ad-wrap">
        <h1 className="ad-title">Admin Dashboard</h1>
        <p className="ad-sub">Site-wide stats, users and contact messages.</p>

        {error && (
          <div className="ad-denied">
            <p>{error}</p>
          </div>
        )}

        {stats && (
          <>
            <div className="ad-grid">
              <div className="ad-card">
                <div className="ad-num">{stats.totalUsers}</div>
                <div className="ad-label">Total users</div>
              </div>
              <div className="ad-card">
                <div className="ad-num">{stats.newUsersThisWeek}</div>
                <div className="ad-label">New this week</div>
              </div>
              <div className="ad-card">
                <div className="ad-num">{stats.totalGenerations}</div>
                <div className="ad-label">Total generations</div>
              </div>
              <div className="ad-card">
                <div className="ad-num">{stats.generationsThisMonth}</div>
                <div className="ad-label">This month</div>
              </div>
              <div className="ad-card">
                <div className="ad-num">{stats.messageCount}</div>
                <div className="ad-label">Contact messages</div>
              </div>
            </div>

            <div className="ad-section">
              <div className="ad-section-title">
                Tier breakdown — Free: {stats.tierBreakdown.free} · Premium: {stats.tierBreakdown.premium} · Pro: {stats.tierBreakdown.pro}
              </div>
            </div>

            <div className="ad-section">
              <div className="ad-section-title">Users ({users?.length || 0})</div>
              {!users || users.length === 0 ? (
                <div className="ad-empty">No users yet.</div>
              ) : (
                <table className="ad-table">
                  <thead>
                    <tr><th>Email</th><th>Signed up</th><th>Tier</th></tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td>{u.email}</td>
                        <td>{new Date(u.created_at).toLocaleDateString()}</td>
                        <td>
                          <select
                            className="ad-tier-select"
                            value={u.subscription_tier}
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

            <div className="ad-section">
              <div className="ad-section-title">Contact messages ({messages?.length || 0})</div>
              {!messages || messages.length === 0 ? (
                <div className="ad-empty">No messages yet.</div>
              ) : (
                <table className="ad-table">
                  <thead>
                    <tr><th>From</th><th>Subject</th><th>Message</th><th>Sent</th><th></th></tr>
                  </thead>
                  <tbody>
                    {messages.map((m) => (
                      <tr key={m.id}>
                        <td>{m.name}<br /><span style={{ color: "var(--text3)" }}>{m.email}</span></td>
                        <td>{m.subject}</td>
                        <td className="ad-msg-body">{m.message}</td>
                        <td>{new Date(m.created_at).toLocaleString()}</td>
                        <td><button className="ad-del-btn" onClick={() => deleteMessage(m.id)}>Delete</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
