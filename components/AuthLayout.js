import Head from "next/head";

const CSS = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#06060a;--card:#13131e;
  --border:rgba(255,255,255,0.06);--border2:rgba(255,255,255,0.1);
  --text:#eeedf5;--text2:#9998b0;--text3:#5f5e74;
  --a1:#5b4fff;--a1l:#7c6dff;
  --fh:'Clash Display',sans-serif;--fb:'Cabinet Grotesk',sans-serif;
}
body{background:var(--bg);color:var(--text);font-family:var(--fb);font-size:15px;min-height:100vh;min-height:100dvh;display:flex;align-items:center;justify-content:center}
.auth-wrap{width:100%;max-width:400px;padding:24px}
.auth-logo{display:flex;align-items:center;gap:10px;justify-content:center;margin-bottom:32px;font-family:var(--fh);font-size:18px;font-weight:700;text-decoration:none;color:var(--text)}
.auth-card{background:var(--card);border:1px solid var(--border);border-radius:20px;padding:36px}
.auth-title{font-family:var(--fh);font-size:22px;font-weight:700;letter-spacing:-0.5px;margin-bottom:8px;text-align:center}
.auth-sub{font-size:13px;color:var(--text2);text-align:center;margin-bottom:28px}
label{display:block;font-size:11px;font-weight:600;color:var(--text3);margin-bottom:6px;text-transform:uppercase;letter-spacing:0.8px}
input{width:100%;background:rgba(255,255,255,0.04);border:1px solid var(--border2);border-radius:10px;color:var(--text);font-family:var(--fb);font-size:14px;padding:12px 14px;outline:none;transition:border-color 0.2s;margin-bottom:16px}
input:focus{border-color:var(--a1)}
.auth-btn{width:100%;background:var(--a1);color:#fff;font-family:var(--fh);font-size:14px;font-weight:700;padding:13px;border-radius:10px;border:none;cursor:pointer;transition:all 0.2s}
.auth-btn:hover:not(:disabled){background:var(--a1l);transform:translateY(-1px)}
.auth-btn:disabled{opacity:0.6;cursor:not-allowed}
.auth-switch{font-size:13px;color:var(--text2);text-align:center;margin-top:20px}
.auth-switch a{color:var(--a1l);text-decoration:none}
.auth-switch a:hover{text-decoration:underline}
.auth-msg{font-size:13px;border-radius:8px;padding:12px 14px;margin-bottom:16px}
.auth-msg.error{background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.25);color:#fca5a5}
.auth-msg.success{background:rgba(0,229,160,0.1);border:1px solid rgba(0,229,160,0.25);color:#6ee7b7}
`;

export default function AuthLayout({ title, children }) {
  return (
    <>
      <Head>
        <title>{`${title} — SocialToolkit`}</title>
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
      </Head>
      <div className="auth-wrap">
        <a className="auth-logo" href="/">
          <svg width="28" height="28" viewBox="0 0 36 36"><rect width="36" height="36" rx="9" fill="#0e0e16"/><rect x="7" y="21" width="5" height="9" rx="2" fill="#5b4fff"/><rect x="14" y="16" width="5" height="14" rx="2" fill="#7c6dff"/><rect x="21" y="10" width="5" height="20" rx="2" fill="#ff4f9b"/><circle cx="30" cy="8" r="5" fill="#00e5a0"/></svg>
          SocialToolkit
        </a>
        <div className="auth-card">{children}</div>
      </div>
    </>
  );
}
