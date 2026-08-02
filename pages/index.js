import Head from "next/head";
import Script from "next/script";
import { HOME_BODY_HTML } from "../lib/legacyHtml/home";
import SiteNav from "../components/SiteNav";

export default function Home() {
  return (
    <>
      <Head>
        <title>Free Hashtag Generator & AI Caption Writer for Instagram, TikTok, YouTube — SocialToolkit</title>
        <meta
          name="description"
          content="Free AI tools for content creators. Generate hashtags for Instagram & TikTok, write captions, create bios, and get YouTube video ideas in seconds. 100% free, no sign up."
        />
        <meta
          name="keywords"
          content="free hashtag generator, instagram hashtag generator, tiktok hashtag generator, ai caption writer, instagram caption generator, free bio maker, youtube video idea generator, free ai tools for creators, social media tools free, content creator tools"
        />
        <meta name="robots" content="index, follow" />
        <meta name="google-site-verification" content="bH1YrYWgBcdYEvkI5eMCXL3OpVH-3eATe7tE-B3Gyvs" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.socialtoolkitpro.com/" />
        <meta property="og:title" content="Free Hashtag Generator & AI Caption Writer — SocialToolkit" />
        <meta
          property="og:description"
          content="Free AI tools for content creators. Hashtag generator, caption writer, bio maker & video idea generator. No sign up needed!"
        />
        <meta property="og:site_name" content="SocialToolkit" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Free Hashtag Generator & AI Caption Writer — SocialToolkit" />
        <meta
          name="twitter:description"
          content="Free AI tools for content creators. Hashtag generator, caption writer, bio maker & video idea generator. No sign up needed!"
        />
        <link rel="canonical" href="https://www.socialtoolkitpro.com/" />
        <link rel="stylesheet" href="/css/site.css" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "SocialToolkit",
              url: "https://www.socialtoolkitpro.com",
              description:
                "Free AI-powered social media tools for content creators. Hashtag generator, caption writer, bio maker and video idea generator. No sign up needed.",
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
