import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />
        <meta name="theme-color" content="#E11D2E" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="PG POS" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="icon" href="/icon-192.png" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <title>Power Gym POS</title>
        <ScrollViewStyleReset />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html,body,#root{background:#FFFFFF}
              @font-face{
                font-family:'Ionicons';
                src:url('/Ionicons.ttf') format('truetype');
                font-weight:normal;
                font-style:normal;
              }
              @font-face{
                font-family:'Fraunces_400Regular';
                src:url('/Manrope-Regular.ttf') format('truetype');
                font-display:swap;
              }
              @font-face{
                font-family:'Fraunces_500Medium';
                src:url('/Manrope-Medium.ttf') format('truetype');
                font-display:swap;
              }
              @font-face{
                font-family:'Fraunces_600SemiBold';
                src:url('/Manrope-SemiBold.ttf') format('truetype');
                font-display:swap;
              }
              @font-face{
                font-family:'Fraunces_700Bold';
                src:url('/Manrope-ExtraBold.ttf') format('truetype');
                font-display:swap;
              }
            `,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function () {
                  navigator.serviceWorker.register('/sw.js').catch(function () {});
                });
              }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
