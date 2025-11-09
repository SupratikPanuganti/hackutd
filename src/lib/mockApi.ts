// Mock API functions that simulate backend endpoints

export interface ClassifyRequest {
  text: string;
  voice_enabled: boolean;
  cam_enabled: boolean;
  zip: string;
  issue: string;
}

export interface ClassifyResponse {
  intent: string;
  sentiment: number;
  severity: string;
  entities: {
    zip: string;
    issue: string;
  };
}

export interface StatusResponse {
  region: string;
  tower_id: string | null;
  health: "ok" | "degraded";
  eta_minutes: number | null;
  happiness_score: number;
  sparkline: number[];
  source_url: string;
}

export interface PlaybookRunRequest {
  session_id: string;
  step: string;
  params: Record<string, unknown>;
}

export interface PlaybookRunResponse {
  step: string;
  result: string;
  metrics: Record<string, unknown>;
  evidence_url: string;
}

export interface TicketCreateRequest {
  session_id: string;
  summary: string;
  context: {
    zip: string;
    issue: string;
    steps_tried: string[];
    sentiment: number;
  };
}

export interface TicketCreateResponse {
  ticket_id: string;
  status: string;
  jira_url: string;
}

export interface NotifyRequest {
  session_id: string;
  channel: string;
  event: string;
}

export interface VerifyResponse {
  recovered: boolean;
  observations: Array<{
    t: string;
    happiness_score: number;
  }>;
}

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
  async classify(req: ClassifyRequest): Promise<ClassifyResponse> {
    await delay(500);
    
    const text = req.text.toLowerCase();
    let intent = "general_inquiry";
    let sentiment = 0;
    let severity = "low";

    if (text.includes("not working") || text.includes("down") || text.includes("can't")) {
      intent = "connectivity_down";
      sentiment = -0.6;
      severity = "high";
    } else if (text.includes("slow") || text.includes("poor")) {
      intent = "performance_issue";
      sentiment = -0.4;
      severity = "medium";
    }

    return {
      intent,
      sentiment,
      severity,
      entities: {
        zip: req.zip,
        issue: req.issue,
      },
    };
  },

  async getStatus(zip: string, issue: string): Promise<StatusResponse> {
    await delay(800);
    
    // Simulate outage for specific ZIP
    const hasOutage = zip === "30332";

    if (hasOutage) {
      return {
        region: "Midtown ATL",
        tower_id: "eNB-123",
        health: "degraded",
        eta_minutes: 35,
        happiness_score: 0.46,
        sparkline: [0.71, 0.69, 0.65, 0.58, 0.52, 0.46],
        source_url: `/status?zip=${zip}&tower=eNB-123`,
      };
    }

    return {
      region: "Midtown ATL",
      tower_id: null,
      health: "ok",
      eta_minutes: null,
      happiness_score: 0.72,
      sparkline: [0.70, 0.71, 0.71, 0.72, 0.72, 0.72],
      source_url: `/status?zip=${zip}`,
    };
  },

  async runPlaybookStep(req: PlaybookRunRequest): Promise<PlaybookRunResponse> {
    await delay(1000);

    const results: Record<string, unknown> = {
      toggle_airplane: {
        result: "completed",
        metrics: { duration_sec: 5 },
      },
      apn_check: {
        result: "settings_correct",
        metrics: { apn: "fast.tmobile.com" },
      },
      dns_probe: {
        result: "packet_loss_high",
        metrics: { latency_ms: 43, loss_pct: 12 },
      },
    };

    const stepResult = results[req.step] || { result: "completed", metrics: {} };

    return {
      step: req.step,
      ...stepResult,
      evidence_url: `/logs?session_id=${req.session_id}&step=${req.step}`,
    };
  },

  async createTicket(req: TicketCreateRequest): Promise<TicketCreateResponse> {
    await delay(600);

    const ticketId = `INC-${Math.floor(Math.random() * 90000) + 10000}`;

    return {
      ticket_id: ticketId,
      status: "open",
      jira_url: `/ticket/${ticketId}`,
    };
  },

  async notify(req: NotifyRequest): Promise<{ ok: boolean }> {
    await delay(300);
    return { ok: true };
  },

  async verify(sessionId: string): Promise<VerifyResponse> {
    await delay(1000);

    return {
      recovered: Math.random() > 0.3,
      observations: [
        {
          t: new Date(Date.now() - 5 * 60000).toISOString(),
          happiness_score: 0.61,
        },
        {
          t: new Date().toISOString(),
          happiness_score: 0.74,
        },
      ],
    };
  },
};
