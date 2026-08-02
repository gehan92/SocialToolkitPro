/* Generation calls now go through our own backend (/api/generate/*)
   instead of calling Gemini directly with a key exposed in the browser. */
async function callApi(endpoint, payload) {
  try {
    const headers = { "Content-Type": "application/json" };
    if (window.__stAccessToken) headers["Authorization"] = "Bearer " + window.__stAccessToken;
    const r = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    const d = await r.json();
    if (!d.success) {
      if (r.status === 429) {
        showLimitReachedModal(d.resetAt);
        const err = new Error(d.error || "Daily limit reached");
        err.handled = true;
        throw err;
      }
      throw new Error(d.error || "Generation failed. Please try again.");
    }
    return d.data;
  } catch (e) {
    if (e.message.includes("Failed to fetch")) throw new Error("Network error - check your internet connection");
    throw e;
  }
}

/* Daily free-limit reached — a proper modal instead of a raw alert().
   Shows a reset time and an upgrade nudge, but never the exact free-generation count. */
function formatResetIn(resetAt) {
  const diffMs = new Date(resetAt) - new Date();
  if (!resetAt || diffMs <= 0) return "shortly";
  const totalMins = Math.ceil(diffMs / 60000);
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  if (hours > 0 && mins > 0) return hours + "h " + mins + "m";
  if (hours > 0) return hours + "h";
  return mins + "m";
}

function showLimitReachedModal(resetAt) {
  const existing = document.getElementById("limit-modal-backdrop");
  if (existing) existing.remove();

  const backdrop = document.createElement("div");
  backdrop.id = "limit-modal-backdrop";
  backdrop.className = "limit-modal-backdrop";
  backdrop.onclick = (e) => {
    if (e.target === backdrop) backdrop.remove();
  };

  backdrop.innerHTML =
    '<div class="limit-modal">' +
      '<div class="limit-modal-icon">⏳</div>' +
      '<div class="limit-modal-title">You\'ve used today\'s free generations</div>' +
      '<div class="limit-modal-text">Come back after it resets, or upgrade now for unlimited generations.</div>' +
      '<div class="limit-modal-reset">Resets in ' + formatResetIn(resetAt) + '</div>' +
      '<div class="limit-modal-btns">' +
        '<a href="/account" class="limit-modal-upgrade">Upgrade to Premium</a>' +
        '<button type="button" class="limit-modal-close">Maybe later</button>' +
      '</div>' +
    '</div>';

  document.body.appendChild(backdrop);
  backdrop.querySelector(".limit-modal-close").onclick = () => backdrop.remove();
}

function load(btnId, spinId, on) {
  document.getElementById(btnId).disabled = on;
  document.getElementById(spinId).classList.toggle("v", on);
}
function showResult(emptyId, resultId) {
  document.getElementById(emptyId).style.display = "none";
  document.getElementById(resultId).classList.add("show");
}

/* TAB SWITCHING */
function switchTab(name, btn) {
  document.querySelectorAll(".tool-panel").forEach((p) => p.classList.remove("active"));
  document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
  document.getElementById("panel-" + name).classList.add("active");
  btn.classList.add("active");
  document.getElementById("tools").scrollIntoView({ behavior: "smooth", block: "start" });
}
function switchTabByName(name) {
  const btn = document.querySelector(`.tab-btn[onclick*="'${name}'"]`);
  if (btn) switchTab(name, btn);
  document.getElementById("tools").scrollIntoView({ behavior: "smooth" });
  return false;
}

/* SINGLE SELECT TOGGLES */
function bindToggle(groupId, cls) {
  document.getElementById(groupId).addEventListener("click", (e) => {
    const t = e.target.closest(".toggle");
    if (!t) return;
    if (t.dataset.premium === "true" && (window.__stUserTier || "free") === "free") {
      alert("The \"" + t.dataset.v + "\" tone is a Premium feature. Upgrade to unlock more tones.");
      return;
    }
    document.querySelectorAll("#" + groupId + " .toggle").forEach((x) => {
      x.classList.remove("on");
      if (cls) x.classList.remove(cls);
    });
    t.classList.add("on");
    if (cls) t.classList.add(cls);

    if (groupId === "cap-tone") {
      const wrap = document.getElementById("cap-custom-voice-wrap");
      if (wrap) wrap.style.display = t.dataset.v === "Custom" ? "block" : "none";
    }
  });
}
function getToggle(groupId) {
  const s = document.querySelector("#" + groupId + " .toggle.on");
  return s ? s.dataset.v : "";
}
function setToggle(groupId, value, cls) {
  const target = document.querySelector(`#${groupId} .toggle[data-v="${value}"]`);
  if (!target) return;
  document.querySelectorAll(`#${groupId} .toggle`).forEach((x) => {
    x.classList.remove("on");
    if (cls) x.classList.remove(cls);
  });
  target.classList.add("on");
  if (cls) target.classList.add(cls);
}
bindToggle("ht-plat", "");
bindToggle("cap-tone", "pink");
bindToggle("vid-style", "amber");
bindToggle("thr-tone", "");
bindToggle("seo-tone", "");
bindToggle("es-tone", "");
bindToggle("cta-tone", "");
bindToggle("vh-style", "amber");
bindToggle("pt-format", "");

/* Multi-select toggle group for repurpose targets */
(function () {
  const group = document.getElementById("rp-targets");
  if (!group) return;
  group.addEventListener("click", (e) => {
    const t = e.target.closest(".toggle");
    if (!t) return;
    t.classList.toggle("on");
  });
})();

/* HASHTAGS */
async function genHashtags() {
  const topic = document.getElementById("ht-topic").value.trim();
  if (!topic) {
    alert("Please enter a topic!");
    return;
  }
  const plat = getToggle("ht-plat") || "Instagram";
  const count = document.getElementById("ht-count").value;
  const lang = document.getElementById("ht-lang").value;
  load("ht-btn", "ht-spin", true);
  try {
    const res = await callApi("/api/generate/hashtags", { topic, platform: plat, count, language: lang });
    const matches = res.match(/#[\p{L}\p{N}_]+/gu) || [];
    const tags = Array.from(new Set(matches));
    const container = document.getElementById("ht-tags");
    container.innerHTML = "";
    let allTags = "";
    tags.forEach((tag) => {
      allTags += tag + " ";
      const el = document.createElement("span");
      el.className = "htag";
      el.textContent = tag;
      el.title = "Click to copy";
      el.onclick = () => {
        navigator.clipboard.writeText(tag);
        el.classList.add("cp");
        const orig = el.textContent;
        el.textContent = "✓";
        setTimeout(() => {
          el.textContent = orig;
          el.classList.remove("cp");
        }, 1200);
      };
      container.appendChild(el);
    });
    window._allTags = allTags.trim();
    showResult("ht-empty", "ht-result");
  } catch (e) {
    if (!e.handled) alert("Error: " + e.message);
  }
  load("ht-btn", "ht-spin", false);
}
function copyTags() {
  navigator.clipboard.writeText(window._allTags || "");
  const btn = document.getElementById("ht-copy-btn");
  btn.textContent = "✓ Copied!";
  btn.classList.add("done");
  setTimeout(() => {
    btn.textContent = "Copy all";
    btn.classList.remove("done");
  }, 1800);
}

/* CAPTION */
async function genCaption() {
  const desc = document.getElementById("cap-desc").value.trim();
  if (!desc) {
    alert("Please describe your post!");
    return;
  }
  const tone = getToggle("cap-tone") || "Inspirational";
  const plat = document.getElementById("cap-plat").value;
  const length = document.getElementById("cap-len").value;
  const customVoice = tone === "Custom" ? document.getElementById("cap-custom-voice").value.trim() : "";
  const lang = document.getElementById("cap-lang").value;
  load("cap-btn", "cap-spin", true);
  try {
    const res = await callApi("/api/generate/captions", { description: desc, tone, platform: plat, length, customVoice, language: lang });
    document.getElementById("cap-text").textContent = res.trim();
    showResult("cap-empty", "cap-result");
  } catch (e) {
    if (!e.handled) alert("Error: " + e.message);
  }
  load("cap-btn", "cap-spin", false);
}

/* BIO */
async function genBio() {
  const niche = document.getElementById("bio-niche").value.trim();
  if (!niche) {
    alert("Please enter what you do!");
    return;
  }
  const name = document.getElementById("bio-name").value.trim();
  const loc = document.getElementById("bio-loc").value.trim();
  const about = document.getElementById("bio-about").value.trim();
  const plat = document.getElementById("bio-plat").value;
  const vibe = document.getElementById("bio-vibe").value;
  const lang = document.getElementById("bio-lang").value;
  load("bio-btn", "bio-spin", true);
  try {
    const res = await callApi("/api/generate/bios", { niche, name, location: loc, about, platform: plat, vibe, language: lang });
    document.getElementById("bio-text").textContent = res.trim();
    showResult("bio-empty", "bio-result");
  } catch (e) {
    if (!e.handled) alert("Error: " + e.message);
  }
  load("bio-btn", "bio-spin", false);
}

/* VIDEO IDEAS */
async function genIdeas() {
  const niche = document.getElementById("vid-niche").value.trim();
  if (!niche) {
    alert("Please enter your niche!");
    return;
  }
  const aud = document.getElementById("vid-aud").value.trim();
  const plat = document.getElementById("vid-plat").value;
  const count = document.getElementById("vid-count").value;
  const style = getToggle("vid-style") || "Trending & popular";
  const lang = document.getElementById("vid-lang").value;
  load("vid-btn", "vid-spin", true);
  try {
    const res = await callApi("/api/generate/ideas", { niche, audience: aud, platform: plat, count, style, language: lang });

    const container = document.getElementById("vid-ideas");
    container.innerHTML = "";
    let allText = "";

    const lines = res.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
    let ideas = [];
    let currentIdea = null;

    lines.forEach((line) => {
      const numMatch = line.match(/^(\d+)[\.\)\:]\s*(.+)/);
      if (numMatch) {
        if (currentIdea) ideas.push(currentIdea);
        currentIdea = { title: numMatch[2], desc: "" };
      } else if (currentIdea && !line.match(/^\d+[\.\)]/)) {
        currentIdea.desc = line;
      }
    });
    if (currentIdea) ideas.push(currentIdea);

    if (ideas.length === 0) {
      ideas = res
        .split("\n\n")
        .filter((b) => b.trim())
        .map((block, i) => {
          const ls = block.split("\n").filter((l) => l.trim());
          return { title: ls[0]?.replace(/^\d+[\.\)\:]\s*/, "") || `Idea ${i + 1}`, desc: ls[1] || "" };
        });
    }

    ideas.forEach((idea, i) => {
      allText += `${i + 1}. ${idea.title}\n${idea.desc}\n\n`;
      const el = document.createElement("div");
      el.className = "idea-item";
      el.innerHTML = `<div class="idea-title">${i + 1}. ${idea.title}</div>${
        idea.desc ? `<div class="idea-desc">${idea.desc}</div>` : ""
      }`;
      container.appendChild(el);
    });

    document.getElementById("vid-text").textContent = allText.trim();
    showResult("vid-empty", "vid-result");
  } catch (e) {
    if (!e.handled) alert("Error: " + e.message);
  }
  load("vid-btn", "vid-spin", false);
}

function copyOut(textId, btnId) {
  const text = document.getElementById(textId).textContent;
  navigator.clipboard.writeText(text);
  const btn = document.getElementById(btnId);
  btn.textContent = "✓ Copied!";
  btn.classList.add("done");
  setTimeout(() => {
    btn.textContent = "Copy";
    btn.classList.remove("done");
  }, 1800);
}

/* VARIATIONS (Premium feature) - captions & bios */
async function genVariations(type, btnId) {
  if ((window.__stUserTier || "free") === "free") {
    alert("Variations is a Premium feature. Upgrade to generate 5 versions at once.");
    return;
  }

  let endpoint, payload, containerId, emptyId, resultId;
  if (type === "caption") {
    const desc = document.getElementById("cap-desc").value.trim();
    if (!desc) {
      alert("Please describe your post!");
      return;
    }
    const capTone = getToggle("cap-tone") || "Inspirational";
    payload = {
      description: desc,
      tone: capTone,
      platform: document.getElementById("cap-plat").value,
      length: document.getElementById("cap-len").value,
      customVoice: capTone === "Custom" ? document.getElementById("cap-custom-voice").value.trim() : "",
      language: document.getElementById("cap-lang").value,
      variations: true,
    };
    endpoint = "/api/generate/captions";
    containerId = "cap-variations";
    emptyId = "cap-empty";
    resultId = "cap-result";
  } else if (type === "bio") {
    const niche = document.getElementById("bio-niche").value.trim();
    if (!niche) {
      alert("Please enter what you do!");
      return;
    }
    payload = {
      niche,
      name: document.getElementById("bio-name").value.trim(),
      location: document.getElementById("bio-loc").value.trim(),
      about: document.getElementById("bio-about").value.trim(),
      platform: document.getElementById("bio-plat").value,
      vibe: document.getElementById("bio-vibe").value,
      language: document.getElementById("bio-lang").value,
      variations: true,
    };
    endpoint = "/api/generate/bios";
    containerId = "bio-variations";
    emptyId = "bio-empty";
    resultId = "bio-result";
  } else {
    return;
  }

  const spinId = btnId.replace("-btn", "-spin");
  load(btnId, spinId, true);
  try {
    const res = await callApi(endpoint, payload);
    const parts = res
      .split(/^\s*---\s*$/m)
      .map((s) => s.trim())
      .filter(Boolean);
    const container = document.getElementById(containerId);
    container.innerHTML = "";
    parts.forEach((text, i) => {
      const el = document.createElement("div");
      el.className = "idea-item";
      el.style.cursor = "pointer";
      el.title = "Click to copy";
      const titleEl = document.createElement("div");
      titleEl.className = "idea-title";
      titleEl.textContent = `Variation ${i + 1}`;
      const descEl = document.createElement("div");
      descEl.className = "idea-desc";
      descEl.style.whiteSpace = "pre-wrap";
      descEl.textContent = text;
      el.appendChild(titleEl);
      el.appendChild(descEl);
      el.onclick = () => navigator.clipboard.writeText(text);
      container.appendChild(el);
    });
    showResult(emptyId, resultId);
  } catch (e) {
    if (!e.handled) alert("Error: " + e.message);
  }
  load(btnId, spinId, false);
}

/* SAVE / FAVORITES (Premium feature) */
function getOutputContent(type) {
  if (type === "hashtag") return window._allTags || "";
  if (type === "caption") return document.getElementById("cap-text").textContent;
  if (type === "bio") return document.getElementById("bio-text").textContent;
  if (type === "ideas") return document.getElementById("vid-text").textContent;
  return "";
}

async function saveOutput(type, btnId) {
  const btn = document.getElementById(btnId);
  const content = getOutputContent(type);
  if (!content) return;

  if (!window.__stAccessToken) {
    alert("Please log in to save your generations.");
    return;
  }

  const original = btn.textContent;
  btn.disabled = true;
  btn.textContent = "Saving...";
  try {
    const result = await callApi("/api/user/saved", { output_type: type, content, metadata: {} });
    btn.textContent = "✓ Saved";
    btn.classList.add("done");
    setTimeout(() => {
      btn.textContent = original;
      btn.classList.remove("done");
      btn.disabled = false;
    }, 1800);
    void result;
  } catch (e) {
    if (!e.handled) alert("Error: " + e.message);
    btn.textContent = original;
    btn.disabled = false;
  }
}

/* EXPORT PDF / CSV (Premium feature) */
const EXPORT_LABELS = { hashtag: "Hashtags", caption: "Caption", bio: "Bio", ideas: "Video Ideas" };

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function exportOutput(type, format) {
  if ((window.__stUserTier || "free") === "free") {
    alert("Exporting is a Premium feature. Upgrade to export your generations as PDF or CSV.");
    return;
  }

  const content = getOutputContent(type);
  if (!content) {
    alert("Generate something first!");
    return;
  }

  const label = EXPORT_LABELS[type] || type;
  const date = new Date().toISOString().slice(0, 10);
  const filename = `socialtoolkit-${type}-${date}`;

  if (format === "csv") {
    const rows = content
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => `"${l.replace(/"/g, '""')}"`);
    const csv = "Content\n" + rows.join("\n");
    downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8;" }), filename + ".csv");
    return;
  }

  if (format === "pdf") {
    if (!window.jspdf) {
      alert("PDF export is still loading - please try again in a moment.");
      return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`${label} - SocialToolkit`, 14, 18);
    doc.setFontSize(10);
    doc.text(date, 14, 25);
    doc.setFontSize(11);
    doc.text(doc.splitTextToSize(content, 180), 14, 36);
    doc.setFontSize(9);
    doc.text("Created with SocialToolkit", 14, 285);
    doc.save(filename + ".pdf");
  }
}

/* FAQ */
function toggleFaq(q) {
  q.closest(".faq-item").classList.toggle("open");
}

/* SMOOTH SCROLL for anchor links */
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const target = document.querySelector(a.getAttribute("href"));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

/* COOKIE CONSENT */
function acceptCookies() {
  localStorage.setItem("st_cookies", "accepted");
  const b = document.getElementById("cookie-banner");
  if (b) b.classList.add("hidden");
  if (typeof gtag !== "undefined") gtag("consent", "update", { analytics_storage: "granted", ad_storage: "granted" });
}
function declineCookies() {
  localStorage.setItem("st_cookies", "declined");
  const b = document.getElementById("cookie-banner");
  if (b) b.classList.add("hidden");
}
(function () {
  if (localStorage.getItem("st_cookies")) {
    const b = document.getElementById("cookie-banner");
    if (b) b.classList.add("hidden");
  }
})();

/* TIPS TOGGLE */
function toggleTips(id, btn) {
  const box = document.getElementById(id);
  if (!box) return;
  box.classList.toggle("show");
  btn.classList.toggle("open");
}

/* CHARACTER COUNTER */
function addCharCounter(inputId, limit) {
  const el = document.getElementById(inputId);
  if (!el) return;
  const counter = document.createElement("div");
  counter.className = "char-counter";
  counter.textContent = "0 / " + limit;
  el.parentNode.insertBefore(counter, el.nextSibling);
  el.addEventListener("input", function () {
    const len = el.value.length;
    counter.textContent = len + " / " + limit;
    counter.className = "char-counter" + (len > limit * 0.9 ? " warn" : "") + (len > limit ? " over" : "");
  });
}
addCharCounter("cap-desc", 2200);
addCharCounter("bio-about", 150);

/* AdSense disabled - ad slots hidden */

/* QUICK TEMPLATES (Premium feature) */
const TEMPLATE_STORE = { hashtag: {}, caption: {}, bio: {}, ideas: {} };

function collectFormData(type) {
  if (type === "hashtag") {
    return {
      topic: document.getElementById("ht-topic").value,
      platform: getToggle("ht-plat") || "Instagram",
      count: document.getElementById("ht-count").value,
      language: document.getElementById("ht-lang").value,
    };
  }
  if (type === "caption") {
    return {
      description: document.getElementById("cap-desc").value,
      tone: getToggle("cap-tone") || "Inspirational",
      platform: document.getElementById("cap-plat").value,
      length: document.getElementById("cap-len").value,
      customVoice: document.getElementById("cap-custom-voice").value,
      language: document.getElementById("cap-lang").value,
    };
  }
  if (type === "bio") {
    return {
      name: document.getElementById("bio-name").value,
      niche: document.getElementById("bio-niche").value,
      location: document.getElementById("bio-loc").value,
      about: document.getElementById("bio-about").value,
      platform: document.getElementById("bio-plat").value,
      vibe: document.getElementById("bio-vibe").value,
      language: document.getElementById("bio-lang").value,
    };
  }
  if (type === "ideas") {
    return {
      niche: document.getElementById("vid-niche").value,
      audience: document.getElementById("vid-aud").value,
      platform: document.getElementById("vid-plat").value,
      count: document.getElementById("vid-count").value,
      style: getToggle("vid-style") || "Trending & popular",
      language: document.getElementById("vid-lang").value,
    };
  }
  return {};
}

function applyFormData(type, d) {
  if (type === "hashtag") {
    document.getElementById("ht-topic").value = d.topic || "";
    setToggle("ht-plat", d.platform || "Instagram", "");
    document.getElementById("ht-count").value = d.count || "20";
    document.getElementById("ht-lang").value = d.language || "English";
  } else if (type === "caption") {
    document.getElementById("cap-desc").value = d.description || "";
    setToggle("cap-tone", d.tone || "Inspirational", "pink");
    document.getElementById("cap-plat").value = d.platform || "Instagram";
    document.getElementById("cap-len").value = d.length || "medium";
    document.getElementById("cap-custom-voice").value = d.customVoice || "";
    document.getElementById("cap-lang").value = d.language || "English";
    const wrap = document.getElementById("cap-custom-voice-wrap");
    if (wrap) wrap.style.display = d.tone === "Custom" ? "block" : "none";
  } else if (type === "bio") {
    document.getElementById("bio-name").value = d.name || "";
    document.getElementById("bio-niche").value = d.niche || "";
    document.getElementById("bio-loc").value = d.location || "";
    document.getElementById("bio-about").value = d.about || "";
    document.getElementById("bio-plat").value = d.platform || "Instagram";
    document.getElementById("bio-vibe").value = d.vibe || "Fun & playful";
    document.getElementById("bio-lang").value = d.language || "English";
  } else if (type === "ideas") {
    document.getElementById("vid-niche").value = d.niche || "";
    document.getElementById("vid-aud").value = d.audience || "";
    document.getElementById("vid-plat").value = d.platform || "YouTube (long video)";
    document.getElementById("vid-count").value = d.count || "10";
    document.getElementById("vid-lang").value = d.language || "English";
    setToggle("vid-style", d.style || "Trending & popular", "amber");
  }
}

async function loadTemplatesIntoSelect(type) {
  const select = document.getElementById(
    { hashtag: "ht-tpl-select", caption: "cap-tpl-select", bio: "bio-tpl-select", ideas: "vid-tpl-select" }[type]
  );
  if (!select || !window.__stAccessToken) return;

  try {
    const r = await fetch("/api/user/templates", {
      headers: { Authorization: "Bearer " + window.__stAccessToken },
    });
    const d = await r.json();
    if (!d.success) return;

    const mine = d.data.filter((t) => t.tool_type === type);
    TEMPLATE_STORE[type] = {};
    select.innerHTML = '<option value="">📋 Load template...</option>';
    mine.forEach((t) => {
      TEMPLATE_STORE[type][t.id] = t;
      const opt = document.createElement("option");
      opt.value = t.id;
      opt.textContent = t.name;
      select.appendChild(opt);
    });
  } catch (e) {
    /* ignore - templates are a nice-to-have, don't block the page */
  }
}

function initTemplateSelects() {
  ["hashtag", "caption", "bio", "ideas"].forEach((type) => {
    loadTemplatesIntoSelect(type);
    const selectId = { hashtag: "ht-tpl-select", caption: "cap-tpl-select", bio: "bio-tpl-select", ideas: "vid-tpl-select" }[type];
    const select = document.getElementById(selectId);
    if (select) {
      select.addEventListener("change", () => {
        const t = TEMPLATE_STORE[type][select.value];
        if (t) applyFormData(type, t.prompt_data);
      });
    }
  });
}

async function saveTemplate(type) {
  if (!window.__stAccessToken) {
    alert("Please log in to save templates.");
    return;
  }
  if ((window.__stUserTier || "free") === "free") {
    alert("Templates are a Premium feature. Upgrade to save reusable presets.");
    return;
  }
  const name = prompt("Name this template (e.g. \"Coffee shop caption\"):");
  if (!name || !name.trim()) return;

  const promptData = collectFormData(type);
  try {
    const r = await fetch("/api/user/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + window.__stAccessToken },
      body: JSON.stringify({ name: name.trim(), tool_type: type, prompt_data: promptData }),
    });
    const d = await r.json();
    if (!d.success) {
      alert(d.error);
      return;
    }
    loadTemplatesIntoSelect(type);
  } catch (e) {
    if (!e.handled) alert("Error: " + e.message);
  }
}

async function deleteTemplate(type) {
  const selectId = { hashtag: "ht-tpl-select", caption: "cap-tpl-select", bio: "bio-tpl-select", ideas: "vid-tpl-select" }[type];
  const select = document.getElementById(selectId);
  if (!select || !select.value) {
    alert("Select a template first to delete it.");
    return;
  }
  if (!confirm("Delete this template?")) return;

  try {
    await fetch(`/api/user/templates/${select.value}`, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + window.__stAccessToken },
    });
    loadTemplatesIntoSelect(type);
  } catch (e) {
    if (!e.handled) alert("Error: " + e.message);
  }
}

window.addEventListener("st-auth-ready", initTemplateSelects);
if (window.__stAccessToken) initTemplateSelects();

/* ====================================================
   NEW TOOLS — THREAD, SEO INTRO, REPURPOSE, YT DESC,
   EMAIL SUBJECT, CTA, AD COPY, VIRAL HOOK, TECH WRITING, PITCH
   ==================================================== */

/* Tier gate helper — shows upgrade banner for free/non-pro users */
function showTierGate(gateId, show) {
  const el = document.getElementById(gateId);
  if (!el) return;
  el.style.display = show ? "flex" : "none";
}

function updateAllTierGates() {
  const tier = window.__stUserTier || "free";
  const isPremiumOrPro = tier === "premium" || tier === "pro";
  const isPro = tier === "pro";
  // Premium gates
  ["seo-intro-gate", "repurpose-gate", "youtube-desc-gate", "email-subject-gate", "cta-gate"].forEach((id) => {
    showTierGate(id, !isPremiumOrPro);
  });
  // Pro gates
  ["ad-copy-gate", "viral-hook-gate", "tech-writing-gate", "pitch-gate"].forEach((id) => {
    showTierGate(id, !isPro);
  });
}
// Run when auth state is ready and on page load
window.addEventListener("st-auth-ready", updateAllTierGates);
updateAllTierGates();

/* Render a simple numbered list into a container */
function renderNumberedList(text, containerId, rawTextId) {
  const container = document.getElementById(containerId);
  const rawEl = document.getElementById(rawTextId);
  if (!container || !rawEl) return;
  container.innerHTML = "";
  let allText = "";
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  lines.forEach((line) => {
    allText += line + "\n";
    const el = document.createElement("div");
    el.className = "idea-item";
    el.style.cursor = "pointer";
    el.title = "Click to copy";
    const cleaned = line.replace(/^\d+[\.\)\:]\s*/, "");
    el.innerHTML = `<div class="idea-desc">${cleaned}</div>`;
    el.onclick = () => navigator.clipboard.writeText(cleaned);
    container.appendChild(el);
  });
  rawEl.textContent = allText.trim();
}

/* Render repurposed content sections (split by ---) */
function renderSections(text, containerId, rawTextId) {
  const container = document.getElementById(containerId);
  const rawEl = document.getElementById(rawTextId);
  if (!container || !rawEl) return;
  container.innerHTML = "";
  const sections = text.split(/\n---\n/).map((s) => s.trim()).filter(Boolean);
  let allText = "";
  sections.forEach((section) => {
    allText += section + "\n\n---\n\n";
    const lines = section.split("\n");
    const heading = lines[0];
    const body = lines.slice(1).join("\n").trim();
    const el = document.createElement("div");
    el.className = "idea-item";
    el.innerHTML = `<div class="idea-title">${heading}</div><div class="idea-desc" style="white-space:pre-wrap">${body}</div>`;
    const copyBtn = document.createElement("button");
    copyBtn.className = "copy-btn";
    copyBtn.style.marginTop = "8px";
    copyBtn.textContent = "Copy";
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(body);
      copyBtn.textContent = "✓ Copied!";
      setTimeout(() => { copyBtn.textContent = "Copy"; }, 1500);
    };
    el.appendChild(copyBtn);
    container.appendChild(el);
  });
  rawEl.textContent = allText.trim();
}

/* ---- THREAD WRITER ---- */
async function genThread() {
  const topic = document.getElementById("thr-topic").value.trim();
  if (!topic) { alert("Please enter a thread topic!"); return; }
  const plat = document.getElementById("thr-plat").value;
  const count = document.getElementById("thr-count").value;
  const tone = getToggle("thr-tone") || "Educational";
  const lang = document.getElementById("thr-lang").value;
  load("thr-btn", "thr-spin", true);
  try {
    const res = await callApi("/api/generate/thread", { topic, platform: plat, count, tone, language: lang });
    const container = document.getElementById("thr-tweets");
    const rawEl = document.getElementById("thr-text");
    container.innerHTML = "";
    rawEl.textContent = res;
    // Parse each tweet (1/ ... 2/ ...)
    const tweets = res.split(/\n(?=\d+\/)/).map((t) => t.trim()).filter(Boolean);
    tweets.forEach((tweet) => {
      const el = document.createElement("div");
      el.className = "idea-item";
      el.style.cursor = "pointer";
      el.title = "Click to copy this tweet";
      el.innerHTML = `<div class="idea-desc" style="white-space:pre-wrap">${tweet}</div>`;
      el.onclick = () => {
        const clean = tweet.replace(/^\d+\/\s*/, "");
        navigator.clipboard.writeText(clean);
        el.style.opacity = "0.6";
        setTimeout(() => { el.style.opacity = "1"; }, 800);
      };
      container.appendChild(el);
    });
    showResult("thr-empty", "thr-result");
  } catch (e) {
    if (!e.handled) alert("Error: " + e.message);
  }
  load("thr-btn", "thr-spin", false);
}

/* ---- SEO BLOG INTRO ---- */
async function genSeoIntro() {
  const tier = window.__stUserTier || "free";
  if (tier === "free") { alert("SEO Blog Intro is a Premium feature. Upgrade to unlock it."); return; }
  const title = document.getElementById("seo-title").value.trim();
  if (!title) { alert("Please enter a blog title or topic!"); return; }
  const keyword = document.getElementById("seo-kw").value.trim();
  const audience = document.getElementById("seo-aud").value.trim();
  const tone = getToggle("seo-tone") || "Professional";
  const lang = document.getElementById("seo-lang").value;
  load("seo-btn", "seo-spin", true);
  try {
    const res = await callApi("/api/generate/seo-intro", { title, keyword, audience, tone, language: lang });
    document.getElementById("seo-text").textContent = res;
    showResult("seo-empty", "seo-result");
  } catch (e) {
    if (!e.handled) alert("Error: " + e.message);
  }
  load("seo-btn", "seo-spin", false);
}

/* ---- CONTENT REPURPOSER ---- */
async function genRepurpose() {
  const tier = window.__stUserTier || "free";
  if (tier === "free") { alert("Content Repurposer is a Premium feature. Upgrade to unlock it."); return; }
  const content = document.getElementById("rp-content").value.trim();
  if (!content) { alert("Please paste your original content!"); return; }
  const sourcePlatform = document.getElementById("rp-source").value;
  const lang = document.getElementById("rp-lang").value;
  // Collect selected multi-select targets
  const targets = Array.from(document.querySelectorAll("#rp-targets .toggle.on")).map((t) => t.dataset.v);
  if (targets.length === 0) { alert("Please select at least one target platform!"); return; }
  load("rp-btn", "rp-spin", true);
  try {
    const res = await callApi("/api/generate/repurpose", { content, sourcePlatform, targets, language: lang });
    renderSections(res, "rp-versions", "rp-text");
    showResult("rp-empty", "rp-result");
  } catch (e) {
    if (!e.handled) alert("Error: " + e.message);
  }
  load("rp-btn", "rp-spin", false);
}

/* ---- YOUTUBE DESCRIPTION ---- */
async function genYoutubeDesc() {
  const tier = window.__stUserTier || "free";
  if (tier === "free") { alert("YouTube Description Writer is a Premium feature. Upgrade to unlock it."); return; }
  const videoTitle = document.getElementById("yt-title").value.trim();
  if (!videoTitle) { alert("Please enter your video title!"); return; }
  const keywords = document.getElementById("yt-kw").value.trim();
  const niche = document.getElementById("yt-niche").value.trim();
  const lang = document.getElementById("yt-lang").value;
  load("yt-btn", "yt-spin", true);
  try {
    const res = await callApi("/api/generate/youtube-desc", { videoTitle, keywords, niche, language: lang });
    document.getElementById("yt-text").textContent = res;
    showResult("yt-empty", "yt-result");
  } catch (e) {
    if (!e.handled) alert("Error: " + e.message);
  }
  load("yt-btn", "yt-spin", false);
}

/* ---- EMAIL SUBJECT LINES ---- */
async function genEmailSubject() {
  const tier = window.__stUserTier || "free";
  if (tier === "free") { alert("Email Subject Lines is a Premium feature. Upgrade to unlock it."); return; }
  const topic = document.getElementById("es-topic").value.trim();
  if (!topic) { alert("Please enter an email topic or offer!"); return; }
  const tone = getToggle("es-tone") || "Friendly";
  const count = document.getElementById("es-count").value;
  const lang = document.getElementById("es-lang").value;
  load("es-btn", "es-spin", true);
  try {
    const res = await callApi("/api/generate/email-subject", { topic, tone, count, language: lang });
    renderNumberedList(res, "es-lines", "es-text");
    showResult("es-empty", "es-result");
  } catch (e) {
    if (!e.handled) alert("Error: " + e.message);
  }
  load("es-btn", "es-spin", false);
}

/* ---- CTA GENERATOR ---- */
async function genCta() {
  const tier = window.__stUserTier || "free";
  if (tier === "free") { alert("CTA Generator is a Premium feature. Upgrade to unlock it."); return; }
  const product = document.getElementById("cta-product").value.trim();
  if (!product) { alert("Please enter your product or service!"); return; }
  const goal = document.getElementById("cta-goal").value;
  const platform = document.getElementById("cta-plat").value;
  const tone = getToggle("cta-tone") || "Friendly";
  const lang = document.getElementById("cta-lang").value;
  load("cta-btn", "cta-spin", true);
  try {
    const res = await callApi("/api/generate/cta", { product, goal, platform, tone, language: lang });
    renderNumberedList(res, "cta-lines", "cta-text");
    showResult("cta-empty", "cta-result");
  } catch (e) {
    if (!e.handled) alert("Error: " + e.message);
  }
  load("cta-btn", "cta-spin", false);
}

/* ---- AD COPY WRITER ---- */
async function genAdCopy() {
  const tier = window.__stUserTier || "free";
  if (tier !== "pro") { alert("Ad Copy Writer is a Pro feature. Upgrade to Pro to unlock it."); return; }
  const product = document.getElementById("ad-product").value.trim();
  if (!product) { alert("Please enter your product or service!"); return; }
  const benefit = document.getElementById("ad-benefit").value.trim();
  const audience = document.getElementById("ad-audience").value.trim();
  const platform = document.getElementById("ad-plat").value;
  const objective = document.getElementById("ad-obj").value;
  const lang = document.getElementById("ad-lang").value;
  load("ad-btn", "ad-spin", true);
  try {
    const res = await callApi("/api/generate/ad-copy", { product, benefit, audience, platform, objective, language: lang });
    // Split by --- into 3 variations
    const variations = res.split(/\n---\n/).map((v) => v.trim()).filter(Boolean);
    const container = document.getElementById("ad-variations");
    const rawEl = document.getElementById("ad-text");
    container.innerHTML = "";
    rawEl.textContent = res;
    variations.forEach((v, i) => {
      const el = document.createElement("div");
      el.className = "idea-item";
      el.innerHTML = `<div class="idea-title">Variation ${i + 1}</div><div class="idea-desc" style="white-space:pre-wrap">${v}</div>`;
      const copyBtn = document.createElement("button");
      copyBtn.className = "copy-btn";
      copyBtn.style.marginTop = "8px";
      copyBtn.textContent = "Copy variation";
      copyBtn.onclick = () => {
        navigator.clipboard.writeText(v);
        copyBtn.textContent = "✓ Copied!";
        setTimeout(() => { copyBtn.textContent = "Copy variation"; }, 1500);
      };
      el.appendChild(copyBtn);
      container.appendChild(el);
    });
    showResult("ad-empty", "ad-result");
  } catch (e) {
    if (!e.handled) alert("Error: " + e.message);
  }
  load("ad-btn", "ad-spin", false);
}

/* ---- VIRAL HOOK GENERATOR ---- */
async function genViralHook() {
  const tier = window.__stUserTier || "free";
  if (tier !== "pro") { alert("Viral Hook Generator is a Pro feature. Upgrade to Pro to unlock it."); return; }
  const topic = document.getElementById("vh-topic").value.trim();
  if (!topic) { alert("Please enter a topic or niche!"); return; }
  const platform = document.getElementById("vh-plat").value;
  const count = document.getElementById("vh-count").value;
  const style = getToggle("vh-style") || "Educational";
  const lang = document.getElementById("vh-lang").value;
  load("vh-btn", "vh-spin", true);
  try {
    const res = await callApi("/api/generate/viral-hook", { topic, platform, count, style, language: lang });
    renderNumberedList(res, "vh-hooks", "vh-text");
    showResult("vh-empty", "vh-result");
  } catch (e) {
    if (!e.handled) alert("Error: " + e.message);
  }
  load("vh-btn", "vh-spin", false);
}

/* ---- TECHNICAL WRITING ASSISTANT ---- */
async function genTechWriting() {
  const tier = window.__stUserTier || "free";
  if (tier !== "pro") { alert("Technical Writing Assistant is a Pro feature. Upgrade to Pro to unlock it."); return; }
  const topic = document.getElementById("tw-topic").value.trim();
  if (!topic) { alert("Please enter a topic!"); return; }
  const type = document.getElementById("tw-type").value;
  const expertise = document.getElementById("tw-expertise").value;
  const lang = document.getElementById("tw-lang").value;
  load("tw-btn", "tw-spin", true);
  try {
    const res = await callApi("/api/generate/tech-writing", { topic, type, expertise, language: lang });
    document.getElementById("tw-text").textContent = res;
    showResult("tw-empty", "tw-result");
  } catch (e) {
    if (!e.handled) alert("Error: " + e.message);
  }
  load("tw-btn", "tw-spin", false);
}

/* ---- PITCH WRITER ---- */
async function genPitch() {
  const tier = window.__stUserTier || "free";
  if (tier !== "pro") { alert("Pitch Writer is a Pro feature. Upgrade to Pro to unlock it."); return; }
  const niche = document.getElementById("pt-niche").value.trim();
  if (!niche) { alert("Please enter your niche!"); return; }
  const creatorName = document.getElementById("pt-name").value.trim();
  const stats = document.getElementById("pt-stats").value.trim();
  const brandName = document.getElementById("pt-brand").value.trim();
  const offer = document.getElementById("pt-offer").value.trim();
  const format = getToggle("pt-format") || "Email";
  const lang = document.getElementById("pt-lang").value;
  load("pt-btn", "pt-spin", true);
  try {
    const res = await callApi("/api/generate/pitch", { creatorName, niche, stats, brandName, offer, format, language: lang });
    document.getElementById("pt-text").textContent = res;
    showResult("pt-empty", "pt-result");
  } catch (e) {
    if (!e.handled) alert("Error: " + e.message);
  }
  load("pt-btn", "pt-spin", false);
}

/* Extend getOutputContent for new tools */
const _origGetOutputContent = getOutputContent;
function getOutputContent(type) {
  const newTools = {
    thread: () => document.getElementById("thr-text")?.textContent || "",
    "seo-intro": () => document.getElementById("seo-text")?.textContent || "",
    repurpose: () => document.getElementById("rp-text")?.textContent || "",
    "youtube-desc": () => document.getElementById("yt-text")?.textContent || "",
    "email-subject": () => document.getElementById("es-text")?.textContent || "",
    cta: () => document.getElementById("cta-text")?.textContent || "",
    "ad-copy": () => document.getElementById("ad-text")?.textContent || "",
    "viral-hook": () => document.getElementById("vh-text")?.textContent || "",
    "tech-writing": () => document.getElementById("tw-text")?.textContent || "",
    pitch: () => document.getElementById("pt-text")?.textContent || "",
  };
  return newTools[type] ? newTools[type]() : _origGetOutputContent(type);
}
