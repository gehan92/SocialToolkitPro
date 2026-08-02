import LegalLayout from "../components/LegalLayout";

export default function Privacy() {
  return (
    <LegalLayout
      title="Privacy Policy — SocialToolkit"
      description="Privacy Policy for SocialToolkit — how we handle your data."
      pageTag="Legal"
      updated="August 2, 2026"
    >
      <div className="highlight">
        <p>This Privacy Policy explains how SocialToolkit (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) collects, uses, and protects information when you use our website and AI content tools, including free and paid (Premium/Pro) accounts. By using our service, you agree to the terms of this policy.</p>
      </div>

      <h2>1. Information we collect</h2>
      <ul>
        <li><strong style={{ color: "var(--text)" }}>Account information:</strong> When you sign up, we collect your email address, a username you choose, and your account password (stored securely and never visible to us in plain text — handled by our authentication provider, Supabase).</li>
        <li><strong style={{ color: "var(--text)" }}>Content you generate:</strong> Topics, descriptions, and preferences you enter into our AI tools are sent to Google&apos;s Gemini API to produce your results. If you choose to &quot;save&quot; or &quot;favorite&quot; a result, or add a note to your content calendar, that content is stored in your account.</li>
        <li><strong style={{ color: "var(--text)" }}>Usage data:</strong> We record which tools you use and how often, to enforce daily generation limits on the Free plan and to improve the service.</li>
        <li><strong style={{ color: "var(--text)" }}>Payment information:</strong> If you subscribe to Premium or Pro, your payment is processed directly by Stripe. We do not receive or store your full card number — we only receive a subscription/customer reference from Stripe to manage your billing status.</li>
        <li><strong style={{ color: "var(--text)" }}>Technical information:</strong> Like most websites, we automatically collect IP address, browser type, device type, pages visited, and time spent on pages, via cookies and similar technologies.</li>
      </ul>

      <h2>2. How we use your information</h2>
      <ul>
        <li>To create and manage your account and subscription</li>
        <li>To generate the AI content you request</li>
        <li>To save your favorited outputs, calendar entries, and templates so you can access them later</li>
        <li>To enforce free-tier usage limits and prevent abuse</li>
        <li>To process payments and manage billing for paid plans</li>
        <li>To communicate with you about your account, billing, or support requests</li>
        <li>To understand how the service is used and improve it</li>
        <li>To comply with legal obligations</li>
      </ul>

      <h2>3. Account &amp; subscription data</h2>
      <p>Unlike a purely anonymous tool, SocialToolkit requires an account to save content, use the calendar, or subscribe to a paid plan. While your account is active, we retain:</p>
      <ul>
        <li>Your profile (email, username, subscription tier)</li>
        <li>Saved/favorited outputs — these are automatically deleted after 3 months</li>
        <li>Calendar entries and saved templates, for as long as your account exists</li>
        <li>A log of your daily tool usage, used for rate-limiting and account-level analytics</li>
      </ul>
      <p>You can request deletion of your account and associated data at any time by contacting us (see Section 12) — see Section 8 for details on how this is handled.</p>

      <h2>4. Payment processing</h2>
      <p>Paid subscriptions (Premium and Pro) are billed and processed by <a href="https://stripe.com/privacy" target="_blank" rel="noopener">Stripe, Inc.</a>, a PCI-compliant third-party payment processor. Stripe collects and stores your payment card details directly — we never see or store your full card number. We only retain a reference to your Stripe customer/subscription record so we can keep your account tier in sync with your billing status.</p>

      <h2>5. AI processing (Google Gemini)</h2>
      <p>When you use one of our generator tools, the text you enter is sent to Google&apos;s Gemini API to produce your output. This exchange is subject to <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Google&apos;s Privacy Policy</a> and Gemini API terms. Please avoid entering sensitive personal information (e.g. financial details, health information, government ID numbers) into any generator tool.</p>

      <h2>6. Cookies</h2>
      <p>We use cookies to keep you logged in, remember your preferences, and (where applicable) for analytics and advertising:</p>
      <ul>
        <li><strong style={{ color: "var(--text)" }}>Essential cookies:</strong> Required to keep you signed in and the site functioning.</li>
        <li><strong style={{ color: "var(--text)" }}>Analytics cookies:</strong> Help us understand how the site is used (e.g. Google Analytics).</li>
        <li><strong style={{ color: "var(--text)" }}>Advertising cookies:</strong> Used by Google AdSense, where enabled, to show relevant ads.</li>
      </ul>
      <p>You can control cookies through your browser settings, though disabling essential cookies may prevent you from staying logged in.</p>

      <h2>7. Third-party service providers</h2>
      <p>We share limited data with the following providers, solely to operate the service:</p>
      <ul>
        <li><strong style={{ color: "var(--text)" }}>Supabase</strong> — hosts our database and handles account authentication. <a href="https://supabase.com/privacy" target="_blank" rel="noopener">Supabase Privacy Policy</a></li>
        <li><strong style={{ color: "var(--text)" }}>Stripe</strong> — processes payments for paid subscriptions. <a href="https://stripe.com/privacy" target="_blank" rel="noopener">Stripe Privacy Policy</a></li>
        <li><strong style={{ color: "var(--text)" }}>Google Gemini API</strong> — generates AI content from your input. <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Google Privacy Policy</a></li>
        <li><strong style={{ color: "var(--text)" }}>Google Analytics</strong> — website traffic analysis, where enabled. <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Google Privacy Policy</a></li>
        <li><strong style={{ color: "var(--text)" }}>Google AdSense</strong> — advertising, where enabled. <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Google Privacy Policy</a></li>
      </ul>
      <p>Using these providers may mean your information is processed on servers located outside your own country.</p>

      <h2>8. Data retention &amp; deletion</h2>
      <p>Saved/favorited outputs are automatically deleted 3 months after creation. Account data (profile, calendar entries, templates, usage history) is retained for as long as your account is active. If you want your account and associated data deleted, contact us at the email in Section 12 and we will process the request within a reasonable time, except where we are required to retain certain records (e.g. billing history) for legal or tax purposes.</p>

      <h2>9. Data sharing</h2>
      <p>We do not sell your personal information. We share information only:</p>
      <ul>
        <li>With the service providers listed in Section 7, solely to operate the service</li>
        <li>When required by law or to protect our legal rights</li>
        <li>With advertising partners (where advertising is enabled), as described above</li>
      </ul>

      <h2>10. Children&apos;s privacy</h2>
      <p>Our service is not directed at children under the age of 13, and accounts may not be created by anyone under 13. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, contact us and we will delete it promptly.</p>

      <h2>11. Your rights</h2>
      <p>Depending on your location, you may have rights including:</p>
      <ul>
        <li>The right to access the information we hold about you</li>
        <li>The right to request correction of inaccurate information</li>
        <li>The right to request deletion of your account and data</li>
        <li>The right to export a copy of your data</li>
        <li>The right to opt out of personalized advertising, where applicable</li>
      </ul>
      <p>To exercise these rights, contact us at the email below.</p>

      <h2>12. Contact us</h2>
      <p>If you have any questions about this Privacy Policy, or want to request access to, correction of, or deletion of your data, contact us:</p>
      <ul>
        <li>Email: <a href="mailto:socialaikit@gmail.com">socialaikit@gmail.com</a></li>
        <li>Website: <a href="/contact">Contact page</a></li>
      </ul>

      <h2>13. Security</h2>
      <p>We take reasonable measures to protect your information, including relying on our providers&apos; security practices (Supabase, Stripe). However, no method of transmission or storage is 100% secure, and we cannot guarantee absolute security.</p>

      <h2>14. Changes to this policy</h2>
      <p>We may update this Privacy Policy from time to time. We will update the &quot;Last updated&quot; date above when we do. Continued use of the service after changes are posted means you accept the updated policy.</p>
    </LegalLayout>
  );
}
