import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AuthLayout from "../components/AuthLayout";
import { supabase } from "../lib/supabaseClient";

export default function ResetPassword() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    // Clicking the emailed reset link creates a temporary recovery session -
    // wait for it before allowing the password form to submit.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }
    setSuccess(true);
    setTimeout(() => router.push("/login"), 1500);
  }

  return (
    <AuthLayout title="Reset password">
      <div className="auth-title">Set a new password</div>
      <div className="auth-sub">Choose a new password for your account</div>

      {error && <div className="auth-msg error">{error}</div>}
      {success && <div className="auth-msg success">Password updated! Redirecting to log in...</div>}

      {!ready && !success && (
        <div className="auth-msg error">
          Open this page using the reset link from your email - it hasn&apos;t been detected yet.
        </div>
      )}

      {ready && !success && (
        <form onSubmit={handleSubmit}>
          <label>New password</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
          <label>Confirm password</label>
          <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter password" />
          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update password"}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
