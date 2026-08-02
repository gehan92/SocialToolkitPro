import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { useAuthUser } from "../lib/useAuthUser";
import { supabase } from "../lib/supabaseClient";
import SiteNav from "../components/SiteNav";

const CSS = `
.an-wrap{max-width:800px;margin:0 auto;padding:48px 28px 80px;position:relative;z-index:1}
.an-title{font-family:var(--fh);font-size:clamp(28px,4vw,40px);font-weight:700;letter-spacing:-1.5px;margin-bottom:8px}
.an-sub{color:var(--text2);margin-bottom:32px}
.an-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:16px;margin-bottom:24px}
.an-card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:24px;text-align:center}
.an-num{font-family:var(--fh);font-size:32px;font-weight:700;letter-spacing:-1px;margin-bottom:4px;color:var(--a1l)}
.an-label{font-size:12px;color:var(--text3);font-weight:500;text-transform:uppercase;letter-spacing:0.5px}
.an-breakdown{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:24px}
.an-breakdown-title{font-family:var(--fh);font-size:15px;font-weight:600;margin-bottom:16px}
.an-bar-row{display:flex;align-items:center;gap:12px;margin-bottom:10px;font-size:13px}
.an-bar-label{width:150px;color:var(--text2);flex-shrink:0}
.an-bar-track{flex:1;background:rgba(255,255,255,0.05);border-radius:6px;height:8px;overflow:hidden}
.an-bar-fill{height:100%;background:var(--a1);border-radius:6px}
.an-bar-count{width:30px;text-align:right;color:var(--text3)}
.upgrade-banner{background:linear-gradient(135deg,rgba(91,79,255,0.15),rgba(255,79,155,0.08));border:1px solid rgba(91,79,255,0.25);border-radius:16px;padding:32px;text-align:center}
`;

export default function Analytics() {
  const router = useRouter();
  const { user, loading } = useAuthUser();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user || !supabase) return;
    (async () => {
      setError("");
      const { data: { session } } = await supabase.auth.getSession();
      const r = await fetch("/api/user/analytics", {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      const d = await r.json();
      if (d.success) setData(d.data);
      else setError(d.error);
    })();
  }, [user?.id]);

  if (loading || !user) return null;

  const maxCount = data ? Math.max(1, ...Object.values(data.toolCounts)) : 1;

  return (
    <>
      <Head>
        <title>Analytics — SocialToolkit</title>
        <link rel="stylesheet" href="/css/site.css" />
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
      </Head>
      <SiteNav />

      <div className="an-wrap">
        <h1 className="an-title">Analytics</h1>
        <p className="an-sub">Your generation activity across all tools.</p>

        {error && (
          <div className="upgrade-banner">
            <p>{error}</p>
          </div>
        )}

        {data && (
          <>
            <div className="an-grid">
              <div className="an-card">
                <div className="an-num">{data.total}</div>
                <div className="an-label">Total generations</div>
              </div>
              <div className="an-card">
                <div className="an-num">{data.thisMonth}</div>
                <div className="an-label">This month</div>
              </div>
              <div className="an-card">
                <div className="an-num">{data.savedCount}</div>
                <div className="an-label">Saved outputs</div>
              </div>
              <div className="an-card">
                <div className="an-num">{data.favoritesCount}</div>
                <div className="an-label">Favorites</div>
              </div>
            </div>

            <div className="an-breakdown">
              <div className="an-breakdown-title">Usage by tool</div>
              {Object.keys(data.toolCounts).length === 0 && (
                <div style={{ color: "var(--text3)", fontSize: 13 }}>No generations yet.</div>
              )}
              {Object.entries(data.toolCounts).map(([tool, count]) => (
                <div className="an-bar-row" key={tool}>
                  <span className="an-bar-label">{tool}</span>
                  <span className="an-bar-track">
                    <span className="an-bar-fill" style={{ width: `${(count / maxCount) * 100}%` }} />
                  </span>
                  <span className="an-bar-count">{count}</span>
                </div>
              ))}
              {data.lastUsed && (
                <div style={{ marginTop: 16, fontSize: 12, color: "var(--text3)" }}>
                  Last used: {new Date(data.lastUsed).toLocaleString()}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
