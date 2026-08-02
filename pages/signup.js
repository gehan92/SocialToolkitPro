import { useState } from "react";
import AuthLayout from "../components/AuthLayout";
import { supabase } from "../lib/supabaseClient";

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!supabase) {
      setError("Sign up isn't configured yet - add Supabase credentials to .env.local.");
      return;
    }
    if (!USERNAME_RE.test(username)) {
      setError("Username must be 3-20 characters: letters, numbers, underscores only.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);

    const checkRes = await fetch(`/api/check-username?username=${encodeURIComponent(username)}`).then((r) => r.json());
    if (!checkRes.available) {
      setLoading(false);
      setError("That username is already taken. Please choose another.");
      return;
    }

    const { error: signUpError } = await supabase.auth.signUp({ email, password, options: { data: { username } } });
    setLoading(false);

    if (signUpError) {
      console.error("Signup error:", signUpError);
      setError(signUpError.message || "Something went wrong sending the confirmation email. Please try again shortly.");
      return;
    }
    setSuccess(true);
  }

  return (
    <AuthLayout title="Sign up">
      <div className="auth-title">Create your account</div>
      <div className="auth-sub">Unlock unlimited generations with Premium</div>

      {error && <div className="auth-msg error">{error}</div>}
      {success && <div className="auth-msg success">Check your email to confirm your account.</div>}

      <form onSubmit={handleSubmit}>
        <label>Username</label>
        <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. alex_creates" maxLength={20} />
        <label>Email</label>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        <label>Password</label>
        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
        <label>Confirm password</label>
        <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter password" />
        <button className="auth-btn" type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Sign up"}
        </button>
      </form>

      <div className="auth-switch">
        Already have an account? <a href="/login">Log in</a>
      </div>
    </AuthLayout>
  );
}
