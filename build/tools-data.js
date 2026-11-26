// Content and interface markup for every tool page.
// Edit text here, then run `node build/build.js` to regenerate the HTML.
// IDs in the `ui` markup are used by js/tools.js — keep them in sync.
'use strict';

const { icon } = require('./icons');

/* ---------- small markup helpers ---------- */
const btn = (id, label, ic, kind = 'secondary', attrs = '') =>
  `<button type="button" class="btn btn-${kind}" id="${id}"${attrs ? ' ' + attrs : ''}>${ic ? icon(ic) : ''}${label}</button>`;
const stat = (id, label, v = '0') =>
  `<div class="stat"><span class="stat-value" id="${id}">${v}</span><span class="stat-label">${label}</span></div>`;
const status = (id) => `<div id="${id}" class="alert" role="status" aria-live="polite" hidden></div>`;
const dropzone = (p, accept, title, hint, multiple) =>
  `<label class="dropzone" id="${p}-drop" for="${p}-file">${icon('upload')}<strong>${title}</strong><span>${hint}</span>` +
  `<input type="file" id="${p}-file" class="sr-only" accept="${accept}"${multiple ? ' multiple' : ''}></label>`;
const ta = (id, label, placeholder, rows = 8, extra = '') =>
  `<div class="field"><label for="${id}">${label}</label><textarea id="${id}" rows="${rows}" placeholder="${placeholder}"${extra ? ' ' + extra : ''}></textarea></div>`;
const out = (id, label, rows = 8, cls = '') =>
  `<div class="field"><label for="${id}">${label}</label><textarea id="${id}" rows="${rows}" readonly${cls ? ` class="${cls}"` : ''} placeholder="Result will appear here"></textarea></div>`;

const categories = [
  { key: 'text', slug: 'text-tools', name: 'Text Tools', cls: 'cat-text', icon: 'text', desc: 'Count words, change letter case, clean up spacing and generate placeholder text.' },
  { key: 'image', slug: 'image-tools', name: 'Image Tools', cls: 'cat-image', icon: 'image', desc: 'Compress, resize and convert images privately in your browser.' },
  { key: 'dev', slug: 'developer-tools', name: 'Developer Tools', cls: 'cat-dev', icon: 'code', desc: 'Format JSON, minify CSS and JavaScript, encode URLs and HTML, and create UUIDs.' },
  { key: 'calc', slug: 'calculators', name: 'Calculators', cls: 'cat-calc', icon: 'calculator', desc: 'Quick, accurate calculators for percentages, age, discounts and BMI.' },
  { key: 'other', slug: 'utility-tools', name: 'Utility Tools', cls: 'cat-other', icon: 'sparkles', desc: 'QR codes, strong passwords, SEO text checks and number conversion.' }
];

const tools = [
  /* =============================== TEXT =============================== */
  {
    slug: 'word-counter', cat: 'text', icon: 'hash', popular: true,
    name: 'Word Counter',
    short: 'Count words, characters, sentences and paragraphs, with reading time.',
    title: 'Word Counter – Count Words & Characters Online | ToolifyHub',
    description: 'Free online word counter. Instantly count words, characters, sentences and paragraphs, and estimate reading and speaking time. Private and works offline.',
    keywords: 'word count words counter essay length reading time',
    intro: [
      'Paste or type any text to instantly see how many words, characters, sentences and paragraphs it contains — plus an estimate of how long it takes to read or say out loud.',
      'Writers, students and marketers often need to hit a specific length: a 500-word essay, a 150-word abstract, or a two-minute speech. This counter updates as you type, so you can edit with the target in view. Your text is counted on your own device and never leaves your browser.'
    ],
    ui: `
      <div class="field">
        <label for="wc-input">Enter or paste your text</label>
        <textarea id="wc-input" rows="11" placeholder="Start typing or paste your text here…"></textarea>
      </div>
      <div class="stats">
        ${stat('wc-words', 'Words')}${stat('wc-chars', 'Characters')}${stat('wc-chars-ns', 'Characters (no spaces)')}
        ${stat('wc-sentences', 'Sentences')}${stat('wc-paragraphs', 'Paragraphs')}${stat('wc-reading', 'Reading time', '0 sec')}${stat('wc-speaking', 'Speaking time', '0 sec')}
      </div>
      <div class="btn-row">${btn('wc-copy', 'Copy text', 'copy')}${btn('wc-clear', 'Clear', 'trash', 'ghost')}</div>`,
    steps: [
      'Type directly into the text box, or paste text you have copied from a document, email or web page.',
      'Watch the counts update instantly: words, characters with and without spaces, sentences and paragraphs.',
      'Check the reading and speaking time estimates if you are preparing an article, presentation or video script.',
      'Edit your text in the box until you reach your target length, then use <strong>Copy text</strong> to take it back to your document.'
    ],
    uses: [
      'Checking that an essay, cover letter or assignment meets a minimum or maximum word count.',
      'Keeping blog posts, product descriptions and newsletters at a consistent length.',
      'Timing a speech, podcast intro or video voice-over before recording.',
      'Trimming an abstract or personal statement to a strict application limit.',
      'Counting words in translation or copywriting work that is billed per word.'
    ],
    extra: [{
      h: 'How words, sentences and reading time are counted',
      html: `<p>A <strong>word</strong> is any run of letters or numbers. Hyphenated words such as “well-known” and contractions such as “don’t” count as one word, and accented and non-Latin letters are supported. A <strong>sentence</strong> ends with a full stop, question mark or exclamation mark. <strong>Paragraphs</strong> are separated by a blank line.</p>
      <p>Reading time uses an average silent reading speed of about 238 words per minute, and speaking time uses about 130 words per minute, a typical pace for presentations. Real speeds vary from person to person, so treat both as estimates.</p>`
    }],
    faqs: [
      ['Is my text saved or uploaded anywhere?', 'No. All counting happens in your browser with JavaScript. Your text is not sent to a server and is not stored. It disappears when you close or refresh the page.'],
      ['Why might my count differ slightly from Microsoft Word or Google Docs?', 'Every program has its own rules for edge cases such as numbers with decimals, URLs, em dashes without spaces, or symbols on their own. Differences are usually just a few words in a long document.'],
      ['Does it count words in languages other than English?', 'Yes, for languages that separate words with spaces, such as Spanish, French, German, Russian or Arabic. Languages written without spaces, such as Chinese, Japanese and Thai, cannot be split into words this way, so use the character count for them instead.'],
      ['How many pages is my word count?', 'As a rough guide, about 500 words fill one single-spaced page and about 250 words fill one double-spaced page in a 12-point font. The exact number depends on the font, margins and formatting.'],
      ['Can I use it offline?', 'Yes. Once the page has loaded, the counter keeps working without an internet connection.']
    ],
    related: ['character-counter', 'seo-word-counter', 'remove-extra-spaces', 'case-converter']
  },
  {
    slug: 'character-counter', cat: 'text', icon: 'counter',
    name: 'Character Counter',
    short: 'Count characters, letters, spaces and bytes, and check social media limits.',
    title: 'Character Counter – Count Characters & Letters | ToolifyHub',
    description: 'Count characters with and without spaces, letters, digits, lines and bytes. Check your text against limits for posts, SMS, meta titles and more. Free.',
    keywords: 'character count letter counter characters limit twitter sms bytes',
    intro: [
      'Count every character in your text — with and without spaces — and see a breakdown of letters, numbers, spaces, symbols, lines and bytes. Pick a limit to see how much room you have left.',
      'Many places limit text by characters rather than words: social media posts, SMS messages, page titles, form fields and database columns. This tool counts emoji and accented letters as single characters, as people see them, and also shows the UTF-8 byte size that matters for developers.'
    ],
    ui: `
      <div class="field">
        <label for="cc-input">Enter or paste your text</label>
        <textarea id="cc-input" rows="9" placeholder="Type or paste text to count its characters…"></textarea>
      </div>
      <div class="row">
        <div class="field">
          <label for="cc-limit">Check against a limit</label>
          <select id="cc-limit">
            <option value="">No limit</option>
            <option value="280">X (Twitter) post – 280</option>
            <option value="160">SMS message – 160</option>
            <option value="60">Page title (guide) – 60</option>
            <option value="160">Meta description (guide) – 160</option>
            <option value="150">Instagram bio – 150</option>
            <option value="2200">Instagram caption – 2,200</option>
            <option value="3000">LinkedIn post – 3,000</option>
            <option value="100">YouTube video title – 100</option>
            <option value="custom">Custom limit…</option>
          </select>
        </div>
        <div class="field" id="cc-custom-wrap" hidden>
          <label for="cc-custom">Custom limit (characters)</label>
          <input type="number" id="cc-custom" min="1" max="1000000" step="1" inputmode="numeric" placeholder="e.g. 500">
        </div>
      </div>
      <div id="cc-limit-status" hidden>
        <div class="meter" id="cc-meter" role="presentation"><span></span></div>
        <div class="meter-row" aria-live="polite"><span id="cc-limit-used"></span><span id="cc-limit-left"></span></div>
      </div>
      <div class="stats">
        ${stat('cc-chars', 'Characters')}${stat('cc-nospace', 'Without spaces')}${stat('cc-letters', 'Letters')}${stat('cc-digits', 'Digits')}
        ${stat('cc-spaces', 'Spaces & line breaks')}${stat('cc-symbols', 'Symbols & punctuation')}${stat('cc-lines', 'Lines')}${stat('cc-bytes', 'Bytes (UTF-8)')}
      </div>
      <div class="btn-row">${btn('cc-copy', 'Copy text', 'copy')}${btn('cc-clear', 'Clear', 'trash', 'ghost')}</div>`,
    steps: [
      'Paste or type your text into the box. All counts update as you type.',
      'Optionally choose a limit — for example an X (Twitter) post or SMS message — or set your own custom number.',
      'Use the progress bar to see how many characters remain, or how far over the limit you are.',
      'Shorten your text as needed, then copy it back to where you need it.'
    ],
    uses: [
      'Writing social media posts that fit within a platform’s character limit.',
      'Keeping SMS marketing messages within a single 160-character segment.',
      'Drafting page titles and meta descriptions that are less likely to be cut off in search results.',
      'Checking that input fits a database column or form field with a maximum length.',
      'Counting characters for translation, subtitles or captions.'
    ],
    faqs: [
      ['Do spaces count as characters?', 'Yes, in most systems spaces count toward a character limit. This tool shows the total both with and without spaces so you can use whichever you need.'],
      ['How are emoji counted?', 'Each emoji is counted as one character, even if it is made of several code points (such as a family emoji or a flag). Some platforms count emoji differently — for example, X (Twitter) counts most emoji as two characters.'],
      ['Is this exactly how X (Twitter) counts characters?', 'Not exactly. X counts every link as 23 characters and counts some characters, such as Chinese, Japanese, Korean and most emoji, as two. Use the 280 limit here as a close guide and check the counter in the app before posting.'],
      ['Why does an SMS limit of 160 sometimes become 70?', 'Standard SMS uses a basic character set that fits 160 characters. If your message includes an emoji or a character outside that set, the whole message switches to Unicode and the limit drops to 70 characters per segment.'],
      ['What are bytes and why would I need them?', 'Bytes measure how much storage the text uses. In UTF-8, basic English letters use one byte each, while accented letters, symbols and emoji use two to four. Developers use byte counts for database limits and network payloads.']
    ],
    related: ['word-counter', 'seo-word-counter', 'case-converter', 'remove-extra-spaces']
  },
  {
    slug: 'case-converter', cat: 'text', icon: 'case', popular: true,
    name: 'Case Converter',
    short: 'Convert text to UPPERCASE, lowercase, Title Case, camelCase and more.',
    title: 'Case Converter – Change Text to Upper, Lower & Title Case',
    description: 'Convert text to UPPERCASE, lowercase, Title Case, Sentence case, camelCase, snake_case, kebab-case and more. Free, instant and private — nothing is uploaded.',
    keywords: 'uppercase lowercase title case sentence case camelcase snake case kebab capitalize',
    intro: [
      'Change the letter case of any text with one click: UPPERCASE, lowercase, Title Case, Sentence case, and programmer formats such as camelCase, snake_case and kebab-case.',
      'Retyping text because Caps Lock was on, or fixing headings that use inconsistent capitalisation, is tedious. Paste your text, choose a format, and copy the result. Line breaks are preserved, so you can convert lists or many lines at once.'
    ],
    ui: `
      ${ta('cv-input', 'Text to convert', 'Paste or type your text here…', 7)}
      <div class="field-label" id="cv-label">Choose a format</div>
      <div class="btn-grid" role="group" aria-labelledby="cv-label">
        <button type="button" class="btn btn-secondary" data-case="upper" aria-pressed="false">UPPERCASE</button>
        <button type="button" class="btn btn-secondary" data-case="lower" aria-pressed="false">lowercase</button>
        <button type="button" class="btn btn-secondary" data-case="title" aria-pressed="false">Title Case</button>
        <button type="button" class="btn btn-secondary" data-case="sentence" aria-pressed="false">Sentence case</button>
        <button type="button" class="btn btn-secondary" data-case="camel" aria-pressed="false">camelCase</button>
        <button type="button" class="btn btn-secondary" data-case="pascal" aria-pressed="false">PascalCase</button>
        <button type="button" class="btn btn-secondary" data-case="snake" aria-pressed="false">snake_case</button>
        <button type="button" class="btn btn-secondary" data-case="constant" aria-pressed="false">CONSTANT_CASE</button>
        <button type="button" class="btn btn-secondary" data-case="kebab" aria-pressed="false">kebab-case</button>
        <button type="button" class="btn btn-secondary" data-case="alternating" aria-pressed="false">aLtErNaTiNg</button>
        <button type="button" class="btn btn-secondary" data-case="inverse" aria-pressed="false">iNVERSE cASE</button>
      </div>
      ${status('cv-status')}
      ${out('cv-output', 'Converted text', 7)}
      <div class="btn-row">${btn('cv-copy', 'Copy result', 'copy', 'primary')}${btn('cv-download', 'Download .txt', 'download')}${btn('cv-clear', 'Clear', 'trash', 'ghost')}</div>`,
    steps: [
      'Paste or type the text you want to convert into the first box.',
      'Click the format you want, such as <strong>Title Case</strong> or <strong>snake_case</strong>.',
      'Review the converted text in the result box. If you edit the original text, the result updates in the same format.',
      'Click <strong>Copy result</strong> or download it as a text file.'
    ],
    uses: [
      'Fixing text that was typed with Caps Lock on by mistake.',
      'Formatting article headings and email subject lines consistently in Title Case.',
      'Turning a phrase into a variable, function or file name (camelCase, snake_case, kebab-case).',
      'Converting a list of names or product titles to a single style.',
      'Creating URL slugs from page titles using kebab-case.'
    ],
    extra: [{
      h: 'Which case should I use?',
      html: `<ul>
        <li><strong>Title Case</strong> capitalises the main words and keeps short words such as “a”, “and”, “of” and “the” lowercase (except at the start or end). Style guides differ slightly, so review important headlines.</li>
        <li><strong>Sentence case</strong> capitalises only the first letter of each sentence and the word “I”. It is common for UI text and modern headings. Proper nouns such as names and places will need to be re-capitalised by hand.</li>
        <li><strong>camelCase</strong> and <strong>PascalCase</strong> are used for variable and class names in languages such as JavaScript, Java and C#.</li>
        <li><strong>snake_case</strong> is common in Python and databases; <strong>CONSTANT_CASE</strong> is used for constants; <strong>kebab-case</strong> is used in URLs and CSS class names.</li>
      </ul>`
    }],
    faqs: [
      ['Will Sentence case keep names capitalised?', 'No. The tool cannot tell which words are names or places, so it lowercases everything except the start of each sentence and the word “I”. Re-capitalise proper nouns after converting.'],
      ['Does the converter keep my line breaks?', 'Yes. Each line is converted separately and the line breaks stay where they were. For camelCase, snake_case and similar formats, each line becomes one identifier.'],
      ['Does it work with accented and non-English letters?', 'Yes. Letters such as é, ß, ç and Cyrillic or Greek characters are converted using your browser’s built-in Unicode case rules.'],
      ['Is there a limit to how much text I can convert?', 'There is no fixed limit. Very large texts (several megabytes) may take a moment, depending on your device.'],
      ['Is my text private?', 'Yes. Conversion happens entirely in your browser and nothing is uploaded or saved.']
    ],
    related: ['remove-extra-spaces', 'text-reverser', 'word-counter', 'character-counter']
  },
  {
    slug: 'remove-extra-spaces', cat: 'text', icon: 'spaces',
    name: 'Remove Extra Spaces',
    short: 'Clean up double spaces, tabs, blank lines and line breaks in text.',
    title: 'Remove Extra Spaces – Clean Up Whitespace Online | ToolifyHub',
    description: 'Remove double spaces, leading and trailing spaces, tabs, empty lines and unwanted line breaks from text instantly. Free whitespace cleaner that runs in your browser.',
    keywords: 'remove double spaces whitespace trim blank lines line breaks clean text',
    intro: [
      'Clean up messy text in one step: collapse double spaces, trim the ends of lines, remove blank lines or join lines into a paragraph, and strip invisible characters that cause problems.',
      'Text copied from PDFs, emails, spreadsheets and websites often carries stray spaces, tabs and broken line breaks. Choose the clean-up options you want and the result updates instantly, with a count of how many characters were removed.'
    ],
    ui: `
      ${ta('rs-input', 'Text to clean', 'Paste text with extra spaces here…', 8)}
      <fieldset>
        <legend>Clean-up options</legend>
        <div class="checks">
          <label class="check"><input type="checkbox" id="rs-collapse" checked> Replace multiple spaces with one</label>
          <label class="check"><input type="checkbox" id="rs-trim" checked> Trim spaces at the start and end of lines</label>
          <label class="check"><input type="checkbox" id="rs-tabs" checked> Convert tabs to spaces</label>
          <label class="check"><input type="checkbox" id="rs-nbsp" checked> Fix non-breaking and invisible spaces</label>
          <label class="check"><input type="checkbox" id="rs-collapse-empty" checked> Reduce multiple blank lines to one</label>
          <label class="check"><input type="checkbox" id="rs-remove-empty"> Remove all blank lines</label>
          <label class="check"><input type="checkbox" id="rs-join"> Remove line breaks (join into one paragraph)</label>
        </div>
      </fieldset>
      ${out('rs-output', 'Cleaned text', 8)}
      <p id="rs-summary" class="muted" aria-live="polite"></p>
      <div class="btn-row">${btn('rs-copy', 'Copy result', 'copy', 'primary')}${btn('rs-download', 'Download .txt', 'download')}${btn('rs-clear', 'Clear', 'trash', 'ghost')}</div>`,
    steps: [
      'Paste the text you want to clean into the first box.',
      'Tick the clean-up options you need. The default options fix the most common spacing problems.',
      'Check the cleaned text in the result box — it updates as you change options.',
      'Copy the cleaned text or download it as a .txt file.'
    ],
    uses: [
      'Fixing text copied from a PDF where every line ends with a hard line break.',
      'Removing double spaces after full stops in older documents.',
      'Cleaning data pasted from spreadsheets before importing it elsewhere.',
      'Stripping invisible non-breaking or zero-width spaces that break searches and code.',
      'Tidying up email text or website content before publishing.'
    ],
    faqs: [
      ['What are non-breaking and zero-width spaces?', 'A non-breaking space looks like a normal space but stops a line from breaking at that point. Zero-width spaces are invisible characters. Both often come from websites and word processors and can cause problems in searches, spreadsheets and code. The “fix” option turns non-breaking spaces into normal spaces and removes zero-width characters.'],
      ['How do I fix text copied from a PDF?', 'Turn on “Remove line breaks” to join the broken lines into one paragraph. If your text has several paragraphs, process them one at a time, or keep line breaks on and edit manually.'],
      ['Will this change the words in my text?', 'No. Only whitespace characters are changed or removed. Letters, numbers and punctuation stay exactly as they were.'],
      ['Does it work with code?', 'It can, but be careful: indentation is significant in languages such as Python and YAML. Turn off “Trim spaces” and “Convert tabs” if you need to keep indentation.']
    ],
    related: ['case-converter', 'word-counter', 'text-reverser', 'character-counter']
  },
  {
    slug: 'text-reverser', cat: 'text', icon: 'reverse',
    name: 'Text Reverser',
    short: 'Reverse text backwards, flip word order, or reverse each word or line.',
    title: 'Text Reverser – Reverse Text, Words & Lines Online | ToolifyHub',
    description: 'Reverse text backwards, flip the order of words or lines, or reverse each word individually. Emoji-safe, instant and free. Works entirely in your browser.',
    keywords: 'reverse text backwards flip words mirror reverse string lines',
    intro: [
      'Write text backwards, reverse the order of words or lines, or spell each word in reverse while keeping word order. The result appears instantly as you type.',
      'Reversing text is handy for puzzles, games, social posts, testing software and checking palindromes. Unlike simple scripts, this tool keeps emoji, accented letters and flags intact when reversing.'
    ],
    ui: `
      ${ta('tr-input', 'Text to reverse', 'Type or paste text here…', 6)}
      <fieldset>
        <legend>Reverse mode</legend>
        <div class="checks">
          <label class="check"><input type="radio" name="tr-mode" value="chars" checked> Reverse all text (backwards)</label>
          <label class="check"><input type="radio" name="tr-mode" value="words"> Reverse word order</label>
          <label class="check"><input type="radio" name="tr-mode" value="each"> Reverse each word</label>
          <label class="check"><input type="radio" name="tr-mode" value="lines"> Reverse line order</label>
        </div>
      </fieldset>
      ${out('tr-output', 'Reversed text', 6)}
      <div class="btn-row">${btn('tr-copy', 'Copy result', 'copy', 'primary')}${btn('tr-swap', 'Use result as input', 'swap')}${btn('tr-clear', 'Clear', 'trash', 'ghost')}</div>`,
    steps: [
      'Enter or paste your text in the top box.',
      'Choose how to reverse it: the whole text, the order of words, each word, or the order of lines.',
      'The reversed text appears immediately in the result box.',
      'Copy the result, or click <strong>Use result as input</strong> to apply another reversal.'
    ],
    uses: [
      'Creating puzzles, riddles or secret messages for games and classrooms.',
      'Checking whether a word or phrase is a palindrome.',
      'Reversing a list so the last item comes first, such as a log or ranking.',
      'Testing how software handles reversed or right-to-left strings.',
      'Making playful mirrored text for social media posts.'
    ],
    faqs: [
      ['Are emoji and accented letters reversed correctly?', 'Yes. The tool treats each visible character as one unit, so emoji, flags and letters with accents stay intact instead of turning into broken symbols.'],
      ['What is the difference between “reverse word order” and “reverse each word”?', '“Reverse word order” turns “one two three” into “three two one”. “Reverse each word” keeps the order but spells each word backwards: “eno owt eerht”.'],
      ['Is this the same as upside-down or mirror text?', 'No. This tool changes the order of characters, not their shape. Upside-down text uses special look-alike characters, which may not display on every device or be read correctly by screen readers.'],
      ['Is my text stored?', 'No. Everything happens in your browser and nothing is saved or uploaded.']
    ],
    related: ['case-converter', 'remove-extra-spaces', 'word-counter', 'lorem-ipsum-generator']
  },
  {
    slug: 'lorem-ipsum-generator', cat: 'text', icon: 'paragraph',
    name: 'Lorem Ipsum Generator',
    short: 'Generate placeholder paragraphs, sentences or words for designs.',
    title: 'Lorem Ipsum Generator – Free Placeholder Text | ToolifyHub',
    description: 'Generate Lorem Ipsum placeholder text by paragraphs, sentences or words. Optional HTML paragraph tags. Copy or download dummy text for mockups instantly.',
    keywords: 'lorem ipsum dummy text placeholder filler text generator',
    intro: [
      'Generate as much Lorem Ipsum placeholder text as you need — by paragraphs, sentences or words — and copy it straight into your design, website or document.',
      'Lorem Ipsum is pseudo-Latin filler text that designers have used for decades. Because it looks like real text but can’t be read, it lets people judge a layout, font and spacing without being distracted by the words.'
    ],
    ui: `
      <div class="row">
        <div class="field"><label for="li-count">Amount</label><input type="number" id="li-count" value="3" min="1" max="100" step="1" inputmode="numeric"></div>
        <div class="field"><label for="li-unit">Generate</label>
          <select id="li-unit"><option value="paragraphs">Paragraphs</option><option value="sentences">Sentences</option><option value="words">Words</option></select></div>
      </div>
      <div class="checks">
        <label class="check"><input type="checkbox" id="li-classic" checked> Start with “Lorem ipsum dolor sit amet…”</label>
        <label class="check"><input type="checkbox" id="li-html"> Wrap paragraphs in &lt;p&gt; tags</label>
      </div>
      <div class="btn-row">${btn('li-generate', 'Generate text', 'refresh', 'primary')}</div>
      ${status('li-error')}
      ${out('li-output', 'Placeholder text', 10)}
      <div class="btn-row">${btn('li-copy', 'Copy text', 'copy', 'primary')}${btn('li-download', 'Download', 'download')}${btn('li-clear', 'Clear', 'trash', 'ghost')}</div>`,
    steps: [
      'Enter how much text you need and choose paragraphs, sentences or words.',
      'Choose whether to begin with the classic “Lorem ipsum dolor sit amet” opening and whether to add HTML &lt;p&gt; tags.',
      'Click <strong>Generate text</strong>. Each click creates a new random variation.',
      'Copy the text or download it as a .txt or .html file.'
    ],
    uses: [
      'Filling website and app mockups before the final copy is written.',
      'Testing how a blog template or email layout handles long and short paragraphs.',
      'Checking typography: font size, line height and line length.',
      'Creating sample content for presentations, wireframes and print layouts.',
      'Populating a database or CMS with test entries during development.'
    ],
    faqs: [
      ['What does Lorem Ipsum mean?', 'It comes from a scrambled passage of “De finibus bonorum et malorum”, a philosophical text written by Cicero in 45 BC. The words have been altered and mixed, so the result has no real meaning.'],
      ['Why not just use real text?', 'Real text draws attention to what it says. Neutral placeholder text keeps feedback focused on the design. That said, testing with realistic content before launch is always a good idea.'],
      ['Is generated Lorem Ipsum free to use?', 'Yes. Lorem Ipsum is not copyrighted placeholder text, and you can use what you generate here in personal and commercial projects.'],
      ['How much text can I generate?', 'Up to 100 paragraphs, 500 sentences or 5,000 words at a time.'],
      ['Should I remove Lorem Ipsum before publishing?', 'Yes. Placeholder text on a live page looks unfinished and provides no value to visitors or search engines. Replace it with real, helpful content.']
    ],
    related: ['word-counter', 'case-converter', 'text-reverser', 'html-encoder-decoder']
  },

  /* =============================== IMAGE =============================== */
  {
    slug: 'image-compressor', cat: 'image', icon: 'compress', popular: true,
    name: 'Image Compressor',
    short: 'Reduce JPG, PNG and WebP file size with adjustable quality.',
    title: 'Image Compressor – Reduce Image File Size Online Free',
    description: 'Compress JPG, PNG and WebP images in your browser. Adjust quality, set a maximum width, compare before and after, and download. Images are never uploaded.',
    keywords: 'compress image reduce file size jpg png webp optimize photo smaller',
    scripts: [],
    intro: [
      'Make images smaller for websites, email and uploads. Choose a quality level and optional maximum width, compare the result side by side, and download the compressed file.',
      'Large photos slow down web pages and often exceed upload limits. This compressor re-encodes your image as JPEG or WebP using your browser’s built-in image engine. Your image is processed on your own device and is never uploaded to a server.'
    ],
    ui: `
      ${dropzone('ic', 'image/jpeg,image/png,image/webp', 'Choose an image or drag it here', 'JPG, PNG or WebP · up to 50 MB · processed on your device')}
      ${status('ic-error')}
      <div id="ic-work" hidden>
        <div class="row" style="margin-top:18px">
          <div class="field"><label for="ic-quality">Quality: <output id="ic-quality-out" for="ic-quality">75%</output></label>
            <input type="range" id="ic-quality" min="10" max="100" step="1" value="75"><p class="hint">Lower quality = smaller file. 60–80% is a good balance for photos.</p></div>
          <div class="field"><label for="ic-format">Output format</label>
            <select id="ic-format"><option value="image/jpeg">JPEG (best compatibility)</option><option value="image/webp">WebP (smaller, keeps transparency)</option></select></div>
          <div class="field"><label for="ic-maxw">Max width in pixels (optional)</label>
            <input type="number" id="ic-maxw" min="1" max="20000" step="1" inputmode="numeric" placeholder="Keep original size"></div>
        </div>
        <div class="compare">
          <figure class="checker-wrap"><img id="ic-orig-img" class="checker" alt="Original image"><figcaption>Original · <span id="ic-orig-info"></span></figcaption></figure>
          <figure><img id="ic-out-img" class="checker" alt="Compressed image preview"><figcaption>Compressed · <span id="ic-out-info">…</span></figcaption></figure>
        </div>
        ${status('ic-summary')}
        <div class="btn-row">${btn('ic-download', 'Download compressed image', 'download', 'primary')}${btn('ic-reset', 'Start over', 'refresh', 'ghost')}</div>
      </div>`,
    steps: [
      'Click the upload area or drag and drop a JPG, PNG or WebP image onto it.',
      'Adjust the <strong>Quality</strong> slider. The preview and file size update automatically.',
      'Optionally choose WebP for even smaller files, or set a maximum width to shrink large photos.',
      'Compare the original and compressed versions, then click <strong>Download compressed image</strong>.'
    ],
    uses: [
      'Speeding up a website by reducing the size of photos and banners.',
      'Making photos small enough to attach to an email or upload to a form with a size limit.',
      'Optimising product images for an online store.',
      'Reducing phone photos before sharing them or storing them in the cloud.',
      'Preparing images for a blog post without installing photo-editing software.'
    ],
    extra: [{
      h: 'Tips for the best results',
      html: `<ul>
        <li><strong>Photos</strong> usually compress well at 60–80% quality with little visible difference.</li>
        <li><strong>Resizing helps most.</strong> A 4000-pixel-wide phone photo shown at 1200 pixels wastes data — set a max width to cut file size dramatically.</li>
        <li><strong>WebP</strong> files are typically smaller than JPEG at similar quality and are supported by all modern browsers.</li>
        <li><strong>Screenshots, logos and graphics with text</strong> may look blurry as JPEG. For these, a PNG is often a better choice.</li>
        <li>Compression re-encodes the image, which removes most metadata such as camera details and GPS location.</li>
      </ul>`
    }],
    faqs: [
      ['Are my images uploaded to your server?', 'No. Compression uses your browser’s Canvas API, so the image never leaves your device. You can even disconnect from the internet after the page loads.'],
      ['Why is my compressed image larger than the original?', 'If the original was already heavily optimised, re-encoding it at high quality can produce a larger file. Lower the quality, choose WebP, or set a smaller max width. The tool warns you when this happens.'],
      ['Can I compress PNG files without losing transparency?', 'Choose WebP as the output format to keep transparency. JPEG does not support transparency, so transparent areas become white. Browsers cannot produce lossy PNG files, so PNG input is saved as JPEG or WebP.'],
      ['Does compression remove EXIF data such as location?', 'Yes. Because the image is redrawn and re-encoded, the output normally contains no camera metadata or GPS coordinates. Most browsers apply the photo’s rotation before drawing, so orientation is kept.'],
      ['Can I compress several images at once?', 'This tool handles one image at a time so you can fine-tune each result. To change formats in bulk, try the JPG to PNG or PNG to JPG converters, which accept up to 20 files.']
    ],
    related: ['image-resizer', 'png-to-jpg', 'jpg-to-png', 'image-to-base64']
  },
  {
    slug: 'image-resizer', cat: 'image', icon: 'resize',
    name: 'Image Resizer',
    short: 'Resize images to exact pixel dimensions or by percentage.',
    title: 'Image Resizer – Resize Images to Any Size Online | ToolifyHub',
    description: 'Resize JPG, PNG, WebP and GIF images to exact pixel dimensions or a percentage. Keep the aspect ratio, choose the output format and download. 100% in-browser.',
    keywords: 'resize image change dimensions pixels scale photo width height',
    intro: [
      'Change an image’s width and height in pixels, or scale it by a percentage. Lock the aspect ratio to avoid stretching, pick an output format, and download the resized image.',
      'Websites, social networks and online forms often require images at specific sizes. This resizer uses high-quality step-by-step downscaling for sharp results, and all processing happens privately in your browser.'
    ],
    ui: `
      ${dropzone('ir', 'image/*', 'Choose an image or drag it here', 'JPG, PNG, WebP, GIF or BMP · up to 50 MB')}
      ${status('ir-error')}
      <div id="ir-work" hidden>
        <p class="muted" style="margin-top:16px"><strong>Original:</strong> <span id="ir-orig-info"></span></p>
        <div class="seg" role="group" aria-label="Resize method">
          <button type="button" id="ir-mode-px" aria-pressed="true">By pixels</button>
          <button type="button" id="ir-mode-pct" aria-pressed="false">By percentage</button>
        </div>
        <div id="ir-px-fields">
          <div class="row">
            <div class="field"><label for="ir-width">Width (px)</label><input type="number" id="ir-width" min="1" max="16384" step="1" inputmode="numeric"></div>
            <div class="field"><label for="ir-height">Height (px)</label><input type="number" id="ir-height" min="1" max="16384" step="1" inputmode="numeric"></div>
          </div>
          <label class="check"><input type="checkbox" id="ir-lock" checked> Keep aspect ratio</label>
        </div>
        <div id="ir-pct-fields" hidden>
          <div class="field" style="max-width:240px"><label for="ir-pct">Scale (%)</label><input type="number" id="ir-pct" min="1" max="1000" step="1" value="50" inputmode="numeric"></div>
        </div>
        <div class="row" style="margin-top:12px">
          <div class="field"><label for="ir-format">Output format</label>
            <select id="ir-format"><option value="original">Same as original</option><option value="image/jpeg">JPEG</option><option value="image/png">PNG</option><option value="image/webp">WebP</option></select></div>
          <div class="field" id="ir-quality-field"><label for="ir-quality">Quality: <output id="ir-quality-out" for="ir-quality">90%</output></label><input type="range" id="ir-quality" min="10" max="100" value="90"></div>
        </div>
        <div class="btn-row">${btn('ir-resize', 'Resize image', 'resize', 'primary')}${btn('ir-reset', 'Start over', 'refresh', 'ghost')}</div>
        <div id="ir-result" hidden>
          <figure class="preview"><img id="ir-out-img" class="checker" alt="Resized image preview"><figcaption id="ir-out-info"></figcaption></figure>
          <div class="btn-row">${btn('ir-download', 'Download resized image', 'download', 'primary')}</div>
        </div>
      </div>`,
    steps: [
      'Upload an image by clicking the upload area or dragging a file onto it.',
      'Choose <strong>By pixels</strong> and enter a new width or height, or choose <strong>By percentage</strong> and enter a scale such as 50%.',
      'Keep “Keep aspect ratio” ticked to prevent stretching, and choose an output format if you want to change it.',
      'Click <strong>Resize image</strong>, check the preview, then download the result.'
    ],
    uses: [
      'Creating profile pictures, banners and thumbnails at the exact size a platform requires.',
      'Shrinking large camera photos for faster websites and smaller email attachments.',
      'Meeting the pixel requirements of job application, visa or exam upload forms.',
      'Preparing product images with consistent dimensions for an online shop.',
      'Scaling icons and graphics for presentations and documents.'
    ],
    faqs: [
      ['Will resizing reduce the image quality?', 'Making an image smaller keeps it sharp — this tool downscales in several steps for a cleaner result. Making an image larger than its original size cannot add detail, so upscaled images may look soft.'],
      ['What does “keep aspect ratio” do?', 'It keeps the width and height in the same proportion as the original, so the picture is not stretched or squashed. When you change one value, the other updates automatically.'],
      ['What is the largest size I can create?', 'Up to 16,384 pixels on each side, though very large images may fail on phones and tablets because of browser memory limits.'],
      ['Are animated GIFs supported?', 'You can resize a GIF, but only the first frame is kept, because the browser’s canvas cannot encode animations. The output is saved as PNG unless you choose another format.'],
      ['Is my image uploaded?', 'No. Resizing happens in your browser using the Canvas API. Your image is never sent to a server.']
    ],
    related: ['image-compressor', 'jpg-to-png', 'png-to-jpg', 'image-to-base64']
  },
  {
    slug: 'jpg-to-png', cat: 'image', icon: 'convert',
    name: 'JPG to PNG Converter',
    short: 'Convert JPG/JPEG photos to PNG format in bulk.',
    title: 'JPG to PNG Converter – Convert JPEG to PNG Free | ToolifyHub',
    description: 'Convert JPG and JPEG images to PNG in your browser. Convert up to 20 files at once and download them individually. Free, fast and private — no uploads.',
    keywords: 'jpg to png jpeg to png convert image format',
    intro: [
      'Convert JPG or JPEG images to PNG format in seconds. Add up to 20 images at once and download each converted PNG with one click.',
      'PNG is a lossless format, so it does not add further compression artefacts when you edit and re-save an image. Converting a JPG to PNG is useful when an app or form requires PNG, or before adding text and graphics on top of a photo.'
    ],
    ui: `
      ${dropzone('ix', 'image/jpeg,.jpg,.jpeg', 'Choose JPG images or drag them here', 'Up to 20 JPG/JPEG files · converted on your device', true)}
      ${status('ix-error')}
      <ul class="file-list" id="ix-list" aria-live="polite"></ul>
      <div class="btn-row" id="ix-actions" hidden>${btn('ix-download-all', 'Download all', 'download', 'primary')}${btn('ix-clear', 'Clear list', 'trash', 'ghost')}</div>`,
    steps: [
      'Click the upload area or drag one or more JPG/JPEG images onto it.',
      'Each image is converted to PNG automatically and appears in the list with its new file size.',
      'Click <strong>Download</strong> next to an image, or <strong>Download all</strong> to save every PNG.',
      'Use <strong>Clear list</strong> to start again with new images.'
    ],
    uses: [
      'Meeting upload requirements on websites and apps that only accept PNG files.',
      'Preparing a photo for editing so that repeated saves do not degrade it further.',
      'Adding images to design tools and documents that work best with PNG.',
      'Converting a batch of photos for a presentation or school project.'
    ],
    faqs: [
      ['Will converting to PNG improve the image quality?', 'No. Converting cannot restore detail that JPG compression already removed. It does stop further quality loss in future edits, because PNG is lossless.'],
      ['Why is the PNG file larger than the JPG?', 'PNG uses lossless compression, which is less efficient for photos than JPG’s lossy compression. A PNG of a photo is often two to five times larger. If file size matters more, keep the JPG or use the Image Compressor.'],
      ['Does the PNG have a transparent background?', 'No. JPG images have no transparency, so the PNG keeps the original solid background. Removing a background requires a separate editing step.'],
      ['Why did “Download all” only save some files?', 'Some browsers ask for permission before a site downloads several files at once. Allow multiple downloads when prompted, or download images one by one.'],
      ['Are my photos uploaded?', 'No. Conversion uses your browser’s Canvas API, and your images never leave your device.']
    ],
    related: ['png-to-jpg', 'image-compressor', 'image-resizer', 'image-to-base64']
  },
  {
    slug: 'png-to-jpg', cat: 'image', icon: 'convert',
    name: 'PNG to JPG Converter',
    short: 'Convert PNG images to smaller JPG files with a custom background.',
    title: 'PNG to JPG Converter – Convert PNG to JPEG Free | ToolifyHub',
    description: 'Convert PNG images to JPG in your browser. Choose the quality and a background colour for transparent areas, and convert up to 20 files at once. No uploads.',
    keywords: 'png to jpg png to jpeg convert image smaller file',
    intro: [
      'Convert PNG images to JPG (JPEG) to make them smaller and more widely compatible. Set the quality, choose a background colour for transparent areas, and convert up to 20 images at once.',
      'PNG files, especially photos and screenshots, can be very large. JPG uses lossy compression that usually makes photos much smaller with little visible difference — ideal for email, websites and uploads.'
    ],
    ui: `
      <div class="row">
        <div class="field"><label for="ix-quality">JPG quality: <output id="ix-quality-out" for="ix-quality">90%</output></label><input type="range" id="ix-quality" min="10" max="100" value="90"></div>
        <div class="field"><label for="ix-bg">Background for transparent areas</label><input type="color" id="ix-bg" value="#ffffff"></div>
      </div>
      ${dropzone('ix', 'image/png,.png', 'Choose PNG images or drag them here', 'Up to 20 PNG files · converted on your device', true)}
      ${status('ix-error')}
      <ul class="file-list" id="ix-list" aria-live="polite"></ul>
      <div class="btn-row" id="ix-actions" hidden>${btn('ix-download-all', 'Download all', 'download', 'primary')}${btn('ix-clear', 'Clear list', 'trash', 'ghost')}</div>`,
    steps: [
      'Set the JPG quality and the background colour that should replace any transparent areas.',
      'Click the upload area or drag one or more PNG images onto it.',
      'Each image is converted immediately. Changing the quality or background re-converts the list.',
      'Download images one at a time or click <strong>Download all</strong>.'
    ],
    uses: [
      'Shrinking large screenshots and PNG photos before emailing them.',
      'Uploading images to sites that only accept JPG files.',
      'Reducing image sizes for faster-loading web pages.',
      'Converting graphics with transparency onto a solid brand-colour background.'
    ],
    faqs: [
      ['What happens to transparent areas?', 'JPG does not support transparency, so transparent pixels are filled with the background colour you choose. White is the default.'],
      ['What quality should I choose?', 'For photos, 80–90% gives a good balance of size and quality. For screenshots with text, use a higher quality (90–100%) to keep text crisp, or keep the image as PNG.'],
      ['Is JPG always smaller than PNG?', 'Usually for photos, often dramatically. For simple graphics with flat colours, a PNG can sometimes be smaller and sharper than a JPG.'],
      ['Are my images private?', 'Yes. Conversion happens entirely in your browser, and no images are uploaded or stored.']
    ],
    related: ['jpg-to-png', 'image-compressor', 'image-resizer', 'image-to-base64']
  },
  {
    slug: 'image-to-base64', cat: 'image', icon: 'fileText',
    name: 'Image to Base64 Converter',
    short: 'Encode images as Base64 data URIs for HTML, CSS and JSON.',
    title: 'Image to Base64 Converter – Data URI Encoder | ToolifyHub',
    description: 'Convert PNG, JPG, GIF, WebP, SVG and ICO images to Base64. Copy a data URI, raw Base64, an HTML img tag or a CSS background rule. Free and private.',
    keywords: 'image to base64 data uri encode png jpg svg base64 css html',
    intro: [
      'Encode any image as Base64 text so you can embed it directly in HTML, CSS, JSON or email templates. Choose the output style you need — data URI, raw Base64, an &lt;img&gt; tag or a CSS background — and copy it with one click.',
      'Embedding small images such as icons and logos removes an extra network request, which can be useful for emails, single-file pages and prototypes. The file is read locally by your browser and is never uploaded.'
    ],
    ui: `
      ${dropzone('ib', 'image/*,.svg,.ico', 'Choose an image or drag it here', 'PNG, JPG, GIF, WebP, SVG or ICO · up to 10 MB')}
      ${status('ib-error')}
      <div id="ib-work" hidden>
        <div class="row" style="margin-top:16px;align-items:start">
          <figure class="preview"><img id="ib-preview" class="checker" alt=""><figcaption id="ib-info"></figcaption></figure>
          <div class="field"><label for="ib-format">Output format</label>
            <select id="ib-format">
              <option value="datauri">Data URI (data:image/…;base64,…)</option>
              <option value="base64">Base64 only</option>
              <option value="img">HTML &lt;img&gt; tag</option>
              <option value="css">CSS background-image</option>
            </select>
            <p class="hint" id="ib-length"></p>
          </div>
        </div>
        ${out('ib-output', 'Base64 output', 8, 'mono')}
        <div class="btn-row">${btn('ib-copy', 'Copy', 'copy', 'primary')}${btn('ib-download', 'Download .txt', 'download')}${btn('ib-clear', 'Clear', 'trash', 'ghost')}</div>
      </div>`,
    steps: [
      'Upload an image by clicking the upload area or dragging the file onto it.',
      'Check the preview and file details to confirm it is the right image.',
      'Choose an output format: a full data URI, Base64 only, a ready-made HTML tag or a CSS rule.',
      'Click <strong>Copy</strong> and paste the code into your project, or download it as a text file.'
    ],
    uses: [
      'Embedding small icons and logos in HTML emails, where linked images are often blocked by default.',
      'Inlining images in a CSS file to reduce HTTP requests.',
      'Including images in JSON API payloads or configuration files.',
      'Building single-file HTML demos and prototypes that work offline.'
    ],
    faqs: [
      ['What is Base64?', 'Base64 is a way to represent binary data, such as an image, using only 64 safe text characters. This lets you store or send an image anywhere that accepts text.'],
      ['Why is the Base64 text larger than my image?', 'Base64 encoding increases size by about 33%: every 3 bytes become 4 characters. That is why it is best for small images under roughly 10 KB.'],
      ['Should I use Base64 images on my website?', 'For tiny icons it can save a request. For larger images, a normal image file is usually better because browsers can cache it separately and load it in parallel.'],
      ['Is my image uploaded?', 'No. The image is read with your browser’s FileReader API, and the Base64 text is created on your device.']
    ],
    related: ['image-compressor', 'image-resizer', 'url-encoder-decoder', 'html-encoder-decoder']
  },

  /* =============================== DEVELOPER =============================== */
  {
    slug: 'json-formatter', cat: 'dev', icon: 'braces', popular: true,
    name: 'JSON Formatter & Validator',
    short: 'Beautify, minify and validate JSON with clear error messages.',
    title: 'JSON Formatter & Validator – Beautify JSON Online | ToolifyHub',
    description: 'Format, beautify, minify and validate JSON online. Find syntax errors with the line and column, sort keys, choose indentation and download the result. Private.',
    keywords: 'json formatter json validator beautify json minify json pretty print lint parse',
    intro: [
      'Paste JSON to format it with clean indentation, compress it to a single line, or check it for errors. Invalid JSON is reported with the line and column of the problem and a pointer to the exact spot.',
      'Unformatted JSON from APIs and log files is hard to read, and a single missing comma can break an application. Everything runs in your browser, so you can safely format API responses and configuration files that contain private data.'
    ],
    ui: `
      ${ta('jf-input', 'JSON input', 'Paste JSON here, e.g. {&quot;name&quot;: &quot;value&quot;}', 10, 'class="mono" spellcheck="false" autocapitalize="off" autocomplete="off"')}
      <div class="row">
        <div class="field"><label for="jf-indent">Indentation</label>
          <select id="jf-indent"><option value="2">2 spaces</option><option value="4">4 spaces</option><option value="tab">Tabs</option></select></div>
        <div class="field" style="justify-content:flex-end"><label class="check"><input type="checkbox" id="jf-sort"> Sort keys alphabetically</label></div>
      </div>
      <div class="btn-row">
        ${btn('jf-format', 'Format / Beautify', 'braces', 'primary')}${btn('jf-minify', 'Minify', 'compress')}${btn('jf-validate', 'Validate', 'check')}${btn('jf-sample', 'Load sample', 'fileText', 'ghost')}${btn('jf-clear', 'Clear', 'trash', 'ghost')}
      </div>
      ${status('jf-status')}
      ${out('jf-output', 'Result', 12, 'mono')}
      <div class="btn-row">${btn('jf-copy', 'Copy result', 'copy', 'primary')}${btn('jf-download', 'Download .json', 'download')}</div>`,
    steps: [
      'Paste your JSON into the input box, or click <strong>Load sample</strong> to try it out.',
      'Choose an indentation style and, if you like, tick “Sort keys alphabetically”.',
      'Click <strong>Format / Beautify</strong> for readable output, <strong>Minify</strong> for the smallest size, or <strong>Validate</strong> to check syntax only. Tip: press Ctrl + Enter to format.',
      'If there is an error, fix the line shown in the message and try again. Then copy or download the result.'
    ],
    uses: [
      'Reading and debugging API responses during development.',
      'Finding the missing comma or bracket that breaks a configuration file.',
      'Minifying JSON to reduce payload size before sending or storing it.',
      'Sorting keys so two JSON files are easier to compare.',
      'Checking webhook payloads and exported data before importing them.'
    ],
    extra: [{
      h: 'Common JSON errors',
      html: `<ul>
        <li><strong>Trailing commas</strong> — <code>{"a": 1,}</code> is invalid; remove the last comma.</li>
        <li><strong>Single quotes</strong> — JSON requires double quotes: <code>"name"</code>, not <code>'name'</code>.</li>
        <li><strong>Unquoted keys</strong> — <code>{name: "x"}</code> is valid JavaScript, but not valid JSON.</li>
        <li><strong>Comments</strong> — standard JSON does not allow <code>//</code> or <code>/* */</code> comments.</li>
        <li><strong>Special values</strong> — <code>undefined</code>, <code>NaN</code> and <code>Infinity</code> are not valid JSON values.</li>
      </ul>`
    }],
    faqs: [
      ['Is my JSON sent to a server?', 'No. Parsing and formatting use your browser’s built-in JSON engine, and nothing is uploaded or saved. This makes it safe for API keys, tokens and customer data — though it is always wise to avoid pasting secrets into any website you don’t trust.'],
      ['Why did a large number change after formatting?', 'JavaScript stores numbers as 64-bit floating point, so integers larger than 9,007,199,254,740,991 (2^53 − 1) lose precision. Store such values (for example, IDs) as strings in your JSON.'],
      ['What happens to duplicate keys?', 'JSON parsers keep only the last value for a duplicated key, so duplicates disappear after formatting. Validation does not flag them as errors because the JSON standard allows them, although it discourages them.'],
      ['Does it support JSON5 or comments?', 'No. The tool follows the strict JSON standard (RFC 8259) used by APIs. Remove comments and trailing commas first.'],
      ['How large a file can I format?', 'Several megabytes usually work fine. Very large files depend on your device’s memory and may make the page slow.']
    ],
    related: ['javascript-minifier', 'css-minifier', 'url-encoder-decoder', 'html-encoder-decoder']
  },
  {
    slug: 'html-encoder-decoder', cat: 'dev', icon: 'tag',
    name: 'HTML Encoder & Decoder',
    short: 'Convert special characters to HTML entities and back.',
    title: 'HTML Encoder & Decoder – Escape HTML Entities | ToolifyHub',
    description: 'Encode special characters such as < > & " as HTML entities, or decode entities like &amp; and &#169; back to plain text. Free, instant HTML escape and unescape.',
    keywords: 'html encode html decode html entities escape unescape special characters',
    intro: [
      'Encode text so it displays safely as plain text inside HTML, or decode HTML entities such as <code>&amp;lt;</code>, <code>&amp;amp;</code> and <code>&amp;#169;</code> back into readable characters.',
      'Characters like &lt; and &amp; have special meaning in HTML. Encoding them is essential when showing code examples on a web page, and decoding is useful when text arrives full of entities from a CMS, feed or database.'
    ],
    ui: `
      ${ta('he-input', 'Input', 'Paste text or HTML here…', 8, 'class="mono" spellcheck="false"')}
      <label class="check"><input type="checkbox" id="he-nonascii"> When encoding, also convert non-ASCII characters (é, ©, emoji) to numeric entities</label>
      <div class="btn-row">${btn('he-encode', 'Encode', 'tag', 'primary')}${btn('he-decode', 'Decode', 'fileText')}</div>
      ${status('he-status')}
      ${out('he-output', 'Output', 8, 'mono')}
      <div class="btn-row">${btn('he-copy', 'Copy result', 'copy', 'primary')}${btn('he-swap', 'Use result as input', 'swap')}${btn('he-clear', 'Clear', 'trash', 'ghost')}</div>`,
    steps: [
      'Paste your text, code or HTML into the input box.',
      'Click <strong>Encode</strong> to turn special characters into entities, or <strong>Decode</strong> to turn entities back into characters.',
      'For maximum compatibility with old systems, tick the option to encode non-ASCII characters as numeric entities.',
      'Copy the result into your page, template or database.'
    ],
    uses: [
      'Displaying HTML or code snippets as text in a blog post or documentation.',
      'Cleaning up text exported from a CMS or RSS feed that is full of entities.',
      'Escaping user-facing text before inserting it into an HTML template by hand.',
      'Encoding special characters for systems that only accept ASCII.'
    ],
    extra: [{
      h: 'Characters that are encoded',
      html: `<div class="table-wrap"><table class="data-table"><thead><tr><th>Character</th><th>Entity</th><th>Why</th></tr></thead><tbody>
        <tr><td><code>&amp;</code></td><td><code>&amp;amp;</code></td><td>Starts every entity</td></tr>
        <tr><td><code>&lt;</code></td><td><code>&amp;lt;</code></td><td>Starts an HTML tag</td></tr>
        <tr><td><code>&gt;</code></td><td><code>&amp;gt;</code></td><td>Ends an HTML tag</td></tr>
        <tr><td><code>"</code></td><td><code>&amp;quot;</code></td><td>Ends an attribute value</td></tr>
        <tr><td><code>'</code></td><td><code>&amp;#39;</code></td><td>Ends a single-quoted attribute</td></tr>
      </tbody></table></div>`
    }],
    faqs: [
      ['Is HTML encoding enough to prevent XSS attacks?', 'Encoding is an important part of preventing cross-site scripting when inserting text into HTML content, but it is not a complete solution. Text placed in JavaScript, URLs or CSS needs different escaping. In real applications, use your framework’s built-in escaping.'],
      ['Which named entities can be decoded?', 'All standard HTML named entities (such as &amp;nbsp;, &amp;eacute; and &amp;hearts;) plus decimal (&amp;#169;) and hexadecimal (&amp;#xA9;) numeric entities. Named entities must end with a semicolon.'],
      ['Is decoding safe if the input contains scripts?', 'Yes. Decoding only converts entities to characters and shows them as plain text. Nothing in your input is executed.'],
      ['Is my text stored?', 'No. Encoding and decoding happen locally in your browser.']
    ],
    related: ['url-encoder-decoder', 'json-formatter', 'css-minifier', 'image-to-base64']
  },
  {
    slug: 'css-minifier', cat: 'dev', icon: 'fileCode',
    name: 'CSS Minifier',
    short: 'Compress CSS by removing comments and unnecessary whitespace.',
    title: 'CSS Minifier – Minify & Compress CSS Online | ToolifyHub',
    description: 'Minify CSS online by removing comments, whitespace and unnecessary characters. See how much you saved, then copy or download style.min.css. Free and private.',
    keywords: 'css minifier minify css compress css optimize stylesheet',
    intro: [
      'Shrink your stylesheets by removing comments, line breaks, indentation and other characters browsers don’t need. See the size before and after, then copy or download the minified CSS.',
      'Smaller CSS files download faster, which helps pages render sooner — especially on mobile networks. This minifier safely protects strings and keeps important licence comments if you want them.'
    ],
    ui: `
      ${ta('cm-input', 'CSS input', 'Paste your CSS here…', 10, 'class="mono" spellcheck="false"')}
      <label class="check"><input type="checkbox" id="cm-keep" checked> Keep important comments that start with /*!</label>
      <div class="btn-row">${btn('cm-minify', 'Minify CSS', 'compress', 'primary')}${btn('cm-sample', 'Load sample', 'fileText', 'ghost')}${btn('cm-clear', 'Clear', 'trash', 'ghost')}</div>
      ${status('cm-status')}
      ${out('cm-output', 'Minified CSS', 8, 'mono')}
      <div class="btn-row">${btn('cm-copy', 'Copy result', 'copy', 'primary')}${btn('cm-download', 'Download .min.css', 'download')}</div>`,
    steps: [
      'Paste your CSS into the input box, or click <strong>Load sample</strong> to see an example.',
      'Choose whether to keep licence comments that begin with <code>/*!</code>.',
      'Click <strong>Minify CSS</strong> and check the size savings.',
      'Copy the minified CSS or download it as <code>styles.min.css</code>. Keep your original file for future edits.'
    ],
    uses: [
      'Reducing stylesheet size before deploying a website.',
      'Shrinking CSS for HTML email templates or embedded widgets.',
      'Quickly compressing a single file without setting up a build tool.',
      'Comparing how much whitespace and comments add to a stylesheet.'
    ],
    faqs: [
      ['Will minifying change how my site looks?', 'It shouldn’t. The minifier only removes comments and whitespace that browsers ignore, plus redundant semicolons and empty rules. Spaces that matter, such as in <code>calc(100% - 2rem)</code> or between selectors, are kept. Always test before deploying.'],
      ['Does it do advanced optimisations?', 'No. It does not merge rules, shorten colours or restructure your CSS. Build tools such as cssnano or Lightning CSS can achieve slightly smaller output for production pipelines.'],
      ['How much smaller will my CSS be?', 'Typically 15–40%, depending on how many comments and how much indentation your file has. Server compression (gzip or Brotli) reduces the transfer size further.'],
      ['Is my code uploaded?', 'No. Minification runs in your browser.']
    ],
    related: ['javascript-minifier', 'json-formatter', 'html-encoder-decoder', 'url-encoder-decoder']
  },
  {
    slug: 'javascript-minifier', cat: 'dev', icon: 'code', added: 6,
    name: 'JavaScript Minifier',
    short: 'Remove comments and whitespace from JavaScript safely.',
    title: 'JavaScript Minifier – Minify JS Code Online | ToolifyHub',
    description: 'Minify JavaScript online by removing comments and whitespace. Strings, regex and template literals are preserved and the result is syntax-checked. Free, private.',
    keywords: 'javascript minifier minify js compress javascript uglify',
    intro: [
      'Make JavaScript files smaller by removing comments, indentation and unnecessary line breaks. The minifier preserves strings, regular expressions and template literals, and checks that the result is still valid code.',
      'This is a safe, lightweight minifier that removes comments and whitespace only — it does not rename variables or rewrite your code. That makes it predictable for quick tasks such as snippets, bookmarklets and small scripts.'
    ],
    ui: `
      ${ta('jm-input', 'JavaScript input', 'Paste your JavaScript here…', 10, 'class="mono" spellcheck="false"')}
      <label class="check"><input type="checkbox" id="jm-keep" checked> Keep licence comments that start with /*!</label>
      <div class="btn-row">${btn('jm-minify', 'Minify JavaScript', 'compress', 'primary')}${btn('jm-sample', 'Load sample', 'fileText', 'ghost')}${btn('jm-clear', 'Clear', 'trash', 'ghost')}</div>
      ${status('jm-status')}
      ${out('jm-output', 'Minified JavaScript', 8, 'mono')}
      <div class="btn-row">${btn('jm-copy', 'Copy result', 'copy', 'primary')}${btn('jm-download', 'Download .min.js', 'download')}</div>`,
    steps: [
      'Paste your JavaScript into the input box, or load the sample.',
      'Choose whether to keep licence comments that start with <code>/*!</code>.',
      'Click <strong>Minify JavaScript</strong>. The tool removes comments and whitespace, then runs a syntax check.',
      'Copy or download the result, and test it before using it in production.'
    ],
    uses: [
      'Shrinking small scripts and snippets embedded in web pages.',
      'Creating bookmarklets, which need code on a single compact line.',
      'Reducing the size of widgets or analytics snippets you share with others.',
      'Quickly removing comments from code before sharing it.'
    ],
    extra: [{
      h: 'What this minifier does — and doesn’t — do',
      html: `<p>It removes comments, collapses whitespace and drops line breaks wherever doing so cannot change how the code runs. Line breaks are kept where JavaScript’s automatic semicolon insertion depends on them (for example after <code>return</code>), so code that relies on optional semicolons keeps working.</p>
      <p>It does <strong>not</strong> rename variables, remove unused code or transform modern syntax. For full production builds, tools such as Terser, esbuild or SWC produce much smaller output. JSX and TypeScript are not supported — compile them to JavaScript first.</p>`
    }],
    faqs: [
      ['Is the minified code guaranteed to work?', 'The tool only removes characters that don’t affect behaviour and checks the result with your browser’s JavaScript parser (without running it). A rare edge case, such as a regular expression directly after a closing bracket, could still trip it up, so always test minified code.'],
      ['Does it support ES modules (import/export)?', 'Yes, the code is minified in the same way. However, the automatic syntax check is skipped for module code, because browsers can only check modules when loading them.'],
      ['Why is the saving smaller than with other minifiers?', 'Advanced minifiers also shorten variable names and rewrite expressions. This tool deliberately avoids that so your code stays readable and predictable.'],
      ['Is my code uploaded or executed?', 'Neither. Your code is processed in your browser and is never sent anywhere. The syntax check compiles it without running it.']
    ],
    related: ['css-minifier', 'json-formatter', 'html-encoder-decoder', 'url-encoder-decoder']
  },
  {
    slug: 'url-encoder-decoder', cat: 'dev', icon: 'link',
    name: 'URL Encoder & Decoder',
    short: 'Percent-encode or decode URLs and query string values.',
    title: 'URL Encoder & Decoder – Percent-Encode URLs Online | ToolifyHub',
    description: 'Encode or decode URLs and query parameters with percent-encoding. Choose component or full-URL mode, handle + as spaces, and see each part of a URL. Free.',
    keywords: 'url encode url decode percent encoding urlencode query string encodeURIComponent',
    intro: [
      'Convert text into a URL-safe format using percent-encoding, or decode encoded URLs back into readable text. If you paste a full web address, the tool also breaks it down into its protocol, host, path and query parameters.',
      'Spaces, accented letters and symbols such as &amp;, ? and # must be encoded before they can be used in a URL. Decoding helps you read tracking links, redirect URLs and API requests that are full of <code>%20</code> and <code>%3D</code>.'
    ],
    ui: `
      ${ta('ue-input', 'Input', 'Paste a URL or text, e.g. https://example.com/search?q=hello world', 6, 'class="mono" spellcheck="false"')}
      <div class="row">
        <div class="field"><label for="ue-mode">Encoding mode</label>
          <select id="ue-mode"><option value="component">Component — for query values (encodeURIComponent)</option><option value="full">Full URL — keep : / ? &amp; = # (encodeURI)</option></select></div>
        <div class="field" style="justify-content:flex-end"><label class="check"><input type="checkbox" id="ue-plus"> Use + for spaces (HTML form encoding)</label></div>
      </div>
      <div class="btn-row">${btn('ue-encode', 'Encode', 'link', 'primary')}${btn('ue-decode', 'Decode', 'fileText')}</div>
      ${status('ue-status')}
      ${out('ue-output', 'Output', 6, 'mono')}
      <div class="btn-row">${btn('ue-copy', 'Copy result', 'copy', 'primary')}${btn('ue-swap', 'Use result as input', 'swap')}${btn('ue-clear', 'Clear', 'trash', 'ghost')}</div>
      <div id="ue-parts" hidden>
        <h3 style="margin-top:18px">URL breakdown</h3>
        <div class="table-wrap"><table class="data-table"><tbody></tbody></table></div>
      </div>`,
    steps: [
      'Paste the text or URL you want to convert.',
      'Choose <strong>Component</strong> mode to encode a single value (such as a search term), or <strong>Full URL</strong> mode to encode a whole address while keeping its structure.',
      'Click <strong>Encode</strong> or <strong>Decode</strong>. Tick “Use + for spaces” when working with HTML form data.',
      'Copy the result. For full URLs, review the breakdown table to check each part.'
    ],
    uses: [
      'Building links with search terms or parameters that contain spaces and symbols.',
      'Reading long tracking or redirect links from emails and ads.',
      'Debugging query strings in API requests and webhooks.',
      'Encoding non-English characters in URLs and file names.'
    ],
    faqs: [
      ['What is the difference between component and full URL encoding?', 'Component mode (encodeURIComponent) encodes every reserved character, including / ? & = and #, so it is right for a single value inside a URL. Full URL mode (encodeURI) leaves those characters alone so the address still works as a link.'],
      ['Why are spaces sometimes %20 and sometimes +?', 'In URL paths and most modern APIs, a space is %20. In HTML form submissions (application/x-www-form-urlencoded), spaces are written as +. Use the “+ for spaces” option for form data.'],
      ['What does “invalid percent-encoding” mean?', 'A % sign must be followed by two hexadecimal digits, such as %2F. A lone % or an incomplete sequence like %E2%82 cannot be decoded. Encode a literal % sign as %25.'],
      ['Is anything sent to a server?', 'No. Encoding and decoding use your browser’s built-in functions, and URLs you paste are not visited or stored.']
    ],
    related: ['html-encoder-decoder', 'json-formatter', 'image-to-base64', 'uuid-generator']
  },
  {
    slug: 'uuid-generator', cat: 'dev', icon: 'key', added: 5,
    name: 'UUID Generator',
    short: 'Generate random version 4 UUIDs (GUIDs) in bulk.',
    title: 'UUID Generator – Random UUID v4 / GUID Generator | ToolifyHub',
    description: 'Generate random version 4 UUIDs (GUIDs) using secure browser randomness. Create up to 1,000 at once, choose uppercase or no hyphens, and validate any UUID.',
    keywords: 'uuid generator guid generator uuid v4 random unique id',
    intro: [
      'Generate universally unique identifiers (UUIDs, also called GUIDs) instantly. Create one or up to 1,000 at a time, format them as you need, and copy or download the list.',
      'This generator creates version 4 UUIDs from cryptographically secure random numbers provided by your browser’s Web Crypto API. You can also paste any UUID to check whether it is valid and which version it is.'
    ],
    ui: `
      <div class="row">
        <div class="field"><label for="ug-count">How many UUIDs?</label><input type="number" id="ug-count" value="5" min="1" max="1000" step="1" inputmode="numeric"></div>
      </div>
      <div class="checks">
        <label class="check"><input type="checkbox" id="ug-upper"> UPPERCASE</label>
        <label class="check"><input type="checkbox" id="ug-nohyphen"> Remove hyphens</label>
        <label class="check"><input type="checkbox" id="ug-braces"> Wrap in {braces}</label>
      </div>
      <div class="btn-row">${btn('ug-generate', 'Generate UUIDs', 'refresh', 'primary')}</div>
      ${status('ug-error')}
      ${out('ug-output', 'Generated UUIDs', 8, 'mono')}
      <div class="btn-row">${btn('ug-copy', 'Copy all', 'copy', 'primary')}${btn('ug-download', 'Download .txt', 'download')}</div>
      <h3 style="margin-top:20px">Validate a UUID</h3>
      <div class="field"><label for="ug-check">Paste a UUID to check it</label><input type="text" id="ug-check" class="mono" spellcheck="false" autocomplete="off" placeholder="e.g. 3f2b8c1e-9d4a-4c6b-8e2f-1a7d5b9c0e34"></div>
      ${status('ug-check-result')}`,
    steps: [
      'Enter how many UUIDs you need (1 to 1,000).',
      'Choose formatting options: uppercase, no hyphens, or wrapped in braces.',
      'Click <strong>Generate UUIDs</strong>. Each click creates a fresh set.',
      'Copy the list or download it as a text file. To check an existing ID, paste it into the validator.'
    ],
    uses: [
      'Creating primary keys for database records without a central counter.',
      'Generating unique IDs for test data, fixtures and mock APIs.',
      'Naming files, uploads or sessions so they never clash.',
      'Creating correlation IDs to trace requests across services and logs.'
    ],
    faqs: [
      ['Are these UUIDs truly unique?', 'A version 4 UUID contains 122 random bits, so the chance of two ever matching is astronomically small — you would need to generate billions per second for many years to have a realistic chance of a single duplicate.'],
      ['Are the UUIDs secure?', 'They are generated with the Web Crypto API, which provides cryptographically secure randomness. However, UUIDs are identifiers, not secrets — don’t use them as passwords or access tokens.'],
      ['What is the difference between a UUID and a GUID?', 'They are the same thing. GUID (globally unique identifier) is the name Microsoft uses; UUID is the name used in the official standard, RFC 9562.'],
      ['Should I use UUID v4 or v7?', 'Version 4 is fully random and widely supported. Version 7 starts with a timestamp, so new IDs sort in creation order, which can make some database indexes more efficient. This tool generates version 4.'],
      ['Are generated UUIDs stored?', 'No. They are created in your browser and are not sent to or saved on any server.']
    ],
    related: ['password-generator', 'json-formatter', 'url-encoder-decoder', 'binary-to-decimal']
  },

  /* =============================== CALCULATORS =============================== */
  {
    slug: 'percentage-calculator', cat: 'calc', icon: 'percent', popular: true,
    name: 'Percentage Calculator',
    short: 'Find X% of a number, percentage change, and more.',
    title: 'Percentage Calculator – Percent of, Change & Increase',
    description: 'Free percentage calculator: find X% of a number, what percent one number is of another, percentage increase or decrease, and add or subtract a percentage.',
    keywords: 'percentage calculator percent of percentage change increase decrease',
    intro: [
      'Solve the four most common percentage questions in one place. Each calculator updates as you type and shows the formula, so you can see exactly how the answer was worked out.',
      'Percentages come up everywhere — tips, test scores, pay rises, price changes and statistics. Pick the question that matches yours and enter the numbers.'
    ],
    ui: `
      <div class="calc-grid">
        <div class="calc-card">
          <h3>What is X% of Y?</h3>
          <div class="calc-line"><label class="sr-only" for="pc-a1">Percentage</label><input type="number" id="pc-a1" data-calc="a" step="any" placeholder="20" inputmode="decimal"><span>% of</span>
            <label class="sr-only" for="pc-a2">Number</label><input type="number" id="pc-a2" data-calc="a" step="any" placeholder="150" inputmode="decimal"></div>
          <div class="calc-out" id="pc-a-out" aria-live="polite"></div>
        </div>
        <div class="calc-card">
          <h3>X is what percent of Y?</h3>
          <div class="calc-line"><label class="sr-only" for="pc-b1">Part</label><input type="number" id="pc-b1" data-calc="b" step="any" placeholder="30" inputmode="decimal"><span>is what % of</span>
            <label class="sr-only" for="pc-b2">Whole</label><input type="number" id="pc-b2" data-calc="b" step="any" placeholder="120" inputmode="decimal"></div>
          <div class="calc-out" id="pc-b-out" aria-live="polite"></div>
        </div>
        <div class="calc-card">
          <h3>Percentage change from X to Y</h3>
          <div class="calc-line"><span>From</span><label class="sr-only" for="pc-c1">Starting value</label><input type="number" id="pc-c1" data-calc="c" step="any" placeholder="80" inputmode="decimal"><span>to</span>
            <label class="sr-only" for="pc-c2">New value</label><input type="number" id="pc-c2" data-calc="c" step="any" placeholder="100" inputmode="decimal"></div>
          <div class="calc-out" id="pc-c-out" aria-live="polite"></div>
        </div>
        <div class="calc-card">
          <h3>Increase or decrease by a percentage</h3>
          <div class="calc-line"><label class="sr-only" for="pc-d1">Starting value</label><input type="number" id="pc-d1" data-calc="d" step="any" placeholder="250" inputmode="decimal">
            <label class="sr-only" for="pc-d-op">Increase or decrease</label><select id="pc-d-op" data-calc="d" style="width:auto;flex:0 0 auto"><option value="increase">+ increase by</option><option value="decrease">− decrease by</option></select>
            <label class="sr-only" for="pc-d2">Percentage</label><input type="number" id="pc-d2" data-calc="d" step="any" placeholder="15" inputmode="decimal"><span>%</span></div>
          <div class="calc-out" id="pc-d-out" aria-live="polite"></div>
        </div>
      </div>
      <div class="btn-row">${btn('pc-clear', 'Clear all', 'trash', 'ghost')}</div>`,
    steps: [
      'Find the calculator that matches your question, such as “What is X% of Y?”.',
      'Enter your numbers. Decimals and negative numbers are supported.',
      'Read the answer immediately below, along with the formula used.',
      'Use <strong>Clear all</strong> to start fresh.'
    ],
    uses: [
      'Working out a tip, a sales commission or VAT on a bill.',
      'Turning a test score such as 42 out of 50 into a percentage.',
      'Measuring growth in revenue, website traffic or prices between two periods.',
      'Calculating a salary after a percentage pay rise.',
      'Checking a reported percentage in a news article or report.'
    ],
    extra: [{
      h: 'Percentage formulas',
      html: `<ul>
        <li><strong>X% of Y</strong> = (X ÷ 100) × Y. Example: 20% of 150 = 30.</li>
        <li><strong>X as a percentage of Y</strong> = (X ÷ Y) × 100. Example: 30 is 25% of 120.</li>
        <li><strong>Percentage change</strong> = ((new − old) ÷ |old|) × 100. Example: 80 to 100 is a 25% increase.</li>
        <li><strong>Increase by X%</strong> = value × (1 + X ÷ 100); <strong>decrease by X%</strong> = value × (1 − X ÷ 100).</li>
      </ul>
      <p>Note that a percentage increase followed by the same percentage decrease does not return to the start: 100 increased by 10% is 110, but 110 decreased by 10% is 99.</p>`
    }],
    faqs: [
      ['What is the difference between percentage change and percentage points?', 'If an interest rate goes from 2% to 3%, it rose by 1 percentage point, but by 50% in percentage terms. Percentage points measure the simple difference between two percentages.'],
      ['Why can’t I calculate percentage change from zero?', 'Percentage change divides by the starting value. Dividing by zero is undefined, so any change from 0 cannot be expressed as a percentage.'],
      ['How are results rounded?', 'Results show up to six decimal places (four for percentages), with trailing zeros removed. Round further as needed for your purpose.'],
      ['Can I use negative numbers?', 'Yes. For percentage change, the tool divides by the absolute value of the starting number, so a move from −50 to −25 is correctly shown as a 50% increase.']
    ],
    related: ['discount-calculator', 'bmi-calculator', 'age-calculator', 'binary-to-decimal']
  },
  {
    slug: 'age-calculator', cat: 'calc', icon: 'calendar',
    name: 'Age Calculator',
    short: 'Calculate exact age in years, months and days, plus next birthday.',
    title: 'Age Calculator – Calculate Exact Age from Date of Birth',
    description: 'Calculate your exact age in years, months and days from your date of birth. See total days lived, the weekday you were born and a next-birthday countdown.',
    keywords: 'age calculator date of birth how old am i birthday calculator days old',
    intro: [
      'Enter a date of birth to find the exact age in years, months and days. You can also calculate age on any other date, and see the total months, weeks and days, the weekday of birth, and how long until the next birthday.',
      'Age calculations are trickier than they look because months have different lengths and leap years add an extra day. This calculator handles those details using calendar dates, so the result matches how ages are counted on official forms.'
    ],
    ui: `
      <div class="row">
        <div class="field"><label for="ag-dob">Date of birth</label><input type="date" id="ag-dob" min="1000-01-01"></div>
        <div class="field"><label for="ag-at">Calculate age on</label><input type="date" id="ag-at"></div>
      </div>
      <div class="btn-row">${btn('ag-calc', 'Calculate age', 'calendar', 'primary')}${btn('ag-reset', 'Reset', 'refresh', 'ghost')}</div>
      ${status('ag-error')}
      <div id="ag-result" hidden aria-live="polite">
        <div class="result-box"><span class="result-label">Age</span><span class="result-big" id="ag-main"></span><p class="result-sub" id="ag-sub"></p></div>
        <div class="stats">
          ${stat('ag-months', 'Total months')}${stat('ag-weeks', 'Total weeks')}${stat('ag-days', 'Total days')}${stat('ag-hours', 'Total hours')}
          <div class="stat"><span class="stat-value" id="ag-next">–</span><span class="stat-label">Until next birthday</span><span class="stat-label" id="ag-next-sub"></span></div>
        </div>
      </div>`,
    steps: [
      'Enter the date of birth using the date picker or by typing it.',
      'Leave “Calculate age on” as today, or change it to find the age on a past or future date.',
      'The result appears automatically. Click <strong>Calculate age</strong> if it doesn’t update.',
      'Review the age in years, months and days, the totals, and the countdown to the next birthday.'
    ],
    uses: [
      'Checking eligibility for school entry, sports leagues, pensions or retirement.',
      'Finding someone’s exact age on a specific date for forms and applications.',
      'Counting down to a birthday or working out how many days old someone is.',
      'Calculating the age of a pet, a building or the time since an event.'
    ],
    faqs: [
      ['How are leap-year birthdays (29 February) handled?', 'In years without 29 February, the next birthday is shown as 28 February. Some countries legally use 1 March instead, so check local rules for official purposes.'],
      ['Why is “total hours” approximate?', 'The calculator uses dates, not times of birth, and assumes 24 hours per day. It doesn’t account for the exact birth time or daylight saving changes.'],
      ['Does it count age the way it’s used in East Asia?', 'No. It uses the international system, where age starts at zero at birth and increases on each birthday.'],
      ['Is my date of birth stored?', 'No. The calculation is done in your browser and nothing you enter is saved or sent anywhere.']
    ],
    related: ['percentage-calculator', 'bmi-calculator', 'discount-calculator', 'word-counter']
  },
  {
    slug: 'discount-calculator', cat: 'calc', icon: 'discount',
    name: 'Discount Calculator',
    short: 'Work out the sale price, savings, stacked discounts and tax.',
    title: 'Discount Calculator – Sale Price & Savings | ToolifyHub',
    description: 'Calculate the sale price after a percentage or fixed discount. Add an extra stacked discount and sales tax, and see exactly how much you save. Free and instant.',
    keywords: 'discount calculator sale price percent off savings calculator price after discount',
    intro: [
      'Find out exactly what you’ll pay after a discount. Enter the original price and a percentage or fixed amount off, add an optional extra discount and sales tax, and see the final price and your total savings.',
      'Stacked offers such as “30% off plus an extra 10%” are not the same as 40% off. This calculator applies each discount in order and shows a clear breakdown, so you can compare deals with confidence.'
    ],
    ui: `
      <div class="row">
        <div class="field"><label for="dc-price">Original price</label><input type="number" id="dc-price" min="0" step="any" inputmode="decimal" placeholder="e.g. 89.99"></div>
        <div class="field"><label for="dc-currency">Currency</label>
          <select id="dc-currency"><option value="USD">US dollar ($)</option><option value="GBP">British pound (£)</option><option value="EUR">Euro (€)</option><option value="CAD">Canadian dollar (CA$)</option><option value="AUD">Australian dollar (A$)</option><option value="NZD">New Zealand dollar (NZ$)</option><option value="INR">Indian rupee (₹)</option><option value="JPY">Japanese yen (¥)</option></select></div>
      </div>
      <div class="seg" role="group" aria-label="Discount type">
        <button type="button" id="dc-type-pct" aria-pressed="true">Percentage off</button>
        <button type="button" id="dc-type-amt" aria-pressed="false">Amount off</button>
      </div>
      <div class="row">
        <div class="field"><label for="dc-value" id="dc-value-label">Discount (%)</label><input type="number" id="dc-value" min="0" step="any" inputmode="decimal" placeholder="e.g. 25"></div>
        <div class="field"><label for="dc-extra">Extra discount % (optional)</label><input type="number" id="dc-extra" min="0" max="100" step="any" inputmode="decimal" placeholder="e.g. 10"></div>
        <div class="field"><label for="dc-tax">Sales tax % (optional)</label><input type="number" id="dc-tax" min="0" max="100" step="any" inputmode="decimal" placeholder="e.g. 8.25"></div>
      </div>
      ${status('dc-error')}
      <div id="dc-result" hidden aria-live="polite">
        <div class="result-box"><span class="result-label">Price after discount</span><span class="result-big" id="dc-final"></span>
          <p class="result-sub">You save <strong id="dc-save"></strong> (<span id="dc-effective"></span> off)</p></div>
        <div class="stats" id="dc-tax-row">${stat('dc-tax-amt', 'Sales tax', '–')}${stat('dc-total', 'Total with tax', '–')}</div>
        <div class="steps-explain" id="dc-breakdown"></div>
      </div>
      <div class="btn-row">${btn('dc-reset', 'Reset', 'refresh', 'ghost')}</div>`,
    steps: [
      'Enter the original price and choose your currency.',
      'Choose <strong>Percentage off</strong> or <strong>Amount off</strong> and enter the discount.',
      'Optionally add an extra discount (applied after the first one) and a sales tax rate.',
      'Read the final price, your savings and the step-by-step breakdown.'
    ],
    uses: [
      'Checking the real price during Black Friday, Boxing Day and seasonal sales.',
      'Comparing a percentage discount with a fixed-amount coupon.',
      'Working out stacked offers such as “extra 20% off sale items”.',
      'Estimating the final checkout price including US sales tax.',
      'Setting sale prices for your own products or services.'
    ],
    faqs: [
      ['Is 30% off plus an extra 20% off the same as 50% off?', 'No. The extra 20% is taken from the already-reduced price. On a $100 item, 30% off gives $70, and a further 20% off gives $56 — a total discount of 44%, not 50%.'],
      ['Is sales tax applied before or after the discount?', 'In most US states, sales tax is charged on the discounted price, which is what this calculator does. In the UK, Europe, Australia and many other countries, VAT or GST is usually already included in the displayed price, so leave the tax field empty.'],
      ['How do I calculate the original price from a sale price?', 'Divide the sale price by (1 − discount ÷ 100). For example, if an item costs $60 after 25% off, the original price was $60 ÷ 0.75 = $80.'],
      ['Are prices rounded?', 'Results are shown in the selected currency’s usual format, which normally rounds to two decimal places (no decimals for yen). Stores may round slightly differently.']
    ],
    related: ['percentage-calculator', 'age-calculator', 'bmi-calculator', 'binary-to-decimal']
  },
  {
    slug: 'bmi-calculator', cat: 'calc', icon: 'activity', popular: true,
    name: 'BMI Calculator',
    short: 'Calculate Body Mass Index in metric or US units with healthy range.',
    title: 'BMI Calculator – Body Mass Index for Adults | ToolifyHub',
    description: 'Calculate your Body Mass Index (BMI) in metric (kg, cm) or US units (lb, ft, in). See your BMI category and the healthy weight range for your height. Free.',
    keywords: 'bmi calculator body mass index healthy weight kg lb adult bmi',
    intro: [
      'Calculate Body Mass Index (BMI) from your height and weight, in metric or US units. See your BMI category on a colour scale, along with the weight range that corresponds to a healthy BMI for your height.',
      'BMI is a quick screening measure used by doctors and health organisations, including the World Health Organization (WHO), to sort adult weight into broad categories. It is a useful starting point, but it doesn’t measure body fat directly or tell the full story of your health.'
    ],
    ui: `
      <div class="seg" role="group" aria-label="Units">
        <button type="button" id="bm-metric" aria-pressed="true">Metric (kg, cm)</button>
        <button type="button" id="bm-imperial" aria-pressed="false">US (lb, ft, in)</button>
      </div>
      <div id="bm-metric-fields" class="row">
        <div class="field"><label for="bm-cm">Height (cm)</label><input type="number" id="bm-cm" min="50" max="272" step="any" inputmode="decimal" placeholder="e.g. 175"></div>
        <div class="field"><label for="bm-kg">Weight (kg)</label><input type="number" id="bm-kg" min="2" max="635" step="any" inputmode="decimal" placeholder="e.g. 70"></div>
      </div>
      <div id="bm-imperial-fields" class="row" hidden>
        <div class="field"><label for="bm-ft">Height (feet)</label><input type="number" id="bm-ft" min="1" max="8" step="1" inputmode="numeric" placeholder="e.g. 5"></div>
        <div class="field"><label for="bm-in">Height (inches)</label><input type="number" id="bm-in" min="0" max="11.9" step="any" inputmode="decimal" placeholder="e.g. 9"></div>
        <div class="field"><label for="bm-lb">Weight (lb)</label><input type="number" id="bm-lb" min="5" max="1400" step="any" inputmode="decimal" placeholder="e.g. 160"></div>
      </div>
      ${status('bm-error')}
      <div id="bm-result" hidden aria-live="polite">
        <div class="result-box"><span class="result-label">Your BMI</span><span class="result-big" id="bm-value"></span><p class="result-sub" style="font-weight:700;font-size:1.05rem" id="bm-cat"></p></div>
        <div class="bmi-scale" aria-hidden="true"><span class="bmi-marker" id="bm-marker"></span></div>
        <div class="bmi-legend" aria-hidden="true"><span>15</span><span>Underweight &lt; 18.5</span><span>Healthy 18.5–24.9</span><span>Overweight 25–29.9</span><span>Obesity 30+</span><span>40</span></div>
        <p id="bm-range" style="margin-top:14px"></p>
      </div>
      <div class="alert alert-info"><p><strong>Health note:</strong> BMI is a screening tool for adults aged 20 and over. It doesn’t distinguish muscle from fat and may be less accurate for athletes, older adults, during pregnancy and for some ethnic groups. It is not suitable for children or teenagers, who need age- and sex-specific percentiles. Talk to a healthcare professional about your individual health.</p></div>
      <div class="btn-row">${btn('bm-reset', 'Reset', 'refresh', 'ghost')}</div>`,
    steps: [
      'Choose metric units (centimetres and kilograms) or US units (feet, inches and pounds).',
      'Enter your height and weight. The result updates as you type.',
      'Read your BMI value and category, and see where it falls on the colour scale.',
      'Check the healthy weight range for your height, and read the health note for context.'
    ],
    uses: [
      'Getting a quick, general check of whether your weight is in a typical range for your height.',
      'Tracking changes over time alongside other measures such as waist size.',
      'Understanding a BMI figure mentioned by a doctor or in a health report.',
      'Converting between metric and US units for the same measurement.'
    ],
    extra: [{
      h: 'How BMI is calculated',
      html: `<p>BMI is your weight in kilograms divided by your height in metres squared: <code>BMI = kg ÷ m²</code>. For example, a person who is 1.75 m tall and weighs 70 kg has a BMI of 70 ÷ (1.75 × 1.75) ≈ 22.9. In US units, the formula is <code>703 × lb ÷ in²</code>, which gives the same result.</p>
      <div class="table-wrap"><table class="data-table"><thead><tr><th>BMI</th><th>Category (adults, WHO)</th></tr></thead><tbody>
        <tr><td>Below 18.5</td><td>Underweight</td></tr><tr><td>18.5 – 24.9</td><td>Healthy weight</td></tr>
        <tr><td>25.0 – 29.9</td><td>Overweight</td></tr><tr><td>30.0 and above</td><td>Obesity</td></tr></tbody></table></div>
      <p class="muted" style="margin-top:10px">Some health authorities use lower thresholds for people of South Asian, Chinese and some other backgrounds. Your doctor can advise what applies to you.</p>`
    }],
    faqs: [
      ['Is BMI accurate?', 'BMI is a useful population-level screening tool, but it is an estimate for individuals. It doesn’t account for muscle mass, bone density, body shape or where fat is stored. Very muscular people may have a high BMI without excess fat.'],
      ['Can children use this calculator?', 'No. For children and teens aged 2–19, BMI must be compared with growth charts for their age and sex. Use a dedicated child BMI percentile calculator from a health authority or ask your doctor.'],
      ['What is a healthy BMI?', 'For most adults, a BMI between 18.5 and 24.9 is considered a healthy weight range. Health also depends on diet, activity, genetics and other factors.'],
      ['Is my information saved?', 'No. Your height and weight are used only for the calculation in your browser. Nothing is stored or sent anywhere.'],
      ['Is this medical advice?', 'No. This calculator provides general information only and is not a substitute for advice from a qualified healthcare professional.']
    ],
    related: ['age-calculator', 'percentage-calculator', 'discount-calculator', 'word-counter']
  },

  /* =============================== OTHER =============================== */
  {
    slug: 'qr-code-generator', cat: 'other', icon: 'qr', popular: true, added: 3,
    name: 'QR Code Generator',
    short: 'Create QR codes for links and text. Download as PNG or SVG.',
    title: 'QR Code Generator – Free QR Codes, PNG & SVG | ToolifyHub',
    description: 'Create free QR codes for URLs, text, Wi-Fi details and more. Choose colours, size and error correction, then download as PNG or SVG. No sign-up, codes never expire.',
    keywords: 'qr code generator create qr code url to qr free qr code png svg',
    scripts: ['js/qrcode.js'],
    intro: [
      'Turn any link or text into a QR code that phones can scan. Customise the colours, size, margin and error correction level, then download a high-quality PNG or a scalable SVG for print.',
      'The QR codes made here are static: the content is stored directly in the code, so it works forever, doesn’t track scans and doesn’t depend on any service staying online. The code is generated in your browser — nothing you enter is uploaded.'
    ],
    ui: `
      <div class="qr-layout">
        <div>
          ${ta('qr-text', 'Text or URL to encode', 'https://example.com', 4, 'spellcheck="false"')}
          <div class="row">
            <div class="field"><label for="qr-size">Image size</label>
              <select id="qr-size"><option value="256">Small (≈ 256 px)</option><option value="512" selected>Medium (≈ 512 px)</option><option value="1024">Large (≈ 1024 px)</option><option value="2048">Print (≈ 2048 px)</option></select></div>
            <div class="field"><label for="qr-ecl">Error correction</label>
              <select id="qr-ecl"><option value="L">Low (7%)</option><option value="M" selected>Medium (15%)</option><option value="Q">Quartile (25%)</option><option value="H">High (30%)</option></select></div>
          </div>
          <div class="row">
            <div class="field"><label for="qr-fg">Foreground colour</label><input type="color" id="qr-fg" value="#000000"></div>
            <div class="field"><label for="qr-bg">Background colour</label><input type="color" id="qr-bg" value="#ffffff"></div>
            <div class="field"><label for="qr-margin">Margin (modules)</label><input type="number" id="qr-margin" value="4" min="0" max="10" step="1" inputmode="numeric"></div>
          </div>
          ${status('qr-error')}
          ${status('qr-warn')}
        </div>
        <div>
          <div class="preview qr-preview">
            <canvas id="qr-canvas" role="img" aria-label="QR code preview" hidden></canvas>
            <p id="qr-empty" class="muted">Your QR code will appear here.</p>
          </div>
          <p class="hint muted" id="qr-info" style="font-size:.84rem;text-align:center;margin:8px 0 0"></p>
          <div class="btn-row" style="justify-content:center">${btn('qr-png', 'Download PNG', 'download', 'primary')}${btn('qr-svg', 'Download SVG', 'download')}${btn('qr-clear', 'Clear', 'trash', 'ghost')}</div>
        </div>
      </div>`,
    steps: [
      'Type or paste a URL or any text into the box. The QR code appears instantly.',
      'Choose a size and error correction level. Use a higher level if the code may get scratched or partly covered.',
      'Optionally change the colours. Keep a dark foreground on a light background with strong contrast.',
      'Scan the preview with your phone to test it, then download it as a PNG for screens or an SVG for print.'
    ],
    uses: [
      'Linking a printed flyer, poster, menu or business card to your website.',
      'Sharing a long URL, booking page or form at an event or in a classroom.',
      'Adding a link to product packaging or a shop window.',
      'Sharing contact details, a short message or a reference code.',
      'Encoding Wi-Fi details as <code>WIFI:T:WPA;S:NetworkName;P:Password;;</code> so guests can join by scanning.'
    ],
    faqs: [
      ['Do these QR codes expire?', 'No. They are static QR codes, so the content is stored in the pattern itself. They will keep working as long as the link or text inside them is valid.'],
      ['Can I track how many people scan my QR code?', 'Not with a static code. To measure scans, encode a link that includes campaign parameters (such as UTM tags) and check your website analytics.'],
      ['Which error correction level should I choose?', 'Medium (15%) suits most uses. Choose High (30%) for codes that will be printed small, placed outdoors or partly covered by a logo. Higher levels make the pattern denser.'],
      ['How much data can a QR code hold?', 'Up to 2,953 bytes at the Low error correction level, and less at higher levels. For reliable scanning, keep content short — a short URL works best.'],
      ['Should I download PNG or SVG?', 'PNG works everywhere on screens and in documents. SVG is a vector format that stays sharp at any size, making it ideal for professional printing.'],
      ['Is “QR Code” a trademark?', 'Yes. QR Code is a registered trademark of DENSO WAVE INCORPORATED. The QR code standard itself is open and free to use.']
    ],
    related: ['password-generator', 'url-encoder-decoder', 'image-to-base64', 'uuid-generator']
  },
  {
    slug: 'password-generator', cat: 'other', icon: 'lock', popular: true, added: 4,
    name: 'Password Generator',
    short: 'Create strong, random passwords with the Web Crypto API.',
    title: 'Password Generator – Strong Random Passwords | ToolifyHub',
    description: 'Generate strong, random passwords from 4 to 128 characters using your browser’s secure Web Crypto API. Choose character types and see the strength. Never stored.',
    keywords: 'password generator strong password random password secure password generator',
    intro: [
      'Create strong, random passwords in one click. Choose the length and character types, exclude look-alike characters, and see an estimate of the password’s strength.',
      'Passwords are generated on your device using the Web Crypto API, which provides cryptographically secure randomness. They are never sent over the internet or saved, so only you see them.'
    ],
    ui: `
      <div class="field">
        <label for="pw-output">Your new password</label>
        <div class="pw-display">
          <input type="text" id="pw-output" readonly spellcheck="false" autocomplete="off" autocapitalize="off">
          ${btn('pw-copy', 'Copy', 'copy', 'primary')}${btn('pw-regen', 'Generate', 'refresh')}
        </div>
      </div>
      <div class="strength"><div class="meter" id="pw-meter" aria-hidden="true"><span></span></div><span class="strength-label" id="pw-strength" aria-live="polite"></span></div>
      <p class="muted" id="pw-entropy" style="margin-top:-8px;font-size:.88rem"></p>
      <div class="row">
        <div class="field"><label for="pw-length">Length</label><input type="range" id="pw-length" min="4" max="64" value="16"></div>
        <div class="field" style="max-width:160px"><label for="pw-length-num">Characters</label><input type="number" id="pw-length-num" min="4" max="128" value="16" step="1" inputmode="numeric"></div>
      </div>
      <div class="checks">
        <label class="check"><input type="checkbox" id="pw-upper" checked> Uppercase (A–Z)</label>
        <label class="check"><input type="checkbox" id="pw-lower" checked> Lowercase (a–z)</label>
        <label class="check"><input type="checkbox" id="pw-digits" checked> Numbers (0–9)</label>
        <label class="check"><input type="checkbox" id="pw-symbols" checked> Symbols (!@#$…)</label>
        <label class="check"><input type="checkbox" id="pw-similar"> Exclude look-alikes (I, l, 1, O, 0, o, |)</label>
      </div>
      ${status('pw-error')}`,
    steps: [
      'A strong 16-character password is generated as soon as the page loads.',
      'Adjust the length with the slider (or type up to 128) and choose which character types to include.',
      'Click <strong>Generate</strong> for a new password. Every selected character type is guaranteed to appear.',
      'Click <strong>Copy</strong> and save the password in your password manager straight away.'
    ],
    uses: [
      'Creating a unique password for each new online account.',
      'Replacing a weak or reused password after a data breach.',
      'Generating Wi-Fi passwords and router admin passwords.',
      'Creating temporary passwords for new team members (ask them to change it on first login).',
      'Generating API secrets or database passwords for development.'
    ],
    extra: [{
      h: 'What makes a password strong?',
      html: `<p>Length matters most. Each extra character multiplies the number of possible passwords, which is why a 16-character random password is vastly stronger than an 8-character one. The strength meter estimates <strong>entropy</strong> — the number of guesses an attacker would need, measured in bits. As a rough guide, 60+ bits resists online guessing well, and 80+ bits is very strong.</p>
      <p>The estimate assumes the password is randomly generated, as it is here. A human-chosen password like “Summer2026!” is far weaker than its length suggests, because attackers try common words and patterns first.</p>`
    }],
    faqs: [
      ['Is it safe to generate passwords on a website?', 'This generator runs entirely in your browser, uses the Web Crypto API for secure randomness, and makes no network requests with your password. Nothing is logged or saved. You can even disconnect from the internet before generating.'],
      ['How long should my password be?', 'At least 12 characters for most accounts, and 16 or more for important ones such as email, banking and your password manager. Longer is better if the site allows it.'],
      ['How do I remember random passwords?', 'You don’t need to. Use a reputable password manager to store them, and protect it with one strong passphrase that you memorise. Turn on two-factor authentication wherever possible.'],
      ['Why exclude look-alike characters?', 'Characters such as l (lowercase L), I (uppercase i) and 1, or O and 0, are easy to confuse when reading or typing a password by hand. Excluding them slightly reduces strength, which the meter reflects.'],
      ['What if a website rejects some symbols?', 'Some sites only accept certain symbols. Untick Symbols and use a longer password instead — length makes up for it.']
    ],
    related: ['uuid-generator', 'qr-code-generator', 'character-counter', 'binary-to-decimal']
  },
  {
    slug: 'seo-word-counter', cat: 'other', icon: 'seo', added: 2,
    name: 'SEO Word & Character Counter',
    short: 'Check title and meta description length, keywords and readability.',
    title: 'SEO Word Counter – Title, Meta & Keyword Checker',
    description: 'Check SEO title and meta description length with a search preview, count words, find frequent keywords and phrases, and estimate readability. Free and private.',
    keywords: 'seo word counter meta description length title length keyword density serp preview readability',
    intro: [
      'Check the parts of a page that matter in search results. See whether your title and meta description are likely to fit, preview how they might appear, and analyse your content’s length, most frequent words and readability.',
      'Search engines don’t reward a particular word count or keyword density. What helps is a clear title, an accurate description and content that fully answers the reader’s question. Use these numbers as a guide to write naturally for people — not as targets to game.'
    ],
    ui: `
      <div class="field">
        <label for="so-title">SEO title</label>
        <input type="text" id="so-title" placeholder="e.g. How to Make Sourdough Bread at Home – Beginner’s Guide">
        <div class="meter" id="so-title-meter" aria-hidden="true" style="margin-top:6px"><span></span></div>
        <div class="meter-row" aria-live="polite"><span id="so-title-count"></span><span id="so-title-hint"></span></div>
      </div>
      <div class="field">
        <label for="so-desc">Meta description</label>
        <textarea id="so-desc" rows="3" style="min-height:90px" placeholder="A short summary of the page that may appear under the title in search results."></textarea>
        <div class="meter" id="so-desc-meter" aria-hidden="true" style="margin-top:6px"><span></span></div>
        <div class="meter-row" aria-live="polite"><span id="so-desc-count"></span><span id="so-desc-hint"></span></div>
      </div>
      <div class="field-label" style="margin-bottom:6px">Search result preview (approximate)</div>
      <div class="serp" aria-label="Search result preview">
        <div class="serp-url">example.com › your-page</div>
        <div class="serp-title" id="so-serp-title"></div>
        <div class="serp-desc" id="so-serp-desc"></div>
      </div>
      <div class="row" style="margin-top:18px">
        <div class="field"><label for="so-keyword">Focus keyword or phrase (optional)</label><input type="text" id="so-keyword" placeholder="e.g. sourdough bread"></div>
      </div>
      ${ta('so-content', 'Page content', 'Paste the main text of your page here…', 10)}
      <div class="stats">
        ${stat('so-words', 'Words')}${stat('so-chars', 'Characters')}${stat('so-chars-ns', 'Characters (no spaces)')}${stat('so-sentences', 'Sentences')}
        ${stat('so-paragraphs', 'Paragraphs')}${stat('so-reading', 'Reading time', '0 sec')}${stat('so-avg', 'Words per sentence')}
        <div class="stat"><span class="stat-value" id="so-ease">–</span><span class="stat-label" id="so-ease-label">Reading ease</span></div>
      </div>
      <h3>Checks</h3>
      <ul class="seo-checks" id="so-checks" aria-live="polite"></ul>
      <div class="io-grid">
        <div><h3>Most frequent words</h3><div class="table-wrap"><table class="data-table"><thead><tr><th scope="col">Word</th><th scope="col">Count</th><th scope="col">Share</th></tr></thead><tbody id="so-kw-body"></tbody></table></div></div>
        <div><h3>Repeated two-word phrases</h3><div class="table-wrap"><table class="data-table"><thead><tr><th scope="col">Phrase</th><th scope="col">Count</th><th scope="col">Share</th></tr></thead><tbody id="so-phrase-body"></tbody></table></div></div>
      </div>
      <div class="btn-row" style="margin-top:18px">${btn('so-clear', 'Clear all', 'trash', 'ghost')}</div>`,
    steps: [
      'Enter your page title and meta description to see their length and an approximate search result preview.',
      'Optionally add a focus keyword or phrase you want the page to be found for.',
      'Paste the main content of your page to see word count, reading time and readability.',
      'Review the checks and frequent-word tables, then revise your copy so it reads naturally and clearly describes the page.'
    ],
    uses: [
      'Writing titles and meta descriptions that are less likely to be cut off in search results.',
      'Checking that a blog post clearly covers its main topic before publishing.',
      'Spotting words you have repeated too often while editing.',
      'Comparing the length and readability of your page with similar pages.',
      'Reviewing client copy or product descriptions during an SEO audit.'
    ],
    extra: [{
      h: 'How the numbers are calculated',
      html: `<ul>
        <li><strong>Title width</strong> is estimated by measuring the text in 20 px Arial, close to how desktop search results display titles. Titles wider than about 600 px are often truncated. Search engines may also rewrite titles.</li>
        <li><strong>Description length</strong> guidance of about 120–160 characters reflects how much text typically appears. Search engines may show different text if it better matches a search.</li>
        <li><strong>Reading ease</strong> uses the Flesch Reading Ease formula with an estimated syllable count. It is designed for English; scores above 60 are generally easy for most adults.</li>
        <li><strong>Frequent words</strong> exclude common words such as “the” and “and”. “Share” is the percentage of all words in the content.</li>
      </ul>`
    }],
    faqs: [
      ['What is the ideal keyword density?', 'There isn’t one. Search engines don’t use a target density, and repeating a keyword unnaturally can make content worse. Use the keyword where it fits naturally — usually in the title, the opening and a heading — and use related terms elsewhere.'],
      ['How long should a page title be?', 'Aim for roughly 50–60 characters (about 600 pixels) so it is likely to display in full. Put the most important words first, and make each page’s title unique.'],
      ['How long should a meta description be?', 'Around 120–160 characters is a common guideline. Write a clear, accurate summary that encourages the right people to click. A meta description does not directly affect rankings.'],
      ['How many words should a page have?', 'As many as it takes to answer the reader’s question well. A recipe or definition may need 300 words; an in-depth guide may need 2,000. Length by itself is not a ranking factor.'],
      ['Is my content uploaded?', 'No. All analysis happens in your browser, so you can safely check unpublished drafts.']
    ],
    related: ['word-counter', 'character-counter', 'case-converter', 'remove-extra-spaces']
  },
  {
    slug: 'binary-to-decimal', cat: 'other', icon: 'binary', added: 1,
    name: 'Binary to Decimal Converter',
    short: 'Convert binary to decimal, hex and octal — and decimal to binary.',
    title: 'Binary to Decimal Converter – With Steps | ToolifyHub',
    description: 'Convert binary numbers to decimal, hexadecimal and octal instantly, with a step-by-step explanation. Also convert decimal to binary. Supports very large numbers.',
    keywords: 'binary to decimal decimal to binary converter base 2 base 10 hex octal',
    intro: [
      'Convert binary (base 2) numbers to decimal (base 10), hexadecimal and octal as you type, and convert decimal numbers back to binary. For shorter numbers, the tool shows a step-by-step explanation of how the conversion works.',
      'Binary is the language of computers: every value is stored as a series of 0s and 1s. This converter uses arbitrary-precision arithmetic, so it handles numbers far larger than a normal calculator — up to 4,096 bits.'
    ],
    ui: `
      <div class="io-grid">
        <div class="calc-card">
          <h3>Binary → Decimal</h3>
          <div class="field"><label for="bd-bin">Binary number</label><input type="text" id="bd-bin" class="mono" inputmode="numeric" spellcheck="false" autocomplete="off" placeholder="e.g. 101101"></div>
          ${status('bd-error')}
          <div class="field"><label for="bd-dec-out">Decimal</label><div class="pw-display"><input type="text" id="bd-dec-out" class="mono" readonly>${btn('bd-copy-dec', 'Copy', 'copy', 'secondary', 'aria-label="Copy decimal result"')}</div></div>
          <div class="row-2">
            <div class="field"><label for="bd-hex-out">Hexadecimal</label><div class="pw-display"><input type="text" id="bd-hex-out" class="mono" readonly>${btn('bd-copy-hex', '', 'copy', 'secondary', 'aria-label="Copy hexadecimal result"')}</div></div>
            <div class="field"><label for="bd-oct-out">Octal</label><input type="text" id="bd-oct-out" class="mono" readonly></div>
          </div>
          <div id="bd-steps-wrap" hidden><div class="field-label">How it works</div><div class="steps-explain" id="bd-steps"></div></div>
        </div>
        <div class="calc-card">
          <h3>Decimal → Binary</h3>
          <div class="field"><label for="bd-dec">Decimal number</label><input type="text" id="bd-dec" class="mono" inputmode="numeric" spellcheck="false" autocomplete="off" placeholder="e.g. 45"></div>
          ${status('bd-error2')}
          <div class="field"><label for="bd-bin-out">Binary</label><div class="pw-display"><input type="text" id="bd-bin-out" class="mono" readonly>${btn('bd-copy-bin', 'Copy', 'copy', 'secondary', 'aria-label="Copy binary result"')}</div></div>
        </div>
      </div>
      <div class="btn-row">${btn('bd-clear', 'Clear all', 'trash', 'ghost')}</div>`,
    steps: [
      'Type a binary number such as <code>101101</code> in the Binary box. Spaces and underscores (for example <code>1010 1100</code>) and a <code>0b</code> prefix are allowed.',
      'Read the decimal, hexadecimal and octal results instantly, plus a worked explanation for numbers up to 16 bits.',
      'To go the other way, type a whole number in the Decimal box to get its binary form.',
      'Use the copy buttons to copy any result.'
    ],
    uses: [
      'Checking homework and learning how number bases work in computer science classes.',
      'Reading binary flags, bit masks and register values while programming.',
      'Converting IP subnet masks and network values.',
      'Translating values between binary, hex and decimal for electronics and microcontroller projects.'
    ],
    extra: [{
      h: 'How to convert binary to decimal by hand',
      html: `<p>Each binary digit (bit) represents a power of 2, starting from 2<sup>0</sup> = 1 on the right. Multiply each bit by its power of 2 and add the results. For <code>101101</code>:</p>
      <p><code>1×32 + 0×16 + 1×8 + 1×4 + 0×2 + 1×1 = 32 + 8 + 4 + 1 = 45</code></p>
      <p>To convert decimal to binary, repeatedly divide by 2 and write down the remainders. Reading the remainders from bottom to top gives the binary number: 45 → 22 r1 → 11 r0 → 5 r1 → 2 r1 → 1 r0 → 0 r1, so 45 = <code>101101</code>.</p>`
    }],
    faqs: [
      ['Does it support negative numbers?', 'Yes, using a minus sign: <code>-101</code> converts to −5. The tool does not interpret two’s complement, the format computers use to store negative integers. For example, <code>11111111</code> is shown as 255 rather than −1.'],
      ['Can I convert binary fractions such as 101.11?', 'Not at the moment. The converter supports whole numbers (integers) only.'],
      ['How large a number can I convert?', 'Up to 4,096 binary digits, or up to 1,300 decimal digits. Results are exact, with no rounding.'],
      ['Why does hexadecimal use letters?', 'Hexadecimal (base 16) needs 16 digit symbols, so it uses 0–9 and then A–F for the values 10 to 15. One hex digit represents exactly four binary digits.']
    ],
    related: ['percentage-calculator', 'uuid-generator', 'password-generator', 'url-encoder-decoder']
  }
];

module.exports = { categories, tools };
