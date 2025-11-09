import Vapi from "@vapi-ai/web";

const DEFAULT_VAPI_PUBLIC_KEY = "pk_local_dev_testing";
const DEFAULT_VAPI_ASSISTANT_ID = "asst_local_dev_testing";
const DEFAULT_VAPI_API_URL = "https://api.vapi.ai";

const ENV_VAPI_PUBLIC_KEY = import.meta.env.VITE_VAPI_PUBLIC_KEY;
const ENV_VAPI_ASSISTANT_ID = import.meta.env.VITE_VAPI_ASSISTANT_ID;

const VAPI_PUBLIC_KEY = ENV_VAPI_PUBLIC_KEY ?? DEFAULT_VAPI_PUBLIC_KEY;
const VAPI_ASSISTANT_ID = ENV_VAPI_ASSISTANT_ID ?? DEFAULT_VAPI_ASSISTANT_ID;
const VAPI_API_URL = import.meta.env.VITE_VAPI_API_URL ?? DEFAULT_VAPI_API_URL;

let client: Vapi | null = null;
const debugEnabled = true;

const createSafeReplacer = () => {
  const seen = new WeakSet();
  return (_key: string, value: unknown) => {
    if (value instanceof Error) {
      return {
        name: value.name,
        message: value.message,
        stack: value.stack,
      };
    }
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return "[Circular]";
      }
      seen.add(value);
      if (typeof MediaStreamTrack !== "undefined" && value instanceof MediaStreamTrack) {
        return {
          id: value.id,
          kind: value.kind,
          muted: value.muted,
          enabled: value.enabled,
          readyState: value.readyState,
          label: value.label,
        };
      }
    }
    return value;
  };
};

const formatDebugArg = (arg: unknown) => {
  if (arg instanceof Error) {
    return `${arg.name}: ${arg.message}${arg.stack ? `\n${arg.stack}` : ""}`;
  }

  if (
    typeof arg === "string" ||
    typeof arg === "number" ||
    typeof arg === "boolean" ||
    arg === null ||
    arg === undefined
  ) {
    return String(arg);
  }

  try {
    return JSON.stringify(arg, createSafeReplacer());
  } catch (error) {
    return `Unserializable value: ${String(error)}`;
  }
};

const sendDebugMessage = (level: "debug" | "warn" | "error", args: unknown[]) => {
  if (typeof window === "undefined") return;

  const payload = {
    level,
    timestamp: new Date().toISOString(),
    messages: args.map(formatDebugArg),
  };

  try {
    const body = JSON.stringify(payload);

    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const sent = navigator.sendBeacon(
        "/__vapi-debug",
        new Blob([body], { type: "application/json" }),
      );
      if (sent) {
        return;
      }
    }

    if (typeof fetch !== "undefined") {
      fetch("/__vapi-debug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {
        // Swallow errors in debug transport
      });
    }
  } catch {
    // Ignore logging transport errors
  }
};

const debugLog = (...args: unknown[]) => {
  if (!debugEnabled) return;
  console.debug("[VapiClient]", ...args);
  sendDebugMessage("debug", args);
};

const debugWarn = (...args: unknown[]) => {
  if (!debugEnabled) return;
  console.warn("[VapiClient]", ...args);
  sendDebugMessage("warn", args);
};

const debugError = (...args: unknown[]) => {
  if (!debugEnabled) return;
  console.error("[VapiClient]", ...args);
  sendDebugMessage("error", args);
};

export const logVapiDebug = (...args: unknown[]) => {
  debugLog(...args);
};

export const logVapiWarn = (...args: unknown[]) => {
  debugWarn(...args);
};

export const logVapiError = (...args: unknown[]) => {
  debugError(...args);
};

let debugListenersAttached = false;

const attachDebugListeners = (instance: Vapi) => {
  if (!debugEnabled || debugListenersAttached) {
    return;
  }

  debugListenersAttached = true;
  debugLog("Attaching debug listeners");

  const simpleEvents: Array<keyof Vapi> = [
    "call-start-success",
    "call-start-failed",
    "call-start",
    "call-end",
    "speech-start",
    "speech-end",
    "camera-error",
    "network-quality-change",
    "network-connection",
  ] as unknown as Array<keyof Vapi>;

  simpleEvents.forEach((eventName) => {
    instance.on(eventName as never, (payload: unknown) => {
      debugLog(`Event: ${String(eventName)}`, payload);
    });
  });

  let volumeLogCount = 0;
  instance.on("volume-level", (volume) => {
    if (volumeLogCount++ % 10 === 0) {
      debugLog("Event: volume-level", volume);
    }
  });

  instance.on("message", (message) => {
    debugLog("Event: message", message);
  });

  instance.on("video", (track) => {
    debugLog("Event: video track received", track?.kind, track?.readyState);
  });

  instance.on("error", (error) => {
    debugError("Event: error", error);
  });

  // Listen for when assistant starts speaking
  instance.on("speech-start", () => {
    debugLog("🎤 Assistant started speaking");
  });

  instance.on("speech-end", () => {
    debugLog("🎤 Assistant stopped speaking");
  });
};

const logAudioElements = (context: string) => {
  if (!debugEnabled) return;
  const players = Array.from(document.querySelectorAll<HTMLAudioElement>("audio[data-participant-id]"));
  debugLog(context, `found ${players.length} audio elements`, players.map((player) => ({
    id: player.dataset.participantId,
    muted: player.muted,
    autoplay: player.autoplay,
    readyState: player.readyState,
    paused: player.paused,
    volume: player.volume,
  })));
};

const getPublicKey = () => {
  return VAPI_PUBLIC_KEY;
};

const getAssistantId = () => {
  return VAPI_ASSISTANT_ID;
};

export const getVapiClient = () => {
  if (!client) {
    const baseUrl = typeof window === "undefined" ? undefined : VAPI_API_URL;
    client = new Vapi(getPublicKey(), baseUrl || undefined);
    attachDebugListeners(client);
  }
  return client;
};

export const isVoiceIntegrationConfigured = () => {
  // Only return true if we have REAL credentials from environment variables
  // NOT the default test values
  return Boolean(
    ENV_VAPI_PUBLIC_KEY &&
    ENV_VAPI_ASSISTANT_ID &&
    ENV_VAPI_PUBLIC_KEY !== DEFAULT_VAPI_PUBLIC_KEY &&
    ENV_VAPI_ASSISTANT_ID !== DEFAULT_VAPI_ASSISTANT_ID
  );
};

export const startVoiceCall = async (
  introPrompt?: string,
  contextPayload?: string,
) => {
  if (!isVoiceIntegrationConfigured()) {
    logVapiWarn("Voice integration not configured. Skipping startVoiceCall.");
    return null;
  }

  console.log('🚀 [START VOICE CALL]', {
    hasIntroPrompt: !!introPrompt,
    introPromptText: introPrompt,
    hasContext: !!contextPayload,
    contextLength: contextPayload?.length
  });

  const vapi = getVapiClient();
  const assistantId = getAssistantId();

  const waitForCallStartSuccess = new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error("Timed out waiting for voice call to start."));
    }, 10000);

    const cleanup = () => {
      clearTimeout(timeout);
      vapi.removeListener("call-start-success", onSuccess);
      vapi.removeListener("call-start-failed", onFailure);
    };

    const onSuccess = () => {
      cleanup();
      resolve();
    };

    const onFailure = (event: { error?: string }) => {
      cleanup();
      reject(new Error(event?.error ?? "Failed to start voice call."));
    };

    vapi.once("call-start-success", onSuccess);
    vapi.once("call-start-failed", onFailure);
  });

  const waitForAssistantPlayable = new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error("Timed out waiting for assistant audio to become available."));
    }, 5000);

    const cleanup = () => {
      clearTimeout(timeout);
      vapi.removeListener("call-start", onStart);
      vapi.removeListener("call-start-failed", onFailure);
    };

    const onStart = () => {
      cleanup();
      resolve();
    };

    const onFailure = (event: { error?: string }) => {
      cleanup();
      reject(new Error(event?.error ?? "Assistant failed before audio became available."));
    };

    vapi.once("call-start", onStart);
    vapi.once("call-start-failed", onFailure);
  });

  const assistantOverrides: Record<string, unknown> = {
    firstMessageMode: "assistant-speaks-first",
    // Disable camera/video to avoid conflicts with sentiment analysis
    recordingEnabled: false,
  };

  if (introPrompt) {
    assistantOverrides.firstMessage = introPrompt;
  }

  console.log('📝 [ASSISTANT OVERRIDES]', {
    firstMessageMode: assistantOverrides.firstMessageMode,
    firstMessage: assistantOverrides.firstMessage,
    recordingEnabled: assistantOverrides.recordingEnabled
  });

  // Request ONLY microphone, NOT camera
  try {
    // Explicitly request only audio to avoid camera conflicts
    await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
  } catch (err) {
    debugError("Microphone permission error:", err);
    throw new Error("Microphone permission denied. Please allow microphone access.");
  }

  // Start call with audio only (no video)
  const call = await vapi.start(assistantId, assistantOverrides);
  console.log('📞 [VAPI CALL STARTED]', { callId: call?.id });
  debugLog("startVoiceCall invoked - AUDIO ONLY", {
    assistantId,
    introPromptLength: introPrompt?.length ?? 0,
    hasContext: Boolean(contextPayload),
    overridesMessage: Boolean(introPrompt),
  });

  if (!call) {
    throw new Error("Failed to start Vapi voice call.");
  }

  await waitForCallStartSuccess;

  await waitForAssistantPlayable.catch((error) => {
    debugWarn("Proceeding without call-start event", error);
  });

  // Wait a moment for audio elements to be ready
  await new Promise(resolve => setTimeout(resolve, 300));

  try {
    vapi.setMuted(false);
    // Force output to default device in case browser selected a null sink.
    await vapi.setOutputDeviceAsync({ speakerId: "default" });
    debugLog("Audio output set to default speaker");
  } catch (error) {
    debugWarn("Unable to enforce audio output device", error);
  }

  logAudioElements("After audio setup");

  // VAPI will automatically speak the first message because we set:
  // - firstMessageMode: "assistant-speaks-first"
  // - firstMessage: introPrompt
  // We DON'T send context yet to avoid interfering with the greeting

  console.log('⏳ [WAITING] For assistant greeting to complete...');

  // Wait for the greeting to fully complete (3 seconds should be enough)
  await new Promise(resolve => setTimeout(resolve, 3000));

  console.log('✅ [GREETING DONE] Now sending context payload');

  // Now send context payload AFTER greeting has completed
  if (contextPayload) {
    vapi.send({
      type: "add-message",
      message: {
        role: "system",
        content: contextPayload,
      },
    });
    console.log('📤 [CONTEXT SENT] Payload delivered to VAPI');
  }

  return call;
};

export const stopVoiceCall = async () => {
  if (!client) return;
  await client.stop();
};

export const endVoiceCall = () => {
  if (!client) return;
  client.end();
};

export const resetVoiceClient = () => {
  if (!client) return;
  client.removeAllListeners();
  client = null;
  debugListenersAttached = false;
};

