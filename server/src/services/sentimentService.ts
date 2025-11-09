import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface SentimentData {
  value: number; // -1 (sad), 0 (neutral), 1 (happy)
  timestamp: number;
  confidence?: number;
}

export class SentimentService extends EventEmitter {
  private pythonProcess: ChildProcess | null = null;
  private isRunning: boolean = false;
  private lastSentiment: SentimentData | null = null;
  private sentimentHistory: SentimentData[] = [];
  private readonly MAX_HISTORY = 100;

  constructor() {
    super();
  }

  /**
   * Start the Python sentiment analysis script
   */
  start(cameraIndex: number = 0): void {  // Default to camera 0 (front camera)
    if (this.isRunning) {
      console.log('Sentiment service already running');
      return;
    }

    // Get absolute path to script (server/src/services -> root/scripts)
    const scriptPath = path.join(__dirname, '..', '..', '..', 'scripts', 'cam.py');

    // FORCE camera index to 0 (front camera)
    const forcedCameraIndex = 0;

    console.log('Starting sentiment analysis service...');
    console.log(`[SENTIMENT DEBUG] Requested Camera Index: ${cameraIndex}`);
    console.log(`[SENTIMENT DEBUG] FORCED Camera Index: ${forcedCameraIndex}`);
    console.log(`[SENTIMENT DEBUG] Script Path: ${scriptPath}`);
    console.log(`[SENTIMENT DEBUG] NIM_API_KEY configured: ${process.env.NIM_API_KEY ? 'YES' : 'NO'}`);

    // Spawn Python process
    this.pythonProcess = spawn('python', [scriptPath], {
      env: {
        ...process.env,
        CAMERA_INDEX: forcedCameraIndex.toString(),  // HARDCODED TO 0
        HEADLESS: 'true',
        DEBUG_WINDOW: 'false',  // Set to 'true' to show debug window
        NIM_API_KEY: process.env.NIM_API_KEY || process.env.NVIDIA_API_KEY || '',
        OPENAI_KEY: process.env.OPENAI_KEY || process.env.OPENAI_API_KEY || '',
        USE_OPENAI: process.env.USE_OPENAI || 'false',  // Set to 'true' to use OpenAI, 'false' for NVIDIA
      },
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: process.cwd(),
    });

    console.log('[SENTIMENT] Python process spawned, waiting for initialization...');
    this.isRunning = true;

    // Handle stdout (sentiment values)
    this.pythonProcess.stdout?.on('data', (data: Buffer) => {
      const output = data.toString().trim();
      console.log(`[SENTIMENT DEBUG] Raw stdout: "${output}"`);

      // Look for integer values (-1, 0, 1)
      const match = output.match(/^(-?\d+)$/);
      if (match) {
        const value = parseInt(match[1], 10);
        console.log(`[SENTIMENT DEBUG] Parsed value: ${value}`);

        // Validate sentiment value
        if (value >= -1 && value <= 1) {
          const sentimentData: SentimentData = {
            value,
            timestamp: Date.now(),
          };

          this.lastSentiment = sentimentData;
          this.sentimentHistory.push(sentimentData);

          // Trim history
          if (this.sentimentHistory.length > this.MAX_HISTORY) {
            this.sentimentHistory.shift();
          }

          // Emit sentiment update
          this.emit('sentiment', sentimentData);

          console.log(`[SENTIMENT] ✓ ${value} (${this.getSentimentLabel(value)}) - Timestamp: ${sentimentData.timestamp} - History: ${this.sentimentHistory.length}`);
        } else {
          console.log(`[SENTIMENT DEBUG] Value ${value} out of range`);
        }
      } else {
        console.log(`[SENTIMENT DEBUG] No match found in output`);
      }
    });

    // Handle stderr (logs and errors)
    this.pythonProcess.stderr?.on('data', (data: Buffer) => {
      const message = data.toString().trim();
      // Log to console but don't emit as error (Python uses stderr for debug logging)
      console.log('Python script output:', message);
    });

    // Handle process exit
    this.pythonProcess.on('exit', (code, signal) => {
      console.log(`Sentiment service exited with code ${code}, signal ${signal}`);
      this.isRunning = false;
      this.pythonProcess = null;
      this.emit('stopped', { code, signal });
    });

    // Handle process errors
    this.pythonProcess.on('error', (err) => {
      console.error('Failed to start sentiment service:', err);
      this.isRunning = false;
      this.emit('error', err);
    });

    this.emit('started');
  }

  /**
   * Stop the sentiment analysis service
   */
  stop(): void {
    if (!this.pythonProcess || !this.isRunning) {
      console.log('Sentiment service not running');
      return;
    }

    console.log('Stopping sentiment analysis service...');
    this.pythonProcess.kill('SIGTERM');

    // Force kill after 3 seconds if not stopped
    setTimeout(() => {
      if (this.pythonProcess && this.isRunning) {
        console.log('Force killing sentiment service...');
        this.pythonProcess.kill('SIGKILL');
      }
    }, 3000);
  }

  /**
   * Get the current sentiment
   */
  getCurrentSentiment(): SentimentData | null {
    return this.lastSentiment;
  }

  /**
   * Get sentiment history
   */
  getHistory(limit: number = 20): SentimentData[] {
    return this.sentimentHistory.slice(-limit);
  }

  /**
   * Get average sentiment over time window
   */
  getAverageSentiment(windowMs: number = 30000): number {
    const now = Date.now();
    const recentSentiments = this.sentimentHistory.filter(
      (s) => now - s.timestamp < windowMs
    );

    if (recentSentiments.length === 0) return 0;

    const sum = recentSentiments.reduce((acc, s) => acc + s.value, 0);
    return sum / recentSentiments.length;
  }

  /**
   * Check if service is running
   */
  getIsRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Convert sentiment value to label
   */
  private getSentimentLabel(value: number): string {
    if (value > 0) return 'Happy';
    if (value < 0) return 'Frustrated';
    return 'Neutral';
  }

  /**
   * Get sentiment trend (improving/declining/stable)
   */
  getTrend(windowMs: number = 60000): 'improving' | 'declining' | 'stable' {
    const now = Date.now();
    const recentSentiments = this.sentimentHistory.filter(
      (s) => now - s.timestamp < windowMs
    );

    if (recentSentiments.length < 3) return 'stable';

    const midpoint = Math.floor(recentSentiments.length / 2);
    const firstHalf = recentSentiments.slice(0, midpoint);
    const secondHalf = recentSentiments.slice(midpoint);

    const firstAvg = firstHalf.reduce((acc, s) => acc + s.value, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((acc, s) => acc + s.value, 0) / secondHalf.length;

    const diff = secondAvg - firstAvg;

    if (diff > 0.2) return 'improving';
    if (diff < -0.2) return 'declining';
    return 'stable';
  }
}
