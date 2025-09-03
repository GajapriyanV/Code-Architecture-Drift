#!/usr/bin/env python3
"""
Debug script to see what paths are being generated
"""

import os
import glob
from pathlib import Path

def debug_paths():
    """Debug the path generation and pattern matching"""
    
    # Get the project root (parent of drift-analyzer directory)
    project_root = Path(__file__).parent.parent.absolute()
    
    print(f"Project root: {project_root}")
    print("="*50)
    
    # Test Ruby file collection
    print("Ruby files found:")
    ruby_files = glob.glob(os.path.join(project_root, "**", "*.rb"), recursive=True)
    for p in ruby_files:
        rp = os.path.relpath(p, project_root)
        print(f"  Full path: {p}")
        print(f"  Relative path: {rp}")
        print(f"  Path type: {type(rp)}")
        print(f"  Path repr: {repr(rp)}")
        print()
    
    # Test pattern matching
    print("="*50)
    print("Testing pattern matching:")
    
    test_patterns = [
        "**/controllers/**/*.rb",
        "drift-rails\\app\\controllers\\**\\*.rb",
        "drift-rails/app/controllers/**/*.rb"
    ]
    
    for pattern in test_patterns:
        print(f"\nPattern: {pattern}")
        for p in ruby_files:
            rp = os.path.relpath(p, project_root)
            matches = glob.fnmatch.fnmatch(rp, pattern)
            print(f"  {rp} -> {matches}")

if __name__ == "__main__":
    debug_paths()
