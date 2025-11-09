#!/usr/bin/env python3
"""Test NVIDIA VILA API to diagnose 403 errors"""
import requests
import os
import json

# Get API key from environment or use the one from .env
NIM_API_KEY = os.environ.get("NIM_API_KEY", "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")

# Test different NVIDIA endpoints
endpoints = [
    "https://ai.api.nvidia.com/v1/vlm/nvidia/vila",
    "https://integrate.api.nvidia.com/v1/vlm/nvidia/vila",
    "https://ai.api.nvidia.com/v1/chat/completions",
]

print("=" * 70)
print("NVIDIA API KEY TEST")
print("=" * 70)
print(f"API Key: {NIM_API_KEY[:20]}...{NIM_API_KEY[-10:]}")
print()

# Simple test payload (no image, just to check auth)
test_payload = {
    "model": "nvidia/vila",
    "messages": [{
        "role": "user",
        "content": "Hello"
    }],
    "max_tokens": 10
}

for endpoint in endpoints:
    print(f"\nTesting endpoint: {endpoint}")
    print("-" * 70)

    headers = {
        "Authorization": f"Bearer {NIM_API_KEY}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

    try:
        response = requests.post(endpoint, headers=headers, json=test_payload, timeout=10)
        print(f"Status Code: {response.status_code}")

        if response.status_code == 200:
            print("[SUCCESS] This endpoint works!")
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)[:200]}...")
        else:
            print(f"[FAILED] Status: {response.status_code}")
            print(f"Response: {response.text[:500]}")

    except Exception as e:
        print(f"[ERROR] {e}")

print("\n" + "=" * 70)
print("TESTING COMPLETE")
print("=" * 70)
print("\nIf all endpoints failed with 403:")
print("1. Your API key may be invalid or expired")
print("2. You may need to regenerate it at: https://build.nvidia.com")
print("3. Make sure you have access to the VILA model")
print("\nTo get a new API key:")
print("- Go to https://build.nvidia.com")
print("- Sign in")
print("- Navigate to the API Catalog")
print("- Find 'VILA' or vision models")
print("- Generate a new API key with proper permissions")
