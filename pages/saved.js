import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { useAuthUser } from "../lib/useAuthUser";
import { supabase } from "../lib/supabaseClient";
import SiteNav from "../components/SiteNav";

const CSS = `
.saved-wrap{max-width:800px;margin:0 auto;padding:48px 28px 80px;position:relative;z-index:1}
.saved-title{font-family:var(--fh);font-size:clamp(28px,4vw,40px);font-weight:700;letter-spacing:-1.5px;margin-bottom:8px}
.saved-sub{color:var(--text2);margin-bottom:32px}
.saved-empty{color:var(--text2);text-align:center;padding:60px 0;background:var(--card);border:1px solid var(--border);border-radius:20px}
.saved-item{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:20px 24px;margin-bottom:14px}
.saved-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
.saved-type{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:var(--a1l)}
.saved-date{font-size:12px;color:var(--text3)}
.saved-content{font-size:14px;color:var(--text);white-space:pre-wrap;line-height:1.6;margin-bottom:12px}
.saved-actions{display:flex;gap:8px}
.saved-btn{font-size:12px;font-weight:500;padding:6px 14px;border-radius:8px;border:1px solid var(--border2);color:var(--text2);background:transparent;cursor:pointer}
.saved-btn:hover{color:var(--text);border-color:var(--border3)}
.saved-btn.danger:hover{color:#fca5a5;border-color:rgba(239,68,68,0.4)}
.upgrade-banner{background:linear-gradient(135deg,rgba(91,79,255,0.15),rgba(255,79,155,0.08));border:1px solid rgba(91,79,255,0.25);border-radius:16px;padding:24px;text-align:center;margin-bottom:24px}
@media(max-width:480px){
  .saved-wrap{padding:32px 16px 60px}
  .saved-item{padding:16px 18px}
  .saved-btn{padding:10px 16px;min-height:40px}
}
`;

const TYPE_LABELS = { hashtag: "Hashtags", caption: "Caption", bio: "Bio", ideas: "Video Ideas" };

export default function Saved() {
  const router = useRouter();
  const { user, loading } = useAuthUser();
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user || !supabase) return;
    (async () => {
      setError("");
      const { data: { session } } = await supabase.auth.getSession();
      const r = await fetch("/api/user/saved", {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      const d = await r.json();
      if (d.success) setItems(d.data);
      else setError(d.error);
    })();
  }, [user?.id]);

  async function handleDelete(id) {
    const { data: { session } } = await supabase.auth.getSession();
    const r = await fetch(`/api/user/saved/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
    const d = await r.json();
    if (d.success) setItems((prev) => prev.filter((i) => i.id !== id));
  }

  if (loading || !user) return null;

  return (
    <>
      <Head>
        <title>Saved Outputs — SocialToolkit</title>
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
      </Head>
      <SiteNav />

      <div className="saved-wrap">
        <h1 className="saved-title">Saved Outputs</h1>
        <p className="saved-sub">Your favorited hashtags, captions, bios, and video ideas.</p>

        {error && (
          <div className="upgrade-banner">
            <p>{error}</p>
          </div>
        )}

        {!items && !error && <p style={{ color: "var(--text3)", fontSize: 14 }}>Loading...</p>}

        {items && items.length === 0 && !error && (
          <div className="saved-empty">Nothing saved yet. Click "❤️ Save" on any generated result to keep it here.</div>
        )}

        {items && items.map((item) => (
          <div className="saved-item" key={item.id}>
            <div className="saved-top">
              <span className="saved-type">{TYPE_LABELS[item.output_type] || item.output_type}</span>
              <span className="saved-date">{new Date(item.created_at).toLocaleDateString()}</span>
            </div>
            <div className="saved-content">{item.content}</div>
            <div className="saved-actions">
              <button className="saved-btn" onClick={() => navigator.clipboard.writeText(item.content)}>Copy</button>
              <button className="saved-btn danger" onClick={() => handleDelete(item.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
