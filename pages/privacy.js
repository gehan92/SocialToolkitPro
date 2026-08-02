import LegalLayout from "../components/LegalLayout";

export default function Privacy() {
  return (
    <LegalLayout
      title="Privacy Policy — SocialToolkit"
      description="Privacy Policy for SocialToolkit — how we handle your data."
      pageTag="Legal"
      updated="January 1, 2026"
    >
      <div className="highlight">
        <p>This Privacy Policy explains how SocialToolkit (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) collects, uses, and protects information when you visit our website at socialtoolkit.com. By using our website, you agree to the terms of this policy.</p>
      </div>

      <h2>1. Information we collect</h2>
      <p>We collect two types of information:</p>
      <ul>
        <li><strong style={{ color: "var(--text)" }}>Information you provide:</strong> When you use our tools (hashtag generator, caption writer, bio maker, video idea generator), you may enter text such as topics, descriptions, or preferences. This information is sent to our AI service to generate results and is not stored on our servers after your session ends.</li>
        <li><strong style={{ color: "var(--text)" }}>Automatically collected information:</strong> Like most websites, we automatically collect certain technical information when you visit, including your IP address, browser type, device type, pages visited, and time spent on pages. This is collected through cookies and similar technologies.</li>
      </ul>

      <h2>2. How we use your information</h2>
      <p>We use the information we collect to:</p>
      <ul>
        <li>Provide and operate the SocialToolkit tools and services</li>
        <li>Improve and optimise our website performance</li>
        <li>Understand how visitors use our website (analytics)</li>
        <li>Display relevant advertisements through Google AdSense</li>
        <li>Comply with legal obligations</li>
      </ul>

      <h2>3. Google AdSense and advertising</h2>
      <p>We use Google AdSense to display advertisements on our website. Google AdSense uses cookies to serve ads based on your prior visits to our website and other websites on the internet. Google&apos;s use of advertising cookies enables it and its partners to serve ads based on your visit to our site and other sites on the internet.</p>
      <p>You may opt out of personalised advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener">Google Ads Settings</a>. You can also opt out of a third-party vendor&apos;s use of cookies by visiting the <a href="https://optout.networkadvertising.org" target="_blank" rel="noopener">Network Advertising Initiative opt-out page</a>.</p>

      <h2>4. Cookies</h2>
      <p>Our website uses cookies — small text files stored on your device — to improve your experience and enable advertising. We use the following types of cookies:</p>
      <ul>
        <li><strong style={{ color: "var(--text)" }}>Essential cookies:</strong> Required for the website to function properly.</li>
        <li><strong style={{ color: "var(--text)" }}>Analytics cookies:</strong> Help us understand how visitors use our site (e.g. Google Analytics).</li>
        <li><strong style={{ color: "var(--text)" }}>Advertising cookies:</strong> Used by Google AdSense to show relevant ads.</li>
      </ul>
      <p>You can control cookies through your browser settings. Disabling cookies may affect some website functionality.</p>

      <h2>5. Third-party services</h2>
      <p>We use the following third-party services that may collect data:</p>
      <ul>
        <li><strong style={{ color: "var(--text)" }}>Google AdSense</strong> — for displaying advertisements. <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Google Privacy Policy</a></li>
        <li><strong style={{ color: "var(--text)" }}>Google Analytics</strong> — for website traffic analysis. <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Google Privacy Policy</a></li>
        <li><strong style={{ color: "var(--text)" }}>Google Gemini API</strong> — to power our AI tools. Text you enter is processed by Google to generate results. <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Google Privacy Policy</a></li>
      </ul>

      <h2>6. Data sharing</h2>
      <p>We do not sell your personal information to third parties. We may share information in the following limited circumstances:</p>
      <ul>
        <li>With service providers who help operate our website (e.g. hosting, analytics)</li>
        <li>When required by law or to protect our legal rights</li>
        <li>With advertising partners (Google AdSense) as described above</li>
      </ul>

      <h2>7. Data retention</h2>
      <p>Text you enter into our AI tools is not stored on our servers after your session. Analytics and advertising data is retained according to the policies of the respective third-party services (Google Analytics, Google AdSense).</p>

      <h2>8. Children&apos;s privacy</h2>
      <p>Our website is not directed at children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us and we will delete it promptly.</p>

      <h2>9. Your rights</h2>
      <p>Depending on your location, you may have the following rights regarding your personal information:</p>
      <ul>
        <li>The right to access information we hold about you</li>
        <li>The right to request correction of inaccurate information</li>
        <li>The right to request deletion of your information</li>
        <li>The right to opt out of personalised advertising</li>
      </ul>
      <p>To exercise these rights, please contact us at the email below.</p>

      <h2>10. Security</h2>
      <p>We take reasonable measures to protect your information. However, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security of your data.</p>

      <h2>11. Changes to this policy</h2>
      <p>We may update this Privacy Policy from time to time. We will notify you of any significant changes by updating the &quot;Last updated&quot; date at the top of this page. Your continued use of our website after changes are posted constitutes your acceptance of the updated policy.</p>

      <h2>12. Contact us</h2>
      <p>If you have any questions about this Privacy Policy, please contact us:</p>
      <ul>
        <li>Email: <a href="mailto:socialaikit@gmail.com">socialaikit@gmail.com</a></li>
        <li>Website: <a href="/contact">Contact page</a></li>
      </ul>
    </LegalLayout>
  );
}
