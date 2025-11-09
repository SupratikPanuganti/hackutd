#!/usr/bin/env python3
"""Check if camera 0 is accessible"""
import cv2
import platform
import sys

camera_index = 0

print(f"Attempting to open camera {camera_index}...")
sys.stdout.flush()

# Use appropriate backend
if platform.system() == "Windows":
    cap = cv2.VideoCapture(camera_index, cv2.CAP_DSHOW)
elif platform.system() == "Darwin":
    cap = cv2.VideoCapture(camera_index, cv2.CAP_AVFOUNDATION)
else:
    cap = cv2.VideoCapture(camera_index)

if not cap.isOpened():
    print(f"❌ FAILED: Cannot open camera {camera_index}")
    sys.exit(1)

# Try to read a frame
ret, frame = cap.read()
if not ret or frame is None:
    print(f"❌ FAILED: Camera {camera_index} opened but cannot read frames")
    cap.release()
    sys.exit(1)

print(f"✅ SUCCESS: Camera {camera_index} is accessible")
print(f"   Frame shape: {frame.shape}")
print(f"   Frame is black: {frame.max() == 0}")

cap.release()
