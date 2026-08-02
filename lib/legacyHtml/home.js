const LANGUAGES = [
  "English", "Spanish", "French", "German", "Portuguese", "Italian",
  "Arabic", "Hindi", "Indonesian", "Japanese", "Korean", "Turkish",
  "Russian", "Vietnamese", "Thai", "Dutch", "Polish", "Tagalog/Filipino",
];
const LANGUAGE_OPTIONS = LANGUAGES.map((l) => `<option${l === "English" ? " selected" : ""}>${l}</option>`).join("");

export const HOME_BODY_HTML = `
<div class="cookie-banner" id="cookie-banner">
  <div>
    <div class="cookie-title">🍪 We use cookies</div>
    <div class="cookie-text">We use cookies to improve your experience and show relevant ads. By clicking "Accept" you agree to our <a href="/privacy">Privacy Policy</a>.</div>
  </div>
  <div class="cookie-btns">
    <button class="cookie-accept" onclick="acceptCookies()">Accept all</button>
    <button class="cookie-decline" onclick="declineCookies()">Decline</button>
  </div>
</div>

<div class="orb orb1"></div>
<div class="orb orb2"></div>
<div class="orb orb3"></div>

<!-- HERO -->
<div class="hero">
  <div class="hero-eyebrow"><span></span> 100% free — no account needed</div>
  <h1>AI tools built for<br><em>every</em> <span class="grad">content creator</span></h1>
  <p class="hero-sub">14 AI tools for content creators — hashtags, captions, bios, threads, SEO intros, ad copy, viral hooks, and more. Free to start, powerful to grow.</p>
  <div class="hero-actions">
    <a href="#tools" class="btn-hero btn-hero-primary">Start creating free →</a>
    <a href="#how" class="btn-hero btn-hero-ghost">See how it works</a>
  </div>
  <div class="stats">
    <div class="stat-item"><div class="stat-num" style="color:var(--a1l)">14</div><div class="stat-label">AI Tools</div></div>
    <div class="stat-item"><div class="stat-num" style="color:var(--a2)">Free</div><div class="stat-label">Core tools</div></div>
    <div class="stat-item"><div class="stat-num" style="color:var(--a3)">⚡</div><div class="stat-label">Fast results</div></div>
    <div class="stat-item"><div class="stat-num" style="color:var(--a4)">0</div><div class="stat-label">Sign-up needed</div></div>
  </div>
</div>

<!-- TRUST BAR -->
<div class="trust-bar">
  <div class="trust-inner">
    <div class="trust-item"><span class="trust-icon">✅</span> No sign up required</div>
    <div class="trust-item"><span class="trust-icon">🔒</span> Your privacy is respected</div>
    <div class="trust-item"><span class="trust-icon">⚡</span> Fast AI-powered results</div>
    <div class="trust-item"><span class="trust-icon">🌍</span> Works for all niches</div>
    <div class="trust-item"><span class="trust-icon">📱</span> Mobile friendly</div>
  </div>
</div>

<!-- HOW IT WORKS -->
<div class="section" id="how">
  <div class="section-tag">How it works</div>
  <h2 class="section-title">Simple as 1, 2, 3</h2>
  <p class="section-sub">No complicated settings. Just fill in a few details and get helpful AI-powered results in moments.</p>
  <div class="steps">
    <div class="step-card">
      <div class="step-num">01</div>
      <div class="step-icon">🎯</div>
      <div class="step-title">Pick your tool</div>
      <div class="step-desc">Choose from hashtag generator, caption writer, bio maker, or video idea generator.</div>
    </div>
    <div class="step-card">
      <div class="step-num">02</div>
      <div class="step-icon">✏️</div>
      <div class="step-title">Describe your content</div>
      <div class="step-desc">Tell us about your post, niche, or platform. Takes less than 30 seconds.</div>
    </div>
    <div class="step-card">
      <div class="step-num">03</div>
      <div class="step-icon">⚡</div>
      <div class="step-title">Get AI results</div>
      <div class="step-desc">Our AI generates results tailored to your content. Copy and use right away.</div>
    </div>
    <div class="step-card">
      <div class="step-num">04</div>
      <div class="step-icon">🚀</div>
      <div class="step-title">Grow your audience</div>
      <div class="step-desc">Use better captions, hashtags and ideas to help your content reach more people.</div>
    </div>
  </div>
</div>

<!-- AD SLOT -->
<div class="ad-slot"><ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-4230227200458981"
     data-ad-slot="auto"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins></div>

<!-- TOOLS -->
<div class="tools-section" id="tools">
  <div class="section-tag">Free AI tools</div>
  <h2 class="section-title" style="margin-bottom:32px">Everything you need to create</h2>

  <div class="tool-tabs">
    <button class="tab-btn active" onclick="switchTab('hashtag',this)"># Hashtags</button>
    <button class="tab-btn" onclick="switchTab('caption',this)">✍ Captions</button>
    <button class="tab-btn" onclick="switchTab('bio',this)">👤 Bio Maker</button>
    <button class="tab-btn" onclick="switchTab('ideas',this)">💡 Video Ideas</button>
    <button class="tab-btn" onclick="switchTab('thread',this)">🧵 Threads</button>
    <button class="tab-btn tab-premium" onclick="switchTab('seo-intro',this)">🔍 SEO Intro <span class="tier-badge-tab">💎</span></button>
    <button class="tab-btn tab-premium" onclick="switchTab('repurpose',this)">🔄 Repurpose <span class="tier-badge-tab">💎</span></button>
    <button class="tab-btn tab-premium" onclick="switchTab('youtube-desc',this)">▶️ YT Desc <span class="tier-badge-tab">💎</span></button>
    <button class="tab-btn tab-premium" onclick="switchTab('email-subject',this)">📧 Email Subject <span class="tier-badge-tab">💎</span></button>
    <button class="tab-btn tab-premium" onclick="switchTab('cta',this)">📣 CTA Writer <span class="tier-badge-tab">💎</span></button>
    <button class="tab-btn tab-pro" onclick="switchTab('ad-copy',this)">🎯 Ad Copy <span class="tier-badge-tab pro">👑</span></button>
    <button class="tab-btn tab-pro" onclick="switchTab('viral-hook',this)">🚀 Viral Hook <span class="tier-badge-tab pro">👑</span></button>
    <button class="tab-btn tab-pro" onclick="switchTab('tech-writing',this)">📝 Tech Writing <span class="tier-badge-tab pro">👑</span></button>
    <button class="tab-btn tab-pro" onclick="switchTab('pitch',this)">🤝 Pitch Writer <span class="tier-badge-tab pro">👑</span></button>
  </div>

  <!-- HASHTAG TOOL -->
  <div class="tool-panel active" id="panel-hashtag">
    <div class="input-panel">
      <div class="panel-title"><span>#</span> Hashtag Generator</div>
      <div class="ml-hint">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          Works in any language — type in English, Spanish, French, Arabic or any language!
        </div>
        <label>Topic or niche</label>
      <input type="text" id="ht-topic" placeholder="e.g. travel photography in Paris, France" maxlength="120">
      <label>Platform</label>
      <div class="toggle-group" id="ht-plat">
        <span class="toggle on" data-v="Instagram">Instagram</span>
        <span class="toggle" data-v="TikTok">TikTok</span>
        <span class="toggle" data-v="YouTube">YouTube</span>
        <span class="toggle" data-v="Twitter/X">Twitter/X</span>
      </div>
      <div class="form-row">
        <div>
          <label>How many hashtags?</label>
          <select id="ht-count">
            <option value="10">10 hashtags</option>
            <option value="20" selected>20 hashtags</option>
            <option value="30">30 hashtags</option>
          </select>
        </div>
        <div>
          <label>Language</label>
          <select id="ht-lang">${LANGUAGE_OPTIONS}</select>
        </div>
      </div>
      <button class="tips-toggle" onclick="toggleTips('ht-tips',this)">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Tips for better hashtags
        </button>
        <div class="tips-box" id="ht-tips">
          <div class="tips-list">
            <div class="tip-item"><div class="tip-dot"></div><div class="tip-text"><strong>Be specific</strong> — include niche, location and content type for targeted hashtags</div></div>
            <div class="tip-item"><div class="tip-dot"></div><div class="tip-text"><strong>Add your platform</strong> — hashtag styles differ between Instagram, TikTok and YouTube</div></div>
            <div class="tip-item"><div class="tip-dot"></div><div class="tip-text"><strong>Include mood or style</strong> — words like "aesthetic", "viral" or "minimal" help tailor results</div></div>
          </div>
          <div class="tip-example"><strong>✦ Good example</strong>"travel photography golden hour Paris France aesthetic lifestyle"</div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
          <select id="ht-tpl-select" style="flex:1;margin-bottom:0"><option value="">📋 Load template...</option></select>
          <button class="copy-btn" onclick="saveTemplate('hashtag')">💾 Save</button>
          <button class="copy-btn" onclick="deleteTemplate('hashtag')">🗑</button>
        </div>
        <button class="generate-btn gbtn-purple" id="ht-btn" onclick="genHashtags()">
        <span class="spin" id="ht-spin"></span> Generate hashtags
      </button>
    </div>
    <div class="output-panel">
      <div class="out-empty" id="ht-empty">
        <div class="out-empty-icon">#</div>
        <div class="out-empty-text">Your hashtags will appear here</div>
      </div>
      <div class="out-result" id="ht-result">
        <div class="out-topbar">
          <span class="out-label">Your hashtags</span>
          <button class="copy-btn" id="ht-copy-btn" onclick="copyTags()">Copy all</button>
          <button class="copy-btn" id="ht-save-btn" onclick="saveOutput('hashtag','ht-save-btn')">❤️ Save</button>
          <button class="copy-btn" onclick="exportOutput('hashtag','csv')">📥 CSV</button>
          <button class="copy-btn" onclick="exportOutput('hashtag','pdf')">📥 PDF</button>
        </div>
        <div class="tag-cloud" id="ht-tags"></div>
      </div>
    </div>
  </div>

  <!-- CAPTION TOOL -->
  <div class="tool-panel" id="panel-caption">
    <div class="input-panel">
      <div class="panel-title"><span>✍</span> Caption Writer</div>
      <label>Describe your photo or video</label>
      <textarea id="cap-desc" placeholder="e.g. Sunset at Santorini, golden hour, peaceful Mediterranean vibes..."></textarea>
      <label>Tone</label>
      <div class="toggle-group" id="cap-tone">
        <span class="toggle on pink" data-v="Inspirational">✨ Inspirational</span>
        <span class="toggle pink" data-v="Casual">😊 Casual</span>
        <span class="toggle pink" data-v="Professional">💼 Professional</span>
        <span class="toggle pink" data-v="Funny" data-premium="true">😂 Funny 🔒</span>
        <span class="toggle pink" data-v="Motivational" data-premium="true">🔥 Motivational 🔒</span>
        <span class="toggle pink" data-v="Romantic" data-premium="true">💕 Romantic 🔒</span>
        <span class="toggle pink" data-v="Sarcastic" data-premium="true">😏 Sarcastic 🔒</span>
        <span class="toggle pink" data-v="Storytelling" data-premium="true">📖 Storytelling 🔒</span>
        <span class="toggle pink" data-v="Custom" data-premium="true">🎤 Custom voice 🔒</span>
      </div>
      <div id="cap-custom-voice-wrap" style="display:none">
        <label>Describe your voice</label>
        <input type="text" id="cap-custom-voice" placeholder="e.g. dry humor, short sentences, no emojis except one at the end">
      </div>
      <div class="form-row">
        <div>
          <label>Platform</label>
          <select id="cap-plat"><option>Instagram</option><option>TikTok</option><option>Facebook</option><option>LinkedIn</option><option>Twitter/X</option></select>
        </div>
        <div>
          <label>Length</label>
          <select id="cap-len"><option value="short">Short (1–2 lines)</option><option value="medium" selected>Medium (3–5 lines)</option><option value="long">Long (story style)</option></select>
        </div>
      </div>
      <label>Language</label>
      <select id="cap-lang">${LANGUAGE_OPTIONS}</select>
      <button class="tips-toggle" onclick="toggleTips('cap-tips',this)">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Tips for better captions
        </button>
        <div class="tips-box" id="cap-tips">
          <div class="tips-list">
            <div class="tip-item"><div class="tip-dot"></div><div class="tip-text"><strong>Describe the scene</strong> — include location, lighting, people and mood</div></div>
            <div class="tip-item"><div class="tip-dot"></div><div class="tip-text"><strong>Add emotion</strong> — words like "laughing", "peaceful", "excited" make captions feel real</div></div>
            <div class="tip-item"><div class="tip-dot"></div><div class="tip-text"><strong>Mention the occasion</strong> — birthday, vacation, weekend, holiday improves relevance</div></div>
          </div>
          <div class="tip-example"><strong>✦ Good example</strong>"Family beach trip at golden hour sunset, kids laughing in waves, candid happy summer vibes"</div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
          <select id="cap-tpl-select" style="flex:1;margin-bottom:0"><option value="">📋 Load template...</option></select>
          <button class="copy-btn" onclick="saveTemplate('caption')">💾 Save</button>
          <button class="copy-btn" onclick="deleteTemplate('caption')">🗑</button>
        </div>
        <button class="generate-btn gbtn-pink" id="cap-btn" onclick="genCaption()">
        <span class="spin" id="cap-spin"></span> Write my caption
      </button>
      <button class="generate-btn gbtn-pink" id="cap-var-btn" style="margin-top:8px;background:transparent;border:1px solid var(--border2);color:var(--text2)" onclick="genVariations('caption','cap-var-btn')">
        <span class="spin" id="cap-var-spin"></span> 🔀 Generate 5 variations
      </button>
    </div>
    <div class="output-panel">
      <div class="out-empty" id="cap-empty">
        <div class="out-empty-icon">✍</div>
        <div class="out-empty-text">Your caption will appear here</div>
      </div>
      <div class="out-result" id="cap-result">
        <div class="out-topbar">
          <span class="out-label">Your caption</span>
          <button class="copy-btn" id="cap-copy-btn" onclick="copyOut('cap-text','cap-copy-btn')">Copy</button>
          <button class="copy-btn" id="cap-save-btn" onclick="saveOutput('caption','cap-save-btn')">❤️ Save</button>
          <button class="copy-btn" onclick="exportOutput('caption','csv')">📥 CSV</button>
          <button class="copy-btn" onclick="exportOutput('caption','pdf')">📥 PDF</button>
        </div>
        <div class="out-text" id="cap-text"></div>
        <div class="idea-list" id="cap-variations" style="margin-top:14px"></div>
      </div>
    </div>
  </div>

  <!-- BIO TOOL -->
  <div class="tool-panel" id="panel-bio">
    <div class="input-panel">
      <div class="panel-title"><span>👤</span> Bio Maker</div>
      <div class="form-row">
        <div>
          <label>Name or username</label>
          <input type="text" id="bio-name" placeholder="e.g. Alex or @alex.creates">
        </div>
        <div>
          <label>What you do</label>
          <input type="text" id="bio-niche" placeholder="e.g. lifestyle & travel vlogger">
        </div>
      </div>
      <label>Location (optional)</label>
      <input type="text" id="bio-loc" placeholder="e.g. London, UK 🇬🇧">
      <label>About you (interests, achievements)</label>
      <textarea id="bio-about" placeholder="e.g. coffee lover, fitness enthusiast, sharing daily life in Europe" style="min-height:70px"></textarea>
      <div class="form-row">
        <div>
          <label>Platform</label>
          <select id="bio-plat"><option>Instagram</option><option>TikTok</option><option>YouTube</option><option>Twitter/X</option><option>LinkedIn</option></select>
        </div>
        <div>
          <label>Vibe</label>
          <select id="bio-vibe"><option>Fun & playful</option><option>Professional</option><option>Minimal & cool</option><option>Inspirational</option></select>
        </div>
      </div>
      <label>Language</label>
      <select id="bio-lang">${LANGUAGE_OPTIONS}</select>
      <button class="tips-toggle" onclick="toggleTips('bio-tips',this)">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Tips for a great bio
        </button>
        <div class="tips-box" id="bio-tips">
          <div class="tips-list">
            <div class="tip-item"><div class="tip-dot"></div><div class="tip-text"><strong>List your passions</strong> — mention 2-3 specific interests not just your job title</div></div>
            <div class="tip-item"><div class="tip-dot"></div><div class="tip-text"><strong>Add an achievement</strong> — follower count, years of experience or notable accomplishment</div></div>
            <div class="tip-item"><div class="tip-dot"></div><div class="tip-text"><strong>Include a CTA</strong> — what should visitors do? Watch, shop, follow, DM?</div></div>
          </div>
          <div class="tip-example"><strong>✦ Good example</strong>"Travel creator, coffee addict, sharing hidden gems in Europe — 50k followers, new video every Friday!"</div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
          <select id="bio-tpl-select" style="flex:1;margin-bottom:0"><option value="">📋 Load template...</option></select>
          <button class="copy-btn" onclick="saveTemplate('bio')">💾 Save</button>
          <button class="copy-btn" onclick="deleteTemplate('bio')">🗑</button>
        </div>
        <button class="generate-btn gbtn-teal" id="bio-btn" onclick="genBio()">
        <span class="spin" id="bio-spin"></span> Create my bio
      </button>
      <button class="generate-btn gbtn-teal" id="bio-var-btn" style="margin-top:8px;background:transparent;border:1px solid var(--border2);color:var(--text2)" onclick="genVariations('bio','bio-var-btn')">
        <span class="spin" id="bio-var-spin"></span> 🔀 Generate 5 variations
      </button>
    </div>
    <div class="output-panel">
      <div class="out-empty" id="bio-empty">
        <div class="out-empty-icon">👤</div>
        <div class="out-empty-text">Your bio will appear here</div>
      </div>
      <div class="out-result" id="bio-result">
        <div class="out-topbar">
          <span class="out-label">Your bio</span>
          <button class="copy-btn" id="bio-copy-btn" onclick="copyOut('bio-text','bio-copy-btn')">Copy</button>
          <button class="copy-btn" id="bio-save-btn" onclick="saveOutput('bio','bio-save-btn')">❤️ Save</button>
          <button class="copy-btn" onclick="exportOutput('bio','csv')">📥 CSV</button>
          <button class="copy-btn" onclick="exportOutput('bio','pdf')">📥 PDF</button>
        </div>
        <div class="out-text" id="bio-text"></div>
        <div class="idea-list" id="bio-variations" style="margin-top:14px"></div>
      </div>
    </div>
  </div>

  <!-- VIDEO IDEAS TOOL -->
  <div class="tool-panel" id="panel-ideas">
    <div class="input-panel">
      <div class="panel-title"><span>💡</span> Video Idea Generator</div>
      <div class="form-row">
        <div>
          <label>Channel niche</label>
          <input type="text" id="vid-niche" placeholder="e.g. European travel, fitness, AI tools">
        </div>
        <div>
          <label>Target audience</label>
          <input type="text" id="vid-aud" placeholder="e.g. young adults in USA, UK, Australia">
        </div>
      </div>
      <div class="form-row">
        <div>
          <label>Platform</label>
          <select id="vid-plat"><option>YouTube (long video)</option><option>YouTube Shorts</option><option>TikTok</option><option>Instagram Reels</option></select>
        </div>
        <div>
          <label>Number of ideas</label>
          <select id="vid-count"><option value="5">5 ideas</option><option value="10" selected>10 ideas</option><option value="15">15 ideas</option></select>
        </div>
      </div>
      <label>Language</label>
      <select id="vid-lang">${LANGUAGE_OPTIONS}</select>
      <label>Style (optional)</label>
      <div class="toggle-group" id="vid-style">
        <span class="toggle on amber" data-v="Trending & popular">🔥 Trending</span>
        <span class="toggle amber" data-v="Educational">📚 Educational</span>
        <span class="toggle amber" data-v="Entertaining">😄 Entertaining</span>
        <span class="toggle amber" data-v="Inspirational">✨ Inspirational</span>
      </div>
      <button class="tips-toggle" onclick="toggleTips('vid-tips',this)">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Tips for viral video ideas
        </button>
        <div class="tips-box" id="vid-tips">
          <div class="tips-list">
            <div class="tip-item"><div class="tip-dot"></div><div class="tip-text"><strong>Be specific with niche</strong> — "fitness for busy moms" beats "fitness"</div></div>
            <div class="tip-item"><div class="tip-dot"></div><div class="tip-text"><strong>Define your audience</strong> — age, country and interests help tailor ideas</div></div>
            <div class="tip-item"><div class="tip-dot"></div><div class="tip-text"><strong>Pick the right style</strong> — trending ideas get views fast, educational builds loyal audience</div></div>
          </div>
          <div class="tip-example"><strong>✦ Good example</strong>Niche: "budget travel Europe backpacker" — Audience: "college students USA aged 18-25"</div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
          <select id="vid-tpl-select" style="flex:1;margin-bottom:0"><option value="">📋 Load template...</option></select>
          <button class="copy-btn" onclick="saveTemplate('ideas')">💾 Save</button>
          <button class="copy-btn" onclick="deleteTemplate('ideas')">🗑</button>
        </div>
        <button class="generate-btn gbtn-amber" id="vid-btn" onclick="genIdeas()">
        <span class="spin" id="vid-spin"></span> Generate ideas
      </button>
    </div>
    <div class="output-panel">
      <div class="out-empty" id="vid-empty">
        <div class="out-empty-icon">💡</div>
        <div class="out-empty-text">Your video ideas will appear here</div>
      </div>
      <div class="out-result" id="vid-result">
        <div class="out-topbar">
          <span class="out-label">Your ideas</span>
          <button class="copy-btn" id="vid-copy-btn" onclick="copyOut('vid-text','vid-copy-btn')">Copy all</button>
          <button class="copy-btn" id="vid-save-btn" onclick="saveOutput('ideas','vid-save-btn')">❤️ Save</button>
          <button class="copy-btn" onclick="exportOutput('ideas','csv')">📥 CSV</button>
          <button class="copy-btn" onclick="exportOutput('ideas','pdf')">📥 PDF</button>
        </div>
        <div class="idea-list" id="vid-ideas"></div>
        <div class="out-text" id="vid-text" style="display:none"></div>
      </div>
    </div>
  </div>

  <!-- THREAD WRITER TOOL (Free) -->
  <div class="tool-panel" id="panel-thread">
    <div class="input-panel">
      <div class="panel-title"><span>🧵</span> Thread Writer</div>
      <div class="ml-hint">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
        Works for Twitter/X and LinkedIn — 10 free uses per day.
      </div>
      <label>Thread topic</label>
      <input type="text" id="thr-topic" placeholder="e.g. 10 lessons I learned from building my first startup" maxlength="150">
      <div class="form-row">
        <div>
          <label>Platform</label>
          <select id="thr-plat"><option>Twitter/X</option><option>LinkedIn</option></select>
        </div>
        <div>
          <label>Number of tweets</label>
          <select id="thr-count"><option value="5">5 tweets</option><option value="7" selected>7 tweets</option><option value="10">10 tweets</option></select>
        </div>
      </div>
      <label>Tone</label>
      <div class="toggle-group" id="thr-tone">
        <span class="toggle on" data-v="Educational">📚 Educational</span>
        <span class="toggle" data-v="Storytelling">📖 Storytelling</span>
        <span class="toggle" data-v="Motivational">🔥 Motivational</span>
        <span class="toggle" data-v="Casual">😊 Casual</span>
      </div>
      <label>Language</label>
      <select id="thr-lang">${LANGUAGE_OPTIONS}</select>
      <button class="generate-btn gbtn-purple" id="thr-btn" onclick="genThread()">
        <span class="spin" id="thr-spin"></span> Generate thread
      </button>
    </div>
    <div class="output-panel">
      <div class="out-empty" id="thr-empty">
        <div class="out-empty-icon">🧵</div>
        <div class="out-empty-text">Your thread will appear here</div>
      </div>
      <div class="out-result" id="thr-result">
        <div class="out-topbar">
          <span class="out-label">Your thread</span>
          <button class="copy-btn" id="thr-copy-btn" onclick="copyOut('thr-text','thr-copy-btn')">Copy all</button>
          <button class="copy-btn" id="thr-save-btn" onclick="saveOutput('thread','thr-save-btn')">❤️ Save</button>
        </div>
        <div class="idea-list" id="thr-tweets"></div>
        <div class="out-text" id="thr-text" style="display:none"></div>
      </div>
    </div>
  </div>

  <!-- SEO BLOG INTRO TOOL (Premium) -->
  <div class="tool-panel" id="panel-seo-intro">
    <div class="input-panel">
      <div class="panel-title"><span>🔍</span> SEO Blog Intro Writer <span class="tier-tag premium">💎 Premium</span></div>
      <div class="tier-gate-banner" id="seo-intro-gate">
        <div class="tier-gate-icon">💎</div>
        <div class="tier-gate-text"><strong>Premium Feature</strong><br>Upgrade to Premium to use this tool and unlock unlimited generations.</div>
        <a href="/account" class="tier-gate-btn">Upgrade to Premium →</a>
      </div>
      <label>Blog title or topic</label>
      <input type="text" id="seo-title" placeholder="e.g. 10 Best Budget Travel Tips for Europe in 2026" maxlength="200">
      <label>Primary SEO keyword <span style="color:var(--text3);font-weight:400">(optional)</span></label>
      <input type="text" id="seo-kw" placeholder="e.g. budget travel Europe">
      <label>Target audience <span style="color:var(--text3);font-weight:400">(optional)</span></label>
      <input type="text" id="seo-aud" placeholder="e.g. college students, travel beginners">
      <label>Tone</label>
      <div class="toggle-group" id="seo-tone">
        <span class="toggle on" data-v="Professional">💼 Professional</span>
        <span class="toggle" data-v="Conversational">💬 Conversational</span>
        <span class="toggle" data-v="Expert">🎓 Expert</span>
      </div>
      <label>Language</label>
      <select id="seo-lang">${LANGUAGE_OPTIONS}</select>
      <button class="generate-btn gbtn-pink" id="seo-btn" onclick="genSeoIntro()">
        <span class="spin" id="seo-spin"></span> Write SEO intro
      </button>
    </div>
    <div class="output-panel">
      <div class="out-empty" id="seo-empty">
        <div class="out-empty-icon">🔍</div>
        <div class="out-empty-text">Your SEO intro will appear here</div>
      </div>
      <div class="out-result" id="seo-result">
        <div class="out-topbar">
          <span class="out-label">Your SEO intro</span>
          <button class="copy-btn" id="seo-copy-btn" onclick="copyOut('seo-text','seo-copy-btn')">Copy</button>
          <button class="copy-btn" id="seo-save-btn" onclick="saveOutput('seo-intro','seo-save-btn')">❤️ Save</button>
        </div>
        <div class="out-text" id="seo-text"></div>
      </div>
    </div>
  </div>

  <!-- CONTENT REPURPOSER TOOL (Premium) -->
  <div class="tool-panel" id="panel-repurpose">
    <div class="input-panel">
      <div class="panel-title"><span>🔄</span> Content Repurposer <span class="tier-tag premium">💎 Premium</span></div>
      <div class="tier-gate-banner" id="repurpose-gate">
        <div class="tier-gate-icon">💎</div>
        <div class="tier-gate-text"><strong>Premium Feature</strong><br>Upgrade to Premium to repurpose content across all platforms automatically.</div>
        <a href="/account" class="tier-gate-btn">Upgrade to Premium →</a>
      </div>
      <label>Your original content</label>
      <textarea id="rp-content" placeholder="Paste your Instagram caption, tweet, or any post here..." style="min-height:120px"></textarea>
      <label>Source platform</label>
      <select id="rp-source"><option>Instagram</option><option>Twitter/X</option><option>LinkedIn</option><option>TikTok</option><option>Facebook</option><option>YouTube</option></select>
      <label>Repurpose to <span style="color:var(--text3);font-weight:400">(select multiple)</span></label>
      <div class="toggle-group multi" id="rp-targets">
        <span class="toggle" data-v="Instagram">📸 Instagram</span>
        <span class="toggle on" data-v="LinkedIn">💼 LinkedIn</span>
        <span class="toggle on" data-v="Twitter/X">🐦 Twitter/X</span>
        <span class="toggle on" data-v="TikTok">🎵 TikTok</span>
        <span class="toggle" data-v="Facebook">👥 Facebook</span>
      </div>
      <label>Language</label>
      <select id="rp-lang">${LANGUAGE_OPTIONS}</select>
      <button class="generate-btn gbtn-teal" id="rp-btn" onclick="genRepurpose()">
        <span class="spin" id="rp-spin"></span> Repurpose content
      </button>
    </div>
    <div class="output-panel">
      <div class="out-empty" id="rp-empty">
        <div class="out-empty-icon">🔄</div>
        <div class="out-empty-text">Your repurposed versions will appear here</div>
      </div>
      <div class="out-result" id="rp-result">
        <div class="out-topbar">
          <span class="out-label">Repurposed versions</span>
          <button class="copy-btn" id="rp-copy-btn" onclick="copyOut('rp-text','rp-copy-btn')">Copy all</button>
          <button class="copy-btn" id="rp-save-btn" onclick="saveOutput('repurpose','rp-save-btn')">❤️ Save</button>
        </div>
        <div class="idea-list" id="rp-versions"></div>
        <div class="out-text" id="rp-text" style="display:none"></div>
      </div>
    </div>
  </div>

  <!-- YOUTUBE DESCRIPTION TOOL (Premium) -->
  <div class="tool-panel" id="panel-youtube-desc">
    <div class="input-panel">
      <div class="panel-title"><span>▶️</span> YouTube Description Writer <span class="tier-tag premium">💎 Premium</span></div>
      <div class="tier-gate-banner" id="youtube-desc-gate">
        <div class="tier-gate-icon">💎</div>
        <div class="tier-gate-text"><strong>Premium Feature</strong><br>Upgrade to Premium to write SEO-optimized YouTube descriptions in seconds.</div>
        <a href="/account" class="tier-gate-btn">Upgrade to Premium →</a>
      </div>
      <label>Video title or topic</label>
      <input type="text" id="yt-title" placeholder="e.g. I Lived on $20/day in Tokyo for 7 Days" maxlength="200">
      <label>Keywords to include <span style="color:var(--text3);font-weight:400">(comma separated)</span></label>
      <input type="text" id="yt-kw" placeholder="e.g. Tokyo budget travel, cheap Japan, travel tips">
      <label>Channel niche <span style="color:var(--text3);font-weight:400">(optional)</span></label>
      <input type="text" id="yt-niche" placeholder="e.g. budget travel, tech reviews, cooking">
      <label>Language</label>
      <select id="yt-lang">${LANGUAGE_OPTIONS}</select>
      <button class="generate-btn gbtn-amber" id="yt-btn" onclick="genYoutubeDesc()">
        <span class="spin" id="yt-spin"></span> Write description
      </button>
    </div>
    <div class="output-panel">
      <div class="out-empty" id="yt-empty">
        <div class="out-empty-icon">▶️</div>
        <div class="out-empty-text">Your YouTube description will appear here</div>
      </div>
      <div class="out-result" id="yt-result">
        <div class="out-topbar">
          <span class="out-label">Your description</span>
          <button class="copy-btn" id="yt-copy-btn" onclick="copyOut('yt-text','yt-copy-btn')">Copy</button>
          <button class="copy-btn" id="yt-save-btn" onclick="saveOutput('youtube-desc','yt-save-btn')">❤️ Save</button>
        </div>
        <div class="out-text" id="yt-text" style="white-space:pre-wrap"></div>
      </div>
    </div>
  </div>

  <!-- EMAIL SUBJECT LINES TOOL (Premium) -->
  <div class="tool-panel" id="panel-email-subject">
    <div class="input-panel">
      <div class="panel-title"><span>📧</span> Email Subject Lines <span class="tier-tag premium">💎 Premium</span></div>
      <div class="tier-gate-banner" id="email-subject-gate">
        <div class="tier-gate-icon">💎</div>
        <div class="tier-gate-text"><strong>Premium Feature</strong><br>Upgrade to Premium to generate high-converting email subject lines instantly.</div>
        <a href="/account" class="tier-gate-btn">Upgrade to Premium →</a>
      </div>
      <label>Email topic or offer</label>
      <input type="text" id="es-topic" placeholder="e.g. 50% off sale ending tonight, new product launch" maxlength="150">
      <div class="form-row">
        <div>
          <label>Tone</label>
          <div class="toggle-group" id="es-tone">
            <span class="toggle on" data-v="Friendly">😊 Friendly</span>
            <span class="toggle" data-v="Urgent">⚡ Urgent</span>
            <span class="toggle" data-v="Professional">💼 Professional</span>
            <span class="toggle" data-v="Curious">🤔 Curious</span>
          </div>
        </div>
        <div>
          <label>Number of lines</label>
          <select id="es-count"><option value="5">5 lines</option><option value="10" selected>10 lines</option></select>
        </div>
      </div>
      <label>Language</label>
      <select id="es-lang">${LANGUAGE_OPTIONS}</select>
      <button class="generate-btn gbtn-purple" id="es-btn" onclick="genEmailSubject()">
        <span class="spin" id="es-spin"></span> Generate subject lines
      </button>
    </div>
    <div class="output-panel">
      <div class="out-empty" id="es-empty">
        <div class="out-empty-icon">📧</div>
        <div class="out-empty-text">Your subject lines will appear here</div>
      </div>
      <div class="out-result" id="es-result">
        <div class="out-topbar">
          <span class="out-label">Your subject lines</span>
          <button class="copy-btn" id="es-copy-btn" onclick="copyOut('es-text','es-copy-btn')">Copy all</button>
          <button class="copy-btn" id="es-save-btn" onclick="saveOutput('email-subject','es-save-btn')">❤️ Save</button>
        </div>
        <div class="idea-list" id="es-lines"></div>
        <div class="out-text" id="es-text" style="display:none"></div>
      </div>
    </div>
  </div>

  <!-- CTA WRITER TOOL (Premium) -->
  <div class="tool-panel" id="panel-cta">
    <div class="input-panel">
      <div class="panel-title"><span>📣</span> CTA Generator <span class="tier-tag premium">💎 Premium</span></div>
      <div class="tier-gate-banner" id="cta-gate">
        <div class="tier-gate-icon">💎</div>
        <div class="tier-gate-text"><strong>Premium Feature</strong><br>Upgrade to Premium to generate powerful call-to-actions for any product or platform.</div>
        <a href="/account" class="tier-gate-btn">Upgrade to Premium →</a>
      </div>
      <label>Product or service</label>
      <input type="text" id="cta-product" placeholder="e.g. online photography course, handmade jewellery shop" maxlength="150">
      <div class="form-row">
        <div>
          <label>Goal</label>
          <select id="cta-goal"><option>Follow</option><option>Buy</option><option>Subscribe</option><option>Sign up</option><option>Click link</option><option>Book now</option><option>Download</option></select>
        </div>
        <div>
          <label>Platform</label>
          <select id="cta-plat"><option>Instagram</option><option>TikTok</option><option>LinkedIn</option><option>Twitter/X</option><option>Email</option><option>Website</option></select>
        </div>
      </div>
      <label>Tone</label>
      <div class="toggle-group" id="cta-tone">
        <span class="toggle on" data-v="Friendly">😊 Friendly</span>
        <span class="toggle" data-v="Urgent">⚡ Urgent</span>
        <span class="toggle" data-v="Playful">🎉 Playful</span>
        <span class="toggle" data-v="Professional">💼 Professional</span>
      </div>
      <label>Language</label>
      <select id="cta-lang">${LANGUAGE_OPTIONS}</select>
      <button class="generate-btn gbtn-pink" id="cta-btn" onclick="genCta()">
        <span class="spin" id="cta-spin"></span> Generate CTAs
      </button>
    </div>
    <div class="output-panel">
      <div class="out-empty" id="cta-empty">
        <div class="out-empty-icon">📣</div>
        <div class="out-empty-text">Your CTAs will appear here</div>
      </div>
      <div class="out-result" id="cta-result">
        <div class="out-topbar">
          <span class="out-label">Your CTAs</span>
          <button class="copy-btn" id="cta-copy-btn" onclick="copyOut('cta-text','cta-copy-btn')">Copy all</button>
          <button class="copy-btn" id="cta-save-btn" onclick="saveOutput('cta','cta-save-btn')">❤️ Save</button>
        </div>
        <div class="idea-list" id="cta-lines"></div>
        <div class="out-text" id="cta-text" style="display:none"></div>
      </div>
    </div>
  </div>

  <!-- AD COPY WRITER TOOL (Pro) -->
  <div class="tool-panel" id="panel-ad-copy">
    <div class="input-panel">
      <div class="panel-title"><span>🎯</span> Ad Copy Writer <span class="tier-tag pro">👑 Pro</span></div>
      <div class="tier-gate-banner pro-gate" id="ad-copy-gate">
        <div class="tier-gate-icon">👑</div>
        <div class="tier-gate-text"><strong>Pro Feature</strong><br>Upgrade to Pro to generate professional ad copy for Facebook, Instagram, Google, and TikTok.</div>
        <a href="/account" class="tier-gate-btn pro-btn">Upgrade to Pro →</a>
      </div>
      <label>Product or service</label>
      <input type="text" id="ad-product" placeholder="e.g. AI meal planning app, handmade soy candles" maxlength="150">
      <label>Key benefit</label>
      <input type="text" id="ad-benefit" placeholder="e.g. saves 3 hours a week, made from natural ingredients">
      <label>Target audience</label>
      <input type="text" id="ad-audience" placeholder="e.g. busy moms 30-45, fitness enthusiasts">
      <div class="form-row">
        <div>
          <label>Platform</label>
          <select id="ad-plat"><option>Facebook/Instagram</option><option>Google</option><option>TikTok</option><option>LinkedIn</option></select>
        </div>
        <div>
          <label>Campaign objective</label>
          <select id="ad-obj"><option>Conversions</option><option>Brand Awareness</option><option>Traffic</option><option>Lead Generation</option><option>App Installs</option></select>
        </div>
      </div>
      <label>Language</label>
      <select id="ad-lang">${LANGUAGE_OPTIONS}</select>
      <button class="generate-btn gbtn-teal" id="ad-btn" onclick="genAdCopy()">
        <span class="spin" id="ad-spin"></span> Generate ad copy
      </button>
    </div>
    <div class="output-panel">
      <div class="out-empty" id="ad-empty">
        <div class="out-empty-icon">🎯</div>
        <div class="out-empty-text">Your ad copy variations will appear here</div>
      </div>
      <div class="out-result" id="ad-result">
        <div class="out-topbar">
          <span class="out-label">Your ad copy</span>
          <button class="copy-btn" id="ad-copy-btn" onclick="copyOut('ad-text','ad-copy-btn')">Copy all</button>
          <button class="copy-btn" id="ad-save-btn" onclick="saveOutput('ad-copy','ad-save-btn')">❤️ Save</button>
        </div>
        <div class="idea-list" id="ad-variations"></div>
        <div class="out-text" id="ad-text" style="display:none"></div>
      </div>
    </div>
  </div>

  <!-- VIRAL HOOK GENERATOR (Pro) -->
  <div class="tool-panel" id="panel-viral-hook">
    <div class="input-panel">
      <div class="panel-title"><span>🚀</span> Viral Hook Generator <span class="tier-tag pro">👑 Pro</span></div>
      <div class="tier-gate-banner pro-gate" id="viral-hook-gate">
        <div class="tier-gate-icon">👑</div>
        <div class="tier-gate-text"><strong>Pro Feature</strong><br>Upgrade to Pro to generate scroll-stopping viral hooks for TikTok, Reels, and YouTube Shorts.</div>
        <a href="/account" class="tier-gate-btn pro-btn">Upgrade to Pro →</a>
      </div>
      <label>Topic or niche</label>
      <input type="text" id="vh-topic" placeholder="e.g. productivity habits, investing for beginners, skincare routines" maxlength="150">
      <div class="form-row">
        <div>
          <label>Platform</label>
          <select id="vh-plat"><option>TikTok</option><option>Instagram Reels</option><option>YouTube Shorts</option><option>Twitter/X</option></select>
        </div>
        <div>
          <label>Number of hooks</label>
          <select id="vh-count"><option value="5">5 hooks</option><option value="10" selected>10 hooks</option><option value="15">15 hooks</option></select>
        </div>
      </div>
      <label>Content style</label>
      <div class="toggle-group" id="vh-style">
        <span class="toggle on amber" data-v="Educational">📚 Educational</span>
        <span class="toggle amber" data-v="Entertainment">😄 Entertainment</span>
        <span class="toggle amber" data-v="Storytelling">📖 Storytelling</span>
        <span class="toggle amber" data-v="Motivational">🔥 Motivational</span>
      </div>
      <label>Language</label>
      <select id="vh-lang">${LANGUAGE_OPTIONS}</select>
      <button class="generate-btn gbtn-amber" id="vh-btn" onclick="genViralHook()">
        <span class="spin" id="vh-spin"></span> Generate viral hooks
      </button>
    </div>
    <div class="output-panel">
      <div class="out-empty" id="vh-empty">
        <div class="out-empty-icon">🚀</div>
        <div class="out-empty-text">Your viral hooks will appear here</div>
      </div>
      <div class="out-result" id="vh-result">
        <div class="out-topbar">
          <span class="out-label">Your viral hooks</span>
          <button class="copy-btn" id="vh-copy-btn" onclick="copyOut('vh-text','vh-copy-btn')">Copy all</button>
          <button class="copy-btn" id="vh-save-btn" onclick="saveOutput('viral-hook','vh-save-btn')">❤️ Save</button>
        </div>
        <div class="idea-list" id="vh-hooks"></div>
        <div class="out-text" id="vh-text" style="display:none"></div>
      </div>
    </div>
  </div>

  <!-- TECHNICAL WRITING ASSISTANT (Pro) -->
  <div class="tool-panel" id="panel-tech-writing">
    <div class="input-panel">
      <div class="panel-title"><span>📝</span> Technical Writing Assistant <span class="tier-tag pro">👑 Pro</span></div>
      <div class="tier-gate-banner pro-gate" id="tech-writing-gate">
        <div class="tier-gate-icon">👑</div>
        <div class="tier-gate-text"><strong>Pro Feature</strong><br>Upgrade to Pro to write how-to guides, tutorials, documentation, and FAQs with AI.</div>
        <a href="/account" class="tier-gate-btn pro-btn">Upgrade to Pro →</a>
      </div>
      <label>Topic</label>
      <input type="text" id="tw-topic" placeholder="e.g. How to set up a Shopify store, REST API authentication" maxlength="200">
      <div class="form-row">
        <div>
          <label>Content type</label>
          <select id="tw-type"><option>How-to Guide</option><option>Tutorial</option><option>Documentation</option><option>FAQ</option></select>
        </div>
        <div>
          <label>Audience expertise</label>
          <select id="tw-expertise"><option>Beginner</option><option>Intermediate</option><option>Expert</option></select>
        </div>
      </div>
      <label>Language</label>
      <select id="tw-lang">${LANGUAGE_OPTIONS}</select>
      <button class="generate-btn gbtn-purple" id="tw-btn" onclick="genTechWriting()">
        <span class="spin" id="tw-spin"></span> Generate content
      </button>
    </div>
    <div class="output-panel">
      <div class="out-empty" id="tw-empty">
        <div class="out-empty-icon">📝</div>
        <div class="out-empty-text">Your technical content will appear here</div>
      </div>
      <div class="out-result" id="tw-result">
        <div class="out-topbar">
          <span class="out-label">Your content</span>
          <button class="copy-btn" id="tw-copy-btn" onclick="copyOut('tw-text','tw-copy-btn')">Copy</button>
          <button class="copy-btn" id="tw-save-btn" onclick="saveOutput('tech-writing','tw-save-btn')">❤️ Save</button>
        </div>
        <div class="out-text" id="tw-text" style="white-space:pre-wrap"></div>
      </div>
    </div>
  </div>

  <!-- PITCH WRITER (Pro) -->
  <div class="tool-panel" id="panel-pitch">
    <div class="input-panel">
      <div class="panel-title"><span>🤝</span> Brand Pitch Writer <span class="tier-tag pro">👑 Pro</span></div>
      <div class="tier-gate-banner pro-gate" id="pitch-gate">
        <div class="tier-gate-icon">👑</div>
        <div class="tier-gate-text"><strong>Pro Feature</strong><br>Upgrade to Pro to write professional brand collaboration pitches that get replies.</div>
        <a href="/account" class="tier-gate-btn pro-btn">Upgrade to Pro →</a>
      </div>
      <div class="form-row">
        <div>
          <label>Your name or handle</label>
          <input type="text" id="pt-name" placeholder="e.g. Alex or @alexcreates">
        </div>
        <div>
          <label>Your niche</label>
          <input type="text" id="pt-niche" placeholder="e.g. travel photography, fitness & wellness">
        </div>
      </div>
      <label>Your stats / reach <span style="color:var(--text3);font-weight:400">(optional)</span></label>
      <input type="text" id="pt-stats" placeholder="e.g. 45k Instagram followers, 500k TikTok views/month">
      <label>Brand to pitch</label>
      <input type="text" id="pt-brand" placeholder="e.g. Gymshark, Airbnb, a local coffee brand">
      <label>What you are offering</label>
      <input type="text" id="pt-offer" placeholder="e.g. sponsored post, product review, long-term ambassador deal">
      <label>Pitch format</label>
      <div class="toggle-group" id="pt-format">
        <span class="toggle on" data-v="Email">📩 Email</span>
        <span class="toggle" data-v="DM">💬 DM</span>
        <span class="toggle" data-v="LinkedIn">💼 LinkedIn</span>
      </div>
      <label>Language</label>
      <select id="pt-lang">${LANGUAGE_OPTIONS}</select>
      <button class="generate-btn gbtn-pink" id="pt-btn" onclick="genPitch()">
        <span class="spin" id="pt-spin"></span> Write my pitch
      </button>
    </div>
    <div class="output-panel">
      <div class="out-empty" id="pt-empty">
        <div class="out-empty-icon">🤝</div>
        <div class="out-empty-text">Your pitch will appear here</div>
      </div>
      <div class="out-result" id="pt-result">
        <div class="out-topbar">
          <span class="out-label">Your pitch</span>
          <button class="copy-btn" id="pt-copy-btn" onclick="copyOut('pt-text','pt-copy-btn')">Copy</button>
          <button class="copy-btn" id="pt-save-btn" onclick="saveOutput('pitch','pt-save-btn')">❤️ Save</button>
        </div>
        <div class="out-text" id="pt-text" style="white-space:pre-wrap"></div>
      </div>
    </div>
  </div>

</div>

<!-- AD SLOT -->
<div class="ad-slot"><ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-4230227200458981"
     data-ad-slot="auto"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins></div>

<!-- FAQ -->
<div class="faq-section" id="faq">
  <div class="section-tag">FAQ</div>
  <h2 class="section-title" style="margin-bottom:32px">Common questions</h2>
  <div class="faq-item">
    <div class="faq-q" onclick="toggleFaq(this)">Is SocialToolkit completely free?</div>
    <div class="faq-a">Yes! All 4 tools are 100% free to use with no account, no credit card, and no hidden fees. We keep the lights on with the small ads you see on the page.</div>
  </div>
  <div class="faq-item">
    <div class="faq-q" onclick="toggleFaq(this)">Do you store my data?</div>
    <div class="faq-a">We take your privacy seriously. Information you enter is used only to generate your results and is not sold to third parties. Please read our Privacy Policy for full details.</div>
  </div>
  <div class="faq-item">
    <div class="faq-q" onclick="toggleFaq(this)">Which platforms do the tools support?</div>
    <div class="faq-a">Our tools support Instagram, TikTok, YouTube, Facebook, Twitter/X, and LinkedIn. Each tool is optimized for the specific character limits and styles of each platform.</div>
  </div>
  <div class="faq-item">
    <div class="faq-q" onclick="toggleFaq(this)">How many times can I use the tools?</div>
    <div class="faq-a">Free users get 10 generations per day across all tools — that's plenty to get started. The daily limit resets at midnight UTC. Upgrade to Premium for unlimited generations, or Pro for unlimited access plus advanced tools like Ad Copy, Viral Hooks, Technical Writing, and Brand Pitch Writer.</div>
  </div>
  <div class="faq-item">
    <div class="faq-q" onclick="toggleFaq(this)">Can I use this on my phone?</div>
    <div class="faq-a">Absolutely! SocialToolkit is fully optimized for mobile phones and tablets. It works on all devices and browsers.</div>
  </div>
</div>

<!-- CTA BANNER -->
<div class="cta-banner">
  <h2>Start creating better content today</h2>
  <p>Free AI tools for every creator. No sign up required. No credit card needed.</p>
  <a href="#tools" class="btn-hero btn-hero-primary">Try all tools free →</a>
</div>

<!-- AD SLOT -->
<div class="ad-slot"><ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-4230227200458981"
     data-ad-slot="auto"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins></div>

<!-- Recommended Tools / Affiliate Section -->
<div class="affiliate-section">
  <div class="affiliate-inner">
    <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#818cf8;margin-bottom:10px">Recommended tools</div>
    <div style="font-family:var(--fh);font-size:clamp(22px,3vw,30px);font-weight:800;letter-spacing:-1px;color:rgba(255,255,255,0.9);margin-bottom:6px">Tools we love for creators</div>
    <p style="font-size:14px;color:rgba(255,255,255,0.38);margin-bottom:24px;font-weight:300">These tools work perfectly alongside SocialToolkit to help you grow faster.</p>
    <div class="affiliate-grid">
      <a class="affiliate-card" href="https://www.canva.com" target="_blank" rel="noopener">
        <div class="affiliate-icon" style="background:rgba(219,39,119,0.15)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f9a8d4" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="13.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="10.5" r="2.5"/><circle cx="8.5" cy="7.5" r="2.5"/><circle cx="6.5" cy="12.5" r="2.5"/><path d="M12 22c4.97 0 9-2.69 9-6s-4.03-6-9-6-9 2.69-9 6 4.03 6 9 6z"/></svg>
        </div>
        <div><div class="affiliate-name">Canva</div><div class="affiliate-desc">Design thumbnails, posts and graphics in minutes. Perfect for creators.</div></div>
        <div class="affiliate-badge badge-free">Free plan</div>
        <div class="affiliate-link">Try free <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17L17 7M7 7h10v10"/></svg></div>
      </a>
      <a class="affiliate-card" href="https://www.tubebuddy.com" target="_blank" rel="noopener">
        <div class="affiliate-icon" style="background:rgba(245,158,11,0.15)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fcd34d" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>
        </div>
        <div><div class="affiliate-name">TubeBuddy</div><div class="affiliate-desc">Grow your YouTube channel faster with SEO tools and analytics.</div></div>
        <div class="affiliate-badge badge-free">Free plan</div>
        <div class="affiliate-link">Try free <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17L17 7M7 7h10v10"/></svg></div>
      </a>
      <a class="affiliate-card" href="https://vidiq.com" target="_blank" rel="noopener">
        <div class="affiliate-icon" style="background:rgba(99,102,241,0.15)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a5b4fc" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2" fill="#a5b4fc" stroke="none"/></svg>
        </div>
        <div><div class="affiliate-name">VidIQ</div><div class="affiliate-desc">Find trending topics and optimize your YouTube videos for more views.</div></div>
        <div class="affiliate-badge badge-free">Free plan</div>
        <div class="affiliate-link">Try free <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17L17 7M7 7h10v10"/></svg></div>
      </a>
      <a class="affiliate-card" href="https://www.capcut.com" target="_blank" rel="noopener">
        <div class="affiliate-icon" style="background:rgba(16,185,129,0.15)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="2"/><path d="M7 2v20"/><path d="M17 2v20"/><path d="M2 12h20"/><path d="M2 7h5"/><path d="M2 17h5"/><path d="M17 17h5"/><path d="M17 7h5"/></svg>
        </div>
        <div><div class="affiliate-name">CapCut</div><div class="affiliate-desc">Edit videos for TikTok, Instagram Reels and YouTube Shorts with AI.</div></div>
        <div class="affiliate-badge badge-free">Free</div>
        <div class="affiliate-link">Try free <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17L17 7M7 7h10v10"/></svg></div>
      </a>
    </div>
  </div>
</div>

<footer>
  <div class="footer-inner">
    <div class="footer-top">
      <div class="footer-brand">
        <a class="logo" href="#" style="margin-bottom:0">
          <div class="logo-mark"><svg width="36" height="36" viewBox="0 0 36 36" role="img" aria-label="SocialToolkit logo"><rect width="36" height="36" rx="9" fill="#0e0e16"/><rect x="7" y="21" width="5" height="9" rx="2" fill="#5b4fff"/><rect x="14" y="16" width="5" height="14" rx="2" fill="#7c6dff"/><rect x="21" y="10" width="5" height="20" rx="2" fill="#ff4f9b"/><circle cx="30" cy="8" r="5" fill="#00e5a0"/><text x="30" y="11" font-family="system-ui,sans-serif" font-size="5" font-weight="800" fill="#060610" text-anchor="middle">AI</text></svg></div> SocialToolkit
        </a>
        <p>Free AI-powered tools to help content creators save time and create better content.</p>
      </div>
      <div>
        <div class="footer-col-title">Tools</div>
        <div class="footer-links">
          <a href="#" onclick="switchTabByName('hashtag')">Hashtag Generator</a>
          <a href="#" onclick="switchTabByName('caption')">Caption Writer</a>
          <a href="#" onclick="switchTabByName('bio')">Bio Maker</a>
          <a href="#" onclick="switchTabByName('ideas')">Video Ideas</a>
          <a href="#" onclick="switchTabByName('thread')">Thread Writer</a>
          <a href="#" onclick="switchTabByName('seo-intro')">SEO Blog Intro 💎</a>
          <a href="#" onclick="switchTabByName('repurpose')">Content Repurposer 💎</a>
          <a href="#" onclick="switchTabByName('ad-copy')">Ad Copy Writer 👑</a>
          <a href="#" onclick="switchTabByName('viral-hook')">Viral Hook Generator 👑</a>
          <a href="#" onclick="switchTabByName('pitch')">Brand Pitch Writer 👑</a>
        </div>
      </div>
      <div>
        <div class="footer-col-title">Platforms</div>
        <div class="footer-links">
          <a href="#">Instagram Tools</a>
          <a href="#">TikTok Tools</a>
          <a href="#">YouTube Tools</a>
          <a href="#">Facebook Tools</a>
        </div>
      </div>
      <div>
        <div class="footer-col-title">Company</div>
        <div class="footer-links">
          <a href="/about">About us</a>
          <a href="/privacy">Privacy policy</a>
          <a href="/terms">Terms of use</a>
          <a href="/contact">Contact</a>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <div class="footer-copy">© 2026 SocialToolkit. All rights reserved.</div>
      <div class="footer-legal">
        <a href="/privacy">Privacy Policy</a>
        <a href="/terms">Terms of Use</a>
        <a href="/contact">Contact</a>
      </div>
    </div>
  </div>
</footer>
`;
