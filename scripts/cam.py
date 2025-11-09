#!/usr/bin/env python3
# emotion_cam_simple_vila_auto_smooth.py
# Smooth preview (low-latency) + 5s rolling average via VILA.

import cv2
import base64
import requests
import json
import re
import time
import threading
from pathlib import Path

# ================== CONFIG ==================
CAMERA_INDEX    = 1
NIM_API_KEY     = ""
VILA_URL        = "https://ai.api.nvidia.com/v1/vlm/nvidia/vila"

WINDOW_SECONDS  = 5.0       # average over this window
SAMPLE_PERIOD   = 0.9       # classify at most once per ~0.9s
DETECT_PERIOD   = 0.20      # run face detection ~5x/sec (not every frame)
JPEG_QUALITY    = 85
FACE_MARGIN     = 0.20
FACE_CONF       = 0.50
TIMEOUT_SEC     = 12

# Preview tuning (lower = smoother UI)
PREVIEW_WIDTH   = 960       # try 960x540 or 640x360 for max smoothness
PREVIEW_HEIGHT  = 540
CAPTURE_WIDTH   = 1280      # native capture request; driver can ignore
CAPTURE_HEIGHT  = 720

# Face detection speedups
DETECT_SCALE    = 0.5       # run detector on a downscaled frame, map bbox back
# ==========================================================

BASE_DIR = Path(__file__).resolve().parent
PROTOTXT = BASE_DIR / "deploy.prototxt"
CAFFE_MODEL = BASE_DIR / "res10_300x300_ssd_iter_140000.caffemodel"
PROTOTXT_URL = "https://raw.githubusercontent.com/opencv/opencv/master/samples/dnn/face_detector/deploy.prototxt"
CAFFE_MODEL_URL = "https://github.com/opencv/opencv_3rdparty/raw/dnn_samples_face_detector_20170830/res10_300x300_ssd_iter_140000.caffemodel"

# ---------------- Utils ----------------
def download_if_needed(path, url):
    if not path.exists():
        path.parent.mkdir(parents=True, exist_ok=True)
        from urllib.request import urlretrieve
        print(f"Downloading {path.name}...")
        urlretrieve(url, path)

def encode_image_b64(img_bgr, quality=JPEG_QUALITY):
    ok, buf = cv2.imencode(".jpg", img_bgr, [int(cv2.IMWRITE_JPEG_QUALITY), int(quality)])
    if not ok:
        raise RuntimeError("JPEG encode failed")
    return base64.b64encode(buf).decode("ascii")

def call_vila_single_label(image_b64):
    """
    Ask VILA for EXACTLY one of: 1 (happy), -1 (sad), 0 (neutral).
    Return int in {-1,0,1}. On parse/HTTP error → 0.
    """
    prompt = (
        "Classify this face expression. Output ONLY one integer:\n"
        "1 = HAPPY/SMILING (mouth corners up)\n"
        "-1 = SAD/FROWNING (mouth corners down / lip pressed out)\n"
        "0 = NEUTRAL (relaxed)\n"
        "Be decisive. Output only: 1, -1, or 0"
    )
    payload = {
        "model": "nvidia/vila",
        "messages": [{
            "role": "user",
            "content": [
                {"type": "text", "text": prompt},
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_b64}"}}
            ]
        }],
        "temperature": 0.0,
        "max_tokens": 8
    }
    headers = {
        "Authorization": f"Bearer {NIM_API_KEY}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

    try:
        r = requests.post(VILA_URL, headers=headers, json=payload, timeout=TIMEOUT_SEC)
        r.raise_for_status()
        data = r.json()
        content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
        if isinstance(content, list):
            text = "".join(p.get("text", "") for p in content)
        else:
            text = content or ""
        nums = re.findall(r'-?\d+', text)
        if nums:
            val = int(nums[0])
            if val in (-1, 0, 1):
                return val
        return 0
    except Exception:
        return 0

def majority_vote_bias_non_neutral(values):
    pos = values.count(1)
    neg = values.count(-1)
    if (pos + neg) == 0:
        return 0
    return 1 if pos >= neg else -1

def label_text_and_color(v):
    if v == 1:   return "HAPPY (1)",   (0, 220, 0)
    if v == -1:  return "SAD (-1)",    (0, 0, 255)
    return "NEUTRAL (0)", (160, 160, 160)

# ---------------- Face DNN ----------------
download_if_needed(PROTOTXT, PROTOTXT_URL)
download_if_needed(CAFFE_MODEL, CAFFE_MODEL_URL)
face_net = cv2.dnn.readNetFromCaffe(str(PROTOTXT), str(CAFFE_MODEL))
# Keep DNN on CPU (default). On some builds, you can try: face_net.setPreferableTarget(cv2.dnn.DNN_TARGET_OPENCL)

def detect_face_fast(frame_bgr, conf_thr=FACE_CONF, scale=DETECT_SCALE):
    """
    Downscale -> detect -> map bbox back to original coords.
    Returns (x1,y1,x2,y2) or None.
    """
    H, W = frame_bgr.shape[:2]
    if scale != 1.0:
        small = cv2.resize(frame_bgr, (int(W*scale), int(H*scale)), interpolation=cv2.INTER_LINEAR)
    else:
        small = frame_bgr

    h, w = small.shape[:2]
    blob = cv2.dnn.blobFromImage(cv2.resize(small, (300, 300)), 1.0, (300, 300), (104, 177, 123))
    face_net.setInput(blob)
    dets = face_net.forward()

    best_box, best_conf = None, 0.0
    for i in range(dets.shape[2]):
        conf = float(dets[0, 0, i, 2])
        if conf < conf_thr:
            continue
        x1, y1, x2, y2 = (dets[0, 0, i, 3:7] * [w, h, w, h]).astype(int)
        # map back
        if scale != 1.0:
            x1 = int(x1 / scale); y1 = int(y1 / scale)
            x2 = int(x2 / scale); y2 = int(y2 / scale)
        # clip
        x1, y1 = max(0, x1), max(0, y1)
        x2, y2 = min(W - 1, x2), min(H - 1, y2)
        if conf > best_conf and (x2 - x1) > 10 and (y2 - y1) > 10:
            best_conf, best_box = conf, (x1, y1, x2, y2)
    return best_box

def crop_face_with_margin(frame_bgr, box, margin_frac=FACE_MARGIN):
    x1, y1, x2, y2 = box
    w, h = x2 - x1, y2 - y1
    dx, dy = int(w * margin_frac), int(h * margin_frac)
    X1 = max(0, x1 - dx)
    Y1 = max(0, y1 - dy)
    X2 = min(frame_bgr.shape[1], x2 + dx)
    Y2 = min(frame_bgr.shape[0], y2 + dy)
    return frame_bgr[Y1:Y2, X1:X2]

# ---------------- Camera capture thread ----------------
class Camera:
    """
    Always grab the newest frame in a background thread.
    The UI and inference read the latest frame without blocking.
    """
    def __init__(self, index=0, w=None, h=None):
        self.cap = cv2.VideoCapture(index, cv2.CAP_AVFOUNDATION)
        # Request capture resolution (driver may ignore)
        if w and h:
            self.cap.set(cv2.CAP_PROP_FRAME_WIDTH,  w)
            self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, h)
        # Prefer lower FPS request to reduce load (driver may ignore)
        self.cap.set(cv2.CAP_PROP_FPS, 30)
        self.lock = threading.Lock()
        self.frame = None
        self.stopped = False
        self.t = threading.Thread(target=self._loop, daemon=True)
        if not self.cap.isOpened():
            raise RuntimeError("Cannot open camera")
        self.t.start()

    def _loop(self):
        while not self.stopped:
            ok, f = self.cap.read()
            if not ok:
                time.sleep(0.005)
                continue
            with self.lock:
                self.frame = f

    def read(self):
        with self.lock:
            f = None if self.frame is None else self.frame.copy()
        return f

    def release(self):
        self.stopped = True
        try:
            self.t.join(timeout=0.5)
        except Exception:
            pass
        self.cap.release()

# ---------------- Main ----------------
def main():
    cam = Camera(CAMERA_INDEX, w=CAPTURE_WIDTH, h=CAPTURE_HEIGHT)

    print("=== SIMPLE VILA EMOTION DETECTOR (auto, smooth) ===")
    print("Low-latency preview. 5s rolling average. ESC to quit.\n")

    window_start       = time.time()
    last_sample_time   = 0.0
    last_detect_time   = 0.0
    window_labels      = []
    last_window_final  = None
    countdown          = WINDOW_SECONDS
    last_face_box      = None   # reuse last bbox to avoid detecting every frame

    try:
        while True:
            frame = cam.read()
            if frame is None:
                time.sleep(0.005)
                continue

            # Lightweight scale for preview (resize only)
            display = cv2.resize(frame, (PREVIEW_WIDTH, PREVIEW_HEIGHT), interpolation=cv2.INTER_LINEAR)

            now = time.time()

            # Run face detection only every DETECT_PERIOD (on full-res frame but downscaled internally)
            if (now - last_detect_time) >= DETECT_PERIOD:
                last_detect_time = now
                last_face_box = detect_face_fast(frame)

            # Draw bbox if we have one (mapped to preview coords)
            if last_face_box:
                x1, y1, x2, y2 = last_face_box
                sx = PREVIEW_WIDTH  / frame.shape[1]
                sy = PREVIEW_HEIGHT / frame.shape[0]
                cv2.rectangle(display, (int(x1*sx), int(y1*sy)), (int(x2*sx), int(y2*sy)), (0, 200, 0), 2)

            # Rate-limited API sampling when face present
            if last_face_box and (now - last_sample_time) >= SAMPLE_PERIOD:
                last_sample_time = now
                face_img = crop_face_with_margin(frame, last_face_box, FACE_MARGIN)
                if face_img.size > 0:
                    try:
                        b64 = encode_image_b64(face_img, JPEG_QUALITY)
                        lab = call_vila_single_label(b64)
                        window_labels.append(lab)
                    except Exception:
                        pass

            # Window rollover -> compute final
            elapsed = now - window_start
            countdown = max(0.0, WINDOW_SECONDS - elapsed)
            if elapsed >= WINDOW_SECONDS:
                if window_labels:
                    final = majority_vote_bias_non_neutral(window_labels)
                    print(final)  # stdout for programmatic use
                    last_window_final = final
                else:
                    print(0)
                    last_window_final = 0
                window_labels.clear()
                window_start = now

            # HUD
            if last_window_final is not None:
                txt, color = label_text_and_color(last_window_final)
                cv2.putText(display, txt, (16, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.95, color, 3)
            cv2.putText(display, f"{countdown:0.1f}s", (16, 76), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255,255,255), 2)
            cv2.putText(display, f"samples:{len(window_labels)}", (16, 108), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (200,200,200), 2)

            cv2.imshow("VILA Emotion Detector (auto, smooth)", display)
            if (cv2.waitKey(1) & 0xFF) == 27:
                break
    finally:
        cam.release()
        cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
