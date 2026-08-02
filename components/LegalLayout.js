import Head from "next/head";
import Script from "next/script";

const CSS = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#06060a;--surface:#0e0e16;--card:#13131e;
  --border:rgba(255,255,255,0.06);--border2:rgba(255,255,255,0.1);
  --text:#eeedf5;--text2:#9998b0;--text3:#5f5e74;
  --a1:#5b4fff;--a1l:#7c6dff;
  --fh:'Clash Display',sans-serif;--fb:'Cabinet Grotesk',sans-serif;
}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--text);font-family:var(--fb);font-size:15px;line-height:1.75;min-height:100vh}
body::before{content:'';position:fixed;inset:0;background-image:linear-gradient(rgba(255,255,255,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.018) 1px,transparent 1px);background-size:48px 48px;pointer-events:none;z-index:0}
nav{position:sticky;top:0;z-index:100;background:rgba(6,6,10,0.85);backdrop-filter:blur(20px);border-bottom:1px solid var(--border);padding:0 28px}
.nav-wrap{max-width:800px;margin:0 auto;height:60px;display:flex;align-items:center;justify-content:space-between}
.logo{font-family:var(--fh);font-size:18px;font-weight:700;color:var(--text);text-decoration:none;display:flex;align-items:center;gap:10px}
.logo svg{flex-shrink:0}
.nav-back{font-size:13px;color:var(--text2);text-decoration:none;display:flex;align-items:center;gap:6px;transition:color 0.2s}
.nav-back:hover{color:var(--text)}
.wrap{max-width:800px;margin:0 auto;padding:60px 28px 80px;position:relative;z-index:1}
.page-tag{font-size:11px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:var(--a1l);margin-bottom:12px}
h1{font-family:var(--fh);font-size:clamp(32px,5vw,48px);font-weight:700;letter-spacing:-1.5px;line-height:1.1;margin-bottom:12px}
.updated{font-size:13px;color:var(--text3);margin-bottom:48px}
.content{background:var(--card);border:1px solid var(--border);border-radius:20px;padding:40px 48px}
h2{font-family:var(--fh);font-size:20px;font-weight:700;letter-spacing:-0.5px;margin:36px 0 12px;color:var(--text)}
h2:first-child{margin-top:0}
p{font-size:15px;color:var(--text2);margin-bottom:16px;line-height:1.75}
ul{margin:0 0 16px 20px}
li{font-size:15px;color:var(--text2);margin-bottom:8px;line-height:1.7}
a{color:var(--a1l);text-decoration:none}
a:hover{text-decoration:underline}
.highlight{background:rgba(91,79,255,0.08);border:1px solid rgba(91,79,255,0.2);border-radius:12px;padding:20px 24px;margin:24px 0}
.highlight p{margin:0;color:var(--text)}
footer{border-top:1px solid var(--border);padding:28px;text-align:center;color:var(--text3);font-size:13px;position:relative;z-index:1}
footer a{color:var(--text3);text-decoration:none;margin:0 10px}
footer a:hover{color:var(--text2)}
@media(max-width:600px){.content{padding:24px 20px}.wrap{padding:40px 16px 60px}}
`;

export default function LegalLayout({ title, description, pageTag, updated, children }) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
      </Head>
      <Script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4230227200458981" crossOrigin="anonymous" strategy="afterInteractive" />

      <nav>
        <div className="nav-wrap">
          <a className="logo" href="/">
            <svg width="28" height="28" viewBox="0 0 36 36"><rect width="36" height="36" rx="9" fill="#0e0e16"/><rect x="7" y="21" width="5" height="9" rx="2" fill="#5b4fff"/><rect x="14" y="16" width="5" height="14" rx="2" fill="#7c6dff"/><rect x="21" y="10" width="5" height="20" rx="2" fill="#ff4f9b"/><circle cx="30" cy="8" r="5" fill="#00e5a0"/></svg>
            SocialToolkit
          </a>
          <a className="nav-back" href="/">← Back to home</a>
        </div>
      </nav>

      <div className="wrap">
        <div className="page-tag">{pageTag}</div>
        <h1>{title.split("—")[0].trim()}</h1>
        <div className="updated">Last updated: {updated}</div>
        <div className="content">{children}</div>
      </div>

      <footer>
        <div style={{ marginBottom: 8 }}>© 2026 SocialToolkit. All rights reserved.</div>
        <div>
          <a href="/">Home</a>
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Use</a>
          <a href="/contact">Contact</a>
        </div>
      </footer>
    </>
  );
}
