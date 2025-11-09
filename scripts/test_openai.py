#!/usr/bin/env python3
"""Quick test to verify OpenAI Vision API works"""

import os
import base64
import requests

# Set API key
OPENAI_KEY = os.environ.get("OPENAI_KEY", "")

if not OPENAI_KEY:
    print("ERROR: OPENAI_KEY not set")
    exit(1)

print(f"✓ OpenAI API Key configured (length: {len(OPENAI_KEY)})")

# Create a simple test image (1x1 red pixel)
test_image = b'\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c\x1c $.\' ",#\x1c\x1c(7),01444\x1f\'9=82<.342\xff\xc0\x00\x0b\x08\x00\x01\x00\x01\x01\x01\x11\x00\xff\xc4\x00\x1f\x00\x00\x01\x05\x01\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0b\xff\xc4\x00\xb5\x10\x00\x02\x01\x03\x03\x02\x04\x03\x05\x05\x04\x04\x00\x00\x01}\x01\x02\x03\x00\x04\x11\x05\x12!1A\x06\x13Qa\x07"q\x142\x81\x91\xa1\x08#B\xb1\xc1\x15R\xd1\xf0$3br\x82\t\n\x16\x17\x18\x19\x1a%&\'()*456789:CDEFGHIJSTUVWXYZcdefghijstuvwxyz\x83\x84\x85\x86\x87\x88\x89\x8a\x92\x93\x94\x95\x96\x97\x98\x99\x9a\xa2\xa3\xa4\xa5\xa6\xa7\xa8\xa9\xaa\xb2\xb3\xb4\xb5\xb6\xb7\xb8\xb9\xba\xc2\xc3\xc4\xc5\xc6\xc7\xc8\xc9\xca\xd2\xd3\xd4\xd5\xd6\xd7\xd8\xd9\xda\xe1\xe2\xe3\xe4\xe5\xe6\xe7\xe8\xe9\xea\xf1\xf2\xf3\xf4\xf5\xf6\xf7\xf8\xf9\xfa\xff\xda\x00\x08\x01\x01\x00\x00?\x00\xfb\xfe\x8a(\xa0\x0f\xff\xd9'
image_b64 = base64.b64encode(test_image).decode('ascii')

print(f"✓ Test image encoded (size: {len(test_image)} bytes)")

# Test OpenAI Vision API
payload = {
    "model": "gpt-4o-mini",
    "messages": [{
        "role": "user",
        "content": [
            {"type": "text", "text": "Say 'test successful' if you can see this image"},
            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_b64}"}}
        ]
    }],
    "max_tokens": 10
}

headers = {
    "Authorization": f"Bearer {OPENAI_KEY}",
    "Content-Type": "application/json",
}

print("Testing OpenAI Vision API...")
try:
    response = requests.post(
        "https://api.openai.com/v1/chat/completions",
        headers=headers,
        json=payload,
        timeout=15
    )

    print(f"Status Code: {response.status_code}")

    if response.status_code == 200:
        data = response.json()
        content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
        print(f"✓ OpenAI Vision API works!")
        print(f"Response: {content}")
        exit(0)
    else:
        print(f"✗ API returned {response.status_code}")
        print(f"Response: {response.text[:200]}")
        exit(1)

except Exception as e:
    print(f"✗ Error: {e}")
    exit(1)
