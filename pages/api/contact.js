import { supabaseAdmin } from "../../lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { name, email, subject, message } = req.body || {};
  if (!name || !String(name).trim() || !email || !String(email).trim() || !message || !String(message).trim()) {
    return res.status(400).json({ success: false, error: "Name, email and message are required." });
  }

  const { error } = await supabaseAdmin.from("contact_messages").insert({
    name: String(name).trim(),
    email: String(email).trim(),
    subject: subject ? String(subject).trim() : "General question",
    message: String(message).trim(),
  });

  if (error) return res.status(500).json({ success: false, error: error.message });
  return res.status(200).json({ success: true });
}
