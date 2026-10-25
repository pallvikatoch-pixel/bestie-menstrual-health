# Bestie 🌷 – a private, friendly menstrual health companion

**Your cycle, your comfort, your bestie.**
Hackcache 2026 · Social Impact · Problem Statement 5

Many girls and women in India can't tell an ordinary cycle change from one that needs a doctor, find PCOS/PCOD confusing, and don't trust paid apps with something this private. Bestie is free, needs no account, keeps everything on the phone, and talks like a caring friend. It is built for **Ananya, 17, in Lucknow**: her periods are irregular, she shares a phone with her family, prefers Hindi and is too shy to ask anyone.

## What it does

| Screen | What it does |
|---|---|
| Welcome and setup | Choose "Try with demo data" or "Start fresh". Setup questions come one at a time in a chat style. Every question has **Skip for now**, and there is a **Skip all** button. |
| Today | Shows the day of the cycle, the current phase in one sentence, and the next period as an *estimate* range. It also has a one-tap log button, a mood check-in, one personal pattern and the Daily Bloom card. |
| Log a day | Records period on or off and flow, with two quick questions on heavy days (a pad every 1 to 2 hours? clots bigger than a ₹10 coin?). It also records pain 0–10 ("did it stop you?", "did painkillers help?"), symptom icons, mood, energy, sleep, medicines and a private line. |
| Calendar | Logged days are filled circles. Estimated days are dashed rings, and the fertile window is a dotted ring. Each mark has a different shape as well as a different colour. |
| Insights | A bar chart of cycle and period lengths, with the average, the range and how regular the cycle is. A symptom pattern is shown only after it appears in 3 or more cycles, with the count. |
| When to see a doctor | Calm cards built from the logs, each showing what was noticed and on which days, why it matters, where to go and the source. The page also lists the signs logs can't show. |
| Prepare for my visit | A one-page printable summary for the doctor. |
| Learn | 7 short lessons with illustrations, a Listen button and sources: the cycle, PCOS/PCOD, late periods, cramps, pads/cups/cloth, my first period, and myths and facts. |
| Daily Bloom | A new bite-sized card every day (62 cards). "Myth or fact?" cards flip over to show the answer. You can save cards and watch a little flower garden grow, with no streaks. |
| Feel better | A guided stretch routine with a breathing circle. It also has comfort ideas and everyday habits, all sourced, with no medicine names or doses. |
| Ask | 33 checked answers in English and Hindi, matched by keyword, browsable by topic. **AI chat is optional and off by default.** |
| Reminders | All off until switched on. They follow discreet mode. |
| Pregnancy mode | Off unless switched on after a positive test or a doctor's confirmation. It shows the week, an estimated due date, weekly information and danger signs, and pauses period estimates. |
| Settings | Language (English or हिंदी), 3 text sizes, high contrast, read aloud, age group, tracked symptoms, PIN lock, discreet mode, export and import, delete everything, and developer time travel. |

## How predictions work (`src/lib/cycle.js`, numbers in `src/config.js`)

- **Cycle length** is counted from the first day of one period to the first day of the next. The current, unfinished cycle is never counted. Bestie uses the **last 6 complete cycles**.
- With **fewer than 3 complete cycles (4 logged period starts)** there is no prediction, only a friendly message asking for more data.
- **Next period** = last start + the **median** cycle length, shown as a range of ± half the spread of recent cycles, and **at least ±2 days**.
- **Irregular:** if recent cycles vary by more than **7 days** (FIGO allows 7 to 9 depending on age; we use the stricter 7), the label "Irregular" appears. The range then becomes the shortest to longest recent cycle, plus 2 days on each side. A one-line explanation and a link to the doctor page are shown.
- **Ovulation** ≈ 14 days before the next period, and the fertile window is the 5 days before it plus that day. Both are shown as ranges with: *"This is an estimate. It can't be used to prevent pregnancy."* They are **hidden for irregular cycles**, and also hidden for under-18s and unknown age unless switched on in Settings.
- A gap of **at least 50 days and at least 1.6× the usual length** asks *"Did you forget to log a period?"* before it is counted.
- Every date is a plain local date ("2026-10-17"), never a UTC timestamp.

`npm test` runs 34 checks: 28-day cycles; cycles of 26, 31, 29, 35, 27 and 30 days; only 2 cycles; a 58-day missed log; every doctor rule; urgent signs; Tele-MANAS; and the demo data.

## "When to see a doctor" rules (`src/data/redflags.js`)

| Rule | Source |
|---|---|
| Periods lasting more than 7 days | NHS Heavy periods; ACOG Abnormal Uterine Bleeding |
| Changing a pad every 1 to 2 hours, or clots bigger than a ₹10 coin | NHS Heavy periods |
| Cycles shorter than 21 or longer than 35 days, 3 in a row (21–45 for under-18s) | NHS Irregular periods; ACOG Committee Opinion 651 |
| No period for 90 days when not pregnant | NHS Stopped or missed periods |
| Bleeding between periods or after sex | ACOG AUB; NHS Periods |
| Pain that stops daily life (in 2+ periods), or painkillers don't help | NHS Period pain; ACOG Dysmenorrhea |
| Heavy period plus tiredness, breathlessness or dizziness (possible anaemia) | NHS Heavy periods; NHS Iron deficiency anaemia |
| Signs logs can't show: no period by 15, a sudden change after years of regular periods, bleeding after menopause | ACOG; NHS |

**Urgent signs** show "Get medical help now" with **108 and 112**: sudden severe lower-belly pain, very heavy bleeding with dizziness or fainting, and bleeding or severe pain in pregnancy. **Very low mood on 3 days in a row**, or self-harm words in Ask, show **Tele-MANAS 14416**.

## How Bestie avoids diagnosing and false reassurance

- It never names a condition the user "has". Cards say what was *logged*, why it's *worth showing a doctor*, and where to go: a PHC or CHC, eSanjeevani, or a gynaecologist.
- Every prediction is a range labelled "estimate". No time of the cycle is ever called "safe".
- No medicine names or doses anywhere. No diet, supplement or phase-based workout claims.
- It never says a warning sign is fine. A hidden ("dismissed") card comes back when new logs show the same thing.
- Calm wording and colours: a calm indigo instead of red, and no alarming words.
- The AI chat has a strict system prompt (`api/systemPrompt.js`) **and** a server-side safety net. Urgent or self-harm words always add 108/112 or 14416, whatever the model says.

## Privacy

- **No account, no sign-up, no server** for anything you log. Everything is stored in IndexedDB on the phone. There are no analytics, and fonts and icons are bundled, so the Network tab stays empty.
- **PIN lock (optional):** AES-GCM encryption with the Web Crypto API. The key is derived from the PIN with PBKDF2-SHA-256 (600,000 rounds) and a random salt. The PIN is never stored, and data is never stored in both plain and encrypted form. A wrong PIN never wipes data. Before the lock is switched on, Bestie warns that a forgotten PIN can't be recovered and offers an export. It recommends 6+ digits, because a 4-digit PIN only stops a casual look.
- **Discreet mode:** the app shows the name "Diary" and a notebook icon, removes the flower and greetings, and reminders say "Time to check in". A home-screen icon added earlier keeps its old name until it is added again.
- **Export:** JSON (full backup) and CSV. **Import** checks the file first. **Delete everything** takes one tap and one confirmation, and clears IndexedDB, localStorage, sessionStorage and Cache Storage.
- **Read aloud** uses only on-device voices. If there is none for a language, Listen is hidden.
- **The only exception is the optional AI chat.** It is off by default and explains what is sent before it is switched on. It sends the question, the last few chat messages, the language, the age group and the relevant lessons. With a second opt-in, it also sends a cycle summary: average length, regularity, last start date and last cycle's symptoms. It never sends a name, private notes or daily logs. The server keeps nothing.
- **Honest limits** (also shown in the app): anyone holding the unlocked phone can see the data, data doesn't sync between devices, and exported files are not encrypted.

## Health content sources

NHS (Periods, Period pain, Heavy periods, Irregular periods, Stopped or missed periods, Fertility in the menstrual cycle, Starting periods, PMS, PCOS, Iron deficiency anaemia, Pregnancy), ACOG (Dysmenorrhea, PCOS, Your First Period, Abnormal Uterine Bleeding, Committee Opinion 651), WHO (PCOS, Physical activity, Healthy diet), and India's Ministry of Health and Family Welfare (National Health Mission, Menstrual Hygiene Scheme, JSSK, eSanjeevani, Tele-MANAS), plus FOGSI. Every fact lives in `src/content/` or `src/data/` next to its source key, and `src/content/sources.js` lists the links. **Open every link once before the demo.**

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # prediction and doctor-rule tests
npm run build      # production build in dist/
```

Project map: `src/lib/` (cycle maths, rules, storage and encryption, reminders), `src/data/` (symptoms, rules, demo), `src/content/` (lessons, FAQ, daily cards, comfort, pregnancy, sources), `src/i18n/` (all interface text, en and hi), `src/pages/` (screens), `api/` (optional AI endpoint).

### Testing the AI chat locally

`npm run dev` only serves the frontend — `api/ask.js` doesn't run, so Ask always falls back to offline answers. To test the real AI chat on your machine, run the function through the Vercel or Netlify CLI instead (`npx vercel dev` or `npx netlify dev`), with `.env` filled in from `.env.example`.

**Windows note:** if your Windows username contains a space (e.g. `C:\Users\First Last\...`), `netlify dev` has a known bug where it mis-detects its working directory as your home folder instead of the project folder. This breaks two things silently: it can't find `netlify/functions` (Ask falls back to offline, as if the function doesn't exist), and it can't find `.env` (the API key never reaches the function, so Gemini replies "API key not valid"). Work around it by passing both explicitly: point `--functions` at the full absolute path, and export the env vars in the shell before launching, instead of relying on `netlify dev` to read `.env` itself:

```powershell
$env:AI_PROVIDER="gemini"
$env:GEMINI_MODEL="gemini-3.1-flash-lite"
$env:GEMINI_API_KEY="<your key>"
npx netlify dev --functions "C:\Users\First Last\path\to\bestie-menstrual-health\netlify\functions"
```

Check it worked: the startup log should include `⬥ Loaded function ask` (not just the Vite banner), and `curl -X POST http://localhost:8888/api/ask -H "content-type: application/json" -d "{\"question\":\"hi\"}"` should return JSON, not `{"error":"AI unavailable"}`.

## Put it online (Vercel, from GitHub)

1. Create a GitHub repo `bestie-menstrual-health` and push this folder (`git init && git add . && git commit -m "Bestie" && git branch -M main && git remote add origin <url> && git push -u origin main`).
2. On vercel.com: **Add New → Project → Import** the repo. The framework is **Vite**, the build command is `npm run build`, and the output folder is `dist`.
3. **Refreshing a page won't show a 404.** The app uses hash URLs (`/#/calendar`), and `vercel.json` also rewrites every route to `index.html`.
4. Optional AI chat: in **Settings → Environment Variables** add `AI_PROVIDER` (`gemini`, `openai` or `anthropic`) and the matching key from `.env.example`, then redeploy. Without a key, Ask falls back to the offline answers.

**Netlify:** "Import from Git". `netlify.toml` already sets `npm run build`, `dist`, the `/* → /index.html 200` redirect and the `/api/ask` function.

## What is simulated

- The demo profile (Ananya) is generated relative to today.
- "Pretend 7 days have passed" and "Pretend it's tomorrow" in Settings move the app's clock for testing.
- Reminders show only while the app is open. There is no push server.

## What we'd build next

- An installable app (PWA) with offline caching, and push reminders through an optional, opt-in server.
- More regional languages, starting with Tamil, Marathi and Bengali.
- A moderated, anonymous community, with a separate under-18 space and no direct messages.
- Review of the content by a gynaecologist, and testing with real users in schools and with ASHA workers.

## 3-minute demo script

1. **(0:00) The problem.** "Ananya is 17, her periods are irregular, she shares a phone and is too shy to ask anyone." Tap **Try with demo data**. *This makes the first open easy for someone who has never tracked.*
2. **(0:20) Today.** Point to "Day 10", the phase sentence, and the next period range with **estimate** and **Irregular**. *Irregular cycles get an honest, wider range instead of a false date.*
3. **(0:45) Calendar and Insights.** Show filled (logged) and dashed (estimate) days, the bar chart, and "Cramps… in 6 of your last 6 cycles, based on 6 cycles". *Patterns help her describe her body to a doctor.*
4. **(1:05) When to see a doctor.** Open the "Periods lasting more than 7 days" card, with its days, why it matters and where to go, then **Prepare for my visit**. *She can hand over a printout instead of saying everything out loud.*
5. **(1:30) Learn, then Ask.** Open the PCOS lesson and its sources. In Ask, tap "Do I have PCOS?" and show the answer: no diagnosis, what a doctor checks, and the doctor link. *Clear education without fear or misinformation.*
6. **(1:55) Daily Bloom.** Flip a "Myth or fact?" card. *A friendly 30-second habit that busts myths.*
7. **(2:10) Privacy.** Open DevTools → Network to show no requests. Set a PIN, then Application → IndexedDB to show the state is ciphertext. Reload to show the lock screen. *Private data stays private, even on a shared phone.*
8. **(2:35) Discreet mode and Hindi.** Switch on discreet mode: the tab now says "Diary". Switch to हिंदी: everything changes, including the lessons and answers. *It's safe and comfortable for a shared family phone.*
9. **(2:50) Delete everything.** Show storage is empty afterwards. *She stays in control.*

## What could go wrong live, and how to avoid it

- **Data left over from rehearsal:** use Delete everything, or a fresh incognito window, just before you start.
- **The PIN takes a second to unlock** (600,000 PBKDF2 rounds, on purpose). Say so, or rehearse on the demo laptop.
- **The Listen button is missing:** the browser has no on-device voice for that language. Use Chrome on Android or desktop with voices installed, or skip it.
- **The AI chat fails** (no key, or no Wi-Fi): Ask falls back to the offline answers automatically. Demo the offline answers first.
- **Notifications:** the browser may block the permission prompt. Use **Show a test reminder** on the Reminders page, which shows the in-app banner.
- **Dates:** the demo data is relative to today. If you used "Pretend 7 days have passed", press **Back to real today**.
- **Printing:** test "Print or save as PDF" on the demo laptop beforehand.

---

*Bestie gives general information from trusted health sources. It does not diagnose, its predictions are estimates, and it is not a replacement for a doctor.*
