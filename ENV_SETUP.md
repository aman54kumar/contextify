# Environment Variables Setup

## Setting up your Gemini API Key

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Get your free Gemini API key from: https://aistudio.google.com/app/apikey

3. Open `.env` and replace `your_gemini_api_key_here` with your actual API key:
   ```
   VITE_GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

4. Restart the dev server:
   ```bash
   npm run dev
   ```

## Important Notes

- The `.env` file is gitignored and will not be committed to version control
- Users can still override the default key by entering their own in Settings
- The app will automatically use the environment variable if no user key is set
