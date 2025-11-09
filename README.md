# Streamable Movies

Simple utility to read a Letterboxd watchlist (CSV), query TMDB for US streaming providers, and show which titles are available on selected services.

## Features

- Upload a CSV watchlist and retrieve movie titles.
- Query TMDB watch/providers for US availability.
- Frontend UI to filter and order titles by availability.

## Quick start

1. Install dependencies
   ```
   npm install
   ```
2. Set environment variables (required)
   ```
   export TMDB_API_TOKEN="your_tmdb_bearer_token"
   ```
3. Start the app (use the scripts defined in package.json)
   ```
   npm run dev   # or npm start
   ```

## Usage

- Open the app in your browser.
- Upload a CSV containing movie titles (one title per line or first column).
- Use the service checkboxes to filter — available titles are shown first.

## Important files

- src/tmdb.js — TMDB lookup and provider extraction
- src/public/app.js — frontend rendering and filtering logic
- src/ (server + other source files)

## Notes

- Requires a TMDB API token (Bearer) in TMDB_API_TOKEN.
