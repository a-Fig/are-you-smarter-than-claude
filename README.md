# Are You Smarter Than Claude?

Mini-games against real Claude models — timed, scored, and cost-metered. Are you smarter? Faster? Definitely cheaper.

**Play now:** https://are-you-smarter-than-claude-123326946878.us-west1.run.app

## Games

- **Tic-Tac-Toe** — Classic strategy
- **Connect Four** — Outwit the AI
- **Battleship** — Hunt and hide
- **Wordle Race** — Speed solving
- **Trivia** — Movies, history, math, Bay Area

## How It Works

Play against real Claude models (Haiku 4.5, Sonnet 5, Opus 5) via server-side API calls. Each move records latency and token usage. See who's faster and who keeps the bill low.

## Run Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Add your Anthropic API key to `.env.local`:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```

3. Start the dev server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) in your browser.
