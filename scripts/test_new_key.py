#!/usr/bin/env python3
"""Test the new NVIDIA API key directly"""
import requests
import json

NEW_KEY = "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"

print("Testing NEW NVIDIA API KEY...")
print(f"Key: {NEW_KEY[:20]}...{NEW_KEY[-10:]}")
print()

endpoint = "https://ai.api.nvidia.com/v1/vlm/nvidia/vila"

test_payload = {
    "model": "nvidia/vila",
    "messages": [{
        "role": "user",
        "content": "Hello"
    }],
    "max_tokens": 10
}

headers = {
    "Authorization": f"Bearer {NEW_KEY}",
    "Content-Type": "application/json",
    "Accept": "application/json",
}

try:
    response = requests.post(endpoint, headers=headers, json=test_payload, timeout=10)
    print(f"Status Code: {response.status_code}")

    if response.status_code == 200:
        print("[SUCCESS] The new API key works!")
        print(response.json())
    else:
        print(f"[FAILED] Status: {response.status_code}")
        print(f"Response: {response.text}")

except Exception as e:
    print(f"[ERROR] {e}")
