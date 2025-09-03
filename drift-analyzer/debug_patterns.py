#!/usr/bin/env python3
"""
Debug script to test pattern matching logic
"""

import os
import glob
from pathlib import Path

def debug_patterns():
    """Debug the pattern matching logic"""
    
    # Test paths
    test_paths = [
        "drift-rails\\app\\controllers\\graphql_controller.rb",
        "drift-rails\\app\\controllers\\health_controller.rb",
        "drift-rails\\app\\services\\scan_persister.rb",
        "drift-rails\\app\\models\\project.rb",
        "drift-rails\\app\\graphql\\types\\base_object.rb"
    ]
    
    # Test patterns
    test_patterns = [
        "**/controllers/**/*.rb",
        "drift-rails/app/controllers/**/*.rb",
        "**/services/**/*.rb",
        "**/models/**/*.rb",
        "**/graphql/**/*.rb"
    ]
    
    print("Testing pattern matching:")
    print("="*50)
    
    for path in test_paths:
        print(f"\nPath: {path}")
        normalized_path = path.replace('\\', '/')
        print(f"Normalized: {normalized_path}")
        
        for pattern in test_patterns:
            normalized_pattern = pattern.replace('\\', '/')
            matches = glob.fnmatch.fnmatch(normalized_path, normalized_pattern)
            print(f"  Pattern: {pattern} -> {matches}")
            
            # Also test with glob.fnmatch.translate to see the regex
            try:
                regex_pattern = glob.fnmatch.translate(normalized_pattern)
                print(f"    Regex: {regex_pattern}")
            except Exception as e:
                print(f"    Regex error: {e}")

if __name__ == "__main__":
    debug_patterns()
