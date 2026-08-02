import Head from "next/head";
import Script from "next/script";
import { HOME_BODY_HTML } from "../lib/legacyHtml/home";
import SiteNav from "../components/SiteNav";

// NEXT_PUBLIC_URL should be the real live domain (set in Vercel's env vars for
// production). Falls back to the current deployment's own URL rather than a
// domain that may not be connected yet, so these tags are never wrong.
const SITE_URL = process.env.NEXT_PUBLIC_URL || "https://social-toolkit-pro.vercel.app";

export default function Home() {
  return (
    <>
      <Head>
        <title>Free Hashtag Generator & AI Caption Writer for Instagram, TikTok, YouTube — SocialToolkit</title>
        <meta
          name="description"
          content="AI tools for content creators. Generate hashtags for Instagram & TikTok, write captions, create bios, and get YouTube video ideas in seconds. Free to start — 10 generations/day, no card required."
        />
        <meta
          name="keywords"
          content="free hashtag generator, instagram hashtag generator, tiktok hashtag generator, ai caption writer, instagram caption generator, free bio maker, youtube video idea generator, free ai tools for creators, social media tools free, content creator tools"
        />
        <meta name="robots" content="index, follow" />
        <meta name="google-site-verification" content="bH1YrYWgBcdYEvkI5eMCXL3OpVH-3eATe7tE-B3Gyvs" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${SITE_URL}/`} />
        <meta property="og:title" content="Free Hashtag Generator & AI Caption Writer — SocialToolkit" />
        <meta
          property="og:description"
          content="AI tools for content creators. Hashtag generator, caption writer, bio maker & video idea generator. Free to start, no card required."
        />
        <meta property="og:site_name" content="SocialToolkit" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Free Hashtag Generator & AI Caption Writer — SocialToolkit" />
        <meta
          name="twitter:description"
          content="AI tools for content creators. Hashtag generator, caption writer, bio maker & video idea generator. Free to start, no card required."
        />
        <link rel="canonical" href={`${SITE_URL}/`} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "SocialToolkit",
              url: SITE_URL,
              description:
                "AI-powered social media tools for content creators. Hashtag generator, caption writer, bio maker and video idea generator. Free to start, Premium and Pro plans for unlimited access.",
              applicationCategory: "UtilitiesApplication",
              operatingSystem: "Web",
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
              featureList: [
                "Free Hashtag Generator",
                "Instagram Caption Writer",
                "Social Media Bio Maker",
                "Video Idea Generator",
              ],
            }),
          }}
        />
      </Head>

      <SiteNav />
      <div dangerouslySetInnerHTML={{ __html: HOME_BODY_HTML }} />

      {/* AdSense disabled - re-enable when ads are active */}
      <Script async src="https://www.googletagmanager.com/gtag/js?id=G-469MJSXPSL" strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-469MJSXPSL');`}
      </Script>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
        strategy="lazyOnload"
      />
      <Script src="/js/site.js" strategy="afterInteractive" />
    </>
  );
}
