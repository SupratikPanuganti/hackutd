# T-Care AI Agent Troubleshooting Guide

## Quick Fixes

### 1. Onboarding Dialog Not Showing

**Problem:** The welcome dialog doesn't appear when you visit the home page.

**Solution:**
1. Open browser console (F12)
2. Type: `resetOnboarding()`
3. Refresh the page
4. The dialog should appear after 1.5 seconds

**Why:** The dialog uses localStorage to track if you've seen it before. Calling `resetOnboarding()` clears this flag.

---

### 2. Sentiment Service Not Working

**Problem:** No sentiment data appearing, camera not starting.

**Checklist:**
1. ✅ **Is the backend running?**
   ```bash
   cd server
   npm run dev
   ```
   You should see: `Backend server running on http://localhost:3001`

2. ✅ **Check browser console for errors:**
   - Look for `[Sentiment]` logs
   - Should see: `✅ [Sentiment] WebSocket connected successfully`
   - If you see connection errors, the backend isn't running

3. ✅ **Camera permissions:**
   - Backend needs camera access for sentiment analysis
   - Check if camera light is on when Agent Mode enabled
   - Grant camera permission if prompted

4. ✅ **Check WebSocket connection:**
   Open console and look for:
   ```
   [Sentiment] Connecting to WebSocket: ws://localhost:3001/sentiment
   ✅ [Sentiment] WebSocket connected successfully
   [Sentiment] Sending start command: {"type":"start","cameraIndex":0}
   ```

**Common Issues:**
- **Port 3001 already in use:** Kill the process using the port
- **Backend not installed:** Run `cd server && npm install`
- **Camera in use:** Close other apps using the camera

---

### 3. Navigation Not Working

**Problem:** Voice commands like "show me devices" don't navigate.

**Checklist:**
1. ✅ **Check console logs:**
   Look for these emoji logs:
   ```
   🎤 [USER SPOKE] show me devices
   🧭 [LLM Navigator] Starting navigation decision
   🔑 [LLM Navigator] API Key present: true
   📡 [LLM Navigator] Response status: 200
   ✅ [LLM Navigator] Decision: { shouldNavigate: true, route: "/devices" }
   🚀 [NAVIGATING NOW] /devices
   ```

2. ✅ **OpenAI API Key configured?**
   - Check `.env` file has `VITE_OPENAI_KEY=sk-proj-...`
   - Console should show: `🔑 [LLM Navigator] API Key present: true`

3. ✅ **Common errors:**
   - **401 Unauthorized:** API key is invalid or expired
   - **429 Too Many Requests:** API rate limit hit
   - **No API key:** Set `VITE_OPENAI_KEY` in `.env`

**Test Navigation Manually:**
```javascript
// In browser console
import { decideNavigation } from './src/services/llmNavigator';
await decideNavigation("show me devices");
```

---

### 4. VAPI Greeting Not Playing

**Problem:** No voice greeting when enabling Agent Mode.

**Checklist:**
1. ✅ **VAPI configured?**
   - Check `.env` has `VITE_VAPI_PUBLIC_KEY` and `VITE_VAPI_ASSISTANT_ID`

2. ✅ **Check console logs:**
   ```
   🚀 [START VOICE CALL] { hasIntroPrompt: true, introPromptText: "Hi! I'm Tee..." }
   📝 [ASSISTANT OVERRIDES] { firstMessage: "Hi! I'm Tee...", firstMessageMode: "assistant-speaks-first" }
   📞 [VAPI CALL STARTED] { callId: "..." }
   ⏳ [WAITING] For assistant greeting to complete...
   ```

3. ✅ **Audio issues:**
   - Check system volume
   - Browser auto play policy - click page first
   - Check audio output device

4. ✅ **Microphone permissions:**
   - Browser needs microphone access for VAPI
   - Grant permission when prompted

---

## Debug Helpers

The app includes helpful debug functions available in the browser console:

```javascript
// Reset onboarding dialog
resetOnboarding()  // Then refresh page

// Reset agent mode completely
resetAgentMode()   // Then refresh page
```

---

## Environment Variables Checklist

Make sure your `.env` file has all required variables:

```env
# VAPI Configuration (required for voice assistant)
VITE_VAPI_PUBLIC_KEY=your-public-key
VITE_VAPI_ASSISTANT_ID=your-assistant-id

# OpenAI (required for navigation)
VITE_OPENAI_KEY=sk-proj-your-key

# Backend URLs
VITE_BACKEND_URL=http://localhost:3001
VITE_BACKEND_WS_URL=ws://localhost:3001
BACKEND_PORT=3001

# Supabase (for data)
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-key
```

---

## Starting Everything

### 1. Start Backend (Terminal 1)
```bash
cd server
npm install  # First time only
npm run dev
```
Expected output:
```
Backend server running on http://localhost:3001
WebSocket sentiment stream: ws://localhost:3001/sentiment
```

### 2. Start Frontend (Terminal 2)
```bash
npm install  # First time only
npm run dev
```
Expected output:
```
Local:   http://localhost:5173/
```

### 3. Open Browser
- Navigate to `http://localhost:5173/`
- Open console (F12) to see debug logs
- Grant camera and microphone permissions when prompted

---

## Still Having Issues?

### Enable Verbose Logging

The app now has comprehensive logging. Check the console for:
- 🎤 Speech recognition events
- 🧭 Navigation decisions
- 😊 Sentiment data
- 📡 WebSocket connections
- ✅ Success messages
- ❌ Error messages

### Check Backend Health

```bash
curl http://localhost:3001/health
```

Should return:
```json
{
  "status": "ok",
  "sentiment": {
    "running": true,
    "current": { ... }
  }
}
```

### Common Port Conflicts

If port 3001 or 5173 are in use:

**Windows:**
```cmd
netstat -ano | findstr :3001
taskkill /PID <pid> /F
```

**Mac/Linux:**
```bash
lsof -ti:3001 | xargs kill -9
```

---

## Contact & Support

If you're still stuck:
1. Check the browser console for error messages
2. Check the backend terminal for errors
3. Share console output for debugging

Debug logs are prefixed with emojis for easy filtering! 🎉
