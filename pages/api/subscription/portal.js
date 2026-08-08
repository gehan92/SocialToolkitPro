import { paddle } from "../../../lib/paddleClient";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { getAuthUser } from "../../../lib/getAuthUser";

// Returns a link to Paddle's hosted customer portal, where the user can
// update their card, download receipts/invoices, and view billing history
// without us having to build any of that ourselves.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const user = await getAuthUser(req);
  if (!user) {
    return res.status(401).json({ success: false, error: "Please log in." });
  }

  if (!paddle) {
    return res.status(500).json({ success: false, error: "Paddle isn't configured yet." });
  }

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("paddle_customer_id")
    .eq("id", user.id)
    .single();

  if (!profile?.paddle_customer_id) {
    return res.status(404).json({ success: false, error: "No billing account found." });
  }

  const { data: subs } = await supabaseAdmin
    .from("subscriptions")
    .select("paddle_subscription_id")
    .eq("user_id", user.id)
    .in("status", ["active", "canceling"]);

  try {
    const session = await paddle.customerPortalSessions.create(
      profile.paddle_customer_id,
      (subs || []).map((s) => s.paddle_subscription_id).filter(Boolean)
    );
    return res.status(200).json({ success: true, url: session.urls.general.overview });
  } catch (e) {
    return res.status(502).json({ success: false, error: e.message });
  }
}
