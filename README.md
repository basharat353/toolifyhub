# ToolifyHub — Free Online Tools for Everyone

A fast, static website with 25 working, browser-based tools (text, image, developer, calculators and utilities).
Built with plain **HTML5, CSS3 and vanilla JavaScript**: no frameworks, no backend, no paid APIs, and no third-party scripts at runtime.

Every tool processes data **locally in the visitor's browser**. Nothing typed or uploaded is sent to a server.

---

## Project structure

```
tool_website/
├── index.html                 Homepage (generated)
├── 404.html                   Not-found page (generated, uses absolute paths)
├── about.html  contact.html  privacy-policy.html  terms.html  disclaimer.html   (generated)
├── robots.txt  sitemap.xml  site.webmanifest                                    (generated)
├── _headers                   Security + caching headers for Netlify / Cloudflare Pages
├── tools/
│   ├── index.html             "All tools" page with live filter (generated)
│   └── <tool-slug>/index.html One page per tool → clean URLs like /tools/word-counter/ (generated)
├── css/
│   └── style.css              Design system: tokens, light/dark themes, components
├── js/
│   ├── main.js                Theme toggle, mobile menu, search, filter, copy/download/toast helpers
│   ├── tools.js               All 25 tool implementations (pure logic in `Core` + DOM wiring)
│   ├── qrcode.js              Self-contained QR Code encoder (loaded only on the QR page)
│   └── search-index.js        Tool list used by search (generated)
├── assets/
│   └── favicon.svg
└── build/                     Development-only page generator (not needed on the server)
    ├── build.js               Templates + CONFIG; writes all generated files
    ├── tools-data.js          Per-tool SEO text, interface markup, steps, use cases, FAQs, related tools
    ├── pages.js               About / Contact / Privacy / Terms / Disclaimer content
    └── icons.js               Inline SVG icon set
```

**Why a generator?** 33 pages share the same header, footer, meta tags, breadcrumbs and structured data. Keeping that in one template avoids drift and broken links.
The output is ordinary static HTML. You can deploy it as-is, and you can still hand-edit generated files (just remember a rebuild overwrites them).

### The 25 tools

| Category | Tools |
|---|---|
| Text | Word Counter · Character Counter · Case Converter · Remove Extra Spaces · Text Reverser · Lorem Ipsum Generator |
| Image | Image Compressor · Image Resizer · JPG to PNG · PNG to JPG · Image to Base64 |
| Developer | JSON Formatter & Validator · HTML Encoder/Decoder · CSS Minifier · JavaScript Minifier · URL Encoder/Decoder · UUID Generator |
| Calculators | Percentage · Age · Discount · BMI |
| Utility | QR Code Generator · Password Generator · SEO Word & Character Counter · Binary ⇄ Decimal Converter |

---

## Run locally

The site uses folder-based clean URLs (`tools/word-counter/`), so serve it over HTTP rather than double-clicking files.

- **XAMPP (already set up):** start Apache, then open <http://localhost/tool_website/>
- **Node:** `npx serve .` and open the printed URL
- **Python:** `python -m http.server 8080` and open <http://localhost:8080/>

### Editing content

1. Edit `build/tools-data.js` (tool pages), `build/pages.js` (legal/about pages) or the templates in `build/build.js`.
2. Run `node build/build.js` (Node 16+; no `npm install` needed).
3. Refresh the browser.

`css/style.css` and the files in `js/` (except `search-index.js`) are hand-written sources. Edit them directly; the build adds a content hash (`?v=…`) to their URLs for cache-busting.

---

## Before going live — configuration checklist

Edit the `CONFIG` block at the top of `build/build.js`, then rebuild:

| Setting | What to set |
|---|---|
| `siteUrl` | Your real domain, e.g. `https://www.toolifyhub.com` (used for canonical URLs, Open Graph, sitemap, robots.txt) |
| `basePath` | `/` for a root domain. For a GitHub **project** site use `/<repo-name>/` (only affects `404.html`) |
| `contactEmail` | A real inbox you monitor |
| `jurisdiction` | The governing-law location for the Terms of Service |
| `showAdPlaceholders` | `false` to remove the dashed "Advertisement" boxes until you have real ads |
| `lastUpdated` | Date shown on legal pages and in the sitemap |

Also:
- Have the Privacy Policy, Terms and Disclaimer reviewed. They are accurate for the site as built, but they are templates, not legal advice.
- Optionally add a 1200×630 PNG and an `og:image` tag in `head()` in `build.js` for richer social previews. None is included, so no tag points to a missing file.

---

## Deploy

The repository root *is* the website. There is no build step on the host, because generated files are committed.

**Netlify:** drag the folder onto <https://app.netlify.com/drop>, or connect the repo with *Build command* empty and *Publish directory* `.`. `_headers` and `404.html` are picked up automatically.

**Cloudflare Pages:** create a project → connect the repo (or upload the folder) → framework preset *None*, build command empty, output directory `/`. `_headers` and `404.html` work automatically.

**GitHub Pages:** push to a repo → *Settings → Pages* → deploy from branch `main`, folder `/ (root)`. For a project site (`username.github.io/repo/`), set `basePath: '/repo/'` and `siteUrl` accordingly, then rebuild. The `_headers` file is ignored there; that is harmless.

After deploying, submit `https://your-domain/sitemap.xml` in Google Search Console.

---

## Google AdSense readiness

- Ad placeholders sit between content sections and in the tool-page sidebar. They are never inside a tool and never in a pop-up. Each one is marked with an HTML comment: `<!-- Advertisement slot: replace this placeholder… -->`. To change where they appear, edit `adSlot()` in `build/build.js`.
- When you get approval, paste your ad code into those slots (or into `adSlot()` and rebuild), add the AdSense script tag to `head()`, and add an `ads.txt` file at the site root.
- **Update the Privacy Policy before ads go live.** A ready-to-adapt AdSense disclosure is included as an HTML comment in section 5 of `build/pages.js`. For visitors in the EEA, UK and Switzerland, Google requires a certified consent management platform (CMP).
- Approval is never guaranteed. It depends on Google's review of your content, traffic and policies.

---

## External dependencies

**Runtime: none.** No CDNs, web fonts, analytics or external APIs. The QR encoder (`js/qrcode.js`) is self-contained.
**Build: Node.js only**, with built-in modules (`fs`, `path`, `crypto`).

Browser APIs used: Canvas (image tools, QR), Web Crypto (`crypto.getRandomValues` / `randomUUID` for passwords and UUIDs), `Intl.Segmenter` (emoji-safe counting, with a fallback), `BigInt` (binary converter), `FileReader`, `Clipboard`, `localStorage` (theme preference only).
Supported: current Chrome, Edge, Firefox and Safari (desktop and mobile).

---

## Quality assurance performed

- **94 unit tests** on the tool logic in Node: word, sentence and character counting; case conversion; whitespace cleaning; JSON error positions; HTML entities; CSS minification; age edge cases (month-end, leap day); BMI; password character guarantees; UUID validity; binary/decimal with BigInt.
- **QR codes:** 32 combinations (8 payloads × 4 error-correction levels, versions 1–40, including Unicode and emoji) were rendered and decoded back with an independent decoder (jsQR). Every one matched.
- **JS minifier:** it minified its own 100 KB source, and the minified copy produced byte-identical results. A minified `qrcode.js` produced identical QR matrices. ASI, regex, template-literal and `+ +` edge cases were checked.
- **Pages (jsdom):** all 33 pages were checked for broken internal links and anchors, duplicate titles or descriptions, a single `<h1>`, `alt` on every image, unique IDs, valid `label for` / ARIA references, and valid JSON-LD. Every page loads without script errors, and 20 tools passed scripted input/output scenarios.

Not covered automatically: real image encoding (the canvas was simulated in jsdom), the visual layout at each breakpoint, and screen-reader behaviour. Check these by hand in a real browser before launch.

---

## Known limitations (honest notes)

- **Image tools** are limited by browser memory. Very large images (e.g. 48 MP photos on iPhone Safari) may fail with a clear error. Animated GIFs keep only the first frame. Browsers cannot produce lossy PNG, so the compressor outputs JPEG or WebP. WebP output depends on the browser (Safari added WebP encoding only recently), and the option is disabled when unsupported.
- **JavaScript minifier** removes comments and whitespace only (no renaming or dead-code removal) and does not support JSX/TypeScript. A regex literal directly after `)` or `}` can be misread; the built-in syntax check catches most such cases.
- **CSS minifier** is a safe whitespace/comment minifier, not a structural optimiser.
- **Word/sentence counting:** languages without spaces (Chinese, Japanese, Thai) can't be split into words, and abbreviations like "e.g." count as sentence ends.
- **SEO counter:** title pixel width is estimated with 20 px Arial. Reading ease (Flesch) is English-only and uses estimated syllables.
- **Character counter:** platform limits such as X/Twitter (weighted characters, links = 23) are approximations.
- **Age calculator** treats 29 Feb birthdays as 28 Feb in common years; "total hours" assumes 24-hour days.
- **Binary converter** handles integers only (no fractions, no two's-complement interpretation).
- **Contact form** opens the visitor's email app (`mailto:`). Nothing is sent by the site.
- **"Popular" and "Recently added"** are editorial labels set in `tools-data.js` (`popular: true`, `added: n`), not live statistics.
- **Structured data:** `WebSite` and `BreadcrumbList` only. FAQ rich results are restricted to government and health sites, and software-app rich results require genuine ratings, so neither is marked up.
