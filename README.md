# Daily Wrap

A modern, responsive dashboard providing a quick daily overview of world news, live sports, and tournament leaderboards:

- **Top Headlines**: Grouped by source (BBC, NPR, AP News, Reuters, WSJ), collapsible independently so large feeds don't crowd out others. Includes an **"Ask AI"** button on headlines for instant deep-dive analysis in Gemini or ChatGPT.
- **Golf Leaderboards**: Live tournament leaderboards (PGA Tour, LPGA Tour, DP World Tour) with score, thru status, outright winner odds, interactive Top 5 / Top 10 odds popovers with DraftKings links, and "Ask AI" tournament story summaries.
- **Yesterday's Sports Results**: Final scores for yesterday's games across all major leagues.
- **Today's Scheduled Games**: Live & upcoming games with local start times and channel broadcasts.
- **Tomorrow's Scheduled Games**: Next day match schedule (auto-collapsed by default).
- **Must-Watch Filter**: Toggle to highlight top-tier matchups across leagues.
- **Customizable AI Assistant**: AI model selector in header (Gemini / ChatGPT) with configurable prompt templates.
- **iOS & Mobile Web App Refresh**: Native-like **Pull-to-Refresh** touch gesture and explicit **Refresh** button in the header bar designed for standalone PWA mode.

## Supported Sports & Leagues

Sports are grouped logically with smart auto-collapsing for quiet days:
- **Football**: NFL, NCAA Football
- **Basketball**: NBA, WNBA, NCAA Men's Basketball
- **Baseball**: MLB
- **Hockey**: NHL
- **Soccer**: Premier League, Champions League, Europa League, La Liga, Serie A, Bundesliga, Ligue 1, MLS
- **Combat Sports**: UFC, Boxing
- **Golf**: PGA Tour, LPGA Tour, DP World Tour (leaderboards with odds & DraftKings links)

Team and fighter names display official team logos/icons and link directly to official ESPN pages for full rosters, stats, and detailed box scores.

## Architecture & How It Works

- **Frontend**: Lightweight, zero-framework JavaScript app (`app.js`, `style.css`, `index.html`) optimized for fast loading and mobile/desktop layout flexibility. Includes PWA / iOS home screen app icons (`icon.svg`, `apple-touch-icon.png`).
- **Server**: Express Node server (`server.js`) serving static assets and dynamic API routes (`/api/headlines`, `/api/refresh-headlines`).
- **Headlines Engine**: `scripts/fetch-headlines.js` fetches RSS feeds (direct RSS for BBC/NPR/WSJ and Google News RSS search for AP News/Reuters) and outputs `headlines.json`. The server dynamically verifies staleness (>15 mins) and refreshes on-demand or via scheduled background timer.
- **Scores & Schedules**: ESPN public scoreboard & leaderboard APIs fetched dynamically client-side with automatic fallback handling.
- **Automation**: GitHub Actions workflows (`.github/workflows/update-headlines.yml` and `deploy.yml`) handle automated headline updates and GitHub Pages deployments.

## Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm start
   ```
   Or run the headline fetch script manually:
   ```bash
   node scripts/fetch-headlines.js
   ```
3. Open `http://localhost:3000` in your browser.

## Deployment

- **Cloud Run / Container / Express**: Standard Node.js entry point (`npm start` -> `node server.js`).
- **GitHub Pages**: Workflows in `.github/workflows/` automatically publish the static build and maintain updated headlines on a 30-minute schedule.

