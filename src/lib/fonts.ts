import localFont from "next/font/local";

/**
 * Self-hosted "Google Sans" (variable font).
 *
 * Why next/font/local instead of the Google Fonts CDN `@import` that used
 * to live in globals.css:
 *  - No runtime request to fonts.googleapis.com (faster, works offline,
 *    avoids leaking the visitor's IP to a third party on every page load).
 *  - next/font self-hosts + subsets + preloads the font and exposes it as
 *    a CSS variable, so there is no flash of unstyled text.
 *
 * Files live in src/assets/fonts/google-sans/ (see that folder's OFL.txt
 * for the license). Both weight and italic axes are variable, so a single
 * file per style covers every weight from 400–700.
 */
export const googleSans = localFont({
  src: [
    {
      path: "../assets/fonts/google-sans/GoogleSans-VariableFont.ttf",
      weight: "400 700",
      style: "normal",
    },
    {
      path: "../assets/fonts/google-sans/GoogleSans-Italic-VariableFont.ttf",
      weight: "400 700",
      style: "italic",
    },
  ],
  variable: "--font-google-sans",
  display: "swap",
  preload: true,
});
