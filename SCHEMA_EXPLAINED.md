# Database Schema - Simple Explanation (Voice-First with Vapi)

## Overview

Your database has **8 tables** that work together to handle **voice-first** customer support. T-Care is voice-first - users **speak** to the AI through Vapi (Voice AI platform), not type messages. Think of it like this:

```
User speaks to AI → Vapi processes voice → Session created → 
Voice transcribed to text → Sentiment analyzed from voice → 
Status checked → Steps tried → Ticket created (if needed) → 
Everything logged in Events → Graph shows emotional journey
```

---

## Table 1: `users` 👤

**What it stores**: Basic user information

**Why you need it**: To know who is asking for help

**What's in it**:
- `id` - Unique identifier (like a social security number)
- `email` - User's email address
- `zip_code` - Where they live (for checking local network status)
- `device_type` - What phone they have (e.g., "iPhone 15 Pro")
- `created_at` - When they first used the app

**Example**:
```
id: abc-123
email: john@example.com
zip_code: 30332
device_type: iPhone 15 Pro
created_at: 2025-01-15 10:00:00
```

**Simple analogy**: Like a contact card with basic info

---

## Table 2: `sessions` 💬

**What it stores**: Each voice support conversation

**Why you need it**: To track a voice conversation from start to finish

**What's in it**:
- `id` - Unique session ID (e.g., "session_1699123456789_abc123")
- `user_id` - Which user started this session
- `issue_type` - What the problem is (e.g., "connectivity_down")
- `zip_code` - User's location
- `voice_enabled` - Voice is enabled (TRUE for voice-first conversations)
- `camera_enabled` - Did they use camera? (optional)
- `outcome` - How it ended ("resolved", "escalated", "abandoned")
- `started_at` - When voice conversation started
- `ended_at` - When voice conversation ended (NULL if still active)

**Example**:
```
id: session_123
user_id: abc-123
issue_type: connectivity_down
zip_code: 30332
voice_enabled: true  (voice-first!)
camera_enabled: false
outcome: resolved
started_at: 2025-01-15 10:00:00
ended_at: 2025-01-15 10:05:00
```

**Simple analogy**: Like a phone call record - tracks the entire voice conversation

---

## Table 3: `messages` 💭

**What it stores**: Transcribed text from voice conversations (via Vapi) and AI responses

**Why you need it**: To show the conversation history (transcribed from voice) to users

**What's in it**:
- `id` - Unique message ID
- `session_id` - Which session this message belongs to
- `role` - Who said it ("user" for voice/transcribed, "assistant" for AI response)
- `content` - Transcribed text from voice (via Vapi) or AI response text
- `sentiment_score` - Sentiment from voice analysis (-1.00 to 1.00) - extracted from voice tone/emotion
- `metadata` - Vapi metadata (audio_url, duration, transcription_confidence, voice_analysis) or evidence links
- `created_at` - When the message was created

**Example**:
```
id: msg-456
session_id: session_123
role: user
content: "My internet is not working and I'm really frustrated"  (transcribed from voice)
sentiment_score: -0.75  (from voice analysis - tone, emotion, stress)
metadata: {
  "audio_url": "https://...",
  "duration": 3.5,
  "transcription_confidence": 0.95,
  "voice_analysis": {
    "tone": "frustrated",
    "emotion": "anger",
    "stress_level": 0.8
  }
}
created_at: 2025-01-15 10:00:30
```

**Simple analogy**: Like a transcription of a phone call - stores what was said (transcribed from voice) and AI responses

**Important**: In voice-first mode, `content` is transcribed text from voice (not typed), and `sentiment_score` comes from voice analysis (tone, emotion, stress), not just text!

---

## Table 4: `sentiment_history` 😊

**What it stores**: User sentiment and happiness scores over time during the **voice conversation** (from voice analysis)

**Why you need it**: To track how the user's mood changes during the voice conversation and create a graph showing their emotional journey throughout the call

**What's in it**:
- `id` - Unique record ID
- `session_id` - Which session this belongs to
- `sentiment_score` - Sentiment from voice analysis (-1.00 to 1.00, where -1 is very negative/frustrated)
- `happiness_score` - Happiness (0.00 to 1.00, where 0 is unhappy, 1 is happy) - computed from sentiment
- `message_id` - Link to the transcribed message that triggered this measurement
- `voice_metadata` - Voice-specific analysis data from Vapi (tone, emotion, stress_level, speech_rate)
- `measured_at` - When this measurement was taken (after each voice interaction)

**Example**:
```
id: sentiment-456
session_id: session_123
sentiment_score: -0.75  (from voice analysis - user sounds frustrated)
happiness_score: 0.125  (converted from sentiment: (-0.75 + 1.0) / 2.0)
message_id: msg-789  (links to transcribed message)
voice_metadata: {
  "tone": "frustrated",
  "emotion": "anger",
  "stress_level": 0.8,
  "speech_rate": "fast",
  "volume": 0.75,
  "pauses": 3
}
measured_at: 2025-01-15 10:00:30
```

**Simple analogy**: Like a mood tracker during a phone call - records how happy/frustrated the user sounds at each point in the voice conversation

**Important**: 
- This tracks **user sentiment from voice analysis** (tone, emotion, stress) during the conversation
- This is different from network happiness! 
- Sentiment comes from **voice analysis via Vapi**, not just text
- Use this data to create a graph showing emotional journey throughout the voice call

---

## Table 5: `status_snapshots` 📊

**What it stores**: Network health checks (is the network working in their area?)

**Why you need it**: To show users if there's an outage or problem in their area

**What's in it**:
- `id` - Unique snapshot ID
- `session_id` - Which session requested this check
- `region` - Geographic area (e.g., "Midtown ATL")
- `tower_id` - Which cell tower (e.g., "eNB-123") or NULL
- `health` - Network status ("ok", "degraded", "down")
- `eta_minutes` - How long until it's fixed (if there's a problem)
- `network_happiness_score` - Network/regional health score (0.0 to 1.0) - **NOT user sentiment**
- `sparkline` - Historical network health scores (array of 6-12 numbers) - **NOT user sentiment**
- `source_url` - Link to evidence (where this data came from)
- `created_at` - When this check was done

**Example**:
```
id: status-789
session_id: session_123
region: Midtown ATL
tower_id: eNB-123
health: degraded
eta_minutes: 35
network_happiness_score: 0.46  (network health, not user sentiment)
sparkline: [0.71, 0.69, 0.65, 0.58, 0.52, 0.46]  (network health over time)
source_url: /status?zip=30332&tower=eNB-123
created_at: 2025-01-15 10:01:00
```

**Simple analogy**: Like a weather report - tells you if there's a problem in your area

**Important**: The `network_happiness_score` and `sparkline` here are about **network health**, not user sentiment. For user sentiment graphs, use the `sentiment_history` table!

---

## Table 6: `playbook_runs` 🔧

**What it stores**: Automated troubleshooting steps that were tried (playbook execution)

**Why you need it**: To track what automated fixes were tried and if they worked

**What's in it**:
- `id` - Unique run ID
- `session_id` - Which session ran this step
- `step_name` - What step was tried (e.g., "toggle_airplane", "apn_check", "dns_probe")
- `step_order` - What order it was tried in (1, 2, 3, etc.)
- `result` - Did it work? ("success", "failure", "skipped", "completed")
- `metrics` - Test results (e.g., latency, packet loss, APN settings)
- `evidence_url` - Link to test logs (for transparency)
- `created_at` - When this step was tried

**Example**:
```
id: playbook-111
session_id: session_123
step_name: toggle_airplane
step_order: 1
result: completed
metrics: {"duration_sec": 5}
evidence_url: /logs?session_id=session_123&step=toggle_airplane
created_at: 2025-01-15 10:02:00
```

**Simple analogy**: Like a troubleshooting checklist - tracks each automated step tried

**What is a Playbook?**
A **playbook** is a set of automated troubleshooting steps that the AI agent tries to fix a user's problem. For example:
- **Step 1**: Toggle airplane mode (reset network connection)
- **Step 2**: Check APN settings (verify network configuration)
- **Step 3**: Test DNS connectivity (check internet connection)

Each step is executed automatically, and the results are stored here. If all steps fail, a ticket is created for human support.

**See `PLAYBOOK_EXPLAINED.md` for detailed explanation and examples!**

---

## Table 7: `tickets` 🎫

**What it stores**: Support tickets (when we can't fix it, we create a ticket)

**Why you need it**: To track escalated issues that need human help

**What's in it**:
- `id` - Ticket ID (e.g., "INC-123456")
- `session_id` - Which session created this ticket
- `user_id` - Which user has this issue
- `summary` - Brief description of the problem
- `status` - Current status ("open", "in_progress", "resolved", "closed")
- `context` - Full context (ZIP, issue, steps tried, sentiment)
- `jira_url` - Link to Jira ticket (external system)
- `created_at` - When ticket was created
- `resolved_at` - When ticket was resolved (NULL if not resolved)

**Example**:
```
id: INC-123456
session_id: session_123
user_id: abc-123
summary: Connectivity down after guided steps
status: open
context: {"zip": "30332", "issue": "Cell Data", "steps_tried": ["toggle_airplane", "apn_check"], "sentiment": -0.44}
jira_url: /ticket/INC-123456
created_at: 2025-01-15 10:05:00
resolved_at: null
```

**Simple analogy**: Like a support ticket at a help desk - tracks issues that need human help

---

## Table 8: `events` 📝

**What it stores**: Everything that happens (audit trail)

**Why you need it**: To track all important events for debugging and analytics

**What's in it**:
- `id` - Unique event ID
- `session_id` - Which session this event belongs to
- `user_id` - Which user this event belongs to
- `event_type` - What happened ("classified", "status_checked", "playbook_executed", "ticket_created")
- `payload` - Full event data (JSON)
- `source_url` - Link to evidence
- `created_at` - When this event happened

**Example**:
```
id: event-222
session_id: session_123
user_id: abc-123
event_type: classified
payload: {"intent": "connectivity_down", "sentiment": -0.62, "severity": "high"}
source_url: null
created_at: 2025-01-15 10:00:45
```

**Simple analogy**: Like a security camera log - records everything that happens

---

## How They Work Together (Voice-First Flow)

### Example: User speaks "My internet is not working and I'm really frustrated"

1. **User speaks to AI** → Voice interaction starts through Vapi
2. **Vapi processes voice** → Transcribes text + analyzes sentiment from voice (tone, emotion, stress)
3. **Session created** → Create record in `sessions` table (voice_enabled: true)
4. **Message stored** → Create record in `messages` table with transcribed text and sentiment_score from voice analysis
5. **Sentiment tracked** → Create record in `sentiment_history` table with happiness_score and voice_metadata (tone, emotion, stress_level)
6. **AI classifies issue** → Create record in `events` table (event_type="classified")
7. **Check network status** → Create record in `status_snapshots` table
8. **Try troubleshooting steps** → Create records in `playbook_runs` table (one per step)
9. **User speaks again** → Repeat steps 4-5 (each voice interaction creates new sentiment_history record)
10. **If not fixed, create ticket** → Create record in `tickets` table
11. **Log everything** → Create records in `events` table for each action
12. **End of call** → Display sentiment graph showing emotional journey throughout voice conversation

---

## Common Queries

### "Show me all active sessions"
```sql
SELECT * FROM sessions WHERE ended_at IS NULL;
```

### "Show me all messages for a session"
```sql
SELECT * FROM messages WHERE session_id = 'session_123' ORDER BY created_at;
```

### "Show me sentiment history for a session (for graph)"
```sql
SELECT measured_at, happiness_score, sentiment_score, voice_metadata
FROM sentiment_history 
WHERE session_id = 'session_123' 
ORDER BY measured_at ASC;
```

### "Show me the latest status check for a session"
```sql
SELECT * FROM status_snapshots WHERE session_id = 'session_123' ORDER BY created_at DESC LIMIT 1;
```

### "Show me all tickets for a user"
```sql
SELECT * FROM tickets WHERE user_id = 'abc-123' ORDER BY created_at DESC;
```

### "Show me all events for a session"
```sql
SELECT * FROM events WHERE session_id = 'session_123' ORDER BY created_at;
```

---

## What's NOT in the Database

### ❌ Service Plans
- **Why**: Plans are just displayed on the website (not used in support flow)
- **Alternative**: Hardcode in your app or use a config file

### ❌ Device Catalog
- **Why**: Device catalog is just for display (not used in support flow)
- **Alternative**: Hardcode in your app or use a config file

### ❌ FAQ Articles
- **Why**: FAQs are static content (not used in support flow)
- **Alternative**: Hardcode in your app or use a config file

### ❌ Notifications
- **Why**: Notifications are sent via external service (Twilio/SendGrid)
- **Alternative**: Add table later if you need to track delivery status

### ❌ Analytics Tables
- **Why**: Analytics can be calculated from existing tables
- **Alternative**: Add table later if queries become too slow

---

## Summary

**8 tables total**:
1. `users` - Who is asking for help
2. `sessions` - Each voice conversation
3. `messages` - Transcribed text from voice (via Vapi) + AI responses (with sentiment scores from voice analysis)
4. `sentiment_history` - User happiness over time during voice conversation (from voice analysis) ⭐
5. `status_snapshots` - Network health checks
6. `playbook_runs` - Troubleshooting steps
7. `tickets` - Support escalations
8. `events` - Audit trail

**That's it!** Simple, focused, and easy to understand.

**Voice-First Architecture**:
- 🎤 Users **speak** to AI through Vapi (Voice AI platform)
- 📝 Voice is transcribed to text (stored in `messages`)
- 😊 Sentiment extracted from **voice analysis** (tone, emotion, stress) via Vapi
- 📊 Graph shows emotional journey throughout voice conversation
- 🔒 Privacy-first (no raw audio stored, only transcripts and scores)

## Creating Sentiment Graphs (Voice-First)

To create a graph showing how user happiness changed during the **voice conversation**:

1. **Query sentiment history** (from voice analysis):
   ```sql
   SELECT 
       measured_at, 
       happiness_score, 
       sentiment_score,
       voice_metadata->>'tone' as tone,
       voice_metadata->>'emotion' as emotion,
       voice_metadata->>'stress_level' as stress_level
   FROM sentiment_history 
   WHERE session_id = 'session_123' 
   ORDER BY measured_at ASC;
   ```

2. **Display as a line chart** showing happiness progression over time throughout the voice call

3. **See `SENTIMENT_GRAPH_GUIDE.md`** for detailed examples and code!
4. **See `VOICE_SENTIMENT_TRACKING.md`** for Vapi integration details!

**Key Differences**:
- `sentiment_history` = User sentiment/happiness from **voice analysis** during conversation (for graphs!)
- `sentiment_history.voice_metadata` = Voice-specific data (tone, emotion, stress_level) from Vapi
- `status_snapshots.network_happiness_score` = Network health (not user sentiment)
- Sentiment comes from **voice analysis** (tone, emotion, stress), not just text!

**Voice-First Architecture**:
- Users **speak** to AI through Vapi (not type)
- Voice is transcribed to text (stored in `messages.content`)
- Sentiment is extracted from **voice analysis** (tone, emotion, stress) via Vapi
- Each voice interaction creates a `sentiment_history` record
- Graph shows emotional journey throughout the **voice conversation**

