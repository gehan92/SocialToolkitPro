import { getAuthUser } from "../../../lib/getAuthUser";
import { isAdminUser } from "../../../lib/isAdmin";

// Lightweight check the nav bar uses to decide whether to show the Admin
// link - unlike the other /api/admin/* routes, a non-admin caller gets a
// normal 200 { isAdmin: false } rather than a 403, since this isn't gating
// access to anything, just answering "should I show a link".
export default async function handler(req, res) {
  const user = await getAuthUser(req);
  return res.status(200).json({ success: true, isAdmin: await isAdminUser(user) });
}
