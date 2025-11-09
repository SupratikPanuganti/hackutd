#!/usr/bin/env python3
"""
Quick script to test available cameras and help identify which one is the front camera.
"""
import cv2
import platform

def test_camera(index):
    """Test if a camera is available at the given index."""
    print(f"\n{'='*50}")
    print(f"Testing Camera Index: {index}")
    print('='*50)

    try:
        # Use appropriate backend for platform
        if platform.system() == "Windows":
            cap = cv2.VideoCapture(index, cv2.CAP_DSHOW)
        elif platform.system() == "Darwin":  # macOS
            cap = cv2.VideoCapture(index, cv2.CAP_AVFOUNDATION)
        else:  # Linux
            cap = cv2.VideoCapture(index)

        if not cap.isOpened():
            print(f"❌ Camera {index} is NOT available")
            return False

        # Try to read a frame
        ret, frame = cap.read()
        if not ret or frame is None:
            print(f"❌ Camera {index} opened but cannot read frames")
            cap.release()
            return False

        # Get camera properties
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = int(cap.get(cv2.CAP_PROP_FPS))

        print(f"✅ Camera {index} is AVAILABLE")
        print(f"   Resolution: {width}x{height}")
        print(f"   FPS: {fps}")
        print(f"   Frame shape: {frame.shape}")

        # Show preview
        print("\n   Opening preview window...")
        print("   👀 CHECK: Is this your FRONT camera (facing you)?")
        print("   Press ANY KEY to continue to next camera...")
        print("   Press ESC to quit")

        window_name = f"Camera {index} - Is this your FRONT camera?"
        cv2.imshow(window_name, frame)

        # Show live preview
        while True:
            ret, frame = cap.read()
            if not ret:
                break

            # Add text overlay
            cv2.putText(frame, f"CAMERA INDEX: {index}", (20, 40),
                       cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            cv2.putText(frame, "Is this your FRONT camera?", (20, 80),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
            cv2.putText(frame, "Press any key for next camera", (20, 120),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200, 200, 200), 1)
            cv2.putText(frame, "Press ESC to quit", (20, 150),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200, 200, 200), 1)

            cv2.imshow(window_name, frame)

            key = cv2.waitKey(1) & 0xFF
            if key == 27:  # ESC
                cap.release()
                cv2.destroyAllWindows()
                print("\n\n⚠️  Testing stopped by user")
                return None
            elif key != 255:  # Any other key
                break

        cap.release()
        cv2.destroyAllWindows()
        return True

    except Exception as e:
        print(f"❌ Error testing camera {index}: {e}")
        return False

def main():
    import sys
    print("=" * 50)
    print("CAMERA INDEX FINDER")
    print("=" * 50)
    print("\nThis script will test camera indices 0-4")
    print("to help you find which one is your FRONT camera.\n")
    print("Starting camera tests...\n")
    sys.stdout.flush()

    available_cameras = []

    # Test cameras 0-4
    for i in range(5):
        result = test_camera(i)
        if result is None:  # User pressed ESC
            break
        if result:
            available_cameras.append(i)

    print("\n" + "=" * 50)
    print("SUMMARY")
    print("=" * 50)
    if available_cameras:
        print(f"\n✅ Available cameras found at indices: {available_cameras}")
        print("\n📝 Remember which camera index showed your FRONT camera")
        print("   and update your .env file:")
        print(f"\n   CAMERA_INDEX=<the_front_camera_index>")
    else:
        print("\n❌ No cameras found!")
        print("   Make sure your camera is connected and not being used by another app.")

    print("\n" + "=" * 50)
    sys.stdout.flush()

if __name__ == "__main__":
    main()
