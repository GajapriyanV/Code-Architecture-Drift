#!/usr/bin/env python3
"""
Test script for the FastAPI analyze endpoint
"""

import requests
import json

def test_analyze_endpoint():
    """Test the analyze endpoint with a simple request"""
    
    # Simple test rules
    rules = {
        "layers": [
            {"name": "controllers", "patterns": ["*/controllers/*.rb"]},
            {"name": "services", "patterns": ["*/services/*.rb"]},
            {"name": "models", "patterns": ["*/models/*.rb"]}
        ],
        "forbidden_dependencies": [],
        "must_route_via": [],
        "disallowed_apis": []
    }
    
    # Test request
    payload = {
        "rules": rules,
        "git": {
            "repo_url": "https://github.com/vercel/next.js",
            "ref": "canary"
        },
        "mode": "full"
    }
    
    try:
        print("Testing analyze endpoint...")
        print(f"Request payload: {json.dumps(payload, indent=2)}")
        
        response = requests.post(
            "http://localhost:8000/analyze",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Response status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Analysis successful!")
            print(f"Drift Score: {result.get('metrics', {}).get('drift_score', 'N/A')}")
            print(f"Total Nodes: {result.get('metrics', {}).get('counts', {}).get('nodes', 'N/A')}")
            print(f"Total Violations: {result.get('metrics', {}).get('counts', {}).get('violations', 'N/A')}")
        else:
            print(f"❌ Analysis failed: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to server. Is it running on port 8000?")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_analyze_endpoint()
