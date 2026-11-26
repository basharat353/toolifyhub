// Content for the static pages (About, Contact, Privacy, Terms, Disclaimer).
// Review these with the site owner before launch — they are templates, not legal advice.
'use strict';

module.exports = (C) => ({
  about: {
    title: 'About ToolifyHub – Free, Private Online Tools',
    description: 'Learn about ToolifyHub: free online tools for text, images, developers and everyday calculations that run privately in your browser.',
    h1: 'About ToolifyHub',
    lead: 'ToolifyHub is a collection of free, fast online tools that help people get small but important tasks done — without sign-ups, downloads or handing over their data.',
    body: `
      <section>
        <h2>Why we built ToolifyHub</h2>
        <p>Many free online tools are slow, cluttered with pop-ups, or quietly upload your files to a server you know nothing about. We wanted something simpler: tools that load quickly, do one job well, explain how they work, and respect your privacy.</p>
        <p>Whether you are a student checking an essay’s word count, a designer compressing images, a developer formatting JSON, or anyone working out a discount or an age, ToolifyHub aims to give you a clear answer in seconds.</p>
      </section>
      <section>
        <h2>Our principles</h2>
        <ul class="checklist">
          <li><strong>Private by design.</strong> Every tool on this site runs in your web browser. Your text, images and numbers are processed on your own device and are not uploaded to us.</li>
          <li><strong>Free to use.</strong> All tools are free, with no account and no usage limits imposed by us.</li>
          <li><strong>Honest and transparent.</strong> We explain the formulas and assumptions behind our results, and we say clearly when a tool has limitations.</li>
          <li><strong>Accessible and fast.</strong> Pages are lightweight, work on phones, tablets and computers, support keyboard navigation and screen readers, and offer light and dark modes.</li>
        </ul>
      </section>
      <section>
        <h2>How the tools work</h2>
        <p>ToolifyHub is built with standard web technologies — HTML, CSS and JavaScript — and uses features built into modern browsers, such as the Canvas API for image processing and the Web Crypto API for secure random numbers. The QR code generator uses our own encoder, so no third-party scripts are loaded to create your codes.</p>
        <p>Because processing happens locally, many tools keep working even if your internet connection drops after the page has loaded.</p>
      </section>
      <section>
        <h2>Feedback and suggestions</h2>
        <p>We are always improving ToolifyHub. If you spot a mistake, have an idea for a new tool, or need help, please <a href="contact.html">get in touch</a>. We read every message.</p>
      </section>`
  },

  contact: {
    title: 'Contact ToolifyHub – Feedback, Questions & Tool Ideas',
    description: 'Contact the ToolifyHub team with questions, feedback, bug reports or suggestions for new free online tools.',
    h1: 'Contact us',
    lead: 'Questions, feedback, bug reports or an idea for a new tool? We would love to hear from you.',
    body: `
      <section>
        <h2>Email</h2>
        <p>The best way to reach us is by email at <a href="mailto:${C.contactEmail}">${C.contactEmail}</a>. We aim to reply within a few working days.</p>
        <p>When reporting a problem, it helps to tell us which tool you were using, what you expected to happen, what happened instead, and which browser and device you were using. Please don’t send passwords or other sensitive information.</p>
      </section>
      <section>
        <h2>Send a message</h2>
        <p class="muted">This form opens your email app with your message ready to send. Nothing is sent from this website or stored by us.</p>
        <form id="contact-form" class="tool-panel" data-email="${C.contactEmail}" novalidate>
          <div class="row">
            <div class="field"><label for="cf-name">Your name</label><input type="text" id="cf-name" autocomplete="name" required></div>
            <div class="field"><label for="cf-topic">Topic</label>
              <select id="cf-topic"><option>General question</option><option>Bug report</option><option>Tool suggestion</option><option>Privacy question</option><option>Advertising or partnership</option></select></div>
          </div>
          <div class="field"><label for="cf-message">Message</label><textarea id="cf-message" rows="6" required></textarea></div>
          <div id="cf-error" class="alert alert-error" role="alert" hidden></div>
          <button type="submit" class="btn btn-primary">Open in my email app</button>
        </form>
      </section>`
  },

  privacy: {
    title: 'Privacy Policy – ToolifyHub',
    description: 'Read the ToolifyHub privacy policy. Our tools process your text and files in your browser — we do not upload or store what you enter.',
    h1: 'Privacy Policy',
    lead: 'Your privacy matters. This policy explains what information is and isn’t collected when you use ToolifyHub.',
    body: `
      <p class="updated">Last updated: ${C.lastUpdatedHuman}</p>
      <div class="alert alert-info"><p><strong>In short:</strong> the tools on ToolifyHub run entirely in your web browser. The text, images and numbers you enter are processed on your device and are not uploaded to, seen by, or stored by us.</p></div>
      <section>
        <h2>1. Information you enter into tools</h2>
        <p>All tools on this website — including the text tools, image tools, developer tools, calculators, QR code generator and password generator — process your input locally using JavaScript in your browser. We do not receive, log or store that content. When you close or refresh the page, it is gone.</p>
      </section>
      <section>
        <h2>2. Information stored on your device</h2>
        <p>ToolifyHub stores one small preference in your browser’s local storage: your choice of light or dark mode (under the key <code>theme</code>). It never leaves your device and you can clear it at any time through your browser settings. ToolifyHub itself does not set cookies.</p>
      </section>
      <section>
        <h2>3. Server and hosting logs</h2>
        <p>Like almost every website, our hosting provider may automatically record technical information when pages are requested, such as your IP address, browser type, the page requested and the date and time. This is used to deliver the site, keep it secure and diagnose problems. These logs do not include anything you type or upload into our tools.</p>
      </section>
      <section>
        <h2>4. Analytics</h2>
        <p>We do not currently use analytics or tracking tools. If we add privacy-friendly analytics in the future, we will update this policy first and describe what is collected.</p>
      </section>
      <section>
        <h2>5. Advertising</h2>
        <p>ToolifyHub does not currently display advertisements. To keep the tools free, we may show ads in the future. If we do, we will update this policy before ads go live, explaining which advertising partners we use, how they use cookies, and how you can opt out.</p>
        <!--
          TEMPLATE FOR WHEN ADVERTISING (e.g. Google AdSense) IS ENABLED — review, adapt and replace the paragraph above:
          <p>We use Google AdSense to display ads. Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this and other websites. Google’s use of advertising cookies enables it and its partners to serve ads to you based on your visits to this site and/or other sites on the internet.</p>
          <p>You may opt out of personalised advertising by visiting <a href="https://www.google.com/settings/ads" rel="noopener">Google Ads Settings</a>, or opt out of some third-party vendors’ use of cookies by visiting <a href="https://www.aboutads.info/choices/" rel="noopener">www.aboutads.info</a>. Learn more in <a href="https://policies.google.com/technologies/partner-sites" rel="noopener">how Google uses information from sites that use its services</a>.</p>
          <p>Visitors in the EEA, the UK and Switzerland will be asked for consent through a certified consent management platform before personalised ads are shown.</p>
        -->
      </section>
      <section>
        <h2>6. Emails you send us</h2>
        <p>If you contact us by email, we receive your email address and whatever you include in your message. We use this only to reply to you and improve ToolifyHub, and we don’t sell or share it. You can ask us to delete your correspondence at any time.</p>
      </section>
      <section>
        <h2>7. Links to other websites</h2>
        <p>Our pages may link to other websites. We are not responsible for their content or privacy practices, so please read their privacy policies.</p>
      </section>
      <section>
        <h2>8. Children’s privacy</h2>
        <p>ToolifyHub is a general-audience website and does not knowingly collect personal information from children under 13 (or the equivalent minimum age in your country).</p>
      </section>
      <section>
        <h2>9. Your rights</h2>
        <p>Depending on where you live — for example in the UK, the European Union, California, Canada or Australia — you may have rights to access, correct or delete personal information held about you. Because our tools don’t collect personal data, in most cases we hold none. If you have emailed us, contact us to exercise these rights.</p>
      </section>
      <section>
        <h2>10. Changes to this policy</h2>
        <p>We may update this policy from time to time. The “last updated” date at the top shows when it was last changed. Significant changes will be highlighted on this page.</p>
      </section>
      <section>
        <h2>11. Contact</h2>
        <p>Questions about privacy? Email <a href="mailto:${C.contactEmail}">${C.contactEmail}</a>.</p>
      </section>`
  },

  terms: {
    title: 'Terms of Service – ToolifyHub',
    description: 'The terms of service for using ToolifyHub’s free online tools, including acceptable use, disclaimers and limitation of liability.',
    h1: 'Terms of Service',
    lead: 'Please read these terms carefully. By using ToolifyHub, you agree to them.',
    body: `
      <p class="updated">Last updated: ${C.lastUpdatedHuman}</p>
      <section>
        <h2>1. Using ToolifyHub</h2>
        <p>ToolifyHub provides free online tools for personal and commercial use. You may use the tools for any lawful purpose. You don’t need an account, and we may change, add or remove tools at any time.</p>
      </section>
      <section>
        <h2>2. Your content</h2>
        <p>You keep all rights to the text, images and other content you process with our tools. Because processing happens in your browser, we don’t receive or store your content. You are responsible for making sure you have the right to use any content you process.</p>
      </section>
      <section>
        <h2>3. Acceptable use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>use the website for anything illegal, harmful or fraudulent;</li>
          <li>attempt to disrupt, overload or gain unauthorised access to the website or its hosting;</li>
          <li>copy or republish the website’s content or code as your own without permission;</li>
          <li>use automated systems to access the site in a way that places an unreasonable load on it.</li>
        </ul>
      </section>
      <section>
        <h2>4. Results and accuracy</h2>
        <p>We work hard to make our tools accurate and reliable, but results are provided for general information only. Calculators use the standard formulas described on each page, and conversion tools depend on your browser’s capabilities. Always check important results, and keep copies of original files before converting or compressing them.</p>
      </section>
      <section>
        <h2>5. No warranty</h2>
        <p>ToolifyHub is provided “as is” and “as available”, without warranties of any kind, express or implied, including fitness for a particular purpose, accuracy or uninterrupted availability.</p>
      </section>
      <section>
        <h2>6. Limitation of liability</h2>
        <p>To the fullest extent permitted by law, ToolifyHub and its operators will not be liable for any indirect, incidental or consequential loss or damage, or for any loss of data, profits or business, arising from your use of the website or its tools. Nothing in these terms limits liability that cannot be limited by law.</p>
      </section>
      <section>
        <h2>7. Intellectual property</h2>
        <p>The ToolifyHub name, logo, design, written content and code are owned by ToolifyHub’s operators unless otherwise stated. Product names and trademarks mentioned on this site, such as QR Code (a registered trademark of DENSO WAVE INCORPORATED), belong to their respective owners.</p>
      </section>
      <section>
        <h2>8. Third-party links and services</h2>
        <p>The website may contain links to third-party websites, and in future may display third-party advertisements. We are not responsible for third-party content, products or services.</p>
      </section>
      <section>
        <h2>9. Changes to these terms</h2>
        <p>We may update these terms from time to time. Continued use of the website after changes are published means you accept the updated terms.</p>
      </section>
      <section>
        <h2>10. Governing law</h2>
        <p>These terms are governed by the laws of ${C.jurisdiction}, without regard to conflict-of-law principles. If you are a consumer, you also keep any protections given to you by the laws of the country where you live.</p>
      </section>
      <section>
        <h2>11. Contact</h2>
        <p>Questions about these terms? Email <a href="mailto:${C.contactEmail}">${C.contactEmail}</a>.</p>
      </section>`
  },

  disclaimer: {
    title: 'Disclaimer – ToolifyHub',
    description: 'Important information about the accuracy and intended use of ToolifyHub’s free online tools and calculators.',
    h1: 'Disclaimer',
    lead: 'Our tools are designed to be helpful and accurate, but they are not a substitute for professional advice.',
    body: `
      <p class="updated">Last updated: ${C.lastUpdatedHuman}</p>
      <section>
        <h2>General information only</h2>
        <p>The tools and content on ToolifyHub are provided for general informational purposes. While we aim for accuracy, we make no guarantees that results are complete, correct or suitable for any particular purpose. Use them at your own discretion and verify anything important.</p>
      </section>
      <section>
        <h2>Health calculators</h2>
        <p>The BMI calculator and any other health-related information are not medical advice and cannot diagnose any condition. BMI is a general screening measure with known limitations. Always consult a qualified healthcare professional about your health, weight or diet.</p>
      </section>
      <section>
        <h2>Financial calculators</h2>
        <p>The percentage and discount calculators are provided for convenience and are not financial, tax or legal advice. Store prices, tax rules and rounding methods vary. Confirm final prices with the seller and consult a qualified professional for financial decisions.</p>
      </section>
      <section>
        <h2>File and data tools</h2>
        <p>Image, text and developer tools process data in your browser. Results depend on your browser and device. Always keep a copy of your original files and test converted or minified output before using it in important work or production systems.</p>
      </section>
      <section>
        <h2>Security tools</h2>
        <p>The password and UUID generators use your browser’s cryptographically secure random number generator. You are responsible for storing passwords safely, such as in a reputable password manager, and for following the security practices of the services you use.</p>
      </section>
      <section>
        <h2>External links and advertising</h2>
        <p>ToolifyHub may link to external websites and may display third-party advertising in the future. We do not endorse and are not responsible for third-party content, products or services. We do not currently use affiliate links.</p>
      </section>
      <section>
        <h2>Questions</h2>
        <p>If you believe something on this site is inaccurate, please <a href="contact.html">contact us</a> so we can review and correct it.</p>
      </section>`
  }
});
