# ⌨️ TypeSpeed — Typing Speed Test Web App

A sleek, minimalistic, **Monkeytype-inspired** typing speed test built with
plain **HTML5, CSS3, and vanilla JavaScript (ES6+)**. No frameworks, no
build tools, no dependencies — just open it in a browser and go.

![Dark themed typing test](https://img.shields.io/badge/theme-dark-111827) ![No dependencies](https://img.shields.io/badge/dependencies-none-4ade80) ![Responsive](https://img.shields.io/badge/responsive-yes-facc15)

---

## ✨ Features

- **Selectable test duration** — 15s, 30s, 60s, or 120s (2 minutes)
- **Randomized text pool** — easy / medium / hard sentence banks that are
  shuffled and combined so the text rarely repeats, with automatic
  extension if you finish the generated block before time runs out
- **Real-time character highlighting**
  - ✅ Correct characters → green
  - ❌ Incorrect characters → red (with a subtle red underline for
    missed spaces)
  - Blinking caret under/at the current character
- **Live stats bar** — countdown timer, live WPM, and live accuracy,
  all updating as you type
- **Timer starts on your first keystroke** — not before, so you can read
  the passage first
- **Accurate backspace handling** — correcting a mistake updates your
  live accuracy immediately
- **Results dashboard** on completion:
  - Net WPM & Gross WPM
  - Accuracy %
  - Time taken
  - Correct / Incorrect / Total characters typed
  - Total mistakes made
- **Restart / Try Again** — instantly generates a new passage and resets
  everything
- **Fully responsive** — works great on desktop, tablet, and mobile
  (uses a hidden input so mobile keyboards work too)
- **Smooth animations & modern dark UI**

---

## 📁 Project Structure

```
typing-speed-test/
├── index.html      # Page structure & markup
├── style.css       # Dark theme styling, layout, animations, responsiveness
├── script.js       # All application logic (typing engine, timer, stats)
├── words.js        # Text data pool (easy/medium/hard) + text generator
└── README.md       # You are here
```

The app is a **fully self-contained static site** — there is no backend
required. Everything (text generation, WPM/accuracy calculations, timer)
runs client-side in the browser.

---

## 🚀 How to Run Locally

You have three easy options:

### Option 1 — Just open the file (simplest)
Double-click `index.html`, or right-click → **Open with** your browser
of choice. That's it — the app works entirely from the local file system.

### Option 2 — Serve it with a local static server (recommended)
Some browsers restrict certain features when opening files directly via
`file://`. If you run into any issues, serve the folder locally instead:

**Using Python 3 (pre-installed on most systems):**
```bash
cd typing-speed-test
python3 -m http.server 8080
```
Then open **http://localhost:8080** in your browser.

**Using Node.js (`npx serve`):**
```bash
cd typing-speed-test
npx serve .
```
Then open the URL it prints (usually **http://localhost:3000**).

**Using the VS Code "Live Server" extension:**
Right-click `index.html` in VS Code → **Open with Live Server**.

### Option 3 — Deploy it anywhere static
Because it's just HTML/CSS/JS with no build step, you can drag-and-drop
the folder onto any static host: **GitHub Pages, Netlify, Vercel,
Cloudflare Pages, Surge**, etc. No configuration needed.

---

## 🕹️ How to Use

1. Pick a test duration from the **time** selector (15s / 30s / 60s / 120s).
2. Click into the text box (or just start typing — it auto-focuses).
3. Start typing the displayed passage. The **timer starts on your first
   keystroke**, not before.
4. Watch your **live WPM** and **accuracy** update in real time as you type.
5. When the countdown hits zero, your **results dashboard** appears
   automatically with a full breakdown of your performance.
6. Click **"Try Again"** (or the restart icon in the header) to get a
   fresh passage and start over.

> 💡 Tip: You can't change the duration mid-test — finish or restart
> first, then pick a new time.

---

## 🧮 How Stats Are Calculated

- **Gross WPM** = `(Total Characters Typed / 5) / Minutes Elapsed`
  *(the standard "5 characters = 1 word" convention used by most typing
  test tools)*
- **Net WPM** = `((Total Characters / 5) - Incorrect Characters) / Minutes Elapsed`,
  floored at 0 — this penalizes uncorrected mistakes still present at
  the time you stopped typing.
- **Accuracy** = `(Correct Characters / Total Characters Typed) × 100`
- **Total Mistakes** counts every incorrect keystroke made during the
  test, including ones you later corrected with backspace (so it can be
  higher than "Incorrect Characters," which only reflects what's wrong
  at the moment the test ends).

---

## 🛠️ Customization Ideas

- **Add more text**: extend the `easy`, `medium`, and `hard` arrays in
  `words.js` with your own sentences or paragraphs.
- **Change the theme**: all colors live as CSS custom properties at the
  top of `style.css` (`:root { --accent: ...; --correct: ...; }`) —
  tweak them to create a light theme or a different accent color.
- **Add a word-count mode**: the architecture in `script.js` separates
  timer logic from typing logic, so a "type N words" mode can be added
  by swapping the stop condition in `endTest()`.
- **Persist personal bests**: hook into `showResults()` in `script.js`
  and store scores in `localStorage` to build a history/leaderboard.
- **Backend / leaderboard (optional)**: since this is a static
  front-end, you can pair it with a lightweight Node.js/Express API
  (or any backend) to save results to a database and build a global
  leaderboard — the front-end already exposes final stats as plain
  JavaScript numbers in `showResults()`, ready to `fetch()`-POST
  to an endpoint of your choice.

---

## 🌐 Browser Support

Works in all modern evergreen browsers (Chrome, Firefox, Safari, Edge).
Uses standard ES6+ JavaScript, Flexbox/Grid CSS, and no experimental
APIs — no transpilation or polyfills needed.

---

## 📄 License

Free to use, modify, and distribute for personal or commercial projects.
