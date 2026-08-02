import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { useAuthUser } from "../lib/useAuthUser";
import { supabase } from "../lib/supabaseClient";
import SiteNav from "../components/SiteNav";

const CSS = `
.cal-wrap{max-width:900px;margin:0 auto;padding:48px 28px 80px;position:relative;z-index:1}
.cal-title{font-family:var(--fh);font-size:clamp(28px,4vw,40px);font-weight:700;letter-spacing:-1.5px;margin-bottom:8px}
.cal-sub{color:var(--text2);margin-bottom:32px}
.cal-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:10px;margin-bottom:32px}
.cal-day{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:12px;cursor:pointer;transition:border-color 0.2s;min-height:80px}
.cal-day:hover{border-color:var(--border3)}
.cal-day.selected{border-color:var(--a1);background:rgba(91,79,255,0.08)}
.cal-day.today{border-color:rgba(0,229,160,0.4)}
.cal-daynum{font-family:var(--fh);font-weight:700;font-size:14px;margin-bottom:6px}
.cal-count{font-size:11px;color:var(--a1l);font-weight:600}
.cal-panel{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:24px}
.cal-panel-title{font-family:var(--fh);font-size:16px;font-weight:700;margin-bottom:16px}
.cal-entry{background:var(--card2);border:1px solid var(--border);border-radius:10px;padding:12px 14px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;gap:10px}
.cal-entry-text{font-size:13px;color:var(--text)}
.cal-del{font-size:12px;color:var(--text3);background:none;border:none;cursor:pointer;flex-shrink:0}
.cal-del:hover{color:#fca5a5}
.upgrade-banner{background:linear-gradient(135deg,rgba(91,79,255,0.15),rgba(255,79,155,0.08));border:1px solid rgba(91,79,255,0.25);border-radius:16px;padding:32px;text-align:center}
`;

function toDateStr(d) {
  return d.toISOString().slice(0, 10);
}

export default function Calendar() {
  const router = useRouter();
  const { user, loading } = useAuthUser();
  const [entries, setEntries] = useState(null);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [note, setNote] = useState("");

  const days = useMemo(() => {
    const arr = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      arr.push(d);
    }
    return arr;
  }, []);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  async function loadEntries() {
    setError("");
    const { data: { session } } = await supabase.auth.getSession();
    const r = await fetch("/api/user/calendar", {
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
    const d = await r.json();
    if (d.success) setEntries(d.data);
    else setError(d.error);
  }

  useEffect(() => {
    if (!user || !supabase) return;
    loadEntries();
  }, [user?.id]);

  async function handleAdd() {
    if (!note.trim() || !selectedDate) return;
    const { data: { session } } = await supabase.auth.getSession();
    const r = await fetch("/api/user/calendar", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
      body: JSON.stringify({ planned_date: selectedDate, note: note.trim() }),
    });
    const d = await r.json();
    if (d.success) {
      setNote("");
      loadEntries();
    } else {
      alert(d.error);
    }
  }

  async function handleDelete(id) {
    const { data: { session } } = await supabase.auth.getSession();
    await fetch(`/api/user/calendar/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
    loadEntries();
  }

  if (loading || !user) return null;

  const entriesByDate = {};
  (entries || []).forEach((e) => {
    entriesByDate[e.planned_date] = entriesByDate[e.planned_date] || [];
    entriesByDate[e.planned_date].push(e);
  });

  const todayStr = toDateStr(new Date());
  const selectedEntries = selectedDate ? entriesByDate[selectedDate] || [] : [];

  return (
    <>
      <Head>
        <title>Content Calendar — SocialToolkit</title>
        <link rel="stylesheet" href="/css/site.css" />
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
      </Head>
      <SiteNav />

      <div className="cal-wrap">
        <h1 className="cal-title">Content Calendar</h1>
        <p className="cal-sub">Plan what to post over the next 30 days.</p>

        {error && (
          <div className="upgrade-banner">
            <p>{error}</p>
          </div>
        )}

        {entries && (
          <>
            <div className="cal-grid">
              {days.map((d) => {
                const dateStr = toDateStr(d);
                const count = entriesByDate[dateStr]?.length || 0;
                return (
                  <div
                    key={dateStr}
                    className={`cal-day ${selectedDate === dateStr ? "selected" : ""} ${dateStr === todayStr ? "today" : ""}`}
                    onClick={() => setSelectedDate(dateStr)}
                  >
                    <div className="cal-daynum">
                      {d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </div>
                    {count > 0 && <div className="cal-count">{count} planned</div>}
                  </div>
                );
              })}
            </div>

            {selectedDate && (
              <div className="cal-panel">
                <div className="cal-panel-title">
                  {new Date(selectedDate).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
                </div>

                {selectedEntries.map((e) => (
                  <div className="cal-entry" key={e.id}>
                    <span className="cal-entry-text">{e.note}</span>
                    <button className="cal-del" onClick={() => handleDelete(e.id)}>Delete</button>
                  </div>
                ))}

                <div className="form-row" style={{ marginTop: 12, display: "flex", gap: 8 }}>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="What are you posting this day?"
                    style={{ flex: 1, marginBottom: 0 }}
                    onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  />
                  <button className="generate-btn gbtn-purple" style={{ width: "auto", padding: "0 20px" }} onClick={handleAdd}>
                    Add
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
