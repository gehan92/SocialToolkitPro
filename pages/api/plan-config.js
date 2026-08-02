import { getPlanConfig } from "../../lib/planConfig";

// Public read-only endpoint (no auth) so pricing pages can always display
// whatever price/limit the admin last set in the dashboard's Plans tab,
// instead of drifting out of sync with a hardcoded value.
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }
  const planConfig = await getPlanConfig();
  return res.status(200).json({ success: true, data: planConfig });
}
