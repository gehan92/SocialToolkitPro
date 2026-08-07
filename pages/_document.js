import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="stylesheet" href="/css/site.css" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Clash+Display:wght@400;500;600;700&family=Cabinet+Grotesk:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="icon"
          type="image/svg+xml"
          href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 36 36'%3E%3Crect width='36' height='36' rx='9' fill='%230e0e16'/%3E%3Crect x='7' y='21' width='5' height='9' rx='2' fill='%235b4fff'/%3E%3Crect x='14' y='16' width='5' height='14' rx='2' fill='%237c6dff'/%3E%3Crect x='21' y='10' width='5' height='20' rx='2' fill='%23ff4f9b'/%3E%3Ccircle cx='30' cy='8' r='5' fill='%2300e5a0'/%3E%3Ctext x='30' y='11' font-family='system-ui' font-size='5' font-weight='800' fill='%23060610' text-anchor='middle'%3EAI%3C/text%3E%3C/svg%3E"
        />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#0e0e16" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
