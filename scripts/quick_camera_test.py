#!/usr/bin/env python3
"""Quick camera test - pass camera index as argument"""
import cv2
import sys
import platform

if len(sys.argv) < 2:
    print("Usage: python quick_camera_test.py <camera_index>")
    print("Example: python quick_camera_test.py 0")
    sys.exit(1)

camera_index = int(sys.argv[1])

print(f"Testing camera index: {camera_index}")

# Use appropriate backend
if platform.system() == "Windows":
    cap = cv2.VideoCapture(camera_index, cv2.CAP_DSHOW)
elif platform.system() == "Darwin":
    cap = cv2.VideoCapture(camera_index, cv2.CAP_AVFOUNDATION)
else:
    cap = cv2.VideoCapture(camera_index)

if not cap.isOpened():
    print(f"ERROR: Cannot open camera {camera_index}")
    sys.exit(1)

print(f"SUCCESS: Camera {camera_index} opened!")
print("Press ESC to close")

while True:
    ret, frame = cap.read()
    if not ret:
        print("Cannot read frame")
        break

    # Add overlay
    cv2.putText(frame, f"CAMERA INDEX: {camera_index}", (20, 40),
               cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
    cv2.putText(frame, "Press ESC to close", (20, 80),
               cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

    cv2.imshow(f"Camera {camera_index} Test", frame)

    if cv2.waitKey(1) & 0xFF == 27:  # ESC
        break

cap.release()
cv2.destroyAllWindows()
