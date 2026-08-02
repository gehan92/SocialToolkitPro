import Head from "next/head";
import Script from "next/script";

const CSS = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#06060a;--card:#13131e;--card2:#181825;
  --border:rgba(255,255,255,0.06);--border2:rgba(255,255,255,0.1);
  --text:#eeedf5;--text2:#9998b0;--text3:#5f5e74;
  --a1:#5b4fff;--a1l:#7c6dff;--a2:#ff4f9b;--a3:#00e5a0;--a4:#ffb347;
  --fh:'Clash Display',sans-serif;--fb:'Cabinet Grotesk',sans-serif;
}
body{background:var(--bg);color:var(--text);font-family:var(--fb);font-size:15px;line-height:1.75;min-height:100vh}
body::before{content:'';position:fixed;inset:0;background-image:linear-gradient(rgba(255,255,255,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.018) 1px,transparent 1px);background-size:48px 48px;pointer-events:none;z-index:0}
.orb{position:fixed;border-radius:50%;filter:blur(140px);pointer-events:none;z-index:0;opacity:0.1}
.orb1{width:500px;height:500px;background:var(--a1);top:-150px;left:-100px}
.orb2{width:400px;height:400px;background:var(--a2);bottom:-100px;right:-100px;opacity:0.07}

nav{position:sticky;top:0;z-index:100;background:rgba(6,6,10,0.85);backdrop-filter:blur(20px);border-bottom:1px solid var(--border);padding:0 28px}
.nav-wrap{max-width:1000px;margin:0 auto;height:60px;display:flex;align-items:center;justify-content:space-between}
.logo{font-family:var(--fh);font-size:18px;font-weight:700;color:var(--text);text-decoration:none;display:flex;align-items:center;gap:10px}
.nav-back{font-size:13px;color:var(--text2);text-decoration:none;transition:color 0.2s;display:flex;align-items:center;gap:6px}
.nav-back:hover{color:var(--text)}

.wrap{max-width:1000px;margin:0 auto;padding:70px 28px 80px;position:relative;z-index:1}

.page-tag{font-size:11px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:var(--a1l);margin-bottom:12px}
h1{font-family:var(--fh);font-size:clamp(36px,5vw,56px);font-weight:700;letter-spacing:-2px;line-height:1.05;margin-bottom:20px}
h1 span{color:transparent;-webkit-text-stroke:1.5px rgba(255,255,255,0.25)}
.hero-sub{font-size:18px;color:var(--text2);max-width:560px;font-weight:300;line-height:1.7;margin-bottom:60px}

.mission-card{background:var(--card);border:1px solid var(--border);border-radius:20px;padding:40px;margin-bottom:32px;position:relative;overflow:hidden}
.mission-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--a1),var(--a2),var(--a3))}
.mission-label{font-size:11px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:var(--a1l);margin-bottom:12px}
.mission-text{font-size:18px;color:var(--text);line-height:1.7;font-weight:300}
.mission-text strong{color:var(--text);font-weight:500}

.values-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;margin-bottom:48px}
.value-card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:24px;transition:border-color 0.2s,transform 0.2s}
.value-card:hover{border-color:var(--border2);transform:translateY(-2px)}
.value-icon{font-size:28px;margin-bottom:12px}
.value-title{font-family:var(--fh);font-size:15px;font-weight:700;margin-bottom:8px;letter-spacing:-0.3px}
.value-desc{font-size:13px;color:var(--text2);line-height:1.6}

.story-section{margin-bottom:48px}
h2{font-family:var(--fh);font-size:28px;font-weight:700;letter-spacing:-1px;margin-bottom:20px;line-height:1.1}
p{font-size:15px;color:var(--text2);margin-bottom:16px;line-height:1.75}

.tools-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin:24px 0 48px}
.tool-item{background:var(--card2);border:1px solid var(--border);border-radius:12px;padding:20px;display:flex;align-items:center;gap:12px}
.tool-emoji{font-size:24px;flex-shrink:0}
.tool-name{font-family:var(--fh);font-size:14px;font-weight:600;letter-spacing:-0.2px}
.tool-desc{font-size:12px;color:var(--text3);margin-top:2px}

.stats-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:16px;margin-bottom:48px}
.stat-box{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:24px;text-align:center}
.stat-number{font-family:var(--fh);font-size:32px;font-weight:700;letter-spacing:-1px;margin-bottom:4px}
.stat-label{font-size:12px;color:var(--text3);font-weight:500;text-transform:uppercase;letter-spacing:0.5px}

.cta-box{background:linear-gradient(135deg,rgba(91,79,255,0.15),rgba(255,79,155,0.08));border:1px solid rgba(91,79,255,0.2);border-radius:20px;padding:40px;text-align:center}
.cta-box h2{margin-bottom:12px}
.cta-box p{color:var(--text2);margin-bottom:24px;font-weight:300}
.cta-btn{display:inline-flex;align-items:center;gap:8px;background:var(--a1);color:#fff;font-family:var(--fh);font-size:14px;font-weight:700;padding:13px 28px;border-radius:10px;text-decoration:none;transition:all 0.2s}
.cta-btn:hover{background:var(--a1l);transform:translateY(-1px)}

footer{border-top:1px solid var(--border);padding:28px;text-align:center;color:var(--text3);font-size:13px;position:relative;z-index:1}
footer a{color:var(--text3);text-decoration:none;margin:0 10px}
footer a:hover{color:var(--text2)}

@media(max-width:600px){
  .wrap{padding:48px 16px 60px}
  h1{letter-spacing:-1px}
  .mission-card{padding:24px}
  .cta-box{padding:28px 20px}
  .stats-row{grid-template-columns:1fr 1fr}
}
`;

export default function About() {
  return (
    <>
      <Head>
        <title>About Us — SocialToolkit</title>
        <meta name="description" content="Learn about SocialToolkit — free AI-powered tools built to help content creators save time and create better content." />
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
      </Head>
      <Script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4230227200458981" crossOrigin="anonymous" strategy="afterInteractive" />

      <div className="orb orb1"></div>
      <div className="orb orb2"></div>

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
        <div className="page-tag">Our story</div>
        <h1>Built for <span>creators</span><br/>like you</h1>
        <p className="hero-sub">SocialToolkit is a free collection of AI-powered tools designed to help content creators spend less time on writing and more time creating.</p>

        <div className="mission-card">
          <div className="mission-label">Our mission</div>
          <div className="mission-text">We believe <strong>every creator deserves professional tools</strong> — regardless of where they live or how much money they have. That is why everything on SocialToolkit is completely free, with no account required and no hidden fees.</div>
        </div>

        <div className="story-section">
          <h2>Why we built this</h2>
          <p>Content creators spend hours every week writing captions, researching hashtags, updating bios, and thinking of new video ideas. Most of this work is repetitive — and AI can do it in seconds.</p>
          <p>We built SocialToolkit to give every creator — whether you have 100 followers or 100,000 — access to the same AI tools that professional social media agencies use. For free.</p>
          <p>Our tools are simple, fast, and built around real creator needs. No complicated dashboards. No expensive subscriptions. Just results.</p>
        </div>

        <h2>What we offer</h2>
        <div className="tools-grid">
          <div className="tool-item">
            <div className="tool-emoji">#</div>
            <div>
              <div className="tool-name">Hashtag Generator</div>
              <div className="tool-desc">Relevant hashtags for any platform</div>
            </div>
          </div>
          <div className="tool-item">
            <div className="tool-emoji">✍</div>
            <div>
              <div className="tool-name">Caption Writer</div>
              <div className="tool-desc">Engaging captions in seconds</div>
            </div>
          </div>
          <div className="tool-item">
            <div className="tool-emoji">👤</div>
            <div>
              <div className="tool-name">Bio Maker</div>
              <div className="tool-desc">Profile bios that attract followers</div>
            </div>
          </div>
          <div className="tool-item">
            <div className="tool-emoji">💡</div>
            <div>
              <div className="tool-name">Video Idea Generator</div>
              <div className="tool-desc">Fresh ideas for your channel</div>
            </div>
          </div>
        </div>

        <h2>What we stand for</h2>
        <div className="values-grid">
          <div className="value-card">
            <div className="value-icon">🆓</div>
            <div className="value-title">Always free</div>
            <div className="value-desc">All our tools are free to use. We keep the site running through advertising so you never have to pay.</div>
          </div>
          <div className="value-card">
            <div className="value-icon">🔒</div>
            <div className="value-title">Privacy first</div>
            <div className="value-desc">We do not sell your data. What you type into our tools stays private and is not stored after your session.</div>
          </div>
          <div className="value-card">
            <div className="value-icon">⚡</div>
            <div className="value-title">Fast and simple</div>
            <div className="value-desc">No complicated setup. No account needed. Open the tool, type your topic, get your results.</div>
          </div>
          <div className="value-card">
            <div className="value-icon">🌍</div>
            <div className="value-title">For everyone</div>
            <div className="value-desc">Built for creators around the world — whether you are in the USA, UK, Australia, or anywhere else.</div>
          </div>
        </div>

        <div className="stats-row">
          <div className="stat-box">
            <div className="stat-number" style={{ color: "var(--a1l)" }}>4</div>
            <div className="stat-label">Free AI tools</div>
          </div>
          <div className="stat-box">
            <div className="stat-number" style={{ color: "var(--a2)" }}>5</div>
            <div className="stat-label">Platforms supported</div>
          </div>
          <div className="stat-box">
            <div className="stat-number" style={{ color: "var(--a3)" }}>0</div>
            <div className="stat-label">Cost to use</div>
          </div>
          <div className="stat-box">
            <div className="stat-number" style={{ color: "var(--a4)" }}>0</div>
            <div className="stat-label">Sign up needed</div>
          </div>
        </div>

        <div className="cta-box">
          <h2>Ready to try our tools?</h2>
          <p>Free AI tools for every creator. No sign up. No credit card needed.</p>
          <a href="/" className="cta-btn">Try all tools free →</a>
        </div>
      </div>

      <footer>
        <div style={{ marginBottom: 8 }}>© 2026 SocialToolkit. All rights reserved.</div>
        <div>
          <a href="/">Home</a>
          <a href="/about">About us</a>
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Use</a>
          <a href="/contact">Contact</a>
        </div>
      </footer>
    </>
  );
}
