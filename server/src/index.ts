import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import http from 'http';
import dotenv from 'dotenv';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
import { SentimentService, SentimentData } from './services/sentimentService.js';
import { DecisionEngine, MultimodalContext } from './services/decisionEngine.js';
import { telegramService, TelegramNotification } from './services/telegramService.js';
import { AutonomousAgent, AgenticContext } from './services/autonomousAgent.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try to load .env from parent directory first, then current directory
const envConfig = dotenv.config({ path: path.resolve(__dirname, '../../.env') }) || dotenv.config();

if (envConfig.error) {
  console.warn('[ENV DEBUG] Failed to load .env file:', envConfig.error.message);
} else {
  const parsedKeys = Object.keys(envConfig.parsed ?? {});
  console.log('[ENV DEBUG] Loaded .env keys:', parsedKeys.length ? parsedKeys : 'none');
}

const envKeyStatus = (key: string) => {
  const value = process.env[key];
  if (value === undefined) return 'missing';
  if (value.trim().length === 0) return 'empty string';
  if (value.length <= 8) return `set (${value})`;
  return `set (${value.slice(0, 4)}…${value.slice(-4)} | len=${value.length})`;
};

console.log('[ENV DEBUG] Process env snapshot:', {
  BACKEND_PORT: envKeyStatus('BACKEND_PORT'),
  DECISION_ENGINE: envKeyStatus('DECISION_ENGINE'),
  SUPABASE_URL: envKeyStatus('SUPABASE_URL'),
  SUPABASE_ANON_KEY: envKeyStatus('SUPABASE_ANON_KEY'),
  VAPI_PUBLIC_KEY: envKeyStatus('VAPI_PUBLIC_KEY'),
});

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ server, path: '/sentiment' });

// Initialize sentiment service
const sentimentService = new SentimentService();

// Initialize decision engine
const decisionEngine = new DecisionEngine(
  (process.env.DECISION_ENGINE as 'openai' | 'nvidia') || 'nvidia'
);

// Initialize autonomous agent (Nemotron → OpenAI → Rules fallback)
const autonomousAgent = new AutonomousAgent();

// Store connected WebSocket clients
const clients = new Set<WebSocket>();

// WebSocket connection handler
wss.on('connection', (ws: WebSocket) => {
  console.log('Client connected to sentiment stream');
  clients.add(ws);

  // Send current sentiment immediately
  const current = sentimentService.getCurrentSentiment();
  if (current) {
    ws.send(
      JSON.stringify({
        type: 'sentiment',
        data: current,
      })
    );
  }

  // Send service status
  ws.send(
    JSON.stringify({
      type: 'status',
      data: {
        running: sentimentService.getIsRunning(),
      },
    })
  );

  ws.on('message', (message: string) => {
    try {
      const data = JSON.parse(message.toString());

      // Handle start/stop commands
      if (data.type === 'start') {
        const cameraIndex = data.cameraIndex ?? 0;  // Default to camera 0 (front camera)
        sentimentService.start(cameraIndex);

        // Send status update immediately to the requesting client
        ws.send(
          JSON.stringify({
            type: 'status',
            data: { running: true },
          })
        );
      } else if (data.type === 'stop') {
        sentimentService.stop();

        // Send status update immediately
        ws.send(
          JSON.stringify({
            type: 'status',
            data: { running: false },
          })
        );
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected from sentiment stream');
    clients.delete(ws);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clients.delete(ws);
  });
});

// Broadcast sentiment updates to all connected clients
sentimentService.on('sentiment', (data: SentimentData) => {
  const message = JSON.stringify({
    type: 'sentiment',
    data,
  });

  console.log(`[WEBSOCKET] Broadcasting sentiment to ${clients.size} clients:`, data);

  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
});

// Broadcast service status changes
sentimentService.on('started', () => {
  const message = JSON.stringify({
    type: 'status',
    data: { running: true },
  });

  console.log(`[WEBSOCKET] Broadcasting service STARTED status to ${clients.size} clients`);

  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
});

sentimentService.on('stopped', () => {
  const message = JSON.stringify({
    type: 'status',
    data: { running: false },
  });

  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
});

// REST API Endpoints

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    sentiment: {
      running: sentimentService.getIsRunning(),
      current: sentimentService.getCurrentSentiment(),
    },
  });
});

// Get current sentiment
app.get('/api/sentiment/current', (req, res) => {
  const current = sentimentService.getCurrentSentiment();
  res.json({
    sentiment: current,
    running: sentimentService.getIsRunning(),
  });
});

// Get sentiment history
app.get('/api/sentiment/history', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 20;
  const history = sentimentService.getHistory(limit);
  res.json({ history });
});

// Get sentiment analytics
app.get('/api/sentiment/analytics', (req, res) => {
  const windowMs = parseInt(req.query.window as string) || 30000;
  const average = sentimentService.getAverageSentiment(windowMs);
  const trend = sentimentService.getTrend(windowMs);
  const current = sentimentService.getCurrentSentiment();

  res.json({
    current,
    average,
    trend,
    windowMs,
    running: sentimentService.getIsRunning(),
  });
});

// Start sentiment service
app.post('/api/sentiment/start', (req, res) => {
  const { cameraIndex } = req.body;

  if (sentimentService.getIsRunning()) {
    return res.status(400).json({
      error: 'Sentiment service already running',
    });
  }

  sentimentService.start(cameraIndex ?? 0);  // Default to camera 0 (front camera)

  res.json({
    message: 'Sentiment service started',
    running: true,
  });
});

// Stop sentiment service
app.post('/api/sentiment/stop', (req, res) => {
  if (!sentimentService.getIsRunning()) {
    return res.status(400).json({
      error: 'Sentiment service not running',
    });
  }

  sentimentService.stop();

  res.json({
    message: 'Sentiment service stopped',
    running: false,
  });
});

// Action execution endpoint (for voice commands)
app.post('/api/actions/execute', (req, res) => {
  const { action, params } = req.body;

  console.log('Executing action:', action, params);

  // This will be expanded to handle various actions
  // For now, just acknowledge
  res.json({
    success: true,
    action,
    params,
    message: 'Action received',
  });
});

// Decision engine endpoint
app.post('/api/decision/analyze', async (req, res) => {
  try {
    const context: MultimodalContext = req.body;

    console.log('[DecisionEngine] Analyzing context:', {
      page: context.currentPage,
      sentiment: context.currentSentiment,
      trend: context.sentimentTrend,
      userInput: context.userInput,
    });

    // Get current sentiment from service
    const currentSentiment = sentimentService.getCurrentSentiment();
    if (currentSentiment && !context.currentSentiment) {
      context.currentSentiment = currentSentiment.value;
      context.sentimentLabel = currentSentiment.value > 0 ? 'Happy' : currentSentiment.value < 0 ? 'Frustrated' : 'Neutral';
    }

    // Add sentiment history
    if (!context.sentimentHistory) {
      context.sentimentHistory = sentimentService.getHistory(10);
    }

    // Add sentiment trend
    if (!context.sentimentTrend) {
      context.sentimentTrend = sentimentService.getTrend();
    }

    // Get decision
    const decision = await decisionEngine.decide(context);

    // Get response style
    const responseStyle = decisionEngine.getResponseStyle(context);

    // Check if should change approach
    const shouldChange = decisionEngine.shouldChangeApproach(context);

    res.json({
      decision,
      responseStyle,
      shouldChangeApproach: shouldChange,
      context: {
        sentiment: context.currentSentiment,
        trend: context.sentimentTrend,
        page: context.currentPage,
      },
    });
  } catch (error) {
    console.error('[DecisionEngine] Error:', error);
    res.status(500).json({
      error: 'Decision analysis failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Autonomous agent endpoint - Nemotron-powered fully autonomous flow
app.post('/api/agent/decide', async (req, res) => {
  try {
    const context: AgenticContext = req.body;

    console.log('[AutonomousAgent] Decision request:', {
      page: context.currentPage,
      sentiment: context.currentSentiment,
      trend: context.sentimentTrend,
      lastInput: context.userLastInput?.substring(0, 50),
    });

    // Get current sentiment from service if not provided
    const currentSentiment = sentimentService.getCurrentSentiment();
    if (currentSentiment && !context.currentSentiment) {
      context.currentSentiment = currentSentiment.value;
      context.sentimentLabel = currentSentiment.value > 0 ? 'Happy' : currentSentiment.value < 0 ? 'Frustrated' : 'Neutral';
    }

    // Get sentiment trend if not provided
    if (!context.sentimentTrend) {
      context.sentimentTrend = sentimentService.getTrend();
    }

    // Get autonomous decision from Nemotron
    const decision = await autonomousAgent.decide(context);

    // Check if agent should take control
    const shouldTakeControl = autonomousAgent.shouldTakeAutonomousControl(context);

    console.log('[AutonomousAgent] Decision made:', {
      primaryAction: decision.primaryAction.type,
      target: decision.primaryAction.target,
      shouldTakeControl,
      estimatedSteps: decision.estimatedSteps,
    });

    res.json({
      decision,
      shouldTakeControl,
      context: {
        sentiment: context.currentSentiment,
        trend: context.sentimentTrend,
        page: context.currentPage,
      },
    });
  } catch (error) {
    console.error('[AutonomousAgent] Error:', error);
    res.status(500).json({
      error: 'Autonomous decision failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Admin API Proxy - Parallel AI Extract
app.post('/api/admin/parallel-extract', async (req, res) => {
  try {
    console.log('[Admin API] Parallel AI extraction request received');
    console.log('[Admin API] Request body:', JSON.stringify(req.body, null, 2));

    const parallelResponse = await axios.post(
      'https://api.parallel.ai/v1beta/extract',
      req.body,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 't5yTGrOLvVTh22GCh8PPmwY0PUSOrt8wjPnzq3V9',
          'parallel-beta': 'search-extract-2025-10-10'
        }
      }
    );

    console.log('[Admin API] Parallel AI response received:', parallelResponse.status);
    res.json(parallelResponse.data);
  } catch (error) {
    console.error('[Admin API] Parallel AI error:', error);
    if (axios.isAxiosError(error)) {
      res.status(error.response?.status || 500).json({
        error: 'Parallel AI request failed',
        message: error.message,
        details: error.response?.data
      });
    } else {
      res.status(500).json({
        error: 'Parallel AI request failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
});

// Telegram Notification endpoint - Send tower status notification
app.post('/api/notifications/telegram/tower-status', async (req, res) => {
  try {
    const { chatId, towerId, towerRegion, status, userLocation } = req.body;

    if (!chatId) {
      return res.status(400).json({
        error: 'Chat ID is required',
      });
    }

    if (!towerId || !towerRegion || !status || !userLocation) {
      return res.status(400).json({
        error: 'Missing required fields: towerId, towerRegion, status, userLocation',
      });
    }

    if (status !== 'degraded' && status !== 'ok') {
      return res.status(400).json({
        error: 'Status must be "degraded" or "ok"',
      });
    }

    const notification: TelegramNotification = {
      towerId,
      towerRegion,
      status,
      userLocation,
    };

    let result;
    if (status === 'degraded') {
      result = await telegramService.sendTowerDegradedNotification(chatId, notification);
    } else {
      result = await telegramService.sendTowerRestoredNotification(chatId, notification);
    }

    if (result.success) {
      res.json({
        success: true,
        message: 'Telegram notification sent successfully',
        messageId: result.messageId,
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to send Telegram notification',
      });
    }
  } catch (error) {
    console.error('[Telegram API] Error:', error);
    res.status(500).json({
      error: 'Failed to send Telegram notification',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Check Telegram service configuration and get bot info
app.get('/api/notifications/telegram/status', async (req, res) => {
  const botInfo = await telegramService.getBotInfo();
  res.json({
    configured: telegramService.isServiceConfigured(),
    botInfo: botInfo || null,
  });
});

// Test Telegram notification endpoint (for debugging)
app.post('/api/notifications/telegram/test', async (req, res) => {
  try {
    const { chatId } = req.body;
    const testChatId = chatId || '5367833555'; // Default to user's chat ID
    
    console.log('[Telegram Test] Sending test message to:', testChatId);
    
    const result = await telegramService.sendMessage(
      testChatId,
      '🧪 <b>Test Message</b>\n\nThis is a test message from the Tower Status system. If you received this, Telegram notifications are working!'
    );
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Test message sent successfully',
        messageId: result.messageId,
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to send test message',
      });
    }
  } catch (error) {
    console.error('[Telegram Test] Error:', error);
    res.status(500).json({
      error: 'Failed to send test message',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Admin API Proxy - Gemini AI
app.post('/api/admin/gemini-analyze', async (req, res) => {
  try {
    console.log('[Admin API] Gemini AI analysis request received');

    const geminiApiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

    if (!geminiApiKey) {
      return res.status(500).json({
        error: 'Gemini API key not configured',
        message: 'GEMINI_API_KEY not found in environment variables'
      });
    }

    console.log('[Admin API] Using Gemini API key:', geminiApiKey.substring(0, 10) + '...');

    const geminiResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`,
      req.body,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('[Admin API] Gemini AI response received:', geminiResponse.status);
    res.json(geminiResponse.data);
  } catch (error) {
    console.error('[Admin API] Gemini AI error:', error);
    if (axios.isAxiosError(error)) {
      res.status(error.response?.status || 500).json({
        error: 'Gemini AI request failed',
        message: error.message,
        details: error.response?.data
      });
    } else {
      res.status(500).json({
        error: 'Gemini AI request failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
});

// Start server
server.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log(`WebSocket sentiment stream: ws://localhost:${PORT}/sentiment`);
  console.log('\nAvailable endpoints:');
  console.log(`  GET  /health`);
  console.log(`  GET  /api/sentiment/current`);
  console.log(`  GET  /api/sentiment/history`);
  console.log(`  GET  /api/sentiment/analytics`);
  console.log(`  POST /api/sentiment/start`);
  console.log(`  POST /api/sentiment/stop`);
  console.log(`  POST /api/actions/execute`);
  console.log(`  POST /api/decision/analyze`);
  console.log(`  POST /api/notifications/telegram/tower-status`);
  console.log(`  GET  /api/notifications/telegram/status`);
  console.log(`  POST /api/notifications/telegram/test`);
  console.log(`  POST /api/agent/decide`);
  console.log(`  POST /api/admin/parallel-extract`);
  console.log(`  POST /api/admin/gemini-analyze`);
  console.log('\nReady to accept connections!');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  sentimentService.stop();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  sentimentService.stop();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
