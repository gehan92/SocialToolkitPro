import { useState } from "react";
import AuthLayout from "../components/AuthLayout";
import { supabase } from "../lib/supabaseClient";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!supabase) {
      setError("Password reset isn't configured yet - add Supabase credentials to .env.local.");
      return;
    }

    setLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }
    setSent(true);
  }

  return (
    <AuthLayout title="Forgot password">
      <div className="auth-title">Reset your password</div>
      <div className="auth-sub">We&apos;ll email you a link to set a new password</div>

      {error && <div className="auth-msg error">{error}</div>}
      {sent && <div className="auth-msg success">Check your email for a reset link.</div>}

      {!sent && (
        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>
      )}

      <div className="auth-switch">
        <a href="/login">Back to log in</a>
      </div>
    </AuthLayout>
  );
}
