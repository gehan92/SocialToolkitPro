import { useState } from "react";
import { useRouter } from "next/router";
import AuthLayout from "../components/AuthLayout";
import { supabase } from "../lib/supabaseClient";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!supabase) {
      setError("Login isn't configured yet - add Supabase credentials to .env.local.");
      return;
    }

    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (signInError) {
      if (signInError.message === "Email not confirmed") {
        setError("Please confirm your email first - check your inbox for the confirmation link we sent.");
      } else {
        setError(signInError.message);
      }
      return;
    }
    router.push("/");
  }

  return (
    <AuthLayout title="Log in">
      <div className="auth-title">Welcome back</div>
      <div className="auth-sub">Log in to access your saved outputs and settings</div>

      {error && <div className="auth-msg error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <label>Email</label>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        <label>Password</label>
        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" />
        <button className="auth-btn" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>

      <div className="auth-switch">
        <a href="/forgot-password">Forgot password?</a>
      </div>
      <div className="auth-switch">
        Don&apos;t have an account? <a href="/signup">Sign up</a>
      </div>
    </AuthLayout>
  );
}
