import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { getAuthUser, getUserTier } from "../../../lib/getAuthUser";

const TOOL_LABELS = {
  hashtags: "Hashtag Generator",
  captions: "Caption Writer",
  bios: "Bio Maker",
  ideas: "Video Ideas",
  thread: "Thread Writer",
  "seo-intro": "SEO Blog Intro",
  repurpose: "Content Repurposer",
  "youtube-desc": "YouTube Description",
  "email-subject": "Email Subject Lines",
  cta: "CTA Generator",
  "ad-copy": "Ad Copy Writer",
  "viral-hook": "Viral Hook Generator",
  "tech-writing": "Technical Writing",
  pitch: "Brand Pitch Writer",
};

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const user = await getAuthUser(req);
  if (!user) {
    return res.status(401).json({ success: false, error: "Please log in to view analytics." });
  }

  const tier = await getUserTier(user.id);
  if (tier === "free") {
    return res.status(403).json({ success: false, error: "Analytics is a Premium feature. Upgrade to see your usage stats." });
  }

  const { data: logs } = await supabaseAdmin.from("api_usage_logs").select("endpoint, created_at").eq("user_id", user.id);
  const { data: saved } = await supabaseAdmin.from("saved_outputs").select("is_favorite").eq("user_id", user.id);

  const allLogs = logs || [];
  const total = allLogs.length;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonth = allLogs.filter((l) => new Date(l.created_at) >= monthStart).length;

  const toolCounts = {};
  allLogs.forEach((l) => {
    const tool = l.endpoint?.split("/").pop() || "unknown";
    const label = TOOL_LABELS[tool] || tool;
    toolCounts[label] = (toolCounts[label] || 0) + 1;
  });

  let mostUsedTool = null;
  let mostUsedCount = 0;
  Object.entries(toolCounts).forEach(([tool, c]) => {
    if (c > mostUsedCount) {
      mostUsedTool = tool;
      mostUsedCount = c;
    }
  });

  const lastUsed = allLogs.reduce((max, l) => (!max || new Date(l.created_at) > new Date(max) ? l.created_at : max), null);

  return res.status(200).json({
    success: true,
    data: {
      total,
      thisMonth,
      mostUsedTool,
      mostUsedCount,
      toolCounts,
      savedCount: (saved || []).length,
      favoritesCount: (saved || []).filter((s) => s.is_favorite).length,
      lastUsed,
    },
  });
}
