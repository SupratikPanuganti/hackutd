# Sentiment Analysis Setup Guide

## Quick Fix - The sentiment is showing "starting" but not detecting

This means the backend server needs to be running with Python dependencies installed.

## Prerequisites

1. **Python 3.8+** must be installed and in your PATH
2. **Webcam/Camera** must be available and accessible
3. **Backend server** must be running

## Step-by-Step Setup

### 1. Install Python Dependencies

```bash
cd scripts
pip install -r requirements.txt
```

Required packages:
- `opencv-python` - For camera access and face detection
- `requests` - For API calls
- `numpy` - For numerical operations

### 2. Set Up API Keys (Choose ONE)

**Option A: NVIDIA API (Recommended)**
```bash
# In your .env file
NIM_API_KEY=your_nvidia_api_key_here
```

**Option B: OpenAI API**
```bash
# In your .env file
OPENAI_KEY=your_openai_api_key_here
USE_OPENAI=true
```

### 3. Start the Backend Server

```bash
cd server
npm run dev
```

You should see:
```
Backend server running on http://localhost:3001
WebSocket sentiment stream: ws://localhost:3001/sentiment
```

### 4. Enable Agent Mode in Frontend

1. Start the frontend: `npm run dev`
2. Click the "Agent Mode" toggle in the navigation
3. **Grant camera permission** when prompted by your browser
4. The backend will start the Python script automatically

## How to Verify It's Working

### Check Backend Logs

When you enable Agent Mode, you should see in the backend terminal:

```
[SENTIMENT] Python process spawned, waiting for initialization...
[SENTIMENT DEBUG] Raw stdout: "0"
[SENTIMENT] ✓ 0 (Neutral) - Timestamp: 1234567890
```

### Check Frontend Console

In browser console (F12), you should see:

```
✅ [Sentiment] WebSocket connected successfully
[Sentiment] Sending start command: {"type":"start","cameraIndex":0}
😊 [Sentiment] Data received: {value: 0, timestamp: 1234567890, label: "Neutral"}
```

## Troubleshooting

### "Sentiment: Starting..." never changes

**Problem:** Backend is not running or Python script failed to start

**Solutions:**
1. Check if backend server is running on port 3001
2. Run backend in terminal and watch for errors
3. Test Python script directly:
   ```bash
   cd scripts
   python cam.py
   ```
4. Check if camera is being used by another app

### Camera Permission Denied

**Problem:** Browser blocked camera access

**Solutions:**
1. Click the camera icon in your browser's address bar
2. Allow camera access for localhost
3. Refresh the page and try again

### Python Script Errors

**Common Issues:**

1. **OpenCV not installed:**
   ```bash
   pip install opencv-python
   ```

2. **Camera not found:**
   - Make sure your webcam is connected
   - Close other apps using the camera (Zoom, Teams, etc.)
   - Try a different camera index (usually 0 or 1)

3. **API Key not set:**
   - Check your `.env` file has NIM_API_KEY or OPENAI_KEY
   - Restart the backend server after adding keys

### No API Key Available (Testing Only)

If you don't have an API key, the script will output random values for testing:

```python
# In cam.py, it will use:
import random
sentiment = random.choice([-1, 0, 1])
```

This is enough to test the WebSocket connection.

## Expected Sentiment Values

The system outputs three values:
- `-1` = Frustrated/Sad (shows red)
- `0` = Neutral (shows gray)
- `1` = Happy (shows green)

These values update approximately every 1-2 seconds when working properly.

## Still Not Working?

### Check Processes

**Windows:**
```cmd
# Check if Python is installed
python --version

# Check if backend is running
netstat -ano | findstr :3001
```

**Mac/Linux:**
```bash
# Check if Python is installed
python3 --version

# Check if backend is running
lsof -i :3001
```

### Manual Test

Test the Python script directly:

```bash
cd scripts
export CAMERA_INDEX=0
export HEADLESS=true
export DEBUG_WINDOW=false
python cam.py
```

You should see numbers (-1, 0, or 1) being printed. If you see errors, install the missing dependencies.

## Architecture

```
Frontend (Agent Mode ON)
    ↓
WebSocket Connection to ws://localhost:3001/sentiment
    ↓
Backend sends: {"type": "start", "cameraIndex": 0}
    ↓
Backend spawns: python scripts/cam.py
    ↓
Python script:
  1. Opens camera
  2. Detects faces
  3. Analyzes emotion with NVIDIA/OpenAI API
  4. Outputs: -1, 0, or 1
    ↓
Backend receives stdout
    ↓
Backend sends via WebSocket: {"type": "sentiment", "data": {...}}
    ↓
Frontend displays sentiment in navigation bar
```

## Quick Checklist

- [ ] Python 3.8+ installed
- [ ] `pip install -r scripts/requirements.txt` completed
- [ ] Backend server running (`cd server && npm run dev`)
- [ ] Frontend running (`npm run dev`)
- [ ] Camera connected and not in use
- [ ] Browser camera permissions granted
- [ ] API key set in .env (NIM_API_KEY or OPENAI_KEY)
- [ ] Agent Mode toggled ON in navigation

If all boxes are checked and it's still not working, check the backend terminal logs for specific Python errors.
