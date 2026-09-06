/**
 * Single source of truth for site metadata, navigation, and feature toggles.
 * Brand colors and fonts live in src/styles/global.css (the @theme block).
 * Tailwind v4's config is CSS-first, so tokens stay there, not here.
 */
export const siteConfig = {
  name: "Trestle",
  description: "A GitHub Pages site-building kit that ships with deploy, SEO, and content already wired up.",

  /** Set this to your custom domain (e.g. "example.com") to enable one.
   *  Leave empty to use the default <user>.github.io/<repo> URL.
   *  Whatever is set here is written to dist/CNAME on every build automatically. */
  domain: "",

  /** Fallback base URL used when `domain` is empty. Update the path to match your repo name. */
  url: "https://your-username.github.io/trestle",

  social: {
    github: "",
    twitter: "",
    linkedin: "",
  },

  nav: [
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog" },
    { label: "About", href: "/about" },
  ],

  /** Off by default. Each is a self-contained fast-follow, not required for a working site. */
  features: {
    search: false,
    comments: false,
    contactForm: false,
  },
} as const;
